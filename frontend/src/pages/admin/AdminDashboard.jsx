import { useState, useEffect } from 'react';
import AdminLayout from './Layout';
import api from '../../services/api';

const StatCard = ({ icon, label, value, sub, color = 'text-navy' }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-medium font-medium">{label}</p>
        <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
        {sub && <p className="text-xs text-gray-medium mt-1">{sub}</p>}
      </div>
      <span className="text-3xl">{icon}</span>
    </div>
  </div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats')
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout>
      <div className="p-8">
        <h1 className="text-2xl font-bold text-navy mb-6">Dashboard</h1>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !stats ? (
          <p className="text-gray-medium">Error al cargar estadísticas.</p>
        ) : (
          <div className="space-y-6">
            {/* Stats grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon="👥" label="Total usuarios" value={stats.totalUsers} />
              <StatCard icon="🔧" label="Trabajadores" value={stats.totalWorkers} color="text-blue-600" />
              <StatCard icon="📱" label="Clientes" value={stats.totalClients} color="text-green-600" />
              <StatCard
                icon="💰"
                label="Ingresos totales"
                value={`$${(stats.totalRevenue || 0).toLocaleString()}`}
                color="text-primary"
              />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <StatCard icon="📋" label="Solicitudes totales" value={stats.totalRequests} />
              <StatCard
                icon="✅"
                label="Trabajos completados"
                value={stats.completedRequests}
                sub={`${stats.totalRequests > 0 ? Math.round((stats.completedRequests / stats.totalRequests) * 100) : 0}% del total`}
                color="text-green-600"
              />
              <StatCard
                icon="🔐"
                label="Verificaciones pendientes"
                value={stats.pendingVerifications}
                color={stats.pendingVerifications > 0 ? 'text-orange-500' : 'text-navy'}
              />
            </div>

            {/* Accesos rápidos */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h2 className="font-semibold text-navy mb-4">Accesos rápidos</h2>
              <div className="grid grid-cols-3 gap-3">
                <a href="/admin/verifications" className="flex flex-col items-center p-4 rounded-xl bg-orange-50 hover:bg-orange-100 transition-colors text-center">
                  <span className="text-2xl mb-1">🔐</span>
                  <p className="text-sm font-medium text-navy">Verificaciones</p>
                  {stats.pendingVerifications > 0 && (
                    <span className="mt-1 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {stats.pendingVerifications}
                    </span>
                  )}
                </a>
                <a href="/admin/users" className="flex flex-col items-center p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors text-center">
                  <span className="text-2xl mb-1">👥</span>
                  <p className="text-sm font-medium text-navy">Gestionar usuarios</p>
                </a>
                <a href="/admin/categories" className="flex flex-col items-center p-4 rounded-xl bg-green-50 hover:bg-green-100 transition-colors text-center">
                  <span className="text-2xl mb-1">🗂️</span>
                  <p className="text-sm font-medium text-navy">Categorías</p>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
