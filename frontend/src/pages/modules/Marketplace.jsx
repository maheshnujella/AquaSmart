import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { 
  Store, ShoppingBag, ArrowRight, Loader2, 
  TrendingUp, TrendingDown, Minus, Info, 
  ShieldCheck, IndianRupee, Users, Plus,
  MapPin, Scale, MessageSquare
} from 'lucide-react';
import ErrorBoundary from '../../components/ErrorBoundary';

const Marketplace = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('listings'); // 'listings' or 'analysis'
  
  // Listings State
  const [listings, setListings] = useState([]);
  const [loadingListings, setLoadingListings] = useState(true);

  // Analysis State
  const [category, setCategory] = useState('Prawn');
  const [count, setCount] = useState(30);
  const [trendData, setTrendData] = useState(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  useEffect(() => {
    if (activeTab === 'listings') {
      fetchListings();
    } else {
      fetchTrends();
    }
  }, [activeTab, category, count]);

  const fetchListings = async () => {
    setLoadingListings(true);
    try {
      const { data } = await axios.get('/api/listings');
      setListings(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Failed to load listings');
      setListings([]);
    } finally {
      setLoadingListings(false);
    }
  };

  const fetchTrends = async () => {
    setLoadingAnalysis(true);
    try {
      const { data } = await axios.get(`/api/market/trends?type=${category}&count=${count}`);
      setTrendData(data);
    } catch (err) {
      toast.error('Failed to load trends');
    } finally {
      setLoadingAnalysis(false);
    }
  };

  return (
    <ErrorBoundary>
      <div className="space-y-8 pb-20">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
          <div>
            <h1 className="text-4xl font-black text-slate-900 flex items-center gap-3">
              <Store className="w-10 h-10 text-blue-600" /> Aqua Marketplace
            </h1>
            <p className="text-slate-500 font-medium mt-1">Buy and sell aquaculture crops directly with farmers.</p>
          </div>
          
          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 w-full lg:w-auto">
            <button 
              onClick={() => setActiveTab('listings')}
              className={`flex-1 lg:flex-none px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'listings' ? 'bg-white shadow-md text-blue-600' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Users className="w-4 h-4" /> Buyer/Seller
            </button>
            <button 
              onClick={() => setActiveTab('analysis')}
              className={`flex-1 lg:flex-none px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'analysis' ? 'bg-white shadow-md text-blue-600' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <TrendingUp className="w-4 h-4" /> Market Info
            </button>
          </div>
        </div>

        {activeTab === 'listings' ? (
          <div className="space-y-8 animate-fade-in">
             <div className="flex justify-between items-center px-4">
                <h2 className="text-2xl font-black text-slate-900">Active Listings</h2>
                <button className="bg-blue-600 text-white px-6 py-2.5 rounded-2xl font-black flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-blue-200">
                   <Plus className="w-4 h-4" /> Sell My Crop
                </button>
             </div>

             {loadingListings ? (
               <div className="flex flex-col items-center justify-center min-h-[300px]">
                 <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
               </div>
             ) : listings.length === 0 ? (
               <div className="bg-white p-20 rounded-[40px] border-2 border-dashed border-slate-100 text-center space-y-4 shadow-sm">
                 <ShoppingBag className="w-16 h-16 text-slate-200 mx-auto" />
                 <p className="text-slate-400 font-black text-xl">No active listings yet</p>
                 <p className="text-slate-400 font-medium max-w-xs mx-auto">Be the first to list your fish or prawn harvest for sale.</p>
               </div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {listings.map((item) => (
                   <div key={item._id} className="group bg-white rounded-[40px] p-2 border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                     <div className="relative h-48 rounded-[32px] overflow-hidden bg-slate-100">
                        {item.images?.[0] ? (
                          <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Store className="w-12 h-12 text-slate-300" />
                          </div>
                        )}
                        <div className="absolute top-4 left-4">
                           <span className="bg-white/90 backdrop-blur-md text-blue-600 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
                             {item.cropType}
                           </span>
                        </div>
                     </div>
                     
                     <div className="p-6 space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-xl font-black text-slate-900 line-clamp-1">{item.title}</h3>
                            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold mt-1">
                               <MapPin className="w-3 h-3" /> {item.location}
                            </div>
                          </div>
                          <div className="text-right">
                             <p className="text-2xl font-black text-blue-600">₹{item.pricePerUnit}</p>
                             <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">per kg</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-50">
                           <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center">
                                 <Scale className="w-4 h-4 text-slate-400" />
                              </div>
                              <div className="flex flex-col">
                                 <span className="text-[10px] text-slate-400 font-bold uppercase">Quantity</span>
                                 <span className="text-sm font-black text-slate-800">{item.quantity} kg</span>
                              </div>
                           </div>
                           <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center">
                                 <Users className="w-4 h-4 text-slate-400" />
                              </div>
                              <div className="flex flex-col">
                                 <span className="text-[10px] text-slate-400 font-bold uppercase">Seller</span>
                                 <span className="text-sm font-black text-slate-800 truncate">{item.seller?.name || 'Farmer'}</span>
                              </div>
                           </div>
                        </div>

                        <div className="flex gap-2">
                           <button className="flex-1 bg-slate-900 text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all">
                              <MessageSquare className="w-4 h-4" /> Contact
                           </button>
                           <button className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center hover:bg-blue-100 transition-all">
                              <ArrowRight className="w-5 h-5" />
                           </button>
                        </div>
                     </div>
                   </div>
                 ))}
               </div>
             )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-fade-in">
             <div className="lg:col-span-2 space-y-8">
                <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm space-y-10">
                  {loadingAnalysis ? (
                    <div className="h-[200px] flex items-center justify-center">
                       <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                    </div>
                  ) : trendData ? (
                    <div className="space-y-10">
                       <div className="flex justify-between items-start">
                          <div>
                            <span className="bg-blue-100 text-blue-600 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest mb-2 inline-block">
                               Current Market Info
                            </span>
                            <h3 className="text-3xl font-black text-slate-900">{category} Analysis</h3>
                            <p className="text-slate-500 font-medium text-sm flex items-center gap-1 mt-1">
                               <Info className="w-4 h-4 text-blue-600" /> Historical analysis for the last 5 days
                            </p>
                          </div>
                          <div className="text-right">
                             <div className="text-5xl font-black text-slate-900 flex items-center justify-end">
                               <IndianRupee className="w-8 h-8" /> {trendData.currentPrice}
                             </div>
                             <div className={`flex items-center justify-end gap-1 font-black text-sm uppercase tracking-wider mt-1 ${
                               trendData.trend === 'Uptrend' ? 'text-green-500' : 
                               trendData.trend === 'Downtrend' ? 'text-red-500' : 'text-amber-500'
                             }`}>
                               {trendData.trend === 'Uptrend' ? <TrendingUp className="w-4 h-4" /> : 
                                trendData.trend === 'Downtrend' ? <TrendingDown className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                               {trendData.trend} ({trendData.percentageChange > 0 ? '+' : ''}{trendData.percentageChange}%)
                             </div>
                          </div>
                       </div>

                       <div className="h-[350px] w-full">
                         {trendData.history && trendData.history.length >= 2 ? (
                           <ResponsiveContainer width="100%" height="100%">
                             <AreaChart data={trendData.history}>
                               <defs>
                                 <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                                   <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                                 </linearGradient>
                               </defs>
                               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                               <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#64748b' }} dy={10} />
                               <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#64748b' }} />
                               <Tooltip 
                                 contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px' }}
                                 itemStyle={{ fontWeight: 800, color: '#1e293b' }}
                               />
                               <Area type="monotone" dataKey="price" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorPrice)" />
                             </AreaChart>
                           </ResponsiveContainer>
                         ) : (
                           <div className="h-full flex flex-col items-center justify-center text-slate-400 font-bold space-y-2">
                              <Info className="w-10 h-10" />
                              <p>Not enough data for graph visualization</p>
                           </div>
                         )}
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-slate-50 rounded-[32px] border border-slate-100">
                          <div className="space-y-3">
                             <p className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                               <TrendingUp className="w-4 h-4" /> Smart Analysis
                             </p>
                             <p className="text-xl font-bold text-slate-800 leading-snug italic">
                               “{trendData.analysis}”
                             </p>
                          </div>
                          <div className="space-y-3">
                             <p className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                               <ShieldCheck className="w-4 h-4 text-blue-600" /> Recommendation
                             </p>
                             <p className="text-xl font-black text-blue-600 leading-snug">
                               {trendData.recommendation}
                             </p>
                          </div>
                       </div>
                    </div>
                  ) : (
                    <div className="p-20 text-center text-slate-400 font-bold">Select parameters to view analysis</div>
                  )}
                </div>
             </div>

             <div className="space-y-8">
                <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
                   <h3 className="text-lg font-bold text-slate-900 mb-6 uppercase tracking-widest text-xs">Analysis Filter</h3>
                   
                   <div className="space-y-6">
                      <div className="space-y-3">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Select Crop</p>
                        <div className="flex gap-2">
                          {['Prawn', 'Fish'].map(cat => (
                            <button
                              key={cat}
                              onClick={() => setCategory(cat)}
                              className={`flex-1 py-3 rounded-xl border-2 font-black transition-all ${
                                category === cat ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'
                              }`}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                      </div>

                      {category === 'Prawn' && (
                        <div className="space-y-3">
                           <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Select Count</p>
                           <div className="grid grid-cols-2 gap-2">
                              {[10, 20, 30, 40].map(cnt => (
                                <button
                                  key={cnt}
                                  onClick={() => setCount(cnt)}
                                  className={`py-3 rounded-xl border-2 font-black transition-all ${
                                    count === cnt ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'
                                  }`}
                                >
                                  {cnt} Count
                                </button>
                              ))}
                           </div>
                        </div>
                      )}
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default Marketplace;
