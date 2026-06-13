'use client';

import { useAuth } from '@/lib/authContext';
import { API_BASE } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useEffect } from 'react';

interface BloodRequest {
  _id: string;
  patientId: string;
  bloodType: string;
  units: number;
  neededBy: string;
  urgency: string;
  status: 'pending' | 'fulfilled' | 'cancelled';
  createdAt: string;
}

export default function MyBloodRequests() {
  const { user, token } = useAuth();
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const params = new URLSearchParams();
        if (user?._id) params.append('patientId', user._id);
        const response = await fetch(`${API_BASE}/api/blood-requests?${params.toString()}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch requests');
        }

        const data = await response.json();
        setRequests(Array.isArray(data) ? data : (data.requests || []));
      } catch (err: any) {
        setError(err.message || 'Error fetching requests');
      } finally {
        setLoading(false);
      }
    };

    if (user && token) {
      fetchRequests();
    }
  }, [user, token]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-blue-500/20 text-blue-700 dark:text-blue-400';
      case 'fulfilled':
        return 'bg-green-500/20 text-green-700 dark:text-green-400';
      case 'cancelled':
        return 'bg-red-500/20 text-red-700 dark:text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-700';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'text-red-600 font-bold';
      case 'medium':
        return 'text-orange-600 font-semibold';
      case 'low':
        return 'text-gray-600';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p>Loading your requests...</p>
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
        <CardTitle>My Blood Requests</CardTitle>
        <CardDescription>Track your blood donation requests</CardDescription>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No requests yet. Create a new request to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((request) => (
              <div key={request._id} className="p-4 border border-border rounded-lg hover:bg-muted transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold">Blood Type: <span className="text-primary">{request.bloodType}</span></h3>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Units</p>
                    <p className="font-medium">{request.units} ml</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Required Date</p>
                    <p className="font-medium">{new Date(request.neededBy).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Urgency</p>
                    <p className={`font-medium ${getUrgencyColor(request.urgency)}`}>
                      {request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Created</p>
                    <p className="font-medium">{new Date(request.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
