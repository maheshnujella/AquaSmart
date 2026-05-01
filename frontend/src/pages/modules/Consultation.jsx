import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  Stethoscope, ShieldCheck, MapPin, Camera, 
  ArrowRight, ArrowLeft, CheckCircle2, Info, Navigation
} from 'lucide-react';
import api from '../../api';

const services = [
  { id: 'Water Testing', name: 'Water Testing', desc: 'pH, Salinity, Ammonia & Nitrate testing', icon: '🧪' },
  { id: 'Soil Testing', name: 'Soil Testing', desc: 'Soil texture, pH & nutrient analysis', icon: '🌱' },
  { id: 'Field Visit', name: 'Field Visit', desc: 'Expert on-site farm inspection', icon: '🚜' }
];

const Consultation = () => {
  const [step, setStep] = useState(1);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    serviceType: '',
    description: '',
    images: [],
    location: { lat: null, lng: null, address: '' },
    doctorId: '',
    distance: 0
  });

  useEffect(() => {
    if (step === 4) fetchDoctors();
  }, [step]);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/doctors');
      setDoctors(data);
    } catch (error) {
      toast.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setFormData({
          ...formData,
          location: { ...formData.location, lat: pos.coords.latitude, lng: pos.coords.longitude },
          distance: Math.floor(Math.random() * 20) + 5 // Simulated distance for demo
        });
        toast.success('Location shared!');
      });
    }
  };

  const selectedDoctor = doctors.find(d => d._id === formData.doctorId);

  const calculateTotal = () => {
    if (!selectedDoctor) return 0;
    let base = 0;
    if (formData.serviceType === 'Water Testing') base = selectedDoctor.fees.waterTesting;
    else if (formData.serviceType === 'Soil Testing') base = selectedDoctor.fees.soilTesting;
    else if (formData.serviceType === 'Field Visit') base = selectedDoctor.fees.fieldVisitBase;

    return base + (formData.distance * selectedDoctor.fees.perKmCharge);
  };

  const submitBooking = async () => {
    try {
      const bookingData = {
        ...formData,
        baseCost: formData.serviceType === 'Water Testing' ? selectedDoctor.fees.waterTesting : (formData.serviceType === 'Soil Testing' ? selectedDoctor.fees.soilTesting : selectedDoctor.fees.fieldVisitBase),
        travelCost: formData.distance * selectedDoctor.fees.perKmCharge,
        totalCost: calculateTotal()
      };
      await api.post('/api/doctors/book', bookingData);
      toast.success('Consultation Request Sent!');
      setStep(6);
    } catch (error) {
      toast.error('Booking failed');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Progress Header */}
      <div className="flex justify-between items-center mb-12 relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -z-10"></div>
        {[1, 2, 3, 4, 5].map((s) => (
          <div 
            key={s} 
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all border-4 ${
              step >= s ? 'bg-blue-600 text-white border-blue-100 shadow-lg' : 'bg-white text-slate-400 border-slate-50'
            }`}
          >
            {step > s ? <CheckCircle2 className="w-6 h-6" /> : s}
          </div>
        ))}
      </div>

      <div className="glass-card p-10 bg-white/90">
        {step === 1 && (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-slate-900">Choose Service</h2>
              <p className="text-slate-500 mt-2">Select the type of consultation you need today.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {services.map(s => (
                <button
                  key={s.id}
                  onClick={() => { setFormData({...formData, serviceType: s.id}); handleNext(); }}
                  className={`p-6 rounded-2xl border-2 text-left transition-all hover:scale-105 ${
                    formData.serviceType === s.id ? 'border-blue-600 bg-blue-50 shadow-blue-100' : 'border-slate-100 bg-slate-50 hover:border-blue-200'
                  }`}
                >
                  <span className="text-4xl mb-4 block">{s.icon}</span>
                  <h3 className="font-bold text-slate-900 text-lg">{s.name}</h3>
                  <p className="text-sm text-slate-500 mt-2">{s.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-fade-in">
             <div className="text-center">
              <h2 className="text-3xl font-bold text-slate-900">Issue Details</h2>
              <p className="text-slate-500 mt-2">Describe the problem and upload photos of your farm/pond.</p>
            </div>
            <div className="space-y-6">
              <textarea 
                className="input-field min-h-[150px] text-lg" 
                placeholder="Briefly describe the water/soil condition or any disease symptoms..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              ></textarea>
              <div className="flex items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-10 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group">
                 <div className="text-center space-y-2">
                   <Camera className="w-10 h-10 text-slate-400 mx-auto group-hover:text-blue-500 group-hover:scale-110 transition-all" />
                   <p className="text-sm font-semibold text-slate-500">Upload Farm Images</p>
                 </div>
              </div>
              <div className="flex gap-4">
                <button onClick={handleBack} className="flex-1 px-6 py-4 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-2">
                  <ArrowLeft className="w-5 h-5" /> Back
                </button>
                <button 
                  onClick={handleNext} 
                  disabled={!formData.description}
                  className="flex-[2] btn-primary py-4 text-lg disabled:opacity-50"
                >
                  Next Step <ArrowRight className="w-5 h-5 inline ml-1" />
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-slate-900">Farm Location</h2>
              <p className="text-slate-500 mt-2">Share your farm location to find nearby expert doctors.</p>
            </div>
            <div className="bg-slate-100 rounded-3xl p-12 text-center border-2 border-slate-200">
               <MapPin className="w-16 h-16 text-blue-600 mx-auto mb-6 animate-bounce" />
               <button onClick={getLocation} className="btn-primary px-10">
                 <Navigation className="w-5 h-5 inline mr-2" /> Share Live Location
               </button>
               {formData.location.lat && (
                 <p className="mt-4 text-green-600 font-bold flex items-center justify-center gap-1">
                   <CheckCircle2 className="w-4 h-4" /> GPS Locked: {formData.location.lat.toFixed(4)}, {formData.location.lng.toFixed(4)}
                 </p>
               )}
            </div>
            <div className="flex gap-4">
              <button onClick={handleBack} className="flex-1 px-6 py-4 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-2">
                <ArrowLeft className="w-5 h-5" /> Back
              </button>
              <button onClick={handleNext} disabled={!formData.location.lat} className="flex-[2] btn-primary py-4 text-lg disabled:opacity-50">
                Find Nearby Doctors
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-8 animate-fade-in">
             <div className="text-center">
              <h2 className="text-3xl font-bold text-slate-900">Select Expert</h2>
              <p className="text-slate-500 mt-2">Verified doctors available near your location.</p>
            </div>
            {loading ? <div className="text-center py-10">Searching...</div> : (
              <div className="space-y-4">
                {doctors.map(doc => (
                  <button
                    key={doc._id}
                    onClick={() => { setFormData({...formData, doctorId: doc._id}); handleNext(); }}
                    className={`w-full p-6 rounded-2xl border-2 flex items-center gap-6 text-left transition-all ${
                      formData.doctorId === doc._id ? 'border-blue-600 bg-blue-50' : 'border-slate-100 hover:border-blue-200'
                    }`}
                  >
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-2xl border-2 border-white shadow-sm">
                      {doc.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 text-lg">{doc.name}</h3>
                      <p className="text-blue-600 font-semibold text-sm">{doc.specialization} • {doc.experience} Years Exp.</p>
                      <div className="flex gap-3 mt-2 text-xs text-slate-500">
                        <span className="bg-white px-2 py-1 rounded-md border border-slate-100">Base: ₹{formData.serviceType === 'Water Testing' ? doc.fees.waterTesting : (formData.serviceType === 'Soil Testing' ? doc.fees.soilTesting : doc.fees.fieldVisitBase)}</span>
                        <span className="bg-white px-2 py-1 rounded-md border border-slate-100">Travel: ₹{doc.fees.perKmCharge}/km</span>
                      </div>
                    </div>
                    <div className="text-right">
                       <p className="text-xs text-slate-400 font-medium">Distance</p>
                       <p className="text-lg font-bold text-slate-900">{formData.distance} km</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            <button onClick={handleBack} className="w-full px-6 py-4 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50">
               Back to Location
            </button>
          </div>
        )}

        {step === 5 && selectedDoctor && (
          <div className="space-y-8 animate-fade-in">
             <div className="text-center">
              <h2 className="text-3xl font-bold text-slate-900">Review & Confirm</h2>
              <p className="text-slate-500 mt-2">Please verify the details and final cost breakdown.</p>
            </div>
            <div className="space-y-4 bg-slate-50 p-8 rounded-3xl border border-slate-100">
              <div className="flex justify-between pb-4 border-b border-slate-200">
                <span className="text-slate-600 font-medium">Service</span>
                <span className="font-bold text-slate-900">{formData.serviceType}</span>
              </div>
              <div className="flex justify-between pb-4 border-b border-slate-200">
                <span className="text-slate-600 font-medium">Doctor</span>
                <span className="font-bold text-slate-900">{selectedDoctor.name}</span>
              </div>
              <div className="flex justify-between pb-4 border-b border-slate-200">
                <span className="text-slate-600 font-medium">Base Cost</span>
                <span className="font-bold text-slate-900">₹{formData.serviceType === 'Water Testing' ? selectedDoctor.fees.waterTesting : (formData.serviceType === 'Soil Testing' ? selectedDoctor.fees.soilTesting : selectedDoctor.fees.fieldVisitBase)}</span>
              </div>
              <div className="flex justify-between pb-4 border-b border-slate-200">
                <span className="text-slate-600 font-medium">Travel Cost ({formData.distance} km × ₹{selectedDoctor.fees.perKmCharge})</span>
                <span className="font-bold text-slate-900">₹{formData.distance * selectedDoctor.fees.perKmCharge}</span>
              </div>
              <div className="flex justify-between pt-4">
                <span className="text-xl font-bold text-slate-900">Total Consultation Fee</span>
                <span className="text-3xl font-black text-blue-600">₹{calculateTotal()}</span>
              </div>
            </div>
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-600 mt-1" />
              <p className="text-xs text-amber-800">Payment is currently required at the time of service (Cash/Online). Total amount includes GST and all handling charges.</p>
            </div>
            <div className="flex gap-4">
              <button onClick={handleBack} className="flex-1 px-6 py-4 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-2">
                <ArrowLeft className="w-5 h-5" /> Back
              </button>
              <button onClick={submitBooking} className="flex-[2] btn-primary py-4 text-xl shadow-blue-500/30">
                Confirm Booking
              </button>
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="text-center space-y-8 py-10 animate-scale-in">
             <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                <CheckCircle2 className="w-16 h-16" />
             </div>
             <div>
               <h2 className="text-4xl font-black text-slate-900">Request Sent!</h2>
               <p className="text-xl text-slate-500 mt-2">Dr. {selectedDoctor?.name} will review your request and get back to you shortly.</p>
             </div>
             <button onClick={() => window.location.href = '/'} className="btn-primary px-10">
               Back to Dashboard
             </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Consultation;
