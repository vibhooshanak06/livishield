import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import {
  User, Mail, Phone, Calendar, MapPin,
  Shield, Lock, CheckCircle, AlertCircle, Loader2, Eye, EyeOff
} from 'lucide-react';
import '../styles/theme.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const token = () => localStorage.getItem('liveshield_token');

const Field = ({ label, icon: Icon, children }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
      {Icon && <Icon className="h-3.5 w-3.5" />}{label}
    </label>
    {children}
  </div>
);

const inputCls = (err) =>
  `w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-colors ${
    err ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200 focus:border-blue-400'
  }`;

const Profile = () => {
  const { user, login } = useAuth();

  /* ── Profile form ── */
  const [profile, setProfile] = useState({
    firstName: user?.firstName || '',
    lastName:  user?.lastName  || '',
    phone:     user?.phone     || '',
    dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
    address:   user?.address   || '',
  });
  const [profileErrors,  setProfileErrors]  = useState({});
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg,     setProfileMsg]     = useState(null); // {type, text}

  /* ── Password form ── */
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passErrors,  setPassErrors]  = useState({});
  const [passLoading, setPassLoading] = useState(false);
  const [passMsg,     setPassMsg]     = useState(null);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew,     setShowNew]     = useState(false);

  const setP = (k, v) => { setProfile(prev => ({ ...prev, [k]: v })); setProfileErrors(prev => ({ ...prev, [k]: '' })); };
  const setPw = (k, v) => { setPasswords(prev => ({ ...prev, [k]: v })); setPassErrors(prev => ({ ...prev, [k]: '' })); };

  /* ── Profile validation ── */
  const validateProfile = () => {
    const e = {};
    if (!profile.firstName.trim()) e.firstName = 'Required';
    if (!profile.lastName.trim())  e.lastName  = 'Required';
    if (profile.phone && !/^[6-9]\d{9}$/.test(profile.phone.replace(/\D/g, '')))
      e.phone = 'Enter a valid 10-digit mobile number';
    return e;
  };

  /* ── Password validation ── */
  const validatePass = () => {
    const e = {};
    if (!passwords.currentPassword) e.currentPassword = 'Required';
    if (!passwords.newPassword) e.newPassword = 'Required';
    else if (passwords.newPassword.length < 8) e.newPassword = 'Minimum 8 characters';
    if (passwords.newPassword !== passwords.confirmPassword) e.confirmPassword = 'Passwords do not match';
    return e;
  };

  /* ── Submit profile ── */
  const handleProfileSave = async (e) => {
    e.preventDefault();
    const errs = validateProfile();
    if (Object.keys(errs).length) { setProfileErrors(errs); return; }
    setProfileLoading(true); setProfileMsg(null);
    try {
      const res = await fetch(`${API}/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update profile');
      // Update stored user & context
      const updated = { ...user, ...data.data };
      localStorage.setItem('liveshield_user', JSON.stringify(updated));
      login(updated);
      setProfileMsg({ type: 'success', text: 'Profile updated successfully.' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.message });
    } finally {
      setProfileLoading(false);
    }
  };

  /* ── Submit password ── */
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const errs = validatePass();
    if (Object.keys(errs).length) { setPassErrors(errs); return; }
    setPassLoading(true); setPassMsg(null);
    try {
      const res = await fetch(`${API}/auth/change-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to change password');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPassMsg({ type: 'success', text: 'Password changed successfully.' });
    } catch (err) {
      setPassMsg({ type: 'error', text: err.message });
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <section className="livishield-gradient-bg text-white py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/40 shrink-0">
              <span className="text-2xl font-bold text-white">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user?.firstName} {user?.lastName}</h1>
              <p className="text-white/80 text-sm">{user?.email}</p>
              <Badge className="mt-1 bg-white/20 text-white border-white/30 text-xs capitalize">
                {user?.role || 'customer'}
              </Badge>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* ── Profile Information ── */}
        <Card className="livishield-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-5 pb-3 border-b">
              <User className="h-5 w-5 livishield-text-accent" />
              <h2 className="text-base font-semibold livishield-text-primary">Profile Information</h2>
            </div>

            {profileMsg && (
              <Alert variant={profileMsg.type === 'error' ? 'destructive' : 'default'} className="mb-4">
                <div className="flex items-center gap-2">
                  {profileMsg.type === 'success'
                    ? <CheckCircle className="h-4 w-4 text-green-600" />
                    : <AlertCircle className="h-4 w-4" />}
                  <AlertDescription>{profileMsg.text}</AlertDescription>
                </div>
              </Alert>
            )}

            <form onSubmit={handleProfileSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="First Name" icon={User}>
                  <input
                    type="text" value={profile.firstName}
                    onChange={e => setP('firstName', e.target.value)}
                    className={inputCls(profileErrors.firstName)}
                    placeholder="First name"
                  />
                  {profileErrors.firstName && <p className="text-xs text-red-600 mt-0.5">{profileErrors.firstName}</p>}
                </Field>

                <Field label="Last Name" icon={User}>
                  <input
                    type="text" value={profile.lastName}
                    onChange={e => setP('lastName', e.target.value)}
                    className={inputCls(profileErrors.lastName)}
                    placeholder="Last name"
                  />
                  {profileErrors.lastName && <p className="text-xs text-red-600 mt-0.5">{profileErrors.lastName}</p>}
                </Field>

                <Field label="Email Address" icon={Mail}>
                  <input
                    type="email" value={user?.email || ''}
                    disabled
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-400 mt-0.5">Email cannot be changed</p>
                </Field>

                <Field label="Phone Number" icon={Phone}>
                  <input
                    type="tel" value={profile.phone}
                    onChange={e => setP('phone', e.target.value)}
                    className={inputCls(profileErrors.phone)}
                    placeholder="10-digit mobile number"
                  />
                  {profileErrors.phone && <p className="text-xs text-red-600 mt-0.5">{profileErrors.phone}</p>}
                </Field>

                <Field label="Date of Birth" icon={Calendar}>
                  <input
                    type="date" value={profile.dateOfBirth}
                    onChange={e => setP('dateOfBirth', e.target.value)}
                    className={inputCls(false)}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </Field>
              </div>

              <Field label="Address" icon={MapPin}>
                <textarea
                  value={profile.address}
                  onChange={e => setP('address', e.target.value)}
                  className={inputCls(false)}
                  rows={2}
                  placeholder="Your full address"
                />
              </Field>

              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={profileLoading} className="livishield-btn-primary gap-2">
                  {profileLoading
                    ? <><Loader2 className="h-4 w-4 animate-spin" />Saving...</>
                    : <><CheckCircle className="h-4 w-4" />Save Changes</>}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* ── Change Password ── */}
        <Card className="livishield-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-5 pb-3 border-b">
              <Lock className="h-5 w-5 livishield-text-accent" />
              <h2 className="text-base font-semibold livishield-text-primary">Change Password</h2>
            </div>

            {passMsg && (
              <Alert variant={passMsg.type === 'error' ? 'destructive' : 'default'} className="mb-4">
                <div className="flex items-center gap-2">
                  {passMsg.type === 'success'
                    ? <CheckCircle className="h-4 w-4 text-green-600" />
                    : <AlertCircle className="h-4 w-4" />}
                  <AlertDescription>{passMsg.text}</AlertDescription>
                </div>
              </Alert>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
              <Field label="Current Password" icon={Lock}>
                <div className="relative">
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    value={passwords.currentPassword}
                    onChange={e => setPw('currentPassword', e.target.value)}
                    className={inputCls(passErrors.currentPassword) + ' pr-10'}
                    placeholder="Enter current password"
                  />
                  <button type="button" onClick={() => setShowCurrent(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passErrors.currentPassword && <p className="text-xs text-red-600 mt-0.5">{passErrors.currentPassword}</p>}
              </Field>

              <Field label="New Password" icon={Lock}>
                <div className="relative">
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={passwords.newPassword}
                    onChange={e => setPw('newPassword', e.target.value)}
                    className={inputCls(passErrors.newPassword) + ' pr-10'}
                    placeholder="Minimum 8 characters"
                  />
                  <button type="button" onClick={() => setShowNew(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passErrors.newPassword && <p className="text-xs text-red-600 mt-0.5">{passErrors.newPassword}</p>}
                {passwords.newPassword && passwords.newPassword.length >= 8 && (
                  <div className="flex items-center gap-1 mt-1">
                    <div className={`h-1 flex-1 rounded-full ${passwords.newPassword.length >= 12 ? 'bg-green-500' : 'bg-yellow-400'}`} />
                    <span className="text-xs text-gray-400">{passwords.newPassword.length >= 12 ? 'Strong' : 'Fair'}</span>
                  </div>
                )}
              </Field>

              <Field label="Confirm New Password" icon={Lock}>
                <input
                  type="password"
                  value={passwords.confirmPassword}
                  onChange={e => setPw('confirmPassword', e.target.value)}
                  className={inputCls(passErrors.confirmPassword)}
                  placeholder="Repeat new password"
                />
                {passErrors.confirmPassword && <p className="text-xs text-red-600 mt-0.5">{passErrors.confirmPassword}</p>}
              </Field>

              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={passLoading} className="livishield-btn-primary gap-2">
                  {passLoading
                    ? <><Loader2 className="h-4 w-4 animate-spin" />Updating...</>
                    : <><Lock className="h-4 w-4" />Update Password</>}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* ── Account Info (read-only) ── */}
        <Card className="livishield-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b">
              <Shield className="h-5 w-5 livishield-text-accent" />
              <h2 className="text-base font-semibold livishield-text-primary">Account Details</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500">Account Role</span>
                <Badge className="text-xs capitalize bg-blue-100 text-blue-700 border-blue-200">{user?.role || 'customer'}</Badge>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500">Verification</span>
                <Badge className="text-xs bg-green-100 text-green-700 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />Verified
                </Badge>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500">Member Since</span>
                <span className="font-medium livishield-text-primary">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
                    : '—'}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500">User ID</span>
                <span className="font-mono text-xs text-gray-400">{user?.id}</span>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default Profile;
