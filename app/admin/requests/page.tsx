'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAdminAuth } from '@/lib/adminAuthContext';
import { API_BASE } from '@/lib/api';

/* ─────────── types ─────────── */
interface RequestItem {
  _id: string;
  recipientName: string;
  qimsId?: string;
  age?: number;
  gender?: string;
  department?: string;
  contactNumber: string;
  bloodGroup: string;
  unitsRequired: number;
  hospitalName: string;
  city: string;
  area?: string;
  urgency: string;
  status: string;
  createdAt: string;
  assignedDonor?: any;
}

interface Donor {
  _id: string;
  fullName: string;
  bloodGroup: string;
  city: string;
  area: string;
  age: number;
  gender: string;
  phone: string;
  availability: string;
  lastDonationDate?: string;
}

/* ─────────── helpers ─────────── */
const BLOOD_GROUPS = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

const URGENCY_STYLE: Record<string, string> = {
  high:   'bg-red-50 text-red-700 border-red-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  low:    'bg-green-50 text-green-700 border-green-200',
};
const URGENCY_DOT: Record<string, string> = {
  high: 'bg-red-500', medium: 'bg-amber-400', low: 'bg-green-500',
};

const BG_COLORS: Record<string, string> = {
  'O+': 'bg-red-100 text-red-700 border-red-200',
  'O-': 'bg-red-200 text-red-800 border-red-300',
  'A+': 'bg-blue-100 text-blue-700 border-blue-200',
  'A-': 'bg-blue-200 text-blue-800 border-blue-300',
  'B+': 'bg-green-100 text-green-700 border-green-200',
  'B-': 'bg-green-200 text-green-800 border-green-300',
  'AB+':'bg-purple-100 text-purple-700 border-purple-200',
  'AB-':'bg-purple-200 text-purple-800 border-purple-300',
};

function isAvailable(d: Donor) {
  if (d.availability === 'unavailable') return false;
  if (!d.lastDonationDate) return true;
  const days = (Date.now() - new Date(d.lastDonationDate).getTime()) / 86400000;
  return days >= 90;
}

