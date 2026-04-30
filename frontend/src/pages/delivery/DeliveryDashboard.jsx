import { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import {
  Truck, MapPin, Clock, Package, CheckCircle,
  Navigation, Loader2, Phone, RefreshCw, AlertCircle
} from 'lucide-react';

// Socket connection
const getSocket = () => {
  const base = window.location.origin.includes('5173')
    ? window.location.origin.replace('5173', '5000')
    : window.location.origin;
  return io(base, { transports: ['websocket', 'polling'] });
};

const STATUS_COLOR = {
  Pending:           'bg-yellow-100 text-yellow-700',
  Accepted:          'bg-blue-100 text-blue-700',
  Processing:        'bg-indigo-100 text-indigo-700',
  'Out for Delivery':'bg-orange-100 text-orange-700',
  Delivered:         'bg-green-100 text-green-700',
  Cancelled:         'bg-red-100 text-red-700',
};

const DeliveryDashboard = () => {
  const { user, api } = useContext(AuthContext);
  const navigate      = useNavigate();
  const [orders, setOrders]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [tracking, setTracking]       = useState(null); // orderId being tracked
  const [trackingActive, setTrackingActive] = useState(false);
  const [locationStatus, setLocationStatus] = useState('');
  const [activeTab, setActiveTab]     = useState('assigned');
  const socketRef    = useRef(null);
  const watchRef     = useRef(null);

  useEffect(() => {
    socketRef.current = getSocket();
    fetchOrders();
    return () => {
      stopTracking();
      socketRef.current?.disconnect();
    };
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/delivery/orders');
      setOrders(data.data || []);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  // ── Start live GPS tracking for an order ─────────────────────────────────────
  const startTracking = (orderId) => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported by your browser');
      return;
    }
    setTracking(orderId);
    setTrackingActive(true);
    setLocationStatus('Acquiring GPS...');

    // Join the socket room
    socketRef.current?.emit('joinOrderRoom', { orderId });

    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setLocationStatus(`📍 ${lat.toFixed(5)}, ${lng.toFixed(5)}`);

        // Emit to server
        socketRef.current?.emit('updateLocation', { orderId, lat, lng });

        // Also call REST API
        api.post(`/api/tracking/${orderId}/update`, { lat, lng }).catch(() => {});
      },
      (err) => {
        setLocationStatus('GPS error: ' + err.message);
        toast.error('Location error: ' + err.message);
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );

    toast.success('Live tracking started! Customer can now see your location.');
  };

  const stopTracking = () => {
    if (watchRef.current != null) {
      navigator.geolocation.clearWatch(watchRef.current);
      watchRef.current = null;
    }
    if (tracking) {
      socketRef.current?.emit('leaveOrderRoom', { orderId: tracking });
    }
    setTrackingActive(false);
    setTracking(null);
    setLocationStatus('');
  };

  // ── Mark as Out for Delivery ──────────────────────────────────────────────────
  const markPickup = async (orderId) => {
    try {
      await api.put(`/api/delivery/orders/${orderId}/pickup`);
      toast.success('Marked as Out for Delivery!');
      fetchOrders();
      startTracking(orderId);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  const assignedOrders  = orders.filter(o => ['Processing', 'Out for Delivery'].includes(o.status));
  const deliveredOrders = orders.filter(o => o.status === 'Delivered');

  const displayOrders = activeTab === 'assigned' ? assignedOrders : deliveredOrders;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 px-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[32px] p-8 text-white shadow-2xl shadow-blue-200">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-blue-200 text-xs font-black uppercase tracking-widest mb-2">Delivery Partner</p>
            <h1 className="text-3xl font-black">Welcome, {user?.name}! 🛵</h1>
            <p className="text-blue-100 mt-1">
              {user?.deliveryProfile?.vehicleType || user?.vehicleType || 'Vehicle'} ·{' '}
              {user?.deliveryProfile?.vehicleNumber || user?.vehicleNumber || 'No plate set'}
            </p>
          </div>
          <button
            onClick={fetchOrders}
            className="p-3 bg-white/20 rounded-2xl hover:bg-white/30 transition"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Live tracking banner */}
        {trackingActive && (
          <div className="mt-6 bg-white/10 border border-white/20 rounded-2xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
              <div>
                <p className="font-black text-sm">Live Tracking Active</p>
                <p className="text-blue-200 text-xs">{locationStatus}</p>
              </div>
            </div>
            <button
              onClick={stopTracking}
              className="px-4 py-2 bg-red-500 rounded-xl text-sm font-black hover:bg-red-600 transition"
            >
              Stop
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Active',    value: assignedOrders.length,  color: 'bg-orange-50 border-orange-100 text-orange-900' },
          { label: 'Delivered', value: deliveredOrders.length, color: 'bg-green-50 border-green-100 text-green-900' },
          { label: 'Total',     value: orders.length,          color: 'bg-blue-50 border-blue-100 text-blue-900' },
        ].map(s => (
          <div key={s.label} className={`${s.color} rounded-2xl border p-5 text-center`}>
            <p className="text-3xl font-black">{s.value}</p>
            <p className="text-xs font-black uppercase tracking-widest opacity-60 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { id: 'assigned',  label: 'Active Orders' },
          { id: 'delivered', label: 'Delivered' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-5 py-2.5 rounded-xl font-black text-sm transition ${
              activeTab === t.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Orders */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        </div>
      ) : displayOrders.length === 0 ? (
        <div className="bg-white rounded-[32px] border border-slate-100 p-16 text-center shadow-sm">
          <Truck className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p className="text-xl font-black text-slate-400">
            {activeTab === 'assigned' ? 'No active deliveries' : 'No delivered orders yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayOrders.map(order => (
            <div key={order._id} className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-xs font-black text-blue-600 uppercase tracking-widest">
                      Order #{order._id.slice(-8)}
                    </p>
                    <p className="text-lg font-black text-slate-900 mt-1">
                      {order.orderItems?.length} item{order.orderItems?.length !== 1 ? 's' : ''} · ₹{order.pricing?.totalAmount?.toFixed(0)}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-black ${STATUS_COLOR[order.status] || 'bg-slate-100 text-slate-600'}`}>
                    {order.status}
                  </span>
                </div>

                {/* Customer info */}
                <div className="bg-slate-50 rounded-2xl p-4 space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Package className="w-4 h-4 text-slate-400" />
                    <span className="font-bold text-slate-700">{order.user?.name || 'Customer'}</span>
                    {order.user?.phone && (
                      <a href={`tel:${order.user.phone}`} className="ml-auto flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-blue-700 transition">
                        <Phone className="w-3 h-3" /> Call
                      </a>
                    )}
                  </div>
                  <div className="flex items-start gap-2 text-sm text-slate-500">
                    <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    <span>{order.shippingAddress?.address}, {order.shippingAddress?.city}</span>
                  </div>
                </div>

                {/* Order items preview */}
                <div className="space-y-1 mb-4">
                  {order.orderItems?.slice(0, 3).map((item, i) => (
                    <div key={i} className="flex justify-between text-sm text-slate-600">
                      <span>{item.name} × {item.qty}</span>
                      <span className="font-bold">₹{(item.price * item.qty).toFixed(0)}</span>
                    </div>
                  ))}
                  {order.orderItems?.length > 3 && (
                    <p className="text-xs text-slate-400">+{order.orderItems.length - 3} more items</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 flex-wrap">
                  {order.status === 'Processing' && (
                    <button
                      onClick={() => markPickup(order._id)}
                      className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-black text-sm transition shadow-lg shadow-orange-200"
                    >
                      <Truck className="w-4 h-4" /> Start Delivery
                    </button>
                  )}

                  {order.status === 'Out for Delivery' && (
                    <>
                      {tracking === order._id && trackingActive ? (
                        <button
                          onClick={stopTracking}
                          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl font-black text-sm transition"
                        >
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                          Stop Tracking
                        </button>
                      ) : (
                        <button
                          onClick={() => startTracking(order._id)}
                          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-black text-sm transition shadow-lg shadow-green-200"
                        >
                          <Navigation className="w-4 h-4" /> Start Live Tracking
                        </button>
                      )}
                      <button
                        onClick={() => navigate(`/orders/${order._id}/track`)}
                        className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-5 py-2.5 rounded-xl font-black text-sm transition"
                      >
                        <MapPin className="w-4 h-4" /> View Map
                      </button>
                    </>
                  )}

                  {order.status === 'Delivered' && (
                    <div className="flex items-center gap-2 text-green-600 font-black text-sm">
                      <CheckCircle className="w-5 h-5" /> Delivered Successfully
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeliveryDashboard;
