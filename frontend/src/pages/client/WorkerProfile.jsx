import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const StarRating = ({ rating, size = 'md' }) => {
  const s = size === 'lg' ? 'text-xl' : 'text-sm';
  return (
    <span className={`text-yellow-400 ${s}`}>
      {'★'.repeat(Math.round(rating || 0))}{'☆'.repeat(5 - Math.round(rating || 0))}
      <span className="text-gray-medium ml-1 text-sm">{(rating || 0).toFixed(1)}</span>
    </span>
  );
};

export default function WorkerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [worker, setWorker] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/users/workers/${id}`),
      api.get(`/reviews/worker/${id}`),
    ])
      .then(([w, r]) => { setWorker(w); setReviews(r); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>;
  }

  if (!worker) return <div className="p-6 text-center">Trabajador no encontrado</div>;

  const info = worker.workerInfo;

  return (
    <div className="min-h-screen bg-gray-light pb-24">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-navy font-bold text-xl">←</button>
          <h1 className="text-lg font-bold text-navy">Perfil del profesional</h1>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* Perfil */}
        <div className="card text-center">
          <img
            src={worker.photo || `https://ui-avatars.com/api/?name=${worker.name}&background=E53935&color=fff&size=128`}
            alt={worker.name}
            className="w-24 h-24 rounded-full object-cover mx-auto mb-3"
          />
          <div className="flex items-center justify-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-navy">{worker.name}</h2>
            {info?.verification?.status === 'verified' && (
              <span className="badge-verified">✓ Verificado</span>
            )}
          </div>
          <StarRating rating={info?.stats?.avgRating} size="lg" />
          <p className="text-gray-medium text-sm mt-1">
            {info?.stats?.totalReviews || 0} reseñas · {info?.stats?.completedJobs || 0} trabajos completados
            {info?.stats?.cancelledJobs > 0 && (
              <span className="text-orange-500 ml-1">· {info.stats.cancelledJobs} cancelaciones</span>
            )}
          </p>
          <p className="text-gray-dark mt-3 text-sm">{info?.bio || 'Sin descripción'}</p>
        </div>

        {/* Info */}
        <div className="card space-y-3">
          <h3 className="font-semibold text-navy">Servicios y precios</h3>

          {/* Categorías */}
          <div className="flex flex-wrap gap-2">
            {info?.services?.map(s => (
              <span key={s} className="bg-red-50 text-primary text-xs font-medium px-3 py-1 rounded-full capitalize">
                {s.replace(/-/g, ' ')}
              </span>
            ))}
          </div>

          {/* Servicios con precios personalizados */}
          {info?.customServices?.length > 0 && (
            <div className="border rounded-xl overflow-hidden mt-1">
              {info.customServices.map((cs, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between px-4 py-3 ${i < info.customServices.length - 1 ? 'border-b' : ''}`}
                >
                  <span className="text-sm text-gray-dark">{cs.name}</span>
                  <span className="text-sm font-bold text-primary">
                    {cs.price > 0 ? `$${cs.price.toLocaleString()}` : 'A consultar'}
                  </span>
                </div>
              ))}
            </div>
          )}

          {info?.zone && (
            <p className="text-sm text-gray-dark">📍 Zona: <span className="font-medium">{info.zone}</span></p>
          )}
        </div>

        {/* Portfolio */}
        {info?.portfolioPhotos?.length > 0 && (
          <div className="card">
            <h3 className="font-semibold text-navy mb-3">Trabajos realizados</h3>
            <div className="grid grid-cols-3 gap-2">
              {info.portfolioPhotos.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`Trabajo ${i + 1}`}
                  className="w-full aspect-square object-cover rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => window.open(url, '_blank')}
                />
              ))}
            </div>
          </div>
        )}

        {/* Reseñas */}
        <div className="card">
          <h3 className="font-semibold text-navy mb-3">Reseñas ({reviews.length})</h3>
          {reviews.length === 0 ? (
            <p className="text-gray-medium text-sm">Aún no tiene reseñas</p>
          ) : (
            <div className="space-y-3">
              {reviews.map(r => (
                <div key={r._id} className="border-b last:border-0 pb-3 last:pb-0">
                  <div className="flex items-center gap-2 mb-1">
                    <img
                      src={r.client?.photo || `https://ui-avatars.com/api/?name=${r.client?.name}&size=32`}
                      alt=""
                      className="w-7 h-7 rounded-full"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium">{r.client?.name}</span>
                        <StarRating rating={r.rating} />
                      </div>
                      <p className="text-xs text-gray-medium">
                        {new Date(r.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  {r.comment && <p className="text-sm text-gray-dark">{r.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CTA fijo */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 pt-3 pb-4 shadow-lg">
        <div className="max-w-lg mx-auto space-y-2">
          {/* Garantía de pago seguro */}
          <div className="bg-green-50 border border-green-100 rounded-xl px-3 py-2 flex gap-2 items-start">
            <span className="text-lg flex-shrink-0">🔒</span>
            <p className="text-xs text-green-800 leading-snug">
              <span className="font-semibold">Tu dinero está protegido.</span> El pago queda retenido por ServiYa y solo se libera al profesional una vez que confirmás que el trabajo fue realizado. Si el profesional no se presenta, te devolvemos el 100% de tu dinero.
            </p>
          </div>
          <button
            onClick={() => navigate(`/request/${worker._id}`)}
            className="btn-primary w-full"
          >
            Contratar a {worker.name.split(' ')[0]}
          </button>
        </div>
      </div>
    </div>
  );
}
