import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import { Eye, EyeOff, Fish, Loader2, CheckCircle, XCircle } from 'lucide-react';

const PASSWORD_RULES = [
  { label: '6–10 characters', test: (p) => p.length >= 6 && p.length <= 10 },
  { label: 'One uppercase letter (A-Z)', test: (p) => /[A-Z]/.test(p) },
  { label: 'One number (0-9)', test: (p) => /[0-9]/.test(p) },
  { label: 'One special symbol (!@#...)', test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'Customer',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isPasswordValid = PASSWORD_RULES.every(rule => rule.test(formData.password));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email && !formData.phone) {
      toast.error('Please provide an email or phone number.');
      return;
    }
    if (!isPasswordValid) {
      toast.error('Password does not meet the requirements.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await axios.post('/api/auth/register', formData);
      login(res.data);
      toast.success('Account created successfully! Welcome to AquaSmart 🐟');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-[24px] border border-blue-400/30 mb-3 backdrop-blur-md">
            <Fish className="w-8 h-8 text-blue-300" />
          </div>
          <h1 className="text-3xl font-black text-white">Join AquaSmart</h1>
          <p className="text-blue-300 font-medium mt-1">Create your aquaculture account</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[40px] p-10 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-blue-200 text-xs font-black uppercase tracking-widest mb-2">Full Name</label>
              <input
                type="text" name="name" value={formData.name} onChange={handleChange}
                placeholder="Your full name" required
                className="w-full px-5 py-3.5 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium"
              />
            </div>

            <div>
              <label className="block text-blue-200 text-xs font-black uppercase tracking-widest mb-2">Email <span className="text-white/30 font-normal normal-case">(or use phone below)</span></label>
              <input
                type="email" name="email" value={formData.email} onChange={handleChange}
                placeholder="your@email.com"
                className="w-full px-5 py-3.5 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium"
              />
            </div>

            <div>
              <label className="block text-blue-200 text-xs font-black uppercase tracking-widest mb-2">Phone <span className="text-white/30 font-normal normal-case">(or use email above)</span></label>
              <input
                type="tel" name="phone" value={formData.phone} onChange={handleChange}
                placeholder="10-digit mobile number"
                className="w-full px-5 py-3.5 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium"
              />
            </div>

            <div>
              <label className="block text-blue-200 text-xs font-black uppercase tracking-widest mb-2">Account Type</label>
              <select
                name="role" value={formData.role} onChange={handleChange}
                className="w-full px-5 py-3.5 bg-white/10 border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium"
              >
                <option value="Customer" className="text-slate-900">🌊 Farmer / Customer</option>
                <option value="Shopkeeper" className="text-slate-900">🏪 Shopkeeper</option>
              </select>
            </div>

            <div>
              <label className="block text-blue-200 text-xs font-black uppercase tracking-widest mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password" value={formData.password} onChange={handleChange}
                  placeholder="Create a strong password" required
                  className="w-full px-5 py-3.5 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium pr-14"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Password Rules Checklist */}
              {formData.password.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {PASSWORD_RULES.map((rule, i) => {
                    const passed = rule.test(formData.password);
                    return (
                      <div key={i} className={`flex items-center gap-2 text-xs font-bold ${passed ? 'text-green-400' : 'text-red-400'}`}>
                        {passed ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        {rule.label}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              type="submit" disabled={submitting || !isPasswordValid}
              className="w-full bg-blue-500 hover:bg-blue-400 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-blue-900/50 transition-all hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {submitting ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Creating Account...</>
              ) : 'Create Account'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-blue-200 font-medium">
              Already have an account?{' '}
              <Link to="/login" className="text-white font-black hover:underline">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
