import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Verifications() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    api.get('/admin/verifications').then(setWorkers).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handle = async (userId, action) => {
    try {
      await api.put(`/admin/verifications/${userId}/${action}`);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Verificaciones pendientes ({workers.length})</h1>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : workers.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center text-gray-500">No hay verificaciones pendientes</div>
      ) : (
        <div className="space-y-4">
          {workers.map(w => (
            <div key={w._id} className="bg-white rounded-2xl p-5 shadow-sm flex items-center gap-4">
              <img
                src={w.photo || `https://ui-avatars.com/api/?name=${w.name}`}
                alt=""
                className="w-12 h-12 rounded-full"
              />
              <div className="flex-1">
                <p className="font-semibold text-slate-800">{w.name}</p>
                <p className="text-sm text-gray-500">{w.email}</p>
                <p className="text-xs text-yellow-600 mt-0.5">⏳ En revisión</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handle(w._id, 'approve')}
                  className="bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-600 transition-colors"
                >
                  ✓ Aprobar
                </button>
                <button
                  onClick={() => handle(w._id, 'reject')}
                  className="bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-600 transition-colors"
                >
                  ✕ Rechazar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
