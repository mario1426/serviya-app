import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import useGeolocation from '../../hooks/useGeolocation';
import api from '../../services/api';
import NotificationBell from '../../components/NotificationBell';

export default function ClientHome() {
  const { user, logout, switchRole } = useAuth();
  const navigate = useNavigate();
  const { coords, loading: geoLoading } = useGeolocation();
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [switching, setSwitching] = useState(false);

  const handleSwitchRole = async () => {
    setSwitching(true);
    try {
      await switchRole();
      navigate('/worker/dashboard');
    } catch (err) {
      alert(err.message);
      setSwitching(false);
    }
  };

  useEffect(() => {
    api.get('/categories').then(setCategories).catch(console.error);
  }, []);

  // Actualizar ubicación del usuario cuando se obtiene
  useEffect(() => {
    if (coords) {
      api.put('/users/location', { lat: coords.lat, lng: coords.lng }).catch(() => {});
    }
  }, [coords]);

  const filtered = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-light">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1">
              <span className="text-xl font-bold text-primary">Servi</span>
              <span className="text-xl font-bold text-navy">Ya</span>
            </div>
            <p className="text-xs text-gray-medium">
              {geoLoading ? 'Detectando ubicación...' : coords ? '📍 Ubicación detectada' : '📍 Activá tu GPS'}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <NotificationBell />
            <button
              onClick={handleSwitchRole}
              disabled={switching}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors disabled:opacity-50"
            >
              {switching ? '...' : '🔧 Modo trabajo'}
            </button>
            <button onClick={() => navigate('/history')} className="p-2 text-gray-medium hover:text-navy">
              📋
            </button>
            <button onClick={logout} className="p-2 text-gray-medium hover:text-navy">
              🚪
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Saludo */}
        <div>
          <h1 className="text-2xl font-bold text-navy">
            Hola, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-medium">¿Qué servicio necesitás hoy?</p>
        </div>

        {/* Búsqueda */}
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-medium">🔍</span>
          <input
            type="text"
            placeholder="Buscá un servicio..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>

        {/* Categorías */}
        <div>
          <h2 className="font-semibold text-navy mb-3">Servicios disponibles</h2>
          {filtered.length === 0 ? (
            <p className="text-gray-medium text-center py-8">No se encontraron servicios</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filtered.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => navigate(`/workers?category=${cat.slug}`)}
                  className="card flex items-center gap-3 hover:shadow-md hover:border hover:border-primary/20 transition-all text-left"
                >
                  <span className="text-2xl">{cat.icon}</span>
                  <div>
                    <p className="font-medium text-navy text-sm">{cat.name}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Acceso rápido */}
        <div className="card">
          <h3 className="font-semibold text-navy mb-3">Mis servicios recientes</h3>
          <button
            onClick={() => navigate('/history')}
            className="w-full text-center text-primary text-sm font-medium hover:underline"
          >
            Ver historial completo →
          </button>
        </div>
      </div>
    </div>
  );
}
