'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAdminAuth } from '@/lib/adminAuthContext';
import { API_BASE } from '@/lib/api';

/* ─── types ─── */
interface HistoryEntry {
  donorId: string;
  donorName: string;
  donorBloodGroup: string;
  recipientName: string;
  bloodGroup: string;
  donationDate: string;
  hospitalName: string;
  notes: string;
  entryId: string | null;
}

interface DonorOption {
  _id: string;
  fullName: string;
  bloodGroup: string;
}

const BLOOD_GROUPS = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

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

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

/* ─── stat card ─── */
function StatCard({ label, value, sub, accent }: { label: string; value: number; sub?: string; accent: string }) {
  return (
    <div className={`rounded-2xl border ${accent} bg-white p-5 shadow-sm`}>
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</p>
      <p className="mt-1 text-4xl font-black text-slate-900">{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

/* ─── toast ─── */
function Toast({ msg, ok }: { msg: string; ok: boolean }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border px-5 py-3 shadow-xl text-sm font-semibold ${ok ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
      <span>{ok ? '✓' : '✕'}</span> {msg}
    </div>
  );
}

/* ════════════════════════════════════════ */
export default function AdminHistoryPage() {
  const { token } = useAdminAuth();
  const [history, setHistory]       = useState<HistoryEntry[]>([]);
  const [donors, setDonors]         = useState<DonorOption[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast]           = useState<{ msg: string; ok: boolean } | null>(null);

  /* filter state */
  const [search, setSearch]           = useState('');
  const [filterBG, setFilterBG]       = useState('');
  const [filterDate, setFilterDate]   = useState(''); // 'today' | 'week' | 'month' | ''

  /* form state */
  const emptyForm = {
    donorId: '', recipientName: '', bloodGroup: '',
    donationDate: new Date().toISOString().split('T')[0],
    hospitalName: 'QIMS Hospital', notes: '',
  };
  const [form, setForm] = useState(emptyForm);

  const headers = useMemo(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }), [token]);

  /* fetch history + donors */
  useEffect(() => {
    if (!token) return;
    Promise.all([
      fetch(`${API_BASE}/api/admin/history`, { headers }).then(r => r.json()),
      fetch(`${API_BASE}/api/admin/donors`,  { headers }).then(r => r.json()),
    ]).then(([hData, dData]) => {
      setHistory(hData.history || []);
      setDonors(dData.donors  || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [token]);

  /* auto-fill blood group when donor changes */
  useEffect(() => {
    if (form.donorId) {
      const d = donors.find(d => d._id === form.donorId);
      if (d) setForm(f => ({ ...f, bloodGroup: d.bloodGroup }));
    }
  }, [form.donorId, donors]);

  /* filter logic */
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const now = Date.now();
    return history.filter(h => {
      if (q && !h.donorName.toLowerCase().includes(q) &&
               !h.recipientName.toLowerCase().includes(q) &&
               !h.hospitalName.toLowerCase().includes(q)) return false;
      if (filterBG && h.bloodGroup !== filterBG) return false;
      if (filterDate) {
        const ms = new Date(h.donationDate).getTime();
        if (filterDate === 'today') {
          const d = new Date(); d.setHours(0,0,0,0);
          if (ms < d.getTime()) return false;
        } else if (filterDate === 'week') {
          if (now - ms > 7 * 86400000) return false;
        } else if (filterDate === 'month') {
          if (now - ms > 30 * 86400000) return false;
        }
      }
      return true;
    });
  }, [history, search, filterBG, filterDate]);

  /* stats */
  const now = Date.now();
  const todayCount  = history.filter(h => (now - new Date(h.donationDate).getTime()) < 86400000).length;
  const weekCount   = history.filter(h => (now - new Date(h.donationDate).getTime()) < 7 * 86400000).length;
  const monthCount  = history.filter(h => (now - new Date(h.donationDate).getTime()) < 30 * 86400000).length;

  /* submit */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.donorId || !form.bloodGroup || !form.donationDate || !form.hospitalName) {
      setToast({ msg: 'Donor, Blood Group, Date and Hospital are required.', ok: false });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/history`, {
        method: 'POST', headers,
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');

      // re-fetch to get the updated list
      const hRes = await fetch(`${API_BASE}/api/admin/history`, { headers });
      const hData = await hRes.json();
      setHistory(hData.history || []);

      setForm(emptyForm);
      setShowForm(false);
      setToast({ msg: 'Donation entry logged successfully.', ok: true });
    } catch (err: any) {
      setToast({ msg: err.message || 'Something went wrong.', ok: false });
    } finally {
      setSubmitting(false);
      setTimeout(() => setToast(null), 3500);
    }
  };

  return (
    <div className="space-y-6">

      {/* header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-3xl font-black text-slate-900">Donation History</h2>
          <p className="mt-1 text-slate-500">{loading ? 'Loading…' : `${history.length} total entries`}</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-red-700 transition"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Log Donation
        </button>
      </div>

      {/* stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Entries"  value={history.length} accent="border-slate-200" />
        <StatCard label="Today"          value={todayCount}  sub="last 24 h"  accent="border-blue-100" />
        <StatCard label="This Week"      value={weekCount}   sub="last 7 days" accent="border-purple-100" />
        <StatCard label="This Month"     value={monthCount}  sub="last 30 days" accent="border-red-100" />
      </div>

      {/* filter bar */}
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm flex flex-wrap gap-3 items-center">
        {/* search */}
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search donor, recipient, hospital…"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition"
          />
        </div>

        {/* blood group */}
        <select value={filterBG} onChange={e => setFilterBG(e.target.value)}
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-red-400 transition">
          <option value="">All blood groups</option>
          {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
        </select>

        {/* date range */}
        <select value={filterDate} onChange={e => setFilterDate(e.target.value)}
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-red-400 transition">
          <option value="">All time</option>
          <option value="today">Today</option>
          <option value="week">This week</option>
          <option value="month">This month</option>
        </select>

        {(search || filterBG || filterDate) && (
          <button onClick={() => { setSearch(''); setFilterBG(''); setFilterDate(''); }}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-500 hover:bg-slate-50 transition">
            Clear
          </button>
        )}
      </div>

      {/* table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50 px-6 py-4 flex items-center justify-between">
          <h3 className="font-bold text-slate-900">All Entries</h3>
          <span className="text-xs text-slate-400 font-medium">{filtered.length} record{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
            <span className="animate-pulse">Loading history…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-4xl mb-3">📋</div>
            <p className="font-semibold text-slate-700">No entries found</p>
            <p className="text-sm text-slate-400 mt-1">
              {history.length === 0 ? 'Log your first donation entry above.' : 'Try adjusting your filters.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Date', 'Donor', 'Blood Group', 'Recipient', 'Hospital', 'Notes'].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((entry, i) => {
                  const bgClass = BG_COLORS[entry.bloodGroup] ?? 'bg-slate-100 text-slate-600 border-slate-200';
                  return (
                    <tr key={`${entry.donorId}-${i}`} className="hover:bg-slate-50/70 transition-colors">

                      {/* date */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <p className="font-semibold text-slate-800">{formatDate(entry.donationDate)}</p>
                      </td>

                      {/* donor */}
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-900">{entry.donorName}</p>
                        <span className={`mt-1 inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-black ${bgClass}`}>
                          {entry.donorBloodGroup}
                        </span>
                      </td>

                      {/* donated blood group */}
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-sm font-black ${BG_COLORS[entry.bloodGroup] ?? 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                          {entry.bloodGroup}
                        </span>
                      </td>

                      {/* recipient */}
                      <td className="px-5 py-4 text-slate-700">{entry.recipientName || '—'}</td>

                      {/* hospital */}
                      <td className="px-5 py-4 text-slate-600 whitespace-nowrap">{entry.hospitalName}</td>

                      {/* notes */}
                      <td className="px-5 py-4 text-slate-400 max-w-[200px] truncate">{entry.notes || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Log Donation Modal ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden">

            {/* modal header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-5">
              <div>
                <h3 className="text-lg font-black text-slate-900">Log Donation</h3>
                <p className="text-xs text-slate-400 mt-0.5">Record a new donation entry for any registered donor</p>
              </div>
              <button onClick={() => setShowForm(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 transition">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">

              {/* donor select */}
              <div>
                <label className="block mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Donor <span className="text-red-500">*</span>
                </label>
                <select value={form.donorId} onChange={e => setForm(f => ({ ...f, donorId: e.target.value }))} required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition">
                  <option value="">Select donor…</option>
                  {donors.map(d => (
                    <option key={d._id} value={d._id}>{d.fullName} — {d.bloodGroup}</option>
                  ))}
                </select>
              </div>

              {/* blood group + date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Blood Group Donated <span className="text-red-500">*</span>
                  </label>
                  <select value={form.bloodGroup} onChange={e => setForm(f => ({ ...f, bloodGroup: e.target.value }))} required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition">
                    <option value="">Select…</option>
                    {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Donation Date <span className="text-red-500">*</span>
                  </label>
                  <input type="date" value={form.donationDate}
                    onChange={e => setForm(f => ({ ...f, donationDate: e.target.value }))} required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition"
                  />
                </div>
              </div>

              {/* hospital */}
              <div>
                <label className="block mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Hospital / Venue <span className="text-red-500">*</span>
                </label>
                <input type="text" value={form.hospitalName}
                  onChange={e => setForm(f => ({ ...f, hospitalName: e.target.value }))} required
                  placeholder="QIMS Hospital"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition"
                />
              </div>

              {/* recipient (optional) */}
              <div>
                <label className="block mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Recipient Name <span className="text-slate-300 font-normal normal-case">(optional)</span>
                </label>
                <input type="text" value={form.recipientName}
                  onChange={e => setForm(f => ({ ...f, recipientName: e.target.value }))}
                  placeholder="Patient / recipient name"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition"
                />
              </div>

              {/* notes */}
              <div>
                <label className="block mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Notes <span className="text-slate-300 font-normal normal-case">(optional)</span>
                </label>
                <textarea rows={2} value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Any additional remarks…"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition resize-none"
                />
              </div>

              {/* actions */}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-bold text-white hover:bg-red-700 transition disabled:opacity-60">
                  {submitting ? 'Saving…' : 'Save Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* toast */}
      {toast && <Toast msg={toast.msg} ok={toast.ok} />}
    </div>
  );
}
