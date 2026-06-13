'use client';

import { useState, useEffect } from 'react';
import { useAdminAuth } from '@/lib/adminAuthContext';
import { API_BASE } from '@/lib/api';

/* ── Eye toggle icon ── */
function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.97 9.97 0 012.19-3.583M6.53 6.53A9.97 9.97 0 0112 5c4.477 0 8.268 2.943 9.542 7a9.97 9.97 0 01-1.357 2.645M6.53 6.53L3 3m3.53 3.53l11.94 11.94" />
    </svg>
  );
}

/* ── Reusable styled input ── */
function Field({
  id, label, hint, children,
}: { id?: string; label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-semibold text-slate-700">
          {label}
        </label>
      )}
      {children}
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

/* ── Text input ── */
function TextInput({
  id, name, value, onChange, placeholder, disabled, required,
}: {
  id?: string; name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; disabled?: boolean; required?: boolean;
}) {
  return (
    <input
      id={id} name={name} type="text" value={value} onChange={onChange}
      placeholder={placeholder} disabled={disabled} required={required}
      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-red-400 focus:bg-white focus:ring-2 focus:ring-red-100 disabled:opacity-50"
    />
  );
}

/* ── Password input with toggle ── */
function PasswordInput({
  id, name, value, onChange, placeholder, disabled,
}: {
  id?: string; name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; disabled?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id={id} name={name} type={show ? 'text' : 'password'}
        value={value} onChange={onChange} placeholder={placeholder} disabled={disabled}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 pr-11 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-red-400 focus:bg-white focus:ring-2 focus:ring-red-100 disabled:opacity-50"
      />
      <button
        type="button" tabIndex={-1} onClick={() => setShow(v => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 transition"
      >
        <EyeIcon open={show} />
      </button>
    </div>
  );
}

/* ── Password strength bar ── */
function StrengthBar({ password }: { password: string }) {
  const score = (() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 8)  s++;
    if (password.length >= 12) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();
  const labels = ['', 'Very weak', 'Weak', 'Fair', 'Strong', 'Very strong'];
  const barColor = ['', 'bg-red-500', 'bg-orange-400', 'bg-yellow-400', 'bg-green-400', 'bg-green-500'][score];
  const textColor = ['', 'text-red-500', 'text-orange-500', 'text-yellow-600', 'text-green-600', 'text-green-600'][score];
  if (!password) return null;
  return (
    <div className="space-y-1.5 pt-0.5">
      <div className="flex gap-1">
        {[1,2,3,4,5].map(i => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= score ? barColor : 'bg-slate-200'}`} />
        ))}
      </div>
      <p className={`text-xs font-semibold ${textColor}`}>{labels[score]}</p>
    </div>
  );
}

/* ── Inline alert ── */
function Alert({ type, message }: { type: 'success' | 'error'; message: string }) {
  const isSuccess = type === 'success';
  return (
    <div className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium ${
      isSuccess ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-600'
    }`}>
      <span className="shrink-0 text-base leading-5">{isSuccess ? '✓' : '⚠'}</span>
      <span>{message}</span>
    </div>
  );
}

/* ── Section card wrapper ── */
function Card({ icon, title, subtitle, children }: {
  icon: React.ReactNode; title: string; subtitle: string; children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* card header */}
      <div className="flex items-center gap-4 border-b border-slate-100 bg-slate-50/60 px-7 py-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-600 text-white shadow-sm shadow-red-200">
          {icon}
        </div>
        <div>
          <p className="font-bold text-slate-900 leading-tight">{title}</p>
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        </div>
      </div>
      {/* card body */}
      <div className="px-7 py-7">{children}</div>
    </div>
  );
}

/* ════════════════════════════════════════════
   Main page
   ════════════════════════════════════════════ */
export default function AdminSettingsPage() {
  const { token, admin, logout } = useAdminAuth();

  const [currentUsername, setCurrentUsername] = useState(admin?.username ?? '');

  /* username form */
  const [unForm, setUnForm]   = useState({ newUsername: '', currentPassword: '' });
  const [unSaving, setUnSaving] = useState(false);
  const [unMsg, setUnMsg]     = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  /* password form */
  const [pwForm, setPwForm]   = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg]     = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/api/admin/settings/profile`, { headers })
      .then(r => r.json())
      .then(d => { if (d.admin?.username) setCurrentUsername(d.admin.username); })
      .catch(() => {});
  }, [token]);

  /* submit username */
  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUnMsg(null);
    setUnSaving(true);
    try {
      const res  = await fetch(`${API_BASE}/api/admin/settings/username`, { method: 'PATCH', headers, body: JSON.stringify(unForm) });
      const data = await res.json();
      if (!res.ok) { setUnMsg({ type: 'error', text: data.error }); return; }
      setCurrentUsername(data.username);
      setUnMsg({ type: 'success', text: 'Username updated! Logging you out…' });
      setUnForm({ newUsername: '', currentPassword: '' });
      setTimeout(() => logout(), 2000);
    } catch {
      setUnMsg({ type: 'error', text: 'Request failed. Please try again.' });
    } finally {
      setUnSaving(false);
    }
  };

  /* submit password */
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg(null);
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwMsg({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }
    setPwSaving(true);
    try {
      const res  = await fetch(`${API_BASE}/api/admin/settings/password`, { method: 'PATCH', headers, body: JSON.stringify(pwForm) });
      const data = await res.json();
      if (!res.ok) { setPwMsg({ type: 'error', text: data.error }); return; }
      setPwMsg({ type: 'success', text: 'Password changed! Logging you out…' });
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => logout(), 2000);
    } catch {
      setPwMsg({ type: 'error', text: 'Request failed. Please try again.' });
    } finally {
      setPwSaving(false);
    }
  };

  const pwMatch = pwForm.confirmPassword && pwForm.newPassword;

  return (
    <div className="space-y-7">

      {/* ── Page title + account badge ── */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900">Settings</h2>
          <p className="mt-1 text-slate-500">Manage your admin account credentials.</p>
        </div>

        {/* Account badge */}
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 shadow-sm self-start sm:self-auto">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-700 text-base font-black text-white shadow shadow-red-200">
            {currentUsername.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Signed in as</p>
            <p className="truncate text-sm font-black text-slate-900">@{currentUsername}</p>
          </div>
          <span className="ml-3 inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-600">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            Active
          </span>
        </div>
      </div>

      {/* ── Two-column grid ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* ── Update Username ── */}
        <Card
          title="Update Username"
          subtitle="Change your admin login name"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
        >
          <form onSubmit={handleUsernameSubmit} className="flex h-full flex-col gap-5">
            {unMsg && <Alert type={unMsg.type} message={unMsg.text} />}

            <Field id="newUsername" label="New Username" hint="Letters, numbers and underscores only · min 3 chars">
              <TextInput
                id="newUsername" name="newUsername"
                value={unForm.newUsername}
                onChange={e => setUnForm(p => ({ ...p, newUsername: e.target.value }))}
                placeholder="e.g. admin_john"
                disabled={unSaving}
                required
              />
            </Field>

            <Field id="unCurrentPw" label="Confirm with Current Password">
              <PasswordInput
                id="unCurrentPw" name="currentPassword"
                value={unForm.currentPassword}
                onChange={e => setUnForm(p => ({ ...p, currentPassword: e.target.value }))}
                placeholder="Enter your current password"
                disabled={unSaving}
              />
            </Field>

            <div className="mt-auto pt-2">
              <button
                type="submit" disabled={unSaving}
                className="w-full rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm shadow-red-200 transition hover:bg-red-700 active:scale-[0.98] disabled:opacity-60"
              >
                {unSaving ? 'Updating…' : 'Update Username'}
              </button>
            </div>
          </form>
        </Card>

        {/* ── Change Password ── */}
        <Card
          title="Change Password"
          subtitle="Use a strong password · min 8 characters"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          }
        >
          <form onSubmit={handlePasswordSubmit} className="flex h-full flex-col gap-5">
            {pwMsg && <Alert type={pwMsg.type} message={pwMsg.text} />}

            <Field id="currentPw" label="Current Password">
              <PasswordInput
                id="currentPw" name="currentPassword"
                value={pwForm.currentPassword}
                onChange={e => setPwForm(p => ({ ...p, currentPassword: e.target.value }))}
                placeholder="Enter your current password"
                disabled={pwSaving}
              />
            </Field>

            <Field id="newPw" label="New Password">
              <PasswordInput
                id="newPw" name="newPassword"
                value={pwForm.newPassword}
                onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))}
                placeholder="At least 8 characters"
                disabled={pwSaving}
              />
              <StrengthBar password={pwForm.newPassword} />
            </Field>

            <Field id="confirmPw" label="Confirm New Password">
              <PasswordInput
                id="confirmPw" name="confirmPassword"
                value={pwForm.confirmPassword}
                onChange={e => setPwForm(p => ({ ...p, confirmPassword: e.target.value }))}
                placeholder="Repeat new password"
                disabled={pwSaving}
              />
              {pwMatch && (
                <p className={`text-xs font-semibold ${pwForm.newPassword === pwForm.confirmPassword ? 'text-green-600' : 'text-red-500'}`}>
                  {pwForm.newPassword === pwForm.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                </p>
              )}
            </Field>

            <div className="mt-auto pt-2">
              <button
                type="submit" disabled={pwSaving}
                className="w-full rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm shadow-red-200 transition hover:bg-red-700 active:scale-[0.98] disabled:opacity-60"
              >
                {pwSaving ? 'Changing…' : 'Change Password'}
              </button>
            </div>
          </form>
        </Card>

      </div>

      {/* ── Security note ── */}
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-500">
        <span className="text-lg shrink-0">🔒</span>
        You will be logged out automatically after saving any credential change.
      </div>

    </div>
  );
}
