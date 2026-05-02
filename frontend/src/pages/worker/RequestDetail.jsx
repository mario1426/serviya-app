import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function WorkerRequestDetail() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    api.get(`/requests/${requestId}`).then(setRequest).catch(console.error).finally(() => setLoading(false));
  }, [requestId]);

  // Mapa del cliente
  useEffect(() => {
    if (!request || !mapRef.current || mapInstanceRef.current) return;
    const coords = request.clientLocation?.coordinates;
    if (!coords || coords[0] === 0) return;

    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    const [lng, lat] = coords;
    const map = L.map(mapRef.current, { zoomControl: true, dragging: true }).setView([lat, lng], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);
    L.marker([lat, lng]).addTo(map).bindPopup(`📍 ${request.client?.name || 'Cliente'}`).openPopup();
    mapInstanceRef.current = map;

    return () => { map.remove(); mapInstanceRef.current = null; };
  }, [request]);

  const handle = async (action, body = {}) => {
    setActionLoading(true);
    try {
      const updated = await api.put(`/requests/${requestId}/${action}`, body);
      setRequest(updated);
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>;

  if (!request) return <div className="p-6 text-center">Solicitud no encontrada</div>;

  return (
    <div className="min-h-screen bg-gray-light">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate('/worker/dashboard')} className="text-navy font-bold text-xl">←</button>
          <h1 className="text-lg font-bold text-navy">Detalle de solicitud</h1>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* Cliente */}
        <div className="card flex items-center gap-3">
          <img
            src={request.client?.photo || `https://ui-avatars.com/api/?name=${request.client?.name}`}
            alt=""
            className="w-12 h-12 rounded-full"
          />
          <div>
            <p className="font-semibold text-navy">{request.client?.name}</p>
            <p className="text-sm text-gray-medium">{request.client?.phone}</p>
          </div>
        </div>

        {/* Info servicio */}
        <div className="card space-y-3">
          <h3 className="font-semibold text-navy">Servicio solicitado</h3>
          <div className="flex justify-between text-sm">
            <span className="text-gray-medium">Categoría</span>
            <span className="font-medium capitalize">{request.category?.name}</span>
          </div>
          {request.description && (
            <div>
              <p className="text-sm text-gray-medium mb-1">Descripción:</p>
              <p className="text-sm">{request.description}</p>
            </div>
          )}
          {request.photos?.length > 0 && (
            <div>
              <p className="text-sm text-gray-medium mb-2">📷 Fotos del cliente:</p>
              <div className="flex gap-2 flex-wrap">
                {request.photos.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`Foto ${i + 1}`}
                    className="w-20 h-20 object-cover rounded-xl border border-gray-200 cursor-pointer hover:opacity-90"
                    onClick={() => window.open(url, '_blank')}
                  />
                ))}
              </div>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-gray-medium">Precio</span>
            <span className="font-semibold text-primary">
              {request.pricingType === 'quote' ? 'A presupuestar' : `$${request.proposedPrice?.toLocaleString()}`}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-medium">Pago</span>
            <span>{request.payment?.method === 'cash' ? '💵 Efectivo' : '💳 Mercado Pago'}</span>
          </div>
          {request.isUrgent && (
            <div className="bg-orange-50 text-orange-700 text-sm px-3 py-1.5 rounded-xl font-medium text-center">
              🔥 Solicitud urgente
            </div>
          )}
        </div>

        {/* Mapa ubicación del cliente */}
        {request.clientLocation?.coordinates?.[0] !== 0 && (
          <div className="card space-y-2">
            <h3 className="font-semibold text-navy">📍 Ubicación del cliente</h3>
            {request.clientLocation?.address && (
              <p className="text-sm text-gray-medium">{request.clientLocation.address}</p>
            )}
            <div
              ref={mapRef}
              className="w-full rounded-xl overflow-hidden border border-gray-200"
              style={{ height: '200px', zIndex: 0 }}
            />
            {request.clientLocation?.coordinates && (
              <a
                href={`https://www.google.com/maps?q=${request.clientLocation.coordinates[1]},${request.clientLocation.coordinates[0]}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center text-sm text-primary font-medium hover:underline"
              >
                Abrir en Google Maps →
              </a>
            )}
          </div>
        )}

        {/* Acciones */}
        <div className="space-y-2">
          {request.status === 'pending' && (
            <>
              <button onClick={() => handle('accept')} disabled={actionLoading} className="btn-primary w-full">
                ✓ Aceptar solicitud
              </button>
              <button onClick={() => handle('reject')} disabled={actionLoading} className="btn-secondary w-full">
                ✕ Rechazar
              </button>
            </>
          )}

          {request.status === 'accepted' && (
            <>
              <button onClick={() => handle('start')} disabled={actionLoading} className="btn-primary w-full">
                🔧 Iniciar trabajo
              </button>
              <button onClick={() => navigate(`/chat/${requestId}`)} className="btn-navy w-full">
                💬 Chatear con el cliente
              </button>
            </>
          )}

          {request.status === 'in_progress' && (
            <>
              <button
                onClick={() => {
                  const price = prompt('Ingresá el precio final del servicio (ARS):');
                  if (price) handle('complete', { finalPrice: parseFloat(price) });
                }}
                disabled={actionLoading}
                className="btn-primary w-full"
              >
                ✅ Marcar como completado
              </button>
              <button onClick={() => navigate(`/chat/${requestId}`)} className="btn-navy w-full">
                💬 Chatear
              </button>
            </>
          )}

          {request.status === 'completed' && (
            <div className="card text-center bg-green-50">
              <p className="text-green-700 font-semibold">✅ Trabajo completado</p>
              <p className="text-sm text-gray-medium mt-1">
                Monto: <span className="font-bold text-primary">${request.finalPrice?.toLocaleString()}</span>
                {' '}· Tu parte: <span className="font-bold">${request.payment?.workerAmount?.toLocaleString()}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
