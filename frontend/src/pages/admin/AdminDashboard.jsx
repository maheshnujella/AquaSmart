import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import {
  Package, Users, ShoppingBag, Calendar, Stethoscope, Loader2,
  TrendingUp, Wrench, FlaskConical, Fish, RefreshCw, CreditCard,
  Factory, Truck, Store, BarChart2
} from 'lucide-react';
import ManageProducts     from './ManageProducts';
import ManageUsers        from './ManageUsers';
import ManageDoctors      from './ManageDoctors';
import ManageFeeds        from './ManageFeeds';
import ManageMedicines    from './ManageMedicines';
import ManageRepairs      from './ManageRepairs';
import ManageOrders       from './ManageOrders';
import ManagePayments     from './ManagePayments';
import ManageFeedCompanies from './ManageFeedCompanies';

// ── Stat card ──────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, color, icon: Icon }) => (
  <div className={`${color} p-6 rounded-2xl border shadow-sm`}>
    <div className="flex justify-between items-start mb-3">
      <p className="text-xs font-black uppercase tracking-widest opacity-70">{label}</p>
      {Icon && <Icon className="w-5 h-5 opacity-50" />}
    </div>
    <p className="text-4xl font-black mb-1">
      {value ?? <Loader2 className="w-7 h-7 animate-spin inline" />}
    </p>
    {sub && <p className="text-xs opacity-60 font-medium mt-2 pt-2 border-t border-current/10">{sub}</p>}
  </div>
);

