import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, X, Loader2, FlaskConical } from 'lucide-react';

const EMPTY = { name: '', subCategory: '', description: '', price: '', stock: '', image: '' };

const ManageMedicines = () => {
  const { api } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/admin/medicines');
      setItems(res.data.data || []);
    } catch {
      toast.error('Failed to load medicines');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const openAdd = () => { setForm(EMPTY); setEditId(null); setShowForm(true); };
  const openEdit = (m) => { setForm({ name: m.name, subCategory: m.subCategory || '', description: m.description || '', price: m.price, stock: m.stock, image: m.image || '' }); setEditId(m._id); setShowForm(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editId) {
        await api.put(`/api/admin/medicines/${editId}`, form);
        toast.success('Medicine updated!');
      } else {
        await api.post('/api/admin/medicines', form);
        toast.success('Medicine added!');
      }
      setShowForm(false);
      fetchItems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await api.delete(`/api/admin/medicines/${id}`);
      toast.success('Medicine deleted');
      fetchItems();
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Medicine Management</h2>
          <p className="text-slate-500 text-sm mt-1">Manage minerals, supplements &amp; treatments</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl font-bold transition">
          <Plus size={18} /> Add Medicine
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-900">{editId ? 'Edit Medicine' : 'Add Medicine'}</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X size={22} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {[['name','Medicine Name','text',true],['subCategory','Category (e.g. Mineral, Supplement, Treatment)','text',false],['description','Description / Usage','text',false],['price','Price (₹)','number',true],['stock','Stock Qty','number',false],['image','Image URL','text',false]].map(([key, label, type, req]) => (
                <div key={key}>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">{label}</label>
                  <input type={type} value={form[key]} onChange={e => setForm({...form, [key]: e.target.value})} required={req}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl font-bold hover:bg-slate-50 transition">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 bg-purple-600 text-white py-2.5 rounded-xl font-bold hover:bg-purple-700 transition flex items-center justify-center gap-2">
                  {saving ? <Loader2 size={18} className="animate-spin" /> : null}{saving ? 'Saving...' : 'Save Medicine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-purple-500 w-8 h-8" /></div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-16 text-center">
          <FlaskConical className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500 font-bold">No medicines added yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>{['Name','Category','Price','Stock','Actions'].map(h => <th key={h} className="text-left px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {items.map(m => (
                <tr key={m._id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 font-bold text-slate-900">{m.name}</td>
                  <td className="px-6 py-4 text-slate-600">{m.subCategory || '—'}</td>
                  <td className="px-6 py-4 font-bold text-green-700">₹{m.price}</td>
                  <td className="px-6 py-4 text-slate-600">{m.stock}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(m)} className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition"><Pencil size={16} /></button>
                      <button onClick={() => handleDelete(m._id, m.name)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 size={16} /></button>
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

export default ManageMedicines;
