import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const CartPage = () => {
  const { cart, cartLoading, cartTotal, updateCartItem, removeFromCart } = useCart();
  const navigate = useNavigate();

  const shipping = cartTotal > 999 ? 0 : 99;
  const tax = Math.round(cartTotal * 0.18);
  const total = cartTotal + shipping + tax;
  const itemCount = cart?.items?.reduce((s, i) => s + i.quantity, 0) || 0;

  if (cartLoading) return (
    <div className="min-h-screen bg-cream pt-24 flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-deep-brown border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!cart?.items?.length) return (
    <div className="min-h-screen bg-cream pt-24 flex items-center justify-center px-4">
      <div className="text-center max-w-md animate-fade-in">
        <div className="w-28 h-28 bg-light-beige rounded-full flex items-center justify-center mx-auto mb-8">
          <svg className="w-14 h-14 text-taupe" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.25} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <h2 className="font-display text-3xl text-deep-brown mb-3">Your cart is empty</h2>
        <p className="font-sans text-warm-gray mb-8 leading-relaxed text-sm">
          Looks like you haven't added anything yet. Browse our premium bedsheet collections.
        </p>
        <Link to="/products" className="btn-primary">Browse Collection →</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-cream pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex items-baseline justify-between mb-10">
          <div>
            <h1 className="font-display text-4xl text-deep-brown">Shopping Cart</h1>
            <p className="text-sm font-sans text-taupe mt-1">{itemCount} {itemCount === 1 ? 'item' : 'items'}</p>
          </div>
          <Link to="/products" className="text-sm font-sans text-warm-gray hover:text-deep-brown transition-colors link-underline hidden sm:block">
            ← Continue shopping
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item, index) => {
              const product = item.product;
              if (!product) return null;
              const price = product.discountPrice || product.price;
              return (
                <div
                  key={item._id}
                  className="bg-white rounded-2xl shadow-card p-5 flex gap-5 group hover:shadow-[0_8px_30px_rgba(74,55,40,0.1)] transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 0.08}s` }}
                >
                  {/* Image */}
                  <Link to={`/products/${product._id}`} className="flex-shrink-0 relative overflow-hidden rounded-xl w-24 h-24 bg-light-beige">
                    <img
                      src={product.images?.[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400"
                      onError={e => e.target.src = 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=300'}
                    />
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <Link to={`/products/${product._id}`}>
                        <h3 className="font-serif text-deep-brown font-medium text-[0.95rem] leading-snug hover:text-warm-gray transition-colors line-clamp-2">
                          {product.name}
                        </h3>
                      </Link>
                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-taupe hover:text-rose-400 hover:bg-rose-50 transition-all duration-200"
                        aria-label="Remove item"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-1 mb-3">
                      {item.size && (
                        <span className="text-[0.7rem] font-sans text-warm-gray bg-cream px-2.5 py-1 rounded-full capitalize border border-sand/50">
                          {item.size}
                        </span>
                      )}
                      {item.color && (
                        <span className="text-[0.7rem] font-sans text-warm-gray bg-cream px-2.5 py-1 rounded-full border border-sand/50">
                          {item.color}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      {/* Quantity controls */}
                      <div className="flex items-center border border-sand rounded-xl overflow-hidden bg-cream/50">
                        <button
                          onClick={() => updateCartItem(item._id, item.quantity - 1)}
                          className="px-3 py-2 text-warm-gray hover:bg-sand hover:text-deep-brown transition-colors text-base leading-none"
                        >
                          −
                        </button>
                        <span className="px-4 py-2 text-sm font-sans font-medium text-deep-brown border-x border-sand min-w-[2.5rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartItem(item._id, item.quantity + 1)}
                          className="px-3 py-2 text-warm-gray hover:bg-sand hover:text-deep-brown transition-colors text-base leading-none"
                        >
                          +
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="font-sans font-semibold text-deep-brown text-[1rem]">
                          ₹{(price * item.quantity).toLocaleString('en-IN')}
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-[0.72rem] text-taupe font-sans">
                            ₹{price.toLocaleString('en-IN')} each
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Promo code */}
            <div className="bg-white rounded-2xl shadow-card p-5">
              <p className="text-sm font-sans font-medium text-deep-brown mb-3">Have a promo code?</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter code (e.g. FIRST10)"
                  className="input-luxury flex-1 text-sm py-2.5"
                />
                <button className="btn-outline py-2.5 px-5 text-sm">Apply</button>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-card p-6 sticky top-24">
              <h2 className="font-serif text-xl text-deep-brown mb-6">Order Summary</h2>

              {/* Items list */}
              <div className="space-y-3 mb-5">
                {cart.items.map(item => {
                  if (!item.product) return null;
                  const price = item.product.discountPrice || item.product.price;
                  return (
                    <div key={item._id} className="flex items-center gap-2.5">
                      <div className="relative flex-shrink-0">
                        <img
                          src={item.product.images?.[0]}
                          alt={item.product.name}
                          className="w-12 h-12 rounded-xl object-cover"
                          onError={e => e.target.src = 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=100'}
                        />
                        <span className="absolute -top-1.5 -right-1.5 bg-deep-brown text-cream text-[0.6rem] w-4.5 h-4.5 rounded-full flex items-center justify-center font-sans w-5 h-5 font-medium">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-sans text-deep-brown line-clamp-1 font-medium">{item.product.name}</p>
                        <p className="text-[0.68rem] text-taupe font-sans capitalize">{item.size}</p>
                      </div>
                      <p className="text-xs font-sans font-medium text-deep-brown flex-shrink-0">
                        ₹{(price * item.quantity).toLocaleString('en-IN')}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-sand pt-4 space-y-3">
                <div className="flex justify-between text-sm font-sans">
                  <span className="text-warm-gray">Subtotal ({itemCount} items)</span>
                  <span className="text-deep-brown font-medium">₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm font-sans">
                  <span className="text-warm-gray">Shipping</span>
                  <span className={shipping === 0 ? 'text-emerald-600 font-medium' : 'text-deep-brown'}>
                    {shipping === 0 ? '🎉 Free' : `₹${shipping}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-sans">
                  <span className="text-warm-gray">GST (18%)</span>
                  <span className="text-deep-brown">₹{tax.toLocaleString('en-IN')}</span>
                </div>

                {shipping > 0 && (
                  <div className="bg-amber-50 border border-amber-100 rounded-xl px-3.5 py-2.5">
                    <p className="text-xs font-sans text-amber-700">
                      Add <strong>₹{(999 - cartTotal + 1).toLocaleString('en-IN')}</strong> more for <strong>free shipping!</strong>
                    </p>
                    {/* Progress bar */}
                    <div className="mt-2 h-1.5 bg-amber-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all duration-700"
                        style={{ width: `${Math.min((cartTotal / 999) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-between font-sans font-semibold text-[1.05rem] border-t border-sand pt-3 mt-1">
                  <span className="text-deep-brown">Total</span>
                  <span className="text-deep-brown">₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="btn-primary w-full mt-6 py-4 text-[0.95rem] group"
              >
                Proceed to Checkout
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>

              {/* Trust micro-badges */}
              <div className="flex items-center justify-center gap-4 mt-5 pt-5 border-t border-sand">
                {['🔒 Secure', '↩️ Returns', '🚚 Tracked'].map(b => (
                  <span key={b} className="text-[0.68rem] font-sans text-taupe">{b}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
