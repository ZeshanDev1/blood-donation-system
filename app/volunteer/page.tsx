'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BrandMark } from '@/components/BrandMark';
import { API_BASE } from '@/lib/api';

const SKILLS = [
  'Event Management',
  'Social Media',
  'Public Speaking',
  'Medical Support',
  'Fundraising',
  'Other',
];

export default function VolunteerPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    city: '',
    gender: '',
    age: '',
    occupation: '',
    skills: [] as string[],
    previousExperience: '' as '' | 'yes' | 'no',
    organizationName: '',
    consent: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState(false);

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const toggleSkill = (skill: string) =>
    setForm(f => ({
      ...f,
      skills: f.skills.includes(skill) ? f.skills.filter(s => s !== skill) : [...f.skills, skill],
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.gender)                   { setError('Please select your gender.'); return; }
    if (form.skills.length === 0)       { setError('Please select at least one skill.'); return; }
    if (!form.previousExperience)       { setError('Please answer the volunteering experience question.'); return; }
    if (!form.consent)                  { setError('You must agree to the consent terms.'); return; }
    const ageNum = Number(form.age);
    if (isNaN(ageNum) || ageNum < 16)   { setError('Age must be 16 or above.'); return; }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/public/volunteers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          age: ageNum,
          previousExperience: form.previousExperience === 'yes',
          consent: form.consent,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed.');
      setSuccess(true);
      setTimeout(() => router.push('/'), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full px-4 py-3 rounded-xl border border-red-600/25 bg-gray-900/60 text-white placeholder:text-gray-500 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-600/25 transition";
  const labelCls = "block text-sm font-semibold text-white mb-1.5";
  const sectionHdg = "text-xs font-bold uppercase tracking-widest text-red-500 mb-4 pb-1 border-b border-red-600/15";

  if (success) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center space-y-5 max-w-sm">
          <div className="mx-auto h-20 w-20 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center text-4xl">🎉</div>
          <h2 className="text-3xl font-black text-white">Application Submitted!</h2>
          <p className="text-gray-400 leading-relaxed">
            Thank you for volunteering with QBDS. Our team will review your application and reach out soon.
          </p>
          <p className="text-xs text-gray-600">Redirecting you home in a moment…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* bg glows */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-red-600/8 rounded-full blur-3xl" />
      </div>

      <div className="max-w-2xl mx-auto px-4 py-12">

        {/* header */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex justify-center mb-6 hover:opacity-90 transition">
            <BrandMark compact />
          </Link>
          <div className="inline-flex items-center gap-2 rounded-full border border-red-600/30 bg-red-600/10 px-4 py-1.5 text-xs font-semibold text-red-400 mb-4">
            🙋 Join the Mission
          </div>
          <h1 className="text-4xl font-black text-white mb-3">Volunteer Registration</h1>
          <p className="text-gray-400 text-sm max-w-md mx-auto leading-relaxed">
            Help us save lives — from organising drives to raising awareness. Every hour you give makes a difference.
          </p>
        </div>

        {/* form card */}
        <div className="bg-black/70 border border-red-600/20 rounded-2xl p-5 sm:p-8 backdrop-blur-xl shadow-2xl space-y-8">
          <form onSubmit={handleSubmit} className="space-y-8">

            {error && (
              <div className="flex items-start gap-3 rounded-xl border border-red-600/40 bg-red-600/12 px-4 py-3 text-sm text-red-400">
                <span className="text-base mt-0.5 shrink-0">⚠️</span> {error}
              </div>
            )}

            {/* ── Personal Information ── */}
            <div>
              <p className={sectionHdg}>Personal Information</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className={labelCls}>Full Name <span className="text-red-500">*</span></label>
                  <input name="fullName" value={form.fullName} onChange={handle} required
                    placeholder="e.g. Ahmed Khan" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Email Address <span className="text-red-500">*</span></label>
                  <input name="email" type="email" value={form.email} onChange={handle} required
                    placeholder="you@example.com" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Phone Number <span className="text-red-500">*</span></label>
                  <input name="phone" value={form.phone} onChange={handle} required
                    placeholder="+92 300 0000000" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>City <span className="text-red-500">*</span></label>
                  <input name="city" value={form.city} onChange={handle} required
                    placeholder="Quetta" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Gender <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Male', 'Female', 'Other', 'Prefer not to say'].map(g => (
                      <button key={g} type="button"
                        onClick={() => setForm(f => ({ ...f, gender: g }))}
                        className={`rounded-xl border py-2.5 text-sm font-semibold transition-all ${
                          form.gender === g
                            ? 'border-red-500 bg-red-600/20 text-red-400 ring-1 ring-red-500/40'
                            : 'border-red-600/20 bg-gray-900/40 text-gray-400 hover:border-red-600/40'
                        }`}>
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Age <span className="text-red-500">*</span></label>
                  <input name="age" type="number" min={16} max={80} value={form.age} onChange={handle} required
                    placeholder="e.g. 22" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Occupation <span className="text-red-500">*</span></label>
                  <input name="occupation" value={form.occupation} onChange={handle} required
                    placeholder="e.g. Medical Student, Teacher…" className={inputCls} />
                </div>
              </div>
            </div>

            {/* ── Skills ── */}
            <div>
              <p className={sectionHdg}>Skills <span className="text-red-500">*</span></p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {SKILLS.map(skill => {
                  const active = form.skills.includes(skill);
                  return (
                    <button key={skill} type="button" onClick={() => toggleSkill(skill)}
                      className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-all ${
                        active
                          ? 'border-red-500 bg-red-600/15 ring-1 ring-red-500/30'
                          : 'border-red-600/20 bg-gray-900/40 hover:border-red-600/35 hover:bg-red-600/8'
                      }`}>
                      <span className={`text-sm font-semibold ${active ? 'text-red-400' : 'text-gray-300'}`}>{skill}</span>
                      <span className={`h-4 w-4 shrink-0 rounded-full border-2 transition ${active ? 'border-red-500 bg-red-500' : 'border-gray-600'}`} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Experience ── */}
            <div>
              <p className={sectionHdg}>Volunteering Experience</p>
              <label className={labelCls}>Previous Volunteering Experience? <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[{ val: 'yes', label: '✅ Yes' }, { val: 'no', label: '❌ No' }].map(opt => (
                  <button key={opt.val} type="button"
                    onClick={() => setForm(f => ({ ...f, previousExperience: opt.val as 'yes' | 'no', organizationName: opt.val === 'no' ? '' : f.organizationName }))}
                    className={`rounded-xl border py-3 text-sm font-semibold transition-all ${
                      form.previousExperience === opt.val
                        ? 'border-red-500 bg-red-600/20 text-red-400 ring-1 ring-red-500/40'
                        : 'border-red-600/20 bg-gray-900/40 text-gray-300 hover:border-red-600/40'
                    }`}>
                    {opt.label}
                  </button>
                ))}
              </div>

              {form.previousExperience === 'yes' && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                  <label className={labelCls}>Organization Name</label>
                  <input name="organizationName" value={form.organizationName} onChange={handle}
                    placeholder="e.g. Red Crescent, EDHI Foundation…" className={inputCls} />
                </div>
              )}
            </div>

            {/* ── Consent ── */}
            <div className="rounded-xl border border-red-600/20 bg-red-600/5 p-4">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <div className="relative mt-0.5 shrink-0">
                  <input type="checkbox" name="consent" checked={form.consent}
                    onChange={handle}
                    className="sr-only peer" />
                  <div className={`h-5 w-5 rounded border-2 transition-all flex items-center justify-center ${form.consent ? 'border-red-500 bg-red-500' : 'border-gray-600 bg-transparent'}`}>
                    {form.consent && (
                      <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-sm text-gray-300 leading-relaxed">
                  <span className="text-red-400 font-semibold">*</span> I agree to volunteer for blood donation campaigns and allow my information to be used for volunteer management purposes by QIMS Blood Donors Society.
                </span>
              </label>
            </div>

            <button type="submit" disabled={loading}
              className="w-full rounded-xl bg-red-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-red-600/30 hover:bg-red-700 hover:shadow-red-600/50 hover:scale-[1.01] transition-all disabled:opacity-60 disabled:scale-100">
              {loading ? 'Submitting…' : 'Submit Application →'}
            </button>
          </form>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-gray-500 hover:text-red-400 transition">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
