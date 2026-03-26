import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyOrders, requestOrderReturn } from '../utils/api';
import { toast } from 'react-toastify';

const statusColors = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-100 text-gray-600',
};

const returnStatusColors = {
  none: '',
  pending: 'bg-amber-50 text-amber-700 border border-amber-200',
  approved: 'bg-green-50 text-green-700 border border-green-200',
  rejected: 'bg-red-50 text-red-700 border border-red-200',
};

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [returnModal, setReturnModal] = useState(null);
  const [returnReason, setReturnReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getMyOrders().then(res => setOrders(res.data.orders)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleReturnRequest = async () => {
    if (!returnModal) return;
    setSubmitting(true);
    try {
      const res = await requestOrderReturn(returnModal._id, { reason: returnReason });
      setOrders(prev => prev.map(o => o._id === returnModal._id ? res.data.order : o));
      toast.success('Return request submitted successfully!');
      setReturnModal(null);
      setReturnReason('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit return request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="pt-[72px] min-h-screen bg-cream flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-rose-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="pt-[72px] min-h-screen bg-cream">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <h1 className="font-display text-2xl sm:text-3xl text-deep-brown mb-6 sm:mb-8">My Orders</h1>
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
              <div key={order._id} className="bg-white rounded-2xl shadow-soft p-4 sm:p-6 hover:shadow-medium transition-shadow">
                <div className="flex flex-wrap items-start justify-between gap-3 sm:gap-4 mb-4">
                  <div>
                    <p className="text-xs text-taupe font-sans">Order #{order._id?.slice(-8).toUpperCase()}</p>
                    <p className="text-xs text-taupe font-sans mt-1">{new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    <span className={`text-xs px-3 py-1 rounded-full font-sans font-medium capitalize ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                      {order.status?.replace('_', ' ')}
                    </span>
                    {order.returnStatus && order.returnStatus !== 'none' && (
                      <span className={`text-xs px-3 py-1 rounded-full font-sans font-medium capitalize ${returnStatusColors[order.returnStatus]}`}>
                        Return: {order.returnStatus}
                      </span>
                    )}
                    <span className="font-sans font-semibold text-deep-brown text-sm sm:text-base">₹{order.totalPrice?.toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {order.orderItems?.slice(0, 4).map((item, i) => (
                    <img key={i} src={item.image} alt={item.name} className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg object-cover flex-shrink-0" onError={e => e.target.src='https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200'} />
                  ))}
                  {order.orderItems?.length > 4 && (
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-sand flex items-center justify-center text-xs text-warm-gray font-sans flex-shrink-0">+{order.orderItems.length - 4}</div>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 gap-3">
                  <p className="text-sm text-warm-gray font-sans">{order.orderItems?.length} item{order.orderItems?.length !== 1 ? 's' : ''}</p>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    {/* Return button - only for delivered orders with no return */}
                    {order.status === 'delivered' && (!order.returnStatus || order.returnStatus === 'none') && (
                      <button
                        onClick={() => setReturnModal(order)}
                        className="text-sm text-rose-primary font-sans font-medium hover:text-rose-dark transition-colors border border-rose-primary/30 px-3 py-1.5 rounded-lg hover:bg-rose-mist/30 flex-1 sm:flex-none text-center"
                      >
                        ↩ Return Order
                      </button>
                    )}
                    <Link to={`/orders/${order._id}`} className="text-sm text-deep-brown font-sans font-medium hover:text-rose-primary transition-colors flex-1 sm:flex-none text-center sm:text-right">
                      View Details →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Return Request Modal */}
      {returnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-charcoal/50 backdrop-blur-sm" onClick={() => setReturnModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-lifted w-full max-w-md p-6 animate-slide-up">
            <h3 className="font-serif text-xl text-deep-brown mb-2">Request Return</h3>
            <p className="text-sm text-taupe font-sans mb-5">
              Order #{returnModal._id?.slice(-8).toUpperCase()} · ₹{returnModal.totalPrice?.toLocaleString()}
            </p>

            <label className="block text-xs font-sans font-semibold text-deep-brown uppercase tracking-wide mb-2">
              Reason for return
            </label>
            <textarea
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              placeholder="Please describe why you'd like to return this order..."
              rows={4}
              className="input-luxury resize-none mb-5"
            />

            <div className="flex gap-3">
              <button
                onClick={() => { setReturnModal(null); setReturnReason(''); }}
                className="flex-1 btn-outline py-3 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleReturnRequest}
                disabled={submitting}
                className="flex-1 btn-primary py-3 text-sm disabled:opacity-60"
              >
                {submitting ? 'Submitting...' : 'Submit Return Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
