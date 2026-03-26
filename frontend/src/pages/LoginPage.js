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
      toast.success(`Welcome back, ${res.data.user.name.split(' ')[0]}! 👋`);
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex overflow-hidden">
      {/* Left panel — decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col items-center justify-center"
        style={{ background: 'linear-gradient(155deg, #1B4332 0%, #0D2B1C 100%)' }}>

        {/* Decorative grid lines */}
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="absolute bg-cream w-px top-0 bottom-0" style={{ left: `${(i + 1) * 12.5}%` }} />
          ))}
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="absolute bg-cream h-px left-0 right-0" style={{ top: `${(i + 1) * 12.5}%` }} />
          ))}
        </div>

        {/* Blobs */}
        <div className="absolute w-80 h-80 bg-gold/15 rounded-full blur-3xl blob top-1/4 -left-20" />
        <div className="absolute w-60 h-60 bg-taupe/20 rounded-full blur-3xl blob-delay bottom-1/4 right-0" />

        <div className="relative z-10 text-center px-12">
          <span className="font-display text-cream/30 text-[8rem] leading-none block mb-0 select-none" style={{ fontStyle: 'italic' }}>"</span>
          <p className="font-display text-[1.8rem] text-cream leading-snug mb-6 -mt-6" style={{ fontStyle: 'italic' }}>
            Sleep is the golden chain that ties health and our bodies together.
          </p>
          <p className="font-sans text-cream/50 text-sm">— Thomas Dekker</p>

          <div className="mt-16 flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full bg-deep-brown/60 border border-cream/20 overflow-hidden">
              <img src="https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=100" alt="" className="w-full h-full object-cover opacity-60" />
            </div>
            <div className="text-left">
              <p className="text-cream text-sm font-sans font-medium">Torts & Twirls</p>
              <p className="text-cream/50 text-xs font-sans">Premium Bedsheet Collection</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div
          className={`w-full max-w-[400px] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Logo */}
          <Link to="/" className="block mb-10">
            <span className="font-display text-3xl text-deep-brown italic font-normal tracking-wide">
              Torts <span className="text-gold">&</span> Twirls
            </span>
          </Link>

          <h1 className="font-display text-[2.2rem] text-deep-brown mb-2 leading-tight">
            Welcome back
          </h1>
          <p className="font-sans text-warm-gray text-sm mb-9">
            Sign in to your account to continue shopping.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
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

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[0.72rem] font-sans font-medium text-deep-brown uppercase tracking-[0.12em]">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs text-taupe hover:text-gold transition-colors font-sans">
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

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 text-[0.9rem] mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </span>
              ) : 'Sign In →'}
            </button>
          </form>

          <div className="divider-gold my-8">
            <span className="text-taupe text-xs font-sans px-2">or</span>
          </div>

          <div className="text-center">
            <p className="text-sm font-sans text-warm-gray">
              Don't have an account?{' '}
              <Link to="/register" className="text-deep-brown font-medium hover:text-gold transition-colors link-underline">
                Create one
              </Link>
            </p>
          </div>

          {/* Demo credentials */}
          
          
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
