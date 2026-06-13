'use client';

import { useState, useEffect, useRef } from 'react';
import { useAdminAuth } from '@/lib/adminAuthContext';
import { API_BASE, imageSrc } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TeamMember {
  _id: string;
  name: string;
  title: string;
  bio: string;
  imageUrl: string;
}

const EMPTY_FORM = { name: '', title: '', bio: '' };

export default function AdminTeamPage() {
  const { token } = useAdminAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const authHeaders = { Authorization: `Bearer ${token}` };

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/team`, { headers: authHeaders });
      const data = await res.json();
      setMembers(data.team || []);
    } catch {
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchMembers();
  }, [token]);

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setSelectedFile(null);
    setPreviewUrl('');
    setExistingImageUrl('');
    setError('');
    setShowForm(true);
  };

  const openEdit = (m: TeamMember) => {
    setEditingId(m._id);
    setForm({ name: m.name, title: m.title, bio: m.bio });
    setSelectedFile(null);
    setPreviewUrl('');
    setExistingImageUrl(m.imageUrl);
    setError('');
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setSelectedFile(null);
    setPreviewUrl('');
    setExistingImageUrl('');
    setError('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const applyFile = (file: File) => {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) applyFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) applyFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.title.trim()) {
      setError('Name and title are required.');
      return;
    }
    if (!editingId && !selectedFile) {
      setError('Please select a photo.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const body = new FormData();
      body.append('name', form.name);
      body.append('title', form.title);
      body.append('bio', form.bio);
      if (selectedFile) body.append('image', selectedFile);

      const url = editingId
        ? `${API_BASE}/api/admin/team/${editingId}`
        : `${API_BASE}/api/admin/team`;
      const method = editingId ? 'PATCH' : 'POST';

      const res = await fetch(url, { method, headers: authHeaders, body });
      if (!res.ok) throw new Error('Failed to save');
      await fetchMembers();
      cancelForm();
    } catch {
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this team member?')) return;
    setDeletingId(id);
    try {
      await fetch(`${API_BASE}/api/admin/team/${id}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      setMembers((prev) => prev.filter((m) => m._id !== id));
    } catch {
      alert('Failed to delete. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const currentPreview = previewUrl || (existingImageUrl ? imageSrc(existingImageUrl) : '');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900">Team Management</h2>
          <p className="mt-1 text-slate-500">Add and manage team members shown on the public site.</p>
        </div>
        {!showForm && (
          <Button onClick={openAdd} className="bg-red-600 hover:bg-red-700 text-white">
            + Add Member
          </Button>
        )}
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-5">
            {editingId ? 'Edit Team Member' : 'Add New Team Member'}
          </h3>

          {error && (
            <p className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Photo upload */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Photo {!editingId && <span className="text-red-500">*</span>}
              </label>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed py-8 transition ${
                  dragOver
                    ? 'border-red-500 bg-red-50'
                    : 'border-slate-200 bg-slate-50 hover:border-red-400 hover:bg-red-50/40'
                }`}
              >
                {currentPreview ? (
                  <img
                    src={currentPreview}
                    alt="Preview"
                    className="h-32 w-32 rounded-full object-cover shadow ring-4 ring-white"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-200 text-4xl text-slate-400">
                    📷
                  </div>
                )}
                <p className="text-sm text-slate-500">
                  {currentPreview ? 'Click or drag to replace photo' : 'Click or drag to upload photo'}
                </p>
                <p className="text-xs text-slate-400">JPG, PNG, WEBP — max 5 MB</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
              {selectedFile && (
                <p className="text-xs text-green-600 font-medium">✓ {selectedFile.name}</p>
              )}
              {editingId && !selectedFile && existingImageUrl && (
                <p className="text-xs text-slate-400">Current photo will be kept if no new one is selected.</p>
              )}
            </div>

            {/* Name & Title */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Full Name *</label>
                <Input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Dr. Amina Kareem"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Title / Role *</label>
                <Input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Chief Medical Officer"
                  required
                />
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Bio</label>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                placeholder="Brief description about this team member…"
                rows={3}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              />
            </div>

            <div className="flex gap-3 pt-1">
              <Button type="submit" disabled={saving} className="bg-red-600 hover:bg-red-700 text-white">
                {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Add Member'}
              </Button>
              <Button type="button" variant="outline" onClick={cancelForm} disabled={saving}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Member List */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400 text-sm">
            Loading team members…
          </div>
        ) : members.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-4xl mb-3">👥</div>
            <p className="font-semibold text-slate-700">No team members yet</p>
            <p className="text-sm text-slate-400 mt-1">Click "Add Member" to add the first one.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Member</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Title</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 hidden md:table-cell">Bio</th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {members.map((m) => (
                <tr key={m._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {m.imageUrl ? (
                        <img
                          src={imageSrc(m.imageUrl)}
                          alt={m.name}
                          className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-slate-100"
                        />
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-500 text-xs font-bold">
                          {m.name.charAt(0)}
                        </div>
                      )}
                      <span className="font-semibold text-slate-900">{m.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{m.title}</td>
                  <td className="px-6 py-4 text-slate-500 hidden md:table-cell max-w-xs">
                    <span className="line-clamp-2">{m.bio || '—'}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(m)}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(m._id)}
                        disabled={deletingId === m._id}
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                      >
                        {deletingId === m._id ? '…' : 'Remove'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="text-xs text-slate-400">
        Team members and their photos are reflected on the public homepage immediately.
      </p>
    </div>
  );
}
