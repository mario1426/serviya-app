import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function WorkerHistory() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/requests/incoming').then(data => {
      setRequests(data.filter(r => ['completed', 'cancelled', 'rejected'].includes(r.status)));
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-light">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate('/worker/dashboard')} className="text-navy font-bold text-xl">←</button>
          <h1 className="text-lg font-bold text-navy">Historial de trabajos</h1>
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
            <p className="font-semibold text-navy">Sin trabajos aún</p>
          </div>
        ) : (
          requests.map(r => (
            <button
              key={r._id}
              onClick={() => navigate(`/worker/request/${r._id}`)}
              className="card w-full text-left hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between">
                <div>
                  <p className="font-semibold text-navy capitalize">{r.category?.name || r.categorySlug}</p>
                  <p className="text-sm text-gray-medium">{r.client?.name}</p>
                  <p className="text-xs text-gray-medium mt-0.5">
                    {new Date(r.createdAt).toLocaleDateString('es-AR')}
                  </p>
                </div>
                <div className="text-right">
                  {r.finalPrice > 0 && <p className="font-bold text-primary">${r.finalPrice.toLocaleString()}</p>}
                  {r.payment?.workerAmount > 0 && (
                    <p className="text-xs text-gray-medium">Tu parte: ${r.payment.workerAmount.toLocaleString()}</p>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
