import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import DashboardLayout from './components/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import DoctorRegister from './pages/DoctorRegister';
import Feed from './pages/modules/Feed';
import Medicine from './pages/modules/Medicine';
import Consultation from './pages/modules/Consultation';
import Repair from './pages/modules/Repair';
import Marketplace from './pages/modules/Marketplace';
import MarketplaceDetails from './pages/modules/MarketplaceDetails';
import Diesel from './pages/modules/Diesel';
import Orders from './pages/modules/Orders';
import OrderTracking from './pages/modules/OrderTracking';
import Checkout from './pages/modules/Checkout';
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/AdminDashboard';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import ManageDoctors from './pages/admin/ManageDoctors';

import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/doctor/register" element={<DoctorRegister />} />
        
        {/* Protected Dashboard Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/medicine" element={<Medicine />} />
            <Route path="/consultation" element={<Consultation />} />
            <Route path="/repair" element={<Repair />} />
            
            {/* Marketplace with Error Boundary */}
            <Route path="/marketplace" element={<ErrorBoundary><Marketplace /></ErrorBoundary>} />
            <Route path="/marketplace/:id" element={<ErrorBoundary><MarketplaceDetails /></ErrorBoundary>} />
            
            <Route path="/diesel" element={<Diesel />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:id/track" element={<OrderTracking />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/profile" element={<Profile />} />
            
            {/* Doctor Only Routes */}
            <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
            
            {/* Admin Only Routes */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/doctors" element={<ManageDoctors />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
