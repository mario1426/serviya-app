import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useGeolocation from '../../hooks/useGeolocation';
import api from '../../services/api';

const StarRating = ({ rating }) => (
  <span className="text-yellow-400 text-sm">
    {'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}
    <span className="text-gray-medium ml-1">{rating?.toFixed(1) || '0.0'}</span>
  </span>
);

export default function WorkersList() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const category = params.get('category');
  const { coords, loading: geoLoading } = useGeolocation();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const fetchWorkers = useCallback(() => {
    if (search) {
      // Búsqueda por nombre — no necesita coords
      setLoading(true);
      const qs = new URLSearchParams({ search });
      if (category) qs.set('category', category);
      api.get(`/users/workers?${qs}`)
        .then(setWorkers)
        .catch(console.error)
        .finally(() => setLoading(false));
    } else if (coords) {
      // Búsqueda por ubicación
      setLoading(true);
      const qs = new URLSearchParams({ lat: coords.lat, lng: coords.lng });
      if (category) qs.set('category', category);
      api.get(`/users/workers?${qs}`)
        .then(setWorkers)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [coords, category, search]);

  useEffect(() => { fetchWorkers(); }, [fetchWorkers]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  const handleClearSearch = () => {
    setSearch('');
    setSearchInput('');
  };

  const isLoading = geoLoading || loading;

  return (
    <div className="min-h-screen bg-gray-light">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-navy font-bold text-xl">←</button>
          <h1 className="text-lg font-bold text-navy capitalize">
            {category?.replace('-', ' ') || 'Trabajadores'}
          </h1>
        </div>
        {/* Barra de búsqueda */}
        <div className="max-w-lg mx-auto px-4 pb-3">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Buscar por nombre..."
              className="input-field flex-1 text-sm"
            />
            {search ? (
              <button
                type="button"
                onClick={handleClearSearch}
                className="px-3 py-2 rounded-xl bg-gray-100 text-gray-medium text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                ✕ Limpiar
              </button>
            ) : (
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-navy transition-colors"
              >
                Buscar
              </button>
            )}
          </form>
          {search && (
            <p className="text-xs text-gray-medium mt-1.5">
              Resultados para "<span className="font-medium text-navy">{search}</span>"
            </p>
          )}
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : workers.length === 0 ? (
          <div className="card text-center py-10">
            <p className="text-4xl mb-3">{search ? '🔍' : '😔'}</p>
            <p className="font-semibold text-navy mb-2">
              {search ? `Sin resultados para "${search}"` : 'Todavía no hay trabajadores en tu zona'}
            </p>
            <p className="text-gray-medium text-sm mb-6">
              {search ? 'Probá con otro nombre o limpiá la búsqueda' : 'Pero podés ser el primero en ofrecer este servicio'}
            </p>
            {!search && (
              <button onClick={() => navigate('/login')} className="btn-navy">
                Quiero ofrecer servicios aquí
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-medium">
              {workers.length} profesional(es) {search ? 'encontrado(s)' : 'cerca tuyo'}
            </p>
            {workers.map((worker) => (
              <button
                key={worker._id}
                onClick={() => navigate(`/workers/${worker._id}`)}
                className="card w-full text-left hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={worker.photo || `https://ui-avatars.com/api/?name=${worker.name}&background=E53935&color=fff`}
                    alt={worker.name}
                    className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-navy truncate">{worker.name}</p>
                      {worker.workerInfo?.verification?.status === 'verified' && (
                        <span className="badge-verified">✓ Verificado</span>
                      )}
                    </div>
                    <StarRating rating={worker.workerInfo?.stats?.avgRating} />
                    <p className="text-xs text-gray-medium mt-0.5 truncate">{worker.workerInfo?.bio || 'Profesional disponible'}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-medium text-primary">
                      ${worker.workerInfo?.priceMin?.toLocaleString()} - ${worker.workerInfo?.priceMax?.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-medium">{worker.workerInfo?.stats?.completedJobs || 0} trabajos</p>
                    <div className="mt-1 w-2 h-2 bg-green-500 rounded-full ml-auto" title="Disponible" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
