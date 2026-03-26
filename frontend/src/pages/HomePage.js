import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getFeaturedProducts } from '../utils/api';
import ProductCard from '../components/product/ProductCard';
import { ProductGridSkeleton } from '../components/product/ProductSkeleton';
import useCounter from '../hooks/useCounter';

/* ─── Scroll Reveal ─── */
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.querySelectorAll('.reveal-on-scroll').forEach(c => c.classList.add('revealed'));
          e.target.classList.add('revealed');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    io.observe(el);
    el.querySelectorAll('.reveal-on-scroll').forEach(c => io.observe(c));
    return () => io.disconnect();
  }, []);
  return ref;
}

/* ─── Parallax hook ─── */
function useParallax(speed = 0.15) {
  const ref = useRef(null);
  useEffect(() => {
    let ticking = false;
    const handler = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (ref.current) {
            const rect = ref.current.getBoundingClientRect();
            const offset = rect.top * speed;
            ref.current.style.transform = `translateY(${offset}px)`;
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, [speed]);
  return ref;
}

/* ─── Counter ─── */
function AnimCounter({ end, suffix = '' }) {
  const { count, ref } = useCounter(end, 1800);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

/* ─── Stars ─── */
const Stars = ({ n = 5 }) => (
  <span className="flex gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <svg key={i} className={`w-3.5 h-3.5 ${i < n ? 'text-amber-400' : 'text-sand'}`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </span>
);

/* ─── SVG Icons ─── */
const IconTruck = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
  </svg>
);
const IconSparkle = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
  </svg>
);
const IconShield = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
  </svg>
);
const IconReturn = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
);
const IconSun = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
  </svg>
);

