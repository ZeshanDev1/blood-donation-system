'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-destructive mb-4">403</h1>
        <h2 className="text-3xl font-bold mb-2">Access Denied</h2>
        <p className="text-muted-foreground text-lg mb-8 max-w-md">
          You don&apos;t have permission to access this page. Please ensure you&apos;re logged in with the correct account.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/">
            <Button>
                Go to Home
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
