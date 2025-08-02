import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Target,
  CheckCircle2,
  XCircle,
  Clock,
  Settings,
  BookOpen,
  GraduationCap,
  ListChecks,
} from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';

function SummaryCard({ title, value, icon: Icon, color }) {
  return (
    <Card className="bg-gray-800 border-gray-700 text-white">
      <CardContent className="p-4 flex items-center">
        <Icon className={`h-8 w-8 mr-4 ${color}`} />
        <div>
          <p className="text-sm text-gray-400">{title}</p>
          <p className="text-xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function RequirementCard({
  title,
  description,
  icon: Icon,
  color,
  completed,
  total,
  progress,
  children,
}) {
  return (
    <Card className="bg-gray-800 border-gray-700 text-white flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <Icon className={`h-6 w-6 ${color}`} />
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          </div>
          <Badge variant="secondary" className="font-mono">
            {completed}/{total}
          </Badge>
        </div>
        <p className="text-sm text-gray-400 pt-1">{description}</p>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-end">
        {children && <div className="mb-4">{children}</div>}
        <div className="space-y-1">
          <Progress value={progress} className="h-2 bg-gray-700" />
          <p className="text-xs text-gray-400 text-right">{progress.toFixed(0)}% Complete</p>
        </div>
      </CardContent>
    </Card>
  );
}

