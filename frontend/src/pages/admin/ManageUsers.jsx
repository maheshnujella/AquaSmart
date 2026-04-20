import { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, User, Truck, Stethoscope, Trash2, Loader2, Search, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const ROLE_STYLES = {
  Admin:      'bg-red-100 text-red-700',
  Customer:   'bg-blue-100 text-blue-700',
  Shopkeeper: 'bg-purple-100 text-purple-700',
  Doctor:     'bg-green-100 text-green-700',
  Delivery:   'bg-amber-100 text-amber-700',
};

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/admin/users');
      setUsers(data);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await axios.delete(`/api/admin/users/${id}`);
      setUsers(prev => prev.filter(u => u._id !== id));
      toast.success('User deleted successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(null);
    }
  };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-2xl font-black text-slate-800">
          All Users <span className="text-blue-600">({users.length})</span>
        </h3>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-72 pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <button onClick={fetchUsers} className="p-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-500 transition">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400 font-medium">
          {search ? 'No users found matching your search.' : 'No users registered yet.'}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {['Name', 'Contact', 'Role', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(user => (
                  <tr key={user._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center font-black text-blue-600 text-sm">
                          {user.name?.[0]?.toUpperCase()}
                        </div>
                        <span className="font-bold text-slate-900">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <div>{user.email || '—'}</div>
                      <div className="text-slate-400">{user.phone || ''}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black ${ROLE_STYLES[user.role] || 'bg-slate-100 text-slate-600'}`}>
                        {user.role === 'Admin' && <Shield className="w-3 h-3" />}
                        {user.role === 'Delivery' && <Truck className="w-3 h-3" />}
                        {user.role === 'Doctor' && <Stethoscope className="w-3 h-3" />}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(user.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      {user.role !== 'Admin' && (
                        <button
                          onClick={() => handleDelete(user._id, user.name)}
                          disabled={deleting === user._id}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete user"
                        >
                          {deleting === user._id
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <Trash2 className="w-4 h-4" />
                          }
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
