'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/lib/adminAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { BrandMark } from '@/components/BrandMark';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAdminAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      router.push('/admin/overview');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-1/4 right-0 w-80 h-80 bg-red-600/20 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl opacity-10"></div>
      </div>

      <div className="w-full max-w-md animate-slideUp">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="mb-6 inline-flex justify-center transition hover:opacity-90">
            <BrandMark compact />
          </Link>
          <h1 className="text-3xl font-black text-white mb-2">Admin Login</h1>
          <p className="text-gray-400">Secure access for system administrators</p>
        </div>

        {/* Login Card */}
        <div className="bg-linear-to-br from-gray-900/50 to-black border border-red-600/30 rounded-2xl p-8 backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-600/20 border border-red-600/50 text-red-400 text-sm p-4 rounded-lg flex items-start gap-3 animate-slideDown">
                <span className="text-lg shrink-0">⚠️</span>
                <span>{error}</span>
              </div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-semibold text-white">
                Username
              </label>
              <Input
                id="username"
                type="text"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
                className="bg-gray-900/50 border-red-600/30 text-white placeholder:text-gray-500 h-12 rounded-lg transition-all duration-300 hover:border-red-600/50 focus:border-red-600 focus:ring-1 focus:ring-red-600/50"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-semibold text-white">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="bg-gray-900/50 border-red-600/30 text-white placeholder:text-gray-500 h-12 rounded-lg transition-all duration-300 hover:border-red-600/50 focus:border-red-600 focus:ring-1 focus:ring-red-600/50"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold h-12 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-red-600/50" 
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm">
            <p className="text-gray-500">Public users do not log in. Donors and recipients use forms only.</p>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-gray-400 hover:text-red-600 transition text-sm">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
