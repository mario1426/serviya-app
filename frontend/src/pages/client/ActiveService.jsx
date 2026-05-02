import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const STATUS_LABELS = {
  pending:     { label: 'Buscando trabajador...', color: 'text-yellow-600', bg: 'bg-yellow-50' },
  accepted:    { label: 'Trabajador en camino', color: 'text-blue-600', bg: 'bg-blue-50' },
  in_progress: { label: 'En curso', color: 'text-green-600', bg: 'bg-green-50' },
  completed:   { label: 'Completado ✓', color: 'text-green-700', bg: 'bg-green-50' },
  cancelled:   { label: 'Cancelado', color: 'text-red-600', bg: 'bg-red-50' },
  rejected:    { label: 'Rechazado', color: 'text-red-600', bg: 'bg-red-50' },
};

export default function ActiveService() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchRequest = () => {
    api.get(`/requests/${requestId}`)
      .then(setRequest)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRequest();
    const interval = setInterval(fetchRequest, 10000); // polling cada 10s
    return () => clearInterval(interval);
  }, [requestId]);

  const handleCancel = async () => {
    if (!confirm('¿Cancelar el servicio?')) return;
    try {
      await api.put(`/requests/${requestId}/cancel`, { reason: 'Cancelado por el cliente' });
      fetchRequest();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!request) return <div className="p-6 text-center">Solicitud no encontrada</div>;

  const statusInfo = STATUS_LABELS[request.status] || STATUS_LABELS.pending;
  const isClient = request.client?._id === user?._id || request.client === user?._id;

  return (
    <div className="min-h-screen bg-gray-light">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate('/home')} className="text-navy font-bold text-xl">←</button>
          <h1 className="text-lg font-bold text-navy">Estado del servicio</h1>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* Estado */}
        <div className={`card text-center ${statusInfo.bg}`}>
          <div className="text-4xl mb-2">
            {request.status === 'pending' && '⏳'}
            {request.status === 'accepted' && '🚗'}
            {request.status === 'in_progress' && '🔧'}
            {request.status === 'completed' && '✅'}
            {(request.status === 'cancelled' || request.status === 'rejected') && '❌'}
          </div>
          <p className={`text-lg font-bold ${statusInfo.color}`}>{statusInfo.label}</p>
          {request.status === 'pending' && (
            <p className="text-sm text-gray-medium mt-1">Esperando que un profesional acepte tu solicitud</p>
          )}
        </div>

        {/* Detalles */}
        <div className="card space-y-3">
          <h3 className="font-semibold text-navy">Detalles del servicio</h3>
          <div className="flex justify-between text-sm">
            <span className="text-gray-medium">Categoría</span>
            <span className="font-medium capitalize">{request.categorySlug?.replace('-', ' ')}</span>
          </div>
          {request.proposedPrice > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-medium">Precio acordado</span>
              <span className="font-semibold text-primary">${request.finalPrice || request.proposedPrice}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-gray-medium">Pago</span>
            <span className="font-medium capitalize">{request.payment?.method === 'cash' ? '💵 Efectivo' : '💳 Mercado Pago'}</span>
          </div>
          {request.isUrgent && (
            <div className="bg-orange-50 text-orange-700 text-sm px-3 py-1 rounded-full text-center font-medium">
              🔥 Servicio urgente
            </div>
          )}
        </div>

        {/* Trabajador */}
        {request.worker && (
          <div className="card">
            <h3 className="font-semibold text-navy mb-3">Tu profesional</h3>
            <div className="flex items-center gap-3">
              <img
                src={request.worker.photo || `https://ui-avatars.com/api/?name=${request.worker.name}&background=E53935&color=fff`}
                alt=""
                className="w-12 h-12 rounded-full"
              />
              <div>
                <p className="font-medium">{request.worker.name}</p>
                <p className="text-sm text-gray-medium">{request.worker.phone}</p>
              </div>
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className="space-y-2">
          {request.worker && ['accepted', 'in_progress'].includes(request.status) && (
            <button
              onClick={() => navigate(`/chat/${requestId}`)}
              className="btn-navy w-full"
            >
              💬 Chatear con el profesional
            </button>
          )}

          {request.status === 'completed' && !request.review && isClient && (
            <button
              onClick={() => navigate(`/rate/${requestId}`)}
              className="btn-primary w-full"
            >
              ⭐ Calificar servicio
            </button>
          )}

          {request.status === 'completed' && request.payment?.method === 'mercadopago' && request.payment?.status !== 'paid' && (
            <button
              onClick={() => navigate(`/payment/${requestId}`)}
              className="btn-primary w-full"
            >
              💳 Pagar con Mercado Pago
            </button>
          )}

          {['pending', 'accepted'].includes(request.status) && isClient && (
            <button onClick={handleCancel} className="btn-secondary w-full">
              Cancelar solicitud
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
