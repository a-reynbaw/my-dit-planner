import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { User, Save, Home, Edit3, Check, X } from 'lucide-react';

function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    sdi: '',
    first_name: '',
    last_name: '',
    current_semester: '',
    direction: ''
  });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Direction options
  const directions = [
    { value: '', label: 'Not Selected' },
    { value: 'CS', label: 'Computer Science (CS)' },
    { value: 'CET', label: 'Computer Engineering & Telecommunications (CET)' },
  ];

  // Semester options (1-8)
  const semesters = Array.from({ length: 8 }, (_, i) => ({
    value: i + 1,
    label: `Semester ${i + 1}`
  }));

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/profile');
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      const data = await response.json();
      
      // Handle null values from backend by converting to empty strings or appropriate defaults
      const profileData = {
        id: data.id,
        sdi: data.sdi || '',
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        current_semester: data.current_semester || '',
        direction: data.direction || ''
      };
      
      setProfile(profileData);
      setEditedProfile(profileData);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
    setEditedProfile({ ...profile });
    setError(null);
  };

  const handleCancel = () => {
    setEditing(false);
    setEditedProfile({ ...profile });
    setError(null);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      // Validate required fields
      if (!editedProfile.first_name || !editedProfile.last_name) {
        setError('First name and last name are required');
        return;
      }

      if (!editedProfile.sdi || editedProfile.sdi.toString().length !== 7) {
        setError('SDI must be a 7-digit number');
        return;
      }

      // Prepare data for backend - convert empty strings to null where appropriate
      const updateData = {
        sdi: editedProfile.sdi ? parseInt(editedProfile.sdi) : null,
        first_name: editedProfile.first_name || null,
        last_name: editedProfile.last_name || null,
        current_semester: editedProfile.current_semester ? parseInt(editedProfile.current_semester) : null,
        direction: editedProfile.direction || null
      };

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update profile');
      }

      const updatedProfile = await response.json();
      
      // Convert null values back to empty strings for the UI
      const uiProfile = {
        id: updatedProfile.id,
        sdi: updatedProfile.sdi || '',
        first_name: updatedProfile.first_name || '',
        last_name: updatedProfile.last_name || '',
        current_semester: updatedProfile.current_semester || '',
        direction: updatedProfile.direction || ''
      };
      
      setProfile(uiProfile);
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="bg-gray-900 min-h-screen text-white font-sans p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen text-white font-sans p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Profile</h1>
            <p className="text-lg text-gray-400">
              Manage your personal information and preferences
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/')}
              className="bg-gray-800 border-gray-700 hover:bg-gray-700"
            >
              <Home className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-lg">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Profile Card */}
        <Card className="bg-gray-800 border-gray-700 text-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-blue-400 flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
              {!editing ? (
                <Button
                  onClick={handleEdit}
                  variant="outline"
                  size="sm"
                  className="bg-gray-700 border-gray-600 hover:bg-gray-600"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    size="sm"
                    className="bg-green-700 hover:bg-green-600"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    size="sm"
                    className="bg-gray-700 border-gray-600 hover:bg-gray-600"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* SDI */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Student ID (SDI)
                </label>
                {editing ? (
                  <Input
                    type="number"
                    value={editedProfile.sdi}
                    onChange={(e) => handleInputChange('sdi', parseInt(e.target.value) || '')}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Enter 7-digit SDI"
                  />
                ) : (
                  <p className="text-lg font-semibold text-white">
                    {profile.sdi || 'Not set'}
                  </p>
                )}
              </div>

              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  First Name
                </label>
                {editing ? (
                  <Input
                    value={editedProfile.first_name}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Enter first name"
                  />
                ) : (
                  <p className="text-lg font-semibold text-white">
                    {profile.first_name || 'Not set'}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Last Name
                </label>
                {editing ? (
                  <Input
                    value={editedProfile.last_name}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Enter last name"
                  />
                ) : (
                  <p className="text-lg font-semibold text-white">
                    {profile.last_name || 'Not set'}
                  </p>
                )}
              </div>

              {/* Current Semester */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Current Semester
                </label>
                {editing ? (
                  <Select
                    value={editedProfile.current_semester?.toString() || ""}
                    onValueChange={(value) => handleInputChange('current_semester', value ? parseInt(value) : '')}
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="" className="text-white hover:bg-gray-700">
                        Not selected
                      </SelectItem>
                      {semesters.map((sem) => (
                        <SelectItem
                          key={sem.value}
                          value={sem.value.toString()}
                          className="text-white hover:bg-gray-700"
                        >
                          {sem.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-lg font-semibold text-white">
                    {profile.current_semester ? `Semester ${profile.current_semester}` : 'Not set'}
                  </p>
                )}
              </div>

              {/* Direction */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Academic Direction
                </label>
                {editing ? (
                  <Select
                    value={editedProfile.direction || ''}
                    onValueChange={(value) => handleInputChange('direction', value)}
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Select direction" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {directions.map((dir) => (
                        <SelectItem
                          key={dir.value}
                          value={dir.value}
                          className="text-white hover:bg-gray-700"
                        >
                          {dir.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-lg font-semibold text-white">
                    {directions.find(d => d.value === profile.direction)?.label || 'Not selected'}
                  </p>
                )}
                {!editing && (
                  <p className="text-sm text-gray-400 mt-1">
                    Choose your academic direction to see relevant course requirements
                  </p>
                )}
              </div>
            </div>

            {/* Profile Summary */}
            {!editing && (
              <div className="mt-8 p-4 bg-gray-700/50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-300 mb-3">Profile Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Full Name:</span>
                    <span className="text-white ml-2 font-medium">
                      {profile.first_name && profile.last_name 
                        ? `${profile.first_name} ${profile.last_name}`
                        : 'Not complete'
                      }
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Progress:</span>
                    <span className="text-blue-400 ml-2 font-medium">
                      {profile.current_semester 
                        ? `Semester ${profile.current_semester}/8`
                        : 'Not set'
                      }
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Direction:</span>
                    <span className="text-orange-400 ml-2 font-medium">
                      {profile.direction || 'Not selected'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            Update your profile information to get personalized course recommendations and track your progress accurately.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Profile;