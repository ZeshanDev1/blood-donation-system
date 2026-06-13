'use client';

import { AdminAuthProvider } from '@/lib/adminAuthContext';

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <AdminAuthProvider>{children}</AdminAuthProvider>;
}
