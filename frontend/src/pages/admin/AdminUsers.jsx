import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from './Layout';
import api from '../../services/api';

const ROLE_LABEL = { client: 'Cliente', worker: 'Trabajador', admin: 'Admin' };
const ROLE_COLOR = { client: 'bg-blue-100 text-blue-700', worker: 'bg-green-100 text-green-700', admin: 'bg-purple-100 text-purple-700' };

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 20 });
    if (search) params.set('search', search);
    if (roleFilter) params.set('role', roleFilter);

    api.get(`/admin/users?${params}`)
      .then(({ users, total, pages }) => {
        setUsers(users);
        setTotal(total);
        setPages(pages);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, search, roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleToggle = async (userId, currentStatus) => {
    setToggling(userId);
    try {
      const { isActive } = await api.put(`/admin/users/${userId}/toggle`);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive } : u));
    } catch (err) {
      alert(err.message);
    } finally {
      setToggling(null);
    }
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-navy">Usuarios <span className="text-gray-medium font-normal text-lg">({total})</span></h1>
        </div>

        {/* Filtros */}
        <form onSubmit={handleSearch} className="bg-white rounded-2xl p-4 shadow-sm mb-4 flex gap-3 flex-wrap">
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field flex-1 min-w-48"
          />
          <select
            value={roleFilter}
            onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
            className="input-field w-40"
          >
            <option value="">Todos los roles</option>
            <option value="client">Clientes</option>
            <option value="worker">Trabajadores</option>
            <option value="admin">Admins</option>
          </select>
          <button type="submit" className="btn-primary px-5">Buscar</button>
        </form>

        {/* Tabla */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <p className="text-center text-gray-medium py-16">No se encontraron usuarios.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3 text-gray-medium font-medium">Usuario</th>
                  <th className="text-left px-5 py-3 text-gray-medium font-medium">Rol</th>
                  <th className="text-left px-5 py-3 text-gray-medium font-medium">Estado</th>
                  <th className="text-left px-5 py-3 text-gray-medium font-medium">Registro</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map(u => (
                  <React.Fragment key={u._id}>
                  <tr className="hover:bg-gray-50/50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=1E3A8A&color=fff&size=32`}
                          alt=""
                          className="w-8 h-8 rounded-full flex-shrink-0"
                        />
                        <div>
                          <p className="font-medium text-navy">{u.name}</p>
                          <p className="text-xs text-gray-medium">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ROLE_COLOR[u.role] || 'bg-gray-100 text-gray-600'}`}>
                        {ROLE_LABEL[u.role] || u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${u.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {u.isActive !== false ? 'Activo' : 'Bloqueado'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-medium">
                      {new Date(u.createdAt).toLocaleDateString('es-AR')}
                    </td>
                    <td className="px-5 py-3 text-right flex items-center justify-end gap-2">
                      {u.role === 'worker' && (
                        <button
                          onClick={() => setExpandedId(expandedId === u._id ? null : u._id)}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                        >
                          💳 {expandedId === u._id ? 'Ocultar' : 'Ver CBU'}
                        </button>
                      )}
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleToggle(u._id, u.isActive)}
                          disabled={toggling === u._id}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                            u.isActive !== false
                              ? 'bg-red-50 text-red-600 hover:bg-red-100'
                              : 'bg-green-50 text-green-600 hover:bg-green-100'
                          } disabled:opacity-50`}
                        >
                          {toggling === u._id ? '...' : u.isActive !== false ? 'Bloquear' : 'Activar'}
                        </button>
                      )}
                    </td>
                  </tr>
                  {/* Fila expandida con datos de cobro */}
                  {expandedId === u._id && u.role === 'worker' && (
                    <tr className="bg-blue-50/50">
                      <td colSpan={5} className="px-5 py-3">
                        <div className="flex items-center gap-6 text-sm flex-wrap">
                          <span className="text-gray-medium font-medium">Datos de cobro de <span className="text-navy font-semibold">{u.name}</span>:</span>
                          <div className="flex items-center gap-3 text-xs">
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-lg">✅ {u.workerInfo?.stats?.completedJobs || 0} completados</span>
                            {(u.workerInfo?.stats?.cancelledJobs || 0) > 0 && (
                              <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-lg">⚠️ {u.workerInfo.stats.cancelledJobs} cancelaciones</span>
                            )}
                            <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-lg">⭐ {u.workerInfo?.stats?.avgRating?.toFixed(1) || '0.0'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-medium">CBU:</span>
                            {u.workerInfo?.paymentMethod?.cbu
                              ? <span className="font-mono font-semibold text-navy bg-white px-3 py-1 rounded-lg border select-all">{u.workerInfo.paymentMethod.cbu}</span>
                              : <span className="text-gray-400 italic">No cargado</span>
                            }
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-medium">Alias:</span>
                            {u.workerInfo?.paymentMethod?.alias
                              ? <span className="font-mono font-semibold text-navy bg-white px-3 py-1 rounded-lg border select-all">{u.workerInfo.paymentMethod.alias}</span>
                              : <span className="text-gray-400 italic">No cargado</span>
                            }
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          )}

          {/* Paginación */}
          {pages > 1 && (
            <div className="flex items-center justify-center gap-2 px-5 py-4 border-t border-gray-100">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-medium hover:bg-gray-100 disabled:opacity-40"
              >
                ← Anterior
              </button>
              <span className="text-sm text-gray-medium">Página {page} de {pages}</span>
              <button
                onClick={() => setPage(p => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-medium hover:bg-gray-100 disabled:opacity-40"
              >
                Siguiente →
              </button>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
