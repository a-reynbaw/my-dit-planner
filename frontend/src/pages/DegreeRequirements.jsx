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
  const [userDirection, setUserDirection] = useState('CS'); // Default to CS

  // Direction options
  const directions = [
    { value: 'CS', label: 'Computer Science (CS)' },
    { value: 'CET', label: 'Computer Engineering & Telecommunications (CET)' },
  ];

  useEffect(() => {
    fetch('/api/courses')
      .then((res) => res.json())
      .then((data) => {
        setCourses(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching courses:', error);
        setLoading(false);
      });
  }, []);

  // Load direction from localStorage on component mount
  useEffect(() => {
    const savedDirection = localStorage.getItem('userDirection');
    if (savedDirection && ['CS', 'CET'].includes(savedDirection)) {
      setUserDirection(savedDirection);
    }
  }, []);

  const handleDirectionChange = (newDirection) => {
    setUserDirection(newDirection);
    localStorage.setItem('userDirection', newDirection);
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

  // Calculate degree requirements
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

  // Direction courses (ΚΜ)
  const directionCourses = courses.filter((c) => c.type === 'ΚΜ');
  const completedDirection = directionCourses.filter((c) => c.status === 'Passed');
  const directionProgress = (completedDirection.length / 4) * 100; // 4 direction courses required

  // Direction project (should be a specific course type or identifiable by name)
  const directionProjectCourses = courses.filter(
    (c) => c.name.includes('Εργαστήριο') || c.name.includes('Project') || c.type === 'ΠΜ'
  );
  const completedDirectionProject = directionProjectCourses.filter((c) => c.status === 'Passed');
  const directionProjectProgress = (completedDirectionProject.length / 1) * 100; // 1 direction project required

  // Final courses: Πρακτική I, Πρακτική IΙ, Πτυχιακή Ι, Πτυχιακή ΙΙ
  const finalCourses = courses.filter(
    (c) => c.name.includes('Πρακτική') || c.name.includes('Πτυχιακή')
  );
  const completedFinalCourses = finalCourses.filter((c) => c.status === 'Passed');
  const finalCoursesProgress = (completedFinalCourses.length / 2) * 100; // 2 out of 4 required

  // CS-specific required courses
  const csRequiredCourses = [
    'Θεωρεία Υπολογισμού',
    'Υλοποίηση Συστημάτων Βάσεων Δεδομένων',
    'Αριθμητική Ανάλυση',
  ];

  // Check CS-specific requirements
  const csRequiredCompleted =
    userDirection === 'CS'
      ? csRequiredCourses.filter((courseName) =>
          courses.some((course) => course.name === courseName && course.status === 'Passed')
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
      description: '4 direction courses required',
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

  // Add CS-specific requirement if CS is selected
  if (userDirection === 'CS') {
    requirements.splice(4, 0, {
      title: 'CS Required Courses',
      completed: csRequiredCompleted,
      total: 3,
      progress: csRequiredProgress,
      icon: Target,
      color: 'text-red-400',
      description: 'CS direction requires 3 specific courses',
    });
  }

  return (
    <div className="bg-gray-900 min-h-screen text-white font-sans p-4 md:p-8">
      <header className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Degree Requirements</h1>
          <p className="text-lg text-gray-400">
            Track your progress towards graduation requirements
          </p>
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
              <p className="text-sm text-gray-400 mb-2">CS Required Courses (3 mandatory):</p>
              <div className="space-y-2">
                {csRequiredCourses.map((courseName, index) => {
                  const isCompleted = courses.some(
                    (course) => course.name === courseName && course.status === 'Passed'
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                <div className="flex justify-between">
                  <span>CS Required Courses (3 required):</span>
                  <span className="text-red-400">{csRequiredCompleted}</span>
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
    </div>
  );
}

export default DegreeRequirements;
