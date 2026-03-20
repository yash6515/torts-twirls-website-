import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getFeaturedProducts } from '../utils/api';
import ProductCard from '../components/product/ProductCard';
import { ProductGridSkeleton } from '../components/product/ProductSkeleton';
import useCounter from '../hooks/useCounter';

/* ─── Scroll Reveal Hook (inline for self-containment) ─── */
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.querySelectorAll('.reveal-on-scroll').forEach(el => el.classList.add('revealed'));
          e.target.classList.add('revealed');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    io.observe(el);
    const children = el.querySelectorAll('.reveal-on-scroll');
    children.forEach(c => io.observe(c));
    return () => io.disconnect();
  }, []);
  return ref;
}

/* ─── Animated Counter ─── */
function AnimCounter({ end, suffix = '' }) {
  const { count, ref } = useCounter(end, 1800);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

/* ─── Star Rating ─── */
const Stars = ({ n = 5 }) => (
  <span className="flex gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <svg key={i} className={`w-3.5 h-3.5 ${i < n ? 'text-amber-400' : 'text-sand'}`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </span>
);

const categories = [
  { label: 'Cotton', slug: 'cotton', desc: 'Breathable & classic', emoji: '🌿', bg: 'bg-sage/20', accent: '#B8C9B5' },
  { label: 'Silk', slug: 'silk', desc: 'Luxurious & smooth', emoji: '✨', bg: 'bg-rose-mist/40', accent: '#E8D5D0' },
  { label: 'Linen', slug: 'linen', desc: 'Natural & relaxed', emoji: '🌾', bg: 'bg-sand/40', accent: '#E8DDD0' },
  { label: 'Printed', slug: 'printed', desc: 'Bold & expressive', emoji: '🎨', bg: 'bg-blush/50', accent: '#F2E4DC' },
  { label: 'Microfiber', slug: 'microfiber', desc: 'Soft & affordable', emoji: '☁️', bg: 'bg-taupe/15', accent: '#C4B5A0' },
  { label: 'Embroidered', slug: 'embroidered', desc: 'Artisan crafted', emoji: '🪡', bg: 'bg-gold-light/30', accent: '#E8D5A8' },
];

const testimonials = [
  { name: 'Priya Sharma', city: 'Mumbai', rating: 5, text: 'The Ivory Whisper Cotton Set transformed my bedroom completely. Softer than anything I have ever owned.', avatar: 'P' },
  { name: 'Arjun Mehta', city: 'Delhi', rating: 5, text: 'Finally found bedsheets that look as magnificent as they feel. The packaging is a gift in itself.', avatar: 'A' },
  { name: 'Kavya Reddy', city: 'Bangalore', rating: 5, text: 'Gifted the Pearl Embroidered set — the craftsmanship is extraordinary. Worth every rupee.', avatar: 'K' },
  { name: 'Rohit Jain', city: 'Pune', rating: 4, text: 'The Sage Linen set is perfect — gets softer every wash. Premium quality at a fair price.', avatar: 'R' },
];

const marqueeItems = [
  '✦ Free shipping above ₹999',
  '✦ 15-Day hassle-free returns',
  '✦ GOTS Certified organic cotton',
  '✦ 400-Thread-count luxury',
  '✦ Sustainably sourced',
  '✦ Artisan embroidered collections',
  '✦ New arrivals every month',
];

const HomePage = () => {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroLoaded, setHeroLoaded] = useState(false);
  const navigate = useNavigate();

  const catRef = useReveal();
  const featRef = useReveal();
  const testimonialRef = useReveal();
  const bannerRef = useReveal();
  const statsRef = useReveal();

  useEffect(() => {
    const timer = setTimeout(() => setHeroLoaded(true), 100);
    getFeaturedProducts()
      .then(res => setFeatured(res.data.products))
      .catch(console.error)
      .finally(() => setLoading(false));
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="pt-[72px]">

      {/* ──────── HERO ──────── */}
      <section className="hero-gradient min-h-[92vh] flex items-center relative overflow-hidden">
        {/* Animated blobs */}
        <div className="absolute top-10 right-[5%] w-[500px] h-[500px] bg-blush rounded-full mix-blend-multiply filter blur-[80px] opacity-50 blob pointer-events-none" />
        <div className="absolute bottom-0 left-[10%] w-[400px] h-[400px] bg-sage/25 rounded-full mix-blend-multiply filter blur-[70px] opacity-60 blob-delay pointer-events-none" />
        <div className="absolute top-[30%] left-[40%] w-[300px] h-[300px] bg-gold-light/20 rounded-full mix-blend-multiply filter blur-[60px] opacity-40 blob pointer-events-none" style={{ animationDelay: '6s' }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left — Text */}
            <div>
              <div className={`transition-all duration-700 delay-100 ${heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                <span className="inline-flex items-center gap-2 text-xs font-sans tracking-[0.18em] uppercase text-taupe border border-taupe/30 px-4 py-2 rounded-full backdrop-blur-sm bg-white/40 mb-8">
                  <span className="w-1.5 h-1.5 rounded-full bg-sage animate-pulse-soft inline-block" />
                  New Collection · 2025
                </span>
              </div>

              <div className={`transition-all duration-700 delay-200 ${heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <h1 className="font-display leading-[1.06] text-deep-brown mb-6" style={{ fontSize: 'clamp(3.2rem, 7vw, 5.5rem)' }}>
                  Crafted for Your
                  <br />
                  <em className="italic gold-text">Finest Sleep</em>
                </h1>
              </div>

              <div className={`transition-all duration-700 delay-300 ${heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                <p className="font-sans text-warm-gray text-[1.0625rem] leading-[1.75] mb-10 max-w-[440px]">
                  From hand-embroidered Egyptian cotton to cloud-soft microfiber — every thread in our collection is chosen to make your bedroom a sanctuary.
                </p>
              </div>

              <div className={`flex flex-wrap gap-4 mb-14 transition-all duration-700 delay-[400ms] ${heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                <button onClick={() => navigate('/products')} className="btn-primary group text-[0.9rem] px-8 py-4">
                  Explore Collection
                  <svg className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
                <button onClick={() => navigate('/products?category=silk')} className="btn-outline text-[0.9rem] px-8 py-4">
                  Luxury Silk →
                </button>
              </div>

              {/* Stats */}
              <div ref={statsRef} className="flex items-center gap-8">
                {[
                  { label: 'Happy Homes', end: 2500, suffix: '+' },
                  { label: 'Avg Rating', end: 4.8, suffix: '★' },
                  { label: 'Collections', end: 8, suffix: '' },
                ].map((s, i) => (
                  <React.Fragment key={s.label}>
                    {i > 0 && <div className="w-px h-12 bg-sand" />}
                    <div>
                      <p className="font-display text-3xl text-deep-brown leading-none">
                        <AnimCounter end={s.end} suffix={s.suffix} />
                      </p>
                      <p className="text-[0.72rem] font-sans text-taupe uppercase tracking-[0.14em] mt-1">{s.label}</p>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Right — Images */}
            <div className={`relative hidden lg:block transition-all duration-1000 delay-500 ${heroLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
              {/* Main image */}
              <div className="relative ml-auto w-[340px] h-[420px] rounded-[2rem] overflow-hidden shadow-lifted">
                <img
                  src="https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800"
                  alt="Premium bedsheet"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-deep-brown/20 to-transparent" />
              </div>

              {/* Second image - overlapping */}
              <div className="absolute top-[10%] -left-[5%] w-[200px] h-[250px] rounded-[1.5rem] overflow-hidden shadow-card border-4 border-cream animate-float">
                <img
                  src="https://images.unsplash.com/photo-1617325247661-675ab4b64ae2?w=500"
                  alt="Bedsheet close up"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Floating review badge */}
              <div className="absolute -bottom-4 left-[5%] bg-white rounded-2xl shadow-card p-4 w-[200px] animate-float" style={{ animationDelay: '2s' }}>
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-9 h-9 rounded-full bg-deep-brown text-cream flex items-center justify-center text-sm font-medium flex-shrink-0">P</div>
                  <div>
                    <p className="text-xs font-sans font-medium text-deep-brown leading-tight">Priya S.</p>
                    <Stars n={5} />
                  </div>
                </div>
                <p className="text-[0.7rem] font-sans text-warm-gray italic leading-relaxed">"Absolutely cloud-like softness!"</p>
              </div>

              {/* New arrival badge */}
              <div className="absolute top-[15%] right-0 translate-x-1/3 bg-gold text-white rounded-full w-16 h-16 flex items-center justify-center text-center badge-pop shadow-glow" style={{ animationDelay: '0.8s' }}>
                <div>
                  <p className="text-[0.5rem] font-sans uppercase tracking-wider leading-tight">New</p>
                  <p className="text-[0.6rem] font-sans font-bold leading-tight">Arrival</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
          <span className="text-[0.65rem] font-sans uppercase tracking-[0.2em] text-taupe">Scroll</span>
          <div className="w-px h-10 bg-gradient-to-b from-taupe to-transparent animate-pulse-soft" />
        </div>
      </section>

      {/* ──────── MARQUEE STRIP ──────── */}
      <section className="bg-deep-brown py-4 overflow-hidden">
        <div className="marquee-track">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i} className="font-sans text-cream/80 text-sm tracking-wide whitespace-nowrap px-10">{item}</span>
          ))}
        </div>
      </section>

      {/* ──────── FEATURES STRIP ──────── */}
      <section className="bg-white border-b border-sand/60 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: '🚚', title: 'Free Shipping', desc: 'Orders above ₹999' },
              { icon: '↩️', title: '15-Day Returns', desc: 'No questions asked' },
              { icon: '🔒', title: 'Secure Checkout', desc: 'Razorpay encrypted' },
              { icon: '🌿', title: 'Eco Certified', desc: 'GOTS & OEKO-TEX' },
            ].map((f, i) => (
              <div
                key={f.title}
                className="flex items-center gap-3.5 group"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="w-11 h-11 rounded-xl bg-cream flex items-center justify-center text-xl flex-shrink-0 group-hover:bg-sand transition-colors duration-300">
                  {f.icon}
                </div>
                <div>
                  <p className="text-sm font-sans font-medium text-deep-brown">{f.title}</p>
                  <p className="text-xs font-sans text-taupe">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────── CATEGORIES ──────── */}
      <section className="py-24 bg-cream overflow-hidden" ref={catRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 reveal-on-scroll">
            <p className="text-xs font-sans uppercase tracking-[0.22em] text-gold mb-3">Curated for you</p>
            <h2 className="font-display text-[2.8rem] text-deep-brown">Shop by Category</h2>
            <div className="divider-gold max-w-[200px] mx-auto mt-4">
              <span className="text-gold text-lg">✦</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat, i) => (
              <Link
                key={cat.slug}
                to={`/products?category=${cat.slug}`}
                className={`${cat.bg} category-card rounded-2xl p-5 text-center block reveal-on-scroll delay-${i + 1} relative overflow-hidden group`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="text-3xl block mb-3 relative z-10 transition-transform duration-400 group-hover:scale-125 group-hover:-rotate-6">{cat.emoji}</span>
                <p className="font-sans font-semibold text-deep-brown text-sm relative z-10">{cat.label}</p>
                <p className="font-sans text-warm-gray text-xs mt-1 relative z-10">{cat.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ──────── FEATURED PRODUCTS ──────── */}
      <section className="py-24 bg-light-beige overflow-hidden" ref={featRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-14 reveal-on-scroll">
            <div>
              <p className="text-xs font-sans uppercase tracking-[0.22em] text-gold mb-3">Handpicked</p>
              <h2 className="font-display text-[2.8rem] text-deep-brown leading-tight">
                Featured<br />Collection
              </h2>
            </div>
            <Link to="/products" className="hidden sm:flex items-center gap-2 text-sm font-sans text-warm-gray hover:text-deep-brown transition-colors group link-underline">
              View all products
              <svg className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {loading ? (
            <ProductGridSkeleton count={4} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.slice(0, 4).map((product, i) => (
                <div key={product._id} className={`reveal-on-scroll delay-${i + 1}`}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-10 sm:hidden reveal-on-scroll">
            <Link to="/products" className="btn-outline">View All Products</Link>
          </div>
        </div>
      </section>

      {/* ──────── LIFESTYLE BANNER ──────── */}
      <section className="py-24 bg-cream" ref={bannerRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden reveal-on-scroll" style={{ minHeight: '480px' }}>
            {/* Background image */}
            <img
              src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1600"
              alt="Bedroom lifestyle"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-charcoal/90 via-deep-brown/70 to-transparent" />

            <div className="relative z-10 p-12 md:p-20 max-w-xl flex flex-col justify-center h-full" style={{ minHeight: '480px' }}>
              <span className="text-xs font-sans tracking-[0.2em] uppercase text-gold mb-5 block">Limited Time</span>
              <h2 className="font-display text-[3rem] md:text-[3.5rem] text-cream mb-5 leading-[1.1]">
                Your Bedroom,
                <br />
                <em className="italic">Reimagined.</em>
              </h2>
              <p className="font-sans text-cream/70 mb-8 leading-relaxed text-[0.95rem]">
                Use code{' '}
                <span className="font-mono font-semibold text-gold bg-white/10 px-2.5 py-1 rounded-lg tracking-wider">FIRST10</span>
                {' '}for 10% off your first order.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/products" className="btn-gold">Shop Now</Link>
                <Link to="/products?category=luxury" className="btn-outline border-cream/50 text-cream hover:bg-cream/10 hover:text-cream">
                  Luxury Range
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────── TESTIMONIALS ──────── */}
      <section className="py-24 overflow-hidden" style={{ background: 'linear-gradient(135deg, #F5F0E8 0%, #FAF7F2 50%, #F2E4DC 100%)' }} ref={testimonialRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 reveal-on-scroll">
            <p className="text-xs font-sans uppercase tracking-[0.22em] text-gold mb-3">Social proof</p>
            <h2 className="font-display text-[2.8rem] text-deep-brown">Loved by Thousands</h2>
            <div className="divider-gold max-w-[200px] mx-auto mt-4">
              <span className="text-gold text-lg">✦</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className={`bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-card reveal-on-scroll delay-${i + 1} hover:shadow-card-hover transition-all duration-400 hover:-translate-y-2 relative overflow-hidden group`}
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold via-gold-light to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
                <Stars n={t.rating} />
                <p className="font-sans text-warm-gray text-sm leading-[1.7] mt-3 mb-5 italic">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3 mt-auto">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sand to-taupe flex items-center justify-center text-deep-brown font-semibold text-sm font-sans flex-shrink-0">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-sans font-medium text-deep-brown text-sm">{t.name}</p>
                    <p className="font-sans text-taupe text-xs">{t.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────── QUALITY PROMISE ──────── */}
      <section className="py-20 bg-deep-brown relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="absolute w-px bg-cream" style={{ left: `${i * 5.3}%`, top: 0, bottom: 0, opacity: 0.4 }} />
          ))}
        </div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <span className="text-xs font-sans uppercase tracking-[0.25em] text-gold mb-4 block">Our Promise</span>
          <h2 className="font-display text-[2.5rem] md:text-[3.5rem] text-cream mb-6 leading-tight">
            Every Thread.
            <br />
            <em className="italic gold-text">Every Night.</em>
          </h2>
          <p className="font-sans text-cream/60 text-[1rem] leading-relaxed mb-10 max-w-xl mx-auto">
            We source only from certified mills, using natural dyes and sustainable practices. Sleep well knowing your purchase does good.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/products" className="btn-gold">Shop the Collection</Link>
            <Link to="/register" className="btn-outline border-cream/40 text-cream hover:bg-cream/10 hover:text-cream">
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* ──────── NEWSLETTER ──────── */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blush rounded-full blur-3xl opacity-40" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-sage/20 rounded-full blur-3xl opacity-50" />
        <div className="max-w-xl mx-auto px-4 text-center relative z-10">
          <span className="text-3xl block mb-5">💌</span>
          <h2 className="font-display text-[2.2rem] text-deep-brown mb-3">Join the Inner Circle</h2>
          <p className="font-sans text-warm-gray mb-8 text-sm leading-relaxed">Get exclusive access to new arrivals, member-only discounts, and sleep tips from our linen experts.</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="your@email.com"
              className="input-luxury flex-1 text-sm"
            />
            <button className="btn-primary whitespace-nowrap">
              Subscribe →
            </button>
          </div>
          <p className="text-xs text-taupe mt-3 font-sans">No spam. Unsubscribe anytime. 💛</p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
