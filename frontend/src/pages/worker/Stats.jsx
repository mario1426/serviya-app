import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const fmt = (n) => (n || 0).toLocaleString('es-AR', { minimumFractionDigits: 0 });

// Gráfico de barras SVG puro
function BarChart({ data }) {
  if (!data || data.length === 0) return null;
  const maxVal = Math.max(...data.map(d => d.total), 1);
  const barW = 100 / data.length;

  return (
    <div className="w-full">
      <svg viewBox="0 0 400 120" className="w-full" preserveAspectRatio="none">
        {data.map((d, i) => {
          const barH = (d.total / maxVal) * 80;
          const x = i * (400 / data.length) + 4;
          const w = (400 / data.length) - 8;
          return (
            <g key={i}>
              <rect
                x={x}
                y={80 - barH}
                width={w}
                height={barH}
                rx="3"
                fill={d.total > 0 ? '#1E3A8A' : '#E5E7EB'}
              />
              {d.total > 0 && (
                <text
                  x={x + w / 2}
                  y={75 - barH}
                  textAnchor="middle"
                  fontSize="8"
                  fill="#1E3A8A"
                  fontWeight="600"
                >
                  ${fmt(d.total)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <div className="flex justify-between mt-1">
        {data.map((d, i) => (
          <span key={i} className="text-gray-400" style={{ fontSize: '9px', width: `${barW}%`, textAlign: 'center' }}>
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function WorkerStats() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/requests/earnings')
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const monthName = new Date().toLocaleString('es-AR', { month: 'long' });

  return (
    <div className="min-h-screen bg-gray-light">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate('/worker/dashboard')} className="text-navy font-bold text-xl">←</button>
          <h1 className="text-lg font-bold text-navy">Mis estadísticas</h1>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Métricas clave */}
            <div className="grid grid-cols-2 gap-3">
              <div className="card text-center">
                <p className="text-3xl font-bold text-navy">{data?.avgRating?.toFixed(1) || '0.0'}</p>
                <p className="text-yellow-400 text-lg">{'★'.repeat(Math.round(data?.avgRating || 0))}{'☆'.repeat(5 - Math.round(data?.avgRating || 0))}</p>
                <p className="text-xs text-gray-medium">{data?.totalReviews || 0} reseñas</p>
              </div>
              <div className="card text-center">
                <p className="text-3xl font-bold text-navy">{data?.completionRate || 0}%</p>
                <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${data?.completionRate || 0}%` }}
                  />
                </div>
                <p className="text-xs text-gray-medium mt-1">Tasa de completado</p>
              </div>
              <div className="card text-center">
                <p className="text-3xl font-bold text-navy">{data?.completedCount || 0}</p>
                <p className="text-xs text-gray-medium mt-1">✅ Completados</p>
              </div>
              <div className="card text-center">
                <p className="text-3xl font-bold text-navy">{data?.cancelledCount || 0}</p>
                <p className="text-xs text-gray-medium mt-1">❌ Cancelados</p>
              </div>
            </div>

            {/* Ganancias del mes */}
            <div className="bg-navy rounded-2xl p-5 text-white">
              <p className="text-white/60 text-sm capitalize">{monthName} {new Date().getFullYear()}</p>
              <p className="text-4xl font-bold mt-1">${fmt(data?.thisMonthTotal)}</p>
              <p className="text-white/60 text-sm mt-1">{data?.thisMonthJobs || 0} trabajos este mes</p>
            </div>

            {/* Gráfico semanal */}
            <div className="card">
              <h2 className="font-bold text-navy mb-4">Ganancias por semana</h2>
              {data?.weeklyEarnings?.every(w => w.total === 0) ? (
                <div className="text-center py-6">
                  <p className="text-3xl mb-2">📊</p>
                  <p className="text-sm text-gray-medium">Sin datos aún. ¡Completá tus primeros trabajos!</p>
                </div>
              ) : (
                <BarChart data={data?.weeklyEarnings} />
              )}
            </div>

            {/* Categorías más solicitadas */}
            <div className="card">
              <h2 className="font-bold text-navy mb-4">Servicios más pedidos</h2>
              {!data?.topCategories?.length ? (
                <p className="text-sm text-gray-medium text-center py-4">Sin datos aún</p>
              ) : (
                <div className="space-y-3">
                  {data.topCategories.map((cat, i) => {
                    const maxCount = data.topCategories[0].count;
                    const pct = Math.round((cat.count / maxCount) * 100);
                    return (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{cat.icon}</span>
                            <span className="text-sm font-medium text-navy">{cat.name}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-bold text-navy">{cat.count} pedido{cat.count !== 1 ? 's' : ''}</span>
                            {cat.earnings > 0 && (
                              <span className="text-xs text-gray-medium ml-2">${fmt(cat.earnings)}</span>
                            )}
                          </div>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Comparativa mensual */}
            <div className="grid grid-cols-2 gap-3">
              <div className="card text-center">
                <p className="text-xs text-gray-medium mb-1">Mes anterior</p>
                <p className="text-xl font-bold text-navy">${fmt(data?.lastMonthTotal)}</p>
                <p className="text-xs text-gray-medium">{data?.lastMonthJobs || 0} trabajos</p>
              </div>
              <div className="card text-center">
                <p className="text-xs text-gray-medium mb-1">Total acumulado</p>
                <p className="text-xl font-bold text-navy">${fmt(data?.allTimeTotal)}</p>
                <p className="text-xs text-gray-medium">todos los meses</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 flex gap-3 items-start">
              <span className="text-lg flex-shrink-0">ℹ️</span>
              <p className="text-xs text-blue-800 leading-snug">
                Los montos ya descontaron la comisión de ServiYa (20%). Este es el dinero que te corresponde a vos.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