/* ─── Category Card ─── */
const CategoryCard = ({ cat }) => {
  const [imgFailed, setImgFailed] = useState(false);
  return (
    <Link
      to={`/products?category=${cat.slug}`}
      className="tilt-card group relative overflow-hidden rounded-2xl block"
      style={{ aspectRatio: '2/3' }}
    >
      <div className="absolute inset-0" style={{ background: cat.fallback }} />
      {!imgFailed && (
        <img
          src={cat.image}
          alt={cat.label}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={() => setImgFailed(true)}
          loading="lazy"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/30 to-charcoal/5 group-hover:from-charcoal/95 transition-all duration-500" />
      {cat.tag && (
        <div className="absolute top-3 left-3 z-10">
          <span className="text-[0.6rem] font-sans uppercase tracking-widest bg-white/90 backdrop-blur-sm text-deep-brown px-2.5 py-1 rounded-full shadow-sm">
            {cat.tag}
          </span>
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 z-10">
        <p className="font-display text-lg sm:text-xl text-white leading-tight">{cat.label}</p>
        <p className="text-white/50 text-[0.65rem] font-sans mt-0.5">{cat.desc}</p>
        <div className="flex items-center gap-1.5 mt-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          <span className="text-[0.65rem] font-sans text-sage">Shop Now</span>
          <svg className="w-3 h-3 text-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </div>
    </Link>
  );
};

/* ─── Data ─── */
const categories = [
  { label: 'Cotton', slug: 'cotton', desc: '200–1000 thread count', tag: 'Bestseller',
    image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&auto=format&fit=crop&q=80',
    fallback: 'linear-gradient(160deg, #2D4A2A 0%, #0D1F0C 100%)' },
  { label: 'Linen', slug: 'linen', desc: 'Breathable & natural', tag: 'Eco Choice',
    image: 'https://images.unsplash.com/photo-1629140727571-9b5c6f6267b4?w=600&auto=format&fit=crop&q=80',
    fallback: 'linear-gradient(160deg, #6B5A3E 0%, #3A2D1A 100%)' },
  { label: 'Silk & Satin', slug: 'silk', desc: 'Smooth & lustrous', tag: 'Luxury',
    image: 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=600&auto=format&fit=crop&q=80',
    fallback: 'linear-gradient(160deg, #4A3A2A 0%, #1A1010 100%)' },
  { label: 'Printed', slug: 'printed', desc: 'Vibrant patterns', tag: 'Trending',
    image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=600&auto=format&fit=crop&q=80',
    fallback: 'linear-gradient(160deg, #92400E 0%, #451A03 100%)' },
  { label: 'Fitted Sheets', slug: 'fitted', desc: 'Perfect snug fit', tag: null,
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&auto=format&fit=crop&q=80',
    fallback: 'linear-gradient(160deg, #1B4332 0%, #0D1F0C 100%)' },
  { label: 'Duvet Covers', slug: 'duvet', desc: 'Cozy & layered', tag: 'New',
    image: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=600&auto=format&fit=crop&q=80',
    fallback: 'linear-gradient(160deg, #1E3A5F 0%, #0C1A2E 100%)' },
];

const testimonials = [
  { name: 'Priya Sharma', city: 'Mumbai', rating: 5, text: 'The 400 TC cotton sheets are incredibly soft. Best sleep I\'ve had — like being in a five-star hotel every single night!', avatar: 'P' },
  { name: 'Arjun Mehta', city: 'Delhi', rating: 5, text: 'Ordered king-size fitted sheets and they fit perfectly. The fabric quality is outstanding. Won\'t shop anywhere else now.', avatar: 'A' },
  { name: 'Kavya Reddy', city: 'Bangalore', rating: 5, text: 'The linen duvet cover is so breathable even in summer. Completely transformed my bedroom. Absolutely love it!', avatar: 'K' },
];

const marqueeItems = [
  '—  Free delivery above ₹999',
  '—  100% pure long-staple cotton',
  '—  OEKO-TEX certified fabrics',
  '—  Up to 1000 thread count',
  '—  Anti-fade guarantee',
  '—  Same-day dispatch available',
  '—  Woven with care in India',
];

const HomePage = () => {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroLoaded, setHeroLoaded] = useState(false);
  const navigate = useNavigate();
  const heroImgRef = useParallax(0.12);

  const catRef = useReveal();
  const featRef = useReveal();
  const testimonialRef = useReveal();
  const bannerRef = useReveal();
  const statsRef = useReveal();
  const diffRef = useReveal();

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

      {/* ════════ HERO ════════ */}
      <section className="hero-gradient hero-gradient-shift min-h-[92vh] flex items-center relative overflow-hidden">
        {/* Floating decorative shapes */}
        <div className="absolute top-24 right-[12%] w-32 h-32 border border-rose-primary/8 rounded-full shape-orbit pointer-events-none" />
        <div className="absolute bottom-40 left-[6%] w-20 h-20 bg-sage/8 rounded-2xl rotate-45 animate-float pointer-events-none" style={{ animationDelay: '3s' }} />
        <div className="absolute top-[35%] right-[3%] w-3 h-3 bg-accent-gold/25 rounded-full animate-pulse-soft pointer-events-none" />
        <div className="absolute top-[60%] left-[15%] w-2 h-2 bg-rose-primary/15 rounded-full animate-pulse-soft pointer-events-none" style={{ animationDelay: '1.5s' }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12 sm:py-20">
          <div className="grid lg:grid-cols-[1fr_480px] xl:grid-cols-[1fr_540px] gap-10 lg:gap-16 items-center">

            {/* ── Text ── */}
            <div className="text-center lg:text-left">
              <div className={`transition-all duration-700 delay-100 ${heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                <span className="inline-flex items-center gap-2 text-xs font-sans tracking-[0.18em] uppercase text-warm-gray border border-rose-primary/20 px-4 py-2 rounded-full bg-white/50 backdrop-blur-sm mb-6 sm:mb-8">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-gold animate-pulse-soft inline-block" />
                  Premium Bedsheets · Made in India
                </span>
              </div>

              <div className={`transition-all duration-1000 delay-200 ${heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <h1 className="font-display leading-[1.05] text-deep-brown mb-6" style={{ fontSize: 'clamp(2.5rem, 7vw, 5.5rem)' }}>
                  Sleep Like
                  <br />
                  <em className="italic gold-text glow-pulse">Royalty.</em>
                </h1>
              </div>

              <div className={`transition-all duration-700 delay-300 ${heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                <p className="font-sans text-warm-gray text-[0.95rem] sm:text-[1.0625rem] leading-[1.8] mb-8 max-w-[440px] mx-auto lg:mx-0">
                  From silky cottons to breathable linens — every sheet at Torts &amp; Twirls is woven with premium long-staple fibres for the ultimate sleep experience.
                </p>
              </div>

              <div className={`flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 justify-center lg:justify-start transition-all duration-700 delay-[400ms] ${heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                <button onClick={() => navigate('/products')} className="btn-primary group text-[0.9rem] px-8 py-4 w-full sm:w-auto">
                  Shop Collection
                  <svg className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
                <button onClick={() => navigate('/products?category=cotton')} className="btn-outline text-[0.9rem] px-8 py-4 w-full sm:w-auto">
                  Explore Cotton →
                </button>
              </div>

              {/* Trust badges */}
              <div className={`flex flex-wrap gap-2 justify-center lg:justify-start mb-8 transition-all duration-700 delay-[450ms] ${heroLoaded ? 'opacity-100' : 'opacity-0'}`}>
                {['✓ 100% Pure Cotton', '✓ OEKO-TEX Certified', '✓ 4.9 ★ Rating', '✓ Free Returns'].map(b => (
                  <span key={b} className="inline-block text-[0.7rem] sm:text-xs font-sans text-warm-gray border border-sand bg-white/70 backdrop-blur-sm px-3 py-1.5 rounded-full hover:border-rose-primary/30 hover:bg-white transition-all duration-300 cursor-default">
                    {b}
                  </span>
                ))}
              </div>

              {/* Stats */}
              <div ref={statsRef} className={`flex items-center gap-6 sm:gap-8 justify-center lg:justify-start transition-all duration-700 delay-500 ${heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                {[
                  { label: 'Happy Customers', end: 5000, suffix: '+' },
                  { label: 'Avg Rating', end: 4.9, suffix: '★' },
                  { label: 'Designs', end: 200, suffix: '+' },
                ].map((s, i) => (
                  <React.Fragment key={s.label}>
                    {i > 0 && <div className="w-px h-12 bg-sand" />}
                    <div>
                      <p className="font-display text-2xl sm:text-3xl text-deep-brown leading-none">
                        <AnimCounter end={s.end} suffix={s.suffix} />
                      </p>
                      <p className="text-[0.65rem] sm:text-[0.72rem] font-sans text-taupe uppercase tracking-[0.14em] mt-1">{s.label}</p>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* ── Single Hero Image ── */}
            <div className={`relative hidden lg:block transition-all duration-1000 delay-500 ${heroLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}>
              <div className="relative ml-auto w-full max-w-[480px] h-[600px] rounded-[2.5rem] overflow-hidden shadow-lifted">
                <div ref={heroImgRef} className="absolute inset-[-20px] will-change-transform">
                  <img
                    src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1000&auto=format&fit=crop&q=80"
                    alt="Premium bedsheets — luxury white bedding"
                    className="w-full h-full object-cover"
                    onError={e => { e.target.src = 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1000'; }}
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 via-transparent to-charcoal/5 pointer-events-none" />
                {/* Glass label overlay */}
                <div className="absolute bottom-5 left-4 right-4 bg-white/12 backdrop-blur-xl border border-white/20 rounded-xl px-5 py-3.5 z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-[0.55rem] font-sans tracking-widest uppercase">Featured</p>
                      <p className="text-white font-display text-lg leading-tight">400 TC Egyptian Cotton</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating review */}
              <div className="absolute -bottom-3 -left-8 bg-white rounded-2xl shadow-lifted p-4 w-[200px] animate-float z-10">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-9 h-9 rounded-full bg-rose-primary text-white flex items-center justify-center text-sm font-medium font-sans flex-shrink-0">P</div>
                  <div>
                    <p className="text-xs font-sans font-semibold text-deep-brown leading-tight">Priya S.</p>
                    <Stars n={5} />
                  </div>
                </div>
                <p className="text-[0.7rem] font-sans text-warm-gray italic leading-relaxed">"Absolutely cloud-like softness!"</p>
              </div>

              {/* Thread count badge */}
              <div className="absolute top-6 -right-5 bg-accent-gold text-white rounded-2xl px-4 py-3 shadow-glow animate-float z-10" style={{ animationDelay: '2s' }}>
                <p className="text-[0.5rem] font-sans uppercase tracking-wider text-white/70">Thread Count</p>
                <p className="font-display text-xl text-white leading-none">1000 TC</p>
              </div>
            </div>

            {/* Mobile hero image */}
            <div className={`lg:hidden relative rounded-2xl overflow-hidden mx-auto max-w-sm transition-all duration-700 delay-500 ${heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ aspectRatio: '4/3' }}>
              <img
                src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&auto=format&fit=crop&q=80"
                alt="Premium bedsheets"
                className="w-full h-full object-cover"
                onError={e => { e.target.src = 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/30 to-transparent" />
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex-col items-center gap-2 opacity-35 hidden sm:flex pointer-events-none">
          <span className="text-[0.65rem] font-sans uppercase tracking-[0.2em] text-taupe">Scroll</span>
          <div className="w-px h-10 bg-gradient-to-b from-taupe to-transparent animate-pulse-soft" />
        </div>
      </section>

      {/* ════════ MARQUEE ════════ */}
      <section className="bg-rose-primary py-4 overflow-hidden">
        <div className="marquee-track">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i} className="font-sans text-white/90 text-sm tracking-[0.15em] whitespace-nowrap px-10">{item}</span>
          ))}
        </div>
      </section>

      {/* ════════ FEATURES STRIP ════════ */}
      <section className="bg-white border-b border-sand/50 py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[
              { icon: <IconTruck />, title: 'Free Delivery', desc: 'Orders above ₹999' },
              { icon: <IconSparkle />, title: 'Premium Quality', desc: 'Long-staple cotton' },
              { icon: <IconShield />, title: 'Secure Payment', desc: 'Razorpay encrypted' },
              { icon: <IconReturn />, title: 'Easy Returns', desc: 'Hassle-free refunds' },
            ].map(f => (
              <div key={f.title} className="flex items-center gap-3 sm:gap-3.5 group cursor-default">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-rose-primary/20 bg-rose-mist/40 flex items-center justify-center flex-shrink-0 text-rose-primary group-hover:bg-rose-primary group-hover:text-white group-hover:border-rose-primary group-hover:scale-110 transition-all duration-300">
                  {f.icon}
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-sans font-semibold text-deep-brown">{f.title}</p>
                  <p className="text-[0.65rem] sm:text-xs font-sans text-taupe">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ CATEGORIES ════════ */}
      <section className="py-16 sm:py-24 bg-cream overflow-hidden" ref={catRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-14 reveal-on-scroll">
            <p className="text-xs font-sans uppercase tracking-[0.22em] text-rose-primary mb-3">Curated collections</p>
            <h2 className="font-display text-[2rem] sm:text-[2.8rem] text-deep-brown">Shop by Category</h2>
            <div className="divider-gold max-w-[200px] mx-auto mt-4">
              <span className="text-accent-gold text-lg">✦</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 stagger-in reveal-on-scroll">
            {categories.map(cat => (
              <CategoryCard key={cat.slug} cat={cat} />
            ))}
          </div>

          <div className="text-center mt-10 reveal-on-scroll">
            <Link to="/products" className="btn-outline">View All Products</Link>
          </div>
        </div>
      </section>

      {/* ════════ THE T&T DIFFERENCE ════════ */}
      <section className="py-16 sm:py-24 bg-white overflow-hidden" ref={diffRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Image */}
            <div className="relative reveal-on-scroll order-2 lg:order-1">
              <div className="rounded-3xl overflow-hidden shadow-card" style={{ aspectRatio: '4/5' }}>
                <img
                  src="https://images.unsplash.com/photo-1629140727571-9b5c6f6267b4?w=900&auto=format&fit=crop&q=80"
                  alt="Premium white cotton fabric texture"
                  className="w-full h-full object-cover scale-reveal"
                  onError={e => { e.target.src = 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=900'; }}
                  onLoad={e => e.target.classList.add('loaded')}
                />
              </div>
              {/* Rating card */}
              <div className="absolute -bottom-5 -right-2 sm:right-6 bg-rose-primary rounded-2xl p-5 shadow-glow animate-float z-10" style={{ animationDelay: '1s' }}>
                <p className="font-display text-3xl text-cream leading-none">4.9</p>
                <div className="flex gap-0.5 my-1.5">
                  {[1,2,3,4,5].map(s => (
                    <svg key={s} className="w-3 h-3 text-amber-300" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-cream/60 text-xs font-sans">5,000+ reviews</p>
              </div>
              {/* Cert badge */}
              <div className="absolute top-6 -left-2 sm:left-4 bg-white rounded-xl shadow-card px-4 py-2.5 border border-sand/50 animate-float z-10" style={{ animationDelay: '3s' }}>
                <p className="text-[0.55rem] font-sans uppercase tracking-wider text-taupe">Certified</p>
                <p className="text-deep-brown font-sans font-semibold text-xs">OEKO-TEX® Standard</p>
              </div>
            </div>

            {/* Text */}
            <div className="reveal-on-scroll order-1 lg:order-2">
              <p className="text-xs font-sans uppercase tracking-[0.22em] text-rose-primary mb-3">Why T&T</p>
              <h2 className="font-display text-[2rem] sm:text-[2.8rem] text-deep-brown leading-tight mb-4">
                Crafted for<br />
                <em className="italic gold-text">Exceptional Comfort</em>
              </h2>
              <p className="font-sans text-warm-gray text-[0.9rem] leading-relaxed mb-8 max-w-md">
                Every Torts &amp; Twirls bedsheet begins with premium long-staple cotton, woven and finished to exacting standards — for softness that genuinely lasts.
              </p>

              <div className="space-y-5">
                {[
                  { icon: <IconSparkle />, title: 'Premium Long-Staple Cotton', desc: 'Longer fibres = smoother, stronger, softer sheets. Sourced from India\'s finest farms.' },
                  { icon: <IconShield />, title: 'OEKO-TEX® Certified', desc: 'Tested for 100+ harmful substances. Completely safe for skin — including babies.' },
                  { icon: <IconSun />, title: 'Anti-Fade Technology', desc: 'Reactive dyes lock in colour through 200+ washes. Vibrant looks that last years.' },
                  { icon: <IconReturn />, title: '30-Day Easy Returns', desc: 'Not in love? Return it, no questions asked. We stand behind every product.' },
                ].map((f, i) => (
                  <div key={i} className="flex gap-4 group">
                    <div className="w-10 h-10 rounded-xl bg-rose-mist border border-rose-primary/10 flex items-center justify-center flex-shrink-0 text-rose-primary group-hover:bg-rose-primary group-hover:text-white group-hover:scale-110 transition-all duration-300">
                      {f.icon}
                    </div>
                    <div>
                      <p className="font-sans font-semibold text-deep-brown text-sm">{f.title}</p>
                      <p className="text-warm-gray text-xs mt-0.5 leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link to="/products" className="btn-primary mt-8 inline-flex items-center gap-2">
                Discover the Collection
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ FEATURED PRODUCTS ════════ */}
      <section className="py-16 sm:py-24 bg-light-beige overflow-hidden" ref={featRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 sm:mb-14 gap-4 reveal-on-scroll">
            <div className="text-center sm:text-left">
              <p className="text-xs font-sans uppercase tracking-[0.22em] text-rose-primary mb-3">Handpicked</p>
              <h2 className="font-display text-[2rem] sm:text-[2.8rem] text-deep-brown leading-tight">
                Featured<br className="hidden sm:block" /> Collections
              </h2>
            </div>
            <Link to="/products" className="hidden sm:flex items-center gap-2 text-sm font-sans text-warm-gray hover:text-rose-primary transition-colors group link-underline">
              View all products
              <svg className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {loading ? (
            <ProductGridSkeleton count={4} />
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
              {featured.slice(0, 4).map((product, i) => (
                <div key={product._id} className={`reveal-on-scroll delay-${i + 1}`}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-8 sm:mt-10 sm:hidden reveal-on-scroll">
            <Link to="/products" className="btn-outline">View All Products</Link>
          </div>
        </div>
      </section>

      {/* ════════ STATS STRIP ════════ */}
      <section className="bg-rose-primary py-12 sm:py-16 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle at 15% 50%, rgba(255,255,255,0.04) 0%, transparent 50%), radial-gradient(circle at 85% 50%, rgba(201,168,76,0.06) 0%, transparent 50%)'
        }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
            {[
              { num: 1000, suffix: ' TC', label: 'Max Thread Count' },
              { num: 100, suffix: '%', label: 'Pure Long-Staple Cotton' },
              { num: 5000, suffix: '+', label: 'Happy Customers' },
              { num: 30, suffix: '-Day', label: 'Easy Returns' },
            ].map((s, i) => (
              <div key={i}>
                <p className="font-display text-4xl sm:text-5xl text-cream font-light leading-none glow-pulse">
                  <AnimCounter end={s.num} suffix={s.suffix} />
                </p>
                <div className="w-8 h-px bg-cream/20 mx-auto my-2.5" />
                <p className="text-cream/55 text-[0.7rem] sm:text-xs font-sans uppercase tracking-[0.15em]">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ LIFESTYLE BANNER ════════ */}
      <section className="py-16 sm:py-24 bg-cream" ref={bannerRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden reveal-on-scroll" style={{ minHeight: '420px' }}>
            <img
              src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1600&auto=format&fit=crop&q=80"
              alt="Bedroom lifestyle"
              className="absolute inset-0 w-full h-full object-cover"
              onError={e => { e.target.src = 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1600'; }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-charcoal/90 via-charcoal/50 to-transparent" />
            <div className="relative z-10 p-8 sm:p-12 md:p-20 max-w-xl flex flex-col justify-center h-full" style={{ minHeight: '420px' }}>
              <span className="text-xs font-sans tracking-[0.2em] uppercase text-sage mb-5 block">Limited Time</span>
              <h2 className="font-display text-[2.2rem] sm:text-[3rem] md:text-[3.5rem] text-cream mb-5 leading-[1.1]">
                Transform Your<br />
                <em className="italic">Bedroom.</em>
              </h2>
              <p className="font-sans text-cream/65 mb-8 leading-relaxed text-[0.9rem] sm:text-[0.95rem]">
                Use code{' '}
                <span className="font-mono font-semibold text-cream border border-cream/40 bg-white/10 px-2.5 py-1 rounded-lg tracking-wider">SLEEP10</span>
                {' '}for 10% off your first order.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/products" className="btn-primary text-center">Shop Now</Link>
                <Link to="/products?category=cotton" className="btn-outline border-cream/40 text-cream hover:bg-cream/10 hover:text-cream text-center">
                  Cotton Collection
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ TESTIMONIALS ════════ */}
      <section className="py-16 sm:py-24 overflow-hidden" style={{ background: 'linear-gradient(135deg, #FAFAF7 0%, #F5EFE6 50%, #E8F3EB 100%)' }} ref={testimonialRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-14 reveal-on-scroll">
            <p className="text-xs font-sans uppercase tracking-[0.22em] text-rose-primary mb-3">Customer love</p>
            <h2 className="font-display text-[2rem] sm:text-[2.8rem] text-deep-brown">Loved by Thousands</h2>
            <div className="divider-gold max-w-[200px] mx-auto mt-4">
              <span className="text-accent-gold text-lg">✦</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className={`tilt-card bg-white rounded-2xl p-6 shadow-card reveal-on-scroll delay-${i + 1} relative overflow-hidden group`}
              >
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accent-gold via-rose-primary to-transparent scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />
                <p className="font-display text-[5rem] sm:text-[6rem] leading-none text-rose-primary/8 -mb-8 select-none">&ldquo;</p>
                <Stars n={t.rating} />
                <p className="font-sans text-warm-gray text-sm leading-[1.7] mt-3 mb-5 italic">{t.text}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-primary to-chocolate-light flex items-center justify-center text-white font-semibold text-sm font-sans flex-shrink-0">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-sans font-semibold text-deep-brown text-sm">{t.name}</p>
                    <p className="font-sans text-taupe text-xs">{t.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center reveal-on-scroll">
            <div className="inline-flex items-center gap-4 bg-white rounded-2xl px-8 py-4 shadow-soft hover:shadow-card transition-shadow duration-300">
              <div>
                <p className="font-display text-3xl text-deep-brown leading-none">4.9</p>
                <Stars n={5} />
              </div>
              <div className="w-px h-10 bg-sand" />
              <div className="text-left">
                <p className="font-sans text-sm font-semibold text-deep-brown">Excellent</p>
                <p className="font-sans text-xs text-taupe">Based on 5,000+ reviews</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ QUALITY PROMISE ════════ */}
      <section className="py-16 sm:py-20 bg-deep-brown relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(107,174,140,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(201,168,76,0.05) 0%, transparent 50%)',
        }} />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <span className="text-xs font-sans uppercase tracking-[0.25em] text-sage mb-4 block">Our Promise</span>
          <h2 className="font-display text-[2rem] sm:text-[2.5rem] md:text-[3.5rem] text-cream mb-6 leading-tight">
            Every Thread.<br />
            <em className="italic gold-text">Pure Comfort.</em>
          </h2>
          <p className="font-sans text-cream/55 text-[0.9rem] sm:text-[1rem] leading-relaxed mb-6 max-w-xl mx-auto">
            We use only OEKO-TEX certified, long-staple cotton. Every bedsheet is woven with precision — for softness that lasts wash after wash, year after year.
          </p>
          <div className="flex flex-wrap justify-center gap-2.5 mb-10">
            {['OEKO-TEX® Certified', '100% Long-Staple Cotton', 'Anti-Fade Dyes', 'Sanforized Finish'].map(c => (
              <span key={c} className="text-xs font-sans text-cream/60 border border-cream/20 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 hover:border-cream/30 transition-all duration-300 cursor-default">
                {c}
              </span>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4">
            <Link to="/products" className="btn-primary">Shop the Collection</Link>
            <Link to="/register" className="btn-outline border-cream/30 text-cream hover:bg-cream/10 hover:text-cream">
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* ════════ NEWSLETTER ════════ */}
      <section className="py-16 sm:py-20 bg-white relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blush/60 rounded-full blur-3xl opacity-40" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-rose-mist/60 rounded-full blur-3xl opacity-50" />
        <div className="max-w-xl mx-auto px-4 text-center relative z-10">
          <p className="font-display text-lg italic text-accent-gold mb-4">Join the Circle</p>
          <h2 className="font-display text-[1.8rem] sm:text-[2.2rem] text-deep-brown mb-3">
            The T<span className="text-accent-gold">&amp;</span>T Newsletter
          </h2>
          <p className="font-sans text-warm-gray mb-8 text-sm leading-relaxed">
            Get exclusive access to new collections, member-only discounts, and linen care tips delivered to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input type="email" placeholder="your@email.com" className="input-luxury flex-1 text-sm" />
            <button className="btn-primary whitespace-nowrap w-full sm:w-auto">Subscribe →</button>
          </div>
          <p className="text-xs text-taupe mt-3 font-sans">No spam. Unsubscribe anytime.</p>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
