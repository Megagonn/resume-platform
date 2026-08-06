import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { mockApi } from '../../lib/mockApi';
import type { CompanySubscription } from '../../types';
import { Badge, Button, Card, Input, PageHeader, Spinner, Textarea } from '../../components/ui';

export default function HirerCompany() {
  const { user, setUser } = useAuth();
  const [accountName, setAccountName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [name, setName] = useState('');
  const [logo, setLogo] = useState('');
  const [website, setWebsite] = useState('');
  const [location, setLocation] = useState('');
  const [about, setAbout] = useState('');
  const [subscription, setSubscription] = useState<CompanySubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [savingAccount, setSavingAccount] = useState(false);
  const [savingCompany, setSavingCompany] = useState(false);
  const [accountMsg, setAccountMsg] = useState('');
  const [companyMsg, setCompanyMsg] = useState('');
  const [accountErr, setAccountErr] = useState('');
  const [companyErr, setCompanyErr] = useState('');

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setLoadError('');
    mockApi
      .getHirerAccount(user.id)
      .then((res) => {
        setAccountName(res.user.name);
        setPhone(res.user.phone || '');
        setAvatarUrl(res.user.avatarUrl || '');
        if (res.company) {
          setName(res.company.name);
          setLogo(res.company.logo || '');
          setWebsite(res.company.website || '');
          setLocation(res.company.location || '');
          setAbout(res.company.about || '');
          setSubscription(res.company.subscription);
        } else {
          setName('');
          setLoadError('No company profile yet — fill in the details below to create one.');
        }
      })
      .catch((err) => {
        setLoadError(err instanceof Error ? err.message : 'Failed to load profile');
      })
      .finally(() => setLoading(false));
  }, [user]);

  const onSaveAccount = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingAccount(true);
    setAccountMsg('');
    setAccountErr('');
    try {
      const res = await mockApi.updateHirerAccount(user.id, {
        name: accountName,
        phone,
        avatarUrl,
      });
      setUser(res.user);
      setAccountMsg('Account updated.');
    } catch (err) {
      setAccountErr(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSavingAccount(false);
    }
  };

  const onSaveCompany = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingCompany(true);
    setCompanyMsg('');
    setCompanyErr('');
    try {
      const res = await mockApi.updateCompany(user.id, {
        name,
        logo,
        website,
        location,
        about,
      });
      setSubscription(res.company.subscription);
      setCompanyMsg('Company profile saved.');
      setLoadError('');
    } catch (err) {
      setCompanyErr(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSavingCompany(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader
        title="Profile & company"
        subtitle="Update your account and the company shown on job listings."
        actions={
          subscription ? (
            <Link to="/hirer/billing">
              <Badge tone="brand">{subscription.plan} plan</Badge>
            </Link>
          ) : undefined
        }
      />

      {loadError && (
        <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {loadError}
        </p>
      )}

      <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-2">
        <form onSubmit={onSaveAccount} className="space-y-4">
          <Card className="space-y-4">
            <h2 className="font-semibold">Your account</h2>
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-primary-50 font-semibold text-primary">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  accountName.charAt(0)?.toUpperCase() || '?'
                )}
              </div>
              <Input
                label="Avatar URL"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
              />
            </div>
            <Input
              label="Full name"
              required
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
            />
            <Input label="Email" value={user?.email || ''} disabled />
            <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            {accountMsg && <p className="text-sm text-emerald-700">{accountMsg}</p>}
            {accountErr && <p className="text-sm text-red-600">{accountErr}</p>}
            <Button type="submit" disabled={savingAccount}>
              {savingAccount ? 'Saving…' : 'Save account'}
            </Button>
          </Card>
        </form>

        <form onSubmit={onSaveCompany} className="space-y-4">
          <Card className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-semibold">Company profile</h2>
              <Link to="/hirer/billing" className="text-sm text-primary underline">
                Manage plan
              </Link>
            </div>
            <Input
              label="Company name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input label="Logo URL" value={logo} onChange={(e) => setLogo(e.target.value)} />
            <Input label="Website" value={website} onChange={(e) => setWebsite(e.target.value)} />
            <Input
              label="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <Textarea label="About" value={about} onChange={(e) => setAbout(e.target.value)} />
            {companyMsg && <p className="text-sm text-emerald-700">{companyMsg}</p>}
            {companyErr && <p className="text-sm text-red-600">{companyErr}</p>}
            <Button type="submit" disabled={savingCompany}>
              {savingCompany ? 'Saving…' : 'Save company'}
            </Button>
          </Card>
        </form>
      </div>
    </div>
  );
}
