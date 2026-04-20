import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { UserCheck, UserX, FileText, ExternalLink, ShieldAlert } from 'lucide-react';

const ManageDoctors = () => {
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingDoctors();
  }, []);

  const fetchPendingDoctors = async () => {
    try {
      const { data } = await axios.get('/api/admin/doctors/pending');
      setPendingDoctors(data);
    } catch (error) {
      toast.error('Failed to load pending doctors');
    } finally {
      setLoading(false);
    }
  };

  const approveDoctor = async (id) => {
    try {
      await axios.put(`/api/admin/doctors/${id}/verify`);
      toast.success('Doctor approved and verified!');
      fetchPendingDoctors();
    } catch (error) {
      toast.error('Approval failed');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Doctor Approvals</h1>
          <p className="text-slate-500">Verify certifications and approve new doctors.</p>
        </div>
        <div className="bg-amber-100 text-amber-700 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold border border-amber-200">
           <ShieldAlert className="w-4 h-4" />
           {pendingDoctors.length} Pending
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500">Loading pending requests...</div>
      ) : pendingDoctors.length === 0 ? (
        <div className="glass-card p-20 text-center space-y-4">
           <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <UserCheck className="w-10 h-10" />
           </div>
           <p className="text-xl font-bold text-slate-600">No pending approvals</p>
           <p className="text-slate-400">All doctors are currently verified.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {pendingDoctors.map(doc => (
            <div key={doc._id} className="glass-card p-8 flex flex-col md:flex-row gap-8 items-start">
               <div className="w-24 h-24 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 font-bold text-3xl">
                 {doc.name.charAt(0)}
               </div>
               
               <div className="flex-1 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{doc.name}</h3>
                      <p className="text-blue-600 font-bold text-sm">{doc.specialization} • {doc.experience} Years Exp.</p>
                      <p className="text-slate-500 text-sm mt-1">{doc.email} • {doc.phone}</p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => approveDoctor(doc._id)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-green-700 transition"
                      >
                        <UserCheck className="w-4 h-4" /> Approve
                      </button>
                      <button className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-red-100 transition">
                        <UserX className="w-4 h-4" /> Reject
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                     <div>
                       <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Courses & Qualifications</h4>
                       <ul className="space-y-2">
                         {doc.courses.map((c, i) => (
                           <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                             <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5"></div>
                             <span>{c.courseName} from {c.institutionName} ({c.year})</span>
                           </li>
                         ))}
                       </ul>
                     </div>
                     <div>
                       <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Certifications</h4>
                       <div className="flex flex-wrap gap-2">
                          {doc.certifications.length > 0 ? doc.certifications.map((cert, i) => (
                            <a href={cert} target="_blank" rel="noreferrer" key={i} className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 flex items-center gap-2 hover:border-blue-300 transition">
                               <FileText className="w-3 h-3 text-blue-500" /> Certificate {i+1} <ExternalLink className="w-3 h-3" />
                            </a>
                          )) : <p className="text-xs text-slate-400 italic">No certificates uploaded</p>}
                       </div>
                     </div>
                  </div>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageDoctors;
