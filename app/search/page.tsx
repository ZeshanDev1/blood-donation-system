'use client';

import DonorSearch from '@/components/patients/DonorSearch';
import Link from 'next/link';

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-black">Search Donors</h1>
          <Link href="/" className="text-sm text-gray-400 hover:text-red-500">Back to Home</Link>
        </div>
        <DonorSearch />
      </div>
    </div>
  );
}
