import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';

import DashboardLayout   from './components/DashboardLayout';
import ProtectedRoute    from './components/ProtectedRoute';
import AdminRoute        from './components/AdminRoute';
import ErrorBoundary     from './components/ErrorBoundary';

// Public pages
import Home              from './pages/Home';
import Login             from './pages/Login';
import Register          from './pages/Register';
import DoctorRegister    from './pages/DoctorRegister';

// Module pages
import Feed              from './pages/modules/Feed';
import Medicine          from './pages/modules/Medicine';
import Consultation      from './pages/modules/Consultation';
import Repair            from './pages/modules/Repair';
import Marketplace       from './pages/modules/Marketplace';
import MarketplaceDetails from './pages/modules/MarketplaceDetails';
import Diesel            from './pages/modules/Diesel';
import Orders            from './pages/modules/Orders';
import OrderTracking     from './pages/modules/OrderTracking';
import Checkout          from './pages/modules/Checkout';
import Profile           from './pages/Profile';

// Admin pages
import AdminDashboard    from './pages/admin/AdminDashboard';
import ManageDoctors     from './pages/admin/ManageDoctors';

// Doctor pages
import DoctorDashboard   from './pages/doctor/DoctorDashboard';

// Delivery pages
import DeliveryDashboard from './pages/delivery/DeliveryDashboard';

// Shopkeeper pages
import ShopkeeperDashboard from './pages/shopkeeper/ShopkeeperDashboard';

// ── Role-based redirect after login ──────────────────────────────────────────
const RoleRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'Admin')      return <Navigate to="/admin"                replace />;
  if (user.role === 'Doctor')     return <Navigate to="/doctor/dashboard"      replace />;
  if (user.role === 'Delivery')   return <Navigate to="/delivery/dashboard"    replace />;
  if (user.role === 'Shopkeeper') return <Navigate to="/shopkeeper/dashboard"  replace />;
  return <Navigate to="/" replace />;
};

// ── Role guards ───────────────────────────────────────────────────────────────
const DeliveryRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!['Delivery', 'Admin'].includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

const ShopkeeperRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!['Shopkeeper', 'Admin'].includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

function App() {
  return (
    <Router>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <Routes>
        {/* Public routes */}
        <Route path="/login"           element={<Login />} />
        <Route path="/register"        element={<Register />} />
        <Route path="/doctor/register" element={<DoctorRegister />} />

        {/* Role-based redirect (e.g. after login redirect) */}
        <Route path="/role-redirect" element={<RoleRedirect />} />

        {/* Protected dashboard routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>

            {/* Customer / common */}
            <Route path="/"              element={<Home />} />
            <Route path="/feed"          element={<Feed />} />
            <Route path="/medicine"      element={<Medicine />} />
            <Route path="/consultation"  element={<Consultation />} />
            <Route path="/repair"        element={<Repair />} />

            <Route path="/marketplace"     element={<ErrorBoundary><Marketplace /></ErrorBoundary>} />
            <Route path="/marketplace/:id" element={<ErrorBoundary><MarketplaceDetails /></ErrorBoundary>} />

            <Route path="/diesel"            element={<Diesel />} />
            <Route path="/orders"            element={<Orders />} />
            <Route path="/orders/:id/track"  element={<OrderTracking />} />
            <Route path="/checkout"          element={<Checkout />} />
            <Route path="/profile"           element={<Profile />} />

            {/* Doctor */}
            <Route path="/doctor/dashboard" element={<DoctorDashboard />} />

            {/* Delivery Boy */}
            <Route
              path="/delivery/dashboard"
              element={
                <DeliveryRoute>
                  <DeliveryDashboard />
                </DeliveryRoute>
              }
            />

            {/* Shopkeeper */}
            <Route
              path="/shopkeeper/dashboard"
              element={
                <ShopkeeperRoute>
                  <ShopkeeperDashboard />
                </ShopkeeperRoute>
              }
            />

            {/* Admin only */}
            <Route element={<AdminRoute />}>
              <Route path="/admin"         element={<AdminDashboard />} />
              <Route path="/admin/doctors" element={<ManageDoctors />} />
            </Route>
          </Route>
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
