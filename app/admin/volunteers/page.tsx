'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAdminAuth } from '@/lib/adminAuthContext';
import { API_BASE } from '@/lib/api';

/* ─── types ─── */
interface Volunteer {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  gender: string;
  age: number;
  occupation: string;
  skills: string[];
  previousExperience: boolean;
  organizationName?: string;
  consent: boolean;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

/* ─── toast ─── */
function Toast({ msg, ok }: { msg: string; ok: boolean }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border px-5 py-3 shadow-xl text-sm font-semibold transition-all ${ok ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
      <span>{ok ? '✓' : '✕'}</span> {msg}
    </div>
  );
}

/* ─── confirm modal ─── */
function ConfirmModal({
  title, message, confirmLabel, confirmClass,
  onConfirm, onCancel,
}: {
  title: string; message: React.ReactNode; confirmLabel: string; confirmClass: string;
  onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-7 shadow-xl">
        <h3 className="text-center text-lg font-black text-slate-900">{title}</h3>
        <div className="mt-2 text-center text-sm text-slate-500">{message}</div>
        <div className="mt-6 flex gap-3">
          <button onClick={onCancel}
            className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">
            Cancel
          </button>
          <button onClick={onConfirm} className={`flex-1 rounded-xl py-2.5 text-sm font-bold text-white transition ${confirmClass}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── detail drawer ─── */
function DetailDrawer({ v, onClose }: { v: Volunteer; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-2xl overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-5">
          <div>
            <h3 className="font-black text-slate-900 text-lg">{v.fullName}</h3>
            <p className="text-xs text-slate-400 mt-0.5">Applied {formatDate(v.createdAt)}</p>
          </div>
          <button onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-slate-200 transition text-slate-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 px-6 py-6 space-y-5">
          {[
            { label: 'Email',      value: v.email },
            { label: 'Phone',      value: v.phone },
            { label: 'City',       value: v.city },
            { label: 'Gender',     value: v.gender },
            { label: 'Age',        value: `${v.age} years` },
            { label: 'Occupation', value: v.occupation },
          ].map(row => (
            <div key={row.label} className="flex justify-between text-sm border-b border-slate-50 pb-2">
              <span className="text-slate-400 font-medium">{row.label}</span>
              <span className="text-slate-800 font-semibold">{row.value}</span>
            </div>
          ))}

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Skills</p>
            <div className="flex flex-wrap gap-2">
              {v.skills.map(s => (
                <span key={s} className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">{s}</span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Previous Experience</p>
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${v.previousExperience ? 'border-green-200 bg-green-50 text-green-700' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>
              {v.previousExperience ? '✓ Yes' : 'No'}
            </span>
            {v.previousExperience && v.organizationName && (
              <p className="mt-2 text-sm text-slate-700 bg-slate-50 rounded-xl p-3 border border-slate-100">
                <span className="font-semibold">Organization:</span> {v.organizationName}
              </p>
            )}
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Consent</p>
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${v.consent ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
              {v.consent ? '✓ Agreed' : '✗ Not agreed'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════ */
export default function AdminVolunteersPage() {
  const { token } = useAdminAuth();
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [selected, setSelected]     = useState<Volunteer | null>(null);
  const [confirm, setConfirm]       = useState<{ type: 'accept' | 'delete'; volunteer: Volunteer } | null>(null);
  const [toast, setToast]           = useState<{ msg: string; ok: boolean } | null>(null);

  const headers = useMemo(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }), [token]);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetch(`${API_BASE}/api/admin/volunteers`, { headers })
      .then(r => r.json())
      .then(d => setVolunteers(d.volunteers || []))
      .catch(() => setVolunteers([]))
      .finally(() => setLoading(false));
  }, [token]);

  const pending    = useMemo(() => volunteers.filter(v => v.status === 'pending'), [volunteers]);
  const registered = useMemo(() => volunteers.filter(v => v.status === 'approved'), [volunteers]);

  /* search applied across both lists */
  const filterFn = (list: Volunteer[]) => {
    const q = search.toLowerCase();
    if (!q) return list;
    return list.filter(v =>
      v.fullName.toLowerCase().includes(q) ||
      v.email.toLowerCase().includes(q) ||
      v.city.toLowerCase().includes(q)
    );
  };

  const handleAccept = async (v: Volunteer) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/volunteers/${v._id}`, {
        method: 'PATCH', headers,
        body: JSON.stringify({ status: 'approved' }),
      });
      if (!res.ok) throw new Error();
      setVolunteers(prev => prev.map(x => x._id === v._id ? { ...x, status: 'approved' } : x));
      showToast(`${v.fullName} moved to Registered Volunteers.`, true);
    } catch {
      showToast('Failed to accept volunteer.', false);
    } finally {
      setConfirm(null);
    }
  };

  const handleDelete = async (v: Volunteer) => {
    try {
      await fetch(`${API_BASE}/api/admin/volunteers/${v._id}`, { method: 'DELETE', headers });
      setVolunteers(prev => prev.filter(x => x._id !== v._id));
      if (selected?._id === v._id) setSelected(null);
      showToast('Volunteer removed.', true);
    } catch {
      showToast('Failed to delete.', false);
    } finally {
      setConfirm(null);
    }
  };

