import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotify } from '../../context/NotificationContext';
import { getErrorMessage } from '../../lib/errors';
import { mockApi } from '../../lib/mockApi';
import type { CompanySubscription } from '../../types';
import { Badge, Button, Card, Input, PageHeader, Spinner, Textarea } from '../../components/ui';

export default function HirerCompany() {
  const { user, setUser } = useAuth();
  const { notifySuccess, notifyError } = useNotify();
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
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
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
        const msg = getErrorMessage(err, 'Failed to load profile');
        setLoadError(msg);
        notifyError(msg);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const onAvatarFile = async (file: File | null) => {
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const res = await mockApi.uploadImage(file);
      setAvatarUrl(res.file.url);
      notifySuccess('Photo uploaded — save account to keep it.');
    } catch (err) {
      notifyError(getErrorMessage(err, 'Photo upload failed'));
    } finally {
      setUploadingAvatar(false);
    }
  };

  const onLogoFile = async (file: File | null) => {
    if (!file) return;
    setUploadingLogo(true);
    try {
      const res = await mockApi.uploadImage(file);
      setLogo(res.file.url);
      notifySuccess('Logo uploaded — save company to keep it.');
    } catch (err) {
      notifyError(getErrorMessage(err, 'Logo upload failed'));
    } finally {
      setUploadingLogo(false);
    }
  };

  const onSaveAccount = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingAccount(true);
    try {
      const res = await mockApi.updateHirerAccount(user.id, {
        name: accountName,
        phone,
        avatarUrl,
      });
      setUser(res.user);
      notifySuccess('Account updated.');
    } catch (err) {
      notifyError(getErrorMessage(err, 'Save failed'));
    } finally {
      setSavingAccount(false);
    }
  };

  const onSaveCompany = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingCompany(true);
    try {
      const res = await mockApi.updateCompany(user.id, {
        name,
        logo,
        website,
        location,
        about,
      });
      setSubscription(res.company.subscription);
      notifySuccess('Company profile saved.');
      setLoadError('');
    } catch (err) {
      notifyError(getErrorMessage(err, 'Save failed'));
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
            <div className="flex flex-wrap items-start gap-3">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-50 font-semibold text-primary">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  accountName.charAt(0)?.toUpperCase() || '?'
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <span className="text-sm font-medium text-ink-muted">Profile photo</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="block w-full text-sm text-ink-muted file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
                  onChange={(e) => onAvatarFile(e.target.files?.[0] || null)}
                  disabled={uploadingAvatar}
                />
                {uploadingAvatar && <p className="text-xs text-ink-muted">Uploading…</p>}
              </div>
            </div>
            <Input
              label="Full name"
              required
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
            />
            <Input label="Email" value={user?.email || ''} disabled />
            <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <Button type="submit" disabled={savingAccount || uploadingAvatar}>
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
            <div className="space-y-2">
              <span className="text-sm font-medium text-ink-muted">Company logo</span>
              {logo && (
                <img
                  src={logo}
                  alt="Logo"
                  className="h-16 w-16 rounded-xl border border-border object-cover"
                />
              )}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="block w-full text-sm text-ink-muted file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
                onChange={(e) => onLogoFile(e.target.files?.[0] || null)}
                disabled={uploadingLogo}
              />
              {uploadingLogo && <p className="text-xs text-ink-muted">Uploading logo…</p>}
            </div>
            <Input label="Website" value={website} onChange={(e) => setWebsite(e.target.value)} />
            <Input
              label="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <Textarea label="About" value={about} onChange={(e) => setAbout(e.target.value)} />
            <Button type="submit" disabled={savingCompany || uploadingLogo}>
              {savingCompany ? 'Saving…' : 'Save company'}
            </Button>
          </Card>
        </form>
      </div>
    </div>
  );
}
