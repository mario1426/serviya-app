import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function NotificationBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [data, setData] = useState({ notifications: [], unread: 0 });
  const panelRef = useRef(null);

  const fetchNotifications = () => {
    api.get('/notifications').then(setData).catch(() => {});
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpen = () => {
    setOpen(o => !o);
    if (!open && data.unread > 0) {
      api.put('/notifications/read-all').then(() => {
        setData(d => ({ ...d, unread: 0, notifications: d.notifications.map(n => ({ ...n, read: true })) }));
      }).catch(() => {});
    }
  };

  const handleClick = (n) => {
    setOpen(false);
    if (n.url && n.url !== '/') navigate(n.url);
  };

  const timeAgo = (date) => {
    const diff = (Date.now() - new Date(date)) / 1000;
    if (diff < 60) return 'ahora';
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Botón campana */}
      <button
        onClick={handleOpen}
        className="relative p-2 text-gray-medium hover:text-navy transition-colors"
        aria-label="Notificaciones"
      >
        🔔
        {data.unread > 0 && (
          <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
            {data.unread > 9 ? '9+' : data.unread}
          </span>
        )}
      </button>

      {/* Panel desplegable */}
      {open && (
        <div className="absolute right-0 top-10 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <p className="font-semibold text-navy text-sm">Notificaciones</p>
            {data.unread > 0 && (
              <span className="text-xs text-primary font-medium">{data.unread} nuevas</span>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {data.notifications.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-3xl mb-2">🔔</p>
                <p className="text-sm text-gray-medium">Sin notificaciones</p>
              </div>
            ) : (
              data.notifications.map(n => (
                <button
                  key={n._id}
                  onClick={() => handleClick(n)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${!n.read ? 'bg-red-50/40' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    {!n.read && <div className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0" />}
                    {n.read && <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-navy leading-snug">{n.title}</p>
                      <p className="text-xs text-gray-medium mt-0.5 leading-snug line-clamp-2">{n.body}</p>
                    </div>
                    <span className="text-xs text-gray-medium flex-shrink-0 mt-0.5">{timeAgo(n.createdAt)}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
