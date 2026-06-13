'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { API_BASE } from '@/lib/api';

interface Donor {
  _id: string;
  fullName: string;
  phone: string;
  email: string;
  bloodGroup: string;
  city: string;
  area: string;
  availability: string;
}

export default function DonorSearch() {
  const [searchBloodType, setSearchBloodType] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setHasSearched(true);

    try {
      const params = new URLSearchParams();
      if (searchBloodType) params.append('bloodType', searchBloodType);
      if (searchCity) params.append('city', searchCity);

      const response = await fetch(
        `${API_BASE}/api/public/donors/search?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error('Failed to search donors');
      }

      const data = await response.json();
      setDonors(data.donors || []);
    } catch (err: any) {
      setError(err.message || 'Error searching donors');
    } finally {
      setLoading(false);
    }
  };

  const handleContactDonor = (donor: Donor) => {
    alert(`Contact ${donor.fullName} at ${donor.phone}`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Find Available Donors</CardTitle>
          <CardDescription>Search for available donors by blood group and city</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-2">
                <label htmlFor="bloodType" className="text-sm font-medium">Blood Group</label>
                <div className="relative">
                  <select
                    id="bloodType"
                    value={searchBloodType}
                    onChange={(e) => setSearchBloodType(e.target.value)}
                    disabled={loading}
                    className="w-full px-4 py-3 pr-10 border border-red-600/30 rounded-lg bg-gray-900/50 text-white hover:border-red-600/50 focus:border-red-600 focus:ring-1 focus:ring-red-600/50 transition-all duration-300 appearance-none"
                  >
                  <option value="">Any</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  </select>
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="city" className="text-sm font-medium">City</label>
                <Input
                  id="city"
                  placeholder="City"
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                />
              </div>

              <div className="flex items-end">
                <Button type="submit" disabled={loading || (!searchBloodType && !searchCity)}>
                  {loading ? 'Searching...' : 'Search'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {hasSearched && (
        <Card>
          <CardHeader>
            <CardTitle>Available Donors</CardTitle>
            <CardDescription>Donors available with {searchBloodType} blood type</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p>Searching for donors...</p>
              </div>
            ) : donors.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No eligible donors found with {searchBloodType} blood type</p>
              </div>
            ) : (
              <div className="space-y-3">
                {donors.map((donor) => (
                  <div key={donor._id} className="p-4 border border-border rounded-lg hover:bg-muted transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold">{donor.fullName || 'Unnamed'}</h3>
                        <div className="text-sm text-muted-foreground space-y-1 mt-2">
                          <p>Blood Group: <span className="font-medium text-primary">{donor.bloodGroup}</span></p>
                          <p>City: <span className="font-medium">{donor.city || '—'}</span></p>
                          <p>Phone: <span className="font-medium">{donor.phone || '—'}</span></p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`mb-3 px-3 py-1 rounded-full text-sm font-medium ${
                          donor.availability === 'available'
                            ? 'bg-green-500/20 text-green-700 dark:text-green-400'
                            : 'bg-red-500/20 text-red-700 dark:text-red-400'
                        }`}>
                          {donor.availability === 'available' ? 'Available' : 'Unavailable'}
                        </div>
                        {donor.availability === 'available' && (
                          <Button size="sm" onClick={() => handleContactDonor(donor)}>
                            Contact
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
