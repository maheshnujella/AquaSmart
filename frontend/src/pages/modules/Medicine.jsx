import { useState, useEffect, useContext } from 'react';
import api from '../../api';
import toast from 'react-hot-toast';
import { ShoppingCart, Search, Loader2, Package, AlertCircle } from 'lucide-react';
import { CartContext } from '../../context/CartContext';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80';

const Medicine = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    const fetchMedicines = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get('/api/products?category=Medicine');
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        setError('Failed to load medicine products. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchMedicines();
  }, []);

  const filtered = products.filter((p) => {
    const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'All' || p.subCategory === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 flex items-center gap-3">
            💊 Aqua Medicine & Minerals
          </h1>
          <p className="text-slate-500 font-medium mt-1">Treatments, probiotics, and mineral supplements</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search medicine..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-64 pl-10 pr-4 py-3 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
          >
            <option value="All">All Types</option>
            <option value="Fish Medicine">Fish Medicine</option>
            <option value="Water Treatment">Water Treatment</option>
            <option value="Minerals">Minerals</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
          <p className="text-slate-500 font-medium mt-4">Loading medicines...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-100 rounded-[32px] p-10 flex flex-col items-center gap-4 text-center">
          <AlertCircle className="w-10 h-10 text-red-400" />
          <p className="text-red-600 font-bold">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-red-700 transition"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && products.length === 0 && (
        <div className="bg-white rounded-[40px] border-2 border-dashed border-slate-100 p-20 flex flex-col items-center gap-4">
          <Package className="w-16 h-16 text-slate-200" />
          <p className="text-slate-400 font-black text-xl">No medicine products available</p>
          <p className="text-slate-400 font-medium text-sm text-center max-w-xs">
            The admin hasn't added any medicine products yet.
          </p>
        </div>
      )}

      {/* Products Grid */}
      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((product) => (
            <div
              key={product._id}
              className="group bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
            >
              <div className="relative h-48 bg-slate-100 overflow-hidden">
                <img
                  src={product.image || FALLBACK_IMAGE}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
                />
                <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-green-600 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest">
                  {product.subCategory || product.category}
                </span>
                {product.stock === 0 && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="bg-white text-slate-900 font-black px-4 py-2 rounded-full text-sm">Out of Stock</span>
                  </div>
                )}
              </div>
              <div className="p-5 space-y-4">
                <h3 className="font-black text-slate-900 leading-snug line-clamp-2">{product.name}</h3>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-black text-green-600">₹{Number(product.price).toFixed(2)}</p>
                  <p className="text-xs text-slate-400 font-bold">{product.stock} units left</p>
                </div>
                <button
                  onClick={() => addToCart(product)}
                  disabled={product.stock === 0}
                  className="w-full bg-slate-900 hover:bg-green-600 text-white py-3 rounded-2xl font-black flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="w-4 h-4" /> Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && products.length > 0 && (
        <div className="text-center py-16 text-slate-400 font-medium">
          No products match your search.
        </div>
      )}
    </div>
  );
};

export default Medicine;
