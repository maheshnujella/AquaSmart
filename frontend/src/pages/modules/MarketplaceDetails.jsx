import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, TrendingUp, TrendingDown, 
  Minus, Info, ShieldCheck, Calendar, IndianRupee,
  LayoutDashboard, History
} from 'lucide-react';
import ErrorBoundary from '../../components/ErrorBoundary';

const MarketplaceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    try {
      const { data } = await api.get(`/api/market/prices/${id}`);
      setData(data);
    } catch (err) {
      toast.error('Failed to load product details');
      navigate('/marketplace');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      <p className="text-slate-500 font-bold mt-4 uppercase tracking-widest text-xs">Analyzing Market Trends...</p>
    </div>
  );

  if (!data) return <div className="p-20 text-center font-bold text-slate-400">Product data not found.</div>;

  return (
    <ErrorBoundary>
      <div className="space-y-10 pb-20">
        <button 
          onClick={() => navigate('/marketplace')}
          className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-900 transition-all bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Marketplace
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-12 rounded-[48px] shadow-sm border border-slate-100">
              <div className="flex justify-between items-start mb-12">
                <div>
                  <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest mb-4 inline-block">
                    Market Trend Report
                  </span>
                  <h1 className="text-5xl font-black text-slate-900">
                    {data.type} {data.count > 0 ? `(${data.count} Count)` : ''}
                  </h1>
                  <div className="flex items-center gap-2 text-slate-400 mt-4 font-bold">
                    <History className="w-5 h-5" /> Historical movement analysis
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-6xl font-black text-slate-900 flex items-center justify-end">
                    <IndianRupee className="w-10 h-10 text-blue-600" /> {data.currentPrice}
                  </div>
                  <div className={`flex items-center justify-end gap-1 font-black text-lg uppercase tracking-wider mt-2 ${
                    data.trend === 'Uptrend' ? 'text-green-500' : 
                    data.trend === 'Downtrend' ? 'text-red-500' : 'text-amber-500'
                  }`}>
                    {data.trend === 'Uptrend' ? <TrendingUp className="w-5 h-5" /> : 
                     data.trend === 'Downtrend' ? <TrendingDown className="w-5 h-5" /> : <Minus className="w-5 h-5" />}
                    {data.trend} ({data.percentageChange > 0 ? '+' : ''}{data.percentageChange}%)
                  </div>
                </div>
              </div>

              {/* Analysis Summary (Replaced Graph) */}
              <div className="bg-slate-50 p-10 rounded-[40px] border border-slate-100 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <div className="space-y-4">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <LayoutDashboard className="w-4 h-4" /> Smart Analysis
                      </p>
                      <p className="text-2xl font-bold text-slate-800 leading-snug">
                        “{data.analysis}”
                      </p>
                   </div>
                   <div className="space-y-4">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-blue-600" /> Recommendation
                      </p>
                      <p className="text-2xl font-black text-blue-600 leading-snug">
                        {data.recommendation}
                      </p>
                   </div>
                </div>
              </div>

              <div className="mt-12 p-8 border-t border-slate-50 flex items-center justify-between">
                 <div className="flex items-center gap-4 text-slate-400">
                    <Info className="w-6 h-6" />
                    <p className="text-sm font-medium">Data based on last 5 days of aggregated market movements.</p>
                 </div>
                 <button className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black hover:bg-black transition-all">
                    Share Report
                 </button>
              </div>
            </div>
          </div>

          <div className="space-y-8">
             <div className="bg-blue-600 p-10 rounded-[48px] text-white space-y-8 shadow-2xl shadow-blue-200">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <div>
                   <h3 className="text-3xl font-black">Market Alert</h3>
                   <p className="text-blue-100 text-lg mt-4 leading-relaxed font-medium">
                     Our analysis indicates a <strong>{data.trend}</strong>. Prices shifted by <strong>{data.percentageChange}%</strong> in the recent window.
                   </p>
                </div>
                <div className="bg-white/10 p-6 rounded-3xl border border-white/20">
                   <p className="text-xs font-black uppercase tracking-widest text-blue-200 mb-2">Expert Action</p>
                   <p className="text-lg font-bold">{data.recommendation}</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

// Dummy Loader2 if not imported
const Loader2 = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

export default MarketplaceDetails;
