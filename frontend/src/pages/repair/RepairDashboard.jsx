import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Wrench, MapPin, Clock, CheckCircle2, Navigation, 
  Loader2, Phone, RefreshCw, IndianRupee, AlertCircle, Sparkles
} from 'lucide-react';

const STATUS_COLOR = {
  Pending:           'bg-yellow-100 text-yellow-800 border-yellow-200',
  Accepted:          'bg-blue-100 text-blue-800 border-blue-200',
  'In Progress':     'bg-indigo-100 text-indigo-800 border-indigo-200',
  Completed:         'bg-green-100 text-green-800 border-green-200',
  Cancelled:         'bg-red-100 text-red-800 border-red-200',
};

const RepairDashboard = () => {
  const { user, api, login } = useContext(AuthContext);
  const [nearbyRequests, setNearbyRequests] = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  const [loadingNearby, setLoadingNearby] = useState(true);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [updatingLocation, setUpdatingLocation] = useState(false);
  const [acceptingId, setAcceptingId] = useState(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);
  
  // Modal/form state for completion cost
  const [completionCost, setCompletionCost] = useState('');
  const [completingJobId, setCompletingJobId] = useState(null);

  const [activeTab, setActiveTab] = useState('nearby');

  const fetchNearby = async () => {
    if (!user?.shopLocation?.latitude) {
      setLoadingNearby(false);
      return;
    }
    setLoadingNearby(true);
    try {
      const { data } = await api.get('/api/repair/nearby');
      setNearbyRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load nearby requests');
    } finally {
      setLoadingNearby(false);
    }
  };

  const fetchMyJobs = async () => {
    setLoadingJobs(true);
    try {
      const { data } = await api.get('/api/repair/my-jobs');
      setMyJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load your jobs');
    } finally {
      setLoadingJobs(false);
    }
  };

  const refreshDashboard = () => {
    fetchNearby();
    fetchMyJobs();
  };

  useEffect(() => {
    refreshDashboard();
  }, [user?.shopLocation?.latitude]);

  // Capture GPS Location & update profile
  const handleSetLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    setUpdatingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const payload = {
            shopLocation: {
              address: 'Repair Expert Base (GPS Captured)',
              latitude,
              longitude
            }
          };
          const { data } = await api.put('/api/auth/profile', payload);
          login(data); // update context user
          toast.success('Your live location has been updated successfully! 📍');
        } catch (err) {
          toast.error(err.response?.data?.message || 'Failed to update location');
        } finally {
          setUpdatingLocation(false);
        }
      },
      (err) => {
        toast.error('Location capture failed: ' + err.message);
        setUpdatingLocation(false);
      },
      { enableHighAccuracy: true }
    );
  };

  // Accept a pending job
  const handleAcceptJob = async (id) => {
    setAcceptingId(id);
    try {
      await api.put(`/api/repair/requests/${id}/accept`);
      toast.success('Repair Request Accepted! 🛠️');
      refreshDashboard();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept job');
    } finally {
      setAcceptingId(null);
    }
  };

  // Update status (e.g. In Progress)
  const handleUpdateStatus = async (id, status) => {
    setStatusUpdatingId(id);
    try {
      await api.put(`/api/repair/requests/${id}/status`, { status });
      toast.success(`Job marked as ${status}!`);
      refreshDashboard();
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setStatusUpdatingId(null);
    }
  };

  // Complete job with cost
  const handleCompleteJobSubmit = async (e) => {
    e.preventDefault();
    if (!completionCost || isNaN(completionCost)) {
      toast.error('Please enter a valid cost amount');
      return;
    }
    setStatusUpdatingId(completingJobId);
    try {
      await api.put(`/api/repair/requests/${completingJobId}/status`, { 
        status: 'Completed',
        finalCost: Number(completionCost)
      });
      toast.success('Repair job completed successfully! 🎉');
      setCompletingJobId(null);
      setCompletionCost('');
      refreshDashboard();
    } catch (err) {
      toast.error('Failed to complete job');
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const activeJobs = myJobs.filter(job => ['Accepted', 'In Progress'].includes(job.status));
  const completedJobs = myJobs.filter(job => job.status === 'Completed');

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 px-4">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-orange-600 to-amber-500 rounded-[32px] p-8 text-white shadow-2xl shadow-orange-100 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
          <div>
            <p className="text-orange-100 text-xs font-black uppercase tracking-widest mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Repair Expert Partner
            </p>
            <h1 className="text-3xl font-black">Welcome back, {user?.name}! 🔧</h1>
            <p className="text-orange-50 mt-1 text-sm">
              {user?.shopLocation?.latitude ? (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-orange-200" /> GPS Locked: {user.shopLocation.latitude.toFixed(4)}, {user.shopLocation.longitude.toFixed(4)}
                </span>
              ) : (
                <span className="text-amber-200 font-bold flex items-center gap-1 animate-pulse">
                  <AlertCircle className="w-4 h-4" /> Location not set. Share GPS location to view jobs.
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleSetLocation} 
              disabled={updatingLocation}
              className="bg-white/20 hover:bg-white/30 text-white font-bold text-xs uppercase px-4 py-3 rounded-xl flex items-center gap-1.5 transition disabled:opacity-60"
            >
              {updatingLocation ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
              {user?.shopLocation?.latitude ? 'Update GPS' : 'Share GPS Location'}
            </button>
            <button 
              onClick={refreshDashboard} 
              className="p-3 bg-white/20 rounded-xl hover:bg-white/30 transition text-white"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Board */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Available Jobs', value: nearbyRequests.length, color: 'bg-yellow-50 border-yellow-100 text-yellow-900' },
          { label: 'Active Tasks', value: activeJobs.length, color: 'bg-blue-50 border-blue-100 text-blue-900' },
          { label: 'Completed Jobs', value: completedJobs.length, color: 'bg-green-50 border-green-100 text-green-900' }
        ].map(s => (
          <div key={s.label} className={`${s.color} rounded-2xl border p-5 text-center`}>
            <p className="text-3xl font-black">{s.value}</p>
            <p className="text-xs font-black uppercase tracking-widest opacity-60 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-100 pb-2">
        {[
          { id: 'nearby', label: 'Nearby Broadcasts', count: nearbyRequests.length },
          { id: 'active', label: 'My Active Tasks', count: activeJobs.length },
          { id: 'history', label: 'History', count: completedJobs.length }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-5 py-2.5 rounded-xl font-black text-sm transition flex items-center gap-2 ${
              activeTab === t.id 
                ? 'bg-orange-600 text-white shadow-lg shadow-orange-100' 
                : 'bg-white border border-slate-200 text-slate-600 hover:border-orange-300'
            }`}
          >
            {t.label}
            <span className={`text-xs px-2 py-0.5 rounded-full font-black ${activeTab === t.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Content Panels */}
      {!user?.shopLocation?.latitude ? (
        <div className="bg-white rounded-[32px] border-2 border-dashed border-slate-200 p-16 text-center shadow-sm">
          <MapPin className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-black text-slate-700">GPS Location Required</h3>
          <p className="text-slate-500 mt-2 max-w-sm mx-auto text-sm">
            Please click "Share GPS Location" in the header to set your working base. We need this to match you with nearby repair requests.
          </p>
          <button 
            onClick={handleSetLocation} 
            disabled={updatingLocation}
            className="mt-6 bg-orange-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-700 transition flex items-center gap-2 mx-auto"
          >
            {updatingLocation ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : <Navigation className="w-4.5 h-4.5" />}
            Share Location Now
          </button>
        </div>
      ) : activeTab === 'nearby' ? (
        loadingNearby ? (
          <div className="flex justify-center py-16"><Loader2 className="w-10 h-10 text-orange-600 animate-spin" /></div>
        ) : nearbyRequests.length === 0 ? (
          <div className="bg-white rounded-[32px] border border-slate-100 p-16 text-center shadow-sm">
            <Wrench className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-xl font-black text-slate-400">No pending requests nearby</p>
            <p className="text-sm text-slate-400 mt-1">We'll alert you as soon as someone reports a fault!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {nearbyRequests.map(req => (
              <div key={req._id} className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700 mb-2">
                      {req.category}
                    </span>
                    <h3 className="text-lg font-black text-slate-900">{req.issueTitle || 'Unnamed Issue'}</h3>
                    <p className="text-slate-500 text-sm mt-1">{req.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-orange-600">~{req.distance} km</p>
                    <p className="text-xs text-slate-400 mt-0.5">away from you</p>
                  </div>
                </div>

                <div className="border-t border-slate-50 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="text-xs text-slate-500 space-y-0.5">
                    <p><strong>Customer:</strong> {req.customer?.name || 'Farmer'}</p>
                    {req.customer?.phone && <p><strong>Phone:</strong> {req.customer.phone}</p>}
                  </div>
                  <button
                    onClick={() => handleAcceptJob(req._id)}
                    disabled={acceptingId === req._id}
                    className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition flex items-center gap-2 shadow-lg shadow-orange-100 disabled:opacity-60"
                  >
                    {acceptingId === req._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wrench className="w-4 h-4" />}
                    Accept Job
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : activeTab === 'active' ? (
        loadingJobs ? (
          <div className="flex justify-center py-16"><Loader2 className="w-10 h-10 text-orange-600 animate-spin" /></div>
        ) : activeJobs.length === 0 ? (
          <div className="bg-white rounded-[32px] border border-slate-100 p-16 text-center shadow-sm">
            <Clock className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-xl font-black text-slate-400">No active repair tasks</p>
            <p className="text-sm text-slate-400 mt-1">Accept a job in the nearby tab to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeJobs.map(job => (
              <div key={job._id} className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${STATUS_COLOR[job.status] || 'bg-slate-100'} mb-2`}>
                      {job.status}
                    </span>
                    <h3 className="text-lg font-black text-slate-900">{job.issueTitle}</h3>
                    <p className="text-slate-500 text-sm mt-1">{job.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-600">{job.category}</p>
                    <p className="text-xs text-slate-400 mt-1">Accepted: {new Date(job.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="text-sm">
                    <p className="font-bold text-slate-800">{job.customer?.name}</p>
                    <p className="text-xs text-slate-500">{job.location?.address || 'Customer Location'}</p>
                  </div>
                  {job.customer?.phone && (
                    <a
                      href={`tel:${job.customer.phone}`}
                      className="flex items-center gap-1.5 bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-orange-700 transition"
                    >
                      <Phone className="w-4 h-4" /> Call Client
                    </a>
                  )}
                </div>

                {/* Actions */}
                <div className="border-t border-slate-50 pt-4 flex gap-2 justify-end">
                  {job.status === 'Accepted' && (
                    <button
                      onClick={() => handleUpdateStatus(job._id, 'In Progress')}
                      disabled={statusUpdatingId === job._id}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase px-5 py-2.5 rounded-xl transition"
                    >
                      Start Repair
                    </button>
                  )}
                  <button
                    onClick={() => setCompletingJobId(job._id)}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs uppercase px-5 py-2.5 rounded-xl transition"
                  >
                    Mark as Completed
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        loadingJobs ? (
          <div className="flex justify-center py-16"><Loader2 className="w-10 h-10 text-orange-600 animate-spin" /></div>
        ) : completedJobs.length === 0 ? (
          <div className="bg-white rounded-[32px] border border-slate-100 p-16 text-center shadow-sm">
            <CheckCircle2 className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-xl font-black text-slate-400">No completed jobs yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {completedJobs.map(job => (
              <div key={job._id} className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 mb-2">
                    Completed
                  </span>
                  <h3 className="text-base font-bold text-slate-900">{job.issueTitle}</h3>
                  <p className="text-xs text-slate-500 mt-1">Client: {job.customer?.name} · Category: {job.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-slate-900 flex items-center gap-0.5 justify-end">
                    <IndianRupee className="w-5 h-5 text-green-600" /> {job.finalCost || 0}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">Final Service Cost</p>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Completion Dialog/Modal */}
      {completingJobId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-slate-100 space-y-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <IndianRupee className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-slate-900">Enter Service Charges</h3>
              <p className="text-slate-500 text-sm mt-1">Specify the final cost charged to the customer for completing this repair.</p>
            </div>
            
            <form onSubmit={handleCompleteJobSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-600 text-xs font-bold uppercase tracking-wider mb-2">Total Amount (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 750"
                  value={completionCost}
                  onChange={(e) => setCompletionCost(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-green-500"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setCompletingJobId(null); setCompletionCost(''); }}
                  className="flex-1 px-4 py-3 border border-slate-200 rounded-2xl text-slate-600 font-bold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={statusUpdatingId === completingJobId}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl py-3 transition flex items-center justify-center gap-1"
                >
                  {statusUpdatingId === completingJobId ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Submit & Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RepairDashboard;
