import { FormEvent, useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { mockApi } from '../../lib/mockApi';
import { Button, Input, PageHeader, Spinner, Textarea } from '../../components/ui';

export default function SeekerProfile() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setPhone(user.phone || '');
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
    try {
      const res = await mockApi.updateSeekerProfile(user.id, {
        name,
        phone,
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
      setMessage('Profile saved.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="Your profile" subtitle="Basics hirers and writers can reference." />
      <form
        onSubmit={onSubmit}
        className="max-w-xl space-y-4 rounded-2xl border border-border bg-white p-6"
      >
        <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
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
        {message && <p className="text-sm text-primary">{message}</p>}
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save profile'}
        </Button>
      </form>
    </div>
  );
}
