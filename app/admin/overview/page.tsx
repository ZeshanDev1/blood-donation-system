'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAdminAuth } from '@/lib/adminAuthContext';
import { API_BASE } from '@/lib/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';

/* ─────────── types ─────────── */
interface Stats {
  totalDonors: number;
  totalRequests: number;
  pendingRequests: number;
  fulfilledRequests: number;
  bloodGroupCounts: { _id: string; count: number }[];
}

/* ─────────── thresholds ─────────── */
const CRITICAL = 5;
const LOW      = 20;

function getStatus(count: number): { label: string; icon: string; color: string; bg: string; border: string } {
  if (count === 0 || count <= CRITICAL)
    return { label: 'Critical', icon: '🔴', color: 'text-red-600',    bg: 'bg-red-50',    border: 'border-red-200' };
  if (count <= LOW)
    return { label: 'Low',      icon: '⚠️',  color: 'text-amber-600', bg: 'bg-amber-50',  border: 'border-amber-200' };
  return   { label: 'OK',       icon: '✅',  color: 'text-green-600', bg: 'bg-green-50',  border: 'border-green-200' };
}

const BAR_COLORS = ['#dc2626','#ef4444','#f87171','#fca5a5','#dc2626','#ef4444','#f87171','#fca5a5'];

/* ─────────── animated counter ─────────── */
function useCounter(target: number, duration = 900) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target === 0) { setValue(0); return; }
    const start = Date.now();
    const from  = 0;
    let raf: number;
    const tick = () => {
      const t = Math.min(1, (Date.now() - start) / duration);
      const ease = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(from + (target - from) * ease));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

