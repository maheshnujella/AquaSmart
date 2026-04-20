import { useState } from 'react';
import toast from 'react-hot-toast';
import { Fuel, User, MapPin, Hash } from 'lucide-react';

const Diesel = () => {
  const [formData, setFormData] = useState({
    customerName: '',
    liters: 10,
    location: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const submitHandler = (e) => {
    e.preventDefault();
    if (formData.liters < 10) {
      toast.error('Minimum order is 10 liters');
      return;
    }
    toast.success('Diesel Order Placed Successfully!');
    setFormData({ customerName: '', liters: 10, location: '' });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2 mb-2">
          ⛽ Diesel Delivery Order
        </h1>
        <p className="text-slate-500 mb-8">Order diesel directly to your aqua farm location. (Minimum 10 liters)</p>

        <form onSubmit={submitHandler} className="space-y-6">
          <div>
            <label className="block text-slate-600 font-semibold mb-1 flex items-center gap-1">
              <User className="w-4 h-4" /> Customer Name
            </label>
            <input 
              type="text" 
              name="customerName" 
              value={formData.customerName} 
              onChange={handleChange} 
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500" 
              placeholder="Enter your full name"
              required 
            />
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1 flex items-center gap-1">
              <Hash className="w-4 h-4" /> Diesel Quantity (Liters)
            </label>
            <input 
              type="number" 
              name="liters" 
              value={formData.liters} 
              onChange={handleChange} 
              min="10"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500" 
              required 
            />
            <p className="text-xs text-slate-500 mt-1">Minimum order is 10 liters.</p>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1 flex items-center gap-1">
              <MapPin className="w-4 h-4" /> Delivery Location
            </label>
            <textarea 
              name="location" 
              value={formData.location} 
              onChange={handleChange} 
              rows="3" 
              placeholder="Enter complete farm address or location details" 
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500" 
              required
            ></textarea>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 flex justify-between items-center">
            <span className="font-semibold text-slate-700">Estimated Total (approx ₹90/L):</span>
            <span className="text-2xl font-bold text-yellow-700">₹{(formData.liters * 90).toFixed(2)}</span>
          </div>

          <button type="submit" className="w-full bg-yellow-500 text-white py-3 rounded-lg font-bold hover:bg-yellow-600 transition flex justify-center items-center gap-2">
            <Fuel className="w-5 h-5" /> Place Order
          </button>
        </form>
      </div>
    </div>
  );
};

export default Diesel;
