import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

function Profile() {
  const navigate = useNavigate();
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

  // Direction options
  const directions = [
    { value: 'Not Selected', label: 'Not Selected' },
    { value: 'CS', label: 'Computer Science (CS)' },
    { value: 'CET', label: 'Computer Engineering & Telecommunications (CET)' },
  ];

  // Semester options (1-8)
  const semesters = Array.from({ length: 8 }, (_, i) => ({
    value: i + 1,
    label: `Semester ${i + 1}`,
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
      toast.error('Failed to load profile data');
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
        toast.error('First name and last name are required');
        return;
      }
      if (!editedProfile.sdi || editedProfile.sdi.toString().length !== 7) {
        toast.error('SDI must be a 7-digit number');
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
          throw new Error(errorData.detail || 'Failed to update profile');
        }
      }

      setProfile(editedProfile);
      setEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    }
  };

  const handleInputChange = (field, value) => {
    setEditedProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
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
      : 'Student Name';
  const directionLabel =
    directions.find((d) => d.value === profile.direction)?.label || 'Not selected';

  return (
    <div className="bg-gray-900 min-h-screen text-white font-sans p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <header className="flex items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Your Profile</h1>
            <p className="text-lg text-gray-400">
              View and manage your personal information and academic preferences.
            </p>
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
                  <span className="font-semibold text-orange-400">Direction:</span> {directionLabel}
                </p>
                <p className="text-gray-300">
                  <span className="font-semibold text-purple-400">Semester:</span>{' '}
                  {profile.current_semester ? ` ${profile.current_semester}` : ' Not set'}
                </p>
              </div>
            </div>

            {/* Right Content / Form Section */}
            <div className="md:col-span-8 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-blue-300">Account Details</h3>
                {!editing ? (
                  <Button
                    onClick={handleEdit}
                    variant="outline"
                    size="sm"
                    className="bg-gray-700 border-gray-600 hover:bg-gray-600"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handleSave}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button
                      onClick={handleCancel}
                      variant="ghost"
                      size="sm"
                      className="text-gray-300 hover:bg-gray-700"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
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
                        First Name
                      </label>
                      <Input
                        value={editedProfile.first_name}
                        onChange={(e) => handleInputChange('first_name', e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="Enter first name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Last Name
                      </label>
                      <Input
                        value={editedProfile.last_name}
                        onChange={(e) => handleInputChange('last_name', e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="Enter last name"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Student ID (SDI)
                    </label>
                    <Input
                      type="number"
                      value={editedProfile.sdi}
                      onChange={(e) => handleInputChange('sdi', parseInt(e.target.value) || '')}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="Enter 7-digit SDI"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Current Semester
                      </label>
                      <Select
                        value={editedProfile.current_semester?.toString() || ''}
                        onValueChange={(value) =>
                          handleInputChange('current_semester', value ? parseInt(value) : '')
                        }
                      >
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue placeholder="Select semester" />
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
                        Academic Direction
                      </label>
                      <Select
                        value={editedProfile.direction}
                        onValueChange={(value) => handleInputChange('direction', value)}
                      >
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue placeholder="Select direction" />
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
                      <User className="h-4 w-4" /> First Name
                    </dt>
                    <dd className="col-span-2 text-gray-200">{profile.first_name || 'Not set'}</dd>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <dt className="font-medium text-gray-400 flex items-center gap-2">
                      <User className="h-4 w-4" /> Last Name
                    </dt>
                    <dd className="col-span-2 text-gray-200">{profile.last_name || 'Not set'}</dd>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <dt className="font-medium text-gray-400 flex items-center gap-2">
                      <Hash className="h-4 w-4" /> Student ID (SDI)
                    </dt>
                    <dd className="col-span-2 font-mono text-gray-200">
                      {profile.sdi || 'Not set'}
                    </dd>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <dt className="font-medium text-gray-400 flex items-center gap-2">
                      <BookOpen className="h-4 w-4" /> Current Semester
                    </dt>
                    <dd className="col-span-2 text-gray-200">
                      {profile.current_semester
                        ? `Semester ${profile.current_semester}`
                        : 'Not set'}
                    </dd>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <dt className="font-medium text-gray-400 flex items-center gap-2">
                      <Settings className="h-4 w-4" /> Academic Direction
                    </dt>
                    <dd className="col-span-2 text-gray-200">{directionLabel}</dd>
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