// ── Role breakdown bar ─────────────────────────────────────────────────────────
const RoleBar = ({ label, count, total, color }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-sm">
      <span className="font-bold text-slate-700">{label}</span>
      <span className="font-black text-slate-900">{count}</span>
    </div>
    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full ${color} transition-all duration-700`}
        style={{ width: total ? `${(count / total) * 100}%` : '0%' }}
      />
    </div>
  </div>
);

const AdminDashboard = () => {
  const { user, api } = useContext(AuthContext);
  const [activeTab, setActiveTab]   = useState('dashboard');
  const [stats, setStats]           = useState({ users: null, orders: null, doctors: null, listings: null });
  const [roleStats, setRoleStats]   = useState({});
  const [payStats, setPayStats]     = useState({});
  const [loadingStats, setLoadingStats] = useState(true);

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const [usersRes, ordersRes, doctorsRes, listingsRes, roleRes, payRes] = await Promise.allSettled([
        api.get('/api/admin/users'),
        api.get('/api/admin/orders'),
        api.get('/api/admin/doctors/pending'),
        api.get('/api/listings'),
        api.get('/api/admin/stats/roles'),
        api.get('/api/admin/payments'),
      ]);

      setStats({
        users:    usersRes.status    === 'fulfilled' ? usersRes.value.data.length    : '—',
        orders:   ordersRes.status   === 'fulfilled' ? ordersRes.value.data.length   : '—',
        doctors:  doctorsRes.status  === 'fulfilled' ? doctorsRes.value.data.length  : '—',
        listings: listingsRes.status === 'fulfilled' ? listingsRes.value.data.length : '—',
      });

      if (roleRes.status === 'fulfilled') setRoleStats(roleRes.value.data.data || {});
      if (payRes.status  === 'fulfilled') setPayStats(payRes.value.data.stats || {});
    } catch {}
    finally { setLoadingStats(false); }
  };

  useEffect(() => { fetchStats(); }, []);

  const tabs = [
    { id: 'dashboard',      label: 'Overview',        icon: TrendingUp   },
    { id: 'feeds',          label: 'Feeds',            icon: Fish         },
    { id: 'feed-companies', label: 'Feed Companies',   icon: Factory      },
    { id: 'medicines',      label: 'Medicines',        icon: FlaskConical },
    { id: 'repairs',        label: 'Repair Svcs',      icon: Wrench       },
    { id: 'doctors',        label: 'Doctors',          icon: Stethoscope  },
    { id: 'products',       label: 'Products',         icon: Package      },
    { id: 'orders',         label: 'Orders',           icon: ShoppingBag  },
    { id: 'payments',       label: 'Payments',         icon: CreditCard   },
    { id: 'users',          label: 'Users',            icon: Users        },
    { id: 'bookings',       label: 'Bookings',         icon: Calendar     },
  ];

  const totalUsers = Object.values(roleStats).reduce((a, b) => a + b, 0) || 1;

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
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-left font-bold ${
                activeTab === id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />{label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">

        {/* ── Overview ── */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-black text-slate-900">Platform Overview</h2>
              <button onClick={fetchStats} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition">
                <RefreshCw className={`w-4 h-4 ${loadingStats ? 'animate-spin' : ''}`} /> Refresh
              </button>
            </div>

            {/* Primary stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
              <StatCard label="Total Users"     value={stats.users}    sub="All roles combined"           color="bg-blue-50 border-blue-100 text-blue-900"    icon={Users}        />
              <StatCard label="Total Orders"    value={stats.orders}   sub="All product & service orders"  color="bg-purple-50 border-purple-100 text-purple-900" icon={ShoppingBag}  />
              <StatCard label="Pending Doctors" value={stats.doctors}  sub="Awaiting approval"             color="bg-amber-50 border-amber-100 text-amber-900"   icon={Stethoscope}  />
              <StatCard label="Active Listings" value={stats.listings} sub="Marketplace posts"             color="bg-green-50 border-green-100 text-green-900"   icon={BarChart2}    />
            </div>

            {/* Revenue cards */}
            {payStats.totalRevenue > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                <StatCard label="Total Revenue"      value={`₹${Number(payStats.totalRevenue || 0).toFixed(0)}`}      sub="All UPI payments" color="bg-teal-50 border-teal-100 text-teal-900"     icon={CreditCard}  />
                <StatCard label="Admin Commission"   value={`₹${Number(payStats.adminCommission || 0).toFixed(0)}`}   sub="Platform fees"    color="bg-indigo-50 border-indigo-100 text-indigo-900" icon={TrendingUp}  />
                <StatCard label="Shopkeeper Payouts" value={`₹${Number(payStats.shopkeeperPayouts || 0).toFixed(0)}`} sub="Product amount"   color="bg-violet-50 border-violet-100 text-violet-900" icon={Store}       />
                <StatCard label="Delivery Payouts"   value={`₹${Number(payStats.deliveryPayouts || 0).toFixed(0)}`}   sub="Delivery charges" color="bg-orange-50 border-orange-100 text-orange-900" icon={Truck}       />
              </div>
            )}

            {/* Role breakdown + Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Role breakdown */}
              <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm space-y-4">
                <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" /> User Breakdown by Role
                </h3>
                {[
                  { label: 'Customers',   key: 'Customer',   color: 'bg-blue-500' },
                  { label: 'Shopkeepers', key: 'Shopkeeper', color: 'bg-purple-500' },
                  { label: 'Delivery',    key: 'Delivery',   color: 'bg-amber-500' },
                  { label: 'Doctors',     key: 'Doctor',     color: 'bg-green-500' },
                  { label: 'Admins',      key: 'Admin',      color: 'bg-red-500' },
                ].map(r => (
                  <RoleBar
                    key={r.key}
                    label={r.label}
                    count={roleStats[r.key] || 0}
                    total={totalUsers}
                    color={r.color}
                  />
                ))}
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm">
                <h3 className="text-lg font-black text-slate-900 mb-6">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  {tabs.slice(1).map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setActiveTab(id)}
                      className="flex flex-col items-center gap-3 p-5 bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 rounded-2xl transition-all group"
                    >
                      <Icon className="w-6 h-6 text-slate-400 group-hover:text-blue-600 transition-colors" />
                      <span className="text-xs font-black text-slate-600 group-hover:text-blue-700 text-center leading-tight">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'feeds'          && <ManageFeeds />}
        {activeTab === 'feed-companies' && <ManageFeedCompanies />}
        {activeTab === 'medicines'      && <ManageMedicines />}
        {activeTab === 'repairs'        && <ManageRepairs />}
        {activeTab === 'doctors'        && <ManageDoctors />}
        {activeTab === 'products'       && <ManageProducts />}
        {activeTab === 'orders'         && <ManageOrders />}
        {activeTab === 'payments'       && <ManagePayments />}
        {activeTab === 'users'          && <ManageUsers />}

        {activeTab === 'bookings' && (
          <div className="bg-white rounded-[32px] border border-slate-100 p-10 shadow-sm text-center">
            <Calendar className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-slate-900 mb-2">Consultation Bookings</h3>
            <p className="text-slate-500">Booking management coming soon.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
