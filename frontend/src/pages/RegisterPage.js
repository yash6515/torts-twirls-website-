import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerUser } from '../utils/api';
import { toast } from 'react-toastify';

const RegisterPage = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

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
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const res = await registerUser({ name: form.name, email: form.email, phone: form.phone, password: form.password });
      login(res.data.token, res.data.user);
      toast.success(`Welcome to Torts & Twirls, ${res.data.user.name.split(' ')[0]}! 🎉`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex overflow-hidden">
      {/* Left decorative */}
      <div className="hidden lg:flex lg:w-2/5 relative overflow-hidden items-center justify-center"
        style={{ background: 'linear-gradient(155deg, #2C2420 0%, #4A3728 100%)' }}>
        <div className="absolute w-80 h-80 bg-gold/10 rounded-full blur-3xl blob top-1/3 -right-16" />
        <div className="absolute w-56 h-56 bg-sage/15 rounded-full blur-3xl blob-delay bottom-1/3 -left-10" />
        <div className="relative z-10 px-10 text-center">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-8">🛏️</div>
          <h2 className="font-display text-[2rem] text-cream mb-4 leading-snug" style={{ fontStyle: 'italic' }}>
            Your perfect sleep
            <br />awaits inside.
          </h2>
          <p className="text-cream/50 font-sans text-sm leading-relaxed mb-10">
            Join 2,500+ happy homes enjoying our premium bedsheet collections.
          </p>
          <div className="space-y-3">
            {['Free shipping above ₹999', 'Member-exclusive discounts', '15-day easy returns'].map(perk => (
              <div key={perk} className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center flex-shrink-0">
                  <svg className="w-2.5 h-2.5 text-gold" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-cream/70 text-xs font-sans">{perk}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center px-6 py-14 overflow-y-auto">
        <div className={`w-full max-w-[420px] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <Link to="/" className="block mb-8">
            <span className="font-display text-2xl text-deep-brown italic font-normal">Torts <span className="text-gold">&</span> Twirls</span>
          </Link>

          <h1 className="font-display text-[2rem] text-deep-brown mb-2">Create account</h1>
          <p className="font-sans text-warm-gray text-sm mb-8">Start your premium sleep journey today.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { name: 'name', label: 'Full Name', type: 'text', placeholder: 'Your full name' },
              { name: 'email', label: 'Email Address', type: 'email', placeholder: 'you@example.com' },
              { name: 'phone', label: 'Phone (optional)', type: 'tel', placeholder: '10-digit mobile number' },
            ].map(field => (
              <div key={field.name}>
                <label className="block text-[0.72rem] font-sans font-medium text-deep-brown uppercase tracking-[0.12em] mb-1.5">
                  {field.label}
                </label>
                <input
                  type={field.type}
                  name={field.name}
                  value={form[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  className="input-luxury"
                  required={field.name !== 'phone'}
                />
              </div>
            ))}

            {/* Password */}
            <div>
              <label className="block text-[0.72rem] font-sans font-medium text-deep-brown uppercase tracking-[0.12em] mb-1.5">Password</label>
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
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-taupe hover:text-deep-brown transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
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

            {/* Confirm password */}
            <div>
              <label className="block text-[0.72rem] font-sans font-medium text-deep-brown uppercase tracking-[0.12em] mb-1.5">Confirm Password</label>
              <input
                type="password"
                name="confirm"
                value={form.confirm}
                onChange={handleChange}
                placeholder="Repeat your password"
                className={`input-luxury ${form.confirm && form.confirm !== form.password ? 'border-rose-300 focus:border-rose-400' : ''}`}
                required
              />
              {form.confirm && form.confirm !== form.password && (
                <p className="text-[0.72rem] text-rose-500 font-sans mt-1.5">Passwords don't match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || (form.confirm && form.confirm !== form.password)}
              className="btn-primary w-full py-4 text-[0.9rem] mt-3 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account...
                </span>
              ) : 'Create Account →'}
            </button>
          </form>

          <p className="text-center text-xs font-sans text-taupe mt-5 leading-relaxed">
            By creating an account, you agree to our{' '}
            <a href="#" className="text-deep-brown hover:text-gold transition-colors">Terms of Service</a> and{' '}
            <a href="#" className="text-deep-brown hover:text-gold transition-colors">Privacy Policy</a>.
          </p>

          <div className="divider-gold my-7">
            <span className="text-taupe text-xs font-sans px-2">already a member?</span>
          </div>

          <Link to="/login" className="btn-outline w-full py-3.5 text-[0.9rem] text-center">
            Sign In Instead
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
