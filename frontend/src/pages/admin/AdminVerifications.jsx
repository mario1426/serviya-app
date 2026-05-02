import { useState, useEffect } from 'react';
import AdminLayout from './Layout';
import api from '../../services/api';

export default function AdminVerifications() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null);

  const fetchVerifications = () => {
    setLoading(true);
    api.get('/admin/verifications')
      .then(setWorkers)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchVerifications(); }, []);

  const handleAction = async (userId, action) => {
    setActing(userId + action);
    try {
      await api.put(`/admin/verifications/${userId}/${action}`);
      setWorkers(prev => prev.filter(w => w._id !== userId));
    } catch (err) {
      alert(err.message);
    } finally {
      setActing(null);
    }
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <h1 className="text-2xl font-bold text-navy mb-6">
          Verificaciones pendientes
          {workers.length > 0 && (
            <span className="ml-2 bg-orange-500 text-white text-sm font-bold px-2.5 py-0.5 rounded-full">
              {workers.length}
            </span>
          )}
        </h1>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : workers.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
            <p className="text-4xl mb-3">✅</p>
            <p className="font-semibold text-navy text-lg">Sin verificaciones pendientes</p>
            <p className="text-gray-medium text-sm mt-1">Todas las solicitudes han sido revisadas.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {workers.map(worker => (
              <div key={worker._id} className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-start gap-4">
                  <img
                    src={worker.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(worker.name)}&background=1E3A8A&color=fff&size=48`}
                    alt=""
                    className="w-12 h-12 rounded-full flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <p className="font-bold text-navy">{worker.name}</p>
                        <p className="text-sm text-gray-medium">{worker.email}</p>
                      </div>
                      <p className="text-xs text-gray-medium">
                        Solicitado: {new Date(worker.workerInfo?.verification?.submittedAt || worker.createdAt).toLocaleDateString('es-AR')}
                      </p>
                    </div>

                    {/* Documentos */}
                    <div className="mt-4 flex gap-3 flex-wrap">
                      {worker.workerInfo?.verification?.dniUrl && (
                        <a
                          href={worker.workerInfo.verification.dniUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-primary hover:underline border border-primary/20 rounded-xl px-3 py-2"
                        >
                          🪪 Ver DNI
                        </a>
                      )}
                      {worker.workerInfo?.verification?.selfieUrl && (
                        <a
                          href={worker.workerInfo.verification.selfieUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-primary hover:underline border border-primary/20 rounded-xl px-3 py-2"
                        >
                          🤳 Ver selfie
                        </a>
                      )}
                      {!worker.workerInfo?.verification?.dniUrl && !worker.workerInfo?.verification?.selfieUrl && (
                        <p className="text-sm text-gray-medium italic">Sin documentos adjuntos todavía</p>
                      )}
                    </div>

                    {/* Acciones */}
                    <div className="mt-4 flex gap-3">
                      <button
                        onClick={() => handleAction(worker._id, 'approve')}
                        disabled={!!acting}
                        className="btn-primary text-sm px-5 py-2 disabled:opacity-50"
                      >
                        {acting === worker._id + 'approve' ? 'Procesando...' : '✅ Aprobar'}
                      </button>
                      <button
                        onClick={() => handleAction(worker._id, 'reject')}
                        disabled={!!acting}
                        className="bg-red-50 text-red-600 font-semibold text-sm px-5 py-2 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50"
                      >
                        {acting === worker._id + 'reject' ? 'Procesando...' : '❌ Rechazar'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
