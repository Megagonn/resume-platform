import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotify } from '../../context/NotificationContext';
import { getErrorMessage } from '../../lib/errors';
import { mockApi } from '../../lib/mockApi';
import type { JobType, JobStatus, PlanEntitlements } from '../../types';
import { Button, Input, PageHeader, Select, Textarea } from '../../components/ui';

export default function HirerJobNew() {
  const { user } = useAuth();
  const { notifyError } = useNotify();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<JobType>('full-time');
  const [location, setLocation] = useState('');
  const [remote, setRemote] = useState(false);
  const [featured, setFeatured] = useState(false);
  const [status, setStatus] = useState<JobStatus>('open');
  const [tags, setTags] = useState('');
  const [minSal, setMinSal] = useState('');
  const [maxSal, setMaxSal] = useState('');
  const [entitlements, setEntitlements] = useState<PlanEntitlements | null>(null);
  const [openJobs, setOpenJobs] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    mockApi.getSubscription(user.id).then((res) => {
      setEntitlements(res.entitlements);
      setOpenJobs(res.usage.openJobs);
    });
  }, [user]);

  const atOpenLimit =
    entitlements?.maxOpenJobs !== null &&
    entitlements?.maxOpenJobs !== undefined &&
    openJobs >= entitlements.maxOpenJobs &&
    status === 'open';

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const res = await mockApi.createJob(user.id, {
        title,
        description,
        type,
        location,
        remote,
        featured: entitlements?.featuredAllowed ? featured : false,
        status,
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        salaryRange:
          minSal || maxSal
            ? {
                min: minSal ? Number(minSal) : undefined,
                max: maxSal ? Number(maxSal) : undefined,
                currency: 'NGN',
              }
            : undefined,
      });
      navigate(`/hirer/jobs/${res.job.id}`);
    } catch (err) {
      notifyError(getErrorMessage(err, 'Failed to create'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader title="Post an opening" subtitle="Share a role, contract, or gig." />
      {atOpenLimit && (
        <div className="mb-6 rounded-2xl border border-primary/30 bg-primary-50 p-4 text-sm">
          You have used all open job slots on your current plan ({openJobs}/
          {entitlements?.maxOpenJobs}). Save as draft or{' '}
          <Link to="/hirer/billing" className="font-medium text-primary underline">
            upgrade to Premium
          </Link>
          .
        </div>
      )}
      <form
        onSubmit={onSubmit}
        className="max-w-2xl space-y-4 rounded-2xl border border-border bg-white p-6"
      >
        <Input label="Title" required value={title} onChange={(e) => setTitle(e.target.value)} />
        <Textarea
          label="Description"
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Type"
            value={type}
            onChange={(e) => setType(e.target.value as JobType)}
          >
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="gig">Gig</option>
          </Select>
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as JobStatus)}
          >
            <option value="draft">Draft</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </Select>
        </div>
        <Input
          label="Location"
          required
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={remote}
            onChange={(e) => setRemote(e.target.checked)}
            className="rounded border-border"
          />
          Remote-friendly
        </label>
        {entitlements?.featuredAllowed ? (
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
        <Input
          label="Tags (comma-separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Salary min (NGN)"
            type="number"
            value={minSal}
            onChange={(e) => setMinSal(e.target.value)}
          />
          <Input
            label="Salary max (NGN)"
            type="number"
            value={maxSal}
            onChange={(e) => setMaxSal(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={saving || atOpenLimit}>
          {saving ? 'Publishing…' : 'Publish opening'}
        </Button>
      </form>
    </div>
  );
}
