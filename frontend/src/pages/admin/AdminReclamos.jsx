import { useState, useEffect } from 'react';
import AdminLayout from './Layout';
import api from '../../services/api';

const STATUS_LABEL = {
  open:      { label: 'Abierto',     color: 'bg-red-100 text-red-700' },
  in_review: { label: 'En revisión', color: 'bg-yellow-100 text-yellow-700' },
  resolved:  { label: 'Resuelto',    color: 'bg-green-100 text-green-700' },
  closed:    { label: 'Cerrado',     color: 'bg-gray-100 text-gray-600' },
};

const TYPE_LABEL = {
  service: '🔧 Incumplimiento de servicio',
  payment: '💳 Problema de pago / Reembolso',
  user:    '🚫 Profesional no se presentó',
  other:   '📝 Otro',
};

export default function AdminReclamos() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('open');
  const [expanded, setExpanded] = useState(null);
  const [response, setResponse] = useState('');
  const [resolving, setResolving] = useState(null);

  const fetchTickets = () => {
    setLoading(true);
    const params = statusFilter ? `?status=${statusFilter}` : '';
    api.get(`/admin/tickets${params}`)
      .then(setTickets)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTickets(); }, [statusFilter]);

  const handleResolve = async (ticketId, newStatus) => {
    if (!response.trim()) return alert('Escribí una respuesta para el cliente');
    setResolving(ticketId);
    try {
      await api.put(`/admin/tickets/${ticketId}/respond`, {
        response,
        status: newStatus,
      });
      setTickets(prev => prev.filter(t => t._id !== ticketId));
      setExpanded(null);
      setResponse('');
    } catch (err) {
      alert(err.message);
    } finally {
      setResolving(null);
    }
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-navy">
            Reclamos
            {tickets.length > 0 && statusFilter === 'open' && (
              <span className="ml-2 bg-red-500 text-white text-sm font-bold px-2.5 py-0.5 rounded-full">{tickets.length}</span>
            )}
          </h1>
          {/* Filtro por estado */}
          <div className="flex gap-2">
            {['open', 'in_review', 'resolved', 'closed'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`text-sm px-4 py-2 rounded-xl font-medium transition-colors ${
                  statusFilter === s ? 'bg-navy text-white' : 'bg-white text-gray-medium hover:bg-gray-100'
                }`}
              >
                {STATUS_LABEL[s].label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
            <p className="text-4xl mb-3">✅</p>
            <p className="font-semibold text-navy text-lg">Sin reclamos {STATUS_LABEL[statusFilter]?.label.toLowerCase()}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map(t => (
              <div key={t._id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {/* Cabecera */}
                <div
                  className="p-5 cursor-pointer hover:bg-gray-50/50 transition-colors"
                  onClick={() => setExpanded(expanded === t._id ? null : t._id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_LABEL[t.status]?.color}`}>
                          {STATUS_LABEL[t.status]?.label}
                        </span>
                        <span className="text-xs text-gray-medium">{TYPE_LABEL[t.type]}</span>
                      </div>
                      <p className="font-semibold text-navy">{t.subject}</p>
                      <p className="text-xs text-gray-medium mt-1">
                        {t.user?.name || 'Usuario'} · {new Date(t.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <span className="text-gray-medium text-lg">{expanded === t._id ? '▲' : '▼'}</span>
                  </div>
                </div>

                {/* Detalle expandido */}
                {expanded === t._id && (
                  <div className="border-t border-gray-100 p-5 space-y-4">
                    {/* Descripción del cliente */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs font-semibold text-gray-medium uppercase mb-2">Descripción del cliente</p>
                      <p className="text-sm text-gray-dark">{t.description}</p>
                    </div>

                    {/* Respuesta anterior si ya tiene */}
                    {t.adminResponse && (
                      <div className="bg-green-50 rounded-xl p-4">
                        <p className="text-xs font-semibold text-green-700 uppercase mb-2">Tu respuesta anterior</p>
                        <p className="text-sm text-green-800">{t.adminResponse}</p>
                      </div>
                    )}

                    {/* Formulario de respuesta */}
                    {t.status !== 'resolved' && t.status !== 'closed' && (
                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-navy block">Respuesta al cliente</label>
                        <textarea
                          value={response}
                          onChange={e => setResponse(e.target.value)}
                          rows={3}
                          className="input-field resize-none text-sm"
                          placeholder="Ej: Revisamos tu caso y procederemos al reembolso en los próximos 3 días hábiles..."
                        />
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleResolve(t._id, 'resolved')}
                            disabled={!!resolving}
                            className="btn-primary text-sm px-5 py-2.5 disabled:opacity-50"
                          >
                            {resolving === t._id ? 'Procesando...' : '✅ Resolver — Aprobar reembolso'}
                          </button>
                          <button
                            onClick={() => handleResolve(t._id, 'closed')}
                            disabled={!!resolving}
                            className="bg-gray-100 text-gray-dark font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
                          >
                            ❌ Cerrar — Rechazar reclamo
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
