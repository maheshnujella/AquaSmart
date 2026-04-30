import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Store, ShoppingBag, CheckCircle, Clock, Package,
  Loader2, RefreshCw, Phone, MapPin, IndianRupee, TrendingUp
} from 'lucide-react';

const STATUS_COLOR = {
  Pending:           'bg-yellow-100 text-yellow-800 border-yellow-200',
  Accepted:          'bg-blue-100 text-blue-800 border-blue-200',
  Processing:        'bg-indigo-100 text-indigo-800 border-indigo-200',
  'Out for Delivery':'bg-orange-100 text-orange-800 border-orange-200',
  Delivered:         'bg-green-100 text-green-800 border-green-200',
  Cancelled:         'bg-red-100 text-red-800 border-red-200',
};

const ShopkeeperDashboard = () => {
  const { user, api } = useContext(AuthContext);
  const [orders, setOrders]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [accepting, setAccepting] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Admin orders endpoint — shopkeeper sees all orders; filter by shop later
      const { data } = await api.get('/api/admin/orders');
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      // Fallback to myorders scoped to this user
      try {
        const { data } = await api.get('/api/orders/myorders');
        setOrders(Array.isArray(data) ? data : []);
      } catch {
        toast.error('Failed to load orders');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleAccept = async (orderId) => {
    setAccepting(orderId);
    try {
      await api.put(`/api/orders/${orderId}/accept`);
      toast.success('Order accepted! ✅');
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept order');
    } finally {
      setAccepting(null);
    }
  };

  // Stats
  const pendingOrders    = orders.filter(o => o.status === 'Pending');
  const acceptedOrders   = orders.filter(o => ['Accepted', 'Processing', 'Out for Delivery'].includes(o.status));
  const deliveredOrders  = orders.filter(o => o.status === 'Delivered');
  const totalEarnings    = deliveredOrders.reduce((s, o) => s + (o.pricing?.mrpTotal || 0), 0);

  const tabs = [
    { id: 'pending',   label: 'Pending Orders',  count: pendingOrders.length },
    { id: 'active',    label: 'Active Orders',    count: acceptedOrders.length },
    { id: 'delivered', label: 'Delivered',        count: deliveredOrders.length },
  ];

  const displayOrders = {
    pending:   pendingOrders,
    active:    acceptedOrders,
    delivered: deliveredOrders,
  }[activeTab] || [];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 px-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-[32px] p-8 text-white shadow-2xl shadow-purple-200">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-purple-200 text-xs font-black uppercase tracking-widest mb-2">Shopkeeper Dashboard</p>
            <h1 className="text-3xl font-black">Hello, {user?.name}! 🏪</h1>
            {user?.shopName && <p className="text-purple-100 mt-1">{user.shopName}</p>}
          </div>
          <button onClick={fetchOrders} className="p-3 bg-white/20 rounded-2xl hover:bg-white/30 transition">
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Pending',   value: pendingOrders.length,   color: 'bg-yellow-50 border-yellow-100 text-yellow-900' },
          { label: 'Active',    value: acceptedOrders.length,  color: 'bg-blue-50 border-blue-100 text-blue-900' },
          { label: 'Delivered', value: deliveredOrders.length, color: 'bg-green-50 border-green-100 text-green-900' },
          { label: 'Earnings',  value: `₹${totalEarnings.toFixed(0)}`, color: 'bg-purple-50 border-purple-100 text-purple-900' },
        ].map(s => (
          <div key={s.label} className={`${s.color} rounded-2xl border p-5`}>
            <p className="text-2xl font-black">{s.value}</p>
            <p className="text-xs font-black uppercase tracking-widest opacity-60 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm transition ${
              activeTab === t.id
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-200'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-purple-300'
            }`}
          >
            {t.label}
            <span className={`text-xs px-2 py-0.5 rounded-full font-black ${activeTab === t.id ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Order cards */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-10 h-10 text-purple-600 animate-spin" /></div>
      ) : displayOrders.length === 0 ? (
        <div className="bg-white rounded-[32px] border border-slate-100 p-16 text-center shadow-sm">
          <ShoppingBag className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p className="text-xl font-black text-slate-400">No {activeTab} orders</p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayOrders.map(order => (
            <div key={order._id} className={`bg-white rounded-[24px] border-2 shadow-sm overflow-hidden ${STATUS_COLOR[order.status] || 'border-slate-100'}`}>
              <div className="p-6">
                {/* Order header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-xs font-black text-purple-600 uppercase tracking-widest">Order #{order._id.slice(-8)}</p>
                    <p className="text-lg font-black text-slate-900 mt-1">
                      {order.orderItems?.length} item{order.orderItems?.length !== 1 ? 's' : ''}
                    </p>
                    <p className="text-sm text-slate-500">{new Date(order.createdAt).toLocaleString('en-IN')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-slate-900">₹{order.pricing?.totalAmount?.toFixed(0)}</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mt-1 ${STATUS_COLOR[order.status]}`}>
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Customer info */}
                {order.user && (
                  <div className="bg-slate-50 rounded-2xl p-4 mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Customer</p>
                      <p className="font-black text-slate-800">{order.user?.name || 'Customer'}</p>
                      <div className="flex items-center gap-1 text-sm text-slate-500 mt-0.5">
                        <MapPin className="w-3.5 h-3.5" />
                        {order.shippingAddress?.city || '—'}
                      </div>
                    </div>
                    {order.user?.phone && (
                      <a
                        href={`tel:${order.user.phone}`}
                        className="flex items-center gap-1.5 bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-purple-700 transition"
                      >
                        <Phone className="w-4 h-4" /> Call
                      </a>
                    )}
                  </div>
                )}

                {/* Items */}
                <div className="space-y-1.5 mb-4">
                  {order.orderItems?.map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <span className="text-slate-700">{item.name} <span className="text-slate-400">× {item.qty}</span></span>
                      <span className="font-bold text-slate-800">₹{(item.price * item.qty).toFixed(0)}</span>
                    </div>
                  ))}
                </div>

                {/* Payment badge */}
                <div className="flex items-center gap-2 mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.paymentMethod === 'Online' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                    {order.paymentMethod === 'Online' ? '✅ Paid Online' : '💵 Cash on Delivery'}
                  </span>
                  {order.upiApp && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                      via {order.upiApp}
                    </span>
                  )}
                </div>

                {/* Accept button */}
                {order.status === 'Pending' && (
                  <button
                    onClick={() => handleAccept(order._id)}
                    disabled={accepting === order._id}
                    className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-2xl font-black transition shadow-lg shadow-purple-200 disabled:opacity-60"
                  >
                    {accepting === order._id
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Accepting...</>
                      : <><CheckCircle className="w-4 h-4" /> Accept Order</>
                    }
                  </button>
                )}

                {['Accepted', 'Processing'].includes(order.status) && (
                  <div className="flex items-center gap-2 text-blue-600 font-black text-sm">
                    <Clock className="w-4 h-4" /> Order accepted — awaiting delivery assignment
                  </div>
                )}

                {order.status === 'Delivered' && (
                  <div className="flex items-center gap-2 text-green-600 font-black text-sm">
                    <CheckCircle className="w-4 h-4" /> Successfully Delivered
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShopkeeperDashboard;
