import { useEffect, useMemo, useState } from 'react';
import { Briefcase, Mail, MapPin, Package, Phone } from 'lucide-react';
import { mockApi } from '../../lib/mockApi';
import { formatDate, formatNaira, statusLabel } from '../../lib/utils';
import type {
  AdminUserRow,
  Application,
  Company,
  Job,
  Order,
  User,
  UserRole,
} from '../../types';
import {
  Avatar,
  Badge,
  DetailBlock,
  Drawer,
  FilterPills,
  MiniStat,
  PageHeader,
  SearchField,
  Select,
  Spinner,
  TableShell,
  Td,
  Th,
  statusTone,
} from '../../components/ui';

type UserDetail = {
  user: User;
  company?: Company;
  applications: Application[];
  orders: Order[];
  jobs: (Job & { applicationCount?: number })[];
  stats: AdminUserRow['stats'];
};

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = () => {
    setLoading(true);
    mockApi
      .adminUsers()
      .then((res) => setUsers(res.users as AdminUserRow[]))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    setDetailLoading(true);
    mockApi
      .adminUserDetail(selectedId)
      .then((res) => setDetail(res as UserDetail))
      .finally(() => setDetailLoading(false));
  }, [selectedId]);

  const onRole = async (id: string, role: UserRole) => {
    await mockApi.adminUpdateUser(id, { role });
    load();
    if (selectedId === id) {
      mockApi.adminUserDetail(id).then((res) => setDetail(res as UserDetail));
    }
  };

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      if (!query) return true;
      return (
        u.name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        (u.phone || '').toLowerCase().includes(query) ||
        (u.seekerProfile?.headline || '').toLowerCase().includes(query) ||
        (u.company?.name || '').toLowerCase().includes(query)
      );
    });
  }, [users, q, roleFilter]);

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader
        title="Users"
        subtitle="Profiles, activity, and company records across the platform."
      />

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <FilterPills
          value={roleFilter}
          onChange={setRoleFilter}
          options={[
            { id: 'all', label: `All (${users.length})` },
            { id: 'seeker', label: `Seekers (${users.filter((u) => u.role === 'seeker').length})` },
            { id: 'hirer', label: `Hirers (${users.filter((u) => u.role === 'hirer').length})` },
            { id: 'admin', label: `Admins (${users.filter((u) => u.role === 'admin').length})` },
          ]}
        />
        <SearchField
          className="lg:w-80"
          placeholder="Search name, email, company…"
          value={q}
          onChange={setQ}
        />
      </div>

      <TableShell minWidth="min-w-[880px]">
        <thead className="border-b border-border bg-surface-muted/50 text-ink-muted">
          <tr>
            <Th>Person</Th>
            <Th>Contact</Th>
            <Th>Role</Th>
            <Th>Platform activity</Th>
            <Th>Joined</Th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((u) => (
            <tr
              key={u.id}
              className="cursor-pointer border-b border-border last:border-0 transition hover:bg-primary-50/40"
              onClick={() => setSelectedId(u.id)}
            >
              <Td>
                <div className="flex items-center gap-3">
                  <Avatar name={u.name} src={u.avatarUrl} />
                  <div>
                    <p className="font-semibold text-ink">{u.name}</p>
                    <p className="text-xs text-ink-muted">
                      {u.role === 'hirer'
                        ? u.company?.name || 'Company pending'
                        : u.seekerProfile?.headline || 'Job seeker'}
                    </p>
                  </div>
                </div>
              </Td>
              <Td>
                <p className="text-ink-muted">{u.email}</p>
                {u.phone && <p className="text-xs text-ink-muted">{u.phone}</p>}
              </Td>
              <Td>
                <Badge tone={statusTone(u.role)}>{statusLabel(u.role)}</Badge>
              </Td>
              <Td>
                {u.role === 'hirer' ? (
                  <p className="text-ink-muted">
                    {u.stats.jobsPosted} jobs · {u.stats.openJobs} open
                  </p>
                ) : u.role === 'seeker' ? (
                  <p className="text-ink-muted">
                    {u.stats.applications} apps · {u.stats.orders} orders
                  </p>
                ) : (
                  <p className="text-ink-muted">Admin</p>
                )}
              </Td>
              <Td className="text-ink-muted">{formatDate(u.createdAt)}</Td>
            </tr>
          ))}
        </tbody>
      </TableShell>

      <Drawer
        open={!!selectedId}
        onClose={() => setSelectedId(null)}
        title={detail?.user.name || 'User'}
        subtitle={detail?.user.email}
        wide
      >
        {detailLoading || !detail ? (
          <Spinner />
        ) : (
          <UserDetailBody detail={detail} onRole={onRole} />
        )}
      </Drawer>
    </div>
  );
}

