import AdminShell from '@/components/admin/AdminShell';
import { AdminAuthProvider } from '@/lib/adminAuthContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminShell>{children}</AdminShell>
    </AdminAuthProvider>
  );
}
