import { FormEvent, useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotify } from '../../context/NotificationContext';
import { getErrorMessage } from '../../lib/errors';
import { mockApi } from '../../lib/mockApi';
import { Button, Card, Input, PageHeader, Spinner, Textarea } from '../../components/ui';

export default function SeekerProfile() {
  const { user, setUser } = useAuth();
  const { notifySuccess, notifyError } = useNotify();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [resumeName, setResumeName] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
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

  const onAvatarFile = async (file: File | null) => {
    if (!file || !user) return;
    setUploadingAvatar(true);
    try {
      const res = await mockApi.uploadImage(file);
      setAvatarUrl(res.file.url);
      notifySuccess('Photo uploaded — save profile to keep it.');
    } catch (err) {
      notifyError(getErrorMessage(err, 'Photo upload failed'));
    } finally {
      setUploadingAvatar(false);
    }
  };

  const onResumeFile = async (file: File | null) => {
    if (!file || !user) return;
    setUploadingResume(true);
    try {
      const res = await mockApi.uploadDocument(file);
      setResumeUrl(res.file.url);
      setResumeName(file.name);
      notifySuccess('CV uploaded — save profile to keep it.');
    } catch (err) {
      notifyError(getErrorMessage(err, 'CV upload failed'));
    } finally {
      setUploadingResume(false);
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
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
      notifySuccess('Profile updated successfully.');
    } catch (err) {
      notifyError(getErrorMessage(err, 'Save failed'));
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
          <div className="flex flex-wrap items-start gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-50 text-xl font-semibold text-primary">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                name.charAt(0)?.toUpperCase() || '?'
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
              {uploadingAvatar && <p className="text-xs text-ink-muted">Uploading photo…</p>}
            </div>
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
          <div className="space-y-2">
            <span className="text-sm font-medium text-ink-muted">Resume / CV (optional)</span>
            <input
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="block w-full text-sm text-ink-muted file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
              onChange={(e) => onResumeFile(e.target.files?.[0] || null)}
              disabled={uploadingResume}
            />
            {uploadingResume && <p className="text-xs text-ink-muted">Uploading CV…</p>}
            {resumeUrl && (
              <p className="text-sm">
                Current:{' '}
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-primary underline"
                >
                  {resumeName || 'View CV'}
                </a>
              </p>
            )}
          </div>
          <Input
            label="Years of experience"
            type="number"
            min={0}
            value={experienceYears}
            onChange={(e) => setExperienceYears(e.target.value)}
          />
        </Card>

        <Button type="submit" disabled={saving || uploadingAvatar || uploadingResume}>
          {saving ? 'Saving…' : 'Save profile'}
        </Button>
      </form>
    </div>
  );
}
