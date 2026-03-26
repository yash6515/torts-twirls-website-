import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrderById, requestOrderReturn } from '../utils/api';
import { toast } from 'react-toastify';

const STATUS_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];

const STATUS_META = {
  pending:          { label: 'Order Placed',       icon: '📋', color: 'text-amber-600 bg-amber-50',   border: 'border-amber-200' },
  confirmed:        { label: 'Order Confirmed',     icon: '✅', color: 'text-blue-600 bg-blue-50',     border: 'border-blue-200' },
  processing:       { label: 'Being Prepared',      icon: '🔧', color: 'text-purple-600 bg-purple-50', border: 'border-purple-200' },
  shipped:          { label: 'Shipped',             icon: '🚚', color: 'text-indigo-600 bg-indigo-50', border: 'border-indigo-200' },
  out_for_delivery: { label: 'Out for Delivery',    icon: '🛵', color: 'text-cyan-600 bg-cyan-50',     border: 'border-cyan-200' },
  delivered:        { label: 'Delivered',           icon: '🎉', color: 'text-emerald-600 bg-emerald-50',border: 'border-emerald-200' },
  cancelled:        { label: 'Cancelled',           icon: '✕',  color: 'text-rose-600 bg-rose-50',     border: 'border-rose-200' },
  refunded:         { label: 'Refunded',            icon: '↩️', color: 'text-warm-gray bg-sand',       border: 'border-sand' },
};

const RETURN_META = {
  none: null,
  pending:  { label: 'Return Pending',  color: 'text-amber-700 bg-amber-50 border-amber-200', icon: '⏳' },
  approved: { label: 'Return Approved', color: 'text-green-700 bg-green-50 border-green-200', icon: '✅' },
  rejected: { label: 'Return Rejected', color: 'text-red-700 bg-red-50 border-red-200', icon: '✕' },
};

const OrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getOrderById(id)
      .then(res => setOrder(res.data.order))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleReturnRequest = async () => {
    setSubmitting(true);
    try {
      const res = await requestOrderReturn(id, { reason: returnReason });
      setOrder(res.data.order);
      toast.success('Return request submitted!');
      setShowReturnForm(false);
      setReturnReason('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit return');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-cream pt-24 flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-rose-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!order) return (
    <div className="min-h-screen bg-cream pt-24 flex items-center justify-center text-center px-4">
      <div>
        <p className="text-warm-gray font-sans mb-4">Order not found.</p>
        <Link to="/orders" className="btn-primary">Back to Orders</Link>
      </div>
    </div>
  );

  const currentStepIndex = STATUS_STEPS.indexOf(order.status);
  const isCancelled = ['cancelled', 'refunded'].includes(order.status);
  const meta = STATUS_META[order.status] || STATUS_META.pending;
  const sd = order.shippingDetails;
  const returnMeta = RETURN_META[order.returnStatus];
  const canReturn = order.status === 'delivered' && (!order.returnStatus || order.returnStatus === 'none');

  return (
    <div className="min-h-screen bg-cream pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Back + header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-8 animate-fade-in">
          <Link to="/orders" className="text-taupe hover:text-deep-brown transition-colors p-1 self-start">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex-1">
            <h1 className="font-display text-xl sm:text-2xl text-deep-brown">
              Order #{order._id?.slice(-8).toUpperCase()}
            </h1>
            <p className="text-xs font-sans text-taupe mt-0.5">
              Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 self-start sm:self-auto">
            <span className={`text-xs font-sans font-medium px-3.5 py-1.5 rounded-full border capitalize ${meta.color} ${meta.border}`}>
              {meta.icon} {meta.label}
            </span>
            {returnMeta && (
              <span className={`text-xs font-sans font-medium px-3.5 py-1.5 rounded-full border ${returnMeta.color}`}>
                {returnMeta.icon} {returnMeta.label}
              </span>
            )}
          </div>
        </div>

        {/* ── ORDER PROGRESS TRACKER ── */}
        {!isCancelled && (
          <div className="bg-white rounded-2xl shadow-card p-4 sm:p-6 mb-6 animate-fade-in overflow-x-auto">
            <h3 className="font-serif text-lg text-deep-brown mb-6">Order Progress</h3>
            <div className="relative min-w-[500px]">
              {/* Progress line */}
              <div className="absolute top-5 left-5 right-5 h-0.5 bg-sand" />
              <div
                className="absolute top-5 left-5 h-0.5 bg-gradient-to-r from-sage to-rose-primary transition-all duration-700"
                style={{ width: currentStepIndex >= 0 ? `${(currentStepIndex / (STATUS_STEPS.length - 1)) * 100}%` : '0%' }}
              />

              <div className="relative flex justify-between">
                {STATUS_STEPS.map((step, i) => {
                  const stepMeta = STATUS_META[step];
                  const isDone    = i < currentStepIndex;
                  const isCurrent = i === currentStepIndex;
                  return (
                    <div key={step} className="flex flex-col items-center gap-2">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-base border-2 transition-all duration-500 z-10 ${
                        isDone    ? 'bg-sage border-sage text-white shadow-sm'
                        : isCurrent ? 'bg-rose-primary border-rose-primary text-white shadow-[0_0_0_4px_rgba(225,29,72,0.15)]'
                        : 'bg-white border-sand text-taupe'
                      }`}>
                        {isDone ? '✓' : stepMeta.icon}
                      </div>
                      <span className={`text-[0.62rem] font-sans text-center leading-tight max-w-[52px] capitalize ${isCurrent ? 'text-rose-primary font-semibold' : isDone ? 'text-sage font-medium' : 'text-taupe'}`}>
                        {step.replace('_', ' ')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── RETURN STATUS CARD ── */}
        {returnMeta && (
          <div className={`rounded-2xl p-5 mb-6 animate-fade-in border ${
            order.returnStatus === 'pending' ? 'bg-amber-50 border-amber-200' :
            order.returnStatus === 'approved' ? 'bg-green-50 border-green-200' :
            'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-start gap-3">
              <span className="text-2xl">{returnMeta.icon}</span>
              <div>
                <h3 className="font-serif text-lg text-deep-brown">{returnMeta.label}</h3>
                {order.returnReason && (
                  <p className="text-sm font-sans text-warm-gray mt-1">
                    <strong>Reason:</strong> {order.returnReason}
                  </p>
                )}
                {order.returnRequestedAt && (
                  <p className="text-xs font-sans text-taupe mt-1">
                    Requested on {new Date(order.returnRequestedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                )}
                {order.returnProcessedAt && (
                  <p className="text-xs font-sans text-taupe mt-0.5">
                    Processed on {new Date(order.returnProcessedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── SHIPPING TRACKING CARD ── */}
        {(sd?.trackingNumber || sd?.courierName) && (
          <div className="bg-gradient-to-br from-deep-brown to-charcoal rounded-2xl p-5 sm:p-6 mb-6 text-cream animate-fade-in relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 opacity-5 pointer-events-none">
              {Array.from({ length: 6 }).map((_, i) => (
                Array.from({ length: 6 }).map((_, j) => (
                  <div key={`${i}-${j}`} className="absolute w-1.5 h-1.5 rounded-full bg-cream" style={{ top: `${i * 20}%`, left: `${j * 20}%` }} />
                ))
              ))}
            </div>

            <div className="relative z-10">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <p className="text-[0.68rem] font-sans uppercase tracking-[0.2em] text-cream/50 mb-1">Shipping Status</p>
                  <h3 className="font-serif text-lg sm:text-xl text-cream">
                    {['shipped', 'out_for_delivery', 'delivered'].includes(order.status)
                      ? `Your order is ${order.status.replace('_', ' ')}`
                      : 'Shipment Information'}
                  </h3>
                </div>
                <div className="text-3xl">{STATUS_META[order.status]?.icon || '📦'}</div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4">
                {sd.courierName && (
                  <div className="bg-white/10 rounded-xl p-3">
                    <p className="text-[0.65rem] font-sans text-cream/50 uppercase tracking-wide mb-1">Carrier</p>
                    <p className="text-sm font-sans font-semibold text-cream">{sd.courierName}</p>
                  </div>
                )}
                {sd.trackingNumber && (
                  <div className="bg-white/10 rounded-xl p-3">
                    <p className="text-[0.65rem] font-sans text-cream/50 uppercase tracking-wide mb-1">Tracking #</p>
                    <p className="text-sm font-mono font-semibold text-cream tracking-wide">{sd.trackingNumber}</p>
                  </div>
                )}
                {sd.dispatchedAt && (
                  <div className="bg-white/10 rounded-xl p-3">
                    <p className="text-[0.65rem] font-sans text-cream/50 uppercase tracking-wide mb-1">Dispatched</p>
                    <p className="text-sm font-sans font-semibold text-cream">
                      {new Date(sd.dispatchedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                )}
                {sd.estimatedDelivery && !sd.deliveredAt && (
                  <div className="bg-white/10 rounded-xl p-3">
                    <p className="text-[0.65rem] font-sans text-cream/50 uppercase tracking-wide mb-1">Est. Delivery</p>
                    <p className="text-sm font-sans font-semibold text-rose-light">
                      {new Date(sd.estimatedDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                )}
                {sd.deliveredAt && (
                  <div className="bg-white/10 rounded-xl p-3">
                    <p className="text-[0.65rem] font-sans text-cream/50 uppercase tracking-wide mb-1">Delivered</p>
                    <p className="text-sm font-sans font-semibold text-sage">
                      {new Date(sd.deliveredAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                )}
              </div>

              {sd.trackingUrl && (
                <a
                  href={sd.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 text-cream text-sm font-sans font-medium px-5 py-2.5 rounded-xl transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Track on {sd.courierName || 'Courier'} Website
                </a>
              )}
            </div>
          </div>
        )}

        {/* No shipping info yet */}
        {!sd?.trackingNumber && !isCancelled && order.status !== 'delivered' && (
          <div className="bg-white rounded-2xl shadow-card p-5 mb-6 flex items-center gap-4 animate-fade-in">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-2xl flex-shrink-0">📦</div>
            <div>
              <p className="text-sm font-sans font-semibold text-deep-brown">Awaiting Dispatch</p>
              <p className="text-xs font-sans text-warm-gray mt-0.5">
                We'll update you with tracking information once your order is dispatched.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
          {/* Items + address */}
          <div className="lg:col-span-2 space-y-5">

            {/* Order items */}
            <div className="bg-white rounded-2xl shadow-card p-4 sm:p-6 animate-fade-in">
              <h3 className="font-serif text-lg text-deep-brown mb-5">
                Items Ordered ({order.orderItems?.length})
              </h3>
              <div className="space-y-4">
                {order.orderItems?.map((item, i) => (
                  <div key={i} className="flex gap-3 sm:gap-4 pb-4 border-b border-sand/50 last:border-0 last:pb-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-2xl flex-shrink-0"
                      onError={e => e.target.src = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200'}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-sans font-semibold text-deep-brown">{item.name}</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {item.size && (
                          <span className="text-[0.68rem] font-sans text-warm-gray bg-cream px-2 py-0.5 rounded-full capitalize border border-sand/60">
                            {item.size}
                          </span>
                        )}
                        {item.color && (
                          <span className="text-[0.68rem] font-sans text-warm-gray bg-cream px-2 py-0.5 rounded-full border border-sand/60">
                            {item.color}
                          </span>
                        )}
                        <span className="text-[0.68rem] font-sans text-warm-gray bg-cream px-2 py-0.5 rounded-full border border-sand/60">
                          Qty: {item.quantity}
                        </span>
                      </div>
                      <p className="text-sm font-sans font-semibold text-deep-brown mt-2">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery address */}
            <div className="bg-white rounded-2xl shadow-card p-4 sm:p-6 animate-fade-in">
              <h3 className="font-serif text-lg text-deep-brown mb-4">📍 Delivery Address</h3>
              <div className="space-y-1">
                <p className="text-sm font-sans font-semibold text-deep-brown">{order.shippingAddress?.name}</p>
                <p className="text-sm font-sans text-warm-gray">{order.shippingAddress?.phone}</p>
                <p className="text-sm font-sans text-warm-gray mt-1">
                  {order.shippingAddress?.addressLine1}
                  {order.shippingAddress?.addressLine2 && `, ${order.shippingAddress.addressLine2}`}
                </p>
                <p className="text-sm font-sans text-warm-gray">
                  {order.shippingAddress?.city}, {order.shippingAddress?.state} – {order.shippingAddress?.pincode}
                </p>
              </div>
            </div>
          </div>

          {/* Payment summary + actions */}
          <div className="space-y-5">
            <div className="bg-white rounded-2xl shadow-card p-4 sm:p-6 animate-fade-in">
              <h3 className="font-serif text-lg text-deep-brown mb-4">💳 Payment</h3>
              <div className="space-y-2.5 mb-4">
                <div className="flex justify-between text-sm font-sans">
                  <span className="text-warm-gray">Items</span>
                  <span className="text-deep-brown font-medium">₹{order.itemsPrice?.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm font-sans">
                  <span className="text-warm-gray">Shipping</span>
                  <span className={order.shippingPrice === 0 ? 'text-emerald-600 font-medium' : 'text-deep-brown'}>
                    {order.shippingPrice === 0 ? 'Free 🎉' : `₹${order.shippingPrice}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-sans">
                  <span className="text-warm-gray">GST</span>
                  <span className="text-deep-brown">₹{order.taxPrice?.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-semibold border-t border-sand pt-2.5 mt-2">
                  <span className="font-sans text-deep-brown">Total</span>
                  <span className="font-sans text-deep-brown">₹{order.totalPrice?.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-sand">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-taupe font-sans">Method</span>
                  <span className="text-xs font-sans font-medium text-deep-brown capitalize">{order.paymentMethod}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-taupe font-sans">Payment Status</span>
                  <span className={`text-xs font-sans font-semibold ${order.isPaid ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {order.isPaid ? '✓ Paid' : '⏳ Pending'}
                  </span>
                </div>
                {order.paidAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-taupe font-sans">Paid On</span>
                    <span className="text-xs font-sans text-deep-brown">
                      {new Date(order.paidAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Return Order Action */}
            {canReturn && !showReturnForm && (
              <button
                onClick={() => setShowReturnForm(true)}
                className="w-full btn-outline py-3 text-sm border-rose-primary/40 text-rose-primary hover:bg-rose-primary hover:text-white"
              >
                ↩ Request Return
              </button>
            )}

            {showReturnForm && (
              <div className="bg-white rounded-2xl shadow-card p-5 animate-fade-in">
                <h4 className="font-serif text-base text-deep-brown mb-3">Return Request</h4>
                <textarea
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  placeholder="Reason for return..."
                  rows={3}
                  className="input-luxury resize-none mb-3 text-sm"
                />
                <div className="flex gap-2">
                  <button onClick={() => setShowReturnForm(false)} className="flex-1 btn-outline py-2 text-xs">Cancel</button>
                  <button onClick={handleReturnRequest} disabled={submitting} className="flex-1 btn-primary py-2 text-xs disabled:opacity-60">
                    {submitting ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </div>
            )}

            {/* Help card */}
            <div className="bg-light-beige rounded-2xl p-5 border border-sand/60 animate-fade-in">
              <p className="text-sm font-sans font-semibold text-deep-brown mb-2">Need Help?</p>
              <p className="text-xs font-sans text-warm-gray mb-3 leading-relaxed">
                If you have any questions about your order or delivery, our team is happy to help.
              </p>
              <a
                href="mailto:support@tortsandtwirls.com"
                className="text-xs font-sans text-rose-primary hover:text-deep-brown transition-colors link-underline"
              >
                support@tortsandtwirls.com →
              </a>
            </div>

            <Link to="/orders" className="btn-outline w-full py-3 text-sm text-center">
              ← All Orders
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
