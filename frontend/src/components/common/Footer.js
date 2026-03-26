import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    toast.success('You\'re subscribed! Exclusive offers await!');
    setEmail('');
  };

  return (
    <footer className="relative overflow-hidden" style={{ background: 'linear-gradient(165deg, #0D1F0C 0%, #1B4332 50%, #1B4332 100%)' }}>
      {/* Decorative grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="absolute bg-cream w-px top-0 bottom-0" style={{ left: `${(i + 1) * 9.09}%` }} />
        ))}
      </div>

      {/* Blob accents */}
      <div className="absolute -top-32 -right-32 w-80 h-80 bg-rose-primary/10 rounded-full blur-3xl blob pointer-events-none" />
      <div className="absolute bottom-0 -left-20 w-60 h-60 bg-taupe/10 rounded-full blur-3xl blob-delay pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top CTA strip */}
        <div className="border-b border-cream/10 py-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left">
              <p className="text-[0.7rem] font-sans uppercase tracking-[0.25em] text-rose-light mb-2">Join the comfort circle</p>
              <h3 className="font-display text-[1.8rem] sm:text-[2rem] text-cream leading-tight">
                Sleep Better.<br />
                <em className="italic gold-text">Live Better.</em>
              </h3>
            </div>
            {subscribed ? (
              <div className="flex items-center gap-3 bg-white/10 rounded-2xl px-6 py-4 border border-white/10">
                <span className="text-2xl">🛏️</span>
                <div>
                  <p className="text-sm font-sans font-medium text-cream">You're subscribed!</p>
                  <p className="text-xs font-sans text-cream/50">Watch your inbox for exclusive offers.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2 w-full max-w-sm">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 bg-white/10 border border-white/15 rounded-xl px-4 py-3 text-sm text-cream placeholder-cream/35 outline-none focus:border-rose-primary/50 focus:bg-white/15 transition-all font-sans"
                />
                <button type="submit" className="btn-primary px-5 py-3 text-xs whitespace-nowrap">
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 py-12 sm:py-16">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <img src="/logo.svg" alt="T&T" className="w-10 h-10 object-contain brightness-[1.4]" onError={e => { e.target.style.display = 'none'; }} />
              <span className="font-display text-2xl text-cream italic font-normal tracking-wide">
                Torts <span className="text-accent-gold">&</span> Twirls
              </span>
            </Link>
            <p className="mt-4 text-sm font-sans text-cream/50 leading-relaxed">
              Premium bedsheets & home linen crafted for the finest sleep. Where comfort meets elegance.
            </p>
            <div className="flex gap-3 mt-6">
              {[
                { label: 'Instagram', char: 'ig' },
                { label: 'Pinterest', char: 'pt' },
                { label: 'Facebook', char: 'fb' },
              ].map(s => (
                <a
                  key={s.label}
                  href="#"
                  aria-label={s.label}
                  className="w-9 h-9 rounded-xl border border-cream/15 flex items-center justify-center text-cream/40 hover:border-rose-primary/50 hover:text-rose-light transition-all duration-300 text-[0.65rem] font-sans font-medium uppercase tracking-wide"
                >
                  {s.char}
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-sans font-semibold text-cream text-[0.7rem] tracking-[0.2em] uppercase mb-5">Shop</h4>
            <ul className="space-y-3">
              {[
                { label: 'All Products', path: '/products' },
                { label: 'Cotton Sheets', path: '/products?category=cotton' },
                { label: 'Silk & Satin', path: '/products?category=silk' },
                { label: 'Linen', path: '/products?category=linen' },
                { label: 'Printed Designs', path: '/products?category=printed' },
                { label: 'Duvet Covers', path: '/products?category=duvet' },
              ].map(item => (
                <li key={item.label}>
                  <Link to={item.path} className="text-[0.83rem] font-sans text-cream/50 hover:text-cream transition-colors duration-200 link-underline">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="font-sans font-semibold text-cream text-[0.7rem] tracking-[0.2em] uppercase mb-5">Help</h4>
            <ul className="space-y-3">
              {[
                { label: 'Track My Order', path: '/orders' },
                { label: 'Return Policy', path: '#' },
                { label: 'Delivery Info', path: '#' },
                { label: 'Size Guide', path: '#' },
                { label: 'Care Instructions', path: '#' },
                { label: 'Contact Us', path: '#' },
              ].map(item => (
                <li key={item.label}>
                  <Link to={item.path} className="text-[0.83rem] font-sans text-cream/50 hover:text-cream transition-colors duration-200 link-underline">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Trust */}
          <div>
            <h4 className="font-sans font-semibold text-cream text-[0.7rem] tracking-[0.2em] uppercase mb-5">Why Us</h4>
            <ul className="space-y-4">
              {[
                { icon: '🧵', text: 'Premium long-staple cotton' },
                { icon: '🚚', text: 'Free delivery above ₹999' },
                { icon: '↩️', text: 'Easy returns & refunds' },
                { icon: '🔒', text: 'Secure Razorpay checkout' },
                { icon: '🌿', text: 'OEKO-TEX certified fabrics' },
              ].map(item => (
                <li key={item.text} className="flex items-start gap-2.5">
                  <span className="text-base leading-none mt-0.5">{item.icon}</span>
                  <span className="text-[0.8rem] font-sans text-cream/50 leading-snug">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-cream/10 py-7 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[0.72rem] font-sans text-cream/30">
            © {new Date().getFullYear()} Torts & Twirls. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            {['Privacy Policy', 'Terms of Service', 'Sitemap'].map(item => (
              <a key={item} href="#" className="text-[0.72rem] font-sans text-cream/30 hover:text-cream/60 transition-colors">
                {item}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[0.7rem] font-sans text-cream/30">Secured by</span>
            <span className="text-[0.7rem] font-sans font-semibold text-rose-light/70">Razorpay</span>
            <span className="text-cream/20 mx-1">·</span>
            <span className="text-[0.7rem] font-sans font-semibold text-rose-light/70">SSL</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
