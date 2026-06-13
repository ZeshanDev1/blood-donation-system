'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import DonationHistory from '@/components/donors/DonationHistory';
import DonationEligibility from '@/components/donors/DonationEligibility';
import DonorProfile from '@/components/donors/DonorProfile';

export default function DonorDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-6 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Blood Donor Dashboard</h1>
            <p className="text-primary-foreground/80 mt-1">Welcome, {user.name}</p>
          </div>
          <Button 
            variant="secondary"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'overview'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('eligibility')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'eligibility'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Donation Eligibility
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'history'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Donation History
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'profile'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Profile
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Blood Type</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary">{user.donorInfo?.bloodType || 'N/A'}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Total Donations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary">{user.donorInfo?.totalDonations || 0}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Donation Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${user.donorInfo?.isDonationEligible ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <p className="text-lg font-semibold">
                    {user.donorInfo?.isDonationEligible ? 'Eligible' : 'Not Eligible'}
                  </p>
                </div>
                {!user.donorInfo?.isDonationEligible && user.donorInfo?.nextEligibleDate && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Next eligible: {new Date(user.donorInfo.nextEligibleDate).toLocaleDateString()}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'eligibility' && <DonationEligibility />}
        {activeTab === 'history' && <DonationHistory />}
        {activeTab === 'profile' && <DonorProfile />}
      </div>
    </div>
  );
}
