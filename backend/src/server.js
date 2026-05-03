require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const admin = require('./config/firebase');
const Message = require('./models/Message');

// ─── APP & SERVER ──────────────────────────────────────────────
const app = express();
const server = http.createServer(app);

// ─── SOCKET.IO ─────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: [process.env.CLIENT_URL, process.env.ADMIN_URL],
    methods: ['GET', 'POST'],
  },
});

// Autenticación Socket.io con Firebase token
io.use(async (socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('No autenticado'));
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    socket.userId = decoded.uid;
    next();
  } catch {
    next(new Error('Token inválido'));
  }
});

io.on('connection', (socket) => {
  // Unirse a la sala del request (chat)
  socket.on('join_room', (requestId) => {
    socket.join(requestId);
  });

  // Enviar mensaje
  socket.on('send_message', async ({ requestId, senderId, text }) => {
    try {
      const message = await Message.create({
        request: requestId,
        sender: senderId,
        text,
      });
      const populated = await message.populate('sender', 'name photo');
      io.to(requestId).emit('new_message', populated);
    } catch (err) {
      console.error('Socket error:', err.message);
    }
  });

  // Marcar mensajes como leídos
  socket.on('mark_read', async ({ requestId, userId }) => {
    await Message.updateMany(
      { request: requestId, sender: { $ne: userId }, readAt: null },
      { readAt: new Date() }
    );
    socket.to(requestId).emit('messages_read', { requestId });
  });

  socket.on('disconnect', () => {});
});

// ─── MIDDLEWARES ───────────────────────────────────────────────
app.use(cors({
  origin: [process.env.CLIENT_URL, process.env.ADMIN_URL],
  credentials: true,
}));
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));

// ─── RUTAS ─────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/requests', require('./routes/messages'));   // mensajes del chat
app.use('/api/admin', require('./routes/admin'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/tickets', require('./routes/tickets'));
app.use('/api/push',          require('./routes/push'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/support',       require('./routes/support'));

// Endpoint de salud
app.get('/health', (req, res) => res.json({ status: 'ok', env: process.env.NODE_ENV }));

// ─── ERROR HANDLER ─────────────────────────────────────────────
app.use(errorHandler);

// ─── INICIO ────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 ServiYa API corriendo en puerto ${PORT}`);
  });
});

module.exports = { app, io };
