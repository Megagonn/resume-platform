import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Sparkles } from 'lucide-react';
import type { Job } from '../types';
import { mockApi } from '../lib/mockApi';
import { formatNaira, jobTypeLabel } from '../lib/utils';
import { Avatar, Badge, EmptyState, Input, PageHeader, SearchField, Select, Spinner } from '../components/ui';

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [remote, setRemote] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    setLoading(true);
    mockApi
      .listJobs({
        q: q || undefined,
        type: type || undefined,
        remote: remote || undefined,
        location: location || undefined,
      })
      .then((res) => setJobs(res.jobs))
      .finally(() => setLoading(false));
  }, [q, type, remote, location]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <PageHeader
        title="Find Your Next Job Opportunity"
        subtitle="Discover verified job vacancies, graduate opportunities, internships, remote jobs and career opportunities across Nigeria and beyond."
      />
      <div className="mb-8 grid gap-3 rounded-2xl border border-border bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
        <SearchField
          className="sm:col-span-2 lg:col-span-1"
          placeholder="Search roles…"
          value={q}
          onChange={setQ}
        />
        <Select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">All types</option>
          <option value="full-time">Full-time</option>
          <option value="part-time">Part-time</option>
          <option value="contract">Contract</option>
          <option value="gig">Gig</option>
        </Select>
        <Select value={remote} onChange={(e) => setRemote(e.target.value)}>
          <option value="">Remote & on-site</option>
          <option value="true">Remote only</option>
          <option value="false">On-site</option>
        </Select>
        <Input
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>

      {loading ? (
        <Spinner />
      ) : jobs.length === 0 ? (
        <EmptyState title="No openings match" description="Try clearing filters." />
      ) : (
        <div className="space-y-4">
          {jobs.map((job, i) => (
            <Link
              key={job.id}
              to={`/jobs/${job.id}`}
              className="block rounded-2xl border border-border bg-white p-6 transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lift animate-fade-up"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <Avatar name={job.company?.name} src={job.company?.logo} />
                  <div>
                    <h2 className="text-lg font-semibold text-ink">{job.title}</h2>
                    <p className="mt-1 text-sm text-ink-muted">
                      {job.company?.name || 'Company'} · {jobTypeLabel(job.type)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {job.featured && (
                    <Badge tone="brand">
                      <span className="inline-flex items-center gap-1">
                        <Sparkles size={12} /> Featured
                      </span>
                    </Badge>
                  )}
                  {job.remote && <Badge tone="brand">Remote</Badge>}
                  <Badge>{jobTypeLabel(job.type)}</Badge>
                </div>
              </div>
              <p className="mt-3 line-clamp-2 text-sm text-ink-muted">{job.description}</p>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-ink-muted">
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
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
