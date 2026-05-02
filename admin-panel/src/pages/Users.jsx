import { useState, useEffect } from 'react';
import api from '../services/api';

const ROLE_BADGE = {
  client: 'bg-blue-100 text-blue-700',
  worker: 'bg-green-100 text-green-700',
  admin: 'bg-red-100 text-red-700',
};

export default function Users() {
  const [data, setData] = useState({ users: [], total: 0, pages: 1 });
  const [role, setRole] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchUsers = () => {
    setLoading(true);
    api.get(`/admin/users?role=${role}&search=${search}&page=${page}`)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, [role, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const toggleUser = async (id) => {
    try {
      await api.put(`/admin/users/${id}/toggle`);
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Usuarios ({data.total})</h1>

      <div className="flex gap-3 mb-5">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border border-gray-300 rounded-xl px-4 py-2 flex-1 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
          />
          <button type="submit" className="bg-red-500 text-white px-4 py-2 rounded-xl text-sm hover:bg-red-600 transition-colors">Buscar</button>
        </form>
        <select
          value={role}
          onChange={e => { setRole(e.target.value); setPage(1); }}
          className="border border-gray-300 rounded-xl px-3 py-2 text-sm"
        >
          <option value="">Todos</option>
          <option value="client">Clientes</option>
          <option value="worker">Trabajadores</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left">Usuario</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Rol</th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-left">Acción</th>
              </tr>
            </thead>
            <tbody>
              {data.users.map(u => (
                <tr key={u._id} className="border-t hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <img src={u.photo || `https://ui-avatars.com/api/?name=${u.name}&size=32`} alt="" className="w-8 h-8 rounded-full" />
                      <span className="font-medium">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${ROLE_BADGE[u.role] || ''}`}>{u.role}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium ${u.isActive ? 'text-green-600' : 'text-red-500'}`}>
                      {u.isActive ? '● Activo' : '● Bloqueado'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleUser(u._id)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                        u.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'
                      }`}
                    >
                      {u.isActive ? 'Bloquear' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Paginación */}
          <div className="flex justify-center gap-2 py-4 border-t">
            {Array.from({ length: data.pages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-sm font-medium ${
                  page === p ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
