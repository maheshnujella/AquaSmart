import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AuthContext } from '../../context/AuthContext';
import { 
  ClipboardList, CheckCircle2, XCircle, Clock, 
  MapPin, User, FileText, Send, Camera
} from 'lucide-react';

const DoctorDashboard = () => {
  const { user } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [reportText, setReportText] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      // In a real app, this endpoint would filter by req.user._id on backend
      const { data } = await axios.get('/api/doctors/requests'); // Need to implement this route
      setRequests(data);
    } catch (error) {
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`/api/doctors/requests/${id}/status`, { status });
      toast.success(`Request ${status}`);
      fetchRequests();
    } catch (error) {
      toast.error('Status update failed');
    }
  };

  const submitReport = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/doctors/requests/${selectedRequest._id}/report`, {
        content: reportText,
        file: 'sample_report.pdf' // Simulated file
      });
      toast.success('Report submitted successfully!');
      setSelectedRequest(null);
      setReportText('');
      fetchRequests();
    } catch (error) {
      toast.error('Report submission failed');
    }
  };

  if (!user || user.role !== 'Doctor') return <div className="p-20 text-center">Unauthorized</div>;

  return (
    <div className="space-y-10 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Doctor Dashboard</h1>
          <p className="text-slate-500 font-medium">Welcome back, Dr. {user.name}</p>
        </div>
        {!user.isVerified && (
          <div className="bg-red-50 text-red-600 px-4 py-2 rounded-xl border border-red-100 flex items-center gap-2 text-sm font-bold">
            <Clock className="w-4 h-4" /> Account Verification Pending
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Requests List */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-blue-600" /> Consultation Requests
          </h2>
          
          {loading ? <div>Loading...</div> : requests.length === 0 ? (
            <div className="glass-card p-12 text-center text-slate-400">No requests found</div>
          ) : (
            <div className="space-y-4">
              {requests.map(req => (
                <div key={req._id} className={`glass-card p-6 border-l-8 ${
                  req.status === 'Pending' ? 'border-amber-400' : 
                  req.status === 'Accepted' ? 'border-blue-400' : 
                  req.status === 'Completed' ? 'border-green-400' : 'border-slate-200'
                }`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-blue-100 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter">
                          {req.serviceType}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${
                          req.status === 'Pending' ? 'bg-amber-100 text-amber-600' : 
                          req.status === 'Accepted' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                        }`}>
                          {req.status}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">{req.customer.name}</h3>
                      <p className="text-sm text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {req.location.address || 'Location Shared'} ({req.distance} km)
                      </p>
                    </div>
                    <div className="text-right">
                       <p className="text-xl font-black text-slate-900">₹{req.totalCost}</p>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Consultation Fee</p>
                    </div>
                  </div>

                  <p className="text-slate-600 text-sm mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    "{req.description}"
                  </p>

                  <div className="flex gap-2">
                    {req.status === 'Pending' && (
                      <>
                        <button onClick={() => updateStatus(req._id, 'Accepted')} className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-blue-700 transition">Accept Request</button>
                        <button onClick={() => updateStatus(req._id, 'Cancelled')} className="flex-1 bg-slate-100 text-slate-600 py-2 rounded-lg font-bold text-sm hover:bg-slate-200 transition">Decline</button>
                      </>
                    )}
                    {req.status === 'Accepted' && (
                      <button onClick={() => setSelectedRequest(req)} className="flex-1 bg-green-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-green-700 transition flex items-center justify-center gap-2">
                        <FileText className="w-4 h-4" /> Upload Report & Complete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Report Section */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-800">Submit Report</h2>
          {selectedRequest ? (
            <div className="glass-card p-8 bg-blue-600 text-white space-y-6 animate-scale-in">
              <div className="flex items-center gap-4 border-b border-white/20 pb-4">
                 <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <User className="w-6 h-6" />
                 </div>
                 <div>
                    <p className="text-xs text-white/70 font-bold uppercase tracking-widest">Reporting For</p>
                    <p className="text-lg font-bold">{selectedRequest.customer.name}</p>
                 </div>
              </div>

              <form onSubmit={submitReport} className="space-y-4 text-slate-900">
                 <textarea 
                   className="w-full rounded-xl p-4 text-sm min-h-[200px] outline-none focus:ring-4 focus:ring-white/20" 
                   placeholder="Enter your diagnosis, testing results, and recommendations..."
                   value={reportText}
                   onChange={(e) => setReportText(e.target.value)}
                   required
                 ></textarea>
                 
                 <div className="flex items-center justify-center border-2 border-dashed border-white/30 rounded-xl p-6 bg-white/10 text-white cursor-pointer hover:bg-white/20 transition-all">
                    <div className="text-center">
                       <Camera className="w-6 h-6 mx-auto mb-1" />
                       <p className="text-[10px] font-bold uppercase">Attach PDF Report</p>
                    </div>
                 </div>

                 <button type="submit" className="w-full bg-white text-blue-600 py-4 rounded-xl font-black uppercase tracking-widest text-sm shadow-xl hover:scale-105 transition-transform">
                    Submit Final Report
                 </button>
                 <button type="button" onClick={() => setSelectedRequest(null)} className="w-full bg-transparent text-white/70 py-2 text-xs font-bold">
                    Cancel
                 </button>
              </form>
            </div>
          ) : (
            <div className="glass-card p-12 text-center bg-slate-100 border-slate-200">
               <FileText className="w-10 h-10 text-slate-300 mx-auto mb-4" />
               <p className="text-sm text-slate-500 font-medium italic">Select an active request to begin reporting.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
