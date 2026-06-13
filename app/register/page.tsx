'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { BrandMark } from '@/components/BrandMark';
import { API_BASE } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    qimsId: '',
    phone: '',
    email: '',
    gender: '',
    age: '',
    department: '',
    bloodGroup: '',
    city: '',
    area: '',
    lastDonationDate: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const bloodGroups = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];
  const handleBloodSelect = (g: string) => setFormData(prev => ({ ...prev, bloodGroup: g }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const ageNumber = Number(formData.age);
    if (Number.isNaN(ageNumber) || ageNumber < 18) {
      setError('Age must be 18 or above');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/public/donors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          qimsId: formData.qimsId || undefined,
          phone: formData.phone,
          email: formData.email || undefined,
          gender: formData.gender,
          age: ageNumber,
          department: formData.department || undefined,
          bloodGroup: formData.bloodGroup,
          city: formData.city,
          area: formData.area,
          lastDonationDate: formData.lastDonationDate || undefined,
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setSuccess('Donor registration submitted successfully.');
      setFormData({
        fullName: '',
        qimsId: '',
        phone: '',
        email: '',
        gender: '',
        age: '',
        department: '',
        bloodGroup: '',
        city: '',
        area: '',
        lastDonationDate: '',
      });
      // redirect to home after briefly showing the success message
      setTimeout(() => router.push('/'), 1500);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-red-600/20 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl opacity-10"></div>
      </div>

      <div className="w-full max-w-2xl animate-slideUp">
        {/* Header */}
            <div className="text-center mb-8">
          <Link href="/" className="mb-6 inline-flex justify-center transition hover:opacity-90">
            <BrandMark compact />
          </Link>
          <h1 className="text-3xl font-black text-white mb-2">Register as Donor</h1>
          <p className="text-gray-400">Submit your details to be listed as an available donor.</p>
        </div>

        {/* Registration Card */}
        <div className="bg-black/70 border border-red-600/30 rounded-2xl p-8 backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-600/20 border border-red-600/50 text-red-400 text-sm p-4 rounded-lg flex items-start gap-3 animate-slideDown">
                <span className="text-lg">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-green-600/20 border border-green-600/50 text-green-300 text-sm p-4 rounded-lg flex items-start gap-3 animate-slideDown">
                <span className="text-lg">✓</span>
                <span>{success}</span>
              </div>
            )}

            {/* Donor registration only (no role selection) */}

            {/* Common Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="fullName" className="text-sm font-semibold text-white">Full Name</label>
                <Input
                  id="fullName"
                  name="fullName"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="bg-gray-900/50 border-red-600/30 text-white placeholder:text-gray-500 h-11 rounded-lg transition-all duration-300 hover:border-red-600/50 focus:border-red-600 focus:ring-1 focus:ring-red-600/50"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="qimsId" className="text-sm font-semibold text-white">QIMS ID (optional)</label>
                <Input id="qimsId" name="qimsId" placeholder="QIMS-2022-087" value={formData.qimsId} onChange={handleChange} disabled={loading} className="bg-gray-900/50 border-red-600/30 text-white placeholder:text-gray-500 h-11 rounded-lg" />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-semibold text-white">Email</label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  
                  disabled={loading}
                  className="bg-gray-900/50 border-red-600/30 text-white placeholder:text-gray-500 h-11 rounded-lg transition-all duration-300 hover:border-red-600/50 focus:border-red-600 focus:ring-1 focus:ring-red-600/50"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-semibold text-white">Phone</label>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="+1 5550000000"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="bg-gray-900/50 border-red-600/30 text-white placeholder:text-gray-500 h-11 rounded-lg transition-all duration-300 hover:border-red-600/50 focus:border-red-600 focus:ring-1 focus:ring-red-600/50"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="city" className="text-sm font-semibold text-white">City</label>
                <Input
                  id="city"
                  name="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="bg-gray-900/50 border-red-600/30 text-white placeholder:text-gray-500 h-11 rounded-lg transition-all duration-300 hover:border-red-600/50 focus:border-red-600 focus:ring-1 focus:ring-red-600/50"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="area" className="text-sm font-semibold text-white">Area</label>
                <Input
                  id="area"
                  name="area"
                  placeholder="Area"
                  value={formData.area}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="bg-gray-900/50 border-red-600/30 text-white placeholder:text-gray-500 h-11 rounded-lg transition-all duration-300 hover:border-red-600/50 focus:border-red-600 focus:ring-1 focus:ring-red-600/50"
                />
              </div>

                      <div className="space-y-2">
                        <label htmlFor="gender" className="text-sm font-semibold text-white">Gender</label>
                        <div className="relative">
                          <select
                            id="gender"
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            disabled={loading}
                            className="w-full px-4 py-3 pr-10 border border-red-600/30 rounded-lg bg-gray-900/50 text-white hover:border-red-600/50 focus:border-red-600 focus:ring-1 focus:ring-red-600/50 transition-all duration-300 appearance-none"
                          >
                            <option value="">Select gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                          <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      </div>

              <div className="space-y-2">
                <label htmlFor="age" className="text-sm font-semibold text-white">Age</label>
                <Input
                  id="age"
                  name="age"
                  type="number"
                  placeholder="18"
                  value={formData.age}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="bg-gray-900/50 border-red-600/30 text-white placeholder:text-gray-500 h-11 rounded-lg transition-all duration-300 hover:border-red-600/50 focus:border-red-600 focus:ring-1 focus:ring-red-600/50"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="department" className="text-sm font-semibold text-white">Department / Year</label>
                <select id="department" name="department" value={formData.department} onChange={handleChange} disabled={loading} className="w-full px-4 py-3 pr-10 border border-red-600/30 rounded-lg bg-gray-900/50 text-white hover:border-red-600/50 focus:border-red-600 focus:ring-1 focus:ring-red-600/50 transition-all duration-300 appearance-none">
                  <option value="">Select department/year</option>
                  <option>MBBS 1st Year</option>
                  <option>MBBS 2nd Year</option>
                  <option>MBBS 3rd Year</option>
                  <option>MBBS 4th Year</option>
                  <option>MBBS 5th Year</option>
                  <option>BDS</option>
                  <option>Nursing</option>
                  <option>Faculty/Staff</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="bloodGroup" className="text-sm font-semibold text-white">Blood Group</label>
                <div className="relative">
                  <div className="flex flex-wrap gap-2">
                    {bloodGroups.map((g) => (
                      <button key={g} type="button" onClick={() => handleBloodSelect(g)} className={`px-3 py-1 rounded-full border ${formData.bloodGroup === g ? 'bg-red-600 text-white border-red-600' : 'bg-transparent text-white border-red-600/30'}`}>
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Availability removed — public donors register without availability */}

              <div className="space-y-2">
                <label htmlFor="lastDonationDate" className="text-sm font-semibold text-white">Last Donation Date (optional)</label>
                <Input
                  id="lastDonationDate"
                  name="lastDonationDate"
                  type="date"
                  value={formData.lastDonationDate}
                  onChange={handleChange}
                  disabled={loading}
                  className="bg-gray-900/50 border-red-600/30 text-white placeholder:text-gray-500 h-11 rounded-lg transition-all duration-300 hover:border-red-600/50 focus:border-red-600 focus:ring-1 focus:ring-red-600/50"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold h-12 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-red-600/50"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Register as Donor'}
            </Button>
          </form>

          {/* Public donor registration does not require an account. */}
        </div>

        {/* Footer Link */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-gray-400 hover:text-red-600 transition text-sm">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
