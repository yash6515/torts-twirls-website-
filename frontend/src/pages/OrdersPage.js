import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyOrders } from '../utils/api';

const statusColors = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyOrders().then(res => setOrders(res.data.orders)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="pt-[72px] min-h-screen bg-cream flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-deep-brown border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="pt-[72px] min-h-screen bg-cream">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="font-display text-3xl text-deep-brown mb-8">My Orders</h1>
        {orders.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-5xl block mb-4">📦</span>
            <h2 className="font-serif text-2xl text-deep-brown mb-2">No orders yet</h2>
            <p className="text-warm-gray font-sans mb-6">Your orders will appear here once you make a purchase</p>
            <Link to="/products" className="btn-primary inline-block">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order._id} className="bg-white rounded-2xl shadow-soft p-6 hover:shadow-medium transition-shadow">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="text-xs text-taupe font-sans">Order #{order._id?.slice(-8).toUpperCase()}</p>
                    <p className="text-xs text-taupe font-sans mt-1">{new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-3 py-1 rounded-full font-sans font-medium capitalize ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                      {order.status}
                    </span>
                    <span className="font-sans font-semibold text-deep-brown">₹{order.totalPrice?.toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {order.orderItems?.slice(0, 4).map((item, i) => (
                    <img key={i} src={item.image} alt={item.name} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" onError={e => e.target.src='https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=200'} />
                  ))}
                  {order.orderItems?.length > 4 && (
                    <div className="w-14 h-14 rounded-lg bg-sand flex items-center justify-center text-xs text-warm-gray font-sans flex-shrink-0">+{order.orderItems.length - 4}</div>
                  )}
                </div>
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-warm-gray font-sans">{order.orderItems?.length} item{order.orderItems?.length !== 1 ? 's' : ''}</p>
                  <Link to={`/orders/${order._id}`} className="text-sm text-deep-brown font-sans font-medium hover:underline">View Details →</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
