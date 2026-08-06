import { useEffect, useState } from 'react';
import { mockApi } from '../../lib/mockApi';
import { formatDate, statusLabel } from '../../lib/utils';
import type { User, UserRole } from '../../types';
import { Badge, PageHeader, Select, Spinner, statusTone } from '../../components/ui';

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    mockApi
      .adminUsers()
      .then((res) => setUsers(res.users))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const onRole = async (id: string, role: UserRole) => {
    await mockApi.adminUpdateUser(id, { role });
    load();
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="Users" subtitle="Seekers, hirers, and admins." />
      <div className="overflow-x-auto rounded-2xl border border-border bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-border bg-surface-muted/50 text-ink-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3 text-ink-muted">{u.email}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Badge tone={statusTone(u.role)}>{statusLabel(u.role)}</Badge>
                    <Select
                      value={u.role}
                      onChange={(e) => onRole(u.id, e.target.value as UserRole)}
                      className="max-w-[120px] py-1.5 text-xs"
                    >
                      <option value="seeker">seeker</option>
                      <option value="hirer">hirer</option>
                      <option value="admin">admin</option>
                    </Select>
                  </div>
                </td>
                <td className="px-4 py-3 text-ink-muted">{formatDate(u.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
