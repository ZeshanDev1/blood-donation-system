'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAdminAuth } from '@/lib/adminAuthContext';
import { API_BASE } from '@/lib/api';

/* ─────────── types ─────────── */
interface Donor {
  _id: string;
  fullName: string;
  qimsId?: string;
  department?: string;
  phone: string;
  email: string;
  gender: string;
  age: number;
  bloodGroup: string;
  city: string;
  area: string;
  availability: string;
  lastDonationDate?: string;
  donationHistory?: any[];
  createdAt: string;
}

/* ─────────── constants ─────────── */
const BLOOD_GROUPS = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];
const GENDERS      = ['male', 'female', 'other'];

const BG_COLORS: Record<string, string> = {
  'O+':  'bg-red-100 text-red-700 border-red-200',
  'O-':  'bg-red-200 text-red-800 border-red-300',
  'A+':  'bg-blue-100 text-blue-700 border-blue-200',
  'A-':  'bg-blue-200 text-blue-800 border-blue-300',
  'B+':  'bg-green-100 text-green-700 border-green-200',
  'B-':  'bg-green-200 text-green-800 border-green-300',
  'AB+': 'bg-purple-100 text-purple-700 border-purple-200',
  'AB-': 'bg-purple-200 text-purple-800 border-purple-300',
};

/* eligibility: last donation must be > 90 days ago (or never donated) AND availability = available */
function getDonorStatus(donor: Donor): { label: string; color: string; dot: string } {
  if (donor.availability === 'unavailable') {
    return { label: 'Unavailable', color: 'bg-slate-100 text-slate-500 border-slate-200', dot: 'bg-slate-400' };
  }
  if (donor.lastDonationDate) {
    const daysSince = (Date.now() - new Date(donor.lastDonationDate).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince < 90) {
      return { label: 'Not Ready', color: 'bg-amber-50 text-amber-600 border-amber-200', dot: 'bg-amber-400' };
    }
  }
  return { label: 'Available', color: 'bg-green-50 text-green-700 border-green-200', dot: 'bg-green-500' };
}

function isAvailableNow(donor: Donor): boolean {
  if (donor.availability === 'unavailable') return false;
  if (!donor.lastDonationDate) return true;
  const daysSince = (Date.now() - new Date(donor.lastDonationDate).getTime()) / (1000 * 60 * 60 * 24);
  return daysSince >= 90;
}

