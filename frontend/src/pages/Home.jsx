import { Link } from 'react-router-dom';
import { ShoppingBag, HeartPulse, Stethoscope, Wrench, Store, Fuel, TrendingUp, ShieldCheck, Zap } from 'lucide-react';

const modules = [
  { name: 'Product Ordering', icon: <ShoppingBag className="w-6 h-6" />, desc: 'Feed, Minerals, Medicines, Oil & Diesel', path: '/feed', color: 'from-blue-500 to-cyan-400' },
  { name: 'Doctor Consultation', icon: <Stethoscope className="w-6 h-6" />, desc: 'Water testing, Soil testing, Field visit', path: '/consultation', color: 'from-emerald-500 to-teal-400' },
  { name: 'Repair Services', icon: <Wrench className="w-6 h-6" />, desc: 'Generator, Fan sets, Electrical repair', path: '/repair', color: 'from-orange-500 to-amber-400' },
  { name: 'Marketplace', icon: <Store className="w-6 h-6" />, desc: 'Buy & Sell aquaculture products', path: '/market', color: 'from-purple-500 to-indigo-400' },
  { name: 'Delivery System', icon: <Zap className="w-6 h-6" />, desc: 'Swiggy-like live tracking & OTP', path: '/orders', color: 'from-rose-500 to-pink-400' },
  { name: 'Live Tracking', icon: <TrendingUp className="w-6 h-6" />, desc: 'Real-time order tracking & updates', path: '/tracking', color: 'from-blue-600 to-indigo-500' },
];

const Home = () => {
  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 px-6">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-bold animate-fade-in">
              <ShieldCheck className="w-4 h-4" />
              Production Ready MERN Stack
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 leading-[1.1]">
              Smart Solution for <br/>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
                Aquaculture
              </span>
            </h1>
            <p className="text-xl text-slate-500 max-w-2xl">
              Manage your fish and prawn farms with real-time tracking, secure payments, and expert consultations. All-in-one platform for the modern farmer.
            </p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
              <Link to="/register" className="btn-primary">
                Get Started Free
              </Link>
              <Link to="/feed" className="px-8 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm">
                Explore Marketplace
              </Link>
            </div>
          </div>
          
          <div className="flex-1 relative animate-float">
             <div className="w-full aspect-square bg-gradient-to-br from-blue-100 to-cyan-50 rounded-full absolute -z-10 blur-3xl opacity-60"></div>
             <img 
               src="https://images.unsplash.com/photo-1524704654690-b56c05c78a00?auto=format&fit=crop&q=80&w=1000" 
               alt="Aquaculture" 
               className="rounded-3xl shadow-2xl border-8 border-white object-cover w-full h-[500px]"
             />
             <div className="absolute -bottom-6 -left-6 glass-card p-6 flex items-center gap-4 animate-float">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Daily Market Price</p>
                  <p className="text-lg font-bold text-slate-900">₹450/kg <span className="text-green-500 text-sm">↑ 12%</span></p>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900">Core Ecosystem</h2>
          <p className="text-slate-500 max-w-2xl mx-auto">Everything you need to run your aquaculture business efficiently and securely.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {modules.map((mod, index) => (
            <Link to={mod.path} key={index} className="group glass-card p-8 flex flex-col items-start text-left">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${mod.color} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 mb-6`}>
                {mod.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">{mod.name}</h3>
              <p className="text-slate-500 leading-relaxed">{mod.desc}</p>
              <div className="mt-6 flex items-center gap-2 text-blue-600 font-bold text-sm opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all">
                Learn More <span>→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-6 py-16 bg-slate-900 rounded-[40px] text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 blur-[120px] rounded-full"></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 text-center relative z-10">
          {[
            { label: 'Active Farmers', val: '10k+' },
            { label: 'Registered Shops', val: '500+' },
            { label: 'Daily Consultations', val: '1.2k' },
            { label: 'Success Rate', val: '99.9%' },
          ].map((stat, i) => (
            <div key={i} className="space-y-2">
              <p className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">{stat.val}</p>
              <p className="text-slate-400 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
