import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, deleteProduct } from '../../utils/api';
import { toast } from 'react-toastify';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const fetchProducts = () => {
    setLoading(true);
    getProducts({ limit: 50 }).then(res => setProducts(res.data.products)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this product?')) return;
    setDeletingId(id);
    try {
      await deleteProduct(id);
      setProducts(prev => prev.filter(p => p._id !== id));
      toast.success('Product removed');
    } catch { toast.error('Failed to delete'); }
    finally { setDeletingId(null); }
  };

  return (
    <div className="pt-[72px] min-h-screen bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl text-deep-brown">Manage Products</h1>
          <Link to="/admin/products/new" className="btn-primary text-sm">+ Add New Product</Link>
        </div>
        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-deep-brown border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-sand">
                    {['Product','Category','Price','Stock','Featured','Actions'].map(h => (
                      <th key={h} className="text-left text-xs font-sans uppercase tracking-wider text-taupe px-6 py-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product._id} className="border-b border-sand/50 hover:bg-cream/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={product.images?.[0]} alt={product.name} className="w-12 h-12 rounded-lg object-cover" onError={e=>e.target.src='https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=100'} />
                          <div>
                            <p className="text-sm font-sans font-medium text-deep-brown line-clamp-1">{product.name}</p>
                            <p className="text-xs text-taupe font-sans">{product.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-sans text-warm-gray capitalize">{product.category}</td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-sans font-medium text-deep-brown">₹{(product.discountPrice || product.price)?.toLocaleString()}</p>
                        {product.discountPrice > 0 && <p className="text-xs text-taupe line-through font-sans">₹{product.price?.toLocaleString()}</p>}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-sans ${product.stock > 10 ? 'bg-green-100 text-green-700' : product.stock > 0 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                          {product.stock} left
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {product.isFeatured ? <span className="text-xs bg-deep-brown text-cream px-2 py-1 rounded-full font-sans">Yes</span> : <span className="text-xs text-taupe font-sans">No</span>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Link to={`/admin/products/${product._id}/edit`} className="text-xs border border-sand text-warm-gray px-3 py-1.5 rounded-lg hover:border-taupe hover:text-deep-brown transition-all font-sans">Edit</Link>
                          <button onClick={() => handleDelete(product._id)} disabled={deletingId === product._id} className="text-xs border border-red-200 text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-all font-sans disabled:opacity-50">
                            {deletingId === product._id ? '...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {products.length === 0 && <div className="text-center py-12 text-warm-gray font-sans">No products found</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default AdminProducts;
