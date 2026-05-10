import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { usePushNotifications } from './hooks/usePushNotifications';
import SupportChat from './components/SupportChat';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import RoleSelect from './pages/RoleSelect';

// Client
import ClientHome from './pages/client/Home';
import ClientProfile from './pages/client/ProfileSetup';
import WorkersList from './pages/client/WorkersList';
import WorkerProfile from './pages/client/WorkerProfile';
import RequestService from './pages/client/RequestService';
import ActiveService from './pages/client/ActiveService';
import RateService from './pages/client/RateService';
import ClientHistory from './pages/client/History';

// Worker
import WorkerDashboard from './pages/worker/Dashboard';
import WorkerProfileSetup from './pages/worker/ProfileSetup';
import WorkerRequestDetail from './pages/worker/RequestDetail';
import WorkerVerification from './pages/worker/Verification';
import WorkerHistory from './pages/worker/History';
import WorkerEarnings from './pages/worker/Earnings';
import WorkerStats from './pages/worker/Stats';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminVerifications from './pages/admin/AdminVerifications';
import AdminCategories from './pages/admin/AdminCategories';
import AdminReclamos from './pages/admin/AdminReclamos';
import Reclamo from './pages/client/Reclamo';

// Shared
import Chat from './pages/Chat';
import NotFound from './pages/NotFound';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentResult from './pages/PaymentResult';
import PaymentFailure from './pages/PaymentFailure';
import PaymentPending from './pages/PaymentPending';
import TermsAndConditions from './pages/TermsAndConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Support from './pages/Support';

// ─── Guards ──────────────────────────────────────────────
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading, firebaseUser } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!firebaseUser) return <Navigate to="/login" replace />;
  if (!isAuthenticated) return <Navigate to="/role-select" replace />;
  return children;
};

const ClientRoute = ({ children }) => {
  const { isClient, isAdmin, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!isClient && !isAdmin) return <Navigate to="/worker/dashboard" replace />;
  return children;
};

const WorkerRoute = ({ children }) => {
  const { isWorker, isAdmin, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!isWorker && !isAdmin) return <Navigate to="/" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { isAdmin, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
};

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-light">
    <div className="flex flex-col items-center gap-3">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-medium font-medium">Cargando...</p>
    </div>
  </div>
);

// ─── Push bootstrap (necesita estar dentro de AuthProvider) ───
function PushBootstrap() {
  const { isAuthenticated } = useAuth();
  usePushNotifications(isAuthenticated);
  return null;
}

// ─── App ───────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PushBootstrap />
        <SupportChat />
        <Routes>
          {/* Públicas */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/role-select" element={<RoleSelect />} />
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/support" element={<Support />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/failure" element={<PaymentFailure />} />
          <Route path="/payment/pending" element={<PaymentPending />} />
          <Route path="/payment/:requestId" element={<PaymentResult />} />

          {/* Cliente */}
          <Route path="/home" element={<PrivateRoute><ClientRoute><ClientHome /></ClientRoute></PrivateRoute>} />
          <Route path="/profile/setup" element={<PrivateRoute><ClientRoute><ClientProfile /></ClientRoute></PrivateRoute>} />
          <Route path="/workers" element={<PrivateRoute><ClientRoute><WorkersList /></ClientRoute></PrivateRoute>} />
          <Route path="/workers/:id" element={<PrivateRoute><ClientRoute><WorkerProfile /></ClientRoute></PrivateRoute>} />
          <Route path="/request/:workerId?" element={<PrivateRoute><ClientRoute><RequestService /></ClientRoute></PrivateRoute>} />
          <Route path="/service/:requestId" element={<PrivateRoute><ActiveService /></PrivateRoute>} />
          <Route path="/rate/:requestId" element={<PrivateRoute><ClientRoute><RateService /></ClientRoute></PrivateRoute>} />
          <Route path="/history" element={<PrivateRoute><ClientRoute><ClientHistory /></ClientRoute></PrivateRoute>} />
          <Route path="/reclamo" element={<PrivateRoute><ClientRoute><Reclamo /></ClientRoute></PrivateRoute>} />

          {/* Trabajador */}
          <Route path="/worker/dashboard" element={<PrivateRoute><WorkerRoute><WorkerDashboard /></WorkerRoute></PrivateRoute>} />
          <Route path="/worker/profile/setup" element={<PrivateRoute><WorkerRoute><WorkerProfileSetup /></WorkerRoute></PrivateRoute>} />
          <Route path="/worker/request/:requestId" element={<PrivateRoute><WorkerRoute><WorkerRequestDetail /></WorkerRoute></PrivateRoute>} />
          <Route path="/worker/verification" element={<PrivateRoute><WorkerRoute><WorkerVerification /></WorkerRoute></PrivateRoute>} />
          <Route path="/worker/history" element={<PrivateRoute><WorkerRoute><WorkerHistory /></WorkerRoute></PrivateRoute>} />
          <Route path="/worker/earnings" element={<PrivateRoute><WorkerRoute><WorkerEarnings /></WorkerRoute></PrivateRoute>} />
          <Route path="/worker/stats" element={<PrivateRoute><WorkerRoute><WorkerStats /></WorkerRoute></PrivateRoute>} />

          {/* Admin */}
          <Route path="/admin" element={<PrivateRoute><AdminRoute><AdminDashboard /></AdminRoute></PrivateRoute>} />
          <Route path="/admin/users" element={<PrivateRoute><AdminRoute><AdminUsers /></AdminRoute></PrivateRoute>} />
          <Route path="/admin/verifications" element={<PrivateRoute><AdminRoute><AdminVerifications /></AdminRoute></PrivateRoute>} />
          <Route path="/admin/categories" element={<PrivateRoute><AdminRoute><AdminCategories /></AdminRoute></PrivateRoute>} />
          <Route path="/admin/reclamos" element={<PrivateRoute><AdminRoute><AdminReclamos /></AdminRoute></PrivateRoute>} />

          {/* Chat compartido */}
          <Route path="/chat/:requestId" element={<PrivateRoute><Chat /></PrivateRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
