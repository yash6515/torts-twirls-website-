import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

export const StarRating = ({ rating = 0, size = 'sm' }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <svg
        key={i}
        className={`${size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'} transition-colors ${i < Math.round(rating) ? 'text-amber-400' : 'text-sand'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

const colorHexMap = {
  'Ivory': '#FFFFF0', 'White': '#FEFEFE', 'Pearl': '#F0EAD6', 'Cream': '#FFFDD0',
  'Blush Pink': '#FFB6C1', 'Rose': '#E8748E', 'Midnight Blue': '#191970',
  'Navy': '#1B2A4A', 'Sage Green': '#87A878', 'Olive': '#708238',
  'Pearl White': '#F0EAD6', 'Dusty Blue': '#7A99AA', 'Steel Blue': '#4E7BA0',
  'Terracotta': '#C9735A', 'Rust': '#A33B1F', 'Brown': '#7D4427',
  'Chocolate': '#7C2D12', 'Vanilla': '#F5E6DC', 'Strawberry': '#FC5A8D',
  'Red Velvet': '#BE123C', 'Caramel': '#C4A882',
};

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [adding, setAdding] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const inWishlist = isInWishlist(product._id);
  const displayPrice = product.discountPrice || product.price;
  const discountPct = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (adding || product.stock === 0) return;
    setAdding(true);
    await addToCart(product._id, 1, product.size?.[0] || '', product.color?.[0] || '');
    setTimeout(() => setAdding(false), 800);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product._id);
  };

  return (
    <div className="product-card bg-white rounded-2xl overflow-hidden group relative shadow-card">
      {/* Image area */}
      <div className="product-image-wrap aspect-[3/4] bg-light-beige relative">
        <Link to={`/products/${product._id}`} className="block w-full h-full">
          {!imageLoaded && <div className="skeleton absolute inset-0 rounded-none" />}
          <img
            src={product.images?.[0] || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600'}
            alt={product.name}
            className={`w-full h-full object-cover transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
          />
        </Link>

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-chocolate/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {discountPct > 0 && (
            <span className="bg-rose-primary text-white text-[0.68rem] px-2.5 py-1 rounded-full font-sans font-semibold tracking-wide shadow-sm">
              −{discountPct}%
            </span>
          )}
          {product.isFeatured && !discountPct && (
            <span className="bg-chocolate text-white text-[0.68rem] px-2.5 py-1 rounded-full font-sans font-semibold tracking-wide shadow-sm">
              ✦ Featured
            </span>
          )}
          {product.stock === 0 && (
            <span className="bg-warm-gray/90 text-white text-[0.68rem] px-2.5 py-1 rounded-full font-sans font-semibold">
              Sold Out
            </span>
          )}
        </div>

        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center shadow-card transition-all duration-300 z-10 ${
            inWishlist
              ? 'bg-rose-50 opacity-100 scale-100'
              : 'bg-white/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100'
          } hover:scale-110`}
          aria-label="Toggle wishlist"
        >
          <svg
            className={`w-4 h-4 transition-all duration-300 ${inWishlist ? 'text-rose-primary fill-rose-primary scale-110' : 'text-warm-gray'}`}
            fill={inWishlist ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        {/* Quick add button */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] z-10">
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0 || adding}
            className={`w-full py-3 sm:py-3.5 text-[0.8rem] font-sans font-medium tracking-wide transition-all duration-200 ${
              product.stock === 0
                ? 'bg-warm-gray/80 text-white cursor-not-allowed'
                : adding
                  ? 'bg-sage text-white'
                  : 'bg-deep-brown text-white hover:bg-rose-primary'
            }`}
          >
            {product.stock === 0 ? 'Out of Stock' : adding ? '✓ Added!' : 'Quick Add to Cart'}
          </button>
        </div>
      </div>

      {/* Info section */}
      <div className="p-3 sm:p-4 pb-4 sm:pb-5">
        <div className="flex items-start justify-between gap-2 mb-1">
          <Link to={`/products/${product._id}`} className="flex-1 group/title">
            <h3 className="font-serif text-deep-brown text-[0.85rem] sm:text-[0.9rem] font-medium leading-snug line-clamp-2 group-hover/title:text-rose-primary transition-colors duration-200">
              {product.name}
            </h3>
          </Link>
        </div>

        <p className="text-[0.72rem] text-taupe font-sans capitalize mt-1 mb-2 tracking-wide">
          {product.category}{product.fabric ? ` · ${product.fabric}` : ''}
        </p>

        <div className="flex items-center gap-1.5 mb-3 sm:mb-3.5">
          <StarRating rating={product.rating} size="sm" />
          <span className="text-[0.72rem] text-warm-gray font-sans">
            {product.rating ? `${product.rating}` : '—'}
            {product.numReviews > 0 && <span className="text-taupe"> ({product.numReviews})</span>}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-sans font-semibold text-deep-brown text-[1rem] sm:text-[1.05rem]">
              ₹{displayPrice.toLocaleString('en-IN')}
            </span>
            {product.discountPrice > 0 && (
              <span className="text-[0.75rem] text-taupe line-through font-sans">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {/* Color swatches */}
          {product.color?.length > 0 && (
            <div className="flex gap-1">
              {product.color.slice(0, 4).map((c, i) => (
                <div
                  key={i}
                  title={c}
                  className="w-3.5 h-3.5 rounded-full border border-sand ring-1 ring-offset-1 ring-transparent hover:ring-rose-primary/50 transition-all duration-200 cursor-pointer"
                  style={{ backgroundColor: colorHexMap[c] || '#F5E6DC' }}
                />
              ))}
              {product.color.length > 4 && (
                <span className="text-[0.65rem] text-taupe font-sans self-center">+{product.color.length - 4}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export { colorHexMap };
export default ProductCard;
