import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import useGeolocation from '../../hooks/useGeolocation';

export default function ClientProfileSetup() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const { coords } = useGeolocation();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.location?.address || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.phone) return setError('El teléfono es obligatorio');
    setLoading(true);
    try {
      await api.put('/users/profile', {
        ...form,
        coordinates: coords ? [coords.lng, coords.lat] : undefined,
      });
      await refreshUser();
      navigate('/home');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy to-navy-dark flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm p-8">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">👤</div>
          <h2 className="text-xl font-bold text-navy">Completá tu perfil</h2>
          <p className="text-gray-medium text-sm mt-1">Solo tomará un momento</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-navy mb-1">Nombre completo</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy mb-1">Teléfono *</label>
            <input
              type="tel"
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              className="input-field"
              placeholder="+54 11 1234 5678"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy mb-1">Dirección</label>
            <input
              type="text"
              value={form.address}
              onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
              className="input-field"
              placeholder="Tu dirección habitual"
            />
          </div>

          {error && <p className="text-primary text-sm">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Guardando...' : 'Continuar a ServiYa'}
          </button>
        </form>
      </div>
    </div>
  );
}
