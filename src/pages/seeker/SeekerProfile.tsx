import { FormEvent, useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { mockApi } from '../../lib/mockApi';
import { Button, Card, Input, PageHeader, Spinner, Textarea } from '../../components/ui';

export default function SeekerProfile() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setPhone(user.phone || '');
    setAvatarUrl(user.avatarUrl || '');
    setHeadline(user.seekerProfile?.headline || '');
    setBio(user.seekerProfile?.bio || '');
    setLocation(user.seekerProfile?.location || '');
    setSkills((user.seekerProfile?.skills || []).join(', '));
    setResumeUrl(user.seekerProfile?.resumeUrl || '');
    setExperienceYears(
      user.seekerProfile?.experienceYears != null
        ? String(user.seekerProfile.experienceYears)
        : ''
    );
    setLoading(false);
  }, [user]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const res = await mockApi.updateSeekerProfile(user.id, {
        name,
        phone,
        avatarUrl,
        seekerProfile: {
          headline,
          bio,
          location,
          skills: skills
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          resumeUrl,
          experienceYears: experienceYears ? Number(experienceYears) : undefined,
        },
      });
      setUser(res.user);
      setMessage('Profile updated successfully.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader
        title="Your profile"
        subtitle="Keep your details current so hirers and CV writers can help you faster."
      />
      <form onSubmit={onSubmit} className="mx-auto max-w-2xl space-y-6">
        <Card className="space-y-4">
          <h2 className="font-semibold">Account</h2>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-primary-50 text-lg font-semibold text-primary">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                name.charAt(0)?.toUpperCase() || '?'
              )}
            </div>
            <Input
              label="Avatar URL"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://…"
              className="flex-1"
            />
          </div>
          <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Email" value={user?.email || ''} disabled />
          <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </Card>

        <Card className="space-y-4">
          <h2 className="font-semibold">Career profile</h2>
          <Input
            label="Headline"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="e.g. Product Designer"
          />
          <Textarea label="Bio" value={bio} onChange={(e) => setBio(e.target.value)} />
          <Input label="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
          <Input
            label="Skills (comma-separated)"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
          />
          <Input
            label="Resume URL"
            value={resumeUrl}
            onChange={(e) => setResumeUrl(e.target.value)}
          />
          <Input
            label="Years of experience"
            type="number"
            min={0}
            value={experienceYears}
            onChange={(e) => setExperienceYears(e.target.value)}
          />
        </Card>

        {message && <p className="text-sm text-emerald-700">{message}</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save profile'}
        </Button>
      </form>
    </div>
  );
}
