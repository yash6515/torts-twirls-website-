import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../utils/api';
import { toast } from 'react-toastify';

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    setMounted(true);
    if (isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated, navigate, from]);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error('Please fill all fields'); return; }
    setLoading(true);
    try {
      const res = await loginUser(form);
      login(res.data.token, res.data.user);
      toast.success(`Welcome back, ${res.data.user.name.split(' ')[0]}!`);
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden">

      {/* ── Left: Image Panel ── */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
        {/* Background image with Ken Burns */}
        <img
          src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1400&auto=format&fit=crop&q=80"
          alt="Luxury bedding"
          className="absolute inset-0 w-full h-full object-cover ken-burns"
          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1400'; }}
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/40 to-charcoal/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/30 to-transparent" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-14 xl:p-20 w-full">
          {/* Spacer top */}
          <div />

          {/* Center quote */}
          <div className="max-w-md">
            <p className="font-display text-cream/15 text-[5rem] leading-none select-none -mb-6" style={{ fontStyle: 'italic' }}>&ldquo;</p>
            <p className="font-display text-[2.2rem] xl:text-[2.8rem] text-cream leading-[1.15] mb-6" style={{ fontStyle: 'italic' }}>
              The luxury of
              <br />
              <span className="gold-text glow-pulse">better sleep.</span>
            </p>
            <p className="font-sans text-cream/50 text-sm leading-relaxed max-w-sm">
              Premium bedsheets woven with care from India&apos;s finest long-staple cotton. Experience the difference.
            </p>
          </div>

          {/* Bottom stats */}
          <div className="flex items-center gap-8">
            {[
              { val: '5,000+', label: 'Happy Customers' },
              { val: '4.9 ★', label: 'Average Rating' },
              { val: '200+', label: 'Unique Designs' },
            ].map((s, i) => (
              <div key={i}>
                <p className="font-display text-xl text-cream leading-none">{s.val}</p>
                <p className="text-cream/40 text-[0.65rem] font-sans uppercase tracking-wider mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Floating decorative elements */}
        <div className="absolute bottom-20 right-10 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-5 py-3.5 animate-float z-20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-rose-primary/80 flex items-center justify-center text-xs text-white font-medium font-sans">P</div>
            <div>
              <p className="text-cream text-xs font-sans font-medium">Priya S.</p>
              <span className="flex gap-0.5">
                {[1,2,3,4,5].map(i => <svg key={i} className="w-2.5 h-2.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
              </span>
            </div>
          </div>
          <p className="text-cream/70 text-[0.65rem] font-sans italic mt-1.5">"Like sleeping on a cloud!"</p>
        </div>
      </div>

      {/* ── Right: Form Panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 sm:px-12 py-16 bg-cream relative">
        {/* Subtle decorative bg */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blush/40 rounded-full blur-3xl opacity-40 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-rose-mist/40 rounded-full blur-3xl opacity-50 pointer-events-none" />

        <div
          className={`w-full max-w-[420px] relative z-10 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h1 className="font-display text-[2.2rem] text-deep-brown mb-2 leading-tight">
            Welcome back
          </h1>
          <p className="font-sans text-warm-gray text-sm mb-9">
            Sign in to your account to continue shopping.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className={`transition-all duration-500 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <label className="block text-[0.72rem] font-sans font-medium text-deep-brown uppercase tracking-[0.12em] mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="input-luxury"
                required
              />
            </div>

            {/* Password */}
            <div className={`transition-all duration-500 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[0.72rem] font-sans font-medium text-deep-brown uppercase tracking-[0.12em]">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs text-taupe hover:text-accent-gold transition-colors font-sans">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input-luxury pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-taupe hover:text-deep-brown transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {showPw
                      ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    }
                  </svg>
                </button>
              </div>
            </div>

            {/* Submit */}
            <div className={`transition-all duration-500 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-4 text-[0.9rem] mt-2 disabled:opacity-60 disabled:cursor-not-allowed group"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  <>
                    Sign In
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>

          <div className={`divider-gold my-8 transition-all duration-500 delay-[350ms] ${mounted ? 'opacity-100' : 'opacity-0'}`}>
            <span className="text-taupe text-xs font-sans px-2">or</span>
          </div>

          <div className={`text-center transition-all duration-500 delay-[400ms] ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <p className="text-sm font-sans text-warm-gray">
              Don't have an account?{' '}
              <Link to="/register" className="text-deep-brown font-medium hover:text-accent-gold transition-colors link-underline">
                Create one
              </Link>
            </p>
          </div>

          {/* Security badge */}
          <div className={`mt-10 flex items-center justify-center gap-2 transition-all duration-500 delay-[450ms] ${mounted ? 'opacity-100' : 'opacity-0'}`}>
            <svg className="w-3.5 h-3.5 text-sage" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            <p className="text-[0.7rem] font-sans text-taupe">Secured with 256-bit SSL encryption</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
