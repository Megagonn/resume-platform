import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { mockApi } from '../lib/mockApi';
import { formatDate } from '../lib/utils';
import type { BlogPost } from '../types';
import { EmptyState, Input, PageHeader, Spinner } from '../components/ui';

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  useEffect(() => {
    setLoading(true);
    mockApi
      .listBlogPosts(true, q || undefined)
      .then((res) => setPosts(res.posts))
      .finally(() => setLoading(false));
  }, [q]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <PageHeader
        title="Blog"
        subtitle="Career tips, hiring guidance, and updates from The Ready Brand."
      />
      <div className="mb-8 max-w-md">
        <Input
          placeholder="Search articles…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      {loading ? (
        <Spinner />
      ) : posts.length === 0 ? (
        <EmptyState title="No posts yet" description="Check back soon." />
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {posts.map((post, i) => (
            <Link
              key={post.id}
              to={`/blog/${post.slug}`}
              className="group overflow-hidden rounded-2xl border border-border bg-white transition hover:border-primary/30 hover:shadow-soft animate-fade-up"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className="aspect-[16/9] overflow-hidden bg-surface-muted">
                {post.coverImage ? (
                  <img
                    src={post.coverImage}
                    alt=""
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-primary-50 text-sm text-primary">
                    The Ready Brand
                  </div>
                )}
              </div>
              <div className="p-6">
                <p className="text-xs uppercase tracking-wide text-ink-muted">
                  {post.publishedAt ? formatDate(post.publishedAt) : formatDate(post.createdAt)}
                  {post.author?.name ? ` · ${post.author.name}` : ''}
                </p>
                <h2 className="mt-2 text-xl font-semibold text-ink group-hover:text-primary">
                  {post.title}
                </h2>
                <p className="mt-2 line-clamp-3 text-sm text-ink-muted">{post.excerpt}</p>
                <span className="mt-4 inline-block text-sm font-medium text-primary">
                  Read more →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
