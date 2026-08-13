import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import type { Job } from '../types';
import { mockApi } from '../lib/mockApi';
import { formatDate, formatNaira, jobTypeLabel } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { Avatar, Badge, Button, Spinner, Textarea } from '../components/ui';

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApply, setShowApply] = useState(false);
  const [coverNote, setCoverNote] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeUrl, setResumeUrl] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    mockApi
      .getJob(id)
      .then((res) => setJob(res.job))
      .catch(() => setJob(null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (user?.role === 'seeker' && user.seekerProfile?.resumeUrl) {
      setResumeUrl(user.seekerProfile.resumeUrl);
    }
  }, [user]);

  const onApply = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/auth/login');
      return;
    }
    if (user.role !== 'seeker') {
      setError('Only job seekers can apply.');
      return;
    }
    if (!resumeFile && !resumeUrl) {
      setError('Upload a CV or ensure one is saved on your profile.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await mockApi.applyToJob(id!, user.id, {
        coverNote,
        resumeUrl: resumeFile ? undefined : resumeUrl || undefined,
        resumeFile: resumeFile || undefined,
      });
      setSuccess('Application submitted.');
      setShowApply(false);
      setResumeFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner />;
  if (!job) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="font-display text-2xl">Job not found</p>
        <Link to="/jobs" className="mt-4 inline-block text-primary">
          Back to jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 animate-fade-in">
      <Link to="/jobs" className="text-sm font-medium text-primary hover:underline">
        ← All jobs
      </Link>
      <div className="mt-6 rounded-3xl border border-border bg-white p-8 shadow-soft">
        <div className="flex flex-wrap gap-2">
          {job.featured && <Badge tone="brand">Featured</Badge>}
          <Badge tone="brand">{jobTypeLabel(job.type)}</Badge>
          {job.remote && <Badge>Remote</Badge>}
          {job.tags.map((t) => (
            <Badge key={t} tone="neutral">
              {t}
            </Badge>
          ))}
        </div>
        <div className="mt-6 flex items-start gap-4">
          <Avatar name={job.company?.name} src={job.company?.logo} size="lg" />
          <div>
            <h1 className="font-display text-3xl text-ink md:text-4xl">{job.title}</h1>
            <p className="mt-2 text-ink-muted">
              {job.company?.name} · Posted {formatDate(job.createdAt)}
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-ink-muted">
          <span className="inline-flex items-center gap-1">
            <MapPin size={14} /> {job.location}
          </span>
          {job.salaryRange && (
            <span>
              {formatNaira(job.salaryRange.min || 0)}
              {job.salaryRange.max ? ` – ${formatNaira(job.salaryRange.max)}` : '+'}
            </span>
          )}
        </div>
        <div className="mt-8 whitespace-pre-wrap text-ink leading-relaxed">{job.description}</div>
        {job.company?.about && (
          <div className="mt-8 rounded-2xl bg-surface-muted p-5">
            <h2 className="font-semibold text-ink">About {job.company.name}</h2>
            <p className="mt-2 text-sm text-ink-muted">{job.company.about}</p>
          </div>
        )}
        {success && <p className="mt-6 text-sm font-medium text-emerald-700">{success}</p>}
        {error && !showApply && <p className="mt-6 text-sm text-red-600">{error}</p>}
        <div className="mt-8">
          {!showApply ? (
            <Button
              onClick={() => {
                if (!user) navigate('/auth/login');
                else setShowApply(true);
              }}
            >
              Apply now
            </Button>
          ) : (
            <form onSubmit={onApply} className="space-y-4 rounded-2xl border border-border p-5">
              <Textarea
                label="Cover note"
                value={coverNote}
                onChange={(e) => setCoverNote(e.target.value)}
                required
              />
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-ink-muted">CV / resume</span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="block w-full text-sm text-ink-muted file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
                  onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                />
                {resumeFile ? (
                  <p className="text-sm text-primary">Selected: {resumeFile.name}</p>
                ) : resumeUrl ? (
                  <p className="text-xs text-ink-muted">
                    Using CV from your profile.{' '}
                    <a href={resumeUrl} target="_blank" rel="noreferrer" className="text-primary underline">
                      Preview
                    </a>{' '}
                    — or upload a different file above.
                  </p>
                ) : (
                  <p className="text-xs text-ink-muted">
                    Upload a PDF or Word CV for this application.
                  </p>
                )}
              </label>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex gap-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Submitting…' : 'Submit application'}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setShowApply(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
