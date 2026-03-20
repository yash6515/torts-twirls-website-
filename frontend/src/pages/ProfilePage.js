import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  updateProfile, changePassword,
  getAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress,
} from '../utils/api';
import { toast } from 'react-toastify';

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Delhi','Goa',
  'Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala',
  'Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland',
  'Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura',
  'Uttar Pradesh','Uttarakhand','West Bengal',
];

const ADDRESS_TYPES = [
  { value: 'home',  label: '🏠 Home',  icon: '🏠' },
  { value: 'work',  label: '💼 Work',  icon: '💼' },
  { value: 'other', label: '📍 Other', icon: '📍' },
];

const EMPTY_ADDRESS = {
  label: 'Home', type: 'home',
  name: '', phone: '',
  addressLine1: '', addressLine2: '',
  city: '', state: '', pincode: '',
  isDefault: false,
};

/* ─── AddressCard ─── */
const AddressCard = ({ address, onEdit, onDelete, onSetDefault, deleting, settingDefault }) => (
  <div className={`relative bg-white rounded-2xl p-5 border-2 shadow-card transition-all duration-300 hover:shadow-[0_8px_30px_rgba(74,55,40,0.1)] ${address.isDefault ? 'border-gold' : 'border-transparent'}`}>
    {/* Default badge */}
    {address.isDefault && (
      <span className="absolute top-4 right-4 text-[0.65rem] font-sans font-semibold text-gold bg-gold/10 border border-gold/25 px-2.5 py-1 rounded-full uppercase tracking-wide">
        ✦ Default
      </span>
    )}

    <div className="flex items-start gap-3 mb-3">
      <div className="w-10 h-10 rounded-xl bg-cream flex items-center justify-center text-lg flex-shrink-0">
        {ADDRESS_TYPES.find(t => t.value === address.type)?.icon || '📍'}
      </div>
      <div className="min-w-0">
        <p className="font-sans font-semibold text-deep-brown text-sm">{address.label || address.type}</p>
        <p className="text-xs text-taupe font-sans capitalize">{address.type}</p>
      </div>
    </div>

    <div className="space-y-1 mb-4">
      <p className="text-sm font-sans font-medium text-deep-brown">{address.name}</p>
      <p className="text-sm font-sans text-warm-gray">{address.phone}</p>
      <p className="text-sm font-sans text-warm-gray leading-relaxed">
        {address.addressLine1}
        {address.addressLine2 && `, ${address.addressLine2}`}
      </p>
      <p className="text-sm font-sans text-warm-gray">
        {address.city}, {address.state} – {address.pincode}
      </p>
    </div>

    <div className="flex items-center gap-2 pt-3 border-t border-sand/60">
      {!address.isDefault && (
        <button
          onClick={() => onSetDefault(address._id)}
          disabled={settingDefault}
          className="flex-1 text-xs font-sans text-warm-gray hover:text-deep-brown py-2 px-3 rounded-lg hover:bg-cream transition-all disabled:opacity-50"
        >
          {settingDefault ? '...' : 'Set Default'}
        </button>
      )}
      <button
        onClick={() => onEdit(address)}
        className="flex-1 text-xs font-sans text-deep-brown hover:bg-cream py-2 px-3 rounded-lg border border-sand hover:border-taupe transition-all"
      >
        Edit
      </button>
      <button
        onClick={() => onDelete(address._id)}
        disabled={deleting}
        className="flex-1 text-xs font-sans text-rose-500 hover:bg-rose-50 py-2 px-3 rounded-lg border border-rose-200 hover:border-rose-300 transition-all disabled:opacity-50"
      >
        {deleting ? '...' : 'Remove'}
      </button>
    </div>
  </div>
);

