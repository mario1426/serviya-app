import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import NotificationBell from '../../components/NotificationBell';

const STATUS_COLOR = {
  pending: 'border-l-yellow-400',
  accepted: 'border-l-blue-400',
  in_progress: 'border-l-green-400',
};

export default function WorkerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [available, setAvailable] = useState(user?.workerInfo?.isAvailable || false);
  const [loading, setLoading] = useState(true);

  const fetchRequests = () => {
    api.get('/requests/incoming').then(setRequests).catch(console.error).finally(() => setLoading(false));
  };

  // Actualizar ubicación del trabajador cuando abre el dashboard
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          api.put('/users/location', { lat: coords.latitude, lng: coords.longitude }).catch(() => {});
        },
        () => {}
      );
    }
  }, []);

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleToggle = async () => {
    try {
      const { isAvailable } = await api.put('/users/availability');
      setAvailable(isAvailable);
    } catch (err) {
      alert(err.message);
    }
  };

  const info = user?.workerInfo;

  return (
    <div className="min-h-screen bg-gray-light">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1">
              <span className="text-xl font-bold text-primary">Servi</span>
              <span className="text-xl font-bold text-navy">Ya</span>
            </div>
            <p className="text-xs text-gray-medium">Panel del trabajador</p>
          </div>
          <div className="flex items-center gap-1">
            <NotificationBell />
            <button onClick={() => navigate('/worker/history')} className="p-2 text-gray-medium">📋</button>
            <button onClick={logout} className="p-2 text-gray-medium">🚪</button>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* Perfil + disponibilidad */}
        <div className="card flex items-center gap-3">
          <img
            src={user?.photo || `https://ui-avatars.com/api/?name=${user?.name}&background=1E3A8A&color=fff`}
            alt=""
            className="w-14 h-14 rounded-full"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-bold text-navy">{user?.name}</p>
              {info?.verification?.status === 'verified' && (
                <span className="badge-verified">✓</span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-xs font-medium ${available ? 'text-green-600' : 'text-gray-medium'}`}>
                {available ? '● Disponible' : '● No disponible'}
              </span>
            </div>
            <p className="text-xs text-gray-medium">
              ⭐ {info?.stats?.avgRating?.toFixed(1) || '0.0'} · {info?.stats?.completedJobs || 0} trabajos
            </p>
          </div>
          {/* Toggle disponibilidad */}
          <button
            onClick={handleToggle}
            className={`w-14 h-7 rounded-full transition-colors ${available ? 'bg-green-500' : 'bg-gray-300'}`}
          >
            <div className={`w-6 h-6 bg-white rounded-full shadow mx-0.5 transition-transform ${available ? 'translate-x-7' : ''}`} />
          </button>
        </div>

        {/* Acciones rápidas */}
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => navigate('/worker/profile/setup')}
            className="card text-center hover:shadow-md transition-shadow"
          >
            <p className="text-2xl mb-1">✏️</p>
            <p className="text-sm font-medium text-navy">Perfil</p>
          </button>
          <button
            onClick={() => navigate('/worker/earnings')}
            className="card text-center hover:shadow-md transition-shadow"
          >
            <p className="text-2xl mb-1">💰</p>
            <p className="text-sm font-medium text-navy">Ganancias</p>
          </button>
          <button
            onClick={() => navigate('/worker/verification')}
            className="card text-center hover:shadow-md transition-shadow"
          >
            <p className="text-2xl mb-1">🔐</p>
            <p className="text-sm font-medium text-navy">Verificación</p>
            {info?.verification?.status === 'pending' && (
              <span className="badge-pending text-xs mt-1">En revisión</span>
            )}
          </button>
        </div>

        {/* Solicitudes entrantes */}
        <div>
          <h2 className="font-bold text-navy mb-3">
            Solicitudes {requests.length > 0 && <span className="text-primary">({requests.length})</span>}
          </h2>

          {loading ? (
            <div className="flex justify-center py-6">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : requests.length === 0 ? (
            <div className="card text-center py-8">
              <p className="text-3xl mb-2">📭</p>
              <p className="font-medium text-navy">Sin solicitudes por ahora</p>
              <p className="text-sm text-gray-medium mt-1">
                {available ? 'Cuando lleguen aparecerán aquí' : 'Activá tu disponibilidad para recibir trabajos'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map(r => (
                <button
                  key={r._id}
                  onClick={() => navigate(`/worker/request/${r._id}`)}
                  className={`card w-full text-left border-l-4 hover:shadow-md transition-shadow ${STATUS_COLOR[r.status] || 'border-l-gray-300'}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-navy capitalize">
                          {r.category?.name || r.categorySlug}
                        </p>
                        {r.isUrgent && <span className="text-orange-500 text-xs font-bold">🔥 URGENTE</span>}
                      </div>
                      <p className="text-sm text-gray-medium">{r.client?.name}</p>
                      {r.description && (
                        <p className="text-xs text-gray-dark mt-1 line-clamp-1">{r.description}</p>
                      )}
                    </div>
                    <div className="text-right ml-2 flex-shrink-0">
                      {r.proposedPrice > 0 && (
                        <p className="text-sm font-bold text-primary">${r.proposedPrice.toLocaleString()}</p>
                      )}
                      <p className="text-xs text-gray-medium">
                        {r.pricingType === 'quote' ? 'Presupuesto' : 'Precio fijo'}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