/* ─────────── stat card ─────────── */
function StatCard({
  label, value, icon, accent, sub,
}: { label: string; value: number; icon: string; accent: string; sub?: string }) {
  const display = useCounter(value);
  return (
    <div className={`relative overflow-hidden rounded-2xl border bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${accent}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">{label}</p>
          <p className="mt-3 text-4xl font-black text-slate-900">{display.toLocaleString()}</p>
          {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
        </div>
        <div className="text-3xl opacity-80">{icon}</div>
      </div>
    </div>
  );
}



/* ─────────── donut ring (SVG) ─────────── */
function DonutRing({ pct, color }: { pct: number; color: string }) {
  const r  = 36;
  const cx = 44;
  const cy = 44;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={88} height={88} className="-rotate-90">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e2e8f0" strokeWidth={8} />
      <circle
        cx={cx} cy={cy} r={r} fill="none"
        stroke={color} strokeWidth={8}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 1s ease' }}
      />
    </svg>
  );
}

/* ─────────── custom bar tooltip ─────────── */
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  const st = getStatus(value);
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg text-sm">
      <p className="font-black text-slate-900 text-base">{name}</p>
      <p className="mt-0.5 text-slate-600">{value} donor{value !== 1 ? 's' : ''}</p>
      <p className={`mt-1 font-semibold ${st.color}`}>{st.icon} {st.label}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Main page
   ═══════════════════════════════════════════ */
export default function AdminOverviewPage() {
  const { token } = useAdminAuth();
  const [stats, setStats] = useState<Stats>({
    totalDonors: 0, totalRequests: 0,
    pendingRequests: 0, fulfilledRequests: 0,
    bloodGroupCounts: [],
  });
  const [loading, setLoading] = useState(true);

  const headers = useMemo(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }), [token]);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetch(`${API_BASE}/api/admin/stats`, { headers })
      .then(r => r.json())
      .then(d => setStats(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token, headers]);

  const fulfillRate = stats.totalRequests > 0
    ? Math.round((stats.fulfilledRequests / stats.totalRequests) * 100)
    : 0;

  const pendingRate = stats.totalRequests > 0
    ? Math.round((stats.pendingRequests / stats.totalRequests) * 100)
    : 0;

  const chartData = stats.bloodGroupCounts.map(g => ({ name: g._id, value: g.count }));

  const sortedGroups = [...stats.bloodGroupCounts].sort((a, b) => a.count - b.count);
  const criticalGroups = sortedGroups.filter(g => g.count <= CRITICAL);
  const lowGroups      = sortedGroups.filter(g => g.count > CRITICAL && g.count <= LOW);

  return (
    <div className="space-y-8">

      {/* ── header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900">Overview</h2>
          <p className="mt-1 text-slate-500">Real-time snapshot of the blood bank platform.</p>
        </div>
        {loading && (
          <span className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-500 shadow-sm">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
            Refreshing…
          </span>
        )}
      </div>

      {/* ── 4 KPI cards ── */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Donors"     value={stats.totalDonors}        accent="border-red-100"   sub="Registered donors" />
        <StatCard label="Total Requests"   value={stats.totalRequests}      accent="border-blue-100"  sub="All time" />
        <StatCard label="Pending"          value={stats.pendingRequests}    accent="border-amber-100" sub="Awaiting match" />
        <StatCard label="Fulfilled"        value={stats.fulfilledRequests}   accent="border-green-100" sub="Successfully matched" />
      </div>

      {/* ── fulfilment + pending rings ── */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

        <div className="flex items-center gap-6 rounded-2xl border border-slate-200 bg-white px-7 py-6 shadow-sm">
          <div className="relative shrink-0">
            <DonutRing pct={fulfillRate} color="#16a34a" />
            <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-slate-900">
              {fulfillRate}%
            </span>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Fulfilment Rate</p>
            <p className="mt-1 text-2xl font-black text-slate-900">{stats.fulfilledRequests} fulfilled</p>
            <p className="mt-0.5 text-sm text-slate-500">out of {stats.totalRequests} total requests</p>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              {fulfillRate >= 70 ? 'Performing well' : fulfillRate >= 40 ? 'Room to improve' : 'Needs attention'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 rounded-2xl border border-slate-200 bg-white px-7 py-6 shadow-sm">
          <div className="relative shrink-0">
            <DonutRing pct={pendingRate} color="#f59e0b" />
            <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-slate-900">
              {pendingRate}%
            </span>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Pending Rate</p>
            <p className="mt-1 text-2xl font-black text-slate-900">{stats.pendingRequests} pending</p>
            <p className="mt-0.5 text-sm text-slate-500">out of {stats.totalRequests} total requests</p>
            <div className={`mt-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
              pendingRate > 50
                ? 'border-red-200 bg-red-50 text-red-700'
                : pendingRate > 25
                ? 'border-amber-200 bg-amber-50 text-amber-700'
                : 'border-green-200 bg-green-50 text-green-700'
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${pendingRate > 50 ? 'bg-red-500' : pendingRate > 25 ? 'bg-amber-500' : 'bg-green-500'}`} />
              {pendingRate > 50 ? 'High backlog' : pendingRate > 25 ? 'Moderate backlog' : 'Under control'}
            </div>
          </div>
        </div>
      </div>

      {/* ── chart + table row ── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">

        {/* Bar chart — spans 3 cols */}
        <div className="lg:col-span-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h3 className="text-lg font-black text-slate-900">Donors by Blood Group</h3>
            <p className="text-sm text-slate-400">Distribution across all {stats.totalDonors} registered donors</p>
          </div>
          {chartData.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-slate-400 text-sm">No donor data yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fontWeight: 700, fill: '#64748b' }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false} tickLine={false}
                  width={28}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9', radius: 6 }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell
                      key={entry.name}
                      fill={entry.value <= CRITICAL ? '#ef4444' : entry.value <= LOW ? '#f59e0b' : '#dc2626'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
          {/* legend */}
          <div className="mt-4 flex flex-wrap gap-4 border-t border-slate-100 pt-4">
            {[
              { color: 'bg-red-500',   label: 'Critical  ≤ 5'  },
              { color: 'bg-amber-400', label: 'Low  6–20'       },
              { color: 'bg-red-700',   label: 'OK  > 20'        },
            ].map(l => (
              <span key={l.label} className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className={`h-2.5 w-2.5 rounded-sm ${l.color}`} />
                {l.label}
              </span>
            ))}
          </div>
        </div>

        {/* Status table — spans 2 cols */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 px-6 py-5">
            <h3 className="text-lg font-black text-slate-900">Blood Group Status</h3>
            <p className="text-sm text-slate-400">Live availability per group</p>
          </div>
          {stats.bloodGroupCounts.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-slate-400 text-sm px-6">No donor data yet.</div>
          ) : (
            <div className="divide-y divide-slate-50">
              {/* table header */}
              <div className="grid grid-cols-3 bg-slate-50 px-6 py-3 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                <span>Group</span>
                <span className="text-center">Donors</span>
                <span className="text-right">Status</span>
              </div>
              {/* rows */}
              {[...stats.bloodGroupCounts]
                .sort((a, b) => a.count - b.count)
                .map(g => {
                  const st = getStatus(g.count);
                  return (
                    <div key={g._id} className="grid grid-cols-3 items-center px-6 py-3.5 hover:bg-slate-50/70 transition-colors">
                      <span className="text-base font-black text-slate-900">{g._id}</span>
                      <span className="text-center text-sm font-semibold text-slate-700">{g.count}</span>
                      <div className="flex justify-end">
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${st.bg} ${st.border} ${st.color}`}>
                          {st.icon} {st.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* ── alert banner (only shows if there are critical/low groups) ── */}
      {(criticalGroups.length > 0 || lowGroups.length > 0) && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-5">
          <div className="flex items-start gap-3">
            <span className="text-xl shrink-0">🚨</span>
            <div className="space-y-1">
              <p className="font-bold text-red-700">Blood Supply Alert</p>
              {criticalGroups.length > 0 && (
                <p className="text-sm text-red-600">
                  <strong>Critical:</strong> {criticalGroups.map(g => g._id).join(', ')} — fewer than {CRITICAL + 1} donors available.
                </p>
              )}
              {lowGroups.length > 0 && (
                <p className="text-sm text-amber-700">
                  <strong>Low:</strong> {lowGroups.map(g => g._id).join(', ')} — donor count is below {LOW + 1}.
                </p>
              )}
              <p className="text-xs text-red-500 mt-1">Consider running a donor recruitment campaign for these groups.</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
