import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import { Eye, EyeOff, Fish, Loader2 } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ login: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await axios.post('/api/auth/login', formData);
      login(res.data);   // stores user + token, sets axios header
      toast.success(`Welcome back, ${res.data.name}! 🎉`);

      // Role-based redirect
      if (res.data.role === 'Admin') navigate('/admin');
      else if (res.data.role === 'Doctor') navigate('/doctor/dashboard');
      else navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Check credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-500/20 rounded-[28px] border border-blue-400/30 mb-4 backdrop-blur-md">
            <Fish className="w-10 h-10 text-blue-300" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">AquaSmart</h1>
          <p className="text-blue-300 font-medium mt-1">Your aquaculture management platform</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[40px] p-10 shadow-2xl">
          <h2 className="text-2xl font-black text-white mb-8">Sign In</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-blue-200 text-sm font-bold uppercase tracking-widest">
                Email or Phone
              </label>
              <input
                type="text"
                name="login"
                value={formData.login}
                onChange={handleChange}
                placeholder="your@email.com or 9876543210"
                className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-blue-200 text-sm font-bold uppercase tracking-widest">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min 6 chars, include A, 1, @"
                  className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium pr-14"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-500 hover:bg-blue-400 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-blue-900/50 transition-all hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Signing in...</>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 text-center space-y-3">
            <p className="text-blue-200 font-medium">
              Don't have an account?{' '}
              <Link to="/register" className="text-white font-black hover:underline">Create one</Link>
            </p>
            <p className="text-blue-200 font-medium">
              Are you a Doctor?{' '}
              <Link to="/doctor/register" className="text-white font-black hover:underline">Register here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
