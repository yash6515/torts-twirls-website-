import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { verifyResetToken, resetPassword } from '../utils/api';
import { toast } from 'react-toastify';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [valid, setValid] = useState(false);
  const [email, setEmail] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const verify = async () => {
      try {
        const res = await verifyResetToken(token);
        setValid(true);
        setEmail(res.data.email || '');
      } catch {
        setValid(false);
      } finally {
        setVerifying(false);
      }
    };
    verify();
  }, [token]);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const pwStrength = (pw) => {
    if (!pw) return 0;
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };

  const strength = pwStrength(form.password);
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['', 'bg-rose-400', 'bg-amber-400', 'bg-sage', 'bg-emerald-500'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      const res = await resetPassword(token, { password: form.password, confirmPassword: form.confirmPassword });
      login(res.data.token, res.data.user);
      toast.success('Password reset successful!');
      navigate('/', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <svg className="w-8 h-8 animate-spin text-gold mx-auto mb-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="font-sans text-warm-gray text-sm">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  if (!valid) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-6">
        <div className={`w-full max-w-[400px] text-center transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="font-display text-[2rem] text-deep-brown mb-3">Link expired</h1>
          <p className="font-sans text-warm-gray text-sm mb-8 leading-relaxed">
            This password reset link is invalid or has expired.
            Please request a new one.
          </p>
          <Link to="/forgot-password" className="btn-primary inline-block px-8 py-3.5 text-[0.9rem]">
            Request New Link →
          </Link>
          <div className="mt-6">
            <Link to="/login" className="text-sm font-sans text-taupe hover:text-gold transition-colors">
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="font-display text-[2rem] text-cream mb-4 leading-snug" style={{ fontStyle: 'italic' }}>
            Almost there!
            <br />Set your new password.
          </h2>
          <p className="text-cream/50 font-sans text-sm leading-relaxed">
            Choose a strong password to keep your account secure.
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

          <h1 className="font-display text-[2.2rem] text-deep-brown mb-2 leading-tight">
            Reset password
          </h1>
          <p className="font-sans text-warm-gray text-sm mb-9">
            {email ? (
              <>Enter a new password for <span className="text-deep-brown font-medium">{email}</span></>
            ) : (
              'Enter your new password below.'
            )}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[0.72rem] font-sans font-medium text-deep-brown uppercase tracking-[0.12em] mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
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
              {form.password && (
                <div className="mt-2 space-y-1.5">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthColors[strength] : 'bg-sand'}`} />
                    ))}
                  </div>
                  <p className="text-[0.7rem] font-sans text-taupe">{strengthLabels[strength]}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-[0.72rem] font-sans font-medium text-deep-brown uppercase tracking-[0.12em] mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat your password"
                className={`input-luxury ${form.confirmPassword && form.confirmPassword !== form.password ? 'border-rose-300 focus:border-rose-400' : ''}`}
                required
              />
              {form.confirmPassword && form.confirmPassword !== form.password && (
                <p className="text-[0.72rem] text-rose-500 font-sans mt-1.5">Passwords don't match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || (form.confirmPassword && form.confirmPassword !== form.password)}
              className="btn-primary w-full py-4 text-[0.9rem] mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Resetting...
                </span>
              ) : 'Reset Password →'}
            </button>
          </form>

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

export default ResetPasswordPage;
