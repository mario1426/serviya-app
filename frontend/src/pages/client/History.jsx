import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const STATUS_LABEL = {
  pending:     { label: 'Pendiente', color: 'text-yellow-600 bg-yellow-50' },
  accepted:    { label: 'Aceptado', color: 'text-blue-600 bg-blue-50' },
  in_progress: { label: 'En curso', color: 'text-green-600 bg-green-50' },
  completed:   { label: 'Completado', color: 'text-green-700 bg-green-50' },
  cancelled:   { label: 'Cancelado', color: 'text-red-600 bg-red-50' },
  rejected:    { label: 'Rechazado', color: 'text-red-600 bg-red-50' },
};

export default function ClientHistory() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/requests/my').then(setRequests).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-light">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate('/home')} className="text-navy font-bold text-xl">←</button>
          <h1 className="text-lg font-bold text-navy">Mis servicios</h1>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-3">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : requests.length === 0 ? (
          <div className="card text-center py-10">
            <p className="text-4xl mb-3">📋</p>
            <p className="font-semibold text-navy">Sin servicios aún</p>
            <button onClick={() => navigate('/home')} className="btn-primary mt-4">Buscar servicios</button>
          </div>
        ) : (
          requests.map(r => {
            const s = STATUS_LABEL[r.status] || STATUS_LABEL.pending;
            return (
              <div key={r._id} className="card hover:shadow-md transition-shadow">
                <button
                  onClick={() => navigate(`/service/${r._id}`)}
                  className="w-full text-left"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-navy capitalize">
                        {r.category?.name || r.categorySlug?.replace('-', ' ')}
                      </p>
                      <p className="text-sm text-gray-medium">
                        {r.worker ? `Con ${r.worker.name}` : 'Sin asignar'}
                      </p>
                      <p className="text-xs text-gray-medium mt-1">
                        {new Date(r.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${s.color}`}>{s.label}</span>
                      {r.finalPrice > 0 && (
                        <p className="text-sm font-semibold text-primary mt-1">${r.finalPrice.toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                </button>
                {/* Botones de acción en la parte inferior */}
                {(r.status === 'completed' || ['in_progress', 'accepted'].includes(r.status)) && (
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                    {/* Calificar — solo si completado y sin reseña */}
                    {r.status === 'completed' && !r.review ? (
                      <button
                        onClick={e => { e.stopPropagation(); navigate(`/rate/${r._id}`); }}
                        className="text-xs font-semibold text-yellow-600 hover:text-yellow-700 flex items-center gap-1 transition-colors"
                      >
                        ⭐ Calificar servicio
                      </button>
                    ) : r.status === 'completed' && r.review ? (
                      <span className="text-xs text-gray-medium flex items-center gap-1">
                        ✅ Ya calificado
                      </span>
                    ) : (
                      <span /> /* placeholder para mantener el justify-between */
                    )}

                    <button
                      onClick={e => { e.stopPropagation(); navigate(`/reclamo?requestId=${r._id}`); }}
                      className="text-xs font-medium text-gray-medium hover:text-primary flex items-center gap-1 transition-colors"
                    >
                      ⚠️ Tuve un problema
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
