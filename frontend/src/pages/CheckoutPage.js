import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import {
  createOrder, createRazorpayOrder, verifyRazorpayPayment,
  getAddresses, addAddress,
} from '../utils/api';
import { toast } from 'react-toastify';

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Delhi','Goa',
  'Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala',
  'Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland',
  'Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura',
  'Uttar Pradesh','Uttarakhand','West Bengal',
];

const EMPTY_FORM = {
  label: 'Home', type: 'home',
  name: '', phone: '',
  addressLine1: '', addressLine2: '',
  city: '', state: '', pincode: '',
  saveAddress: false,
};

/* Step indicator */
const StepBar = ({ step }) => (
  <div className="flex items-center gap-2 mb-10">
    {[{ n: 1, label: 'Address' }, { n: 2, label: 'Payment' }, { n: 3, label: 'Review' }].map((s, i) => (
      <React.Fragment key={s.n}>
        <div className={`flex items-center gap-2 text-sm font-sans transition-colors ${step >= s.n ? 'text-deep-brown' : 'text-taupe'}`}>
          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
            step > s.n ? 'bg-sage text-white' : step === s.n ? 'bg-deep-brown text-cream' : 'bg-sand text-taupe'
          }`}>
            {step > s.n ? '✓' : s.n}
          </span>
          <span className="hidden sm:block">{s.label}</span>
        </div>
        {i < 2 && <div className={`flex-1 h-0.5 transition-all duration-500 ${step > s.n ? 'bg-sage' : 'bg-sand'}`} />}
      </React.Fragment>
    ))}
  </div>
);

/* Saved address card */
const SavedAddressCard = ({ address, selected, onSelect }) => (
  <button
    onClick={() => onSelect(address)}
    className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-250 ${
      selected ? 'border-gold bg-gold/5 shadow-sm' : 'border-sand hover:border-taupe bg-white'
    }`}
  >
    <div className="flex items-start gap-3">
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
        selected ? 'border-gold bg-gold' : 'border-sand'
      }`}>
        {selected && <div className="w-2 h-2 rounded-full bg-white" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-sans font-semibold text-deep-brown">{address.label || address.type}</span>
          {address.isDefault && (
            <span className="text-[0.6rem] font-sans text-gold bg-gold/10 border border-gold/20 px-2 py-0.5 rounded-full uppercase tracking-wide">Default</span>
          )}
        </div>
        <p className="text-sm font-sans text-deep-brown">{address.name} · {address.phone}</p>
        <p className="text-xs font-sans text-warm-gray mt-0.5 leading-relaxed">
          {address.addressLine1}{address.addressLine2 ? `, ${address.addressLine2}` : ''}, {address.city}, {address.state} – {address.pincode}
        </p>
      </div>
    </div>
  </button>
);

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [loading, setLoading] = useState(false);

  // Saved addresses
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [addrMode, setAddrMode] = useState('saved'); // 'saved' | 'new'
  const [selectedAddrId, setSelectedAddrId] = useState(null);

  // New address form
  const [newAddrForm, setNewAddrForm] = useState(EMPTY_FORM);

  // Active delivery address (built from saved or new)
  const [deliveryAddress, setDeliveryAddress] = useState(null);

  const shippingPrice = cartTotal > 999 ? 0 : 99;
  const taxPrice = Math.round(cartTotal * 0.18);
  const totalPrice = cartTotal + shippingPrice + taxPrice;

  useEffect(() => {
    if (!cart?.items?.length) navigate('/cart');
  }, [cart, navigate]);

  useEffect(() => {
    getAddresses()
      .then(res => {
        const addrs = res.data.addresses || [];
        setSavedAddresses(addrs);
        if (addrs.length > 0) {
          const def = addrs.find(a => a.isDefault) || addrs[0];
          setSelectedAddrId(def._id);
          setAddrMode('saved');
        } else {
          setAddrMode('new');
          setNewAddrForm(f => ({ ...f, name: user?.name || '', phone: user?.phone || '' }));
        }
      })
      .catch(() => {
        setAddrMode('new');
        setNewAddrForm(f => ({ ...f, name: user?.name || '', phone: user?.phone || '' }));
      });
  }, [user]);

  const handleNewAddrChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewAddrForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const validateNewAddress = () => {
    const { name, phone, addressLine1, city, state, pincode } = newAddrForm;
    if (!name || !phone || !addressLine1 || !city || !state || !pincode) {
      toast.error('Please fill all required address fields'); return false;
    }
    if (!/^\d{10}$/.test(phone)) { toast.error('Enter a valid 10-digit phone number'); return false; }
    if (!/^\d{6}$/.test(pincode)) { toast.error('Enter a valid 6-digit pincode'); return false; }
    return true;
  };

  const handleAddressNext = async () => {
    let addr;
    if (addrMode === 'saved') {
      addr = savedAddresses.find(a => a._id === selectedAddrId);
      if (!addr) { toast.error('Please select a delivery address'); return; }
    } else {
      if (!validateNewAddress()) return;
      addr = { ...newAddrForm };
      // Optionally save to address book
      if (newAddrForm.saveAddress) {
        try {
          const res = await addAddress({ ...newAddrForm, isDefault: savedAddresses.length === 0 });
          setSavedAddresses(res.data.addresses);
          toast.success('Address saved to your address book');
        } catch {
          // Don't block checkout if save fails
        }
      }
    }
    setDeliveryAddress(addr);
    setStep(2);
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const orderRes = await createOrder({
        shippingAddress: {
          name: deliveryAddress.name,
          phone: deliveryAddress.phone,
          addressLine1: deliveryAddress.addressLine1,
          addressLine2: deliveryAddress.addressLine2 || '',
          city: deliveryAddress.city,
          state: deliveryAddress.state,
          pincode: deliveryAddress.pincode,
        },
        paymentMethod,
        customerNotes: '',
      });
      const order = orderRes.data.order;

      if (paymentMethod === 'cod') {
        toast.success('Order placed! We\'ll deliver soon. 🎉');
        navigate(`/order-success/${order._id}`);
        return;
      }

      if (paymentMethod === 'razorpay') {
        const razorRes = await createRazorpayOrder({ amount: totalPrice });
        const { order: rzpOrder, key } = razorRes.data;

        const options = {
          key,
          amount: rzpOrder.amount,
          currency: rzpOrder.currency,
          name: 'Torts & Twirls',
          description: 'Premium Bedsheet Purchase',
          order_id: rzpOrder.id,
          handler: async (response) => {
            try {
              await verifyRazorpayPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: order._id,
              });
              toast.success('Payment successful! 🎉');
              navigate(`/order-success/${order._id}`);
            } catch {
              toast.error('Payment verification failed. Contact support.');
            }
          },
          prefill: {
            name: deliveryAddress.name,
            contact: deliveryAddress.phone,
            email: user?.email,
          },
          theme: { color: '#4A3728' },
          modal: {
            ondismiss: () => {
              toast.info('Payment cancelled. Your order is saved.');
              navigate(`/orders/${order._id}`);
            },
          },
        };

        if (window.Razorpay) {
          const rzp = new window.Razorpay(options);
          rzp.open();
        } else {
          toast.error('Payment gateway not loaded. Please refresh.');
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-4xl text-deep-brown">Checkout</h1>
          <Link to="/cart" className="text-sm font-sans text-warm-gray hover:text-deep-brown transition-colors link-underline">
            ← Back to cart
          </Link>
        </div>

        <StepBar step={step} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main area */}
          <div className="lg:col-span-2 space-y-5">

            {/* ── STEP 1: ADDRESS ── */}
            {step === 1 && (
              <div className="animate-fade-in">
                {/* Saved addresses section */}
                {savedAddresses.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-card p-6 mb-4">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-serif text-xl text-deep-brown">Deliver to a Saved Address</h2>
                      <button
                        onClick={() => setAddrMode(addrMode === 'saved' ? 'new' : 'saved')}
                        className="text-sm font-sans text-gold hover:text-deep-brown transition-colors link-underline"
                      >
                        {addrMode === 'saved' ? '+ Use a different address' : '← Use saved address'}
                      </button>
                    </div>

                    {addrMode === 'saved' && (
                      <div className="space-y-3">
                        {savedAddresses.map(addr => (
                          <SavedAddressCard
                            key={addr._id}
                            address={addr}
                            selected={selectedAddrId === addr._id}
                            onSelect={a => setSelectedAddrId(a._id)}
                          />
                        ))}
                        <Link
                          to="/profile"
                          state={{ tab: 'addresses' }}
                          className="block text-xs font-sans text-taupe hover:text-deep-brown transition-colors text-center py-2"
                        >
                          Manage saved addresses →
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                {/* New address form */}
                {(addrMode === 'new' || savedAddresses.length === 0) && (
                  <div className="bg-white rounded-2xl shadow-card p-6">
                    <h2 className="font-serif text-xl text-deep-brown mb-6">
                      {savedAddresses.length === 0 ? 'Delivery Address' : 'Enter a New Address'}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[0.72rem] font-sans font-semibold text-deep-brown uppercase tracking-wide mb-1.5">Full Name <span className="text-rose-400">*</span></label>
                        <input name="name" value={newAddrForm.name} onChange={handleNewAddrChange} placeholder="Recipient's name" className="input-luxury" />
                      </div>
                      <div>
                        <label className="block text-[0.72rem] font-sans font-semibold text-deep-brown uppercase tracking-wide mb-1.5">Phone <span className="text-rose-400">*</span></label>
                        <input name="phone" value={newAddrForm.phone} onChange={handleNewAddrChange} placeholder="10-digit mobile" className="input-luxury" maxLength={10} />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[0.72rem] font-sans font-semibold text-deep-brown uppercase tracking-wide mb-1.5">Address Line 1 <span className="text-rose-400">*</span></label>
                        <input name="addressLine1" value={newAddrForm.addressLine1} onChange={handleNewAddrChange} placeholder="House/Flat no., Street name" className="input-luxury" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[0.72rem] font-sans font-semibold text-deep-brown uppercase tracking-wide mb-1.5">Address Line 2 <span className="text-taupe">(Optional)</span></label>
                        <input name="addressLine2" value={newAddrForm.addressLine2} onChange={handleNewAddrChange} placeholder="Landmark, Area, Colony" className="input-luxury" />
                      </div>
                      <div>
                        <label className="block text-[0.72rem] font-sans font-semibold text-deep-brown uppercase tracking-wide mb-1.5">City <span className="text-rose-400">*</span></label>
                        <input name="city" value={newAddrForm.city} onChange={handleNewAddrChange} placeholder="Your city" className="input-luxury" />
                      </div>
                      <div>
                        <label className="block text-[0.72rem] font-sans font-semibold text-deep-brown uppercase tracking-wide mb-1.5">Pincode <span className="text-rose-400">*</span></label>
                        <input name="pincode" value={newAddrForm.pincode} onChange={handleNewAddrChange} placeholder="6-digit" maxLength={6} className="input-luxury" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[0.72rem] font-sans font-semibold text-deep-brown uppercase tracking-wide mb-1.5">State <span className="text-rose-400">*</span></label>
                        <select name="state" value={newAddrForm.state} onChange={handleNewAddrChange} className="input-luxury">
                          <option value="">Select State</option>
                          {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Save address toggle */}
                    <label className="flex items-center gap-3 mt-5 cursor-pointer group">
                      <div className="relative">
                        <input type="checkbox" name="saveAddress" checked={newAddrForm.saveAddress} onChange={handleNewAddrChange} className="sr-only" />
                        <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${newAddrForm.saveAddress ? 'bg-deep-brown border-deep-brown' : 'border-sand group-hover:border-taupe'}`}>
                          {newAddrForm.saveAddress && (
                            <svg className="w-3 h-3 text-cream" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                      <span className="text-sm font-sans text-warm-gray group-hover:text-deep-brown transition-colors">
                        Save this address for future orders
                      </span>
                    </label>
                  </div>
                )}

                <button onClick={handleAddressNext} className="btn-primary w-full py-4 text-[0.95rem] mt-2">
                  Continue to Payment →
                </button>
              </div>
            )}

            {/* ── STEP 2: PAYMENT ── */}
            {step === 2 && (
              <div className="bg-white rounded-2xl shadow-card p-6 animate-fade-in">
                <h2 className="font-serif text-xl text-deep-brown mb-6">Payment Method</h2>
                <div className="space-y-3 mb-6">
                  {[
                    { value: 'razorpay', label: 'Pay Online', sub: 'UPI, Credit/Debit Card, Net Banking via Razorpay', icon: '💳' },
                    { value: 'cod', label: 'Cash on Delivery', sub: 'Pay when your order arrives at your door', icon: '💵' },
                  ].map(method => (
                    <label
                      key={method.value}
                      className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-250 ${paymentMethod === method.value ? 'border-gold bg-gold/5' : 'border-sand hover:border-taupe bg-white'}`}
                    >
                      <input type="radio" name="payment" value={method.value} checked={paymentMethod === method.value} onChange={() => setPaymentMethod(method.value)} className="accent-deep-brown" />
                      <span className="text-2xl">{method.icon}</span>
                      <div>
                        <p className="text-sm font-sans font-semibold text-deep-brown">{method.label}</p>
                        <p className="text-xs font-sans text-warm-gray">{method.sub}</p>
                      </div>
                    </label>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="btn-outline flex-1 py-3">← Back</button>
                  <button onClick={() => setStep(3)} className="btn-primary flex-1 py-3">Review Order →</button>
                </div>
              </div>
            )}

            {/* ── STEP 3: REVIEW ── */}
            {step === 3 && deliveryAddress && (
              <div className="space-y-4 animate-fade-in">
                {/* Address summary */}
                <div className="bg-white rounded-2xl shadow-card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-serif text-lg text-deep-brown">Delivery Address</h3>
                    <button onClick={() => setStep(1)} className="text-xs font-sans text-gold hover:text-deep-brown link-underline">Edit</button>
                  </div>
                  <p className="text-sm font-sans font-semibold text-deep-brown">{deliveryAddress.name} · {deliveryAddress.phone}</p>
                  <p className="text-sm font-sans text-warm-gray mt-1">
                    {deliveryAddress.addressLine1}{deliveryAddress.addressLine2 ? `, ${deliveryAddress.addressLine2}` : ''}
                  </p>
                  <p className="text-sm font-sans text-warm-gray">{deliveryAddress.city}, {deliveryAddress.state} – {deliveryAddress.pincode}</p>
                </div>

                {/* Payment summary */}
                <div className="bg-white rounded-2xl shadow-card p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-serif text-lg text-deep-brown">Payment</h3>
                    <button onClick={() => setStep(2)} className="text-xs font-sans text-gold hover:text-deep-brown link-underline">Edit</button>
                  </div>
                  <p className="text-sm font-sans text-warm-gray capitalize">
                    {paymentMethod === 'razorpay' ? '💳 Online Payment (Razorpay)' : '💵 Cash on Delivery'}
                  </p>
                </div>

                {/* Items */}
                <div className="bg-white rounded-2xl shadow-card p-5">
                  <h3 className="font-serif text-lg text-deep-brown mb-4">Items ({cart?.items?.length})</h3>
                  <div className="space-y-3">
                    {cart?.items?.map(item => (
                      <div key={item._id} className="flex items-center gap-3">
                        <img src={item.product?.images?.[0]} alt={item.product?.name} className="w-14 h-14 object-cover rounded-xl flex-shrink-0" onError={e => e.target.src = 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=100'} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-sans font-medium text-deep-brown line-clamp-1">{item.product?.name}</p>
                          <p className="text-xs text-taupe font-sans capitalize">{item.size} · {item.color} · Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-sans font-semibold text-deep-brown">
                          ₹{((item.product?.discountPrice || item.product?.price) * item.quantity).toLocaleString('en-IN')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(2)} className="btn-outline flex-1 py-3.5">← Back</button>
                  <button onClick={handlePlaceOrder} disabled={loading} className="btn-primary flex-1 py-3.5 disabled:opacity-60">
                    {loading ? 'Placing Order...' : paymentMethod === 'cod' ? 'Place Order 🎉' : 'Proceed to Pay →'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order summary sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-card p-6 sticky top-24">
              <h3 className="font-serif text-lg text-deep-brown mb-5">Order Summary</h3>

              <div className="space-y-3 mb-5 max-h-52 overflow-y-auto">
                {cart?.items?.map(item => (
                  <div key={item._id} className="flex items-center gap-2.5">
                    <div className="relative flex-shrink-0">
                      <img src={item.product?.images?.[0]} alt={item.product?.name} className="w-12 h-12 rounded-xl object-cover" onError={e => e.target.src = 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=100'} />
                      <span className="absolute -top-1.5 -right-1.5 bg-deep-brown text-cream text-[0.6rem] w-5 h-5 rounded-full flex items-center justify-center font-sans font-semibold">{item.quantity}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-sans font-medium text-deep-brown line-clamp-1">{item.product?.name}</p>
                      <p className="text-[0.65rem] text-taupe font-sans capitalize">{item.size}</p>
                    </div>
                    <p className="text-xs font-sans font-semibold text-deep-brown flex-shrink-0">
                      ₹{((item.product?.discountPrice || item.product?.price) * item.quantity).toLocaleString('en-IN')}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-sand pt-4 space-y-2.5">
                <div className="flex justify-between text-sm font-sans"><span className="text-warm-gray">Subtotal</span><span className="text-deep-brown font-medium">₹{cartTotal.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between text-sm font-sans"><span className="text-warm-gray">Shipping</span><span className={shippingPrice === 0 ? 'text-emerald-600 font-medium' : 'text-deep-brown'}>{shippingPrice === 0 ? '🎉 Free' : `₹${shippingPrice}`}</span></div>
                <div className="flex justify-between text-sm font-sans"><span className="text-warm-gray">GST (18%)</span><span className="text-deep-brown">₹{taxPrice.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between font-semibold text-[1.05rem] border-t border-sand pt-3">
                  <span className="font-sans text-deep-brown">Total</span>
                  <span className="font-sans text-deep-brown">₹{totalPrice.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {shippingPrice > 0 && (
                <p className="text-xs text-amber-600 font-sans mt-3 bg-amber-50 px-3 py-2 rounded-xl">
                  Add ₹{(999 - cartTotal + 1).toLocaleString('en-IN')} more for free shipping
                </p>
              )}

              <div className="flex items-center justify-center gap-4 mt-5 pt-4 border-t border-sand">
                {['🔒 SSL', '↩️ 15-Day Return', '🚚 Tracked'].map(b => (
                  <span key={b} className="text-[0.65rem] font-sans text-taupe">{b}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
