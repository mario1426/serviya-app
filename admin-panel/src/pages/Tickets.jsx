import { useState, useEffect } from 'react';
import api from '../services/api';

const STATUS_COLOR = {
  open: 'bg-red-100 text-red-700',
  in_review: 'bg-yellow-100 text-yellow-700',
  resolved: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-600',
};

export default function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [status, setStatus] = useState('open');
  const [selected, setSelected] = useState(null);
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchTickets = () => {
    setLoading(true);
    api.get(`/admin/tickets?status=${status}`).then(setTickets).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchTickets(); }, [status]);

  const respond = async () => {
    if (!response.trim()) return;
    try {
      await api.put(`/admin/tickets/${selected._id}/respond`, { response, status: 'resolved' });
      setSelected(null);
      setResponse('');
      fetchTickets();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Tickets de soporte</h1>

      <div className="flex gap-2 mb-5">
        {['open', 'in_review', 'resolved', 'closed'].map(s => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors capitalize ${
              status === s ? 'bg-red-500 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            {s === 'open' ? 'Abiertos' : s === 'in_review' ? 'En revisión' : s === 'resolved' ? 'Resueltos' : 'Cerrados'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Lista */}
        <div className="space-y-3">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-gray-500">Sin tickets</div>
          ) : (
            tickets.map(t => (
              <button
                key={t._id}
                onClick={() => { setSelected(t); setResponse(''); }}
                className={`bg-white rounded-2xl p-4 shadow-sm w-full text-left hover:shadow-md transition-shadow ${selected?._id === t._id ? 'ring-2 ring-red-400' : ''}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <p className="font-semibold text-sm">{t.subject}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLOR[t.status]}`}>{t.status}</span>
                </div>
                <p className="text-xs text-gray-500">{t.user?.name} · {t.type}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(t.createdAt).toLocaleDateString('es-AR')}
                </p>
              </button>
            ))
          )}
        </div>

        {/* Detalle */}
        {selected && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="font-semibold text-lg mb-1">{selected.subject}</h3>
            <p className="text-sm text-gray-500 mb-3">Por: {selected.user?.name} ({selected.user?.email})</p>
            <p className="text-sm bg-slate-50 rounded-xl p-3 mb-4">{selected.description}</p>

            {selected.adminResponse ? (
              <div className="bg-green-50 rounded-xl p-3">
                <p className="text-xs text-green-600 font-medium mb-1">Respuesta enviada:</p>
                <p className="text-sm">{selected.adminResponse}</p>
              </div>
            ) : (
              <>
                <textarea
                  value={response}
                  onChange={e => setResponse(e.target.value)}
                  placeholder="Escribí tu respuesta..."
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm resize-none mb-3 focus:outline-none focus:ring-2 focus:ring-red-400"
                  rows={4}
                />
                <button onClick={respond} className="bg-red-500 text-white px-5 py-2.5 rounded-xl text-sm hover:bg-red-600 transition-colors w-full">
                  Enviar respuesta y resolver
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
