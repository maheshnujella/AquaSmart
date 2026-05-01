import { useState, useEffect, useRef } from 'react';
import api from '../../api';
import toast from 'react-hot-toast';
import { Upload, Plus, Save, Loader2, Trash2, Pencil, X, Package, RefreshCw } from 'lucide-react';

const EMPTY_FORM = {
  name: '', category: 'Feed', subCategory: 'Vanami Feed',
  price: '', stock: '', description: '', image: ''
};

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/products');
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const uploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
    const uploadData = new FormData();
    uploadData.append('image', file);
    setUploading(true);
    try {
      const { data } = await api.post('/api/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFormData((prev) => ({ ...prev, image: data }));
      toast.success('Image uploaded');
    } catch {
      toast.error('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (prod) => {
    setFormData({
      name: prod.name, category: prod.category, subCategory: prod.subCategory || '',
      price: prod.price, stock: prod.stock, description: prod.description || '', image: prod.image || ''
    });
    setImagePreview(prod.image || null);
    setEditId(prod._id);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    setDeleting(id);
    try {
      await api.delete(`/api/products/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      toast.success('Product deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(null);
    }
  };

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setImagePreview(null);
    setIsEditing(false);
    setEditId(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isEditing) {
        const { data } = await api.put(`/api/products/${editId}`, formData);
        setProducts((prev) => prev.map((p) => (p._id === editId ? data : p)));
        toast.success('Product updated!');
      } else {
        const { data } = await api.post('/api/products', formData);
        setProducts((prev) => [data, ...prev]);
        toast.success('Product added!');
      }
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-black text-slate-900">
          Manage Products <span className="text-blue-600">({products.length})</span>
        </h3>
        <button onClick={fetchProducts} className="p-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-500 transition">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Form */}
      <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100">
        <h4 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
          <Plus className="w-5 h-5 text-blue-600" />
          {isEditing ? 'Edit Product' : 'Add New Product'}
        </h4>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              { label: 'Product Name', name: 'name', type: 'text' },
              { label: 'Price (₹)', name: 'price', type: 'number' },
              { label: 'Stock Quantity', name: 'stock', type: 'number' },
            ].map((field) => (
              <div key={field.name}>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">{field.label}</label>
                <input
                  type={field.type}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                  required
                />
              </div>
            ))}

            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Category</label>
              <select name="category" value={formData.category} onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white">
                <option value="Feed">Aqua Feed</option>
                <option value="Medicine">Medicine / Mineral</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Sub Category</label>
              <select name="subCategory" value={formData.subCategory} onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white">
                {formData.category === 'Feed' ? (
                  <><option value="Vanami Feed">Vanami Feed</option><option value="Sadhya Feed">Sadhya Feed</option></>
                ) : (
                  <><option value="Fish Medicine">Fish Medicine</option><option value="Water Treatment">Water Treatment</option><option value="Minerals">Minerals</option></>
                )}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows="3"
              className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white resize-none" />
          </div>

          {/* Image Upload */}
          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-white text-center">
            <Upload className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <p className="text-sm text-slate-500 mb-3">Upload product image from your system</p>
            <input type="file" ref={fileInputRef} onChange={uploadImage} accept="image/*"
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            {uploading && <p className="text-sm text-blue-600 mt-2 flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</p>}
            {imagePreview && <img src={imagePreview} alt="Preview" className="h-28 object-contain rounded-xl border border-slate-100 mt-4 mx-auto" />}
          </div>

          <div className="flex justify-end gap-3">
            {isEditing && (
              <button type="button" onClick={resetForm}
                className="flex items-center gap-2 px-5 py-3 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200 transition">
                <X className="w-4 h-4" /> Cancel
              </button>
            )}
            <button type="submit" disabled={submitting}
              className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition disabled:opacity-60">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isEditing ? 'Update Product' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-[32px] border-2 border-dashed border-slate-100">
          <Package className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-400 font-bold">No products yet. Add your first product above.</p>
        </div>
      ) : (
        <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {['Product', 'Category', 'Price', 'Stock', 'Actions'].map(h => (
                    <th key={h} className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {products.map((prod) => (
                  <tr key={prod._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                          {prod.image
                            ? <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                            : <Package className="w-5 h-5 text-slate-400 m-auto mt-2.5" />
                          }
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{prod.name}</p>
                          <p className="text-xs text-slate-400">{prod.subCategory}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-black">{prod.category}</span>
                    </td>
                    <td className="px-6 py-4 font-black text-blue-600">₹{Number(prod.price).toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`font-bold text-sm ${prod.stock < 10 ? 'text-amber-600' : 'text-slate-700'}`}>
                        {prod.stock} units
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(prod)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(prod._id, prod.name)}
                          disabled={deleting === prod._id}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition disabled:opacity-50">
                          {deleting === prod._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageProducts;