function DegreeRequirements() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userDirection, setUserDirection] = useState(null);
  const [userSDI, setUserSDI] = useState(null);
  const [specialityProgress, setSpecialityProgress] = useState({});
  const [directionCourses, setDirectionCourses] = useState([]);
  const [completedDirection, setCompletedDirection] = useState([]);
  const [specialityNames, setSpecialityNames] = useState({});
  const [graduationBasicReq, setGraduationBasicReq] = useState(null);

  const directions = [
    { value: 'CS', label: 'Computer Science (CS)' },
    { value: 'CET', label: 'Computer Engineering & Telecommunications (CET)' },
  ];

  useEffect(() => {
    fetch('/api/specialities')
      .then((res) => res.json())
      .then((data) => setSpecialityNames(data))
      .catch((error) => console.error('Error fetching speciality names:', error));

    Promise.all([
      fetch('/api/courses').then((res) => res.json()),
      fetch('/api/profile/sdi').then((res) => res.json()),
      fetch('/api/profile/direction').then((res) => res.json()),
    ])
      .then(([coursesData, sdiData, directionData]) => {
        setCourses(coursesData);
        setUserSDI(sdiData.sdi);
        setUserDirection(directionData.direction);
      })
      .catch((error) => console.error('Error fetching data:', error))
      .finally(() => setLoading(false));
  }, []);

  const getAvailableSpecialities = (direction) => {
    if (direction === 'CS') return ['S1', 'S2', 'S3'];
    if (direction === 'CET') return ['S4', 'S5', 'S6'];
    return [];
  };

  useEffect(() => {
    if (courses.length > 0 && userDirection) {
      const getDirectionCourses = (direction) => {
        if (!direction) return [];
        return courses.filter((c) => c.type === 'ΕΥΜ' && c.direction === direction);
      };

      const calculateSpecialityProgress = (specialityColumn) => {
        const specialityCourses = courses.filter((c) => c[specialityColumn] != null);
        const passed = specialityCourses.filter((c) => c.status === 'Passed');
        const compulsory = passed.filter((c) => c.type === 'ΕΥΜ' && c[specialityColumn] === 'Υ');
        const basic = passed.filter((c) => c[specialityColumn] === 'B');
        const isCompleted = compulsory.length >= 2 && basic.length >= 4;
        return {
          compulsoryCompleted: compulsory.length,
          compulsoryTotal: 2,
          basicCompleted: basic.length,
          basicTotal: 4,
          isCompleted,
        };
      };

      // NEW: Calculate graduation requirement for basic courses across all specialities
      const calculateGraduationBasicRequirement = (direction) => {
        if (!direction) return { completed: 0, total: 4, passedCourses: [] };

        const availableSpecs = getAvailableSpecialities(direction);
        const passedCourses = courses.filter((c) => c.status === 'Passed');

        // Get courses marked as "B" in any of the three direction specialities
        const basicCoursesAcrossSpecs = passedCourses.filter((course) => {
          return availableSpecs.some((spec) => course[spec] === 'B');
        });

        // Count how many specialities are represented
        const specialitiesRepresented = new Set();
        basicCoursesAcrossSpecs.forEach((course) => {
          availableSpecs.forEach((spec) => {
            if (course[spec] === 'B') {
              specialitiesRepresented.add(spec);
            }
          });
        });

        const allSpecsRepresented = specialitiesRepresented.size === 3;
        const minimumCoursesReached = basicCoursesAcrossSpecs.length >= 4;

        return {
          completed: basicCoursesAcrossSpecs.length,
          total: 4,
          passedCourses: basicCoursesAcrossSpecs,
          specialitiesRepresented: Array.from(specialitiesRepresented),
          allSpecsRepresented,
          isCompleted: minimumCoursesReached && allSpecsRepresented,
        };
      };

      const dirCourses = getDirectionCourses(userDirection);
      setDirectionCourses(dirCourses);
      setCompletedDirection(dirCourses.filter((c) => c.status === 'Passed'));

      const availableSpecs = getAvailableSpecialities(userDirection);
      const progressResults = availableSpecs.map((spec) => [
        spec,
        calculateSpecialityProgress(spec),
      ]);
      setSpecialityProgress(Object.fromEntries(progressResults));

      // Store the graduation basic requirement data
      setGraduationBasicReq(calculateGraduationBasicRequirement(userDirection));
    }
  }, [courses, userDirection]);

  const handleDirectionChange = async (newDirection) => {
    try {
      const response = await fetch('/api/profile/direction', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
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
      <div className="bg-gray-900 min-h-screen text-white font-sans p-8 text-center">
        <p className="text-xl text-gray-400">Loading degree requirements...</p>
      </div>
    );
  }

  if (!userDirection) {
    return (
      <div className="bg-gray-900 min-h-screen text-white p-8">
        <header className="flex items-center justify-between mb-10">
          <h1 className="text-4xl font-bold tracking-tight">Choose Your Direction</h1>
        </header>
        <Card className="bg-gray-800 border-gray-700 max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center text-2xl text-blue-400">
              Select Academic Direction
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-gray-300 text-center">
              Choose your direction to see personalized degree requirements.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {directions.map((dir) => (
                <Card
                  key={dir.value}
                  className="bg-gray-700 border-gray-600 hover:border-blue-500 transition-colors cursor-pointer"
                  onClick={() => handleDirectionChange(dir.value)}
                >
                  <CardContent className="p-6 text-center">
                    <h3 className="text-lg font-semibold text-white mb-2">{dir.label}</h3>
                    <Button
                      className="mt-4 bg-blue-600 hover:bg-blue-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDirectionChange(dir.value);
                      }}
                    >
                      Select {dir.value}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- CALCULATIONS ---
  const passedCourses = courses.filter((c) => c.status === 'Passed');
  const completedECTS = passedCourses.reduce((sum, course) => sum + course.ects, 0);

  const compulsoryCourses = courses.filter((c) => c.type === 'ΥΜ');
  const completedCompulsory = compulsoryCourses.filter((c) => c.status === 'Passed');

  const geCourses = courses.filter((c) => c.type === 'ΓΠ');
  const completedGE = geCourses.filter((c) => c.status === 'Passed');

  const projectCourses = courses.filter((c) => c.name.startsWith('Ανάπτυξη'));
  const completedProject = projectCourses.filter((c) => c.status === 'Passed');

  const finalCourses = courses.filter((c) =>
    ['Πρακτική I', 'Πρακτική IΙ', 'Πτυχιακή Ι', 'Πτυχιακή ΙΙ'].some((name) => c.name.includes(name))
  );
  const completedFinal = finalCourses.filter((c) => c.status === 'Passed');

  const csRequiredCourses = [
    'Θεωρία Υπολογισμού',
    'Υλοποίηση Συστημάτων Βάσεων Δεδομένων',
    'Αριθμητική Ανάλυση',
  ];
  const csRequiredCompleted =
    userDirection === 'CS'
      ? completedDirection.filter((c) => csRequiredCourses.includes(c.name))
      : [];

  const availableSpecialities = getAvailableSpecialities(userDirection);
  const completedSpecialities = availableSpecialities.filter(
    (spec) => specialityProgress[spec]?.isCompleted
  );

  const selectedDirectionLabel =
    directions.find((d) => d.value === userDirection)?.label || userDirection;

  // Add the new graduation basic requirement to the existing requirements array
  const requirements = [
    {
      title: 'Compulsory Courses (ΥΜ)',
      description: 'Core curriculum courses required for all students.',
      icon: ListChecks,
      color: 'text-green-400',
      completed: completedCompulsory.length,
      total: 18,
    },
    {
      title: 'General Education (ΓΠ)',
      description: 'Courses from a broad range of subjects.',
      icon: ListChecks,
      color: 'text-yellow-400',
      completed: completedGE.length,
      total: 3,
    },
    {
      title: 'Direction Courses (ΕΥΜ)',
      description: `4 elective courses specific to the ${selectedDirectionLabel} direction.`,
      icon: Target,
      color: 'text-orange-400',
      completed: completedDirection.length,
      total: 4,
      children: userDirection === 'CS' && (
        <div className="mt-2 p-3 bg-gray-700/50 rounded-lg text-xs">
          <p className="font-semibold text-gray-300 mb-2">CS Direction Constraint:</p>
          <ul className="space-y-1.5">
            {csRequiredCourses.map((name) => (
              <li key={name} className="flex items-center gap-2">
                {csRequiredCompleted.some((c) => c.name === name) ? (
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-400" />
                )}
                <span
                  className={
                    csRequiredCompleted.some((c) => c.name === name)
                      ? 'text-gray-300'
                      : 'text-gray-400'
                  }
                >
                  {name}
                </span>
              </li>
            ))}
          </ul>
          <p
            className={`mt-2 text-right font-medium ${csRequiredCompleted.length >= 3 ? 'text-green-400' : 'text-orange-400'}`}
          >
            {csRequiredCompleted.length}/3 met
          </p>
        </div>
      ),
    },
    {
      title: 'Graduation Basic Requirement',
      description: `Pass 4+ courses marked as "Basic" across all 3 ${selectedDirectionLabel} specialities.`,
      icon: Target,
      color: 'text-indigo-400',
      completed: graduationBasicReq?.completed || 0,
      total: 4,
      children: graduationBasicReq && (
        <div className="mt-2 space-y-2">
          <div className="p-3 bg-gray-700/50 rounded-lg text-xs">
            <p className="font-semibold text-gray-300 mb-2">Speciality Coverage:</p>
            <div className="grid grid-cols-3 gap-2">
              {availableSpecialities.map((spec) => {
                const isRepresented = graduationBasicReq.specialitiesRepresented.includes(spec);
                return (
                  <div key={spec} className="flex items-center gap-1">
                    {isRepresented ? (
                      <CheckCircle2 className="h-3 w-3 text-green-400" />
                    ) : (
                      <XCircle className="h-3 w-3 text-red-400" />
                    )}
                    <span
                      className={`text-xs ${isRepresented ? 'text-gray-300' : 'text-gray-500'}`}
                    >
                      {specialityNames[spec] || spec}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="mt-2 pt-2 border-t border-gray-600/50">
              <p
                className={`text-xs font-medium ${
                  graduationBasicReq.isCompleted
                    ? 'text-green-400'
                    : graduationBasicReq.allSpecsRepresented
                      ? 'text-orange-400'
                      : 'text-red-400'
                }`}
              >
                {graduationBasicReq.completed}/4 courses •{' '}
                {graduationBasicReq.specialitiesRepresented.length}/3 specialities
              </p>
            </div>
          </div>
          {graduationBasicReq.passedCourses.length > 0 && (
            <div className="max-h-24 overflow-y-auto">
              <p className="text-xs text-gray-400 mb-1">Completed basic courses:</p>
              <div className="space-y-1">
                {graduationBasicReq.passedCourses.slice(0, 6).map((course) => (
                  <div key={course.id} className="text-xs text-gray-300 truncate">
                    • {course.name}
                  </div>
                ))}
                {graduationBasicReq.passedCourses.length > 6 && (
                  <div className="text-xs text-gray-400">
                    +{graduationBasicReq.passedCourses.length - 6} more...
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Direction Project',
      description: 'A semester-long software development project.',
      icon: BookOpen,
      color: 'text-purple-400',
      completed: completedProject.length,
      total: 1,
    },
    {
      title: 'Final Courses',
      description: 'Choose 2 from Internship (I/II) or Thesis (I/II).',
      icon: Clock,
      color: 'text-cyan-400',
      completed: completedFinal.length,
      total: 2,
      children: (
        <div className="mt-2 flex flex-wrap gap-2">
          {['Πρακτική I', 'Πρακτική IΙ', 'Πτυχιακή Ι', 'Πτυχιακή ΙΙ'].map((name) => {
            const isCompleted = completedFinal.some((c) => c.name.includes(name));
            return (
              <Badge
                key={name}
                variant={isCompleted ? 'default' : 'secondary'}
                className={isCompleted ? 'bg-green-600' : ''}
              >
                {name}
              </Badge>
            );
          })}
        </div>
      ),
    },
    // NEW: Graduation Basic Requirement

    {
      title: 'Specialities',
      description: 'Complete 2 of 3 specialities for your direction (optional).',
      icon: GraduationCap,
      color: 'text-pink-400',
      completed: completedSpecialities.length,
      total: 2,
      children: (
        <div className="mt-2 flex flex-wrap gap-2">
          {completedSpecialities.map((spec) => (
            <Badge key={spec} variant="default" className="bg-pink-600">
              {specialityNames[spec] || spec}
            </Badge>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="bg-gray-900 min-h-screen text-white font-sans p-4 md:p-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Degree Requirements</h1>
          <p className="text-lg text-gray-400">Your progress towards graduation.</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={userDirection} onValueChange={handleDirectionChange}>
            <SelectTrigger className="w-[280px] bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Select direction" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 text-white">
              {directions.map((dir) => (
                <SelectItem key={dir.value} value={dir.value} className="focus:bg-gray-700">
                  {dir.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      {/* High-Level Summary */}
      <section className="mb-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Overall ECTS"
          value={`${completedECTS} / 240`}
          icon={Target}
          color="text-blue-400"
        />
        <SummaryCard
          title="Direction"
          value={selectedDirectionLabel}
          icon={Settings}
          color="text-orange-400"
        />
        <SummaryCard
          title="Courses Passed"
          value={passedCourses.length}
          icon={CheckCircle2}
          color="text-green-400"
        />
        <SummaryCard
          title="Specialities"
          value={`${completedSpecialities.length} / 2`}
          icon={GraduationCap}
          color="text-pink-400"
        />
      </section>

      {/* Core Requirements Grid */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold tracking-tight mb-6">Core Requirements</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requirements.map((req) => (
            <RequirementCard
              key={req.title}
              {...req}
              progress={(req.completed / req.total) * 100}
            />
          ))}
        </div>
      </section>

      {/* Specialities Progress Section */}
      {userDirection && availableSpecialities.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold tracking-tight mb-6">
            Speciality Progress ({selectedDirectionLabel})
          </h2>
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-purple-400">Your Specialities</CardTitle>
              <p className="text-sm text-gray-400">
                Each speciality requires 2 compulsory direction (ΕΥΜ) and 4 basic courses.
              </p>
            </CardHeader>
            <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {availableSpecialities.map((spec) => {
                const progress = specialityProgress[spec] || {
                  isCompleted: false,
                  compulsoryCompleted: 0,
                  basicCompleted: 0,
                };
                const overallProgress = Math.min(
                  (progress.compulsoryCompleted / 2) * 100,
                  (progress.basicCompleted / 4) * 100
                );
                return (
                  <Card
                    key={spec}
                    className={`border ${progress.isCompleted ? 'bg-green-900/30 border-green-500/50' : 'bg-gray-700/50 border-gray-600'}`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-gray-200">
                          {specialityNames[spec] || spec}
                        </p>
                        {progress.isCompleted ? (
                          <Badge className="bg-green-600">Completed</Badge>
                        ) : (
                          <Badge variant="secondary">In Progress</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>Direction Courses</span>
                          <span>{progress.compulsoryCompleted}/2</span>
                        </div>
                        <Progress
                          value={(progress.compulsoryCompleted / 2) * 100}
                          className="h-1.5"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>Basic Courses</span>
                          <span>{progress.basicCompleted}/4</span>
                        </div>
                        <Progress value={(progress.basicCompleted / 4) * 100} className="h-1.5" />
                      </div>
                      <div className="pt-2 border-t border-gray-600/50">
                        <div className="flex justify-between text-xs font-medium text-gray-300">
                          <span>Overall</span>
                          <span
                            className={progress.isCompleted ? 'text-green-400' : 'text-orange-400'}
                          >
                            {overallProgress.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}

export default DegreeRequirements;
