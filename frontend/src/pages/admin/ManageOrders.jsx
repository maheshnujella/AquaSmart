import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Loader2, ShoppingBag } from 'lucide-react';

const STATUSES = ['Pending','Accepted','Processing','Out for Delivery','Delivered','Cancelled','Refunded'];

const STATUS_COLORS = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Accepted: 'bg-blue-100 text-blue-700',
  Processing: 'bg-indigo-100 text-indigo-700',
  'Out for Delivery': 'bg-purple-100 text-purple-700',
  Delivered: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-600',
  Refunded: 'bg-slate-100 text-slate-600',
};

const ManageOrders = () => {
  const { api } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/admin/orders');
      setOrders(res.data || []);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (orderId, status) => {
    try {
      setUpdating(orderId);
      await api.put(`/api/admin/orders/${orderId}/status`, { status });
      toast.success(`Status updated to "${status}"`);
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status } : o));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-900">Order Management</h2>
        <p className="text-slate-500 text-sm mt-1">View all orders and update their status</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-blue-500 w-8 h-8"/></div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-16 text-center">
          <ShoppingBag className="w-12 h-12 text-slate-200 mx-auto mb-4"/>
          <p className="text-slate-500 font-bold">No orders found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {['Order ID','Customer','Type','Amount','Current Status','Update Status'].map(h => (
                    <th key={h} className="text-left px-5 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {orders.map(o => (
                  <tr key={o._id} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-4 font-mono text-xs text-slate-500">{o._id.slice(-8).toUpperCase()}</td>
                    <td className="px-5 py-4 font-bold text-slate-900">{o.user?.name || '—'}</td>
                    <td className="px-5 py-4 text-slate-600">{o.orderType}</td>
                    <td className="px-5 py-4 font-bold text-green-700">₹{o.pricing?.totalAmount ?? '—'}</td>
                    <td className="px-5 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[o.status] || 'bg-slate-100 text-slate-600'}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <select
                          defaultValue={o.status}
                          onChange={e => updateStatus(o._id, e.target.value)}
                          disabled={updating === o._id}
                          className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
                        >
                          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        {updating === o._id && <Loader2 size={14} className="animate-spin text-blue-500"/>}
                      </div>
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

export default ManageOrders;
