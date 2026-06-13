'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAdminAuth } from '@/lib/adminAuthContext';
import { API_BASE, imageSrc } from '@/lib/api';

interface StoryItem {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
}

interface StoryFormState {
  title: string;
  description: string;
}

const emptyForm: StoryFormState = {
  title: '',
  description: '',
};

export default function AdminStoriesPage() {
  const { token } = useAdminAuth();
  const [stories, setStories] = useState<StoryItem[]>([]);
  const [form, setForm] = useState<StoryFormState>(emptyForm);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [editingId, setEditingId] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const headers = useMemo(() => ({
    Authorization: `Bearer ${token}`,
  }), [token]);

  const fetchStories = async () => {
    setLoading(true);
    const response = await fetch(`${API_BASE}/api/admin/stories`, { headers });
    const data = await response.json();
    setStories(data.stories || []);
    setLoading(false);
  };

  useEffect(() => {
    if (!token) return;
    fetchStories();
  }, [token]);

  const resetForm = () => {
    setForm(emptyForm);
    setSelectedImage(null);
    setEditingId('');
  };

  const handleEdit = (story: StoryItem) => {
    setEditingId(story._id);
    setForm({
      title: story.title,
      description: story.description,
    });
    setSelectedImage(null);
    setMessage('Editing story. Update fields and save changes.');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const payload = new FormData();
      payload.append('title', form.title);
      payload.append('description', form.description);

      if (selectedImage) {
        payload.append('image', selectedImage);
      }

      const response = await fetch(
        editingId
          ? `${API_BASE}/api/admin/stories/${editingId}`
          : `${API_BASE}/api/admin/stories`,
        {
          method: editingId ? 'PATCH' : 'POST',
          headers,
          body: payload,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save story');
      }

      setMessage(data.message || 'Story saved');
      resetForm();
      await fetchStories();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to save story');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const response = await fetch(`${API_BASE}/api/admin/stories/${id}`, {
      method: 'DELETE',
      headers,
    });
    const data = await response.json();
    setMessage(data.message || 'Story deleted');
    if (editingId === id) resetForm();
    await fetchStories();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) setSelectedImage(file);
  };

  const imagePreviewUrl = selectedImage ? URL.createObjectURL(selectedImage) : null;
  const isError = message.toLowerCase().includes('fail') || message.toLowerCase().includes('error');

  return (
    <div className="space-y-8">

      {/* ── FORM ── */}
      <form onSubmit={handleSubmit} noValidate>
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

          {/* Header bar */}
          <div className="flex items-center justify-between gap-4 bg-gradient-to-r from-red-600 to-rose-500 px-8 py-5">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">
                {editingId ? 'Edit Story' : 'Create New Story'}
              </h2>
              <p className="mt-0.5 text-sm text-red-100">
                {editingId
                  ? 'Update the fields below and save your changes.'
                  : 'Add a story to the Moments That Matter section on the homepage.'}
              </p>
            </div>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="flex items-center gap-1.5 rounded-full border border-white/30 bg-white/15 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition hover:bg-white/25"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel Edit
              </button>
            )}
          </div>

          {/* Two-column body */}
          <div className="grid gap-0 lg:grid-cols-[1fr_320px]">

            {/* Left — text fields */}
            <div className="space-y-6 p-8">

              {/* Title */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                  <svg className="h-4 w-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Story Title
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. How One Donation Changed Everything"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-red-400 focus:bg-white focus:ring-2 focus:ring-red-100"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                  <svg className="h-4 w-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h12M4 18h8" />
                  </svg>
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Share the impact — what happened, who was helped, why it matters..."
                  required
                  rows={7}
                  className="min-h-[160px] w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-red-400 focus:bg-white focus:ring-2 focus:ring-red-100"
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-400">Shown as a card on the public homepage.</p>
                  <p className="text-xs text-slate-400">{form.description.length} chars</p>
                </div>
              </div>

              {/* Story card preview */}
              {(form.title || form.description) && (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4">
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Card Preview</p>
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    {imagePreviewUrl && (
                      <div className="relative h-32 overflow-hidden">
                        <img src={imagePreviewUrl} alt="Preview" className="h-full w-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        <p className="absolute bottom-3 left-3 right-3 text-sm font-black text-white line-clamp-1">
                          {form.title || 'Story title'}
                        </p>
                      </div>
                    )}
                    {!imagePreviewUrl && form.title && (
                      <div className="bg-gradient-to-br from-red-500 to-rose-600 px-4 py-3">
                        <p className="text-sm font-black text-white line-clamp-1">{form.title}</p>
                      </div>
                    )}
                    {form.description && (
                      <p className="p-3 text-xs leading-relaxed text-slate-500 line-clamp-2">{form.description}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right — image upload */}
            <div className="flex flex-col gap-5 border-l border-slate-100 bg-slate-50/60 p-8">
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                  <svg className="h-4 w-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Story Image
                </label>

                {/* Drop zone */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('story-image-upload')?.click()}
                  className={`relative flex min-h-[210px] cursor-pointer flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border-2 border-dashed transition-all ${
                    dragOver
                      ? 'border-red-400 bg-red-50'
                      : imagePreviewUrl
                      ? 'border-transparent'
                      : 'border-slate-200 bg-white hover:border-red-300 hover:bg-red-50/30'
                  }`}
                >
                  {imagePreviewUrl ? (
                    <>
                      <img src={imagePreviewUrl} alt="Preview" className="h-full w-full object-cover" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/50 opacity-0 transition hover:opacity-100">
                        <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span className="text-sm font-medium text-white">Replace image</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50">
                        <svg className="h-6 w-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-slate-700">Drop image here</p>
                        <p className="text-xs text-slate-400">or click to browse</p>
                      </div>
                    </>
                  )}
                  <input
                    id="story-image-upload"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    required={!editingId}
                    onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
                  />
                </div>

                {selectedImage && (
                  <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-xs text-slate-600 shadow-sm">
                    <span className="truncate font-medium">{selectedImage.name}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedImage(null)}
                      className="ml-2 shrink-0 text-slate-400 hover:text-red-500"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
                <p className="text-xs text-slate-400">Accepted: JPG, PNG, WEBP · Max 5 MB</p>
              </div>

              {/* Tips card */}
              <div className="mt-auto rounded-2xl border border-amber-100 bg-amber-50 p-4">
                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-amber-700">
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Writing tips
                </p>
                <ul className="space-y-1 text-xs text-amber-700/80">
                  <li>· Keep titles short and emotionally resonant</li>
                  <li>· Focus on one person's impact or experience</li>
                  <li>· Use a clear, high-quality photo</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-between gap-4 border-t border-slate-100 bg-slate-50/80 px-8 py-4">
            <p className="text-xs text-slate-400">
              {editingId
                ? 'Changes will update the story immediately on the homepage.'
                : 'Story will appear in the Moments That Matter section.'}
            </p>
            <div className="flex gap-3">
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-red-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 active:scale-[0.98] disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
                    </svg>
                    Saving…
                  </>
                ) : editingId ? (
                  <>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Update Story
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Publish Story
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* ── PUBLISHED STORIES ── */}
      <section>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Published Stories</h3>
            <p className="text-sm text-slate-500">Shown in the Moments That Matter section on the homepage</p>
          </div>
          <div className="flex items-center gap-2">
            {loading && (
              <span className="flex items-center gap-1.5 text-xs text-slate-400">
                <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a8 8 0 100 16V16a8 8 0 01-8-8z" />
                </svg>
                Loading…
              </span>
            )}
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
              {stories.length} stor{stories.length !== 1 ? 'ies' : 'y'}
            </span>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {stories.map((story) => (
            <article
              key={story._id}
              className={`group overflow-hidden rounded-3xl border bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-red-500/10 ${
                editingId === story._id
                  ? 'border-red-300 ring-2 ring-red-100'
                  : 'border-slate-200'
              }`}
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={imageSrc(story.imageUrl)}
                  alt={story.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                {editingId === story._id && (
                  <div className="absolute right-3 top-3 rounded-full bg-red-500 px-2.5 py-0.5 text-xs font-semibold text-white shadow">
                    Editing
                  </div>
                )}
                <h4 className="absolute bottom-3 left-3 right-3 text-base font-black leading-tight text-white line-clamp-2">
                  {story.title}
                </h4>
              </div>

              {/* Body */}
              <div className="space-y-4 p-4">
                <p className="text-xs leading-relaxed text-slate-500 line-clamp-3">{story.description}</p>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(story)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-red-600 py-2 text-xs font-semibold text-white transition hover:bg-red-700 active:scale-[0.97]"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(story._id)}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 active:scale-[0.97]"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}

          {/* Empty state */}
          {!loading && stories.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-slate-200 py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
                <svg className="h-7 w-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-slate-700">No stories yet</p>
                <p className="mt-1 text-sm text-slate-400">Publish your first story using the form above.</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── TOAST ── */}
      {message && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-start gap-3 rounded-2xl border px-5 py-4 shadow-lg ${
            isError
              ? 'border-red-200 bg-red-50 text-red-700'
              : 'border-emerald-200 bg-emerald-50 text-emerald-700'
          }`}
        >
          {isError ? (
            <svg className="mt-0.5 h-5 w-5 shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          <p className="text-sm font-semibold">{message}</p>
          <button
            type="button"
            onClick={() => setMessage('')}
            className="ml-3 opacity-50 hover:opacity-100"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}