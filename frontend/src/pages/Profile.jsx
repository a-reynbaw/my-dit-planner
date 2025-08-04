import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { User, Edit3, Check, X, Hash, BookOpen, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

function Profile() {
  const { t, i18n } = useTranslation();
  const [profile, setProfile] = useState({
    sdi: '',
    first_name: '',
    last_name: '',
    current_semester: '',
    direction: '',
  });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});

  // Direction options with translations
  const directions = [
    { value: 'Not Selected', label: t('profile.directions.notSelected') },
    { value: 'CS', label: t('profile.directions.cs') },
    { value: 'CET', label: t('profile.directions.cet') },
  ];

  // Semester options (1-8) with translations
  const semesters = Array.from({ length: 8 }, (_, i) => ({
    value: i + 1,
    label: t('profile.values.semester', { number: i + 1 }),
  }));

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const [sdiRes, firstNameRes, lastNameRes, currentSemesterRes, directionRes] =
        await Promise.all([
          fetch('/api/profile/sdi'),
          fetch('/api/profile/first_name'),
          fetch('/api/profile/last_name'),
          fetch('/api/profile/current_semester'),
          fetch('/api/profile/direction'),
        ]);

      const [sdiData, firstNameData, lastNameData, currentSemesterData, directionData] =
        await Promise.all([
          sdiRes.json(),
          firstNameRes.json(),
          lastNameRes.json(),
          currentSemesterRes.json(),
          directionRes.json(),
        ]);

      const profileData = {
        sdi: sdiData.sdi || '',
        first_name: firstNameData.first_name || '',
        last_name: lastNameData.last_name || '',
        current_semester: currentSemesterData.current_semester || '',
        direction: directionData.direction || 'Not Selected',
      };

      setProfile(profileData);
      setEditedProfile(profileData);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error(t('profile.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
    setEditedProfile({ ...profile });
  };

  const handleCancel = () => {
    setEditing(false);
    setEditedProfile({ ...profile });
  };

  const handleSave = async () => {
    try {
      if (!editedProfile.first_name || !editedProfile.last_name) {
        toast.error(t('profile.validation.nameRequired'));
        return;
      }
      if (!editedProfile.sdi || editedProfile.sdi.toString().length !== 7) {
        toast.error(t('profile.validation.sdiRequired'));
        return;
      }

      const updatePromises = [];
      if (editedProfile.sdi !== profile.sdi) {
        updatePromises.push(
          fetch('/api/profile/sdi', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sdi: parseInt(editedProfile.sdi) }),
          })
        );
      }
      if (editedProfile.first_name !== profile.first_name) {
        updatePromises.push(
          fetch('/api/profile/first_name', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ first_name: editedProfile.first_name }),
          })
        );
      }
      if (editedProfile.last_name !== profile.last_name) {
        updatePromises.push(
          fetch('/api/profile/last_name', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ last_name: editedProfile.last_name }),
          })
        );
      }
      if (editedProfile.current_semester !== profile.current_semester) {
        updatePromises.push(
          fetch('/api/profile/current_semester', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              current_semester: editedProfile.current_semester
                ? parseInt(editedProfile.current_semester)
                : null,
            }),
          })
        );
      }
      if (editedProfile.direction !== profile.direction) {
        updatePromises.push(
          fetch('/api/profile/direction', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              direction:
                editedProfile.direction === 'Not Selected' ? null : editedProfile.direction,
            }),
          })
        );
      }

      const responses = await Promise.all(updatePromises);
      for (const response of responses) {
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || t('profile.profileUpdateFailed'));
        }
      }

      setProfile(editedProfile);
      setEditing(false);
      toast.success(t('profile.profileUpdated'));
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.message || t('profile.profileUpdateFailed'));
    }
  };

  const handleInputChange = (field, value) => {
    setEditedProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLanguageChange = async (newLang) => {
    try {
      await fetch('/api/profile/language', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: newLang }),
      });
      i18n.changeLanguage(newLang);
      toast.success(t('profile.languageChanged'));
    } catch (error) {
      console.error('Error updating language:', error);
      toast.error(t('profile.languageChangeFailed'));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  const fullName =
    profile.first_name && profile.last_name
      ? `${profile.first_name} ${profile.last_name}`
      : t('profile.fullName');
  const directionLabel =
    directions.find((d) => d.value === profile.direction)?.label || t('profile.values.notSelected');

  return (
    <div className="bg-gray-900 min-h-screen text-white font-sans p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <header className="flex items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">{t('profile.title')}</h1>
            <p className="text-lg text-gray-400">{t('profile.subtitle')}</p>
          </div>
        </header>

        <Card className="bg-gray-800/80 border-gray-700 text-white overflow-hidden backdrop-blur-sm">
          <div className="grid md:grid-cols-12">
            {/* Left Sidebar / Avatar Section */}
            <div className="md:col-span-4 bg-gray-800/50 p-6 border-b md:border-b-0 md:border-r border-gray-700 flex flex-col items-center justify-center text-center">
              <div className="w-28 h-28 rounded-full bg-blue-500/20 flex items-center justify-center mb-4 border-2 border-blue-400/50">
                <User className="w-16 h-16 text-blue-300" />
              </div>
              <h2 className="text-2xl font-bold text-white">{fullName}</h2>
              <p className="text-gray-400">
                <span className="font-mono">sdi{profile.sdi || 'XXXXXXX'}</span>
              </p>
              <div className="mt-4 text-sm text-center">
                <p className="text-gray-300">
                  <span className="font-semibold text-orange-400">{t('profile.direction')}:</span>{' '}
                  {directionLabel}
                </p>
                <p className="text-gray-300">
                  <span className="font-semibold text-purple-400">{t('profile.semester')}:</span>{' '}
                  {profile.current_semester
                    ? ` ${profile.current_semester}`
                    : ` ${t('profile.values.notSet')}`}
                </p>
              </div>
            </div>

            {/* Right Content / Form Section */}
            <div className="md:col-span-8 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-blue-300">
                  {t('profile.accountDetails')}
                </h3>
                {!editing ? (
                  <Button
                    onClick={handleEdit}
                    variant="outline"
                    size="sm"
                    className="bg-gray-700 border-gray-600 hover:bg-gray-600"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    {t('profile.editProfile')}
                  </Button>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handleSave}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      {t('profile.saveChanges')}
                    </Button>
                    <Button
                      onClick={handleCancel}
                      variant="ghost"
                      size="sm"
                      className="text-gray-300 hover:bg-gray-700"
                    >
                      <X className="h-4 w-4 mr-2" />
                      {t('profile.cancel')}
                    </Button>
                  </div>
                )}
              </div>

              {editing ? (
                // EDITING VIEW
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        {t('profile.fields.firstName')}
                      </label>
                      <Input
                        value={editedProfile.first_name}
                        onChange={(e) => handleInputChange('first_name', e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder={t('profile.placeholders.firstName')}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        {t('profile.fields.lastName')}
                      </label>
                      <Input
                        value={editedProfile.last_name}
                        onChange={(e) => handleInputChange('last_name', e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder={t('profile.placeholders.lastName')}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      {t('profile.fields.sdi')}
                    </label>
                    <Input
                      type="number"
                      value={editedProfile.sdi}
                      onChange={(e) => handleInputChange('sdi', parseInt(e.target.value) || '')}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder={t('profile.placeholders.sdi')}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        {t('profile.fields.currentSemester')}
                      </label>
                      <Select
                        value={editedProfile.current_semester?.toString() || ''}
                        onValueChange={(value) =>
                          handleInputChange('current_semester', value ? parseInt(value) : '')
                        }
                      >
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue placeholder={t('profile.placeholders.selectSemester')} />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700 text-white">
                          {semesters.map((sem) => (
                            <SelectItem
                              key={sem.value}
                              value={sem.value.toString()}
                              className="focus:bg-gray-700"
                            >
                              {sem.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        {t('profile.fields.academicDirection')}
                      </label>
                      <Select
                        value={editedProfile.direction}
                        onValueChange={(value) => handleInputChange('direction', value)}
                      >
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue placeholder={t('profile.placeholders.selectDirection')} />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700 text-white">
                          {directions.map((dir) => (
                            <SelectItem
                              key={dir.value}
                              value={dir.value}
                              className="focus:bg-gray-700"
                            >
                              {dir.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ) : (
                // VIEWING VIEW
                <dl className="space-y-6 text-sm">
                  <div className="grid grid-cols-3 gap-2">
                    <dt className="font-medium text-gray-400 flex items-center gap-2">
                      <User className="h-4 w-4" /> {t('profile.fields.firstName')}
                    </dt>
                    <dd className="col-span-2 text-gray-200">
                      {profile.first_name || t('profile.values.notSet')}
                    </dd>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <dt className="font-medium text-gray-400 flex items-center gap-2">
                      <User className="h-4 w-4" /> {t('profile.fields.lastName')}
                    </dt>
                    <dd className="col-span-2 text-gray-200">
                      {profile.last_name || t('profile.values.notSet')}
                    </dd>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <dt className="font-medium text-gray-400 flex items-center gap-2">
                      <Hash className="h-4 w-4" /> {t('profile.fields.sdi')}
                    </dt>
                    <dd className="col-span-2 font-mono text-gray-200">
                      {profile.sdi || t('profile.values.notSet')}
                    </dd>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <dt className="font-medium text-gray-400 flex items-center gap-2">
                      <BookOpen className="h-4 w-4" /> {t('profile.fields.currentSemester')}
                    </dt>
                    <dd className="col-span-2 text-gray-200">
                      {profile.current_semester
                        ? t('profile.values.semester', { number: profile.current_semester })
                        : t('profile.values.notSet')}
                    </dd>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <dt className="font-medium text-gray-400 flex items-center gap-2">
                      <Settings className="h-4 w-4" /> {t('profile.fields.academicDirection')}
                    </dt>
                    <dd className="col-span-2 text-gray-200">{directionLabel}</dd>
                  </div>
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      {t('profile.language')}
                    </label>
                    <Select value={i18n.language} onValueChange={handleLanguageChange}>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700 text-white">
                        <SelectItem value="en" className="focus:bg-gray-700 focus:text-white">
                          English
                        </SelectItem>
                        <SelectItem value="el" className="focus:bg-gray-700 focus:text-white">
                          Ελληνικά
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </dl>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Profile;
