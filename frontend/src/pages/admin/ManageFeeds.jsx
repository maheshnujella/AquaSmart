import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, X, Loader2, Fish } from 'lucide-react';

const EMPTY = { name: '', subCategory: '', description: '', price: '', stock: '', image: '' };

const ManageFeeds = () => {
  const { api } = useContext(AuthContext);
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY);

  const fetchFeeds = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/admin/feeds');
      setFeeds(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load feeds');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFeeds(); }, []);

  const openAdd = () => { setForm(EMPTY); setEditId(null); setShowForm(true); };
  const openEdit = (f) => { setForm({ name: f.name, subCategory: f.subCategory || '', description: f.description || '', price: f.price, stock: f.stock, image: f.image || '' }); setEditId(f._id); setShowForm(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editId) {
        await api.put(`/api/admin/feeds/${editId}`, form);
        toast.success('Feed updated!');
      } else {
        await api.post('/api/admin/feeds', form);
        toast.success('Feed added!');
      }
      setShowForm(false);
      fetchFeeds();
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
      fetchFeeds();
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Feed Management</h2>
          <p className="text-slate-500 text-sm mt-1">Manage aquaculture feed products</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition">
          <Plus size={18} /> Add Feed
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-900">{editId ? 'Edit Feed' : 'Add Feed'}</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X size={22} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {[['name','Feed Name','text',true],['subCategory','Sub-Category (e.g. Vannamei, Sadhya)','text',false],['description','Description','text',false],['price','Price (₹)','number',true],['stock','Stock Qty','number',false],['image','Image URL','text',false]].map(([key, label, type, req]) => (
                <div key={key}>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">{label}</label>
                  <input type={type} value={form[key]} onChange={e => setForm({...form, [key]: e.target.value})} required={req}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl font-bold hover:bg-slate-50 transition">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2">
                  {saving ? <Loader2 size={18} className="animate-spin" /> : null}{saving ? 'Saving...' : 'Save Feed'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-blue-500 w-8 h-8" /></div>
      ) : feeds.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-16 text-center">
          <Fish className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500 font-bold">No feeds added yet. Click "+ Add Feed" to get started.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>{['Name','Sub-Category','Price','Stock','Actions'].map(h => <th key={h} className="text-left px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {feeds.map(f => (
                <tr key={f._id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 font-bold text-slate-900">{f.name}</td>
                  <td className="px-6 py-4 text-slate-600">{f.subCategory || '—'}</td>
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
