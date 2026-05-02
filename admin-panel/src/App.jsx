import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Verifications from './pages/Verifications';
import Services from './pages/Services';
import Tickets from './pages/Tickets';

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
  </div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <div className="p-6 text-red-600 font-bold">Acceso denegado</div>;
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<AdminRoute><Layout /></AdminRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="verifications" element={<Verifications />} />
            <Route path="services" element={<Services />} />
            <Route path="tickets" element={<Tickets />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
