import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api';
import { 
  Wrench, MapPin, Navigation, Camera, 
  ArrowRight, ArrowLeft, CheckCircle2, ShieldCheck, Zap 
} from 'lucide-react';

const categories = [
  { id: 'Generator', name: 'Generator Repair', icon: '⚡' },
  { id: 'Fan sets', name: 'Fan Sets/Aerator', icon: '🌀' },
  { id: 'Electrical', name: 'Electrical Work', icon: '🔌' },
  { id: 'Other', name: 'Other Repairs', icon: '🛠️' }
];

const Repair = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    issueTitle: '',
    description: '',
    images: [],
    location: { latitude: null, longitude: null, address: '' }
  });

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const getLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFormData({
            ...formData,
            location: { 
              ...formData.location, 
              latitude: pos.coords.latitude, 
              longitude: pos.coords.longitude,
              address: 'Current Farm Location (GPS Locked)' 
            }
          });
          toast.success('Live Location Captured!');
          setLoading(false);
        },
        (err) => {
          toast.error('Location permission denied');
          setLoading(false);
        }
      );
    }
  };

  const submitRequest = async () => {
    try {
      await api.post('/api/repair/requests', formData);
      toast.success('Repair Request Broadcasted!');
      setStep(5);
    } catch (error) {
      toast.error('Failed to create request');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Step Indicator */}
      <div className="flex justify-between items-center mb-12 relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -z-10"></div>
        {[1, 2, 3, 4].map((s) => (
          <div 
            key={s} 
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all border-4 ${
              step >= s ? 'bg-orange-600 text-white border-orange-100 shadow-lg' : 'bg-white text-slate-400 border-slate-50'
            }`}
          >
            {step > s ? <CheckCircle2 className="w-6 h-6" /> : s}
          </div>
        ))}
      </div>

      <div className="glass-card p-10 bg-white/90 min-h-[500px] flex flex-col">
        {step === 1 && (
          <div className="space-y-8 animate-fade-in flex-1">
            <div className="text-center">
              <h2 className="text-3xl font-black text-slate-900">Repair Category</h2>
              <p className="text-slate-500 mt-2">What equipment needs servicing today?</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {categories.map(c => (
                <button
                  key={c.id}
                  onClick={() => { setFormData({...formData, category: c.id}); handleNext(); }}
                  className={`p-8 rounded-3xl border-2 text-left transition-all hover:scale-105 group ${
                    formData.category === c.id ? 'border-orange-600 bg-orange-50' : 'border-slate-100 bg-slate-50 hover:border-orange-200'
                  }`}
                >
                  <span className="text-4xl mb-4 block">{c.icon}</span>
                  <h3 className="font-bold text-slate-900 text-xl">{c.name}</h3>
                  <div className="mt-4 flex items-center gap-2 text-orange-600 font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    Select <ArrowRight className="w-4 h-4" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-fade-in flex-1">
             <div className="text-center">
              <h2 className="text-3xl font-black text-slate-900">Issue Details</h2>
              <p className="text-slate-500 mt-2">Describe the problem and attach photos.</p>
            </div>
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="Short title (e.g. Motor won't start)" 
                className="input-field text-lg"
                value={formData.issueTitle}
                onChange={(e) => setFormData({...formData, issueTitle: e.target.value})}
              />
              <textarea 
                className="input-field min-h-[150px] text-lg" 
                placeholder="Detailed description of the fault..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              ></textarea>
              <div className="flex items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl p-10 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                 <div className="text-center">
                   <Camera className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                   <p className="text-sm font-bold text-slate-500">Upload Fault Photos</p>
                 </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button onClick={handleBack} className="flex-1 px-6 py-4 border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50">Back</button>
                <button onClick={handleNext} disabled={!formData.issueTitle || !formData.description} className="flex-[2] btn-primary bg-orange-600 hover:bg-orange-700 shadow-orange-200 py-4 text-lg disabled:opacity-50">Continue</button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 animate-fade-in flex-1">
            <div className="text-center">
              <h2 className="text-3xl font-black text-slate-900">Service Location</h2>
              <p className="text-slate-500 mt-2">Technicians need your exact GPS location for fast arrival.</p>
            </div>
            <div className="bg-orange-50 rounded-[40px] p-16 text-center border-2 border-orange-100 relative overflow-hidden">
               <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-200/30 rounded-full blur-3xl"></div>
               <MapPin className="w-20 h-20 text-orange-600 mx-auto mb-6 animate-bounce" />
               <button 
                onClick={getLocation} 
                className="bg-orange-600 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-orange-200 hover:scale-105 transition-transform"
                disabled={loading}
               >
                 {loading ? 'Fetching GPS...' : 'Share Live Location'}
               </button>
               {formData.location.latitude && (
                 <div className="mt-8 p-4 bg-white rounded-2xl border border-orange-100 inline-flex items-center gap-3">
                   <Navigation className="w-5 h-5 text-orange-600" />
                   <p className="text-sm font-bold text-slate-700">GPS Locked: {formData.location.latitude.toFixed(4)}, {formData.location.longitude.toFixed(4)}</p>
                 </div>
               )}
            </div>
            <div className="flex gap-4">
              <button onClick={handleBack} className="flex-1 px-6 py-4 border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50">Back</button>
              <button onClick={handleNext} disabled={!formData.location.latitude} className="flex-[2] btn-primary bg-orange-600 hover:bg-orange-700 shadow-orange-200 py-4 text-lg">Next Step</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-8 animate-fade-in flex-1">
             <div className="text-center">
              <h2 className="text-3xl font-black text-slate-900">Review Request</h2>
              <p className="text-slate-500 mt-2">Your request will be broadcasted to nearby experts.</p>
            </div>
            <div className="space-y-6 bg-slate-50 p-8 rounded-[32px] border border-slate-100">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm">
                    {categories.find(c => c.id === formData.category)?.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{formData.issueTitle}</h4>
                    <p className="text-sm text-slate-500">{formData.category}</p>
                  </div>
               </div>
               <div className="flex items-start gap-3 text-sm text-slate-600">
                  <MapPin className="w-4 h-4 text-orange-600 mt-0.5" />
                  <p>{formData.location.address}</p>
               </div>
               <div className="p-4 bg-blue-50 text-blue-700 rounded-xl flex items-start gap-3 border border-blue-100">
                  <ShieldCheck className="w-5 h-5 mt-0.5" />
                  <p className="text-xs">Your exact location is only shared with the technician who accepts your request. Estimated cost will be provided after diagnosis.</p>
               </div>
            </div>
            <div className="flex gap-4">
              <button onClick={handleBack} className="flex-1 px-6 py-4 border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50">Back</button>
              <button onClick={submitRequest} className="flex-[2] btn-primary bg-orange-600 hover:bg-orange-700 shadow-orange-200 py-4 text-lg flex items-center justify-center gap-2">
                <Zap className="w-5 h-5" /> Broadcast Request
              </button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="text-center space-y-8 py-10 animate-scale-in flex-1 flex flex-col justify-center">
             <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                <CheckCircle2 className="w-16 h-16" />
             </div>
             <div>
               <h2 className="text-4xl font-black text-slate-900">Request Sent!</h2>
               <p className="text-xl text-slate-500 mt-2">Nearby technicians have been notified. You will get a call shortly.</p>
             </div>
             <button onClick={() => window.location.href = '/'} className="btn-primary bg-slate-900 text-white px-10 py-4 rounded-2xl mx-auto">
               Return to Home
             </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Repair;
