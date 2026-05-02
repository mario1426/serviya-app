import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const LABELS = ['', 'Muy malo 😞', 'Malo 😕', 'Regular 😐', 'Muy bueno 😊', '¡Excelente! 🤩'];

export default function RateService() {
  const { requestId } = useParams();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    api.get(`/requests/${requestId}`)
      .then(setRequest)
      .catch(console.error)
      .finally(() => setFetching(false));
  }, [requestId]);

  const handleSubmit = async () => {
    if (rating === 0) return setError('Seleccioná una calificación');
    setLoading(true);
    setError('');
    try {
      await api.post('/reviews', { requestId, rating, comment });
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  // Pantalla de éxito
  if (done) return (
    <div className="min-h-screen bg-gray-light flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm p-8 text-center">
        <div className="text-6xl mb-4">⭐</div>
        <h2 className="text-xl font-bold text-navy mb-2">¡Gracias por tu reseña!</h2>
        <p className="text-gray-medium text-sm mb-6">
          Tu calificación ayuda a otros clientes a elegir mejor.
        </p>
        <button onClick={() => navigate('/home')} className="btn-primary w-full">
          Volver al inicio
        </button>
        <button onClick={() => navigate('/history')} className="w-full text-gray-medium text-sm mt-3 hover:underline">
          Ver mis servicios
        </button>
      </div>
    </div>
  );

  const worker = request?.worker;

  return (
    <div className="min-h-screen bg-gray-light flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm p-8 text-center">

        {/* Info del trabajador */}
        {worker ? (
          <div className="mb-5">
            <img
              src={worker.photo || `https://ui-avatars.com/api/?name=${worker.name}&background=E53935&color=fff&size=96`}
              alt={worker.name}
              className="w-20 h-20 rounded-full object-cover mx-auto mb-3"
            />
            <h2 className="text-lg font-bold text-navy">{worker.name}</h2>
            <p className="text-sm text-gray-medium capitalize">
              {request?.category?.name || request?.categorySlug?.replace('-', ' ')}
            </p>
          </div>
        ) : (
          <div className="text-5xl mb-4">🎉</div>
        )}

        <p className="text-gray-medium text-sm mb-5">¿Cómo fue tu experiencia?</p>

        {/* Estrellas */}
        <div className="flex justify-center gap-1 mb-2">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setRating(star)}
              className={`text-4xl transition-transform hover:scale-110 ${
                star <= (hovered || rating) ? 'text-yellow-400' : 'text-gray-200'
              }`}
            >
              ★
            </button>
          ))}
        </div>

        <p className="text-sm font-medium text-gray-medium mb-5 h-5">
          {LABELS[hovered || rating]}
        </p>

        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Contá tu experiencia (opcional)"
          className="input-field resize-none mb-4 text-sm"
          rows={3}
        />

        {error && <p className="text-primary text-sm mb-3">{error}</p>}

        <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full">
          {loading ? 'Enviando...' : '⭐ Enviar calificación'}
        </button>

        <button onClick={() => navigate('/home')} className="w-full text-gray-medium text-sm mt-3 hover:underline">
          Saltar por ahora
        </button>
      </div>
    </div>
  );
}
