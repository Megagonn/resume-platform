import { FormEvent, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { mockApi } from '../../lib/mockApi';
import { formatDate, statusLabel } from '../../lib/utils';
import type {
  Application,
  ApplicationStatus,
  Job,
  JobStatus,
  PlanEntitlements,
} from '../../types';
import {
  Badge,
  Button,
  EmptyState,
  Input,
  PageHeader,
  Select,
  Spinner,
  Textarea,
  statusTone,
} from '../../components/ui';

const appStatuses: ApplicationStatus[] = [
  'new',
  'reviewing',
  'shortlisted',
  'rejected',
  'hired',
];

export default function HirerJobDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [apps, setApps] = useState<Application[]>([]);
  const [previewCapped, setPreviewCapped] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [entitlements, setEntitlements] = useState<PlanEntitlements | null>(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<JobStatus>('open');
  const [featured, setFeatured] = useState(false);
  const [canFeature, setCanFeature] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const load = async () => {
    if (!user || !id) return;
    setLoading(true);
    try {
      const [res, sub] = await Promise.all([
        mockApi.listJobApplications(user.id, id),
        mockApi.getSubscription(user.id),
      ]);
      setJob(res.job);
      setApps(res.applications);
      setPreviewCapped(res.previewCapped);
      setTotalCount(res.totalCount);
      setEntitlements(res.entitlements);
      setTitle(res.job.title);
      setDescription(res.job.description);
      setStatus(res.job.status);
      setFeatured(res.job.featured);
      setCanFeature(sub.entitlements.featuredAllowed);
    } catch {
      setJob(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [user, id]);

  const onSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !id) return;
    setSaving(true);
    setMessage('');
    try {
      const res = await mockApi.updateJob(user.id, id, {
        title,
        description,
        status,
        featured: canFeature ? featured : false,
      });
      setJob(res.job);
      setMessage('Opening updated.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const onStatus = async (appId: string, next: ApplicationStatus) => {
    if (!user) return;
    await mockApi.updateApplicationStatus(user.id, appId, next);
    load();
  };

  if (loading) return <Spinner />;
  if (!job) {
    return (
      <div>
        <p>Opening not found.</p>
        <Link to="/hirer/jobs" className="text-primary">
          Back
        </Link>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={job.title}
        subtitle="Edit listing and review applicants."
        actions={
          <Link to="/hirer/jobs">
            <Button variant="outline" size="sm">
              All openings
            </Button>
          </Link>
        }
      />
      <form
        onSubmit={onSave}
        className="mb-10 space-y-4 rounded-2xl border border-border bg-white p-6"
      >
        <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value as JobStatus)}
        >
          <option value="draft">Draft</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
        </Select>
        {canFeature ? (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="rounded border-border"
            />
            Feature on the job board
          </label>
        ) : (
          <p className="text-sm text-ink-muted">
            Featured listings require Premium.{' '}
            <Link to="/hirer/billing" className="text-primary underline">
              Upgrade
            </Link>
          </p>
        )}
        {message && <p className="text-sm text-primary">{message}</p>}
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save changes'}
        </Button>
      </form>

      <h2 className="mb-4 font-display text-2xl">
        Applicants ({previewCapped ? `${apps.length} of ${totalCount}` : apps.length})
      </h2>
      {previewCapped && (
        <div className="mb-4 rounded-2xl border border-primary/30 bg-primary-50 p-4 text-sm">
          Free plan shows the first {entitlements?.applicantPreviewLimit ?? 5} applicants without
          resume or phone details.{' '}
          <Link to="/hirer/billing" className="font-medium text-primary underline">
            Upgrade for full access
          </Link>
          .
        </div>
      )}
      {apps.length === 0 ? (
        <EmptyState title="No applicants yet" />
      ) : (
        <div className="space-y-3">
          {apps.map((a) => (
            <div key={a.id} className="rounded-2xl border border-border bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{a.seeker?.name}</p>
                  <p className="text-sm text-ink-muted">
                    {a.seeker?.email}
                    {a.seeker?.phone ? ` · ${a.seeker.phone}` : ''} · Applied{' '}
                    {formatDate(a.createdAt)}
                  </p>
                </div>
                <Badge tone={statusTone(a.status)}>{statusLabel(a.status)}</Badge>
              </div>
              {a.coverNote && <p className="mt-3 text-sm text-ink-muted">{a.coverNote}</p>}
              {a.resumeUrl && (
                <a
                  href={a.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-sm text-primary underline"
                >
                  View resume
                </a>
              )}
              <div className="mt-4">
                <Select
                  label="Update status"
                  value={a.status}
                  onChange={(e) => onStatus(a.id, e.target.value as ApplicationStatus)}
                >
                  {appStatuses.map((s) => (
                    <option key={s} value={s}>
                      {statusLabel(s)}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
