import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Loader2, Fish } from 'lucide-react';

const ProtectedRoute = () => {
  const { user, loading } = useContext(AuthContext);

  // Wait for the auth check to complete before deciding
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 bg-blue-100 rounded-[24px] flex items-center justify-center">
          <Fish className="w-8 h-8 text-blue-600" />
        </div>
        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
        <p className="text-slate-500 font-medium text-sm">Loading AquaSmart...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
