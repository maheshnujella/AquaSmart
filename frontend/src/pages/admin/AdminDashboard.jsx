import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Package, Users, ShoppingBag, Calendar, Stethoscope, Loader2, TrendingUp, Wrench, FlaskConical, Fish, RefreshCw, ClipboardList } from 'lucide-react';
import ManageProducts  from './ManageProducts';
import ManageUsers     from './ManageUsers';
import ManageDoctors   from './ManageDoctors';
import ManageFeeds     from './ManageFeeds';
import ManageMedicines from './ManageMedicines';
import ManageRepairs   from './ManageRepairs';
import ManageOrders    from './ManageOrders';

const StatCard = ({ label, value, sub, color }) => (
  <div className={`${color} p-6 rounded-2xl border shadow-sm`}>
    <p className="text-xs font-black uppercase tracking-widest mb-2 opacity-70">{label}</p>
    <p className="text-4xl font-black mb-1">{value ?? <Loader2 className="w-7 h-7 animate-spin inline"/>}</p>
    {sub && <p className="text-xs opacity-60 font-medium mt-2 pt-2 border-t border-current/10">{sub}</p>}
  </div>
);

const AdminDashboard = () => {
  const { user, api } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({ users: null, orders: null, doctors: null, listings: null });
  const [loadingStats, setLoadingStats] = useState(true);

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const [usersRes, ordersRes, doctorsRes, listingsRes] = await Promise.allSettled([
        api.get('/api/admin/users'),
        api.get('/api/admin/orders'),
        api.get('/api/admin/doctors/pending'),
        api.get('/api/listings'),
      ]);
      setStats({
        users:    usersRes.status    === 'fulfilled' ? usersRes.value.data.length    : '—',
        orders:   ordersRes.status   === 'fulfilled' ? ordersRes.value.data.length   : '—',
        doctors:  doctorsRes.status  === 'fulfilled' ? doctorsRes.value.data.length  : '—',
        listings: listingsRes.status === 'fulfilled' ? listingsRes.value.data.length : '—',
      });
    } catch {}
    finally { setLoadingStats(false); }
  };

  useEffect(() => { fetchStats(); }, []);

  const tabs = [
    { id: 'dashboard',  label: 'Overview',    icon: TrendingUp    },
    { id: 'feeds',      label: 'Feeds',        icon: Fish          },
    { id: 'medicines',  label: 'Medicines',    icon: FlaskConical  },
    { id: 'repairs',    label: 'Repair Svcs',  icon: Wrench        },
    { id: 'doctors',    label: 'Doctors',      icon: Stethoscope   },
    { id: 'products',   label: 'Products',     icon: Package       },
    { id: 'orders',     label: 'Orders',       icon: ShoppingBag   },
    { id: 'users',      label: 'Users',        icon: Users         },
    { id: 'bookings',   label: 'Bookings',     icon: Calendar      },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-8 pb-20">
      {/* Sidebar */}
      <div className="w-full lg:w-64 bg-white rounded-[32px] border border-slate-100 shadow-sm p-4 h-fit lg:sticky lg:top-24">
        <div className="px-4 py-3 mb-4">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Admin Panel</p>
          <p className="text-lg font-black text-slate-900 mt-0.5">{user?.name}</p>
        </div>
        <nav className="space-y-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-left font-bold ${
                activeTab === id ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600'
              }`}>
              <Icon className="w-5 h-5"/>{label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">

        {/* Overview */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-black text-slate-900">Platform Overview</h2>
              <button onClick={fetchStats} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition">
                <RefreshCw className={`w-4 h-4 ${loadingStats ? 'animate-spin' : ''}`}/> Refresh
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
              <StatCard label="Total Users"     value={stats.users}    sub="Farmers, Shopkeepers & Doctors" color="bg-blue-50 border-blue-100 text-blue-900"/>
              <StatCard label="Total Orders"    value={stats.orders}   sub="All product & service orders"   color="bg-purple-50 border-purple-100 text-purple-900"/>
              <StatCard label="Pending Doctors" value={stats.doctors}  sub="Awaiting admin approval"        color="bg-amber-50 border-amber-100 text-amber-900"/>
              <StatCard label="Active Listings" value={stats.listings} sub="Marketplace buy/sell posts"     color="bg-green-50 border-green-100 text-green-900"/>
            </div>
            <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm">
              <h3 className="text-lg font-black text-slate-900 mb-6">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {tabs.slice(1).map(({ id, label, icon: Icon }) => (
                  <button key={id} onClick={() => setActiveTab(id)}
                    className="flex flex-col items-center gap-3 p-6 bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 rounded-2xl transition-all group">
                    <Icon className="w-6 h-6 text-slate-400 group-hover:text-blue-600 transition-colors"/>
                    <span className="text-sm font-black text-slate-600 group-hover:text-blue-700">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'feeds'      && <ManageFeeds/>}
        {activeTab === 'medicines'  && <ManageMedicines/>}
        {activeTab === 'repairs'    && <ManageRepairs/>}
        {activeTab === 'doctors'    && <ManageDoctors/>}
        {activeTab === 'products'   && <ManageProducts/>}
        {activeTab === 'orders'     && <ManageOrders/>}
        {activeTab === 'users'      && <ManageUsers/>}

        {activeTab === 'bookings' && (
          <div className="bg-white rounded-[32px] border border-slate-100 p-10 shadow-sm text-center">
            <Calendar className="w-12 h-12 text-slate-200 mx-auto mb-4"/>
            <h3 className="text-2xl font-black text-slate-900 mb-2">Consultation Bookings</h3>
            <p className="text-slate-500">Booking management coming soon.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
