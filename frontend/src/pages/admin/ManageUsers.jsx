import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Shield, Store, Truck, Stethoscope, User, Trash2, Loader2, Search, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const ROLE_STYLES = {
  Admin:      { chip: 'bg-red-100 text-red-700',    icon: Shield },
  Customer:   { chip: 'bg-blue-100 text-blue-700',  icon: User },
  Shopkeeper: { chip: 'bg-purple-100 text-purple-700', icon: Store },
  Doctor:     { chip: 'bg-green-100 text-green-700', icon: Stethoscope },
  Delivery:   { chip: 'bg-amber-100 text-amber-700', icon: Truck },
};

const ROLE_TABS = ['All', 'Customer', 'Shopkeeper', 'Delivery', 'Doctor', 'Admin'];

const ManageUsers = () => {
  const { api } = useContext(AuthContext);
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [deleting, setDeleting]     = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/admin/users');
      setUsers(data);
    } catch { toast.error('Failed to load users'); }
    finally  { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await api.delete(`/api/admin/users/${id}`);
      setUsers(prev => prev.filter(u => u._id !== id));
      toast.success('User deleted successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally { setDeleting(null); }
  };

  // Role counts
  const roleCounts = ROLE_TABS.reduce((acc, r) => {
    acc[r] = r === 'All' ? users.length : users.filter(u => u.role === r).length;
    return acc;
  }, {});

  const filtered = users.filter(u => {
    const matchRole   = roleFilter === 'All' || u.role === roleFilter;
    const matchSearch = !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()) || u.phone?.includes(search);
    return matchRole && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">User Management</h2>
          <p className="text-slate-500 text-sm mt-1">{users.length} total users across all roles</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text" placeholder="Search users..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <button onClick={fetchUsers} className="p-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-500 transition">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Role filter tabs */}
      <div className="flex flex-wrap gap-2">
        {ROLE_TABS.map(role => {
          const meta = ROLE_STYLES[role];
          const Icon = meta?.icon;
          return (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition ${
                roleFilter === role
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300'
              }`}
            >
              {Icon && <Icon className="w-3.5 h-3.5" />}
              {role}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-black ${roleFilter === role ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {roleCounts[role]}
              </span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400 font-medium">
          {search ? 'No users matching your search.' : `No ${roleFilter === 'All' ? '' : roleFilter} users found.`}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {['Name', 'Contact', 'Role', 'Details', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(user => {
                  const meta = ROLE_STYLES[user.role] || { chip: 'bg-slate-100 text-slate-600', icon: User };
                  const Icon = meta.icon;
                  return (
                    <tr key={user._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center font-black text-blue-600 text-sm flex-shrink-0">
                            {user.name?.[0]?.toUpperCase()}
                          </div>
                          <span className="font-bold text-slate-900 whitespace-nowrap">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        <div>{user.email || '—'}</div>
                        <div className="text-slate-400">{user.phone || ''}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black ${meta.chip}`}>
                          <Icon className="w-3 h-3" /> {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 max-w-[200px]">
                        {user.role === 'Shopkeeper' && user.shopName && (
                          <span className="flex items-center gap-1"><Store className="w-3.5 h-3.5 text-purple-500" />{user.shopName}</span>
                        )}
                        {user.role === 'Delivery' && (
                          <span className="flex items-center gap-1">
                            <Truck className="w-3.5 h-3.5 text-amber-500" />
                            {user.deliveryProfile?.vehicleType || user.vehicleType || '—'}
                            {user.deliveryProfile?.vehicleNumber && ` · ${user.deliveryProfile.vehicleNumber}`}
                          </span>
                        )}
                        {user.role === 'Customer' && user.cultureType && (
                          <span>{user.cultureType} culture</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">
                        {new Date(user.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4">
                        {user.role !== 'Admin' && (
                          <button
                            onClick={() => handleDelete(user._id, user.name)}
                            disabled={deleting === user._id}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          >
                            {deleting === user._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
