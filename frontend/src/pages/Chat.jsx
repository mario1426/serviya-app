import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { auth } from '../firebase';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

let socket = null;

export default function Chat() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [connected, setConnected] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      const token = await auth.currentUser?.getIdToken();

      socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000', {
        auth: { token },
      });

      socket.on('connect', () => {
        setConnected(true);
        socket.emit('join_room', requestId);
        socket.emit('mark_read', { requestId, userId: user._id });
      });

      socket.on('new_message', (msg) => {
        setMessages(prev => [...prev, msg]);
      });

      socket.on('disconnect', () => setConnected(false));

      // Cargar historial
      try {
        const { Message } = await import('../services/api');
        // Cargamos mensajes del request vía backend
        const res = await fetch(
          `${import.meta.env.VITE_API_URL || '/api'}/requests/${requestId}/messages`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
        }
      } catch {}
    };

    init();

    return () => {
      socket?.disconnect();
    };
  }, [requestId, user._id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!text.trim() || !connected) return;
    socket.emit('send_message', {
      requestId,
      senderId: user._id,
      text: text.trim(),
    });
    setText('');
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gray-light flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-navy font-bold text-xl">←</button>
          <div>
            <h1 className="text-lg font-bold text-navy">Chat del servicio</h1>
            <p className={`text-xs ${connected ? 'text-green-500' : 'text-gray-medium'}`}>
              {connected ? '● Conectado' : '○ Reconectando...'}
            </p>
          </div>
        </div>
      </header>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto max-w-lg mx-auto w-full px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-gray-medium text-sm py-10">
            <p className="text-3xl mb-2">💬</p>
            <p>Iniciá la conversación</p>
          </div>
        )}
        {messages.map((msg, i) => {
          const isMe = msg.sender?._id === user._id || msg.sender === user._id;
          return (
            <div key={msg._id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              {!isMe && (
                <img
                  src={msg.sender?.photo || `https://ui-avatars.com/api/?name=${msg.sender?.name}&size=32`}
                  alt=""
                  className="w-7 h-7 rounded-full mr-2 self-end"
                />
              )}
              <div
                className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm ${
                  isMe
                    ? 'bg-primary text-white rounded-br-sm'
                    : 'bg-white text-gray-dark shadow-sm rounded-bl-sm'
                }`}
              >
                <p>{msg.text}</p>
                <p className={`text-xs mt-1 ${isMe ? 'text-red-200' : 'text-gray-medium'}`}>
                  {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) : ''}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t px-4 py-3 max-w-lg mx-auto w-full">
        <div className="flex items-end gap-2">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Escribí un mensaje..."
            className="input-field resize-none flex-1 py-2.5 max-h-24"
            rows={1}
          />
          <button
            onClick={sendMessage}
            disabled={!text.trim() || !connected}
            className="bg-primary text-white w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-40 hover:bg-primary-dark transition-colors"
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}
