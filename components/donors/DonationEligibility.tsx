'use client';

import { useAuth } from '@/lib/authContext';
import { API_BASE } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function DonationEligibility() {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleScheduleDonation = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_BASE}/api/donations/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          donorId: user?._id,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to schedule donation');
      }

      setSuccess('Donation scheduled successfully!');
    } catch (err: any) {
      setError(err.message || 'Error scheduling donation');
    } finally {
      setLoading(false);
    }
  };

  const eligibilityChecks = [
    { name: 'Age', status: 'pass', details: 'Must be between 18-65 years old' },
    { name: 'Weight', status: 'pass', details: 'Must weigh at least 50 kg' },
    { name: 'Health', status: 'pass', details: 'Must be in good health' },
    { name: 'Last Donation', status: 'warning', details: 'Must wait 56 days between donations' },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Donation Eligibility Status</CardTitle>
          <CardDescription>Check your current eligibility to donate blood</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 text-green-700 dark:text-green-400 text-sm p-3 rounded-md">
              {success}
            </div>
          )}

          <div className="space-y-3">
            {eligibilityChecks.map((check) => (
              <div key={check.name} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                  check.status === 'pass' 
                    ? 'bg-green-500/20 text-green-700 dark:text-green-400'
                    : 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400'
                }`}>
                  {check.status === 'pass' ? '✓' : '!'}
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{check.name}</p>
                  <p className="text-sm text-muted-foreground">{check.details}</p>
                </div>
              </div>
            ))}
          </div>

          {user?.donorInfo?.isDonationEligible ? (
            <Button 
              onClick={handleScheduleDonation} 
              disabled={loading}
              className="w-full mt-4"
            >
              {loading ? 'Scheduling...' : 'Schedule Donation'}
            </Button>
          ) : (
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-sm">
              <p className="text-yellow-700 dark:text-yellow-400 font-semibold">Not Eligible to Donate</p>
              {user?.donorInfo?.nextEligibleDate && (
                <p className="text-yellow-600 dark:text-yellow-500 mt-1">
                  You can donate again on {new Date(user.donorInfo.nextEligibleDate).toLocaleDateString()}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-1">How often can I donate?</h4>
            <p className="text-sm text-muted-foreground">You can donate every 56 days (approximately 8 weeks).</p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">How much blood is collected?</h4>
            <p className="text-sm text-muted-foreground">A standard donation is about 450 ml (one pint) of blood.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">How long does the process take?</h4>
            <p className="text-sm text-muted-foreground">The entire process takes about 45 minutes to an hour.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
