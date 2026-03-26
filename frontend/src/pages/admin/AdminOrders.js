import React, { useState, useEffect } from 'react';
import { getAdminOrders, updateOrderStatus, updateShippingDetails, processOrderReturn } from '../../utils/api';
import { toast } from 'react-toastify';

const ALL_STATUSES = ['pending','confirmed','processing','shipped','out_for_delivery','delivered','cancelled'];

const STATUS_STYLES = {
  pending:          'bg-amber-50 text-amber-700 border-amber-200',
  confirmed:        'bg-blue-50 text-blue-700 border-blue-200',
  processing:       'bg-purple-50 text-purple-700 border-purple-200',
  shipped:          'bg-indigo-50 text-indigo-700 border-indigo-200',
  out_for_delivery: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  delivered:        'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled:        'bg-rose-50 text-rose-700 border-rose-200',
};

const RETURN_STYLES = {
  pending:  'bg-amber-50 text-amber-700 border-amber-200',
  approved: 'bg-green-50 text-green-700 border-green-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
};

const COURIER_OPTIONS = [
  'Delhivery', 'Bluedart', 'DTDC', 'Ecom Express',
  'Xpressbees', 'India Post', 'FedEx', 'DHL', 'Amazon Logistics', 'Other',
];

/* ─── Shipping Details Modal ─── */
const ShippingModal = ({ order, onClose, onSaved }) => {
  const [form, setForm] = useState({
    courierName:       order.shippingDetails?.courierName || '',
    trackingNumber:    order.shippingDetails?.trackingNumber || '',
    trackingUrl:       order.shippingDetails?.trackingUrl || '',
    estimatedDelivery: order.shippingDetails?.estimatedDelivery
      ? new Date(order.shippingDetails.estimatedDelivery).toISOString().split('T')[0]
      : '',
    dispatchedAt:      order.shippingDetails?.dispatchedAt
      ? new Date(order.shippingDetails.dispatchedAt).toISOString().split('T')[0]
      : '',
    shippingNotes:     order.shippingDetails?.shippingNotes || '',
  });
  const [saving, setSaving] = useState(false);

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateShippingDetails(order._id, form);
      toast.success('Shipping details saved!');
      onSaved(res.data.order);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save shipping details');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-charcoal/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-lifted w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-sand/60 px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
          <div>
            <h3 className="font-serif text-xl text-deep-brown">Shipping Details</h3>
            <p className="text-xs font-sans text-taupe mt-0.5">
              Order #{order._id?.slice(-8).toUpperCase()} · {order.user?.name}
            </p>
          </div>
          <button onClick={onClose} className="text-taupe hover:text-deep-brown transition-colors p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5">
          {/* Customer address (read-only) */}
          <div className="bg-light-beige rounded-2xl p-4 border border-sand/50">
            <p className="text-[0.7rem] font-sans font-semibold text-deep-brown uppercase tracking-wide mb-2">📦 Deliver To</p>
            <p className="text-sm font-sans font-semibold text-deep-brown">{order.shippingAddress?.name}</p>
            <p className="text-sm font-sans text-warm-gray">{order.shippingAddress?.phone}</p>
            <p className="text-sm font-sans text-warm-gray mt-0.5">
              {order.shippingAddress?.addressLine1}
              {order.shippingAddress?.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ''}
            </p>
            <p className="text-sm font-sans text-warm-gray">
              {order.shippingAddress?.city}, {order.shippingAddress?.state} – {order.shippingAddress?.pincode}
            </p>
          </div>

          <div>
            <label className="block text-[0.72rem] font-sans font-semibold text-deep-brown uppercase tracking-wide mb-1.5">Courier / Carrier</label>
            <select name="courierName" value={form.courierName} onChange={handle} className="input-luxury">
              <option value="">Select courier...</option>
              {COURIER_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[0.72rem] font-sans font-semibold text-deep-brown uppercase tracking-wide mb-1.5">Tracking Number</label>
            <input name="trackingNumber" value={form.trackingNumber} onChange={handle} placeholder="e.g. DEL123456789IN" className="input-luxury font-mono" />
          </div>

          <div>
            <label className="block text-[0.72rem] font-sans font-semibold text-deep-brown uppercase tracking-wide mb-1.5">
              Tracking URL <span className="text-taupe normal-case font-normal">(Optional)</span>
            </label>
            <input name="trackingUrl" value={form.trackingUrl} onChange={handle} placeholder="https://..." className="input-luxury" type="url" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[0.72rem] font-sans font-semibold text-deep-brown uppercase tracking-wide mb-1.5">Dispatched On</label>
              <input name="dispatchedAt" value={form.dispatchedAt} onChange={handle} type="date" className="input-luxury" />
            </div>
            <div>
              <label className="block text-[0.72rem] font-sans font-semibold text-deep-brown uppercase tracking-wide mb-1.5">Est. Delivery</label>
              <input name="estimatedDelivery" value={form.estimatedDelivery} onChange={handle} type="date" className="input-luxury" min={new Date().toISOString().split('T')[0]} />
            </div>
          </div>

          <div>
            <label className="block text-[0.72rem] font-sans font-semibold text-deep-brown uppercase tracking-wide mb-1.5">
              Internal Notes <span className="text-taupe normal-case font-normal">(Admin only)</span>
            </label>
            <textarea name="shippingNotes" value={form.shippingNotes} onChange={handle} rows={3} placeholder="e.g. Fragile package..." className="input-luxury resize-none" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 btn-outline py-3 text-sm">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 btn-primary py-3 text-sm disabled:opacity-60">
              {saving ? 'Saving...' : '✓ Save Shipping Details'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ─── Main AdminOrders ─── */
const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [shippingOrder, setShippingOrder] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = (p = page, sf = statusFilter) => {
    setLoading(true);
    const params = { page: p, limit: 15 };
    if (sf) params.status = sf;
    getAdminOrders(params)
      .then(res => {
        setOrders(res.data.orders);
        setTotalPages(res.data.pages || 1);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(1, statusFilter); }, [statusFilter]);

  const handleStatusUpdate = async (orderId, status) => {
    setUpdatingId(orderId);
    try {
      const res = await updateOrderStatus(orderId, { status });
      setOrders(prev => prev.map(o => o._id === orderId ? res.data.order : o));
      toast.success(`Order marked as ${status}`);
    } catch { toast.error('Failed to update status'); }
    finally { setUpdatingId(null); }
  };

  const handleShippingSaved = (updatedOrder) => {
    setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
  };

  const handleReturnAction = async (orderId, action) => {
    setUpdatingId(orderId);
    try {
      const res = await processOrderReturn(orderId, { action });
      setOrders(prev => prev.map(o => o._id === orderId ? res.data.order : o));
      toast.success(`Return ${action}`);
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${action} return`);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-cream pt-[72px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-fade-in">
          <div>
            <p className="text-[0.7rem] font-sans uppercase tracking-[0.2em] text-rose-primary mb-1">Management</p>
            <h1 className="font-display text-[1.8rem] sm:text-[2.2rem] text-deep-brown">Manage Orders</h1>
          </div>
          <div className="text-sm font-sans text-taupe bg-white px-4 py-2 rounded-xl shadow-card">
            {orders.length} orders shown
          </div>
        </div>

        {/* Status filter tabs */}
        <div className="flex flex-wrap gap-2 mb-6 bg-white p-2 rounded-2xl shadow-card overflow-x-auto">
          <button
            onClick={() => setStatusFilter('')}
            className={`text-xs px-3 sm:px-4 py-2 rounded-xl font-sans transition-all whitespace-nowrap ${!statusFilter ? 'bg-rose-primary text-white shadow-sm font-medium' : 'text-warm-gray hover:bg-cream hover:text-deep-brown'}`}
          >
            All Orders
          </button>
          {ALL_STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-xs px-3 py-2 rounded-xl font-sans transition-all capitalize whitespace-nowrap ${statusFilter === s ? 'bg-rose-primary text-white shadow-sm font-medium' : 'text-warm-gray hover:bg-cream hover:text-deep-brown'}`}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-rose-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Orders - Desktop table */}
            <div className="bg-white rounded-2xl shadow-card overflow-hidden">
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-sand bg-cream/50">
                      {['Order', 'Customer', 'Items', 'Total', 'Payment', 'Return', 'Status', 'Actions'].map(h => (
                        <th key={h} className="text-left text-[0.7rem] font-sans font-semibold uppercase tracking-wider text-taupe px-5 py-3.5">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order._id} className="border-b border-sand/40 hover:bg-cream/40 transition-colors">
                        <td className="px-5 py-4">
                          <p className="text-sm font-sans font-semibold text-deep-brown">#{order._id?.slice(-8).toUpperCase()}</p>
                          <p className="text-[0.68rem] text-taupe font-sans mt-0.5">
                            {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm font-sans text-deep-brown font-medium">{order.user?.name}</p>
                          <p className="text-[0.68rem] text-taupe font-sans truncate max-w-[120px]">{order.user?.email}</p>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5">
                            <div className="flex -space-x-2">
                              {order.orderItems?.slice(0, 2).map((item, j) => (
                                <img key={j} src={item.image} alt={item.name} className="w-8 h-8 rounded-lg object-cover border-2 border-white"
                                  onError={e => e.target.src = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=60'} />
                              ))}
                            </div>
                            <span className="text-xs font-sans text-taupe">
                              {order.orderItems?.length} {order.orderItems?.length === 1 ? 'item' : 'items'}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm font-sans font-semibold text-deep-brown">₹{order.totalPrice?.toLocaleString('en-IN')}</p>
                          <p className={`text-[0.68rem] font-sans mt-0.5 ${order.isPaid ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {order.isPaid ? '✓ Paid' : '⏳ Unpaid'}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <span className="text-xs font-sans text-warm-gray capitalize bg-cream px-2.5 py-1 rounded-full">
                            {order.paymentMethod}
                          </span>
                        </td>

                        {/* Return status + actions */}
                        <td className="px-5 py-4">
                          {order.returnStatus && order.returnStatus !== 'none' ? (
                            <div>
                              <span className={`text-[0.68rem] px-2.5 py-1 rounded-full font-sans border capitalize ${RETURN_STYLES[order.returnStatus] || ''}`}>
                                {order.returnStatus}
                              </span>
                              {order.returnStatus === 'pending' && (
                                <div className="flex gap-1 mt-1.5">
                                  <button
                                    onClick={() => handleReturnAction(order._id, 'approved')}
                                    disabled={updatingId === order._id}
                                    className="text-[0.65rem] px-2 py-1 rounded-md font-sans text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 transition-colors disabled:opacity-50"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleReturnAction(order._id, 'rejected')}
                                    disabled={updatingId === order._id}
                                    className="text-[0.65rem] px-2 py-1 rounded-md font-sans text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors disabled:opacity-50"
                                  >
                                    Reject
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-[0.68rem] text-taupe font-sans">—</span>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <span className={`text-[0.68rem] px-2.5 py-1 rounded-full font-sans border capitalize whitespace-nowrap ${STATUS_STYLES[order.status] || 'bg-sand text-warm-gray border-sand'}`}>
                            {order.status?.replace('_', ' ')}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-1.5">
                            <select
                              value={order.status}
                              onChange={e => handleStatusUpdate(order._id, e.target.value)}
                              disabled={updatingId === order._id}
                              className="text-[0.72rem] border border-sand rounded-lg px-2 py-1.5 font-sans text-deep-brown outline-none focus:border-rose-primary bg-white w-36 capitalize"
                            >
                              {ALL_STATUSES.map(s => (
                                <option key={s} value={s} className="capitalize">{s.replace('_', ' ')}</option>
                              ))}
                            </select>
                            <button
                              onClick={() => setShippingOrder(order)}
                              className={`text-[0.72rem] px-3 py-1.5 rounded-lg font-sans border transition-all ${
                                order.shippingDetails?.trackingNumber
                                  ? 'border-rose-primary/40 text-rose-primary bg-rose-primary/5 hover:bg-rose-primary/10'
                                  : 'border-sand text-warm-gray hover:border-taupe hover:text-deep-brown'
                              }`}
                            >
                              {order.shippingDetails?.trackingNumber ? '✦ Edit Shipping' : '+ Add Shipping'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile card view */}
              <div className="lg:hidden divide-y divide-sand/40">
                {orders.map(order => (
                  <div key={order._id} className="p-4 hover:bg-cream/30 transition-colors">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <p className="text-sm font-sans font-semibold text-deep-brown">#{order._id?.slice(-8).toUpperCase()}</p>
                        <p className="text-xs text-taupe font-sans">{order.user?.name} · {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-sans font-semibold text-deep-brown">₹{order.totalPrice?.toLocaleString('en-IN')}</p>
                        <span className={`text-[0.68rem] px-2 py-0.5 rounded-full font-sans border capitalize ${STATUS_STYLES[order.status] || ''}`}>
                          {order.status?.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Return status on mobile */}
                    {order.returnStatus && order.returnStatus !== 'none' && (
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`text-[0.68rem] px-2.5 py-1 rounded-full font-sans border capitalize ${RETURN_STYLES[order.returnStatus] || ''}`}>
                          Return: {order.returnStatus}
                        </span>
                        {order.returnStatus === 'pending' && (
                          <>
                            <button onClick={() => handleReturnAction(order._id, 'approved')} disabled={updatingId === order._id}
                              className="text-[0.65rem] px-2 py-1 rounded-md font-sans text-green-700 bg-green-50 border border-green-200">Approve</button>
                            <button onClick={() => handleReturnAction(order._id, 'rejected')} disabled={updatingId === order._id}
                              className="text-[0.65rem] px-2 py-1 rounded-md font-sans text-red-700 bg-red-50 border border-red-200">Reject</button>
                          </>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-2">
                      <select
                        value={order.status}
                        onChange={e => handleStatusUpdate(order._id, e.target.value)}
                        disabled={updatingId === order._id}
                        className="text-[0.72rem] border border-sand rounded-lg px-2 py-1.5 font-sans text-deep-brown outline-none focus:border-rose-primary bg-white capitalize flex-1"
                      >
                        {ALL_STATUSES.map(s => (
                          <option key={s} value={s}>{s.replace('_', ' ')}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => setShippingOrder(order)}
                        className="text-[0.72rem] px-3 py-1.5 rounded-lg font-sans border border-sand text-warm-gray hover:border-taupe"
                      >
                        Shipping
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {orders.length === 0 && (
                <div className="text-center py-16">
                  <span className="text-4xl block mb-3">📦</span>
                  <p className="text-warm-gray font-sans text-sm">No orders found</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <button
                  disabled={page === 1}
                  onClick={() => { setPage(p => p - 1); fetchOrders(page - 1); }}
                  className="px-4 py-2 text-sm font-sans border border-sand rounded-xl text-warm-gray hover:bg-white disabled:opacity-40 transition-colors"
                >← Prev</button>
                <span className="px-4 py-2 text-sm font-sans text-deep-brown bg-white rounded-xl border border-sand">
                  {page} / {totalPages}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() => { setPage(p => p + 1); fetchOrders(page + 1); }}
                  className="px-4 py-2 text-sm font-sans border border-sand rounded-xl text-warm-gray hover:bg-white disabled:opacity-40 transition-colors"
                >Next →</button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Shipping modal */}
      {shippingOrder && (
        <ShippingModal
          order={shippingOrder}
          onClose={() => setShippingOrder(null)}
          onSaved={handleShippingSaved}
        />
      )}
    </div>
  );
};

export default AdminOrders;
