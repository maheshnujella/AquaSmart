import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  History, ShieldCheck, User, MapPin, 
  Terminal, Filter, Search, Clock 
} from 'lucide-react';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const { data } = await axios.get('/api/admin/logs'); // Need to implement this route
      setLogs(data);
    } catch (error) {
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getActionColor = (action) => {
    if (action.includes('DELETE')) return 'bg-red-100 text-red-600';
    if (action.includes('APPROVE') || action.includes('VERIFY')) return 'bg-green-100 text-green-600';
    if (action.includes('UPDATE')) return 'bg-blue-100 text-blue-600';
    return 'bg-slate-100 text-slate-600';
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 flex items-center gap-3">
            <History className="w-10 h-10 text-blue-600" /> System Audit Logs
          </h1>
          <p className="text-slate-500 font-medium mt-1">Real-time tracking of all administrative actions and critical events.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search actions..." 
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm transition-all">
            <Filter className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </div>

      <div className="glass-card overflow-hidden bg-white/90">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">User</th>
                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Action</th>
                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Details</th>
                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Device Info</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan="5" className="p-20 text-center text-slate-400 font-bold">Fetching logs...</td></tr>
              ) : filteredLogs.length === 0 ? (
                <tr><td colSpan="5" className="p-20 text-center text-slate-400 font-bold">No activity logs found</td></tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900">
                          {new Date(log.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-tighter flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {new Date(log.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-black text-xs">
                           {log.user?.name?.charAt(0) || 'S'}
                         </div>
                         <div className="flex flex-col">
                           <span className="text-sm font-bold text-slate-900">{log.user?.name || 'System'}</span>
                           <span className="text-[10px] text-slate-400 font-bold">{log.user?.role || 'AUTO'}</span>
                         </div>
                      </div>
                    </td>
                    <td className="p-6">
                       <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${getActionColor(log.action)}`}>
                         {log.action}
                       </span>
                    </td>
                    <td className="p-6">
                       <p className="text-sm text-slate-600 font-medium max-w-md line-clamp-2 italic">
                         “{log.details}”
                       </p>
                    </td>
                    <td className="p-6">
                       <div className="flex flex-col gap-1">
                         <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold">
                           <MapPin className="w-3 h-3" /> {log.ip || 'Local'}
                         </div>
                         <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium truncate max-w-[150px]">
                           <Terminal className="w-3 h-3" /> {log.userAgent || 'Server Side'}
                         </div>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
           <div className="text-xs text-slate-400 font-bold uppercase tracking-widest">
             Showing {filteredLogs.length} of {logs.length} entries
           </div>
           <div className="flex gap-2">
             <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 shadow-sm transition-all">Previous</button>
             <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 shadow-sm transition-all">Next</button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
