import { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { LogOut, User, ShoppingCart, Search, Bell, MapPin } from 'lucide-react';
import CartDrawer from './CartDrawer';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { cartItems } = useContext(CartContext);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-lg shadow-md py-2' : 'bg-transparent py-4'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                  <span className="text-xl font-bold">A</span>
                </div>
                <span className={`text-2xl font-bold tracking-tight transition-colors ${scrolled ? 'text-slate-900' : 'text-slate-900'}`}>
                  AquaSmart<span className="text-blue-600">.</span>
                </span>
              </Link>

              {/* Desktop Nav */}
              <div className="hidden lg:flex items-center gap-1">
                {[
                  { name: 'Home', path: '/' },
                  { name: 'Feed', path: '/feed' },
                  { name: 'Medicine', path: '/medicine' },
                  { name: 'Consultation', path: '/consultation' },
                  { name: 'Repair', path: '/repair' },
                  { name: 'Market', path: '/marketplace' },
                  { name: 'My Orders', path: '/orders' },
                ].map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive(item.path)
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-600 hover:bg-blue-50 hover:text-blue-600'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>

              <button 
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors relative"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingCart className="w-5 h-5" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
                    {cartItems.length}
                  </span>
                )}
              </button>

              <div className="h-6 w-px bg-slate-200 mx-1"></div>

              {user ? (
                <div className="relative group">
                  <button className="flex items-center gap-2 pl-2 pr-1 py-1 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                      {user.name.charAt(0)}
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-slate-700">{user.name}</span>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-slate-400 group-hover:rotate-180 transition-transform">
                      <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  </button>
                  
                  {/* Dropdown */}
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-2 group-hover:translate-y-0 transition-all z-50">
                    <div className="px-4 py-3 border-b border-slate-50 mb-1">
                      <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.role}</p>
                    </div>
                    <Link to="/profile" className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors">
                      <User className="w-4 h-4" /> Profile
                    </Link>
                    {user.role === 'Admin' && (
                      <Link to="/admin" className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors">
                        <MapPin className="w-4 h-4" /> Admin Panel
                      </Link>
                    )}
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors mt-1">
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Login</Link>
                  <Link to="/register" className="btn-primary py-2 text-sm">Get Started</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      <div className="h-20"></div> {/* Spacer for fixed nav */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
    );
};

export default Navbar;