function UserDetailBody({
  detail,
  onRole,
}: {
  detail: UserDetail;
  onRole: (id: string, role: UserRole) => void;
}) {
  const { user, company, stats, applications, orders, jobs } = detail;
  const profile = user.seekerProfile;

  return (
    <div className="space-y-8">
      <div className="flex items-start gap-4">
        <Avatar name={user.name} src={user.avatarUrl} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-ink">{user.name}</p>
          <p className="text-sm text-ink-muted">
            {user.role === 'hirer' ? company?.name : profile?.headline || statusLabel(user.role)}
          </p>
          <div className="mt-3 max-w-[180px]">
            <Select
              label="Role"
              value={user.role}
              onChange={(e) => onRole(user.id, e.target.value as UserRole)}
              className="py-1.5 text-xs"
            >
              <option value="seeker">Seeker</option>
              <option value="hirer">Hirer</option>
              <option value="admin">Admin</option>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {user.role === 'hirer' ? (
          <>
            <MiniStat label="Jobs posted" value={stats.jobsPosted} />
            <MiniStat label="Open now" value={stats.openJobs} />
            <MiniStat
              label="Applicants"
              value={jobs.reduce((n, j) => n + (j.applicationCount || 0), 0)}
            />
            <MiniStat label="Plan" value={statusLabel(company?.subscription.plan || '—')} />
          </>
        ) : (
          <>
            <MiniStat label="Applications" value={stats.applications} />
            <MiniStat label="Hired" value={stats.hired} />
            <MiniStat label="CV orders" value={stats.orders} />
            <MiniStat label="Experience" value={profile?.experienceYears ?? '—'} />
          </>
        )}
      </div>

      <DetailBlock title="Contact">
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2 text-ink-muted">
            <Mail size={14} /> {user.email}
          </li>
          {user.phone && (
            <li className="flex items-center gap-2 text-ink-muted">
              <Phone size={14} /> {user.phone}
            </li>
          )}
          {(profile?.location || company?.location) && (
            <li className="flex items-center gap-2 text-ink-muted">
              <MapPin size={14} /> {profile?.location || company?.location}
            </li>
          )}
        </ul>
      </DetailBlock>

      {user.role === 'seeker' && (
        <DetailBlock title="Seeker profile">
          {profile?.bio ? (
            <p className="text-sm leading-relaxed text-ink">{profile.bio}</p>
          ) : (
            <p className="text-sm text-ink-muted">No bio yet.</p>
          )}
          {profile?.skills && profile.skills.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {profile.skills.map((s) => (
                <Badge key={s}>{s}</Badge>
              ))}
            </div>
          )}
          {profile?.resumeUrl && (
            <a
              href={profile.resumeUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
            >
              View resume
            </a>
          )}
        </DetailBlock>
      )}

      {user.role === 'hirer' && company && (
        <DetailBlock title="Company">
          <div className="rounded-2xl border border-border bg-surface-muted/40 p-4">
            <p className="font-semibold">{company.name}</p>
            {company.about && <p className="mt-2 text-sm text-ink-muted">{company.about}</p>}
            <p className="mt-3 text-xs text-ink-muted">
              {company.location || 'Location not set'}
              {company.website ? ` · ${company.website}` : ''}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge tone="brand">{statusLabel(company.subscription.plan)}</Badge>
              <Badge tone={statusTone(company.subscription.status)}>
                {statusLabel(company.subscription.status)}
              </Badge>
            </div>
          </div>
        </DetailBlock>
      )}

      {user.role === 'seeker' && (
        <>
          <DetailBlock title="Applications">
            {applications.length === 0 ? (
              <p className="text-sm text-ink-muted">No applications.</p>
            ) : (
              <ul className="space-y-2">
                {applications.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-center justify-between gap-2 rounded-xl border border-border px-3 py-2.5 text-sm"
                  >
                    <span className="font-medium">{a.job?.title}</span>
                    <Badge tone={statusTone(a.status)}>{statusLabel(a.status)}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </DetailBlock>
          <DetailBlock title="CV orders">
            {orders.length === 0 ? (
              <p className="text-sm text-ink-muted">No CV orders.</p>
            ) : (
              <ul className="space-y-2">
                {orders.map((o) => (
                  <li
                    key={o.id}
                    className="flex items-center justify-between gap-2 rounded-xl border border-border px-3 py-2.5 text-sm"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Package size={14} className="text-primary" />
                      {o.package?.name} · {formatNaira(o.amount)}
                    </span>
                    <Badge tone={statusTone(o.status)}>{statusLabel(o.status)}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </DetailBlock>
        </>
      )}

      {user.role === 'hirer' && (
        <DetailBlock title="Jobs posted">
          {jobs.length === 0 ? (
            <p className="text-sm text-ink-muted">No jobs yet.</p>
          ) : (
            <ul className="space-y-2">
              {jobs.map((j) => (
                <li
                  key={j.id}
                  className="flex items-center justify-between gap-2 rounded-xl border border-border px-3 py-2.5 text-sm"
                >
                  <span className="inline-flex items-center gap-2 font-medium">
                    <Briefcase size={14} className="text-primary" />
                    {j.title}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="text-xs text-ink-muted">{j.applicationCount || 0} apps</span>
                    <Badge tone={statusTone(j.status)}>{statusLabel(j.status)}</Badge>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </DetailBlock>
      )}

      <p className="text-xs text-ink-muted">Joined {formatDate(user.createdAt)}</p>
    </div>
  );
}
