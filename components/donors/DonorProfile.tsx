'use client';

import { useAuth } from '@/lib/authContext';
import { API_BASE } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function DonorProfile() {
  const { user, token } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_BASE}/api/donors/${user?._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Manage your donor profile</CardDescription>
            </div>
            <Button
              variant={isEditing ? 'outline' : 'default'}
              onClick={() => {
                if (isEditing) {
                  setFormData({
                    name: user?.name || '',
                    email: user?.email || '',
                    phone: user?.phone || '',
                    address: user?.address || '',
                  });
                }
                setIsEditing(!isEditing);
              }}
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
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

            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditing || loading}
                placeholder="Your name"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!isEditing || loading}
                placeholder="your@email.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Phone</label>
              <Input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={!isEditing || loading}
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Address</label>
              <Input
                name="address"
                value={formData.address}
                onChange={handleChange}
                disabled={!isEditing || loading}
                placeholder="Your address"
              />
            </div>

            {isEditing && (
              <Button 
                onClick={handleSave}
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle>Donor Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Blood Type</p>
              <p className="text-lg font-semibold text-primary">{user?.donorInfo?.bloodType}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Donations</p>
              <p className="text-lg font-semibold">{user?.donorInfo?.totalDonations || 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Donation</p>
              <p className="text-lg font-semibold">
                {user?.donorInfo?.lastDonationDate 
                  ? new Date(user.donorInfo.lastDonationDate).toLocaleDateString()
                  : 'Never'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Eligible to Donate</p>
              <p className={`text-lg font-semibold ${user?.donorInfo?.isDonationEligible ? 'text-green-600' : 'text-red-600'}`}>
                {user?.donorInfo?.isDonationEligible ? 'Yes' : 'No'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
