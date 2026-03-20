import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProduct, addReview } from '../utils/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { StarRating } from '../components/product/ProductCard';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [zoomed, setZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [addingCart, setAddingCart] = useState(false);
  const [mounted, setMounted] = useState(false);

  const imgRef = useRef(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await getProduct(id);
        setProduct(res.data.product);
        setSelectedSize(res.data.product.size?.[0] || 'queen');
        setSelectedColor(res.data.product.color?.[0] || '');
        setTimeout(() => setMounted(true), 50);
      } catch {
        toast.error('Product not found');
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setZoomPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) { toast.info('Please login to add to cart'); navigate('/login'); return false; }
    setAddingCart(true);
    const success = await addToCart(product._id, quantity, selectedSize, selectedColor);
    setTimeout(() => setAddingCart(false), 800);
    return success;
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    await handleAddToCart();
    navigate('/cart');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.info('Please login to review'); return; }
    if (!reviewComment.trim()) { toast.error('Please write a comment'); return; }
    setReviewLoading(true);
    try {
      const res = await addReview(id, { rating: reviewRating, comment: reviewComment });
      setProduct(res.data.product);
      setReviewComment('');
      setReviewRating(5);
      toast.success('Review submitted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setReviewLoading(false);
    }
  };

  const discountPct = product?.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  if (loading) return (
    <div className="min-h-screen bg-cream pt-24 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-deep-brown border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-sans text-taupe">Loading product...</p>
      </div>
    </div>
  );

  if (!product) return null;

  const displayPrice = product.discountPrice || product.price;

  return (
    <div className="min-h-screen bg-cream pt-20">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <nav className="flex items-center gap-2 text-xs font-sans text-taupe">
          <Link to="/" className="hover:text-deep-brown transition-colors">Home</Link>
          <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <Link to="/products" className="hover:text-deep-brown transition-colors">Products</Link>
          <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <Link to={`/products?category=${product.category}`} className="hover:text-deep-brown transition-colors capitalize">{product.category}</Link>
          <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <span className="text-deep-brown line-clamp-1">{product.name}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">

          {/* ── LEFT: Image Gallery ── */}
          <div className={`space-y-4 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            {/* Main image */}
            <div
              ref={imgRef}
              className="relative rounded-3xl overflow-hidden bg-light-beige cursor-crosshair shadow-card"
              style={{ aspectRatio: '1/1' }}
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setZoomed(true)}
              onMouseLeave={() => setZoomed(false)}
            >
              <img
                src={product.images?.[selectedImage] || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=900'}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-200 will-change-transform"
                style={zoomed ? {
                  transform: 'scale(2.2)',
                  transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`
                } : {}}
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-deep-brown/10 to-transparent pointer-events-none" />

              {/* Badges */}
              {discountPct > 0 && (
                <div className="absolute top-4 left-4">
                  <span className="bg-rose-400 text-white text-sm px-3.5 py-1.5 rounded-full font-sans font-semibold shadow-sm">
                    −{discountPct}%
                  </span>
                </div>
              )}

              {/* Zoom hint */}
              <div className={`absolute bottom-4 right-4 bg-black/30 backdrop-blur-sm text-white text-[0.65rem] font-sans px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-opacity duration-300 ${zoomed ? 'opacity-0' : 'opacity-100'}`}>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Hover to zoom
              </div>

              {/* Wishlist on image */}
              <button
                onClick={() => toggleWishlist(product._id)}
                className={`absolute top-4 right-4 w-10 h-10 rounded-2xl flex items-center justify-center shadow-card transition-all duration-300 ${isInWishlist(product._id) ? 'bg-rose-50' : 'bg-white/90 backdrop-blur-sm'} hover:scale-110`}
              >
                <svg className={`w-5 h-5 transition-all duration-300 ${isInWishlist(product._id) ? 'text-rose-500 fill-rose-500' : 'text-warm-gray'}`} fill={isInWishlist(product._id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>

              {/* Image navigation arrows */}
              {product.images?.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage(i => Math.max(0, i - 1))}
                    disabled={selectedImage === 0}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm disabled:opacity-30 hover:bg-white transition-all"
                  >
                    <svg className="w-4 h-4 text-deep-brown" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <button
                    onClick={() => setSelectedImage(i => Math.min(product.images.length - 1, i + 1))}
                    disabled={selectedImage === product.images.length - 1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm disabled:opacity-30 hover:bg-white transition-all"
                  >
                    <svg className="w-4 h-4 text-deep-brown" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail strip */}
            {product.images?.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`flex-shrink-0 w-[72px] h-[72px] rounded-xl overflow-hidden transition-all duration-300 ${
                      i === selectedImage
                        ? 'ring-2 ring-deep-brown ring-offset-2'
                        : 'opacity-60 hover:opacity-90 hover:ring-1 hover:ring-taupe hover:ring-offset-1'
                    }`}
                  >
                    <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT: Product Info ── */}
          <div className={`transition-all duration-700 delay-150 ease-[cubic-bezier(0.16,1,0.3,1)] ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            {/* Category tag */}
            <span className="inline-block text-[0.68rem] font-sans uppercase tracking-[0.18em] text-gold bg-gold/10 border border-gold/20 px-3 py-1.5 rounded-full mb-4 capitalize">
              {product.category}
            </span>

            <h1 className="font-display text-[2.2rem] lg:text-[2.6rem] text-deep-brown leading-[1.12] mb-4">
              {product.name}
            </h1>

            {/* Rating row */}
            <div className="flex items-center gap-3 mb-6">
              <StarRating rating={product.rating} size="md" />
              <span className="text-sm font-sans text-deep-brown font-medium">{product.rating || 0}</span>
              <span className="text-sm font-sans text-taupe">({product.numReviews} {product.numReviews === 1 ? 'review' : 'reviews'})</span>
              {product.soldCount > 0 && (
                <>
                  <span className="text-sand">·</span>
                  <span className="text-sm font-sans text-taupe">{product.soldCount} sold</span>
                </>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="font-display text-[2.4rem] text-deep-brown font-medium leading-none">
                ₹{displayPrice.toLocaleString('en-IN')}
              </span>
              {product.discountPrice > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-lg font-sans text-taupe line-through">₹{product.price.toLocaleString('en-IN')}</span>
                  <span className="text-sm font-sans font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Save ₹{(product.price - product.discountPrice).toLocaleString('en-IN')}
                  </span>
                </div>
              )}
            </div>

            <p className="text-[0.9rem] font-sans text-warm-gray leading-[1.75] mb-8">{product.shortDescription}</p>

            <div className="space-y-6 mb-8">
              {/* Size */}
              {product.size?.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-sans font-semibold text-deep-brown">Size</span>
                    <span className="text-xs text-gold font-sans capitalize bg-gold/10 px-2.5 py-1 rounded-full">{selectedSize}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.size.map(s => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={`px-4 py-2.5 text-sm rounded-xl border font-sans capitalize transition-all duration-250 ${
                          selectedSize === s
                            ? 'bg-deep-brown text-cream border-deep-brown shadow-sm'
                            : 'border-sand text-warm-gray hover:border-taupe hover:text-deep-brown bg-white'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color */}
              {product.color?.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-sans font-semibold text-deep-brown">Color</span>
                    <span className="text-xs text-gold font-sans bg-gold/10 px-2.5 py-1 rounded-full">{selectedColor}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.color.map(c => (
                      <button
                        key={c}
                        onClick={() => setSelectedColor(c)}
                        className={`px-3.5 py-2 text-xs rounded-xl border font-sans transition-all duration-250 ${
                          selectedColor === c
                            ? 'bg-deep-brown text-cream border-deep-brown'
                            : 'border-sand text-warm-gray hover:border-taupe bg-white'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div>
                <span className="text-sm font-sans font-semibold text-deep-brown block mb-3">Quantity</span>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-sand rounded-xl overflow-hidden bg-white">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="px-4 py-3 text-warm-gray hover:bg-cream hover:text-deep-brown transition-colors text-lg leading-none"
                    >
                      −
                    </button>
                    <span className="w-12 text-center font-sans font-medium text-deep-brown py-3 text-sm">{quantity}</span>
                    <button
                      onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                      className="px-4 py-3 text-warm-gray hover:bg-cream hover:text-deep-brown transition-colors text-lg leading-none"
                    >
                      +
                    </button>
                  </div>
                  <span className={`text-xs font-sans px-2.5 py-1 rounded-full ${
                    product.stock > 10 ? 'text-emerald-700 bg-emerald-50' :
                    product.stock > 0 ? 'text-amber-700 bg-amber-50' :
                    'text-rose-700 bg-rose-50'
                  }`}>
                    {product.stock > 10 ? `${product.stock} in stock` : product.stock > 0 ? `Only ${product.stock} left!` : 'Out of stock'}
                  </span>
                </div>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex gap-3 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0 || addingCart}
                className={`flex-1 btn-outline py-4 text-[0.9rem] disabled:opacity-50 disabled:cursor-not-allowed transition-all ${addingCart ? 'bg-sage/10 border-sage text-sage' : ''}`}
              >
                {addingCart ? '✓ Added to Cart!' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className="flex-1 btn-primary py-4 text-[0.9rem] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Buy Now →
              </button>
            </div>

            {/* Key features */}
            {product.features?.filter(Boolean).length > 0 && (
              <div className="bg-gradient-to-br from-light-beige to-cream rounded-2xl p-5 mb-6 border border-sand/50">
                <h4 className="text-[0.72rem] font-sans font-semibold text-deep-brown uppercase tracking-[0.15em] mb-4">Key Features</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {product.features.filter(Boolean).map((f, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-sage/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-3 h-3 text-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-sm font-sans text-warm-gray leading-snug">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: '🚚', label: 'Free Shipping', sub: 'Above ₹999' },
                { icon: '↩️', label: '15-Day Return', sub: 'Hassle-free' },
                { icon: '🔒', label: 'Secure Pay', sub: 'Razorpay' },
              ].map(badge => (
                <div key={badge.label} className="text-center p-3.5 rounded-2xl bg-white border border-sand/50 hover:border-taupe transition-colors group">
                  <div className="text-xl mb-1.5 group-hover:scale-110 transition-transform duration-300">{badge.icon}</div>
                  <p className="text-[0.72rem] font-sans font-semibold text-deep-brown">{badge.label}</p>
                  <p className="text-[0.65rem] font-sans text-taupe">{badge.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="mt-20">
          <div className="flex border-b border-sand gap-1">
            {[
              { key: 'description', label: 'Description' },
              { key: 'details', label: 'Product Details' },
              { key: 'reviews', label: `Reviews (${product.numReviews})` },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`pb-3 px-4 text-sm font-sans transition-all duration-250 border-b-2 -mb-px ${
                  activeTab === tab.key
                    ? 'text-deep-brown border-deep-brown font-semibold'
                    : 'text-warm-gray border-transparent hover:text-deep-brown hover:border-taupe'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="mt-10 animate-fade-in">
            {activeTab === 'description' && (
              <div className="max-w-3xl">
                <p className="text-[0.95rem] font-sans text-warm-gray leading-[1.85]">{product.description}</p>
              </div>
            )}

            {activeTab === 'details' && (
              <div className="max-w-lg bg-white rounded-2xl overflow-hidden shadow-card">
                {[
                  { label: 'Fabric', value: product.fabric },
                  { label: 'Thread Count', value: product.threadCount > 0 ? `${product.threadCount} TC` : 'N/A' },
                  { label: 'Category', value: product.category },
                  { label: 'Available Sizes', value: product.size?.join(', ') },
                  { label: 'Colors', value: product.color?.join(', ') },
                  { label: 'SKU', value: product.sku },
                ].map((item, i) => (
                  <div key={item.label} className={`flex py-4 px-5 ${i % 2 === 0 ? 'bg-white' : 'bg-cream/50'}`}>
                    <dt className="w-40 text-sm font-sans font-medium text-deep-brown flex-shrink-0">{item.label}</dt>
                    <dd className="text-sm font-sans text-warm-gray capitalize">{item.value || '—'}</dd>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="max-w-2xl space-y-8">
                {/* Rating overview */}
                {product.numReviews > 0 && (
                  <div className="bg-white rounded-2xl p-6 shadow-card flex items-center gap-8">
                    <div className="text-center">
                      <p className="font-display text-5xl text-deep-brown">{product.rating}</p>
                      <StarRating rating={product.rating} size="md" />
                      <p className="text-xs text-taupe font-sans mt-1">{product.numReviews} reviews</p>
                    </div>
                    <div className="flex-1 space-y-2">
                      {[5, 4, 3, 2, 1].map(star => {
                        const count = product.reviews?.filter(r => Math.round(r.rating) === star).length || 0;
                        const pct = product.numReviews > 0 ? (count / product.numReviews) * 100 : 0;
                        return (
                          <div key={star} className="flex items-center gap-2">
                            <span className="text-xs font-sans text-warm-gray w-3">{star}</span>
                            <svg className="w-3 h-3 text-amber-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                            <div className="flex-1 bg-sand rounded-full h-1.5 overflow-hidden">
                              <div className="h-full bg-amber-400 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs font-sans text-taupe w-5 text-right">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Review list */}
                {product.reviews?.length > 0 ? (
                  <div className="space-y-4">
                    {product.reviews.map((review, i) => (
                      <div key={i} className="bg-white rounded-2xl p-5 shadow-card hover:shadow-[0_8px_30px_rgba(74,55,40,0.1)] transition-shadow duration-300">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-sand to-taupe rounded-full flex items-center justify-center text-sm font-semibold text-deep-brown">
                              {review.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-sans font-semibold text-deep-brown">{review.name}</p>
                              <p className="text-[0.7rem] text-taupe font-sans">
                                {new Date(review.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                              </p>
                            </div>
                          </div>
                          <StarRating rating={review.rating} size="sm" />
                        </div>
                        <p className="text-sm font-sans text-warm-gray leading-relaxed">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white rounded-2xl shadow-card">
                    <span className="text-4xl block mb-3">⭐</span>
                    <p className="font-sans text-warm-gray">No reviews yet. Be the first!</p>
                  </div>
                )}

                {/* Write review */}
                {isAuthenticated && (
                  <div className="bg-gradient-to-br from-light-beige to-cream rounded-2xl p-6 border border-sand/50">
                    <h4 className="font-display text-xl text-deep-brown mb-5">Write a Review</h4>
                    <form onSubmit={handleReviewSubmit} className="space-y-4">
                      <div>
                        <label className="text-[0.72rem] font-sans font-semibold text-deep-brown uppercase tracking-wide block mb-2.5">Your Rating</label>
                        <div className="flex gap-1.5">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button key={star} type="button" onClick={() => setReviewRating(star)} className="transition-transform hover:scale-125">
                              <svg className={`w-8 h-8 transition-colors duration-200 ${star <= reviewRating ? 'text-amber-400' : 'text-sand'}`} fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            </button>
                          ))}
                          <span className="text-sm font-sans text-warm-gray self-center ml-2">{['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][reviewRating]}</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-[0.72rem] font-sans font-semibold text-deep-brown uppercase tracking-wide block mb-2">Your Review</label>
                        <textarea
                          rows={4}
                          value={reviewComment}
                          onChange={e => setReviewComment(e.target.value)}
                          placeholder="Tell others about your experience with this product..."
                          className="input-luxury resize-none"
                        />
                      </div>
                      <button type="submit" disabled={reviewLoading} className="btn-primary disabled:opacity-50">
                        {reviewLoading ? 'Submitting...' : 'Submit Review →'}
                      </button>
                    </form>
                  </div>
                )}
                {!isAuthenticated && (
                  <div className="bg-white rounded-2xl p-6 shadow-card text-center border border-sand/50">
                    <p className="text-sm font-sans text-warm-gray mb-4">Please sign in to leave a review.</p>
                    <Link to="/login" className="btn-primary text-sm">Sign In to Review</Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
