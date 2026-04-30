import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import {
  IndianRupee, CreditCard, Store, Truck, ShieldCheck,
  RefreshCw, Loader2, TrendingUp, Smartphone
} from 'lucide-react';

const UPI_ICONS = { PhonePe: '💜', GPay: '🔵', Paytm: '🩵', Other: '💳' };
const STATUS_COLOR = {
  Success:  'bg-green-100 text-green-700',
  Pending:  'bg-yellow-100 text-yellow-700',
  Failed:   'bg-red-100 text-red-700',
  Refunded: 'bg-slate-100 text-slate-600',
  Initiated:'bg-blue-100 text-blue-700',
};

const StatCard = ({ label, value, icon: Icon, color, sub }) => (
  <div className={`${color} rounded-2xl p-6 border shadow-sm`}>
    <div className="flex justify-between items-start mb-3">
      <p className="text-xs font-black uppercase tracking-widest opacity-70">{label}</p>
      <Icon className="w-5 h-5 opacity-60" />
    </div>
    <p className="text-3xl font-black">₹{Number(value || 0).toFixed(0)}</p>
    {sub && <p className="text-xs opacity-60 mt-2">{sub}</p>}
  </div>
);

const ManagePayments = () => {
  const { api } = useContext(AuthContext);
  const [payments, setPayments] = useState([]);
  const [stats, setStats]       = useState({});
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('all'); // all | PhonePe | GPay | Paytm

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/admin/payments');
      setPayments(data.data || []);
      setStats(data.stats || {});
    } catch {
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPayments(); }, []);

  const filtered = filter === 'all' ? payments : payments.filter(p => p.upiApp === filter);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900">Payment Management</h2>
          <p className="text-slate-500 text-sm mt-1">All UPI transactions and split settlements</p>
        </div>
        <button onClick={fetchPayments} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard label="Total Revenue"       value={stats.totalRevenue}       icon={TrendingUp}   color="bg-blue-50 border-blue-100 text-blue-900"    sub="All successful payments" />
        <StatCard label="Admin Commission"    value={stats.adminCommission}    icon={ShieldCheck}  color="bg-purple-50 border-purple-100 text-purple-900" sub="Platform + handling fees" />
        <StatCard label="Shopkeeper Payouts"  value={stats.shopkeeperPayouts}  icon={Store}        color="bg-green-50 border-green-100 text-green-900"  sub="Product amounts" />
        <StatCard label="Delivery Payouts"    value={stats.deliveryPayouts}    icon={Truck}        color="bg-orange-50 border-orange-100 text-orange-900" sub="Delivery charges" />
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        {['all', 'PhonePe', 'GPay', 'Paytm', 'Other'].map(f => (
          <button
            key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
              filter === f ? 'bg-blue-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300'
            }`}
          >
            {f === 'all' ? 'All Payments' : `${UPI_ICONS[f]} ${f}`}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-bold">No payments found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['Transaction ID', 'Customer', 'Amount', 'Via', 'Split: Shopkeeper', 'Split: Delivery', 'Split: Admin', 'Status', 'Date'].map(h => (
                    <th key={h} className="px-5 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(p => (
                  <tr key={p._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 font-mono text-xs text-slate-600 whitespace-nowrap">{p.transactionId}</td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-800">{p.user?.name || '—'}</p>
                      <p className="text-xs text-slate-400">{p.user?.phone || p.user?.email || ''}</p>
                    </td>
                    <td className="px-5 py-4 font-black text-slate-900">₹{p.amount?.toFixed(0)}</td>
                    <td className="px-5 py-4 font-bold">
                      <span className="flex items-center gap-1">
                        {UPI_ICONS[p.upiApp] || '💳'} {p.upiApp || '—'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-green-700 font-bold">₹{p.splitDetails?.shopkeeperAmount?.toFixed(0) || '—'}</td>
                    <td className="px-5 py-4 text-orange-700 font-bold">₹{p.splitDetails?.deliveryAmount?.toFixed(0) || '—'}</td>
                    <td className="px-5 py-4 text-purple-700 font-bold">₹{p.splitDetails?.adminAmount?.toFixed(0) || '—'}</td>
                    <td className="px-5 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_COLOR[p.status] || 'bg-slate-100 text-slate-600'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-400 text-xs whitespace-nowrap">
                      {new Date(p.createdAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagePayments;
