import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { mockApi } from '../lib/mockApi';
import { formatDate } from '../lib/utils';
import type { BlogPost } from '../types';
import { Spinner } from '../components/ui';

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    mockApi
      .getBlogPost(slug)
      .then((res) => setPost(res.post))
      .catch(() => setPost(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <Spinner />;
  if (!post) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="font-display text-2xl">Post not found</p>
        <Link to="/blog" className="mt-4 inline-block text-primary">
          Back to blog
        </Link>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 animate-fade-in">
      <Link to="/blog" className="text-sm font-medium text-primary hover:underline">
        ← All posts
      </Link>
      <header className="mt-6 border-b border-border pb-8">
        <p className="text-sm text-ink-muted">
          {post.publishedAt ? formatDate(post.publishedAt) : formatDate(post.createdAt)}
          {post.author?.name ? ` · ${post.author.name}` : ''}
        </p>
        <h1 className="mt-3 font-display text-4xl text-ink leading-tight">{post.title}</h1>
        <p className="mt-4 text-lg text-ink-muted">{post.excerpt}</p>
      </header>
      <div className="prose-ready mt-8 space-y-4 text-ink leading-relaxed">
        {post.content.split('\n\n').map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>
    </article>
  );
}
