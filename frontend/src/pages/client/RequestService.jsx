import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function RequestService() {
  const { workerId } = useParams();
  const navigate = useNavigate();

  const [worker, setWorker] = useState(null);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    categoryId: '',
    selectedService: null, // { name, price }
    isUrgent: false,
    scheduledAt: '',
    description: '',
    paymentMethod: 'mercadopago',
    address: '',
    lat: null,
    lng: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [photos, setPhotos] = useState([]);       // URLs ya subidas
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  // Cargar trabajador y categorías
  useEffect(() => {
    Promise.all([
      workerId ? api.get(`/users/workers/${workerId}`) : Promise.resolve(null),
      api.get('/categories'),
    ]).then(([w, cats]) => {
      setWorker(w);
      setCategories(cats);
      // Si el trabajador tiene un solo tipo de servicio, pre-seleccionar la categoría
      if (w?.workerInfo?.services?.length === 1) {
        const cat = cats.find(c => c.slug === w.workerInfo.services[0]);
        if (cat) setForm(f => ({ ...f, categoryId: cat._id }));
      }
    }).catch(console.error);
  }, [workerId]);

  // Inicializar mapa Leaflet
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Fix íconos de Leaflet con Vite
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    // Centro inicial: Argentina
    const defaultLat = -34.6037;
    const defaultLng = -58.3816;

    const map = L.map(mapRef.current).setView([defaultLat, defaultLng], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(map);

    const marker = L.marker([defaultLat, defaultLng], { draggable: true }).addTo(map);
    marker.bindPopup('📍 Tu ubicación').openPopup();

    marker.on('dragend', async () => {
      const { lat, lng } = marker.getLatLng();
      setForm(f => ({ ...f, lat, lng }));
      // Geocoding inverso con Nominatim
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
        const data = await res.json();
        if (data.display_name) {
          setForm(f => ({ ...f, address: data.display_name }));
        }
      } catch {}
    });

    map.on('click', async (e) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      setForm(f => ({ ...f, lat, lng }));
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
        const data = await res.json();
        if (data.display_name) {
          setForm(f => ({ ...f, address: data.display_name }));
        }
      } catch {}
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;

    // Intentar obtener ubicación real del cliente
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(({ coords }) => {
        const { latitude: lat, longitude: lng } = coords;
        map.setView([lat, lng], 15);
        marker.setLatLng([lat, lng]);
        setForm(f => ({ ...f, lat, lng }));
        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
          .then(r => r.json())
          .then(data => {
            if (data.display_name) setForm(f => ({ ...f, address: data.display_name }));
          }).catch(() => {});
      }, () => {});
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || photos.length >= 3) return;
    setUploadingPhoto(true);
    try {
      const data = new FormData();
      data.append('photo', file);
      const { url } = await api.post('/upload/request-photo', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setPhotos(prev => [...prev, url]);
    } catch (err) {
      setError('No se pudo subir la foto: ' + err.message);
    } finally {
      setUploadingPhoto(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.lat || !form.lng) return setError('Marcá tu dirección en el mapa');
    if (!form.categoryId) return setError('Seleccioná un tipo de servicio');

    setLoading(true);
    setError('');
    try {
      const request = await api.post('/requests', {
        categoryId: form.categoryId,
        pricingType: 'fixed',
        proposedPrice: form.selectedService?.price || 0,
        selectedServiceName: form.selectedService?.name || '',
        isUrgent: form.isUrgent,
        scheduledAt: form.scheduledAt || null,
        description: form.description,
        paymentMethod: form.paymentMethod,
        address: form.address,
        workerId: workerId || null,
        lat: form.lat,
        lng: form.lng,
        photos,
      });
      navigate(`/service/${request._id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const workerServices = worker?.workerInfo?.customServices?.filter(s => s.name) || [];
  const workerCategories = categories.filter(c => worker?.workerInfo?.services?.includes(c.slug));

  return (
    <div className="min-h-screen bg-gray-light">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-navy font-bold text-xl">←</button>
          <h1 className="text-lg font-bold text-navy">Solicitar servicio</h1>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Servicios del trabajador */}
          {workerServices.length > 0 && (
            <div className="card space-y-3">
              <label className="block text-sm font-semibold text-navy">
                Seleccioná el servicio *
              </label>
              <div className="space-y-2">
                {workerServices.map((s, i) => (
                  <label
                    key={i}
                    className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      form.selectedService?.name === s.name
                        ? 'border-primary bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="service"
                        checked={form.selectedService?.name === s.name}
                        onChange={() => setForm(f => ({ ...f, selectedService: s }))}
                        className="accent-primary"
                      />
                      <span className="text-sm font-medium text-navy">{s.name}</span>
                    </div>
                    <span className="text-sm font-bold text-primary">
                      {s.price > 0 ? `$${s.price.toLocaleString()}` : 'A consultar'}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Categoría (si el trabajador ofrece más de una o no tiene customServices) */}
          {(workerCategories.length > 1 || workerServices.length === 0) && (
            <div className="card">
              <label className="block text-sm font-semibold text-navy mb-2">Tipo de servicio *</label>
              <select
                value={form.categoryId}
                onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
                className="input-field"
                required
              >
                <option value="">Seleccioná un servicio</option>
                {(workerCategories.length > 0 ? workerCategories : categories).map(c => (
                  <option key={c._id} value={c._id}>{c.icon} {c.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Descripción */}
          <div className="card">
            <label className="block text-sm font-semibold text-navy mb-2">Descripción del problema</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="input-field resize-none"
              rows={3}
              placeholder="Describí brevemente qué necesitás..."
            />
          </div>

          {/* Fotos del problema */}
          <div className="card space-y-3">
            <div>
              <label className="block text-sm font-semibold text-navy">📷 Fotos del problema <span className="text-gray-medium font-normal">(opcional)</span></label>
              <p className="text-xs text-gray-medium mt-0.5">Adjuntá hasta 3 fotos para que el profesional entienda mejor</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {photos.map((url, i) => (
                <div key={i} className="relative w-20 h-20">
                  <img src={url} alt="" className="w-20 h-20 object-cover rounded-xl border border-gray-200" />
                  <button
                    type="button"
                    onClick={() => setPhotos(prev => prev.filter((_, j) => j !== i))}
                    className="absolute -top-1.5 -right-1.5 bg-primary text-white rounded-full w-5 h-5 text-xs flex items-center justify-center shadow"
                  >✕</button>
                </div>
              ))}
              {photos.length < 3 && (
                <label className={`w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors ${uploadingPhoto ? 'opacity-50 pointer-events-none' : ''}`}>
                  {uploadingPhoto ? (
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span className="text-2xl text-gray-300">+</span>
                      <span className="text-xs text-gray-medium">Foto</span>
                    </>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                </label>
              )}
            </div>
          </div>

          {/* Mapa */}
          <div className="card space-y-3">
            <div>
              <label className="block text-sm font-semibold text-navy">📍 Tu dirección</label>
              <p className="text-xs text-gray-medium mt-0.5">Tocá el mapa o arrastrá el marcador a tu domicilio exacto</p>
            </div>
            <div
              ref={mapRef}
              className="w-full rounded-xl overflow-hidden border border-gray-200"
              style={{ height: '220px', zIndex: 0 }}
            />
            {form.address && (
              <div className="bg-blue-50 rounded-xl px-3 py-2 flex gap-2 items-start">
                <span className="text-sm flex-shrink-0">📍</span>
                <p className="text-xs text-blue-800">{form.address}</p>
              </div>
            )}
            <input
              type="text"
              value={form.address}
              onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
              className="input-field text-sm"
              placeholder="O escribí tu dirección manualmente..."
            />
          </div>

          {/* Urgente */}
          <div className="card flex items-center justify-between">
            <div>
              <p className="font-semibold text-navy text-sm">¿Es urgente? 🔥</p>
              <p className="text-xs text-gray-medium">Mayor visibilidad</p>
            </div>
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, isUrgent: !f.isUrgent }))}
              className={`w-12 h-6 rounded-full transition-colors ${form.isUrgent ? 'bg-primary' : 'bg-gray-200'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow mx-0.5 transition-transform ${form.isUrgent ? 'translate-x-6' : ''}`} />
            </button>
          </div>

          {/* Cuándo */}
          <div className="card">
            <label className="block text-sm font-semibold text-navy mb-2">¿Cuándo lo necesitás?</label>
            <input
              type="datetime-local"
              value={form.scheduledAt}
              onChange={e => setForm(f => ({ ...f, scheduledAt: e.target.value }))}
              className="input-field"
            />
            <p className="text-xs text-gray-medium mt-1">Dejá vacío para servicio inmediato</p>
          </div>

          {/* Forma de pago — solo transferencia */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 flex gap-3 items-start">
            <span className="text-xl flex-shrink-0">💳</span>
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-0.5">Pago 100% seguro por transferencia</p>
              <p className="text-xs leading-snug">El pago se realiza a través de ServiYa y se libera al profesional solo cuando confirmás que el trabajo fue completado.</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-primary text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full text-lg">
            {loading ? 'Procesando...' : '💳 Contratar y pagar'}
          </button>
        </form>
      </div>
    </div>
  );
}
