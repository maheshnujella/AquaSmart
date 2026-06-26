import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Phone, ArrowRight, Lock, KeyRound, Loader2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth(); // If we want to auto-login after reset

  // Form Step: 1 for requesting OTP, 2 for verifying OTP and resetting password
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [login, setLogin] = useState(''); // email or phone
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // ── Request OTP ────────────────────────────────────────────────────────────
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    if (!login.trim()) {
      return toast.error('Please enter your email or phone number');
    }

    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/forgot-password', { login });
      if (data.success) {
        toast.success(data.message || 'OTP sent successfully!');
        setStep(2);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Reset Password ─────────────────────────────────────────────────────────
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp.trim()) return toast.error('Please enter the OTP');
    if (password.length < 6) return toast.error('Password must be at least 6 characters');
    if (password !== confirmPassword) return toast.error('Passwords do not match');

    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/reset-password', {
        login,
        otp,
        password,
      });

      if (data.success) {
        toast.success('Password reset successfully!');
        // If the backend auto-logs the user in, we could use authLogin here
        // or just redirect to login:
        if (data.user && data.token) {
          authLogin(data.user, data.token);
        } else {
          navigate('/login');
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password. Please check your OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col">
        {/* Header Section */}
        <div className="bg-blue-600 px-8 py-10 text-center relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500 rounded-full blur-2xl opacity-50"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-400 rounded-full blur-2xl opacity-50"></div>

          <div className="relative z-10 flex justify-center mb-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              {step === 1 ? (
                <Lock className="w-8 h-8 text-white" />
              ) : (
                <KeyRound className="w-8 h-8 text-white" />
              )}
            </div>
          </div>
          <h2 className="text-3xl font-black text-white mb-2 relative z-10">
            {step === 1 ? 'Forgot Password?' : 'Reset Password'}
          </h2>
          <p className="text-blue-100 font-medium relative z-10">
            {step === 1
              ? "Enter your email or phone to receive an OTP."
              : "Enter the OTP sent to your email and set a new password."}
          </p>
        </div>

        {/* Form Section */}
        <div className="p-8">
          {step === 1 ? (
            <form onSubmit={handleRequestOTP} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
                  Email or Phone
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-semibold focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all outline-none"
                    placeholder="name@example.com or 9876543210"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl transition-all hover:scale-[1.02] shadow-lg shadow-blue-200 disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center gap-2 mt-4"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  <>
                    Send OTP <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
                  6-Digit OTP
                </label>
                <input
                  type="text"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-black tracking-widest text-center focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all outline-none"
                  placeholder="123456"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-semibold focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all outline-none"
                    placeholder="Enter new password"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-semibold focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all outline-none"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-4 rounded-2xl transition-all hover:scale-[1.02] shadow-lg shadow-green-200 disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center gap-2 mt-4"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  <>
                    Reset Password <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Footer Navigation */}
          <div className="mt-8 text-center">
            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors inline-flex items-center gap-1 mb-4"
              >
                <ArrowLeft className="w-4 h-4" /> Back to email
              </button>
            )}
            <p className="text-sm font-medium text-slate-600">
              Remember your password?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-bold hover:underline">
                Back to Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