function formatDate(s?: string) {
  if (!s) return '—';
  return new Date(s).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function timeAgo(s?: string) {
  if (!s) return '';
  const mins = Math.floor((Date.now() - new Date(s).getTime()) / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

/* ─────────── Chip ─────────── */
function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all ${
        active ? 'border-red-600 bg-red-600 text-white shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:border-red-300 hover:text-red-600'
      }`}>
      {children}
    </button>
  );
}

/* ─────────── Delete Confirm ─────────── */
function DeleteModal({ name, onConfirm, onCancel }: { name: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-7 shadow-2xl">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-2xl">🗑️</div>
        <h3 className="mt-4 text-center text-lg font-black text-slate-900">Delete Request?</h3>
        <p className="mt-2 text-center text-sm text-slate-500">
          This will permanently remove the request from <span className="font-semibold text-slate-800">{name}</span>.
        </p>
        <div className="mt-6 flex gap-3">
          <button onClick={onCancel} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">Cancel</button>
          <button onClick={onConfirm} className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-bold text-white hover:bg-red-700 transition">Delete</button>
        </div>
      </div>
    </div>
  );
}

/* ─────────── Assign Modal ─────────── */
function AssignModal({
  request, donors, onAssign, onClose,
}: {
  request: RequestItem;
  donors: Donor[];
  onAssign: (donorId: string) => Promise<void>;
  onClose: () => void;
}) {
  const [search, setSearch]       = useState('');
  const [selected, setSelected]   = useState('');
  const [assigning, setAssigning] = useState(false);
  const [showAll, setShowAll]     = useState(false);

  const matched = useMemo(() => {
    const q = search.toLowerCase();
    return donors.filter(d => {
      const matchGroup = showAll || d.bloodGroup === request.bloodGroup;
      const matchSearch = !q || d.fullName.toLowerCase().includes(q) || d.city.toLowerCase().includes(q);
      return matchGroup && matchSearch;
    });
  }, [donors, search, showAll, request.bloodGroup]);

  // available donors first, then not-ready
  const sorted = useMemo(() =>
    [...matched].sort((a, b) => (isAvailable(b) ? 1 : 0) - (isAvailable(a) ? 1 : 0)),
    [matched]
  );

  const handleAssign = async () => {
    if (!selected) return;
    setAssigning(true);
    await onAssign(selected);
    setAssigning(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl flex flex-col max-h-[90vh]">

        {/* header */}
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h3 className="text-xl font-black text-slate-900">Assign Donor</h3>
            <p className="mt-0.5 text-sm text-slate-500">
              For <span className="font-semibold text-slate-800">{request.recipientName}</span> — needs{' '}
              <span className={`inline-block rounded-md border px-2 py-0.5 text-xs font-black ${BG_COLORS[request.bloodGroup]}`}>{request.bloodGroup}</span>
              {' '}· {request.unitsRequired} unit{request.unitsRequired > 1 ? 's' : ''}
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* filters */}
        <div className="border-b border-slate-100 px-6 py-4 space-y-3">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
              </svg>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search donor name or city…"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-red-400 focus:bg-white focus:ring-2 focus:ring-red-100 transition" />
            </div>
            <button onClick={() => setShowAll(v => !v)}
              className={`rounded-xl border px-4 py-2.5 text-xs font-semibold transition whitespace-nowrap ${showAll ? 'border-red-600 bg-red-600 text-white' : 'border-slate-200 text-slate-600 hover:border-red-300'}`}>
              {showAll ? 'All groups' : `${request.bloodGroup} only`}
            </button>
          </div>
          <p className="text-xs text-slate-400">{sorted.length} donor{sorted.length !== 1 ? 's' : ''} found</p>
        </div>

        {/* donor list */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-50 px-3 py-2">
          {sorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="text-3xl mb-2">🔍</div>
              <p className="text-sm font-semibold text-slate-600">No matching donors</p>
              <button onClick={() => setShowAll(true)} className="mt-2 text-xs text-red-600 underline">Show all blood groups</button>
            </div>
          ) : sorted.map(d => {
            const avail = isAvailable(d);
            const isSelected = selected === d._id;
            return (
              <button key={d._id} type="button" onClick={() => setSelected(d._id)}
                className={`w-full flex items-center gap-4 rounded-xl px-4 py-3.5 text-left transition-all ${
                  isSelected ? 'bg-red-50 ring-2 ring-red-500 ring-inset' : 'hover:bg-slate-50'
                }`}>
                {/* selection circle */}
                <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ${
                  isSelected ? 'border-red-600 bg-red-600' : 'border-slate-300'
                }`}>
                  {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                </div>

                {/* avatar */}
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-black text-white ${
                  avail ? 'bg-gradient-to-br from-red-500 to-red-700' : 'bg-gradient-to-br from-slate-400 to-slate-500'
                }`}>
                  {d.fullName.charAt(0)}
                </div>

                {/* info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-slate-900 text-sm">{d.fullName}</p>
                    <span className={`inline-block rounded-md border px-1.5 py-0.5 text-[11px] font-black ${BG_COLORS[d.bloodGroup] ?? 'bg-slate-100 text-slate-600'}`}>{d.bloodGroup}</span>
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                      avail ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-600 border-amber-200'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${avail ? 'bg-green-500' : 'bg-amber-400'}`} />
                      {avail ? 'Available' : 'Not ready'}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-400">{d.city}{d.area ? `, ${d.area}` : ''} · {d.age} yrs · {d.gender}</p>
                  <p className="text-xs text-slate-400">{d.phone}</p>
                </div>

                {d.lastDonationDate && (
                  <p className="text-xs text-slate-400 shrink-0">Last: {formatDate(d.lastDonationDate)}</p>
                )}
              </button>
            );
          })}
        </div>

        {/* footer */}
        <div className="border-t border-slate-100 px-6 py-4 flex items-center gap-3">
          <button onClick={onClose} className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">Cancel</button>
          <button onClick={handleAssign} disabled={!selected || assigning}
            className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-bold text-white hover:bg-red-700 transition disabled:opacity-50">
            {assigning ? 'Assigning…' : selected ? `Assign ${donors.find(d => d._id === selected)?.fullName}` : 'Select a donor first'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Main page
   ═══════════════════════════════════════════ */
export default function AdminRequestsPage() {
  const { token } = useAdminAuth();
  const [requests, setRequests]   = useState<RequestItem[]>([]);
  const [donors,   setDonors]     = useState<Donor[]>([]);
  const [loading,  setLoading]    = useState(true);

  const [search,      setSearch]      = useState('');
  const [bloodFilter, setBloodFilter] = useState('');
  const [cityFilter,  setCityFilter]  = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('');

  const [assignTarget, setAssignTarget] = useState<RequestItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RequestItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState('');

  const headers = useMemo(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }), [token]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  /* fetch */
  const fetchAll = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [rRes, dRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/requests?status=pending`, { headers }),
        fetch(`${API_BASE}/api/admin/donors`, { headers }),
      ]);
      const rData = await rRes.json();
      const dData = await dRes.json();
      setRequests(rData.requests || []);
      setDonors(dData.donors || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, [token]);

  /* client-side filter */
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return requests.filter(r => {
      if (q && !r.recipientName.toLowerCase().includes(q) &&
               !r.contactNumber.includes(q) &&
               !(r.qimsId ?? '').toLowerCase().includes(q)) return false;
      if (bloodFilter  && r.bloodGroup !== bloodFilter)                      return false;
      if (cityFilter   && !r.city.toLowerCase().includes(cityFilter.toLowerCase())) return false;
      if (urgencyFilter && r.urgency !== urgencyFilter)                      return false;
      return true;
    });
  }, [requests, search, bloodFilter, cityFilter, urgencyFilter]);

  /* assign */
  const handleAssign = async (donorId: string) => {
    if (!assignTarget) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/requests/${assignTarget._id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ assignedDonor: donorId, status: 'fulfilled' }),
      });
      if (!res.ok) throw new Error();
      setRequests(prev => prev.filter(r => r._id !== assignTarget._id));
      setAssignTarget(null);
      showToast('✅ Donor assigned — request fulfilled and moved to history.');
    } catch {
      showToast('❌ Failed to assign donor. Please try again.');
    }
  };

  /* delete */
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await fetch(`${API_BASE}/api/admin/requests/${deleteTarget._id}`, {
        method: 'DELETE', headers,
      });
      setRequests(prev => prev.filter(r => r._id !== deleteTarget._id));
      setDeleteTarget(null);
      showToast('Request deleted.');
    } catch {
      showToast('❌ Failed to delete.');
    } finally { setDeleting(false); }
  };

  const hasFilters = search || bloodFilter || cityFilter || urgencyFilter;

  return (
    <div className="space-y-6">

      {/* toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 rounded-xl border border-slate-200 bg-white px-5 py-3.5 shadow-xl text-sm font-semibold text-slate-800 animate-slideDown">
          {toast}
        </div>
      )}

      {/* header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900">Blood Requests</h2>
          <p className="mt-1 text-slate-500">
            {loading ? 'Loading…' : `${filtered.length} pending request${filtered.length !== 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      {/* filter panel */}
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm space-y-4">
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
            </svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, contact, QIMS ID…"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-red-400 focus:bg-white focus:ring-2 focus:ring-red-100 transition" />
          </div>
          <input value={cityFilter} onChange={e => setCityFilter(e.target.value)} placeholder="City…"
            className="w-36 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-red-400 focus:bg-white focus:ring-2 focus:ring-red-100 transition" />
          {hasFilters && (
            <button onClick={() => { setSearch(''); setBloodFilter(''); setCityFilter(''); setUrgencyFilter(''); }}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-500 hover:bg-slate-50 transition whitespace-nowrap">
              Clear all
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-semibold text-slate-400 mr-1">Blood:</span>
          {BLOOD_GROUPS.map(bg => (
            <Chip key={bg} active={bloodFilter === bg} onClick={() => setBloodFilter(v => v === bg ? '' : bg)}>{bg}</Chip>
          ))}
          <div className="w-px self-stretch bg-slate-200 mx-1" />
          <span className="text-xs font-semibold text-slate-400 mr-1">Urgency:</span>
          {['high','medium','low'].map(u => (
            <Chip key={u} active={urgencyFilter === u} onClick={() => setUrgencyFilter(v => v === u ? '' : u)}>
              {u.charAt(0).toUpperCase() + u.slice(1)}
            </Chip>
          ))}
        </div>
      </div>

      {/* table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50 px-6 py-4 flex items-center justify-between">
          <h3 className="font-bold text-slate-900">Pending Requests</h3>
          <span className="text-xs text-slate-400">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400 text-sm animate-pulse">Loading requests…</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-4xl mb-3">📋</div>
            <p className="font-semibold text-slate-700">No pending requests</p>
            <p className="text-sm text-slate-400 mt-1">All caught up!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Recipient', 'QIMS ID', 'Age / Gender', 'Department', 'Contact', 'Blood Group', 'Units', 'City', 'Urgency', 'Received', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(req => (
                  <tr key={req._id} className="hover:bg-slate-50/70 transition-colors group">

                    {/* recipient */}
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-900 leading-tight">{req.recipientName}</p>
                    </td>

                    {/* QIMS ID */}
                    <td className="px-4 py-4">
                      {req.qimsId
                        ? <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-mono font-semibold text-slate-600">{req.qimsId}</span>
                        : <span className="text-slate-300">—</span>}
                    </td>

                    {/* age / gender */}
                    <td className="px-4 py-4">
                      <p className="font-medium text-slate-800">{req.age ?? '—'} yrs</p>
                      <p className="text-xs capitalize text-slate-400">{req.gender ?? '—'}</p>
                    </td>

                    {/* department */}
                    <td className="px-4 py-4 text-slate-600 text-xs max-w-[120px]">
                      <span className="line-clamp-2">{req.department || '—'}</span>
                    </td>

                    {/* contact */}
                    <td className="px-4 py-4 text-slate-600 whitespace-nowrap">{req.contactNumber}</td>

                    {/* blood group */}
                    <td className="px-4 py-4">
                      <span className={`inline-block rounded-lg border px-2.5 py-1 text-sm font-black ${BG_COLORS[req.bloodGroup] ?? 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                        {req.bloodGroup}
                      </span>
                    </td>

                    {/* units */}
                    <td className="px-4 py-4 font-semibold text-slate-700 text-center">{req.unitsRequired}</td>

                    {/* city */}
                    <td className="px-4 py-4">
                      <p className="font-medium text-slate-800">{req.city}</p>
                      {req.area && <p className="text-xs text-slate-400">{req.area}</p>}
                    </td>

                    {/* urgency */}
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${URGENCY_STYLE[req.urgency] ?? 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${URGENCY_DOT[req.urgency] ?? 'bg-slate-400'}`} />
                        {req.urgency}
                      </span>
                    </td>

                    {/* received */}
                    <td className="px-4 py-4 text-xs text-slate-400 whitespace-nowrap">{timeAgo(req.createdAt)}</td>

                    {/* actions */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setAssignTarget(req)}
                          className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700 transition shadow-sm whitespace-nowrap"
                        >
                          Assign
                        </button>
                        <button
                          onClick={() => setDeleteTarget(req)}
                          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 transition whitespace-nowrap"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* assign modal */}
      {assignTarget && (
        <AssignModal
          request={assignTarget}
          donors={donors}
          onAssign={handleAssign}
          onClose={() => setAssignTarget(null)}
        />
      )}

      {/* delete modal */}
      {deleteTarget && (
        <DeleteModal
          name={deleteTarget.recipientName}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
