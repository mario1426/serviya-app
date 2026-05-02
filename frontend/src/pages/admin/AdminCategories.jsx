import { useState, useEffect } from 'react';
import AdminLayout from './Layout';
import api from '../../services/api';

const EMPTY = { name: '', slug: '', icon: '', priceMin: '', priceMax: '', description: '', isActive: true };

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchCategories = () => {
    api.get('/admin/categories')
      .then(setCategories)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleEdit = (cat) => {
    setForm({
      name: cat.name,
      slug: cat.slug,
      icon: cat.icon,
      priceMin: cat.priceMin,
      priceMax: cat.priceMax,
      description: cat.description || '',
      isActive: cat.isActive !== false,
    });
    setEditingId(cat._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNew = () => {
    setForm(EMPTY);
    setEditingId(null);
    setShowForm(true);
  };

  const handleCancel = () => {
    setForm(EMPTY);
    setEditingId(null);
    setShowForm(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));

    // Auto-generar slug desde nombre si es nuevo
    if (name === 'name' && !editingId) {
      const slug = value.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      setForm(prev => ({ ...prev, name: value, slug }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, priceMin: Number(form.priceMin), priceMax: Number(form.priceMax) };
      if (editingId) {
        const updated = await api.put(`/admin/categories/${editingId}`, payload);
        setCategories(prev => prev.map(c => c._id === editingId ? updated : c));
      } else {
        const created = await api.post('/admin/categories', payload);
        setCategories(prev => [...prev, created]);
      }
      handleCancel();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-navy">Categorías de servicios</h1>
          {!showForm && (
            <button onClick={handleNew} className="btn-primary px-5 py-2.5 text-sm">
              + Nueva categoría
            </button>
          )}
        </div>

        {/* Formulario */}
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 mb-6 space-y-4">
            <h2 className="font-bold text-navy text-lg">{editingId ? 'Editar categoría' : 'Nueva categoría'}</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-navy block mb-1">Nombre *</label>
                <input name="name" value={form.name} onChange={handleChange} required className="input-field" placeholder="Ej: Plomería" />
              </div>
              <div>
                <label className="text-sm font-medium text-navy block mb-1">Slug *</label>
                <input name="slug" value={form.slug} onChange={handleChange} required className="input-field" placeholder="Ej: plomeria" />
              </div>
              <div>
                <label className="text-sm font-medium text-navy block mb-1">Ícono (emoji) *</label>
                <input name="icon" value={form.icon} onChange={handleChange} required className="input-field" placeholder="🔧" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-medium text-navy block mb-1">Precio mín. *</label>
                  <input name="priceMin" type="number" value={form.priceMin} onChange={handleChange} required className="input-field" placeholder="3000" />
                </div>
                <div>
                  <label className="text-sm font-medium text-navy block mb-1">Precio máx. *</label>
                  <input name="priceMax" type="number" value={form.priceMax} onChange={handleChange} required className="input-field" placeholder="10000" />
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-navy block mb-1">Descripción</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={2} className="input-field resize-none" placeholder="Descripción breve del servicio..." />
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="isActive" name="isActive" checked={form.isActive} onChange={handleChange} className="w-4 h-4 accent-primary" />
              <label htmlFor="isActive" className="text-sm text-navy font-medium">Categoría activa (visible para clientes)</label>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving} className="btn-primary px-6 py-2.5 text-sm disabled:opacity-50">
                {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear categoría'}
              </button>
              <button type="button" onClick={handleCancel} className="px-6 py-2.5 text-sm font-semibold text-gray-medium hover:text-navy border border-gray-200 rounded-xl transition-colors">
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* Lista */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3 text-gray-medium font-medium">Categoría</th>
                  <th className="text-left px-5 py-3 text-gray-medium font-medium">Slug</th>
                  <th className="text-left px-5 py-3 text-gray-medium font-medium">Precio</th>
                  <th className="text-left px-5 py-3 text-gray-medium font-medium">Estado</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {categories.map(cat => (
                  <tr key={cat._id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{cat.icon}</span>
                        <div>
                          <p className="font-medium text-navy">{cat.name}</p>
                          {cat.description && <p className="text-xs text-gray-medium">{cat.description}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-medium font-mono text-xs">{cat.slug}</td>
                    <td className="px-5 py-3 text-gray-medium">
                      ${cat.priceMin?.toLocaleString()} – ${cat.priceMax?.toLocaleString()}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cat.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {cat.isActive !== false ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => handleEdit(cat)}
                        className="text-xs font-semibold px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        ✏️ Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
