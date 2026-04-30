import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, X, Smartphone, Loader2, ShieldCheck, Clock } from 'lucide-react';
import api from '../api';

// ── UPI App brand colours ─────────────────────────────────────────────────────
const UPI_APPS = [
  {
    id: 'PhonePe',
    label: 'PhonePe',
    icon: '/icons/phonepe.svg',
    emoji: '💜',
    bg: 'bg-[#5f259f]',
    ring: 'ring-[#5f259f]',
    text: 'text-white',
    desc: 'Pay via PhonePe UPI',
  },
  {
    id: 'GPay',
    label: 'Google Pay',
    icon: '/icons/gpay.svg',
    emoji: '🔵',
    bg: 'bg-[#1a73e8]',
    ring: 'ring-[#1a73e8]',
    text: 'text-white',
    desc: 'Pay via Google Pay UPI',
  },
  {
    id: 'Paytm',
    label: 'Paytm',
    icon: '/icons/paytm.svg',
    emoji: '🩵',
    bg: 'bg-[#00baf2]',
    ring: 'ring-[#00baf2]',
    text: 'text-white',
    desc: 'Pay via Paytm UPI',
  },
];

const TIMER_SECONDS = 300; // 5-minute simulated window

const PaymentModal = ({ orderId, amount, onSuccess, onClose }) => {
  const [step, setStep]         = useState('select'); // select | processing | success | failed
  const [selectedApp, setSelectedApp] = useState(null);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [txnId, setTxnId]       = useState('');
  const [upiRef, setUpiRef]     = useState('');
  const [split, setSplit]        = useState(null);
  const [error, setError]        = useState('');

  // Countdown timer during processing step
  useEffect(() => {
    if (step !== 'processing') return;
    if (timeLeft <= 0) { setStep('failed'); return; }
    const t = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(t);
  }, [step, timeLeft]);

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  // Step 1: Initiate
  const handleInitiate = async () => {
    if (!selectedApp) return;
    setError('');
    setStep('processing');
    setTimeLeft(TIMER_SECONDS);
    try {
      await api.post('/api/payments/initiate-upi', { orderId, upiApp: selectedApp });
    } catch {
      // ignore – we'll confirm in next step
    }
  };

  // Step 2: Simulate payment success (user clicks "I've Paid")
  const handleConfirm = useCallback(async () => {
    setStep('processing');
    setError('');
    try {
      const { data } = await api.post('/api/payments/confirm', {
        orderId,
        upiApp: selectedApp,
      });
      setTxnId(data.data.transactionId);
      setUpiRef(data.data.upiRef);
      setSplit(data.data.splitDetails);
      setStep('success');
      onSuccess && onSuccess(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Payment confirmation failed');
      setStep('failed');
    }
  }, [orderId, selectedApp, onSuccess]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-200 text-xs font-black uppercase tracking-widest mb-1">Secure UPI Payment</p>
              <p className="text-3xl font-black">₹{amount?.toFixed(0)}</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2 mt-3 text-blue-100 text-xs">
            <ShieldCheck className="w-4 h-4" />
            <span>256-bit encrypted · Simulated gateway</span>
          </div>
        </div>

        <div className="p-6">

          {/* ── Step: Select UPI App ── */}
          {step === 'select' && (
            <div className="space-y-4">
              <p className="text-sm font-black text-slate-700 uppercase tracking-widest">Choose Payment App</p>
              <div className="space-y-3">
                {UPI_APPS.map(app => (
                  <button
                    key={app.id}
                    onClick={() => setSelectedApp(app.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                      selectedApp === app.id
                        ? 'border-blue-600 bg-blue-50 shadow-md'
                        : 'border-slate-100 hover:border-blue-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl ${app.bg} flex items-center justify-center text-2xl shadow-sm`}>
                      {app.emoji}
                    </div>
                    <div className="text-left flex-1">
                      <p className={`font-black text-slate-800 ${selectedApp === app.id ? 'text-blue-700' : ''}`}>{app.label}</p>
                      <p className="text-xs text-slate-400">{app.desc}</p>
                    </div>
                    {selectedApp === app.id && <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />}
                  </button>
                ))}
              </div>

              <button
                onClick={handleInitiate}
                disabled={!selectedApp}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black shadow-lg shadow-blue-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-[1.02] mt-4"
              >
                Pay ₹{amount?.toFixed(0)} via {selectedApp || '...'}
              </button>
            </div>
          )}

          {/* ── Step: Processing / Awaiting ── */}
          {step === 'processing' && (
            <div className="text-center space-y-6 py-4">
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 rounded-full bg-blue-100 animate-ping opacity-40" />
                <div className="relative w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center shadow-xl shadow-blue-200">
                  <Smartphone className="w-10 h-10 text-white" />
                </div>
              </div>

              <div>
                <p className="text-xl font-black text-slate-900">Complete Payment on {selectedApp}</p>
                <p className="text-sm text-slate-500 mt-1">Open your {selectedApp} app and complete the ₹{amount?.toFixed(0)} payment</p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-center gap-3">
                <Clock className="w-5 h-5 text-orange-500" />
                <span className="font-black text-slate-700">Expires in <span className="text-orange-600">{formatTime(timeLeft)}</span></span>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleConfirm}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-black shadow-lg shadow-green-200 transition-all hover:scale-[1.02]"
                >
                  ✅ I've Completed Payment
                </button>
                <button
                  onClick={() => setStep('select')}
                  className="w-full text-slate-500 py-2 font-bold hover:text-slate-700 transition"
                >
                  ← Change Payment Method
                </button>
              </div>
            </div>
          )}

          {/* ── Step: Success ── */}
          {step === 'success' && (
            <div className="text-center space-y-5 py-4">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto shadow-lg shadow-green-100">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900">Payment Successful! 🎉</h3>
                <p className="text-slate-500 text-sm mt-1">Your order is confirmed and being processed.</p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 space-y-2 text-left text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Transaction ID</span>
                  <span className="font-black text-slate-800 text-xs">{txnId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">UPI Ref</span>
                  <span className="font-black text-slate-800 text-xs">{upiRef}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Via</span>
                  <span className="font-black text-blue-600">{selectedApp}</span>
                </div>
              </div>

              {split && (
                <div className="bg-blue-50 rounded-2xl p-4 space-y-2 text-sm border border-blue-100">
                  <p className="font-black text-blue-800 text-xs uppercase tracking-widest mb-3">Payment Split</p>
                  <div className="flex justify-between">
                    <span className="text-slate-600">🏪 Shopkeeper</span>
                    <span className="font-black text-slate-800">₹{split.shopkeeperAmount?.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">🛵 Delivery Partner</span>
                    <span className="font-black text-slate-800">₹{split.deliveryAmount?.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">⚙️ Platform (Admin)</span>
                    <span className="font-black text-slate-800">₹{split.adminAmount?.toFixed(0)}</span>
                  </div>
                </div>
              )}

              <button
                onClick={onClose}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-blue-700 transition"
              >
                Track My Order
              </button>
            </div>
          )}

          {/* ── Step: Failed ── */}
          {step === 'failed' && (
            <div className="text-center space-y-5 py-4">
              <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                <X className="w-10 h-10 text-red-500" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Payment Failed</h3>
                <p className="text-slate-500 text-sm mt-1">{error || 'The payment session expired or was unsuccessful.'}</p>
              </div>
              <button
                onClick={() => { setStep('select'); setTimeLeft(TIMER_SECONDS); setError(''); }}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-blue-700 transition"
              >
                Try Again
              </button>
              <button onClick={onClose} className="w-full text-slate-500 py-2 font-bold">
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
