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
  const [payLoading, setPayLoading] = useState(false);

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

  const handlePay = async () => {
    setPayLoading(true);
    try {
      const { initPoint } = await api.post('/payments/create-preference', { requestId });
      window.location.href = initPoint;
    } catch (err) {
      alert('Error al iniciar el pago: ' + err.message);
      setPayLoading(false);
    }
  };

  if (fetching) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const worker = request?.worker;
  const price = request?.finalPrice || request?.proposedPrice || 0;
  const alreadyPaid = request?.payment?.status === 'paid';

  // Pantalla post-calificación: pago
  if (done) return (
    <div className="min-h-screen bg-gray-light flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm p-8 text-center">
        <div className="text-6xl mb-4">⭐</div>
        <h2 className="text-xl font-bold text-navy mb-2">¡Gracias por tu reseña!</h2>
        <p className="text-gray-medium text-sm mb-6">
          Tu calificación ayuda a otros clientes a elegir mejor.
        </p>

        {/* Bloque de pago */}
        {!alreadyPaid && price > 0 && (
          <div className="bg-gray-50 rounded-2xl p-4 mb-5 border border-gray-100">
            <p className="text-sm font-medium text-navy mb-1">Pago pendiente</p>
            <p className="text-3xl font-bold text-navy mb-1">
              ${price.toLocaleString('es-AR')}
            </p>
            <p className="text-xs text-gray-medium mb-4">
              Por el servicio de {request?.category?.name || worker?.name}
            </p>
            <button
              onClick={handlePay}
              disabled={payLoading}
              className="w-full bg-[#009EE3] text-white font-bold py-3 px-6 rounded-xl hover:bg-[#0088cc] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {payLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>💳 Pagar con Mercado Pago</>
              )}
            </button>
          </div>
        )}

        {alreadyPaid && (
          <div className="bg-green-50 border border-green-100 rounded-2xl p-4 mb-5">
            <p className="text-green-700 font-medium text-sm">✅ Pago ya acreditado</p>
          </div>
        )}

        <button onClick={() => navigate('/home')} className="btn-primary w-full">
          Volver al inicio
        </button>
        <button onClick={() => navigate('/history')} className="w-full text-gray-medium text-sm mt-3 hover:underline">
          Ver mis servicios
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-light flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm p-8 text-center">

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
          {loading ? 'Enviando...' : '⭐ Enviar calificación y pagar'}
        </button>

        <button onClick={() => navigate('/home')} className="w-full text-gray-medium text-sm mt-3 hover:underline">
          Saltar por ahora
        </button>
      </div>
    </div>
  );
}
