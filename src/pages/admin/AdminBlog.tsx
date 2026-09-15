import { FormEvent, useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotify } from '../../context/NotificationContext';
import { mockApi } from '../../lib/mockApi';
import { getErrorMessage } from '../../lib/errors';
import { formatDate } from '../../lib/utils';
import type { BlogPost } from '../../types';
import {
  Badge,
  Button,
  EmptyState,
  Input,
  PageHeader,
  Spinner,
  Textarea,
  statusTone,
} from '../../components/ui';

const emptyForm = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  coverImage: '',
  published: false,
};

export default function AdminBlog() {
  const { user } = useAuth();
  const { notifySuccess, notifyError } = useNotify();
  const fileRef = useRef<HTMLInputElement>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await mockApi.adminListBlogPosts();
      setPosts(res.posts);
    } catch (err) {
      notifyError(getErrorMessage(err, 'Failed to load blog posts'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const startEdit = (post: BlogPost) => {
    setEditingId(post.id);
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      coverImage: post.coverImage || '',
      published: post.published,
    });
  };

  const startNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    if (fileRef.current) fileRef.current.value = '';
  };

  const onUploadCover = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    try {
      const res = await mockApi.uploadImage(file);
      setForm((f) => ({ ...f, coverImage: res.file.url }));
      notifySuccess('Cover image uploaded.');
    } catch (err) {
      notifyError(getErrorMessage(err, 'Upload failed'));
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      if (editingId) {
        await mockApi.adminUpdateBlogPost(editingId, form);
        notifySuccess('Post updated.');
      } else {
        await mockApi.adminCreateBlogPost(user.id, form);
        notifySuccess('Post created.');
      }
      startNew();
      await load();
    } catch (err) {
      notifyError(getErrorMessage(err, 'Save failed'));
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm('Delete this post?')) return;
    try {
      await mockApi.adminDeleteBlogPost(id);
      notifySuccess('Post deleted.');
      if (editingId === id) startNew();
      await load();
    } catch (err) {
      notifyError(getErrorMessage(err, 'Delete failed'));
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader
        title="Blog"
        subtitle="Publish career and hiring articles for everyone."
        actions={
          <Button size="sm" variant="outline" onClick={startNew}>
            New post
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          {posts.length === 0 ? (
            <EmptyState title="No posts" description="Create your first article." />
          ) : (
            posts.map((p) => (
              <div key={p.id} className="overflow-hidden rounded-2xl border border-border bg-white">
                {p.coverImage && (
                  <img src={p.coverImage} alt="" className="h-28 w-full object-cover" />
                )}
                <div className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">{p.title}</p>
                      <p className="text-xs text-ink-muted">
                        /{p.slug} · {formatDate(p.updatedAt)}
                      </p>
                    </div>
                    <Badge tone={statusTone(p.published ? 'published' : 'draft')}>
                      {p.published ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                  <div className="mt-3 flex gap-3 text-sm">
                    <button
                      type="button"
                      className="font-medium text-primary"
                      onClick={() => startEdit(p)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="font-medium text-red-600"
                      onClick={() => onDelete(p.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-2xl border border-border bg-white p-6"
        >
          <h3 className="font-semibold">{editingId ? 'Edit post' : 'New post'}</h3>
          <Input
            label="Title"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <Input
            label="Slug (optional)"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            placeholder="auto-from-title"
          />
          <Input
            label="Excerpt"
            required
            value={form.excerpt}
            onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
          />
          <Textarea
            label="Content"
            required
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
          />

          <div className="space-y-2">
            <span className="text-sm font-medium text-ink-muted">Cover image</span>
            {form.coverImage ? (
              <img
                src={form.coverImage}
                alt="Cover preview"
                className="h-40 w-full rounded-xl object-cover border border-border"
              />
            ) : (
              <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-border bg-surface-muted text-sm text-ink-muted">
                No cover yet
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="block w-full text-sm text-ink-muted file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
              onChange={(e) => onUploadCover(e.target.files?.[0] || null)}
              disabled={uploading}
            />
            <Input
              label="Or paste image URL"
              value={form.coverImage.startsWith('data:') ? '' : form.coverImage}
              onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
              placeholder="/images/… or https://…"
            />
            {uploading && <p className="text-sm text-ink-muted">Uploading…</p>}
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setForm({ ...form, published: e.target.checked })}
            />
            Publish publicly
          </label>
          <Button type="submit" disabled={saving || uploading}>
            {saving ? 'Saving…' : editingId ? 'Update post' : 'Create post'}
          </Button>
        </form>
      </div>
    </div>
  );
}
