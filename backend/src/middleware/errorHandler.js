const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';

  // Error de validación de Mongoose
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ message: 'Error de validación', errors });
  }

  // Duplicate key en MongoDB
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({ message: `El campo ${field} ya está registrado` });
  }

  res.status(statusCode).json({ message });
};

module.exports = errorHandler;
