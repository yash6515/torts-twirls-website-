import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/product/ProductCard';

const WishlistPage = () => {
  const { wishlist } = useWishlist();
  return (
    <div className="pt-[72px] min-h-screen bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="font-display text-3xl text-deep-brown mb-8">My Wishlist {wishlist.length > 0 && <span className="text-warm-gray text-xl">({wishlist.length})</span>}</h1>
        {wishlist.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-5xl block mb-4">🤍</span>
            <h2 className="font-serif text-2xl text-deep-brown mb-2">Your wishlist is empty</h2>
            <p className="text-warm-gray font-sans mb-6">Save items you love to your wishlist</p>
            <Link to="/products" className="btn-primary inline-block">Explore Products</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishlist.map(product => <ProductCard key={product._id} product={product} />)}
          </div>
        )}
      </div>
    </div>
  );
};
export default WishlistPage;
