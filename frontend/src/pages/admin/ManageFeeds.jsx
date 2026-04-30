import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, X, Loader2, Fish, Factory, Tag } from 'lucide-react';

const EMPTY = { name: '', subCategory: '', description: '', price: '', stock: '', image: '', companyId: '', feedSubcategoryId: '' };

const ManageFeeds = () => {
  const { api } = useContext(AuthContext);
  const [feeds, setFeeds]           = useState([]);
  const [companies, setCompanies]   = useState([]);
  const [subcats, setSubcats]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [showForm, setShowForm]     = useState(false);
  const [editId, setEditId]         = useState(null);
  const [form, setForm]             = useState(EMPTY);
  const [filterCompany, setFilterCompany] = useState('');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [feedsRes, compRes] = await Promise.allSettled([
        api.get('/api/admin/feeds'),
        api.get('/api/admin/feed-companies'),
      ]);
      if (feedsRes.status === 'fulfilled') setFeeds(feedsRes.value.data.data || []);
      if (compRes.status  === 'fulfilled') setCompanies(compRes.value.data.data || []);
    } catch { toast.error('Failed to load data'); }
    finally  { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  // Load subcats when company changes in form
  const handleCompanyChange = async (companyId) => {
    setForm(f => ({ ...f, companyId, feedSubcategoryId: '' }));
    if (!companyId) { setSubcats([]); return; }
    try {
      const { data } = await api.get(`/api/admin/feed-subcategories?company=${companyId}`);
      setSubcats(data.data || []);
    } catch { setSubcats([]); }
  };

  const openAdd = () => {
    setForm(EMPTY);
    setSubcats([]);
    setEditId(null);
    setShowForm(true);
  };

  const openEdit = (f) => {
    const companyId = f.company?._id || f.company || '';
    setForm({
      name: f.name,
      subCategory: f.subCategory || '',
      description: f.description || '',
      price: f.price,
      stock: f.stock,
      image: f.image || '',
      companyId,
      feedSubcategoryId: f.feedSubcategory?._id || f.feedSubcategory || '',
    });
    setEditId(f._id);
    setShowForm(true);
    if (companyId) {
      api.get(`/api/admin/feed-subcategories?company=${companyId}`)
        .then(r => setSubcats(r.data.data || []))
        .catch(() => {});
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const selectedCompany = companies.find(c => c._id === form.companyId);
      const selectedSubcat  = subcats.find(s => s._id === form.feedSubcategoryId);
      const payload = {
        name:               form.name,
        subCategory:        selectedSubcat?.name || form.subCategory,
        description:        form.description,
        price:              form.price,
        stock:              form.stock,
        image:              form.image,
        company:            form.companyId || undefined,
        feedSubcategory:    form.feedSubcategoryId || undefined,
        companyName:        selectedCompany?.name || '',
        feedSubcategoryName:selectedSubcat?.name || '',
      };
      if (editId) {
        await api.put(`/api/admin/feeds/${editId}`, payload);
        toast.success('Feed updated!');
      } else {
        await api.post('/api/admin/feeds', payload);
        toast.success('Feed added!');
      }
      setShowForm(false);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await api.delete(`/api/admin/feeds/${id}`);
      toast.success('Feed deleted');
      fetchAll();
    } catch { toast.error('Delete failed'); }
  };

  const filtered = filterCompany
    ? feeds.filter(f => (f.company?._id || f.company) === filterCompany)
    : feeds;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Feed Management</h2>
          <p className="text-slate-500 text-sm mt-1">Manage aquaculture feed products with company hierarchy</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition shadow-lg shadow-blue-200">
          <Plus size={18} /> Add Feed
        </button>
      </div>

      {/* Company filter chips */}
      {companies.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterCompany('')}
            className={`px-4 py-1.5 rounded-xl text-sm font-bold transition ${!filterCompany ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300'}`}
          >
            All Companies
          </button>
          {companies.map(c => (
            <button
              key={c._id}
              onClick={() => setFilterCompany(c._id)}
              className={`px-4 py-1.5 rounded-xl text-sm font-bold transition flex items-center gap-1.5 ${filterCompany === c._id ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300'}`}
            >
              <Factory className="w-3.5 h-3.5" /> {c.name}
            </button>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-900">{editId ? 'Edit Feed' : 'Add Feed'}</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X size={22} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Company selector */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Feed Company</label>
                <select
                  value={form.companyId}
                  onChange={e => handleCompanyChange(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">— Select Company (optional) —</option>
                  {companies.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>

              {/* Subcategory selector */}
              {subcats.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                    <Tag className="inline w-3.5 h-3.5 mr-1" />Subcategory (Size)
                  </label>
                  <select
                    value={form.feedSubcategoryId}
                    onChange={e => setForm(f => ({ ...f, feedSubcategoryId: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">— Select Size —</option>
                    {subcats.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                </div>
              )}

              {[
                ['name', 'Feed Name', 'text', true],
                ['description', 'Description', 'text', false],
                ['price', 'Price (₹)', 'number', true],
                ['stock', 'Stock Qty', 'number', false],
                ['image', 'Image URL', 'text', false],
              ].map(([key, label, type, req]) => (
                <div key={key}>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">{label}</label>
                  <input
                    type={type}
                    value={form[key]}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                    required={req}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl font-bold hover:bg-slate-50 transition">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2">
                  {saving ? <><Loader2 size={18} className="animate-spin" /> Saving...</> : 'Save Feed'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-blue-500 w-8 h-8" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-16 text-center">
          <Fish className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500 font-bold">No feeds found. Click "+ Add Feed" to get started.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {['Name', 'Company', 'Subcategory', 'Price', 'Stock', 'Actions'].map(h => (
                  <th key={h} className="text-left px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(f => (
                <tr key={f._id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {f.image && <img src={f.image} alt={f.name} className="w-8 h-8 rounded-lg object-cover" onError={e => { e.target.style.display='none'; }} />}
                      <span className="font-bold text-slate-900">{f.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {f.companyName ? (
                      <span className="flex items-center gap-1 text-slate-600">
                        <Factory className="w-3.5 h-3.5 text-blue-500" /> {f.companyName}
                      </span>
                    ) : <span className="text-slate-400">—</span>}
                  </td>
                  <td className="px-6 py-4">
                    {f.feedSubcategoryName || f.subCategory
                      ? <span className="flex items-center gap-1 text-slate-600"><Tag className="w-3.5 h-3.5 text-purple-500" />{f.feedSubcategoryName || f.subCategory}</span>
                      : <span className="text-slate-400">—</span>
                    }
                  </td>
                  <td className="px-6 py-4 font-bold text-green-700">₹{f.price}</td>
                  <td className="px-6 py-4 text-slate-600">{f.stock}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(f)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"><Pencil size={16} /></button>
                      <button onClick={() => handleDelete(f._id, f.name)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageFeeds;
