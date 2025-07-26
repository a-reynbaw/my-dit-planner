import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Target, CheckCircle2, XCircle, Clock, Settings, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

function DegreeRequirements() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userDirection, setUserDirection] = useState(null);
  const [userSDI, setUserSDI] = useState(null);
  const [specialityProgress, setSpecialityProgress] = useState({});
  const [directionCourses, setDirectionCourses] = useState([]);
  const [completedDirection, setCompletedDirection] = useState([]);
  const [specialityNames, setSpecialityNames] = useState({}); // Change this line

  // Direction options
  const directions = [
    { value: 'CS', label: 'Computer Science (CS)' },
    { value: 'CET', label: 'Computer Engineering & Telecommunications (CET)' },
  ];

  // Remove the hardcoded specialityNames object and replace with useEffect
  useEffect(() => {
    fetch('/api/specialities')
      .then((res) => res.json())
      .then((data) => setSpecialityNames(data))
      .catch((error) => {
        console.error('Error fetching speciality names:', error);
        // Fallback to prevent crashes
        setSpecialityNames({});
      });
  }, []);

  // Define speciality names
  // const specialityNames = {
  //   S1: 'Αλγόριθμοι, Προγραμματισμός και Λογικής',
  //   S2: 'Επιστήμη Δεδομένων και Μηχανική Μάθηση',
  //   S3: 'Συστήματα Υπολογιστών και Λογισμικό',
  //   S4: 'Τηλεπικοινωνίες και Δίκτυα',
  //   S5: 'Ηλεκτρονική και Αρχιτεκτονική Υπολογιστών',
  //   S6: 'Επεξεργασία Σήματος και Εικόνας'
  // };

  // Add the getAvailableSpecialities function
  const getAvailableSpecialities = (direction) => {
    if (direction === 'CS') {
      return ['S1', 'S2', 'S3'];
    } else if (direction === 'CET') {
      return ['S4', 'S5', 'S6'];
    }
    return [];
  };

  // Move these functions BEFORE the useEffect that calls them
  const getDirectionCourses = async (direction) => {
    if (!direction) return [];

    try {
      const specialities = direction === 'CS' ? ['S1', 'S2', 'S3'] : ['S4', 'S5', 'S6'];

      // Get all direction courses (ΚΜ type)
      const directionCourses = courses.filter((c) => c.type === 'ΚΜ');

      // Check which ones belong to the direction's specialities
      const directionCoursesPromises = directionCourses.map(async (course) => {
        try {
          // Check if course belongs to any of the direction's specialities
          const specialityPromises = specialities.map(async (spec) => {
            const response = await fetch(
              `/api/courses/${encodeURIComponent(course.name)}/speciality/${spec}`
            );
            const data = await response.json();
            return data.value ? true : false;
          });

          const hasAnySpeciality = await Promise.all(specialityPromises);
          const belongsToDirection = hasAnySpeciality.some(Boolean);

          return belongsToDirection ? course : null;
        } catch (error) {
          console.error(`Error checking direction for ${course.name}:`, error);
          return null;
        }
      });

      const results = await Promise.all(directionCoursesPromises);
      return results.filter((course) => course !== null);
    } catch (error) {
      console.error('Error getting direction courses:', error);
      return [];
    }
  };

  const calculateSpecialityProgress = async (specialityColumn) => {
    try {
      // Get all courses that belong to this speciality
      const specialityCoursesPromises = courses.map(async (course) => {
        try {
          const response = await fetch(
            `/api/courses/${encodeURIComponent(course.name)}/speciality/${specialityColumn}`
          );
          const data = await response.json();

          if (data.value) {
            return {
              ...course,
              specialityValue: data.value,
            };
          }
          return null;
        } catch (error) {
          console.error(`Error fetching speciality info for ${course.name}:`, error);
          return null;
        }
      });

      const specialityCoursesResults = await Promise.all(specialityCoursesPromises);
      const specialityCourses = specialityCoursesResults.filter((course) => course !== null);
      const passedSpecialityCourses = specialityCourses.filter(
        (course) => course.status === 'Passed'
      );

      // Count compulsory direction courses (ΚΜ type with 'Υ' value)
      const compulsorySpeciality = passedSpecialityCourses.filter(
        (course) => course.type === 'ΚΜ' && course.specialityValue === 'Υ'
      );

      // Count basic courses (any type with 'B' value)
      const basicSpeciality = passedSpecialityCourses.filter(
        (course) => course.specialityValue === 'B'
      );

      const compulsoryProgress = Math.min(compulsorySpeciality.length / 2, 1) * 100; // 2/4 required
      const basicProgress = Math.min(basicSpeciality.length / 4, 1) * 100; // 4/8 required

      // Overall progress (both requirements must be met)
      const overallProgress = Math.min(compulsoryProgress, basicProgress);
      const isCompleted = compulsorySpeciality.length >= 2 && basicSpeciality.length >= 4;

      return {
        compulsoryCompleted: compulsorySpeciality.length,
        compulsoryTotal: 2,
        compulsoryProgress,
        basicCompleted: basicSpeciality.length,
        basicTotal: 4,
        basicProgress,
        overallProgress,
        isCompleted,
        totalCourses: passedSpecialityCourses.length,
        availableCourses: specialityCourses.length,
      };
    } catch (error) {
      console.error(`Error calculating speciality progress for ${specialityColumn}:`, error);
      return {
        compulsoryCompleted: 0,
        compulsoryTotal: 2,
        compulsoryProgress: 0,
        basicCompleted: 0,
        basicTotal: 4,
        basicProgress: 0,
        overallProgress: 0,
        isCompleted: false,
        totalCourses: 0,
        availableCourses: 0,
      };
    }
  };

  // NOW the useEffect that calls these functions
  useEffect(() => {
    // Fetch courses, SDI, and direction using separate endpoints
    Promise.all([
      fetch('/api/courses').then((res) => res.json()),
      fetch('/api/profile/sdi').then((res) => res.json()),
      fetch('/api/profile/direction').then((res) => res.json()),
    ])
      .then(([coursesData, sdiData, directionData]) => {
        setCourses(coursesData);
        setUserSDI(sdiData.sdi);
        setUserDirection(directionData.direction);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  }, []);

  // Effect to calculate direction courses and speciality progress when data changes
  useEffect(() => {
    if (courses.length > 0 && userDirection) {
      const calculateData = async () => {
        // Calculate direction courses
        const dirCourses = await getDirectionCourses(userDirection);
        const completedDir = dirCourses.filter((c) => c.status === 'Passed');

        setDirectionCourses(dirCourses);
        setCompletedDirection(completedDir);

        // Calculate speciality progress
        const availableSpecs = getAvailableSpecialities(userDirection);
        const progressPromises = availableSpecs.map(async (spec) => {
          const progress = await calculateSpecialityProgress(spec);
          return [spec, progress];
        });

        const progressResults = await Promise.all(progressPromises);
        const progressObj = Object.fromEntries(progressResults);
        setSpecialityProgress(progressObj);
      };

      calculateData();
    }
  }, [courses, userDirection]);

  const handleDirectionChange = async (newDirection) => {
    try {
      // Update direction in backend
      const response = await fetch('/api/profile/direction', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ direction: newDirection }),
      });

      if (response.ok) {
        setUserDirection(newDirection);
      } else {
        console.error('Failed to update direction');
      }
    } catch (error) {
      console.error('Error updating direction:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-900 min-h-screen text-white font-sans p-4 md:p-8">
        <div className="text-center py-10">
          <p className="text-xl text-gray-400">Loading degree requirements...</p>
        </div>
      </div>
    );
  }

  // Show direction selection if no direction is set
  if (!userDirection) {
    return (
      <div className="bg-gray-900 min-h-screen text-white font-sans p-4 md:p-8">
        <header className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Choose Your Direction</h1>
            <p className="text-lg text-gray-400">
              Please select your academic direction to view degree requirements
            </p>
            {userSDI && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-gray-400">SDI: {userSDI}</span>
              </div>
            )}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/')}
            className="bg-gray-800 border-gray-700 hover:bg-gray-700"
          >
            <Home className="h-5 w-5" />
          </Button>
        </header>

        <Card className="bg-gray-800 border-gray-700 text-white max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center text-2xl text-blue-400">
              Select Your Academic Direction
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-gray-300 text-center">
              Choose your direction to see personalized degree requirements and track your progress.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {directions.map((direction) => (
                <Card
                  key={direction.value}
                  className="bg-gray-700 border-gray-600 hover:border-blue-500 transition-colors cursor-pointer"
                  onClick={() => handleDirectionChange(direction.value)}
                >
                  <CardContent className="p-6 text-center">
                    <h3 className="text-lg font-semibold text-white mb-2">{direction.label}</h3>
                    <Button
                      className="mt-4 bg-blue-600 hover:bg-blue-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDirectionChange(direction.value);
                      }}
                    >
                      Select {direction.value}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-400">
                You can change your direction later in the settings.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate degree requirements (update to use state values)
  const totalECTS = 240;
  const passedCourses = courses.filter((c) => c.status === 'Passed');
  const completedECTS = passedCourses.reduce((sum, course) => sum + course.ects, 0);

  // Course type requirements
  const compulsoryCourses = courses.filter((c) => c.type === 'ΥΜ');
  const completedCompulsory = compulsoryCourses.filter((c) => c.status === 'Passed');
  const compulsoryProgress = (completedCompulsory.length / 18) * 100; // 18 compulsory required

  const generalEducationCourses = courses.filter((c) => c.type === 'ΓΠ');
  const completedGE = generalEducationCourses.filter((c) => c.status === 'Passed');
  const geProgress = (completedGE.length / 3) * 100; // 3 general education required

  // Use state values for direction courses
  const directionProgress = (completedDirection.length / 4) * 100; // 4 direction courses required

  // Direction project (should be a specific course type or identifiable by name)
  const directionProjectCourses = courses.filter((c) => c.name.startsWith('Ανάπτυξη'));
  const completedDirectionProject = directionProjectCourses.filter((c) => c.status === 'Passed');
  const directionProjectProgress = (completedDirectionProject.length / 1) * 100; // 1 direction project required

  // Final courses: Πρακτική I, Πρακτική IΙ, Πτυχιακή Ι, Πτυχιακή ΙΙ
  const finalCourses = courses.filter(
    (c) => c.name.includes('Πρακτική') || c.name.includes('Πτυχιακή')
  );
  const completedFinalCourses = finalCourses.filter((c) => c.status === 'Passed');
  const finalCoursesProgress = (completedFinalCourses.length / 2) * 100; // 2 out of 4 required

  // CS-specific required courses (restrictions on direction courses)
  const csRequiredCourses = [
    'Θεωρία Υπολογισμού',
    'Υλοποίηση Συστημάτων Βάσεων Δεδομένων',
    'Αριθμητική Ανάλυση',
  ];

  // Check CS-specific requirements (these are just restrictions, not additional requirements)
  const csRequiredCompleted =
    userDirection === 'CS'
      ? csRequiredCourses.filter((courseName) =>
          completedDirection.some((course) => course.name === courseName)
        ).length
      : 0;

  const csRequiredProgress = userDirection === 'CS' ? (csRequiredCompleted / 3) * 100 : 100;

  // ECTS requirements
  const ectsProgress = (completedECTS / totalECTS) * 100;

  const selectedDirectionLabel =
    directions.find((d) => d.value === userDirection)?.label || userDirection;

  const requirements = [
    {
      title: 'Total ECTS',
      completed: completedECTS,
      total: totalECTS,
      progress: ectsProgress,
      icon: Target,
      color: 'text-blue-400',
      description: 'Complete 240 ECTS to graduate',
    },
    {
      title: 'Compulsory Courses (ΥΜ)',
      completed: completedCompulsory.length,
      total: 18,
      progress: compulsoryProgress,
      icon: CheckCircle2,
      color: 'text-green-400',
      description: '18 compulsory courses required for graduation',
    },
    {
      title: 'General Education (ΓΠ)',
      completed: completedGE.length,
      total: 3,
      progress: geProgress,
      icon: CheckCircle2,
      color: 'text-yellow-400',
      description: '3 general education courses required',
    },
    {
      title: 'Direction Courses (ΚΜ)',
      completed: completedDirection.length,
      total: 4,
      progress: directionProgress,
      icon: Target,
      color: 'text-orange-400',
      description: `4 direction courses required for ${selectedDirectionLabel}`,
    },
    {
      title: 'Direction Project',
      completed: completedDirectionProject.length,
      total: 1,
      progress: directionProjectProgress,
      icon: BookOpen,
      color: 'text-purple-400',
      description: '1 direction project required',
    },
    {
      title: 'Final Courses',
      completed: completedFinalCourses.length,
      total: 2,
      progress: finalCoursesProgress,
      icon: Clock,
      color: 'text-cyan-400',
      description: 'Choose 2 from: Πρακτική I/II or Πτυχιακή I/II',
    },
  ];

  const availableSpecialities = getAvailableSpecialities(userDirection);
  const completedSpecialities = availableSpecialities.filter(
    (spec) => specialityProgress[spec]?.isCompleted === true
  );

  return (
    <div className="bg-gray-900 min-h-screen text-white font-sans p-4 md:p-8">
      <header className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Degree Requirements</h1>
          <p className="text-lg text-gray-400">
            Track your progress towards graduation requirements
          </p>
          {userSDI && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-gray-400">
                SDI: {userSDI} • Direction: {selectedDirectionLabel}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-400">Direction:</span>
            <Select value={userDirection} onValueChange={handleDirectionChange}>
              <SelectTrigger className="w-[250px] bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Select direction" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {directions.map((direction) => (
                  <SelectItem
                    key={direction.value}
                    value={direction.value}
                    className="text-white hover:bg-gray-700"
                  >
                    {direction.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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

      {/* Direction-specific info card */}
      <Card className="bg-gray-800 border-gray-700 text-white mb-6">
        <CardHeader>
          <CardTitle className="text-orange-400 flex items-center gap-2">
            <Target className="h-5 w-5" />
            {selectedDirectionLabel} Requirements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-400 mb-2">Direction:</p>
              <p className="text-lg font-semibold text-orange-400">{selectedDirectionLabel}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-2">Direction Courses Progress:</p>
              <p className="text-lg font-semibold text-green-400">
                {completedDirection.length} / 4 completed
              </p>
            </div>
          </div>

          {userDirection === 'CS' && (
            <div className="mt-4">
              <p className="text-sm text-gray-400 mb-2">
                CS Direction Restrictions (3 of your 4 direction courses must include):
              </p>
              <div className="space-y-2">
                {csRequiredCourses.map((courseName, index) => {
                  const isCompleted = completedDirection.some(
                    (course) => course.name === courseName
                  );
                  return (
                    <div key={index} className="flex items-center gap-2">
                      {isCompleted ? (
                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-400" />
                      )}
                      <span
                        className={`text-sm ${isCompleted ? 'text-green-400' : 'text-gray-300'}`}
                      >
                        {courseName}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-2">
                <span
                  className={`text-sm ${
                    csRequiredCompleted >= 3 ? 'text-green-400' : 'text-orange-400'
                  }`}
                >
                  {csRequiredCompleted}/3 required courses completed
                  {csRequiredCompleted >= 3 ? ' ✓' : ''}
                </span>
              </div>
            </div>
          )}

          {userDirection === 'CET' && (
            <div className="mt-4">
              <p className="text-sm text-green-400">
                ✓ CET direction has no restrictions on direction course selection
              </p>
            </div>
          )}

          <div className="mt-4">
            <p className="text-sm text-gray-400 mb-2">Final Courses (choose 2):</p>
            <div className="flex flex-wrap gap-2">
              {['Πρακτική I', 'Πρακτική IΙ', 'Πτυχιακή Ι', 'Πτυχιακή ΙΙ'].map(
                (courseName, index) => {
                  const isCompleted = courses.some(
                    (course) => course.name.includes(courseName) && course.status === 'Passed'
                  );
                  return (
                    <span
                      key={index}
                      className={`px-2 py-1 rounded text-sm ${
                        isCompleted ? 'bg-green-700 text-green-200' : 'bg-gray-700 text-gray-300'
                      }`}
                    >
                      {courseName}
                    </span>
                  );
                }
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        {requirements.map((req, index) => (
          <Card key={index} className="bg-gray-800 border-gray-700 text-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-gray-200 flex items-center gap-2">
                  <req.icon className={`h-5 w-5 ${req.color}`} />
                  {req.title}
                </CardTitle>
                <span className={`text-lg font-semibold ${req.color}`}>
                  {req.completed} / {req.total}
                </span>
              </div>
              <p className="text-sm text-gray-400 mt-1">{req.description}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Progress value={req.progress} className="w-full h-2 bg-gray-700" />
                <div className="flex justify-between text-sm text-gray-400">
                  <span>{req.progress.toFixed(1)}% Complete</span>
                  <span>{req.total - req.completed} remaining</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <Card className="bg-gray-800 border-gray-700 text-white">
          <CardHeader>
            <CardTitle className="text-green-400">Completed Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Compulsory (18 required):</span>
                <span className="text-green-400">{completedCompulsory.length}</span>
              </div>
              <div className="flex justify-between">
                <span>General Education (3 required):</span>
                <span className="text-yellow-400">{completedGE.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Direction Courses (4 required):</span>
                <span className="text-orange-400">{completedDirection.length}</span>
              </div>
              {userDirection === 'CS' && (
                <div className="flex justify-between text-sm text-gray-300 ml-4">
                  <span>• CS Required (3 of 4 direction courses):</span>
                  <span className={csRequiredCompleted >= 3 ? 'text-green-400' : 'text-orange-400'}>
                    {csRequiredCompleted}/3
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Direction Project (1 required):</span>
                <span className="text-purple-400">{completedDirectionProject.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Final Courses (2 required):</span>
                <span className="text-cyan-400">{completedFinalCourses.length}</span>
              </div>

              {/* Add Specialities section */}
              {userDirection && availableSpecialities.length > 0 && (
                <>
                  <hr className="border-gray-600" />
                  <div className="flex justify-between">
                    <span>Specialities (0-2 optional):</span>
                    <span className="text-purple-400">{completedSpecialities.length}/2</span>
                  </div>
                  {completedSpecialities.map((spec) => (
                    <div key={spec} className="flex justify-between text-sm text-gray-300 ml-4">
                      <span>
                        • {spec} - {specialityNames[spec] || 'Loading...'}:
                      </span>
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                    </div>
                  ))}
                </>
              )}

              <hr className="border-gray-600" />
              <div className="flex justify-between font-semibold">
                <span>Total ECTS:</span>
                <span className="text-blue-400">{completedECTS}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700 text-white">
          <CardHeader>
            <CardTitle className="text-red-400">Remaining Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>ECTS needed:</span>
                <span className="text-red-400">{totalECTS - completedECTS}</span>
              </div>
              <div className="flex justify-between">
                <span>Compulsory courses:</span>
                <span className="text-red-400">{Math.max(0, 18 - completedCompulsory.length)}</span>
              </div>
              <div className="flex justify-between">
                <span>General Education:</span>
                <span className="text-red-400">{Math.max(0, 3 - completedGE.length)}</span>
              </div>
              <div className="flex justify-between">
                <span>Direction courses:</span>
                <span className="text-red-400">{Math.max(0, 4 - completedDirection.length)}</span>
              </div>
              {userDirection === 'CS' && (
                <div className="flex justify-between">
                  <span>CS Required courses:</span>
                  <span className="text-red-400">{Math.max(0, 3 - csRequiredCompleted)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Direction project:</span>
                <span className="text-red-400">
                  {Math.max(0, 1 - completedDirectionProject.length)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Final courses:</span>
                <span className="text-red-400">
                  {Math.max(0, 2 - completedFinalCourses.length)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Specialities Progress Section */}
      {userDirection && availableSpecialities.length > 0 && (
        <Card className="bg-gray-800 border-gray-700 text-white mt-10">
          <CardHeader>
            <CardTitle className="text-purple-400 flex items-center gap-2">
              <Target className="h-5 w-5" />
              Specialities Progress ({selectedDirectionLabel})
              <span className="text-sm text-gray-400 ml-2">
                ({completedSpecialities.length}/2 completed - Optional)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <p className="text-sm text-gray-400 mb-2">
                You can obtain up to 2 out of 3 available specialities for your direction. Each
                speciality requires 2 compulsory direction courses (ΚΜ) and 4 basic courses.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {availableSpecialities.map((spec) => {
                const progress = specialityProgress[spec] || {
                  compulsoryCompleted: 0,
                  compulsoryTotal: 2,
                  compulsoryProgress: 0,
                  basicCompleted: 0,
                  basicTotal: 4,
                  basicProgress: 0,
                  overallProgress: 0,
                  isCompleted: false,
                  totalCourses: 0,
                  availableCourses: 0,
                };

                return (
                  <Card
                    key={spec}
                    className={`border transition-all ${
                      progress.isCompleted
                        ? 'bg-green-900/30 border-green-500/50'
                        : 'bg-gray-700/50 border-gray-600'
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm text-gray-200 flex items-center gap-2">
                          {progress.isCompleted ? (
                            <CheckCircle2 className="h-4 w-4 text-green-400" />
                          ) : (
                            <Clock className="h-4 w-4 text-orange-400" />
                          )}
                          {spec}
                        </CardTitle>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            progress.isCompleted
                              ? 'bg-green-700 text-green-200'
                              : 'bg-gray-600 text-gray-300'
                          }`}
                        >
                          {progress.isCompleted ? 'Completed' : 'In Progress'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{specialityNames[spec] || spec}</p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Compulsory Direction Courses Progress */}
                      <div>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>Direction Courses (ΚΜ)</span>
                          <span>
                            {progress.compulsoryCompleted}/{progress.compulsoryTotal}
                          </span>
                        </div>
                        <Progress
                          value={progress.compulsoryProgress}
                          className="w-full h-1.5 bg-gray-600"
                        />
                        <div className="text-xs text-gray-500 mt-1">
                          {progress.compulsoryProgress.toFixed(0)}% Complete
                        </div>
                      </div>

                      {/* Basic Courses Progress */}
                      <div>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>Basic Courses</span>
                          <span>
                            {progress.basicCompleted}/{progress.basicTotal}
                          </span>
                        </div>
                        <Progress
                          value={progress.basicProgress}
                          className="w-full h-1.5 bg-gray-600"
                        />
                        <div className="text-xs text-gray-500 mt-1">
                          {progress.basicProgress.toFixed(0)}% Complete
                        </div>
                      </div>

                      {/* Overall Progress */}
                      <div className="pt-2 border-t border-gray-600">
                        <div className="flex justify-between text-xs font-medium mb-1">
                          <span className="text-gray-300">Overall Progress</span>
                          <span
                            className={progress.isCompleted ? 'text-green-400' : 'text-orange-400'}
                          >
                            {progress.overallProgress.toFixed(0)}%
                          </span>
                        </div>
                        <Progress
                          value={progress.overallProgress}
                          className="w-full h-2 bg-gray-600"
                        />
                      </div>

                      {/* Course counts */}
                      <div className="text-xs text-gray-500 pt-1">
                        {progress.totalCourses} passed / {progress.availableCourses} available
                        courses
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Specialities Summary */}
            <div className="mt-6 p-4 bg-gray-700/50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Specialities Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Completed:</span>
                  <span className="text-green-400 ml-2 font-medium">
                    {completedSpecialities.length}/2
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Available:</span>
                  <span className="text-blue-400 ml-2 font-medium">
                    {availableSpecialities.length}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Remaining:</span>
                  <span className="text-orange-400 ml-2 font-medium">
                    {Math.max(0, 2 - completedSpecialities.length)}
                  </span>
                </div>
              </div>

              {completedSpecialities.length > 0 && (
                <div className="mt-3">
                  <span className="text-gray-400 text-sm">Completed Specialities:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {completedSpecialities.map((spec) => (
                      <span
                        key={spec}
                        className="px-2 py-1 bg-green-700 text-green-200 rounded text-xs"
                      >
                        {spec}: {specialityNames[spec] || 'Loading...'}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default DegreeRequirements;