/* ─── AddressForm Modal ─── */
const AddressFormModal = ({ initial, onSave, onClose, saving }) => {
  const [form, setForm] = useState(initial || EMPTY_ADDRESS);
  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleCheck = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.checked }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.addressLine1 || !form.city || !form.state || !form.pincode) {
      toast.error('Please fill all required fields'); return;
    }
    if (!/^\d{10}$/.test(form.phone)) { toast.error('Enter a valid 10-digit phone number'); return; }
    if (!/^\d{6}$/.test(form.pincode)) { toast.error('Enter a valid 6-digit pincode'); return; }
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-charcoal/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-lifted w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="sticky top-0 bg-white border-b border-sand/60 px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
          <h3 className="font-display text-xl text-deep-brown">
            {initial?._id ? 'Edit Address' : 'Add New Address'}
          </h3>
          <button onClick={onClose} className="text-taupe hover:text-deep-brown transition-colors p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Label + Type row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[0.72rem] font-sans font-semibold text-deep-brown uppercase tracking-wide mb-1.5">
                Label <span className="text-rose-400">*</span>
              </label>
              <input
                name="label"
                value={form.label}
                onChange={handle}
                placeholder="e.g. Home, Mom's Place"
                className="input-luxury"
                required
              />
            </div>
            <div>
              <label className="block text-[0.72rem] font-sans font-semibold text-deep-brown uppercase tracking-wide mb-1.5">Type</label>
              <select
                name="type"
                value={form.type}
                onChange={handle}
                className="input-luxury"
              >
                {ADDRESS_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Name + Phone */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[0.72rem] font-sans font-semibold text-deep-brown uppercase tracking-wide mb-1.5">
                Full Name <span className="text-rose-400">*</span>
              </label>
              <input name="name" value={form.name} onChange={handle} placeholder="Recipient name" className="input-luxury" required />
            </div>
            <div>
              <label className="block text-[0.72rem] font-sans font-semibold text-deep-brown uppercase tracking-wide mb-1.5">
                Phone <span className="text-rose-400">*</span>
              </label>
              <input name="phone" value={form.phone} onChange={handle} placeholder="10-digit number" className="input-luxury" maxLength={10} required />
            </div>
          </div>

          {/* Address line 1 */}
          <div>
            <label className="block text-[0.72rem] font-sans font-semibold text-deep-brown uppercase tracking-wide mb-1.5">
              Address Line 1 <span className="text-rose-400">*</span>
            </label>
            <input name="addressLine1" value={form.addressLine1} onChange={handle} placeholder="House/Flat no., Street name" className="input-luxury" required />
          </div>

          {/* Address line 2 */}
          <div>
            <label className="block text-[0.72rem] font-sans font-semibold text-deep-brown uppercase tracking-wide mb-1.5">
              Address Line 2 <span className="text-taupe">(Optional)</span>
            </label>
            <input name="addressLine2" value={form.addressLine2} onChange={handle} placeholder="Landmark, Area, Colony" className="input-luxury" />
          </div>

          {/* City + Pincode */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[0.72rem] font-sans font-semibold text-deep-brown uppercase tracking-wide mb-1.5">
                City <span className="text-rose-400">*</span>
              </label>
              <input name="city" value={form.city} onChange={handle} placeholder="Your city" className="input-luxury" required />
            </div>
            <div>
              <label className="block text-[0.72rem] font-sans font-semibold text-deep-brown uppercase tracking-wide mb-1.5">
                Pincode <span className="text-rose-400">*</span>
              </label>
              <input name="pincode" value={form.pincode} onChange={handle} placeholder="6-digit code" maxLength={6} className="input-luxury" required />
            </div>
          </div>

          {/* State */}
          <div>
            <label className="block text-[0.72rem] font-sans font-semibold text-deep-brown uppercase tracking-wide mb-1.5">
              State <span className="text-rose-400">*</span>
            </label>
            <select name="state" value={form.state} onChange={handle} className="input-luxury" required>
              <option value="">Select State</option>
              {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Set as default */}
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                name="isDefault"
                checked={form.isDefault}
                onChange={handleCheck}
                className="sr-only"
              />
              <div className={`w-5 h-5 rounded-md border-2 transition-all duration-200 flex items-center justify-center ${form.isDefault ? 'bg-deep-brown border-deep-brown' : 'border-sand group-hover:border-taupe'}`}>
                {form.isDefault && (
                  <svg className="w-3 h-3 text-cream" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </div>
            <span className="text-sm font-sans text-warm-gray group-hover:text-deep-brown transition-colors">
              Set as default address
            </span>
          </label>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 btn-outline py-3 text-sm">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 btn-primary py-3 text-sm disabled:opacity-60">
              {saving ? 'Saving...' : initial?._id ? 'Update Address' : 'Save Address'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ─── Main ProfilePage ─── */
const ProfilePage = () => {
  const { user, updateUser } = useAuth();

  // Profile form
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [profileLoading, setProfileLoading] = useState(false);

  // Password form
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });

  // Address book
  const [addresses, setAddresses] = useState([]);
  const [addrLoading, setAddrLoading] = useState(true);
  const [showAddrModal, setShowAddrModal] = useState(false);
  const [editingAddr, setEditingAddr] = useState(null);
  const [addrSaving, setAddrSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [settingDefaultId, setSettingDefaultId] = useState(null);

  // Active tab
  const [tab, setTab] = useState('profile');

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const res = await getAddresses();
      setAddresses(res.data.addresses || []);
    } catch (err) {
      console.error('Failed to load addresses', err);
    } finally {
      setAddrLoading(false);
    }
  };

  /* Profile */
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const res = await updateProfile(profileForm);
      updateUser(res.data.user);
      toast.success('Profile updated!');
    } catch { toast.error('Failed to update profile'); }
    finally { setProfileLoading(false); }
  };

  /* Password */
  const handlePwSubmit = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (pwForm.newPassword.length < 6) { toast.error('New password must be at least 6 characters'); return; }
    setPwLoading(true);
    try {
      await changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password updated!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to change password'); }
    finally { setPwLoading(false); }
  };

  /* Address save (add or update) */
  const handleAddrSave = async (formData) => {
    setAddrSaving(true);
    try {
      let res;
      if (editingAddr?._id) {
        res = await updateAddress(editingAddr._id, formData);
        toast.success('Address updated!');
      } else {
        res = await addAddress(formData);
        toast.success('Address saved!');
      }
      setAddresses(res.data.addresses);
      setShowAddrModal(false);
      setEditingAddr(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save address');
    } finally {
      setAddrSaving(false);
    }
  };

  const handleEditAddr = (address) => {
    setEditingAddr(address);
    setShowAddrModal(true);
  };

  const handleDeleteAddr = async (addrId) => {
    if (!window.confirm('Remove this address?')) return;
    setDeletingId(addrId);
    try {
      const res = await deleteAddress(addrId);
      setAddresses(res.data.addresses);
      toast.success('Address removed');
    } catch { toast.error('Failed to remove address'); }
    finally { setDeletingId(null); }
  };

  const handleSetDefault = async (addrId) => {
    setSettingDefaultId(addrId);
    try {
      const res = await setDefaultAddress(addrId);
      setAddresses(res.data.addresses);
      toast.success('Default address updated');
    } catch { toast.error('Failed to update default'); }
    finally { setSettingDefaultId(null); }
  };

  const tabs = [
    { key: 'profile',   label: 'Personal Info', icon: '👤' },
    { key: 'addresses', label: 'Saved Addresses', icon: '📍' },
    { key: 'security',  label: 'Security', icon: '🔒' },
  ];

  return (
    <div className="min-h-screen bg-cream pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="flex items-center gap-5 mb-10 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-deep-brown to-warm-gray flex items-center justify-center text-cream text-2xl font-display font-medium flex-shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="font-display text-3xl text-deep-brown">{user?.name}</h1>
            <p className="text-sm font-sans text-taupe">{user?.email}</p>
          </div>
          <div className="ml-auto hidden sm:flex gap-3">
            <Link to="/orders" className="btn-outline text-sm py-2.5 px-5">My Orders</Link>
            <Link to="/wishlist" className="btn-outline text-sm py-2.5 px-5">Wishlist</Link>
          </div>
        </div>

        {/* Tab nav */}
        <div className="flex gap-1 bg-white rounded-2xl p-1.5 shadow-card mb-8">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-sans transition-all duration-300 ${
                tab === t.key
                  ? 'bg-deep-brown text-cream shadow-sm font-medium'
                  : 'text-warm-gray hover:text-deep-brown hover:bg-cream'
              }`}
            >
              <span>{t.icon}</span>
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {/* ── TAB: PROFILE ── */}
        {tab === 'profile' && (
          <div className="bg-white rounded-2xl shadow-card p-6 animate-fade-in">
            <h2 className="font-serif text-xl text-deep-brown mb-6">Personal Information</h2>
            <form onSubmit={handleProfileSubmit} className="space-y-5 max-w-lg">
              <div>
                <label className="block text-[0.72rem] font-sans font-semibold text-deep-brown uppercase tracking-wide mb-1.5">Full Name</label>
                <input
                  value={profileForm.name}
                  onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))}
                  className="input-luxury"
                  required
                />
              </div>
              <div>
                <label className="block text-[0.72rem] font-sans font-semibold text-deep-brown uppercase tracking-wide mb-1.5">Email Address</label>
                <input
                  value={user?.email || ''}
                  disabled
                  className="input-luxury opacity-50 cursor-not-allowed"
                />
                <p className="text-xs text-taupe font-sans mt-1">Email cannot be changed.</p>
              </div>
              <div>
                <label className="block text-[0.72rem] font-sans font-semibold text-deep-brown uppercase tracking-wide mb-1.5">Phone Number</label>
                <input
                  value={profileForm.phone}
                  onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="10-digit mobile"
                  className="input-luxury"
                  maxLength={10}
                />
              </div>
              <button type="submit" disabled={profileLoading} className="btn-primary disabled:opacity-60">
                {profileLoading ? 'Saving...' : 'Save Changes →'}
              </button>
            </form>
          </div>
        )}

        {/* ── TAB: ADDRESSES ── */}
        {tab === 'addresses' && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-serif text-xl text-deep-brown">Saved Addresses</h2>
                <p className="text-xs font-sans text-taupe mt-0.5">{addresses.length}/5 addresses saved</p>
              </div>
              {addresses.length < 5 && (
                <button
                  onClick={() => { setEditingAddr(null); setShowAddrModal(true); }}
                  className="btn-primary text-sm py-2.5 px-5"
                >
                  + Add Address
                </button>
              )}
            </div>

            {addrLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2].map(i => <div key={i} className="h-48 skeleton rounded-2xl" />)}
              </div>
            ) : addresses.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl shadow-card">
                <span className="text-5xl block mb-4">📍</span>
                <h3 className="font-serif text-xl text-deep-brown mb-2">No saved addresses</h3>
                <p className="text-sm font-sans text-warm-gray mb-6">
                  Add your delivery addresses for faster checkout.
                </p>
                <button
                  onClick={() => { setEditingAddr(null); setShowAddrModal(true); }}
                  className="btn-primary"
                >
                  Add Your First Address
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map(addr => (
                  <AddressCard
                    key={addr._id}
                    address={addr}
                    onEdit={handleEditAddr}
                    onDelete={handleDeleteAddr}
                    onSetDefault={handleSetDefault}
                    deleting={deletingId === addr._id}
                    settingDefault={settingDefaultId === addr._id}
                  />
                ))}

                {/* Add more card */}
                {addresses.length < 5 && (
                  <button
                    onClick={() => { setEditingAddr(null); setShowAddrModal(true); }}
                    className="border-2 border-dashed border-sand rounded-2xl p-5 flex flex-col items-center justify-center gap-2 text-taupe hover:border-taupe hover:text-deep-brown hover:bg-cream/50 transition-all duration-300 min-h-[200px]"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-cream flex items-center justify-center text-2xl">+</div>
                    <p className="text-sm font-sans font-medium">Add Another Address</p>
                    <p className="text-xs font-sans opacity-70">{5 - addresses.length} slot{5 - addresses.length !== 1 ? 's' : ''} remaining</p>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── TAB: SECURITY ── */}
        {tab === 'security' && (
          <div className="bg-white rounded-2xl shadow-card p-6 animate-fade-in max-w-lg">
            <h2 className="font-serif text-xl text-deep-brown mb-6">Change Password</h2>
            <form onSubmit={handlePwSubmit} className="space-y-5">
              {[
                { label: 'Current Password', key: 'currentPassword', show: showPw.current, toggle: () => setShowPw(s => ({ ...s, current: !s.current })) },
                { label: 'New Password', key: 'newPassword', show: showPw.new, toggle: () => setShowPw(s => ({ ...s, new: !s.new })) },
                { label: 'Confirm New Password', key: 'confirmPassword', show: showPw.confirm, toggle: () => setShowPw(s => ({ ...s, confirm: !s.confirm })) },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-[0.72rem] font-sans font-semibold text-deep-brown uppercase tracking-wide mb-1.5">{f.label}</label>
                  <div className="relative">
                    <input
                      type={f.show ? 'text' : 'password'}
                      value={pwForm[f.key]}
                      onChange={e => setPwForm(p => ({ ...p, [f.key]: e.target.value }))}
                      className="input-luxury pr-12"
                      required
                      minLength={f.key !== 'currentPassword' ? 6 : 1}
                    />
                    <button type="button" onClick={f.toggle} className="absolute right-4 top-1/2 -translate-y-1/2 text-taupe hover:text-deep-brown transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </div>
                  {f.key === 'confirmPassword' && pwForm.confirmPassword && pwForm.newPassword !== pwForm.confirmPassword && (
                    <p className="text-xs text-rose-500 font-sans mt-1">Passwords don't match</p>
                  )}
                </div>
              ))}
              <button type="submit" disabled={pwLoading || (pwForm.confirmPassword && pwForm.newPassword !== pwForm.confirmPassword)} className="btn-primary disabled:opacity-60">
                {pwLoading ? 'Updating...' : 'Update Password →'}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Address modal */}
      {showAddrModal && (
        <AddressFormModal
          initial={editingAddr}
          onSave={handleAddrSave}
          onClose={() => { setShowAddrModal(false); setEditingAddr(null); }}
          saving={addrSaving}
        />
      )}
    </div>
  );
};

export default ProfilePage;
