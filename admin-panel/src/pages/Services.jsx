import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Services() {
  const [categories, setCategories] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', slug: '', icon: '', priceMin: '', priceMax: '' });
  const [creating, setCreating] = useState(false);

  const fetchCats = () => api.get('/admin/categories').then(setCategories).catch(console.error);
  useEffect(() => { fetchCats(); }, []);

  const save = async () => {
    try {
      if (creating) {
        await api.post('/admin/categories', { ...form, priceMin: +form.priceMin, priceMax: +form.priceMax });
      } else {
        await api.put(`/admin/categories/${editing}`, { ...form, priceMin: +form.priceMin, priceMax: +form.priceMax });
      }
      setEditing(null);
      setCreating(false);
      setForm({ name: '', slug: '', icon: '', priceMin: '', priceMax: '' });
      fetchCats();
    } catch (err) {
      alert(err.message);
    }
  };

  const startEdit = (cat) => {
    setEditing(cat._id);
    setCreating(false);
    setForm({ name: cat.name, slug: cat.slug, icon: cat.icon, priceMin: cat.priceMin, priceMax: cat.priceMax });
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Servicios y precios</h1>
        <button onClick={() => { setCreating(true); setEditing(null); setForm({ name: '', slug: '', icon: '', priceMin: '', priceMax: '' }); }}
          className="bg-red-500 text-white px-4 py-2 rounded-xl text-sm hover:bg-red-600 transition-colors">
          + Nuevo servicio
        </button>
      </div>

      {(editing || creating) && (
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-5">
          <h3 className="font-semibold mb-4">{creating ? 'Nuevo servicio' : 'Editar servicio'}</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: 'name', label: 'Nombre' },
              { key: 'slug', label: 'Slug' },
              { key: 'icon', label: 'Ícono (emoji)' },
              { key: 'priceMin', label: 'Precio mínimo (ARS)', type: 'number' },
              { key: 'priceMax', label: 'Precio máximo (ARS)', type: 'number' },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs text-gray-500 mb-1 block">{f.label}</label>
                <input
                  type={f.type || 'text'}
                  value={form[f.key]}
                  onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={save} className="bg-red-500 text-white px-4 py-2 rounded-xl text-sm">Guardar</button>
            <button onClick={() => { setEditing(null); setCreating(false); }} className="bg-slate-100 px-4 py-2 rounded-xl text-sm">Cancelar</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 text-left">Servicio</th>
              <th className="px-4 py-3 text-left">Slug</th>
              <th className="px-4 py-3 text-left">Precio mín.</th>
              <th className="px-4 py-3 text-left">Precio máx.</th>
              <th className="px-4 py-3 text-left">Estado</th>
              <th className="px-4 py-3 text-left">Acción</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(cat => (
              <tr key={cat._id} className="border-t hover:bg-slate-50">
                <td className="px-4 py-3 font-medium">{cat.icon} {cat.name}</td>
                <td className="px-4 py-3 text-gray-500 font-mono text-xs">{cat.slug}</td>
                <td className="px-4 py-3">${cat.priceMin.toLocaleString()}</td>
                <td className="px-4 py-3">${cat.priceMax.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium ${cat.isActive ? 'text-green-600' : 'text-red-500'}`}>
                    {cat.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => startEdit(cat)} className="text-xs bg-slate-100 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors">
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
