import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { to: '/admin', label: '📊 Dashboard', end: true },
  { to: '/admin/users', label: '👥 Usuarios' },
  { to: '/admin/verifications', label: '🔐 Verificaciones' },
  { to: '/admin/reclamos', label: '⚠️ Reclamos' },
  { to: '/admin/categories', label: '🗂️ Categorías' },
];

export default function AdminLayout({ children }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-light flex">
      {/* Sidebar */}
      <aside className="w-56 bg-navy min-h-screen flex flex-col flex-shrink-0">
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-1">
            <span className="text-xl font-bold text-primary">Servi</span>
            <span className="text-xl font-bold text-white">Ya</span>
          </div>
          <p className="text-xs text-white/50 mt-0.5">Panel de administración</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `block px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          <button
            onClick={logout}
            className="w-full text-left px-3 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            🚪 Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
