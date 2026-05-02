import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/', label: '📊 Dashboard', exact: true },
  { to: '/users', label: '👥 Usuarios' },
  { to: '/verifications', label: '🔐 Verificaciones' },
  { to: '/services', label: '⚙️ Servicios' },
  { to: '/tickets', label: '🎫 Tickets' },
];

export default function Layout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-56 bg-slate-900 text-white flex flex-col">
        <div className="px-6 py-5 border-b border-slate-700">
          <div className="flex items-center gap-1">
            <span className="text-xl font-bold text-red-400">Servi</span>
            <span className="text-xl font-bold">Ya</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Panel de administración</p>
        </div>
        <nav className="flex-1 py-4">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                `flex items-center gap-2 px-6 py-3 text-sm transition-colors ${
                  isActive ? 'bg-slate-700 text-white font-medium' : 'text-slate-300 hover:bg-slate-800'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-6 py-4 border-t border-slate-700">
          <button onClick={async () => { await logout(); navigate('/login'); }} className="text-slate-400 text-sm hover:text-white">
            🚪 Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
