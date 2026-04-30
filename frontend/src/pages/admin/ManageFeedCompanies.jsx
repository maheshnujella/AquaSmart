import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Plus, Edit3, Trash2, ChevronDown, ChevronRight,
  Loader2, Factory, Tag, X, Check, RefreshCw
} from 'lucide-react';

// ── Modal ─────────────────────────────────────────────────────────────────────
const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
    <div className="relative bg-white rounded-[28px] shadow-2xl w-full max-w-md p-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-black text-slate-900">{title}</h3>
        <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition">
          <X className="w-4 h-4 text-slate-600" />
        </button>
      </div>
      {children}
    </div>
  </div>
);

const InputField = ({ label, ...props }) => (
  <div>
    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">{label}</label>
    <input {...props} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
  </div>
);

// ── Main Component ─────────────────────────────────────────────────────────────
const ManageFeedCompanies = () => {
  const { api } = useContext(AuthContext);
  const [companies, setCompanies]       = useState([]);
  const [subcats, setSubcats]           = useState({});     // { companyId: [...] }
  const [expanded, setExpanded]         = useState({});
  const [loading, setLoading]           = useState(true);
  const [modal, setModal]               = useState(null);   // { type, data }

  // ── Fetch companies ────────────────────────────────────────────────────────
  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/admin/feed-companies');
      setCompanies(data.data || []);
    } catch { toast.error('Failed to load companies'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCompanies(); }, []);

  // ── Toggle expand → fetch subcategories ────────────────────────────────────
  const toggleExpand = async (companyId) => {
    const next = !expanded[companyId];
    setExpanded(prev => ({ ...prev, [companyId]: next }));
    if (next && !subcats[companyId]) {
      try {
        const { data } = await api.get(`/api/admin/feed-subcategories?company=${companyId}`);
        setSubcats(prev => ({ ...prev, [companyId]: data.data || [] }));
      } catch { toast.error('Failed to load subcategories'); }
    }
  };

  // ── Company CRUD ───────────────────────────────────────────────────────────
  const saveCompany = async (form) => {
    try {
      if (modal.data?._id) {
        await api.put(`/api/admin/feed-companies/${modal.data._id}`, form);
        toast.success('Company updated');
      } else {
        await api.post('/api/admin/feed-companies', form);
        toast.success('Company created');
      }
      setModal(null);
      fetchCompanies();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const deleteCompany = async (id, name) => {
    if (!window.confirm(`Delete "${name}" and all its subcategories?`)) return;
    try {
      await api.delete(`/api/admin/feed-companies/${id}`);
      toast.success('Company deleted');
      fetchCompanies();
    } catch { toast.error('Delete failed'); }
  };

  // ── Subcategory CRUD ───────────────────────────────────────────────────────
  const saveSubcat = async (form) => {
    try {
      const companyId = modal.companyId;
      if (modal.data?._id) {
        await api.put(`/api/admin/feed-subcategories/${modal.data._id}`, form);
        toast.success('Subcategory updated');
      } else {
        await api.post('/api/admin/feed-subcategories', { ...form, company: companyId });
        toast.success('Subcategory created');
      }
      setModal(null);
      // Refresh subcats for this company
      const { data } = await api.get(`/api/admin/feed-subcategories?company=${companyId}`);
      setSubcats(prev => ({ ...prev, [companyId]: data.data || [] }));
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const deleteSubcat = async (id, name, companyId) => {
    if (!window.confirm(`Delete subcategory "${name}"?`)) return;
    try {
      await api.delete(`/api/admin/feed-subcategories/${id}`);
      toast.success('Subcategory deleted');
      const { data } = await api.get(`/api/admin/feed-subcategories?company=${companyId}`);
      setSubcats(prev => ({ ...prev, [companyId]: data.data || [] }));
    } catch { toast.error('Delete failed'); }
  };

  // ── Form Component ─────────────────────────────────────────────────────────
  const CompanyForm = ({ initial = {}, onSubmit }) => {
    const [form, setForm] = useState({ name: initial.name || '', description: initial.description || '' });
    return (
      <div className="space-y-4">
        <InputField label="Company Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Vanami, Sadhya" required />
        <InputField label="Description (optional)" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Short description..." />
        <button onClick={() => onSubmit(form)} className="w-full bg-blue-600 text-white py-3 rounded-xl font-black hover:bg-blue-700 transition">
          Save Company
        </button>
      </div>
    );
  };

  const SubcatForm = ({ initial = {}, onSubmit }) => {
    const [form, setForm] = useState({ name: initial.name || '', description: initial.description || '' });
    return (
      <div className="space-y-4">
        <InputField label="Subcategory Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. 1s, 2s, 3s" required />
        <InputField label="Description (optional)" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="e.g. Size 1 pellets" />
        <button onClick={() => onSubmit(form)} className="w-full bg-blue-600 text-white py-3 rounded-xl font-black hover:bg-blue-700 transition">
          Save Subcategory
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900">Feed Companies</h2>
          <p className="text-slate-500 text-sm mt-1">Manage feed brands and their product subcategories</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchCompanies} className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition">
            <RefreshCw className={`w-4 h-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setModal({ type: 'company', data: null })}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-black hover:bg-blue-700 transition shadow-lg shadow-blue-200"
          >
            <Plus className="w-4 h-4" /> Add Company
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 text-blue-600 animate-spin" /></div>
      ) : companies.length === 0 ? (
        <div className="bg-white rounded-[32px] border border-slate-100 p-16 text-center shadow-sm">
          <Factory className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p className="text-xl font-black text-slate-400">No feed companies yet</p>
          <button onClick={() => setModal({ type: 'company', data: null })} className="mt-4 text-blue-600 font-bold hover:underline">
            Add first company →
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {companies.map(company => (
            <div key={company._id} className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden">
              {/* Company Row */}
              <div className="flex items-center gap-4 p-5">
                <button onClick={() => toggleExpand(company._id)} className="flex-1 flex items-center gap-4 text-left">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Factory className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-slate-900">{company.name}</p>
                    {company.description && <p className="text-xs text-slate-400">{company.description}</p>}
                  </div>
                  {expanded[company._id]
                    ? <ChevronDown className="w-5 h-5 text-slate-400" />
                    : <ChevronRight className="w-5 h-5 text-slate-400" />
                  }
                </button>
                <button
                  onClick={() => setModal({ type: 'company', data: company })}
                  className="p-2 rounded-xl hover:bg-slate-100 transition text-slate-400 hover:text-blue-600"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteCompany(company._id, company.name)}
                  className="p-2 rounded-xl hover:bg-red-50 transition text-slate-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Subcategories Panel */}
              {expanded[company._id] && (
                <div className="border-t border-slate-100 bg-slate-50 p-4">
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Subcategories</p>
                    <button
                      onClick={() => setModal({ type: 'subcat', data: null, companyId: company._id })}
                      className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Subcategory
                    </button>
                  </div>
                  {!subcats[company._id] ? (
                    <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 text-blue-400 animate-spin" /></div>
                  ) : subcats[company._id].length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-4">No subcategories yet</p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {subcats[company._id].map(sub => (
                        <div key={sub._id} className="bg-white rounded-xl p-3 border border-slate-100 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <Tag className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                            <span className="text-sm font-bold text-slate-800 truncate">{sub.name}</span>
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            <button
                              onClick={() => setModal({ type: 'subcat', data: sub, companyId: company._id })}
                              className="p-1 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => deleteSubcat(sub._id, sub.name, company._id)}
                              className="p-1 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {modal?.type === 'company' && (
        <Modal
          title={modal.data ? 'Edit Company' : 'Add Feed Company'}
          onClose={() => setModal(null)}
        >
          <CompanyForm initial={modal.data || {}} onSubmit={saveCompany} />
        </Modal>
      )}
      {modal?.type === 'subcat' && (
        <Modal
          title={modal.data ? 'Edit Subcategory' : 'Add Subcategory'}
          onClose={() => setModal(null)}
        >
          <SubcatForm initial={modal.data || {}} onSubmit={saveSubcat} />
        </Modal>
      )}
    </div>
  );
};

export default ManageFeedCompanies;
