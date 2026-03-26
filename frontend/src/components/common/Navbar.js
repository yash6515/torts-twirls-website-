import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount } = useCart();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();
  const userMenuRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setScrolled(scrollY > 30);
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docHeight > 0 ? (scrollY / docHeight) * 100 : 0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setUserMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (searchOpen && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 100);
    }
  }, [searchOpen]);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { label: 'Shop All', path: '/products' },
    { label: 'Cotton', path: '/products?category=cotton' },
    { label: 'Silk & Satin', path: '/products?category=silk' },
    { label: 'Linen', path: '/products?category=linen' },
    { label: 'Printed', path: '/products?category=printed' },
  ];

  return (
    <>
      {/* Scroll progress bar */}
      <div
        className="fixed top-0 left-0 z-[60] h-0.5 bg-gradient-to-r from-rose-primary via-rose-light to-rose-primary transition-all duration-150"
        style={{ width: `${scrollProgress}%` }}
      />

      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white/92 backdrop-blur-xl shadow-[0_1px_0_rgba(27,67,50,0.08),0_8px_24px_rgba(27,67,50,0.06)]'
          : 'bg-cream/80 backdrop-blur-md'
      }`}>

        {/* Announcement bar */}
        <div className={`bg-rose-primary text-white text-center py-2 text-[0.72rem] font-sans tracking-[0.18em] uppercase transition-all duration-300 overflow-hidden ${
          scrolled ? 'max-h-0 py-0 opacity-0' : 'max-h-8 opacity-100'
        }`}>
          Free delivery on orders above ₹999 · Use code <span className="text-blush font-semibold">SLEEP10</span> for 10% off
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[60px]">

            {/* Logo */}
            <Link to="/" className="group flex-shrink-0 flex items-center gap-2.5">
              <img
                src="/logo.svg"
                alt="Torts & Twirls"
                className="w-11 h-11 object-contain"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <span className="font-display text-[1.6rem] text-deep-brown tracking-wide transition-all duration-300 group-hover:text-warm-gray" style={{ fontStyle: 'italic', fontWeight: 400 }}>
                Torts <span className="text-accent-gold">&</span> Twirls
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-[0.83rem] font-sans tracking-wide transition-colors duration-200 relative group link-underline ${
                    location.pathname === '/products' && location.search.includes(link.path.split('?')[1])
                      ? 'text-rose-primary font-medium'
                      : 'text-warm-gray hover:text-deep-brown'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right icons */}
            <div className="flex items-center gap-1 sm:gap-2">

              {/* Search button */}
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2.5 text-warm-gray hover:text-rose-primary hover:bg-rose-mist/50 rounded-xl transition-all duration-200"
                aria-label="Search"
              >
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* Wishlist */}
              <Link to="/wishlist" className="relative p-2.5 text-warm-gray hover:text-rose-primary hover:bg-rose-mist/50 rounded-xl transition-all duration-200">
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {wishlist.length > 0 && (
                  <span className="absolute top-1 right-1 bg-rose-primary text-white text-[0.6rem] font-sans font-bold w-4 h-4 rounded-full flex items-center justify-center badge-pop">
                    {wishlist.length > 9 ? '9+' : wishlist.length}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link to="/cart" className="relative p-2.5 text-warm-gray hover:text-rose-primary hover:bg-rose-mist/50 rounded-xl transition-all duration-200">
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 bg-rose-primary text-white text-[0.6rem] font-sans font-bold w-4 h-4 rounded-full flex items-center justify-center badge-pop">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>

              {/* User menu */}
              {isAuthenticated ? (
                <div className="relative ml-1" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-rose-mist/50 transition-all duration-200 group"
                  >
                    <div className="w-7 h-7 bg-gradient-to-br from-rose-primary to-chocolate rounded-full flex items-center justify-center text-white text-[0.72rem] font-semibold flex-shrink-0 shadow-sm">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <svg className={`w-3.5 h-3.5 text-taupe transition-transform duration-200 hidden sm:block ${userMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown */}
                  <div className={`absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-lifted border border-sand/40 overflow-hidden transition-all duration-300 origin-top-right ${
                    userMenuOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                  }`}>
                    <div className="px-4 py-3.5 bg-gradient-to-br from-cream to-light-beige border-b border-sand/50">
                      <p className="text-sm font-sans font-semibold text-deep-brown">{user?.name}</p>
                      <p className="text-xs text-taupe truncate font-sans mt-0.5">{user?.email}</p>
                    </div>
                    {[
                      { label: 'My Profile', path: '/profile', icon: '👤' },
                      { label: 'My Orders', path: '/orders', icon: '📦' },
                      { label: 'Wishlist', path: '/wishlist', icon: '🤍' },
                    ].map(item => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm font-sans text-warm-gray hover:text-deep-brown hover:bg-cream transition-colors duration-150"
                      >
                        <span>{item.icon}</span> {item.label}
                      </Link>
                    ))}
                    {user?.role === 'admin' && (
                      <Link to="/admin" className="flex items-center gap-2 px-4 py-2.5 text-sm font-sans text-rose-primary hover:bg-rose-mist/30 transition-colors duration-150 border-t border-sand/50">
                        <span>⚙️</span> Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-sm font-sans text-rose-500 hover:bg-rose-50 transition-colors duration-150 border-t border-sand/50"
                    >
                      → Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="hidden sm:flex items-center gap-1.5 text-[0.8rem] font-sans text-rose-primary border border-rose-primary/30 px-4 py-2 rounded-xl hover:bg-rose-primary hover:text-white hover:border-rose-primary transition-all duration-300 ml-1"
                >
                  Login
                </Link>
              )}

              {/* Mobile menu hamburger */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="lg:hidden p-2.5 text-warm-gray hover:text-deep-brown hover:bg-rose-mist/50 rounded-xl transition-all duration-200 ml-1"
                aria-label="Toggle menu"
              >
                <div className="w-5 h-4 flex flex-col justify-between">
                  <span className={`block h-0.5 bg-current rounded-full transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-[7.5px]' : ''}`} />
                  <span className={`block h-0.5 bg-current rounded-full transition-all duration-300 ${menuOpen ? 'opacity-0 scale-x-0' : ''}`} />
                  <span className={`block h-0.5 bg-current rounded-full transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-[7.5px]' : ''}`} />
                </div>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-all duration-400 ${menuOpen ? 'visible' : 'invisible'}`}
        onClick={() => setMenuOpen(false)}
      >
        <div className={`absolute inset-0 bg-charcoal/40 backdrop-blur-sm transition-opacity duration-400 ${menuOpen ? 'opacity-100' : 'opacity-0'}`} />
      </div>

      {/* Mobile menu panel */}
      <div className={`fixed top-0 right-0 bottom-0 w-[80vw] max-w-[340px] z-50 lg:hidden bg-white shadow-lifted flex flex-col transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-sand/60">
          <span className="font-display text-xl text-deep-brown italic font-normal">Torts <span className="text-accent-gold">&</span> Twirls</span>
          <button onClick={() => setMenuOpen(false)} className="text-taupe hover:text-deep-brown transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          {navLinks.map((link, i) => (
            <Link
              key={link.path}
              to={link.path}
              className="block px-6 py-3.5 text-[0.9rem] font-sans text-warm-gray hover:text-rose-primary hover:bg-rose-mist/30 transition-colors border-b border-sand/30"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              {link.label}
            </Link>
          ))}

          {/* Mobile-only links */}
          {isAuthenticated && (
            <div className="mt-4 pt-4 border-t border-sand/60">
              <Link to="/profile" className="block px-6 py-3 text-[0.9rem] font-sans text-warm-gray hover:text-rose-primary hover:bg-rose-mist/30 transition-colors">
                👤 My Profile
              </Link>
              <Link to="/orders" className="block px-6 py-3 text-[0.9rem] font-sans text-warm-gray hover:text-rose-primary hover:bg-rose-mist/30 transition-colors">
                📦 My Orders
              </Link>
              <Link to="/wishlist" className="block px-6 py-3 text-[0.9rem] font-sans text-warm-gray hover:text-rose-primary hover:bg-rose-mist/30 transition-colors">
                🤍 Wishlist
              </Link>
              {user?.role === 'admin' && (
                <Link to="/admin" className="block px-6 py-3 text-[0.9rem] font-sans text-rose-primary hover:bg-rose-mist/30 transition-colors">
                  ⚙️ Admin Panel
                </Link>
              )}
            </div>
          )}
        </div>

        <div className="p-5 border-t border-sand/60">
          {isAuthenticated ? (
            <button onClick={handleLogout} className="w-full btn-outline py-2.5 text-sm text-center">
              Sign Out
            </button>
          ) : (
            <div className="flex gap-3">
              <Link to="/login" className="flex-1 btn-outline py-2.5 text-sm text-center">Login</Link>
              <Link to="/register" className="flex-1 btn-primary py-2.5 text-sm text-center">Register</Link>
            </div>
          )}
        </div>
      </div>

      {/* Search overlay */}
      <div className={`fixed inset-0 z-[70] flex items-start justify-center pt-28 px-4 transition-all duration-300 ${searchOpen ? 'visible' : 'invisible'}`}>
        <div
          className={`absolute inset-0 bg-charcoal/50 backdrop-blur-md transition-opacity duration-300 ${searchOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setSearchOpen(false)}
        />
        <div className={`relative bg-white rounded-2xl shadow-lifted w-full max-w-2xl p-6 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${searchOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-4'}`}>
          <form onSubmit={handleSearch} className="flex items-center gap-4 mb-5">
            <svg className="w-5 h-5 text-taupe flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={searchRef}
              type="text"
              placeholder="Search bedsheets, pillow covers, duvet..."
              className="flex-1 outline-none text-deep-brown font-sans text-lg placeholder-taupe bg-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="button" onClick={() => setSearchOpen(false)} className="text-taupe hover:text-deep-brown transition-colors p-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </form>

          <div className="border-t border-sand/50 pt-4">
            <p className="text-[0.7rem] font-sans uppercase tracking-widest text-taupe mb-3">Popular searches</p>
            <div className="flex flex-wrap gap-2">
              {['Cotton Sheets', 'King Size', 'Fitted Sheets', 'Linen', 'Silk', 'Duvet Covers', 'Pillow Covers'].map(tag => (
                <button
                  key={tag}
                  onClick={() => { setSearchQuery(tag); navigate(`/products?search=${encodeURIComponent(tag)}`); setSearchOpen(false); }}
                  className="text-xs px-3.5 py-2 bg-rose-mist/50 text-warm-gray rounded-full hover:bg-rose-primary hover:text-white transition-colors font-sans border border-sand/50"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
