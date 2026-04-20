import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import { Eye, EyeOff, Fish, Loader2 } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ login: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { login, api } = useContext(AuthContext); // ✅ use api from context
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // ✅ Use axios instance (auto uses baseURL)
      const res = await api.post('/api/auth/login', formData);

      login(res.data);

      const userData = res.data.user || res.data;

      toast.success(`Welcome back, ${userData.name}! 🎉`);

      // ✅ Role-based redirect
      if (userData.role === 'Admin') navigate('/admin');
      else if (userData.role === 'Doctor') navigate('/doctor/dashboard');
      else navigate('/');

    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-500/20 rounded-[28px] border border-blue-400/30 mb-4 backdrop-blur-md">
            <Fish className="w-10 h-10 text-blue-300" />
          </div>
          <h1 className="text-4xl font-black text-white">AquaSmart</h1>
        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[40px] p-10 shadow-2xl">
          <h2 className="text-2xl font-black text-white mb-8">Sign In</h2>

          <form onSubmit={handleSubmit} className="space-y-6">

            <input
              type="text"
              name="login"
              value={formData.login}
              onChange={handleChange}
              placeholder="Email or Phone"
              className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-2xl text-white"
              required
            />

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-2xl text-white pr-14"
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-500 text-white py-4 rounded-2xl font-bold"
            >
              {submitting ? <Loader2 className="animate-spin" /> : 'Sign In'}
            </button>

          </form>

          <p className="mt-6 text-center text-blue-200">
            Don't have an account?{' '}
            <Link to="/register" className="text-white font-bold">Register</Link>
          </p>

        </div>
      </div>
    </div>
  );
};

export default Login;