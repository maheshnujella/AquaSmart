import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import { io } from 'socket.io-client';
import {
  MapPin, Truck, Phone, CheckCircle, Clock,
  Package, ArrowLeft, Loader2, Navigation2, RefreshCw
} from 'lucide-react';

// Socket
const getSocket = () => {
  const base = window.location.origin.includes('5173')
    ? window.location.origin.replace('5173', '5000')
    : window.location.origin;
  return io(base, { transports: ['websocket', 'polling'] });
};

const STEPS = [
  { label: 'Order Placed',      status: 'Pending',           icon: Clock },
  { label: 'Accepted',          status: 'Accepted',          icon: CheckCircle },
  { label: 'Processing',        status: 'Processing',        icon: Package },
  { label: 'Out for Delivery',  status: 'Out for Delivery',  icon: Truck },
  { label: 'Delivered',         status: 'Delivered',         icon: CheckCircle },
];

const OrderTracking = () => {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const [order, setOrder]             = useState(null);
  const [loading, setLoading]         = useState(true);
  const [deliveryLocation, setDeliveryLocation] = useState(null);
  const [statusHistory, setStatusHistory] = useState([]);
  const socketRef  = useRef(null);
  const mapRef     = useRef(null);

  useEffect(() => {
    fetchOrder();
    socketRef.current = getSocket();

    // Join order room for live updates
    socketRef.current.emit('joinOrderRoom', { orderId: id });

    // Live location update
    socketRef.current.on(`locationUpdate:${id}`, (data) => {
      setDeliveryLocation({ lat: data.lat, lng: data.lng, agentName: data.agentName });
      // Update map marker if map visible
      updateMapMarker(data.lat, data.lng);
    });

    // Order status change
    socketRef.current.on(`orderStatus:${id}`, ({ status }) => {
      setOrder(prev => prev ? { ...prev, status } : prev);
    });

    return () => {
      socketRef.current?.emit('leaveOrderRoom', { orderId: id });
      socketRef.current?.disconnect();
    };
  }, [id]);

  const fetchOrder = async () => {
    try {
      const { data } = await api.get(`/api/orders/${id}`);
      setOrder(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Simple Google Maps embed updater
  const updateMapMarker = (lat, lng) => {
    if (mapRef.current) {
      mapRef.current.src = `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
    }
  };

  const getStepIndex = (status) => STEPS.findIndex(s => s.status === status);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      <p className="text-slate-500 font-bold">Loading your order...</p>
    </div>
  );

  if (!order) return (
    <div className="p-20 text-center">
      <p className="text-2xl font-black text-slate-400">Order not found.</p>
      <button onClick={() => navigate('/orders')} className="mt-4 text-blue-600 font-bold hover:underline">← Back to Orders</button>
    </div>
  );

  const currentStep = getStepIndex(order.status);

  // Google Maps embed URL — centres on shipping address city or delivery location
  const mapQuery = deliveryLocation
    ? `${deliveryLocation.lat},${deliveryLocation.lng}`
    : `${order.shippingAddress?.city || 'Bhimavaram'}, Andhra Pradesh`;
  const mapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=14&output=embed`;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 px-4">
      <button onClick={() => navigate('/orders')} className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-900 transition-all">
        <ArrowLeft className="w-5 h-5" /> Back to Orders
      </button>

      {/* Main tracking card */}
      <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between gap-6 mb-10">
          <div>
            <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-2">Order #{order._id.slice(-8)}</p>
            <h1 className="text-4xl font-black text-slate-900">Track Your Order</h1>
            <p className="text-slate-400 mt-1 font-medium">
              Placed {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-slate-400">Estimated Delivery</p>
            <p className="text-xl font-black text-slate-900 italic">45–60 minutes</p>
            <button onClick={fetchOrder} className="mt-2 flex items-center gap-1 text-xs text-blue-600 font-bold ml-auto hover:text-blue-700">
              <RefreshCw className="w-3 h-3" /> Refresh status
            </button>
          </div>
        </div>

        {/* Progress Stepper */}
        <div className="relative mb-12">
          <div className="absolute top-6 left-0 w-full h-1 bg-slate-100 rounded-full" />
          <div
            className="absolute top-6 left-0 h-1 bg-blue-600 rounded-full transition-all duration-1000"
            style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
          />
          <div className="relative flex justify-between">
            {STEPS.map((step, idx) => {
              const Icon     = step.icon;
              const isActive  = idx <= currentStep;
              const isCurrent = idx === currentStep;
              return (
                <div key={idx} className="flex flex-col items-center gap-3 relative z-10">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                    isCurrent ? 'bg-blue-600 text-white shadow-xl shadow-blue-200 scale-110' :
                    isActive  ? 'bg-blue-100 text-blue-600' :
                    'bg-white text-slate-300 border-2 border-slate-100'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className={`text-[10px] font-black uppercase tracking-widest text-center max-w-[70px] ${
                    isActive ? 'text-slate-900' : 'text-slate-300'
                  }`}>
                    {step.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Delivery Agent Info */}
        {order.deliveryAgent && (
          <div className="bg-slate-50 p-6 rounded-[28px] border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-blue-100 border-2 border-white shadow flex items-center justify-center text-blue-600 font-black text-2xl overflow-hidden">
                {order.deliveryAgent.deliveryProfile?.profilePhoto
                  ? <img src={order.deliveryAgent.deliveryProfile.profilePhoto} alt="Agent" className="w-full h-full object-cover" />
                  : order.deliveryAgent.name?.[0]
                }
              </div>
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Delivery Partner</p>
                <h3 className="text-xl font-black text-slate-900">{order.deliveryAgent.name}</h3>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-sm font-bold text-slate-500 flex items-center gap-1">
                    <Truck className="w-4 h-4" />
                    {order.deliveryAgent.deliveryProfile?.vehicleType || '—'}
                  </span>
                  {order.deliveryAgent.deliveryProfile?.vehicleNumber && (
                    <span className="text-sm font-black text-blue-600">
                      {order.deliveryAgent.deliveryProfile.vehicleNumber}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <a
              href={`tel:${order.deliveryAgent.phone}`}
              className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-2xl font-black hover:bg-blue-700 transition shadow-lg shadow-blue-200"
            >
              <Phone className="w-5 h-5" /> Contact Agent
            </a>
          </div>
        )}

        {/* Live Location Banner */}
        {deliveryLocation && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3 mb-6">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <div>
              <p className="text-sm font-black text-green-800">
                🛵 {deliveryLocation.agentName || 'Delivery Partner'} is live-tracking to you!
              </p>
              <p className="text-xs text-green-600 font-medium">
                {deliveryLocation.lat.toFixed(5)}, {deliveryLocation.lng.toFixed(5)}
              </p>
            </div>
          </div>
        )}

        {/* Live Map */}
        <div className="mt-4 rounded-[28px] overflow-hidden border-2 border-slate-100 relative" style={{ height: '320px' }}>
          {deliveryLocation ? (
            <iframe
              ref={mapRef}
              src={mapEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Live Delivery Map"
            />
          ) : (
            /* Static city-level map when no live location */
            <iframe
              src={`https://maps.google.com/maps?q=${encodeURIComponent(order.shippingAddress?.city || 'Bhimavaram, Andhra Pradesh')}&z=13&output=embed`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              title="Delivery Area Map"
            />
          )}

          {/* Overlay card */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end pointer-events-none">
            <div className="bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-lg border border-white/20 pointer-events-auto">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                {deliveryLocation ? 'Live Location' : 'Delivery Area'}
              </p>
              <p className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-blue-600" />
                {order.shippingAddress?.city}, {order.shippingAddress?.country || order.shippingAddress?.state}
              </p>
            </div>
            {deliveryLocation && (
              <div className="bg-blue-600 text-white px-3 py-2 rounded-2xl text-xs font-black flex items-center gap-1.5 pointer-events-auto shadow-lg">
                <Navigation2 className="w-3.5 h-3.5 animate-pulse" /> Live
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Order summary */}
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
          <h3 className="text-lg font-black text-slate-900 mb-5 flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" /> Order Summary
          </h3>
          <div className="space-y-3">
            {order.orderItems.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                <div>
                  <p className="font-bold text-slate-800">{item.name}</p>
                  <p className="text-xs text-slate-400">Qty: {item.qty}</p>
                </div>
                <p className="font-black text-slate-900">₹{(item.price * item.qty).toFixed(0)}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-5 border-t border-slate-100">
            <div className="flex justify-between items-center">
              <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Total Paid</p>
              <p className="text-3xl font-black text-blue-600">₹{order.pricing?.totalAmount?.toFixed(0)}</p>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.paymentMethod === 'Online' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                {order.paymentMethod === 'Online' ? '✅ Paid Online' : '💵 Cash on Delivery'}
              </span>
              {order.upiApp && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                  {order.upiApp}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Help card */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[32px] shadow-2xl shadow-blue-200 text-white flex flex-col justify-between">
          <div>
            <h3 className="text-2xl font-black italic mb-3">Need Help?</h3>
            <p className="text-blue-100 font-medium">Our support team is available 24/7 for any delivery concerns.</p>
          </div>
          <button className="bg-white text-blue-600 w-full py-4 rounded-2xl font-black shadow-xl hover:scale-105 transition-all mt-6">
            📞 Call Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