  /* row component reused in both tables */
  const Row = ({ v, showAccept }: { v: Volunteer; showAccept: boolean }) => (
    <tr className="hover:bg-slate-50/70 transition-colors group cursor-pointer" onClick={() => setSelected(v)}>
      {/* name */}
      <td className="px-5 py-4">
        <p className="font-semibold text-slate-900 leading-tight">{v.fullName}</p>
        <p className="text-xs text-slate-400 mt-0.5">{v.email}</p>
        <p className="text-xs text-slate-400">{v.phone}</p>
      </td>
      {/* details */}
      <td className="px-5 py-4">
        <p className="text-sm text-slate-700 font-medium">{v.city}</p>
        <p className="text-xs text-slate-400">{v.gender} · {v.age} yrs</p>
      </td>
      {/* occupation */}
      <td className="px-5 py-4 text-sm text-slate-600">{v.occupation}</td>
      {/* skills */}
      <td className="px-5 py-4">
        <div className="flex flex-wrap gap-1">
          {v.skills.slice(0, 2).map(s => (
            <span key={s} className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700 whitespace-nowrap">{s}</span>
          ))}
          {v.skills.length > 2 && (
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-400">+{v.skills.length - 2}</span>
          )}
        </div>
      </td>
      {/* date */}
      <td className="px-5 py-4 text-xs text-slate-400 whitespace-nowrap">{formatDate(v.createdAt)}</td>
      {/* actions */}
      <td className="px-5 py-4">
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
          {showAccept && (
            <button
              onClick={() => setConfirm({ type: 'accept', volunteer: v })}
              className="flex items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700 hover:bg-green-100 transition">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
              Accept
            </button>
          )}
          <button
            onClick={() => setConfirm({ type: 'delete', volunteer: v })}
            className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-100 transition">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            Delete
          </button>
        </div>
      </td>
    </tr>
  );

  const TableHeaders = () => (
    <tr className="border-b border-slate-100">
      {['Volunteer', 'City / Gender', 'Occupation', 'Skills', 'Applied', 'Actions'].map(h => (
        <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 whitespace-nowrap">{h}</th>
      ))}
    </tr>
  );

  return (
    <div className="space-y-8">

      {/* page header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-3xl font-black text-slate-900">Volunteers</h2>
          <p className="mt-1 text-slate-500">
            {loading ? 'Loading…' : `${pending.length} pending · ${registered.length} registered`}
          </p>
        </div>

        {/* search */}
        <div className="relative w-full sm:w-64">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"/>
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search name, email, city…"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition shadow-sm"
          />
        </div>
      </div>

      {/* stat row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total',      value: volunteers.length, border: 'border-slate-200' },
          { label: 'Pending',    value: pending.length,    border: 'border-amber-200' },
          { label: 'Registered', value: registered.length, border: 'border-green-200' },
          { label: 'Rejected',   value: volunteers.filter(v => v.status === 'rejected').length, border: 'border-red-100' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl border ${s.border} bg-white p-5 shadow-sm`}>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{s.label}</p>
            <p className="mt-1 text-4xl font-black text-slate-900">{s.value}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 text-slate-400 text-sm animate-pulse">Loading volunteers…</div>
      ) : (
        <>
          {/* ── PENDING REQUESTS ── */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-2.5 w-2.5 rounded-full bg-amber-400 animate-pulse" />
              <h3 className="text-lg font-black text-slate-900">Pending Requests</h3>
              <span className="rounded-full bg-amber-100 border border-amber-200 px-2.5 py-0.5 text-xs font-bold text-amber-700">{filterFn(pending).length}</span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              {filterFn(pending).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <p className="text-3xl mb-2">📭</p>
                  <p className="font-semibold text-slate-600">No pending applications</p>
                  <p className="text-sm text-slate-400 mt-1">New volunteer applications will appear here.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-sm">
                    <thead><TableHeaders /></thead>
                    <tbody className="divide-y divide-slate-50">
                      {filterFn(pending).map(v => <Row key={v._id} v={v} showAccept={true} />)}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>

          {/* ── REGISTERED VOLUNTEERS ── */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
              <h3 className="text-lg font-black text-slate-900">Registered Volunteers</h3>
              <span className="rounded-full bg-green-100 border border-green-200 px-2.5 py-0.5 text-xs font-bold text-green-700">{filterFn(registered).length}</span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              {filterFn(registered).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <p className="text-3xl mb-2">🙋</p>
                  <p className="font-semibold text-slate-600">No registered volunteers yet</p>
                  <p className="text-sm text-slate-400 mt-1">Accept a pending request to register a volunteer.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-sm">
                    <thead><TableHeaders /></thead>
                    <tbody className="divide-y divide-slate-50">
                      {filterFn(registered).map(v => <Row key={v._id} v={v} showAccept={false} />)}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </>
      )}

      {/* detail drawer */}
      {selected && <DetailDrawer v={selected} onClose={() => setSelected(null)} />}

      {/* confirm modal */}
      {confirm?.type === 'accept' && (
        <ConfirmModal
          title="Accept Volunteer?"
          message={<>Move <span className="font-semibold text-slate-800">{confirm.volunteer.fullName}</span> to Registered Volunteers?</>}
          confirmLabel="Yes, Accept"
          confirmClass="bg-green-600 hover:bg-green-700"
          onConfirm={() => handleAccept(confirm.volunteer)}
          onCancel={() => setConfirm(null)}
        />
      )}
      {confirm?.type === 'delete' && (
        <ConfirmModal
          title="Delete Volunteer?"
          message={<>This will permanently remove <span className="font-semibold text-slate-800">{confirm.volunteer.fullName}</span>'s application.</>}
          confirmLabel="Yes, Delete"
          confirmClass="bg-red-600 hover:bg-red-700"
          onConfirm={() => handleDelete(confirm.volunteer)}
          onCancel={() => setConfirm(null)}
        />
      )}

      {toast && <Toast msg={toast.msg} ok={toast.ok} />}
    </div>
  );
}
