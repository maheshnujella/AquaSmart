import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import { Eye, EyeOff, Fish, Loader2, CheckCircle2 } from 'lucide-react';

const ROLES = [
  { value: 'Customer', label: '🌾 Farmer / Customer' },
  { value: 'Shopkeeper', label: '🏪 Shopkeeper' },
  { value: 'Delivery', label: '🚚 Delivery Agent' },
  { value: 'Doctor', label: '👨‍⚕️ Aqua Doctor' },
];

const passwordRules = [
  { label: '6–10 characters', test: (p) => p.length >= 6 && p.length <= 10 },
  { label: 'One uppercase letter (A-Z)', test: (p) => /[A-Z]/.test(p) },
  { label: 'One number (0-9)', test: (p) => /[0-9]/.test(p) },
  { label: 'One special symbol (!@#...)', test: (p) => /[^A-Za-z0-9]/.test(p) },
];

const Register = () => {
  const navigate = useNavigate();
  const { login, api } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Customer',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const allRulesPassed = passwordRules.every((r) => r.test(formData.password));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) return toast.error('Name is required');
    if (!formData.email && !formData.phone) return toast.error('Provide email or phone');
    if (!allRulesPassed) return toast.error('Password does not meet requirements');

    try {
      setSubmitting(true);
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        role: formData.role,
        password: formData.password,
      };

      const res = await api.post('/api/auth/register', payload);
      login(res.data);
      toast.success('Account created successfully! 🎉');

      const userRole = res.data?.user?.role || res.data?.role;
      if (userRole === 'Admin') navigate('/admin');
      else if (userRole === 'Doctor') navigate('/doctor/dashboard');
      else navigate('/');
    } catch (err) {
      console.error('[REGISTER ERROR]', err);
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-500/20 rounded-[28px] border border-blue-400/30 mb-4 backdrop-blur-md">
            <Fish className="w-10 h-10 text-blue-300" />
          </div>
          <h1 className="text-4xl font-black text-white">AquaSmart</h1>
          <p className="text-blue-300 mt-1 text-sm">Smart Aquaculture Platform</p>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[40px] p-10 shadow-2xl">
          <h2 className="text-2xl font-black text-white mb-8">Create Account</h2>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Full Name */}
            <div>
              <label className="block text-blue-200 text-xs font-semibold uppercase tracking-widest mb-2">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your full name"
                className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-blue-300/60 focus:outline-none focus:border-blue-400 transition"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-blue-200 text-xs font-semibold uppercase tracking-widest mb-2">Email <span className="normal-case font-normal text-blue-400">(or use phone below)</span></label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@email.com"
                className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-blue-300/60 focus:outline-none focus:border-blue-400 transition"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-blue-200 text-xs font-semibold uppercase tracking-widest mb-2">Phone <span className="normal-case font-normal text-blue-400">(or use email above)</span></label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="10-digit phone number"
                className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-blue-300/60 focus:outline-none focus:border-blue-400 transition"
              />
            </div>

            {/* Account Type */}
            <div>
              <label className="block text-blue-200 text-xs font-semibold uppercase tracking-widest mb-2">Account Type</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-blue-900/60 border border-white/20 rounded-2xl text-white focus:outline-none focus:border-blue-400 transition appearance-none cursor-pointer"
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value} className="bg-blue-950">
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Password */}
            <div>
              <label className="block text-blue-200 text-xs font-semibold uppercase tracking-widest mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-blue-300/60 focus:outline-none focus:border-blue-400 transition pr-14"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-300 hover:text-white transition"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Password Rules */}
              {formData.password.length > 0 && (
                <ul className="mt-3 space-y-1">
                  {passwordRules.map((rule) => (
                    <li key={rule.label} className={`flex items-center gap-2 text-xs ${rule.test(formData.password) ? 'text-green-400' : 'text-blue-300/60'}`}>
                      <CheckCircle2 size={13} className={rule.test(formData.password) ? 'text-green-400' : 'text-blue-300/30'} />
                      {rule.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-500 hover:bg-blue-400 disabled:opacity-60 text-white py-4 rounded-2xl font-bold text-lg transition flex items-center justify-center gap-2 mt-2"
            >
              {submitting ? (
                <><Loader2 className="animate-spin" size={20} /> Creating...</>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-blue-200">
            Already have an account?{' '}
            <Link to="/login" className="text-white font-bold hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;