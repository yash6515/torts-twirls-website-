import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../utils/api';
import { toast } from 'react-toastify';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { toast.error('Please enter your email'); return; }
    setLoading(true);
    try {
      const res = await forgotPassword({ email });
      setSent(true);
      toast.success(res.data.message || 'Reset link sent!');
      // In dev mode, log the reset URL if available
      if (res.data.devResetUrl) {
        console.log('Dev reset URL:', res.data.devResetUrl);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex overflow-hidden">
      {/* Left panel — decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col items-center justify-center"
        style={{ background: 'linear-gradient(155deg, #4A3728 0%, #2C2420 100%)' }}>

        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="absolute bg-cream w-px top-0 bottom-0" style={{ left: `${(i + 1) * 12.5}%` }} />
          ))}
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="absolute bg-cream h-px left-0 right-0" style={{ top: `${(i + 1) * 12.5}%` }} />
          ))}
        </div>

        <div className="absolute w-80 h-80 bg-gold/15 rounded-full blur-3xl blob top-1/4 -left-20" />
        <div className="absolute w-60 h-60 bg-taupe/20 rounded-full blur-3xl blob-delay bottom-1/4 right-0" />

        <div className="relative z-10 text-center px-12">
          <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-8">
            <svg className="w-10 h-10 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h2 className="font-display text-[2rem] text-cream mb-4 leading-snug" style={{ fontStyle: 'italic' }}>
            Don't worry,
            <br />we've got you.
          </h2>
          <p className="text-cream/50 font-sans text-sm leading-relaxed">
            We'll send a password reset link to your registered email address.
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div
          className={`w-full max-w-[400px] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <Link to="/" className="block mb-10">
            <span className="font-display text-3xl text-deep-brown italic font-normal tracking-wide">
              Torts <span className="text-gold">&</span> Twirls
            </span>
          </Link>

          {!sent ? (
            <>
              <h1 className="font-display text-[2.2rem] text-deep-brown mb-2 leading-tight">
                Forgot password?
              </h1>
              <p className="font-sans text-warm-gray text-sm mb-9">
                Enter your email and we'll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-[0.72rem] font-sans font-medium text-deep-brown uppercase tracking-[0.12em] mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input-luxury"
                    required
                  />
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
                      Sending...
                    </span>
                  ) : 'Send Reset Link →'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-sage/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h1 className="font-display text-[2rem] text-deep-brown mb-3 leading-tight">
                Check your email
              </h1>
              <p className="font-sans text-warm-gray text-sm mb-8 leading-relaxed">
                If an account with <span className="text-deep-brown font-medium">{email}</span> exists, we've sent a password reset link.
                Please check your inbox and spam folder.
              </p>
              <button
                onClick={() => { setSent(false); setEmail(''); }}
                className="btn-outline w-full py-3.5 text-[0.9rem] mb-4"
              >
                Try a different email
              </button>
            </div>
          )}

          <div className="divider-gold my-8">
            <span className="text-taupe text-xs font-sans px-2">or</span>
          </div>

          <div className="text-center">
            <p className="text-sm font-sans text-warm-gray">
              Remember your password?{' '}
              <Link to="/login" className="text-deep-brown font-medium hover:text-gold transition-colors link-underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
