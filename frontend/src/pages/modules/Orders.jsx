import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { 
  Package, Truck, CheckCircle, Clock, 
  ChevronRight, IndianRupee, ShoppingBag,
  Loader2, Filter, Search
} from 'lucide-react';

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/api/orders/myorders');
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = filter === 'All' 
    ? orders 
    : orders.filter(order => order.status === filter);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-600';
      case 'Out for Delivery': return 'bg-blue-100 text-blue-600';
      case 'Processing': return 'bg-amber-100 text-amber-600';
      case 'Pending': return 'bg-slate-100 text-slate-500';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  return (
    <div className="space-y-10 pb-20 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <h1 className="text-4xl font-black text-slate-900 flex items-center gap-3">
              <ShoppingBag className="w-10 h-10 text-blue-600" /> My Purchases
           </h1>
           <p className="text-slate-500 font-medium mt-1">Track and manage your aquaculture supplies.</p>
        </div>

        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm w-full md:w-auto">
           {['All', 'Pending', 'Processing', 'Out for Delivery', 'Delivered'].map(f => (
             <button
               key={f}
               onClick={() => setFilter(f)}
               className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                 filter === f ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-400 hover:text-slate-600'
               }`}
             >
               {f}
             </button>
           ))}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
           <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white p-20 rounded-[40px] border-2 border-dashed border-slate-100 text-center space-y-6 shadow-sm">
           <Package className="w-20 h-20 text-slate-100 mx-auto" />
           <div className="space-y-2">
              <p className="text-slate-400 font-black text-2xl uppercase tracking-tighter">No orders found</p>
              <p className="text-slate-400 font-medium max-w-xs mx-auto">Looks like you haven't ordered anything yet.</p>
           </div>
           <button 
             onClick={() => navigate('/feed')}
             className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-blue-200 hover:scale-105 transition-all"
           >
              Shop Now
           </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
           {filteredOrders.map((order) => (
             <div 
               key={order._id}
               className="group bg-white rounded-[40px] p-8 border border-slate-50 shadow-sm hover:shadow-2xl transition-all duration-500 relative overflow-hidden"
             >
                <div className="flex flex-col lg:flex-row justify-between gap-10">
                   <div className="flex-1 space-y-6">
                      <div className="flex flex-wrap items-center gap-4">
                         <span className="text-xs font-black text-blue-600 uppercase tracking-widest">Order #{order._id.slice(-8)}</span>
                         <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(order.status)}`}>
                            {order.status}
                         </span>
                         <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                            {new Date(order.createdAt).toLocaleDateString()}
                         </span>
                      </div>

                      <div className="flex flex-wrap gap-4">
                         {order.orderItems.map((item, idx) => (
                           <div key={idx} className="bg-slate-50 px-4 py-2 rounded-2xl flex items-center gap-3 border border-slate-100">
                              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-[10px] font-black text-blue-600">
                                 {item.qty}x
                              </div>
                              <p className="text-sm font-bold text-slate-800">{item.name}</p>
                           </div>
                         ))}
                      </div>
                   </div>

                   <div className="flex flex-col md:flex-row items-center gap-8 lg:border-l lg:border-slate-50 lg:pl-10">
                      <div className="text-center md:text-right">
                         <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Total Paid</p>
                         <p className="text-3xl font-black text-slate-900 italic flex items-center gap-1">
                            <IndianRupee className="w-5 h-5 text-blue-600" /> {order.pricing.totalAmount}
                         </p>
                      </div>
                      <div className="flex gap-3">
                         {order.status !== 'Delivered' && (
                           <button 
                             onClick={() => navigate(`/orders/${order._id}/track`)}
                             className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-blue-100 flex items-center gap-2 hover:scale-105 transition-all"
                           >
                              <Truck className="w-4 h-4" /> Track
                           </button>
                         )}
                         <button className="bg-slate-50 text-slate-900 w-14 h-14 rounded-2xl flex items-center justify-center hover:bg-slate-100 transition-all">
                            <ChevronRight className="w-6 h-6" />
                         </button>
                      </div>
                   </div>
                </div>
                
                {/* Visual Progress Line for active orders */}
                {order.status !== 'Delivered' && (
                  <div className="absolute bottom-0 left-0 h-1 bg-blue-600 w-1/3 animate-pulse"></div>
                )}
             </div>
           ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
