'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import BloodRequestForm from '@/components/patients/BloodRequestForm';
import DonorSearch from '@/components/patients/DonorSearch';
import MyBloodRequests from '@/components/patients/MyBloodRequests';

export default function PatientDashboard() {
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
            <h1 className="text-3xl font-bold">Patient Dashboard</h1>
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
              onClick={() => setActiveTab('new-request')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'new-request'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Create Request
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'requests'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              My Requests
            </button>
            <button
              onClick={() => setActiveTab('find-donor')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'find-donor'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Find Donors
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Blood Type Needed</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary">{user.patientInfo?.bloodType || 'N/A'}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Medical Condition</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">{user.patientInfo?.medicalCondition}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hospital</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">{user.patientInfo?.hospitalName}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Doctor</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">{user.patientInfo?.doctorName}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'new-request' && <BloodRequestForm />}
        {activeTab === 'requests' && <MyBloodRequests />}
        {activeTab === 'find-donor' && <DonorSearch />}
      </div>
    </div>
  );
}