function formatDate(date?: string) {
  if (!date) return '—';
  const d = new Date(date);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function daysSince(date?: string) {
  if (!date) return null;
  return Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
}

/* ─────────── filter chip ─────────── */
function Chip({
  active, onClick, children,
}: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button" onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all ${
        active
          ? 'border-red-600 bg-red-600 text-white shadow-sm'
          : 'border-slate-200 bg-white text-slate-600 hover:border-red-300 hover:text-red-600'
      }`}
    >
      {children}
    </button>
  );
}

/* ─────────── delete confirm modal ─────────── */
function DeleteModal({ name, onConfirm, onCancel }: { name: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-7 shadow-xl">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-2xl mx-auto">🗑️</div>
        <h3 className="mt-4 text-center text-lg font-black text-slate-900">Remove Donor?</h3>
        <p className="mt-2 text-center text-sm text-slate-500">
          This will permanently delete <span className="font-semibold text-slate-800">{name}</span> and all their records.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-bold text-white hover:bg-red-700 transition"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Main page
   ═══════════════════════════════════════════ */
export default function AdminDonorsPage() {
  const { token } = useAdminAuth();
  const [donors, setDonors]     = useState<Donor[]>([]);
  const [loading, setLoading]   = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Donor | null>(null);
  const [deleting, setDeleting] = useState(false);

  /* filters */
  const [search,        setSearch]        = useState('');
  const [bloodGroup,    setBloodGroup]    = useState('');
  const [city,          setCity]          = useState('');
  const [gender,        setGender]        = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);

  const headers = useMemo(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }), [token]);

  /* fetch once */
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetch(`${API_BASE}/api/admin/donors`, { headers })
      .then(r => r.json())
      .then(d => setDonors(d.donors || []))
      .catch(() => setDonors([]))
      .finally(() => setLoading(false));
  }, [token]);

  /* client-side filter */
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return donors.filter(d => {
      if (q && !d.fullName.toLowerCase().includes(q) &&
                !d.email.toLowerCase().includes(q) &&
                !d.phone.includes(q) &&
                !(d.qimsId?.toLowerCase().includes(q))) return false;
      if (bloodGroup && d.bloodGroup !== bloodGroup) return false;
      if (city && !d.city.toLowerCase().includes(city.toLowerCase())) return false;
      if (gender && d.gender !== gender) return false;
      if (availableOnly && !isAvailableNow(d)) return false;
      return true;
    });
  }, [donors, search, bloodGroup, city, gender, availableOnly]);

  /* unique cities for quick filter */
  const cities = useMemo(() => [...new Set(donors.map(d => d.city))].sort(), [donors]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await fetch(`${API_BASE}/api/admin/donors/${deleteTarget._id}`, {
        method: 'DELETE', headers,
      });
      setDonors(prev => prev.filter(d => d._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch {
      alert('Failed to delete. Try again.');
    } finally {
      setDeleting(false);
    }
  };

  const clearFilters = () => {
    setSearch(''); setBloodGroup(''); setCity(''); setGender(''); setAvailableOnly(false);
  };
  const hasFilters = search || bloodGroup || city || gender || availableOnly;

  return (
    <div className="space-y-6">

      {/* ── header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900">Donors</h2>
          <p className="mt-1 text-slate-500">
            {loading ? 'Loading…' : `${filtered.length} of ${donors.length} donors`}
          </p>
        </div>
      </div>

      {/* ── filter panel ── */}
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm space-y-4">

        {/* search row */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
            </svg>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search name, email, phone, QIMS ID…"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-red-400 focus:bg-white focus:ring-2 focus:ring-red-100 transition"
            />
          </div>
          <input
            value={city} onChange={e => setCity(e.target.value)}
            placeholder="Filter by city…"
            className="w-48 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-red-400 focus:bg-white focus:ring-2 focus:ring-red-100 transition"
          />
          {hasFilters && (
            <button onClick={clearFilters} className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-500 hover:bg-slate-50 transition whitespace-nowrap">
              Clear all
            </button>
          )}
        </div>

        {/* chip filters */}
        <div className="flex flex-wrap gap-2">
          {/* blood group */}
          <span className="text-xs font-semibold text-slate-400 self-center mr-1">Blood:</span>
          {BLOOD_GROUPS.map(bg => (
            <Chip key={bg} active={bloodGroup === bg} onClick={() => setBloodGroup(v => v === bg ? '' : bg)}>
              {bg}
            </Chip>
          ))}

          <div className="w-px self-stretch bg-slate-200 mx-1" />

          {/* gender */}
          <span className="text-xs font-semibold text-slate-400 self-center mr-1">Gender:</span>
          {GENDERS.map(g => (
            <Chip key={g} active={gender === g} onClick={() => setGender(v => v === g ? '' : g)}>
              {g.charAt(0).toUpperCase() + g.slice(1)}
            </Chip>
          ))}

          <div className="w-px self-stretch bg-slate-200 mx-1" />

          {/* available now */}
          <Chip active={availableOnly} onClick={() => setAvailableOnly(v => !v)}>
            ✅ Available now
          </Chip>
        </div>
      </div>

      {/* ── table ── */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">

        {/* table header */}
        <div className="border-b border-slate-100 bg-slate-50 px-6 py-4 flex items-center justify-between">
          <h3 className="font-bold text-slate-900">Donor Records</h3>
          <span className="text-xs text-slate-400 font-medium">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
            <span className="animate-pulse">Loading donors…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-4xl mb-3">🔍</div>
            <p className="font-semibold text-slate-700">No donors found</p>
            <p className="text-sm text-slate-400 mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Donor', 'QIMS ID', 'Department', 'Blood Group', 'City / Area', 'Age', 'Gender', 'Last Donation', 'Status', 'Action'].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(donor => {
                  const status  = getDonorStatus(donor);
                  const days    = daysSince(donor.lastDonationDate);
                  const bgClass = BG_COLORS[donor.bloodGroup] ?? 'bg-slate-100 text-slate-600 border-slate-200';
                  return (
                    <tr key={donor._id} className="hover:bg-slate-50/70 transition-colors group">

                      {/* name + email */}
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-900 leading-tight">{donor.fullName}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{donor.email}</p>
                        <p className="text-xs text-slate-400">{donor.phone}</p>
                      </td>

                      {/* QIMS ID */}
                      <td className="px-5 py-4">
                        {donor.qimsId ? (
                          <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-xs font-mono font-semibold text-slate-700 border border-slate-200">
                            {donor.qimsId}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </td>

                      {/* Department */}
                      <td className="px-5 py-4">
                        {donor.department ? (
                          <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 border border-blue-100 whitespace-nowrap">
                            {donor.department}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </td>

                      {/* blood group */}
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-sm font-black ${bgClass}`}>
                          {donor.bloodGroup}
                        </span>
                      </td>

                      {/* city / area */}
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-800">{donor.city}</p>
                        <p className="text-xs text-slate-400">{donor.area}</p>
                      </td>

                      {/* age */}
                      <td className="px-5 py-4 font-semibold text-slate-700">{donor.age} yrs</td>

                      {/* gender */}
                      <td className="px-5 py-4 capitalize text-slate-600">{donor.gender}</td>

                      {/* last donation */}
                      <td className="px-5 py-4">
                        <p className="text-slate-700">{formatDate(donor.lastDonationDate)}</p>
                        {days !== null && (
                          <p className={`text-xs mt-0.5 ${days < 90 ? 'text-amber-500' : 'text-green-600'}`}>
                            {days < 90 ? `${90 - days}d until eligible` : `${days}d ago`}
                          </p>
                        )}
                        {!donor.lastDonationDate && (
                          <p className="text-xs text-slate-400 mt-0.5">First-time donor</p>
                        )}
                      </td>

                      {/* status */}
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${status.color}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                          {status.label}
                        </span>
                      </td>

                      {/* action */}
                      <td className="px-5 py-4">
                        <button
                          onClick={() => setDeleteTarget(donor)}
                          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-all"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── delete confirm modal ── */}
      {deleteTarget && (
        <DeleteModal
          name={deleteTarget.fullName}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
