import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { 
  MapPin, Truck, Phone, User, 
  CheckCircle, Clock, Package,
  ChevronRight, ArrowLeft, Loader2
} from 'lucide-react';

const socket = io(window.location.origin.replace('5173', '5000'));

const OrderTracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deliveryLocation, setDeliveryLocation] = useState(null);

  useEffect(() => {
    fetchOrder();

    // Listen for live location updates
    socket.on(`locationUpdate:${id}`, (data) => {
      setDeliveryLocation({ lat: data.lat, lng: data.lng });
    });

    return () => {
      socket.off(`locationUpdate:${id}`);
    };
  }, [id]);

  const fetchOrder = async () => {
    try {
      const { data } = await axios.get(`/api/orders/${id}`);
      setOrder(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { label: 'Order Placed', status: 'Pending', icon: Clock },
    { label: 'Accepted', status: 'Accepted', icon: CheckCircle },
    { label: 'Processing', status: 'Processing', icon: Package },
    { label: 'Out for Delivery', status: 'Out for Delivery', icon: Truck },
    { label: 'Delivered', status: 'Delivered', icon: CheckCircle },
  ];

  const getStepIndex = (status) => {
    return steps.findIndex(step => step.status === status);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
    </div>
  );

  if (!order) return <div className="p-20 text-center font-bold">Order not found.</div>;

  const currentStep = getStepIndex(order.status);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 px-4">
      <button 
        onClick={() => navigate('/orders')}
        className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-900 transition-all"
      >
        <ArrowLeft className="w-5 h-5" /> Back to Orders
      </button>

      <div className="bg-white rounded-[40px] p-10 shadow-sm border border-slate-100 overflow-hidden relative">
         <div className="flex flex-col md:flex-row justify-between gap-8 mb-10">
            <div>
              <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-2">Order ID: #{order._id.slice(-8)}</p>
              <h1 className="text-4xl font-black text-slate-900">Track Your Harvest</h1>
            </div>
            <div className="text-right">
               <p className="text-sm font-bold text-slate-400">Estimated Delivery</p>
               <p className="text-xl font-black text-slate-900 italic">Within 45-60 mins</p>
            </div>
         </div>

         {/* Progress Bar */}
         <div className="relative mb-16">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2"></div>
            <div 
              className="absolute top-1/2 left-0 h-1 bg-blue-600 -translate-y-1/2 transition-all duration-1000"
              style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            ></div>
            
            <div className="relative flex justify-between">
               {steps.map((step, idx) => {
                 const Icon = step.icon;
                 const isActive = idx <= currentStep;
                 const isCurrent = idx === currentStep;
                 return (
                   <div key={idx} className="flex flex-col items-center gap-4 relative z-10">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                        isCurrent ? 'bg-blue-600 text-white shadow-xl shadow-blue-200 scale-110' :
                        isActive ? 'bg-blue-100 text-blue-600' : 'bg-white text-slate-300 border-2 border-slate-100'
                      }`}>
                         <Icon className="w-5 h-5" />
                      </div>
                      <p className={`text-[10px] font-black uppercase tracking-widest text-center ${
                        isActive ? 'text-slate-900' : 'text-slate-300'
                      }`}>{step.label}</p>
                   </div>
                 );
               })}
            </div>
         </div>

         {/* Delivery Info */}
         {order.deliveryAgent && (
           <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                 <div className="w-20 h-20 rounded-3xl bg-blue-100 border-4 border-white shadow-sm overflow-hidden">
                    {order.deliveryAgent.deliveryProfile?.profilePhoto ? (
                      <img src={order.deliveryAgent.deliveryProfile.profilePhoto} alt="Agent" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-blue-600 font-black text-2xl">
                         {order.deliveryAgent.name[0]}
                      </div>
                    )}
                 </div>
                 <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Delivery Partner</p>
                    <h3 className="text-2xl font-black text-slate-900">{order.deliveryAgent.name}</h3>
                    <div className="flex items-center gap-4 mt-1">
                       <span className="flex items-center gap-1 text-sm font-bold text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-100">
                          <Truck className="w-4 h-4" /> {order.deliveryAgent.deliveryProfile?.vehicleType}
                       </span>
                       <span className="text-sm font-black text-blue-600">{order.deliveryAgent.deliveryProfile?.vehicleNumber}</span>
                    </div>
                 </div>
              </div>
              <a 
                href={`tel:${order.deliveryAgent.phone}`}
                className="w-full md:w-auto bg-blue-600 text-white px-10 py-4 rounded-2xl font-black flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-lg shadow-blue-200"
              >
                <Phone className="w-5 h-5" /> Contact Agent
              </a>
           </div>
         )}

         {/* Live Map Simulation */}
         <div className="mt-10 h-80 bg-slate-100 rounded-[32px] border-2 border-slate-50 relative overflow-hidden group">
            <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=16.5449,81.5133&zoom=14&size=800x400&sensor=false')] bg-cover bg-center grayscale opacity-50"></div>
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="relative">
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1 whitespace-nowrap">
                     <Truck className="w-3 h-3" /> Partner is here
                  </div>
                  <div className="w-6 h-6 bg-blue-600 rounded-full border-4 border-white shadow-xl animate-pulse"></div>
               </div>
            </div>
            <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
               <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/20">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Location</p>
                  <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                     <MapPin className="w-4 h-4 text-blue-600" /> Bhimavaram Main Road
                  </p>
               </div>
               <button className="bg-white p-4 rounded-2xl shadow-lg border border-slate-50">
                  <ChevronRight className="w-6 h-6 text-slate-900" />
               </button>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
               <Package className="w-5 h-5 text-blue-600" /> Order Summary
            </h3>
            <div className="space-y-4">
               {order.orderItems.map((item, idx) => (
                 <div key={idx} className="flex justify-between items-center py-3 border-b border-slate-50 last:border-0">
                    <div>
                       <p className="font-bold text-slate-800">{item.name}</p>
                       <p className="text-xs text-slate-400">Qty: {item.qty}</p>
                    </div>
                    <p className="font-black text-slate-900">₹{item.price * item.qty}</p>
                 </div>
               ))}
            </div>
            <div className="mt-6 pt-6 border-t border-slate-100">
               <div className="flex justify-between items-center">
                  <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Total Paid</p>
                  <p className="text-3xl font-black text-blue-600 italic">₹{order.pricing.totalAmount}</p>
               </div>
            </div>
         </div>

         <div className="bg-blue-600 p-8 rounded-[40px] shadow-2xl shadow-blue-200 text-white flex flex-col justify-center space-y-4">
            <h3 className="text-2xl font-black italic">Need Help?</h3>
            <p className="text-blue-100 font-medium">Our support team is available 24/7 for any delivery concerns.</p>
            <button className="bg-white text-blue-600 w-full py-4 rounded-2xl font-black shadow-xl hover:scale-105 transition-all">
               Call Support
            </button>
         </div>
      </div>
    </div>
  );
};

export default OrderTracking;
