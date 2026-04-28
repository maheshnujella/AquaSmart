import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, X, Loader2, Wrench } from 'lucide-react';

const SERVICE_TYPES = ['Generator Repair','Motor Repair','Electrical Repair','Pump Repair','Plumbing','Other'];
const EMPTY = { name:'', type:'Generator Repair', description:'', price:'', isAvailable:true, image:'' };

const ManageRepairs = () => {
  const { api } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY);

  const fetchItems = async () => {
    try { setLoading(true); const res = await api.get('/api/admin/repair-services'); setItems(res.data.data || []); }
    catch { toast.error('Failed to load services'); } finally { setLoading(false); }
  };
  useEffect(() => { fetchItems(); }, []);

  const openAdd = () => { setForm(EMPTY); setEditId(null); setShowForm(true); };
  const openEdit = (s) => { setForm({ name:s.name, type:s.type, description:s.description||'', price:s.price, isAvailable:s.isAvailable, image:s.image||'' }); setEditId(s._id); setShowForm(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      editId ? await api.put(`/api/admin/repair-services/${editId}`, form) : await api.post('/api/admin/repair-services', form);
      toast.success(editId ? 'Service updated!' : 'Service added!');
      setShowForm(false); fetchItems();
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try { await api.delete(`/api/admin/repair-services/${id}`); toast.success('Deleted'); fetchItems(); }
    catch { toast.error('Delete failed'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-black text-slate-900">Repair Services</h2><p className="text-slate-500 text-sm mt-1">Manage generator, motor &amp; electrical repair</p></div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-bold transition"><Plus size={18}/> Add Service</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-900">{editId ? 'Edit Service' : 'Add Service'}</h3>
              <button onClick={() => setShowForm(false)}><X size={22} className="text-slate-400"/></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Service Name</label>
                <input type="text" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400"/></div>
              <div><label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Type</label>
                <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400">
                  {SERVICE_TYPES.map(t=><option key={t} value={t}>{t}</option>)}</select></div>
              <div><label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Description</label>
                <input type="text" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400"/></div>
              <div><label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Price (₹)</label>
                <input type="number" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} required className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400"/></div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="avail" checked={form.isAvailable} onChange={e=>setForm({...form,isAvailable:e.target.checked})} className="w-4 h-4 accent-orange-500"/>
                <label htmlFor="avail" className="text-sm font-bold text-slate-700">Available</label></div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={()=>setShowForm(false)} className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl font-bold">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 bg-orange-500 text-white py-2.5 rounded-xl font-bold flex items-center justify-center gap-2">
                  {saving&&<Loader2 size={18} className="animate-spin"/>}{saving?'Saving...':'Save Service'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? <div className="flex justify-center py-16"><Loader2 className="animate-spin text-orange-500 w-8 h-8"/></div>
      : items.length===0 ? <div className="bg-white rounded-3xl border border-slate-100 p-16 text-center"><Wrench className="w-12 h-12 text-slate-200 mx-auto mb-4"/><p className="text-slate-500 font-bold">No services yet.</p></div>
      : (
        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>{['Name','Type','Price','Available','Actions'].map(h=><th key={h} className="text-left px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {items.map(s=>(
                <tr key={s._id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 font-bold text-slate-900">{s.name}</td>
                  <td className="px-6 py-4 text-slate-600">{s.type}</td>
                  <td className="px-6 py-4 font-bold text-green-700">₹{s.price}</td>
                  <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-bold ${s.isAvailable?'bg-green-100 text-green-700':'bg-red-100 text-red-600'}`}>{s.isAvailable?'Yes':'No'}</span></td>
                  <td className="px-6 py-4"><div className="flex gap-2">
                    <button onClick={()=>openEdit(s)} className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg"><Pencil size={16}/></button>
                    <button onClick={()=>handleDelete(s._id,s.name)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
export default ManageRepairs;
