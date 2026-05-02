import { useState, useEffect } from 'react';
import api from '../services/api';

const StatCard = ({ label, value, icon, color }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm">
    <div className="flex items-center justify-between mb-2">
      <p className="text-sm text-gray-500">{label}</p>
      <span className="text-2xl">{icon}</span>
    </div>
    <p className={`text-3xl font-bold ${color}`}>{value}</p>
  </div>
);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then(setStats).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 flex justify-center">
    <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
  </div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total usuarios" value={stats?.totalUsers || 0} icon="👥" color="text-slate-800" />
        <StatCard label="Trabajadores" value={stats?.totalWorkers || 0} icon="🛠️" color="text-blue-600" />
        <StatCard label="Clientes" value={stats?.totalClients || 0} icon="👤" color="text-green-600" />
        <StatCard label="Solicitudes totales" value={stats?.totalRequests || 0} icon="📋" color="text-slate-800" />
        <StatCard label="Completados" value={stats?.completedRequests || 0} icon="✅" color="text-green-600" />
        <StatCard label="Tickets abiertos" value={stats?.openTickets || 0} icon="🎫" color="text-orange-600" />
        <StatCard label="Verif. pendientes" value={stats?.pendingVerifications || 0} icon="⏳" color="text-yellow-600" />
        <StatCard label="Ingresos totales" value={`$${(stats?.totalRevenue || 0).toLocaleString()}`} icon="💰" color="text-primary text-red-600" />
      </div>
    </div>
  );
}
