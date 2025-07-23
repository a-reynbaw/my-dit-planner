import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Clock, MapPin, User, Calendar, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Import the timetable data directly
import timetableData from '../assets/spring2025_timetable.json';

function Timetable() {
  const navigate = useNavigate();
  const [currentCourses, setCurrentCourses] = useState([]);
  const [myTimetable, setMyTimetable] = useState([]);
  const [userSDI, setUserSDI] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState('Δευτέρα');

  // Days and time slots for the grid
  const days = ['Δευτέρα', 'Τρίτη', 'Τετάρτη', 'Πέμπτη', 'Παρασκευή'];
  const timeSlots = [
    '09:00-10:00',
    '10:00-11:00',
    '11:00-12:00',
    '12:00-13:00',
    '13:00-14:00',
    '14:00-15:00',
    '15:00-16:00',
    '16:00-17:00',
    '17:00-18:00',
    '18:00-19:00',
    '19:00-20:00',
  ];

  useEffect(() => {
    // Fetch both courses and user SDI using the existing endpoint
    Promise.all([
      fetch('/api/courses').then((res) => res.json()),
      fetch('/api/profile').then((res) => res.json()), // Use existing endpoint
    ])
      .then(([coursesData, profileData]) => {
        const current = coursesData.filter((course) => course.status === 'Current Semester');
        setCurrentCourses(current);
        setUserSDI(profileData.sdi);

        // Match current courses with timetable entries and filter by SDI
        const matchedTimetable = findMatchingTimetableEntries(
          current,
          timetableData.schedule,
          profileData.sdi
        );
        setMyTimetable(matchedTimetable);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  }, []);

  // Function to determine if a course should be shown based on SDI
  const shouldShowCourse = (courseName, userSDI) => {
    const isSDIEven = userSDI % 2 === 0;
    const courseNameLower = courseName.toLowerCase();

    const hasEvenIndicator =
      courseNameLower.includes('άρτιοι') ||
      courseNameLower.includes('αρτιοι') ||
      courseNameLower.includes('(άρτιοι)') ||
      courseNameLower.includes('(αρτιοι)');

    const hasOddIndicator =
      courseNameLower.includes('περιττοί') ||
      courseNameLower.includes('περιττοι') ||
      courseNameLower.includes('(περιττοί)') ||
      courseNameLower.includes('(περιττοι)');

    if (!hasEvenIndicator && !hasOddIndicator) {
      return true;
    }

    if (isSDIEven) {
      return hasEvenIndicator;
    }

    return hasOddIndicator;
  };

  // Function to get the base course name without even/odd indicators
  const getBaseCourse = (courseName) => {
    return courseName
      .replace(/\s*\(άρτιοι\)/gi, '')
      .replace(/\s*\(αρτιοι\)/gi, '')
      .replace(/\s*\(περιττοί\)/gi, '')
      .replace(/\s*\(περιττοι\)/gi, '')
      .replace(/\s*άρτιοι\s*/gi, ' ')
      .replace(/\s*αρτιοι\s*/gi, ' ')
      .replace(/\s*περιττοί\s*/gi, ' ')
      .replace(/\s*περιττοι\s*/gi, ' ')
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();
  };

  // Improved function to match courses with timetable entries
  const findMatchingTimetableEntries = (courses, timetableSchedule, userSDI) => {
    const matched = [];

    courses.forEach((course) => {
      const timetableEntries = timetableSchedule.filter((entry) => {
        if (!shouldShowCourse(entry.course_name, userSDI)) {
          return false;
        }

        const cleanCourseName = getBaseCourse(course.name).trim().toLowerCase();
        const cleanTimetableName = getBaseCourse(entry.course_name).trim().toLowerCase();

        if (cleanCourseName === cleanTimetableName) {
          return true;
        }

        if (
          cleanCourseName.includes(cleanTimetableName) ||
          cleanTimetableName.includes(cleanCourseName)
        ) {
          return true;
        }

        const courseWords = cleanCourseName.split(' ').filter((w) => w.length > 3);
        const timetableWords = cleanTimetableName.split(' ').filter((w) => w.length > 3);

        if (courseWords.length === 0 || timetableWords.length === 0) {
          return false;
        }

        const commonWords = courseWords.filter((word) =>
          timetableWords.some(
            (tWord) =>
              tWord === word ||
              (word.length > 4 && tWord.includes(word)) ||
              (tWord.length > 4 && word.includes(tWord))
          )
        );

        const matchRatio = commonWords.length / Math.min(courseWords.length, timetableWords.length);
        const isMatch = matchRatio >= 0.7 && commonWords.length >= 2;

        return isMatch;
      });

      timetableEntries.forEach((entry) => {
        matched.push({
          ...entry,
          course_id: course.id,
          course_code: course.code,
          course_ects: course.ects,
          database_course_name: course.name,
        });
      });
    });

    return matched;
  };

  // Function to get courses for a specific day and time slot
  const getCoursesForSlot = (day, timeSlot) => {
    return myTimetable.filter((entry) => {
      const entryTimeSlot = `${entry.start_time}-${entry.end_time}`;
      return entry.day === day && entryTimeSlot === timeSlot;
    });
  };

  // Function to get color for a course based on its semester
  const getCourseColor = (semester) => {
    const colors = {
      2: 'bg-green-100 border-green-300 text-green-800',
      4: 'bg-blue-100 border-blue-300 text-blue-800',
      6: 'bg-purple-100 border-purple-300 text-purple-800',
      8: 'bg-red-100 border-red-300 text-red-800',
    };
    return colors[semester] || 'bg-gray-100 border-gray-300 text-gray-800';
  };

  if (loading) {
    return (
      <div className="bg-gray-900 min-h-screen text-white font-sans p-4 md:p-8">
        <div className="text-center py-10">
          <p className="text-xl text-gray-400">Loading your timetable...</p>
        </div>
      </div>
    );
  }

  const isSDIEven = userSDI % 2 === 0;

  return (
    <div className="bg-gray-900 min-h-screen text-white font-sans p-4 md:p-8">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">My Timetable</h1>
          <p className="text-lg text-gray-400">
            Your schedule for Spring 2025 - {currentCourses.length} courses enrolled
          </p>
          {userSDI && (
            <div className="flex items-center gap-2 mt-2">
              <Hash className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-400">
                SDI: {userSDI} ({isSDIEven ? 'Άρτιοι' : 'Περιττοί'})
              </span>
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gray-800 border-gray-700 text-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-400" />
              <div>
                <p className="text-sm text-gray-400">Enrolled Courses</p>
                <p className="text-2xl font-bold text-blue-400">{currentCourses.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700 text-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-400" />
              <div>
                <p className="text-sm text-gray-400">Weekly Hours</p>
                <p className="text-2xl font-bold text-green-400">{myTimetable.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700 text-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-purple-400" />
              <div>
                <p className="text-sm text-gray-400">Total ECTS</p>
                <p className="text-2xl font-bold text-purple-400">
                  {currentCourses.reduce((sum, course) => sum + (course.ects || 0), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700 text-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Hash className="h-5 w-5 text-orange-400" />
              <div>
                <p className="text-sm text-gray-400">SDI Group</p>
                <p className="text-2xl font-bold text-orange-400">
                  {userSDI ? (isSDIEven ? 'Άρτιοι' : 'Περιττοί') : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SDI Filter Info */}
      {userSDI && (
        <Card className="bg-blue-900 border-blue-600 text-blue-100 mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Hash className="h-5 w-5 text-blue-300" />
              <div>
                <p className="text-sm font-medium text-blue-200">SDI-Based Filtering Active</p>
                <p className="text-xs text-blue-300">
                  Showing courses for {isSDIEven ? 'Άρτιοι (Even)' : 'Περιττοί (Odd)'} students
                  only. Duplicate courses with different groups are automatically filtered.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {myTimetable.length === 0 ? (
        <Card className="bg-gray-800 border-gray-700 text-white">
          <CardContent className="p-8 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Schedule Found</h3>
            <p className="text-gray-400 mb-4">
              No courses marked as "Current Semester" were found in the timetable. This could mean:
            </p>
            <ul className="text-gray-400 text-left max-w-md mx-auto space-y-1">
              <li>• You haven't marked any courses as "Current Semester"</li>
              <li>• Course names don't match between database and timetable</li>
              <li>• Courses are not scheduled for Spring 2025</li>
              <li>• Courses are filtered out based on your SDI group</li>
            </ul>
            <Button
              onClick={() => navigate('/all-courses')}
              className="mt-4 bg-blue-600 hover:bg-blue-700"
            >
              Manage Courses
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Timetable Grid - Hidden on small screens */}
          <div className="hidden lg:block">
            <Card className="bg-gray-800 border-gray-700 overflow-hidden">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Weekly Schedule
                  {userSDI && (
                    <span className="text-sm text-gray-400 ml-2">
                      ({isSDIEven ? 'Άρτιοι' : 'Περιττοί'} Group)
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px]">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="p-2 text-left text-gray-400 w-20 sticky left-0 bg-gray-800">
                          Time
                        </th>
                        {days.map((day) => (
                          <th key={day} className="p-2 text-center text-gray-400 min-w-[150px]">
                            {day}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {timeSlots.map((timeSlot) => (
                        <tr key={timeSlot} className="border-b border-gray-700 h-16">
                          <td className="p-2 text-sm text-gray-400 sticky left-0 bg-gray-800 border-r border-gray-700">
                            {timeSlot}
                          </td>
                          {days.map((day) => {
                            const courses = getCoursesForSlot(day, timeSlot);
                            return (
                              <td key={`${day}-${timeSlot}`} className="p-1 align-top">
                                {courses.map((course, index) => (
                                  <div
                                    key={`${course.course_id}-${index}`}
                                    className={`text-xs p-2 rounded border mb-1 ${getCourseColor(course.semester)}`}
                                  >
                                    <div
                                      className="font-medium truncate"
                                      title={course.course_name}
                                    >
                                      {getBaseCourse(course.course_name)}
                                    </div>
                                    <div className="flex items-center gap-1 mt-1">
                                      <MapPin className="h-3 w-3" />
                                      <span>{course.room}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <User className="h-3 w-3" />
                                      <span className="truncate">{course.lecturer}</span>
                                    </div>
                                  </div>
                                ))}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabbed Timetable for smaller screens */}
          <div className="lg:hidden">
            <div className="mb-4">
              <div className="border-b border-gray-700">
                <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                  {days.map((day) => (
                    <button
                      key={day}
                      onClick={() => setActiveDay(day)}
                      className={`${
                        activeDay === day
                          ? 'border-blue-500 text-blue-400'
                          : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                      } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
                    >
                      {day}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
            <div>
              {timeSlots.map((timeSlot) => {
                const courses = getCoursesForSlot(activeDay, timeSlot);
                if (courses.length === 0) return null;
                return (
                  <div key={timeSlot} className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-300 mb-2">{timeSlot}</h3>
                    {courses.map((course, index) => (
                      <div
                        key={`${course.course_id}-${index}`}
                        className={`p-3 rounded border mb-2 ${getCourseColor(course.semester)}`}
                      >
                        <div className="font-bold text-base" title={course.course_name}>
                          {getBaseCourse(course.course_name)}
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-sm">
                          <MapPin className="h-4 w-4" />
                          <span>{course.room}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-sm">
                          <User className="h-4 w-4" />
                          <span className="truncate">{course.lecturer}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Course List */}
          <Card className="bg-gray-800 border-gray-700 text-white mt-6">
            <CardHeader>
              <CardTitle>Enrolled Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentCourses.map((course) => {
                  const timetableEntries = myTimetable.filter(
                    (entry) => entry.course_id === course.id
                  );
                  return (
                    <div
                      key={course.id}
                      className={`p-4 rounded border ${getCourseColor(course.semester)}`}
                    >
                      <h3 className="font-semibold mb-1">{course.name}</h3>
                      <p className="text-sm opacity-75 mb-2">
                        {course.code} • {course.ects} ECTS
                      </p>
                      {timetableEntries.length > 0 && (
                        <div className="text-xs space-y-1">
                          {timetableEntries.map((entry, index) => (
                            <div key={index} className="flex justify-between">
                              <span>
                                {entry.day} {entry.start_time}-{entry.end_time}
                              </span>
                              <span>{entry.room}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {timetableEntries.length === 0 && (
                        <p className="text-xs opacity-60">No schedule found</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

export default Timetable;
