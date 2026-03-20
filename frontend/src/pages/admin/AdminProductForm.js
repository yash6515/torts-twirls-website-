import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProduct, createProduct, updateProduct } from '../../utils/api';
import { toast } from 'react-toastify';

const CATEGORIES = ['cotton','silk','linen','microfiber','printed','plain','embroidered','luxury'];
const SIZES = ['single','double','queen','king','super-king'];

const AdminProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEdit);

  const [form, setForm] = useState({
    name: '', description: '', shortDescription: '', price: '', discountPrice: '',
    category: 'cotton', fabric: '', threadCount: '', stock: '',
    images: ['','',''], features: ['','',''],
    size: [], color: [''], isFeatured: false, isActive: true, tags: ''
  });

  useEffect(() => {
    if (isEdit) {
      getProduct(id).then(res => {
        const p = res.data.product;
        setForm({
          name: p.name||'', description: p.description||'', shortDescription: p.shortDescription||'',
          price: p.price||'', discountPrice: p.discountPrice||'', category: p.category||'cotton',
          fabric: p.fabric||'', threadCount: p.threadCount||'', stock: p.stock||'',
          images: [...(p.images||[]),'','',''].slice(0,3),
          features: [...(p.features||[]),'','',''].slice(0,6),
          size: p.size||[], color: (p.color||[]).join(', '),
          isFeatured: p.isFeatured||false, isActive: p.isActive!==false,
          tags: (p.tags||[]).join(', ')
        });
      }).catch(() => navigate('/admin/products'))
        .finally(() => setFetchLoading(false));
    }
  }, [id, isEdit, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        discountPrice: Number(form.discountPrice) || 0,
        threadCount: Number(form.threadCount) || 0,
        stock: Number(form.stock),
        images: form.images.filter(Boolean),
        features: form.features.filter(Boolean),
        color: typeof form.color === 'string' ? form.color.split(',').map(c => c.trim()).filter(Boolean) : form.color,
        tags: typeof form.tags === 'string' ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : form.tags,
      };
      if (isEdit) { await updateProduct(id, payload); toast.success('Product updated!'); }
      else { await createProduct(payload); toast.success('Product created!'); }
      navigate('/admin/products');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save product'); }
    finally { setLoading(false); }
  };

  const inputClass = "w-full border border-sand rounded-xl px-4 py-3 text-sm font-sans text-deep-brown placeholder-taupe outline-none focus:border-taupe transition-colors bg-white";

  if (fetchLoading) return <div className="min-h-screen bg-cream pt-[72px] flex items-center justify-center"><div className="w-8 h-8 border-2 border-deep-brown border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="pt-[72px] min-h-screen bg-cream">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/admin/products" className="text-taupe hover:text-deep-brown text-sm font-sans">← Back</Link>
          <h1 className="font-display text-3xl text-deep-brown">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl shadow-soft p-6">
            <h2 className="font-serif text-xl text-deep-brown mb-5">Basic Info</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-sans uppercase tracking-wide text-taupe mb-1.5">Product Name *</label>
                <input value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} className={inputClass} required />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-sans uppercase tracking-wide text-taupe mb-1.5">Short Description</label>
                <input value={form.shortDescription} onChange={e => setForm(f=>({...f,shortDescription:e.target.value}))} className={inputClass} placeholder="Brief tagline for product card" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-sans uppercase tracking-wide text-taupe mb-1.5">Full Description *</label>
                <textarea value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))} rows={4} className={inputClass} required />
              </div>
              <div>
                <label className="block text-xs font-sans uppercase tracking-wide text-taupe mb-1.5">Category *</label>
                <select value={form.category} onChange={e => setForm(f=>({...f,category:e.target.value}))} className={inputClass}>
                  {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-sans uppercase tracking-wide text-taupe mb-1.5">Fabric</label>
                <input value={form.fabric} onChange={e => setForm(f=>({...f,fabric:e.target.value}))} className={inputClass} placeholder="e.g. Egyptian Cotton" />
              </div>
              <div>
                <label className="block text-xs font-sans uppercase tracking-wide text-taupe mb-1.5">Price (₹) *</label>
                <input type="number" value={form.price} onChange={e => setForm(f=>({...f,price:e.target.value}))} className={inputClass} required min="0" />
              </div>
              <div>
                <label className="block text-xs font-sans uppercase tracking-wide text-taupe mb-1.5">Discount Price (₹)</label>
                <input type="number" value={form.discountPrice} onChange={e => setForm(f=>({...f,discountPrice:e.target.value}))} className={inputClass} min="0" />
              </div>
              <div>
                <label className="block text-xs font-sans uppercase tracking-wide text-taupe mb-1.5">Thread Count</label>
                <input type="number" value={form.threadCount} onChange={e => setForm(f=>({...f,threadCount:e.target.value}))} className={inputClass} min="0" />
              </div>
              <div>
                <label className="block text-xs font-sans uppercase tracking-wide text-taupe mb-1.5">Stock *</label>
                <input type="number" value={form.stock} onChange={e => setForm(f=>({...f,stock:e.target.value}))} className={inputClass} required min="0" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-soft p-6">
            <h2 className="font-serif text-xl text-deep-brown mb-5">Images (URLs)</h2>
            <div className="space-y-3">
              {form.images.map((img, i) => (
                <div key={i}>
                  <label className="block text-xs font-sans text-taupe mb-1">Image {i+1} URL</label>
                  <input value={img} onChange={e => { const imgs=[...form.images]; imgs[i]=e.target.value; setForm(f=>({...f,images:imgs})); }} placeholder="https://..." className={inputClass} />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-soft p-6">
            <h2 className="font-serif text-xl text-deep-brown mb-5">Variants</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-sans uppercase tracking-wide text-taupe mb-2">Sizes</label>
                <div className="flex flex-wrap gap-2">
                  {SIZES.map(s => (
                    <button key={s} type="button" onClick={() => setForm(f => ({ ...f, size: f.size.includes(s) ? f.size.filter(x=>x!==s) : [...f.size,s] }))} className={`text-xs px-3 py-1.5 rounded-full border capitalize font-sans transition-all ${form.size.includes(s) ? 'bg-deep-brown text-cream border-deep-brown' : 'border-sand text-warm-gray hover:border-taupe'}`}>{s}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-sans uppercase tracking-wide text-taupe mb-1.5">Colors (comma separated)</label>
                <input value={form.color} onChange={e => setForm(f=>({...f,color:e.target.value}))} placeholder="Ivory, White, Cream" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-sans uppercase tracking-wide text-taupe mb-1.5">Tags (comma separated)</label>
                <input value={form.tags} onChange={e => setForm(f=>({...f,tags:e.target.value}))} placeholder="cotton, luxury, king" className={inputClass} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-soft p-6">
            <h2 className="font-serif text-xl text-deep-brown mb-5">Features</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {form.features.map((feat, i) => (
                <input key={i} value={feat} onChange={e => { const feats=[...form.features]; feats[i]=e.target.value; setForm(f=>({...f,features:feats})); }} placeholder={`Feature ${i+1}`} className={inputClass} />
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-soft p-6">
            <h2 className="font-serif text-xl text-deep-brown mb-5">Settings</h2>
            <div className="flex gap-6">
              {[{key:'isFeatured',label:'Featured Product'},{key:'isActive',label:'Active (visible on site)'}].map(opt => (
                <label key={opt.key} className="flex items-center gap-2 cursor-pointer">
                  <div onClick={() => setForm(f=>({...f,[opt.key]:!f[opt.key]}))} className={`w-10 h-6 rounded-full transition-colors relative ${form[opt.key] ? 'bg-deep-brown' : 'bg-sand'}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form[opt.key] ? 'translate-x-5' : 'translate-x-1'}`} />
                  </div>
                  <span className="text-sm font-sans text-deep-brown">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Link to="/admin/products" className="btn-outline">Cancel</Link>
            <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? <><div className="w-4 h-4 border-2 border-cream border-t-transparent rounded-full animate-spin" />Saving...</> : (isEdit ? 'Update Product' : 'Create Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default AdminProductForm;
