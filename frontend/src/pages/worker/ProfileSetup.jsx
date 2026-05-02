import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { ProfilePhotoUpload, PortfolioUpload } from '../../components/PhotoUpload';

const ALL_SERVICES = [
  { slug: 'plomeria', name: 'Plomería', icon: '🔧' },
  { slug: 'electricidad', name: 'Electricidad', icon: '⚡' },
  { slug: 'jardineria', name: 'Jardinería', icon: '🌱' },
  { slug: 'corte-pasto', name: 'Corte de pasto', icon: '🌿' },
  { slug: 'lavado-autos', name: 'Lavado de autos', icon: '🚗' },
  { slug: 'lavanderia', name: 'Lavandería', icon: '👕' },
  { slug: 'peluqueria', name: 'Peluquería', icon: '💇' },
  { slug: 'mascotas', name: 'Mascotas', icon: '🐾' },
  { slug: 'viajes', name: 'Viajes', icon: '🚕' },
  { slug: 'reparaciones', name: 'Reparaciones', icon: '🏠' },
];

export default function WorkerProfileSetup() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const info = user?.workerInfo;

  const nameParts = (user?.name || '').trim().split(' ');
  const BLANK_SERVICE = { name: '', price: '' };
  const [form, setForm] = useState({
    nombre: nameParts[0] || '',
    apellido: nameParts.slice(1).join(' ') || '',
    phone: user?.phone || '',
    address: user?.location?.address || '',
    bio: info?.bio || '',
    zone: info?.zone || '',
    cbu: info?.paymentMethod?.cbu || '',
    alias: info?.paymentMethod?.alias || '',
    serviceRadius: info?.serviceRadius || 10,
  });
  const [currentPhoto, setCurrentPhoto] = useState(user?.photo || '');
  const [portfolioPhotos, setPortfolioPhotos] = useState(info?.portfolioPhotos || []);
  const [services, setServices] = useState(info?.services || []);
  const [customServices, setCustomServices] = useState(
    info?.customServices?.length
      ? info.customServices.map(s => ({ name: s.name, price: s.price }))
      : [{ ...BLANK_SERVICE }, { ...BLANK_SERVICE }, { ...BLANK_SERVICE }]
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleService = (slug) => {
    setServices(prev =>
      prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (services.length === 0) return setError('Seleccioná al menos un servicio');
    setLoading(true);
    try {
      const fullName = `${form.nombre.trim()} ${form.apellido.trim()}`.trim();
      await api.put('/users/profile', { name: fullName, phone: form.phone, address: form.address });
      const validCustomServices = customServices.filter(s => s.name.trim());
      await api.put('/users/worker-profile', {
        bio: form.bio, zone: form.zone, services,
        customServices: validCustomServices.map(s => ({
          name: s.name.trim(),
          price: parseFloat(s.price) || 0,
        })),
        cbu: form.cbu, alias: form.alias,
        serviceRadius: form.serviceRadius,
      });
      await refreshUser();
      navigate('/worker/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-light">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-navy font-bold text-xl">←</button>
          <h1 className="text-lg font-bold text-navy">Mi perfil</h1>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Foto de perfil */}
          <div className="card flex flex-col items-center py-5">
            <ProfilePhotoUpload
              currentPhoto={currentPhoto}
              name={`${form.nombre} ${form.apellido}`}
              onUploaded={(url) => setCurrentPhoto(url)}
            />
          </div>

          <div className="card space-y-3">
            <h3 className="font-semibold text-navy">Información personal</h3>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-sm text-gray-medium mb-1 block">Nombre</label>
                <input type="text" value={form.nombre} onChange={e => setForm(f => ({...f, nombre: e.target.value}))} className="input-field" placeholder="Juan" required />
              </div>
              <div className="flex-1">
                <label className="text-sm text-gray-medium mb-1 block">Apellido</label>
                <input type="text" value={form.apellido} onChange={e => setForm(f => ({...f, apellido: e.target.value}))} className="input-field" placeholder="Pérez" required />
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-medium mb-1 block">Teléfono</label>
              <input type="tel" value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} className="input-field" placeholder="+54 11 ..." />
            </div>
            <div>
              <label className="text-sm text-gray-medium mb-1 block">Dirección</label>
              <input type="text" value={form.address} onChange={e => setForm(f => ({...f, address: e.target.value}))} className="input-field" placeholder="Av. Corrientes 1234, Buenos Aires" />
            </div>
            <div>
              <label className="text-sm text-gray-medium mb-1 block">Descripción / Bio</label>
              <textarea value={form.bio} onChange={e => setForm(f => ({...f, bio: e.target.value}))} className="input-field resize-none" rows={3} placeholder="Contá tu experiencia..." />
            </div>
            <div>
              <label className="text-sm text-gray-medium mb-1 block">Zona de trabajo</label>
              <input type="text" value={form.zone} onChange={e => setForm(f => ({...f, zone: e.target.value}))} className="input-field" placeholder="Ej: Palermo, Belgrano, etc." />
            </div>
            <div>
              <label className="text-sm text-gray-medium mb-1 block">Radio de atención: <span className="font-semibold text-navy">{form.serviceRadius} km</span></label>
              <input
                type="range"
                min="1" max="50" step="1"
                value={form.serviceRadius}
                onChange={e => setForm(f => ({...f, serviceRadius: parseInt(e.target.value)}))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-xs text-gray-medium mt-0.5">
                <span>1 km</span>
                <span>25 km</span>
                <span>50 km</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold text-navy mb-3">Servicios que ofrecés *</h3>
            <div className="grid grid-cols-2 gap-2">
              {ALL_SERVICES.map(s => (
                <button
                  key={s.slug}
                  type="button"
                  onClick={() => toggleService(s.slug)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border-2 text-sm transition-all ${
                    services.includes(s.slug)
                      ? 'border-primary bg-red-50 text-primary font-medium'
                      : 'border-gray-200 text-gray-dark'
                  }`}
                >
                  <span>{s.icon}</span>
                  <span>{s.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Servicios con precios */}
          <div className="card space-y-3">
            <div>
              <h3 className="font-semibold text-navy">Mis servicios y precios</h3>
              <p className="text-xs text-gray-medium mt-0.5">Agregá cada trabajo que ofrecés con su precio en ARS</p>
            </div>

            <div className="space-y-2">
              {/* Encabezados */}
              <div className="flex gap-2 px-1">
                <span className="flex-1 text-xs font-medium text-gray-medium">Servicio</span>
                <span className="w-28 text-xs font-medium text-gray-medium">Precio (ARS)</span>
                <span className="w-8" />
              </div>

              {customServices.map((cs, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={cs.name}
                    onChange={e => {
                      const updated = [...customServices];
                      updated[i] = { ...updated[i], name: e.target.value };
                      setCustomServices(updated);
                    }}
                    className="input-field flex-1 text-sm"
                    placeholder={`Ej: Corte de pelo`}
                  />
                  <input
                    type="number"
                    value={cs.price}
                    onChange={e => {
                      const updated = [...customServices];
                      updated[i] = { ...updated[i], price: e.target.value };
                      setCustomServices(updated);
                    }}
                    className="input-field w-28 text-sm"
                    placeholder="3500"
                  />
                  <button
                    type="button"
                    onClick={() => setCustomServices(prev => prev.filter((_, idx) => idx !== i))}
                    className="w-8 h-8 flex items-center justify-center text-gray-medium hover:text-primary rounded-lg hover:bg-red-50 transition-colors flex-shrink-0"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setCustomServices(prev => [...prev, { name: '', price: '' }])}
              className="w-full border-2 border-dashed border-gray-200 text-gray-medium hover:border-primary hover:text-primary text-sm font-medium py-2.5 rounded-xl transition-colors"
            >
              + Agregar servicio
            </button>
          </div>

          {/* Datos de cobro — privados */}
          <div className="card space-y-3">
            <div>
              <h3 className="font-semibold text-navy flex items-center gap-2">
                🔒 Datos de cobro <span className="text-xs font-normal text-gray-medium">(solo visible para el administrador)</span>
              </h3>
            </div>
            <div>
              <label className="text-sm text-gray-medium mb-1 block">CBU</label>
              <input type="text" value={form.cbu} onChange={e => setForm(f => ({...f, cbu: e.target.value}))} className="input-field" placeholder="CBU (22 dígitos)" />
            </div>
            <div>
              <label className="text-sm text-gray-medium mb-1 block">Alias</label>
              <input type="text" value={form.alias} onChange={e => setForm(f => ({...f, alias: e.target.value}))} className="input-field" placeholder="mi.alias.mp" />
            </div>
          </div>

          {/* Fotos de trabajos anteriores */}
          <div className="card">
            <PortfolioUpload
              photos={portfolioPhotos}
              onPhotosChange={setPortfolioPhotos}
            />
          </div>

          {error && <div className="bg-red-50 text-primary text-sm rounded-xl px-4 py-3">{error}</div>}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Guardando...' : 'Guardar perfil'}
          </button>
        </form>
      </div>
    </div>
  );
}
