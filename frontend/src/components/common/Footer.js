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
    toast.success('You\'re subscribed! Welcome to the circle. 💛');
    setEmail('');
  };

  return (
    <footer className="relative overflow-hidden" style={{ background: 'linear-gradient(165deg, #2C2420 0%, #3A2C22 50%, #4A3728 100%)' }}>
      {/* Decorative grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="absolute bg-cream w-px top-0 bottom-0" style={{ left: `${(i + 1) * 9.09}%` }} />
        ))}
      </div>

      {/* Blob accents */}
      <div className="absolute -top-32 -right-32 w-80 h-80 bg-gold/8 rounded-full blur-3xl blob pointer-events-none" />
      <div className="absolute bottom-0 -left-20 w-60 h-60 bg-taupe/10 rounded-full blur-3xl blob-delay pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top CTA strip */}
        <div className="border-b border-cream/10 py-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div>
              <p className="text-[0.7rem] font-sans uppercase tracking-[0.25em] text-gold mb-2">Join the inner circle</p>
              <h3 className="font-display text-[2rem] text-cream leading-tight">
                Sleep Better.<br />
                <em className="italic gold-text">Live Better.</em>
              </h3>
            </div>
            {subscribed ? (
              <div className="flex items-center gap-3 bg-white/10 rounded-2xl px-6 py-4 border border-white/10">
                <span className="text-2xl">💛</span>
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
                  className="flex-1 bg-white/10 border border-white/15 rounded-xl px-4 py-3 text-sm text-cream placeholder-cream/35 outline-none focus:border-gold/50 focus:bg-white/15 transition-all font-sans"
                />
                <button type="submit" className="btn-gold px-5 py-3 text-xs whitespace-nowrap">
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 py-16">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/">
              <span className="font-display text-2xl text-cream italic font-normal tracking-wide">
                Torts <span className="text-gold">&</span> Twirls
              </span>
            </Link>
            <p className="mt-4 text-sm font-sans text-cream/50 leading-relaxed">
              Crafting the finest bedsheets for your most restful sleep. Every thread, every night.
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
                  className="w-9 h-9 rounded-xl border border-cream/15 flex items-center justify-center text-cream/40 hover:border-gold/50 hover:text-gold transition-all duration-300 text-[0.65rem] font-sans font-medium uppercase tracking-wide"
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
                { label: 'Cotton Collection', path: '/products?category=cotton' },
                { label: 'Silk & Luxury', path: '/products?category=silk' },
                { label: 'Linen Bedsheets', path: '/products?category=linen' },
                { label: 'Printed Designs', path: '/products?category=printed' },
                { label: 'Embroidered', path: '/products?category=embroidered' },
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
                { label: 'Shipping Info', path: '#' },
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
                { icon: '🌿', text: 'GOTS certified organic cotton' },
                { icon: '🚚', text: 'Free shipping above ₹999' },
                { icon: '↩️', text: '15-day hassle-free returns' },
                { icon: '🔒', text: 'Secure Razorpay checkout' },
                { icon: '🪡', text: 'Artisan crafted collections' },
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
            <span className="text-[0.7rem] font-sans font-semibold text-gold/70">Razorpay</span>
            <span className="text-cream/20 mx-1">·</span>
            <span className="text-[0.7rem] font-sans font-semibold text-gold/70">SSL</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
