import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import {
  ShoppingBag, MapPin, Truck, IndianRupee,
  CreditCard, Banknote, Loader2, ArrowLeft, CheckCircle
} from 'lucide-react';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, cartTotal, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);

  const [address, setAddress] = useState({
    street: '', city: '', state: 'Andhra Pradesh', pincode: '', phone: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [submitting, setSubmitting] = useState(false);

  // Strict Pricing Formula
  const mrpTotal = cartTotal;
  const discount = 0;
  const handlingFee = 20;
  const platformFee = 15;
  const totalItems = cartItems.reduce((acc, i) => acc + i.qty, 0);
  const deliveryCharges = totalItems >= 10 ? 500 : totalItems >= 3 ? 150 : 40;
  const gst = mrpTotal * 0.05;
  const totalAmount = (mrpTotal - discount) + handlingFee + platformFee + deliveryCharges + gst;

  const handleAddressChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) { toast.error('Your cart is empty'); return; }
    if (!address.street || !address.city || !address.pincode || !address.phone) {
      toast.error('Please fill in all address fields'); return;
    }

    setSubmitting(true);
    try {
      const orderPayload = {
        orderItems: cartItems.map(item => ({
          name: item.name,
          qty: item.qty,
          image: item.image || '',
          price: item.price,
          product: item._id || item.id,
        })),
        shippingAddress: address,
        paymentMethod,
        mrpTotal,
        discount,
      };

      const { data } = await axios.post('/api/orders', orderPayload);
      clearCart();
      toast.success('Order placed successfully! 🎉');
      navigate(`/orders/${data._id}/track`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4">
        <ShoppingBag className="w-16 h-16 text-slate-200" />
        <p className="text-xl font-black text-slate-400">Your cart is empty</p>
        <button onClick={() => navigate('/feed')} className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black hover:bg-blue-700 transition">
          Shop Now
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 px-4">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-900 transition">
        <ArrowLeft className="w-5 h-5" /> Back
      </button>

      <h1 className="text-4xl font-black text-slate-900 flex items-center gap-3">
        <ShoppingBag className="w-9 h-9 text-blue-600" /> Checkout
      </h1>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Address + Payment */}
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery Address */}
          <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm space-y-5">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" /> Delivery Address
            </h2>
            {[
              { label: 'Street / Village / Farm Address', name: 'street', placeholder: 'e.g. Plot 12, Aqua Farm Road' },
              { label: 'City / Town', name: 'city', placeholder: 'e.g. Bhimavaram' },
              { label: 'PIN Code', name: 'pincode', placeholder: '6-digit PIN' },
              { label: 'Mobile Number', name: 'phone', placeholder: '10-digit number' },
            ].map(field => (
              <div key={field.name}>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">{field.label}</label>
                <input
                  type="text" name={field.name} value={address[field.name]}
                  onChange={handleAddressChange} placeholder={field.placeholder} required
                  className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            ))}
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">State</label>
              <select name="state" value={address.state} onChange={handleAddressChange}
                className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white">
                <option>Andhra Pradesh</option>
                <option>Telangana</option>
                <option>Tamil Nadu</option>
                <option>Kerala</option>
                <option>Karnataka</option>
                <option>Odisha</option>
                <option>West Bengal</option>
                <option>Gujarat</option>
              </select>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm space-y-4">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" /> Payment Method
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { id: 'COD', label: 'Cash on Delivery', icon: Banknote, desc: 'Pay when you receive' },
                { id: 'Online', label: 'Online Payment', icon: CreditCard, desc: 'UPI / Card / Net Banking' },
              ].map(({ id, label, icon: Icon, desc }) => (
                <button
                  key={id} type="button" onClick={() => setPaymentMethod(id)}
                  className={`flex items-start gap-4 p-5 rounded-2xl border-2 transition-all ${
                    paymentMethod === id ? 'border-blue-600 bg-blue-50' : 'border-slate-100 hover:border-blue-200'
                  }`}
                >
                  <Icon className={`w-6 h-6 mt-0.5 ${paymentMethod === id ? 'text-blue-600' : 'text-slate-400'}`} />
                  <div className="text-left">
                    <p className={`font-black text-sm ${paymentMethod === id ? 'text-blue-700' : 'text-slate-700'}`}>{label}</p>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">{desc}</p>
                  </div>
                  {paymentMethod === id && <CheckCircle className="w-5 h-5 text-blue-600 ml-auto flex-shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
            <h2 className="text-xl font-black text-slate-900 mb-6">Order Summary</h2>
            <div className="space-y-3 mb-6">
              {cartItems.map(item => {
                const id = item._id || item.id;
                return (
                  <div key={id} className="flex justify-between items-start gap-2">
                    <p className="text-sm font-bold text-slate-700 line-clamp-2 flex-1">{item.name} <span className="text-slate-400 font-normal">×{item.qty}</span></p>
                    <p className="text-sm font-black text-slate-900 flex-shrink-0">₹{(item.price * item.qty).toFixed(0)}</p>
                  </div>
                );
              })}
            </div>

            {/* Price Breakdown */}
            <div className="border-t border-slate-100 pt-4 space-y-2 text-sm">
              {[
                { label: 'MRP Total', value: mrpTotal },
                { label: 'Discount', value: -discount },
                { label: 'Handling Fee', value: handlingFee },
                { label: 'Platform Fee', value: platformFee },
                { label: `Delivery (${totalItems >= 10 ? 'Lorry' : totalItems >= 3 ? 'Auto/Van' : 'Bike'})`, value: deliveryCharges },
                { label: 'GST (5%)', value: gst },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-slate-500 font-medium">
                  <span>{label}</span>
                  <span className={value < 0 ? 'text-green-600 font-bold' : ''}>
                    {value < 0 ? '-' : ''}₹{Math.abs(value).toFixed(0)}
                  </span>
                </div>
              ))}
              <div className="flex justify-between font-black text-slate-900 text-lg pt-3 border-t border-slate-100">
                <span>Total Amount</span>
                <span className="text-blue-600">₹{totalAmount.toFixed(0)}</span>
              </div>
            </div>
          </div>

          {/* Vehicle Info */}
          <div className="bg-slate-50 rounded-[24px] p-5 border border-slate-100 flex items-center gap-3">
            <Truck className="w-6 h-6 text-blue-600 flex-shrink-0" />
            <div>
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Auto-assigned Vehicle</p>
              <p className="font-black text-slate-900">{totalItems >= 10 ? '🚛 Lorry (Bulk Order)' : totalItems >= 3 ? '🚐 Auto/Van' : '🏍️ Bike'}</p>
            </div>
          </div>

          <button
            type="submit" disabled={submitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-blue-200 transition-all hover:scale-[1.02] disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {submitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Placing Order...</> : `Place Order · ₹${totalAmount.toFixed(0)}`}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
