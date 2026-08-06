import { FormEvent, useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { mockApi } from '../../lib/mockApi';
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
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await mockApi.adminListBlogPosts();
      setPosts(res.posts);
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
    setMessage('');
  };

  const startNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setMessage('');
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setMessage('');
    try {
      if (editingId) {
        await mockApi.adminUpdateBlogPost(editingId, form);
        setMessage('Post updated.');
      } else {
        await mockApi.adminCreateBlogPost(user.id, form);
        setMessage('Post created.');
      }
      startNew();
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm('Delete this post?')) return;
    await mockApi.adminDeleteBlogPost(id);
    if (editingId === id) startNew();
    await load();
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
              <div
                key={p.id}
                className="rounded-2xl border border-border bg-white p-4"
              >
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
          <Input
            label="Cover image URL"
            value={form.coverImage}
            onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setForm({ ...form, published: e.target.checked })}
            />
            Publish publicly
          </label>
          {message && <p className="text-sm text-primary">{message}</p>}
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : editingId ? 'Update post' : 'Create post'}
          </Button>
        </form>
      </div>
    </div>
  );
}
