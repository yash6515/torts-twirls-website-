import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminStats } from '../../utils/api';

const statusStyles = {
  pending: 'bg-amber-50 text-amber-700 border border-amber-200',
  confirmed: 'bg-blue-50 text-blue-700 border border-blue-200',
  processing: 'bg-purple-50 text-purple-700 border border-purple-200',
  shipped: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
  delivered: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  cancelled: 'bg-rose-50 text-rose-700 border border-rose-200',
};

const StatCard = ({ label, value, icon, delta, color, index }) => {
  const [show, setShow] = useState(false);
  useEffect(() => { setTimeout(() => setShow(true), index * 100); }, [index]);

  return (
    <div className={`bg-white rounded-2xl shadow-card p-6 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:shadow-card-hover hover:-translate-y-1 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center text-xl`}>
          {icon}
        </div>
        {delta && (
          <span className="text-xs font-sans font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
            {delta}
          </span>
        )}
      </div>
      <p className="font-display text-[2rem] text-deep-brown leading-none mb-1">{value}</p>
      <p className="text-sm font-sans text-taupe">{label}</p>
    </div>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminStats()
      .then(res => setStats(res.data.stats))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-cream pt-[72px] flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-deep-brown border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-sans text-taupe">Loading dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-cream pt-[72px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 animate-fade-in">
          <div>
            <p className="text-[0.7rem] font-sans uppercase tracking-[0.2em] text-gold mb-1">Management Console</p>
            <h1 className="font-display text-[2.2rem] text-deep-brown">Admin Dashboard</h1>
          </div>
          <div className="flex gap-3">
            <Link to="/admin/products/new" className="btn-primary text-sm py-2.5 px-5">
              + Add Product
            </Link>
            <Link to="/admin/orders" className="btn-outline text-sm py-2.5 px-5">
              Orders →
            </Link>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard index={0} label="Total Orders" value={stats?.totalOrders?.toLocaleString() || '0'} icon="📦" color="bg-blue-50" delta="+12%" />
          <StatCard index={1} label="Total Revenue" value={`₹${((stats?.totalRevenue || 0) / 1000).toFixed(1)}k`} icon="💰" color="bg-emerald-50" delta="+8%" />
          <StatCard index={2} label="Active Products" value={stats?.totalProducts || 0} icon="🛏️" color="bg-purple-50" />
          <StatCard index={3} label="Customers" value={stats?.totalUsers || 0} icon="👤" color="bg-amber-50" delta="+24%" />
        </div>

        {/* Monthly revenue bar chart */}
        {stats?.monthlyRevenue?.length > 0 && (
          <div className="bg-white rounded-2xl shadow-card p-6 mb-8 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-xl text-deep-brown">Monthly Revenue</h2>
              <span className="text-xs font-sans text-taupe bg-cream px-3 py-1.5 rounded-full">Last 6 months</span>
            </div>
            <div className="flex items-end gap-3 h-32">
              {[...stats.monthlyRevenue].reverse().map((m, i) => {
                const maxRev = Math.max(...stats.monthlyRevenue.map(x => x.revenue));
                const pct = maxRev > 0 ? (m.revenue / maxRev) * 100 : 0;
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group">
                    <div className="w-full flex flex-col items-center">
                      <span className="text-[0.65rem] font-sans text-taupe opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                        ₹{(m.revenue / 1000).toFixed(1)}k
                      </span>
                      <div
                        className="w-full bg-gradient-to-t from-deep-brown to-warm-gray rounded-t-lg transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:from-gold hover:to-gold-light"
                        style={{ height: `${Math.max(pct, 4)}%`, minHeight: '4px', transitionDelay: `${i * 0.08}s` }}
                      />
                    </div>
                    <span className="text-[0.65rem] font-sans text-taupe">{months[m._id.month - 1]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent orders */}
          <div className="bg-white rounded-2xl shadow-card p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-serif text-xl text-deep-brown">Recent Orders</h2>
              <Link to="/admin/orders" className="text-xs font-sans text-gold hover:text-deep-brown transition-colors link-underline">
                View all →
              </Link>
            </div>
            <div className="space-y-1">
              {stats?.recentOrders?.length > 0 ? stats.recentOrders.map((order, i) => (
                <div
                  key={order._id}
                  className="flex items-center justify-between py-3 border-b border-sand/50 last:border-0 hover:bg-cream/50 px-2 -mx-2 rounded-xl transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-sand to-light-beige rounded-xl flex items-center justify-center text-xs font-sans font-semibold text-deep-brown flex-shrink-0">
                      #{(i + 1).toString().padStart(2, '0')}
                    </div>
                    <div>
                      <p className="text-sm font-sans font-medium text-deep-brown">{order.user?.name}</p>
                      <p className="text-[0.7rem] text-taupe font-sans">{new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <span className={`text-[0.68rem] px-2.5 py-1 rounded-full font-sans capitalize ${statusStyles[order.status] || 'bg-sand text-warm-gray'}`}>
                      {order.status}
                    </span>
                    <p className="text-sm font-sans font-semibold text-deep-brown">₹{order.totalPrice?.toLocaleString()}</p>
                  </div>
                </div>
              )) : (
                <p className="text-sm font-sans text-taupe text-center py-8">No orders yet</p>
              )}
            </div>
          </div>

          {/* Top products */}
          <div className="bg-white rounded-2xl shadow-card p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-serif text-xl text-deep-brown">Top Products</h2>
              <Link to="/admin/products" className="text-xs font-sans text-gold hover:text-deep-brown transition-colors link-underline">
                Manage →
              </Link>
            </div>
            <div className="space-y-1">
              {stats?.topProducts?.length > 0 ? stats.topProducts.map((product, i) => (
                <div key={product._id} className="flex items-center gap-3 py-3 border-b border-sand/50 last:border-0 hover:bg-cream/50 px-2 -mx-2 rounded-xl transition-colors group">
                  <span className="font-display text-2xl text-sand w-7 flex-shrink-0 text-center">{i + 1}</span>
                  <img
                    src={product.images?.[0]}
                    alt={product.name}
                    className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                    onError={e => e.target.src = 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=100'}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-sans font-medium text-deep-brown truncate">{product.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[0.68rem] font-sans text-taupe capitalize">{product.category}</span>
                      <span className="text-[0.68rem] font-sans text-warm-gray">{product.soldCount} sold</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-sans font-semibold text-deep-brown">₹{product.price?.toLocaleString()}</p>
                    <p className="text-[0.68rem] font-sans text-emerald-600">{product.stock} left</p>
                  </div>
                </div>
              )) : (
                <p className="text-sm font-sans text-taupe text-center py-8">No products yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          {[
            { label: 'All Products', path: '/admin/products', icon: '🛏️', desc: 'Manage inventory' },
            { label: 'All Orders', path: '/admin/orders', icon: '📦', desc: 'Update statuses' },
            { label: 'Add Product', path: '/admin/products/new', icon: '➕', desc: 'Create listing' },
            { label: 'View Store', path: '/products', icon: '🏪', desc: 'Customer view' },
          ].map(item => (
            <Link
              key={item.path}
              to={item.path}
              className="bg-white rounded-2xl shadow-card p-5 hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 group"
            >
              <span className="text-2xl block mb-2.5 group-hover:scale-110 transition-transform duration-300">{item.icon}</span>
              <p className="text-sm font-sans font-medium text-deep-brown">{item.label}</p>
              <p className="text-xs font-sans text-taupe mt-0.5">{item.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
