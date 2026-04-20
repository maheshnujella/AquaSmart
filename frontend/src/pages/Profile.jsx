import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User, Package, Calendar, Settings, Camera, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('details');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '9876543210',
    address: '123 Aqua Farm Road, AP',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const submitHandler = (e) => {
    e.preventDefault();
    toast.success('Profile updated successfully!');
    setIsEditing(false);
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8">
      {/* Sidebar */}
      <div className="w-full md:w-64 flex-shrink-0">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col items-center">
          <div className="relative mb-4">
            <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl font-bold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full hover:bg-blue-700 transition shadow-md">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <h2 className="text-xl font-bold text-slate-800">{user?.name}</h2>
          <p className="text-sm text-slate-500 mb-6">{user?.role}</p>

          <nav className="w-full space-y-2">
            <button onClick={() => setActiveTab('details')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left font-medium ${activeTab === 'details' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}>
              <User className="w-5 h-5" /> Profile Details
            </button>
            <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left font-medium ${activeTab === 'orders' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}>
              <Package className="w-5 h-5" /> My Orders
            </button>
            <button onClick={() => setActiveTab('bookings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left font-medium ${activeTab === 'bookings' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}>
              <Calendar className="w-5 h-5" /> Consultations
            </button>
            <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left font-medium ${activeTab === 'settings' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}>
              <Settings className="w-5 h-5" /> Settings
            </button>
            <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left font-medium text-red-600 hover:bg-red-50 mt-4 border-t border-slate-100">
              <LogOut className="w-5 h-5" /> Logout
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        {activeTab === 'details' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-slate-800">Personal Information</h3>
              <button 
                onClick={() => setIsEditing(!isEditing)} 
                className="text-blue-600 font-semibold hover:bg-blue-50 px-4 py-2 rounded-lg transition"
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            {isEditing ? (
              <form onSubmit={submitHandler} className="space-y-4 max-w-lg">
                <div>
                  <label className="block text-slate-600 text-sm mb-1 font-medium">Full Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-slate-50" required />
                </div>
                <div>
                  <label className="block text-slate-600 text-sm mb-1 font-medium">Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-slate-50" required disabled />
                  <p className="text-xs text-slate-400 mt-1">Email cannot be changed.</p>
                </div>
                <div>
                  <label className="block text-slate-600 text-sm mb-1 font-medium">Phone Number</label>
                  <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-slate-50" />
                </div>
                <div>
                  <label className="block text-slate-600 text-sm mb-1 font-medium">Farm Address</label>
                  <textarea name="address" value={formData.address} onChange={handleChange} rows="3" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-slate-50"></textarea>
                </div>
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition">
                  Save Changes
                </button>
              </form>
            ) : (
              <div className="space-y-6 max-w-lg">
                <div className="grid grid-cols-3 border-b border-slate-100 pb-4">
                  <span className="text-slate-500 font-medium">Full Name</span>
                  <span className="col-span-2 text-slate-800 font-semibold">{formData.name}</span>
                </div>
                <div className="grid grid-cols-3 border-b border-slate-100 pb-4">
                  <span className="text-slate-500 font-medium">Email</span>
                  <span className="col-span-2 text-slate-800 font-semibold">{formData.email}</span>
                </div>
                <div className="grid grid-cols-3 border-b border-slate-100 pb-4">
                  <span className="text-slate-500 font-medium">Phone</span>
                  <span className="col-span-2 text-slate-800 font-semibold">{formData.phone}</span>
                </div>
                <div className="grid grid-cols-3 border-b border-slate-100 pb-4">
                  <span className="text-slate-500 font-medium">Address</span>
                  <span className="col-span-2 text-slate-800 font-semibold">{formData.address}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div>
            <h3 className="text-2xl font-bold text-slate-800 mb-6">Order History</h3>
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-8 text-center text-slate-500">
              <Package className="w-12 h-12 mx-auto text-slate-300 mb-4" />
              <p className="font-semibold text-lg text-slate-600">No orders yet</p>
              <p>When you buy feed or medicine, they will appear here.</p>
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div>
            <h3 className="text-2xl font-bold text-slate-800 mb-6">Consultation Bookings</h3>
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-8 text-center text-slate-500">
              <Calendar className="w-12 h-12 mx-auto text-slate-300 mb-4" />
              <p className="font-semibold text-lg text-slate-600">No upcoming consultations</p>
              <p>Book an expert to get advice for your farm.</p>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <h3 className="text-2xl font-bold text-slate-800 mb-6">Account Settings</h3>
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 max-w-lg">
              <h4 className="font-bold text-red-600 mb-2">Danger Zone</h4>
              <p className="text-sm text-slate-500 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
              <button className="bg-red-100 text-red-700 px-4 py-2 rounded-lg font-bold hover:bg-red-200 transition">
                Delete Account
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
