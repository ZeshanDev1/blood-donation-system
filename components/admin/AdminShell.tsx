'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AdminRoute } from '@/lib/AdminRoute';
import { useAdminAuth } from '@/lib/adminAuthContext';
import { Button } from '@/components/ui/button';
import { BrandMark } from '@/components/BrandMark';

const navSections = [
  {
    title: 'Dashboard',
    items: [
      { href: '/admin/overview', label: 'Overview' },
    ],
  },
  {
    title: 'Core Management',
    items: [
      { href: '/admin/donors', label: 'Donors' },
      { href: '/admin/requests', label: 'Blood Requests' },
      { href: '/admin/history', label: 'Donation History' },
      { href: '/admin/events', label: 'Events' },
      { href: '/admin/stories', label: 'Stories' },
    ],
  },
  {
    title: 'Community',
    items: [
      { href: '/admin/volunteers', label: 'Volunteers' },
      { href: '/admin/team', label: 'Team Management' },
    ],
  },
  {
    title: 'System',
    items: [
      { href: '/admin/settings', label: 'Settings' },
    ],
  },
];

const navItems = navSections.flatMap((section) => section.items);

function NavLink({
  href,
  label,
  active,
  variant = 'sidebar',
}: {
  href: string;
  label: string;
  active: boolean;
  variant?: 'sidebar' | 'mobile';
}) {
  if (variant === 'mobile') {
    return (
      <Link
        href={href}
        className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
          active
            ? 'bg-red-600 text-white'
            : 'bg-slate-100 text-slate-600 hover:bg-red-600/10 hover:text-red-700'
        }`}
      >
        {label}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={`block rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
        active
          ? 'bg-red-600 text-white shadow-sm'
          : 'text-gray-300 hover:bg-red-600/20 hover:text-white'
      }`}
    >
      {label}
    </Link>
  );
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { admin, logout } = useAdminAuth();

  return (
    <AdminRoute>
      <div className="min-h-screen bg-neutral-100 text-slate-900">
        <div className="flex min-h-screen">
          <aside className="hidden w-72 flex-col border-r border-red-900/20 bg-black p-6 text-white md:flex">
            <div className="flex flex-col items-center">
              <BrandMark compact />
              <p className="mt-3 text-xs uppercase tracking-[0.3em] text-gray-400">Admin Central</p>
            </div>

            <nav className="mt-10 space-y-8">
              {navSections.map((section) => (
                <div key={section.title}>
                  <p className="mb-2 px-4 text-[11px] font-semibold uppercase tracking-[0.25em] text-gray-500">
                    {section.title}
                  </p>
                  <div className="space-y-1">
                    {section.items.map((item) => (
                      <NavLink
                        key={item.href}
                        href={item.href}
                        label={item.label}
                        active={pathname === item.href}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </nav>

            <div className="mt-auto space-y-4 pt-8">
              <p className="text-xs text-gray-400">Signed in as {admin?.username}</p>
              <Button onClick={logout} className="w-full bg-red-600 hover:bg-red-700 text-white">
                Logout
              </Button>
            </div>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col">
            <header className="border-b border-slate-200 bg-white px-4 py-4 text-slate-900 sm:px-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-red-500">Admin Console</p>
                  <h1 className="text-2xl font-black">QBDS</h1>
                </div>
                <Button
                  onClick={logout}
                  className="md:hidden bg-red-600 hover:bg-red-700 text-white h-9 px-4 text-sm"
                >
                  Logout
                </Button>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 md:hidden">
                {navItems.map((item) => (
                  <NavLink
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    active={pathname === item.href}
                    variant="mobile"
                  />
                ))}
              </div>
            </header>

            <main className="flex-1 bg-neutral-100 px-4 py-6 text-slate-900 sm:px-6 sm:py-8">
              {children}
            </main>
          </div>
        </div>
      </div>
    </AdminRoute>
  );
}
