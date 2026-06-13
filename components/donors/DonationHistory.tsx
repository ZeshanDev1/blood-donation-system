'use client';

import { useAuth } from '@/lib/authContext';
import { API_BASE } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useEffect } from 'react';

interface Donation {
  _id: string;
  donorId: string;
  date: string;
  bloodType: string;
  quantity: number;
  location: string;
  status: 'completed' | 'pending' | 'cancelled';
}

export default function DonationHistory() {
  const { user, token } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/donations/history/${user?._id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch donations');
        }

        const data = await response.json();
        setDonations(data.donations || []);
      } catch (err: any) {
        setError(err.message || 'Error fetching donations');
      } finally {
        setLoading(false);
      }
    };

    if (user && token) {
      fetchDonations();
    }
  }, [user, token]);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p>Loading donation history...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-md">
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Donation History</CardTitle>
        <CardDescription>View all your blood donations</CardDescription>
      </CardHeader>
      <CardContent>
        {donations.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No donations yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {donations.map((donation) => (
              <div key={donation._id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex-1">
                  <p className="font-semibold">Donation on {new Date(donation.date).toLocaleDateString()}</p>
                  <div className="text-sm text-muted-foreground space-y-1 mt-1">
                    <p>Blood Type: <span className="font-medium">{donation.bloodType}</span></p>
                    <p>Quantity: <span className="font-medium">{donation.quantity} ml</span></p>
                    <p>Location: <span className="font-medium">{donation.location}</span></p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  donation.status === 'completed' ? 'bg-green-500/20 text-green-700 dark:text-green-400' :
                  donation.status === 'pending' ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400' :
                  'bg-red-500/20 text-red-700 dark:text-red-400'
                }`}>
                  {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
