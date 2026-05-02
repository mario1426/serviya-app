import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const fmt = (n) => (n || 0).toLocaleString('es-AR', { minimumFractionDigits: 0 });

export default function WorkerEarnings() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/requests/earnings')
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const monthName = new Date().toLocaleString('es-AR', { month: 'long' });
  const lastMonthName = new Date(new Date().setMonth(new Date().getMonth() - 1))
    .toLocaleString('es-AR', { month: 'long' });

  return (
    <div className="min-h-screen bg-gray-light">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate('/worker/dashboard')} className="text-navy font-bold text-xl">←</button>
          <h1 className="text-lg font-bold text-navy">Mis ganancias</h1>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Resumen del mes actual */}
            <div className="bg-navy rounded-2xl p-5 text-white">
              <p className="text-white/60 text-sm capitalize">{monthName} {new Date().getFullYear()}</p>
              <p className="text-4xl font-bold mt-1">${fmt(data?.thisMonthTotal)}</p>
              <p className="text-white/60 text-sm mt-1">{data?.thisMonthJobs || 0} trabajos completados</p>
            </div>

            {/* Comparación con mes anterior */}
            <div className="grid grid-cols-2 gap-3">
              <div className="card text-center">
                <p className="text-xs text-gray-medium capitalize mb-1">{lastMonthName}</p>
                <p className="text-xl font-bold text-navy">${fmt(data?.lastMonthTotal)}</p>
                <p className="text-xs text-gray-medium">{data?.lastMonthJobs || 0} trabajos</p>
              </div>
              <div className="card text-center">
                <p className="text-xs text-gray-medium mb-1">Total acumulado</p>
                <p className="text-xl font-bold text-navy">${fmt(data?.allTimeTotal)}</p>
                <p className="text-xs text-gray-medium">todos los meses</p>
              </div>
            </div>

            {/* Nota sobre comisión */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 flex gap-3 items-start">
              <span className="text-lg flex-shrink-0">ℹ️</span>
              <p className="text-xs text-blue-800 leading-snug">
                Los montos mostrados ya descontaron la comisión de ServiYa (20%). Este es el dinero que te corresponde a vos.
              </p>
            </div>

            {/* Historial de trabajos */}
            <div>
              <h2 className="font-bold text-navy mb-3">Historial de cobros</h2>
              {data?.recentJobs?.length === 0 ? (
                <div className="card text-center py-10">
                  <p className="text-3xl mb-2">💸</p>
                  <p className="font-medium text-navy">Sin trabajos completados aún</p>
                  <p className="text-sm text-gray-medium mt-1">Cuando completes un servicio aparecerá aquí</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {data.recentJobs.map(r => (
                    <div key={r._id} className="card flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{r.category?.icon || '🔧'}</span>
                        <div>
                          <p className="font-medium text-navy text-sm">{r.category?.name || r.categorySlug}</p>
                          <p className="text-xs text-gray-medium">
                            {new Date(r.completedAt).toLocaleDateString('es-AR', {
                              day: '2-digit', month: 'short', year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-navy">${fmt(r.payment?.workerAmount)}</p>
                        <p className="text-xs text-gray-medium">Precio: ${fmt(r.finalPrice)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
