import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, X, Loader2, FlaskConical, Upload } from 'lucide-react';

const EMPTY = { name: '', subCategory: '', description: '', price: '', stock: '', image: '' };

const ManageMedicines = () => {
  const { api } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [uploading, setUploading]   = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const uploadImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result;
      setImagePreview(base64);
      setForm((prev) => ({ ...prev, image: base64 }));
      setUploading(false);
      toast.success('Image ready');
    };
    reader.onerror = () => {
      toast.error('Failed to read image');
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

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

  const openAdd = () => { setForm(EMPTY); setEditId(null); setImagePreview(null); setShowForm(true); };
  const openEdit = (m) => { setForm({ name: m.name, subCategory: m.subCategory || '', description: m.description || '', price: m.price, stock: m.stock, image: m.image || '' }); setEditId(m._id); setImagePreview(m.image || null); setShowForm(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      
      const payload = { ...form };
      if (!payload.description) payload.description = 'No description provided';
      if (!payload.stock) payload.stock = 0;
      payload.price = Number(payload.price) || 0;

      if (editId) {
        await api.put(`/api/admin/medicines/${editId}`, payload);
        toast.success('Medicine updated!');
      } else {
        await api.post('/api/admin/medicines', payload);
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
              {[['name','Medicine Name','text',true],['subCategory','Category (e.g. Mineral, Supplement, Treatment)','text',false],['description','Description / Usage','text',false],['price','Price (₹)','number',true],['stock','Stock Qty','number',false]].map(([key, label, type, req]) => (
                <div key={key}>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">{label}</label>
                  <input type={type} value={form[key]} onChange={e => setForm({...form, [key]: e.target.value})} required={req}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
              ))}

              {/* Image Upload */}
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 bg-slate-50 text-center">
                <Upload className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                <p className="text-xs text-slate-500 mb-2">Upload medicine image</p>
                <input type="file" onChange={uploadImage} accept="image/*"
                  className="block w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100" />
                {uploading && <p className="text-xs text-purple-600 mt-2 flex items-center justify-center gap-1"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Reading...</p>}
                {imagePreview && <img src={imagePreview} alt="Preview" className="h-20 object-contain rounded-lg border border-slate-200 mt-3 mx-auto" />}
              </div>
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
                  <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-3">
                    {m.image ? (
                      <img src={m.image.startsWith('http') || m.image.startsWith('data:') ? m.image : `${api.defaults.baseURL || 'https://aquasmart-ilif.onrender.com'}${m.image.startsWith('/') ? '' : '/'}${m.image}`} alt={m.name} className="w-8 h-8 rounded-lg object-cover" onError={e => { e.target.style.display='none'; }} />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600"><FlaskConical className="w-4 h-4" /></div>
                    )}
                    <span>{m.name}</span>
                  </td>
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
