'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from './adminAuthContext';

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { admin, loading } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !admin) {
      router.push('/login');
    }
  }, [admin, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-b-2 border-red-500" />
          <p className="text-gray-400">Loading admin console...</p>
        </div>
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  return <>{children}</>;
}
