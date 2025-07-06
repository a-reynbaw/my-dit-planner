import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import AllCourses from '@/pages/AllCourses';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function Dashboard({ courses, setCourses, navigate }) {
  const totalECTS = 240;
  const totalCompulsory = 16;

  // Derived stats
  const completedCourses = courses.filter((c) => c.status === 'Passed').length;
  const completedECTS = courses
    .filter((c) => c.status === 'Passed')
    .reduce((sum, course) => sum + course.ects, 0);

  const completedCompulsory = courses.filter((c) => c.status === 'Passed' && c.type === 'ΥΜ').length;
  const averageGrade =
    courses.filter((c) => c.status === 'Passed' && c.grade != null).length > 0
      ? (
          courses
            .filter((c) => c.status === 'Passed' && c.grade != null)
            .reduce((acc, c) => acc + Number(c.grade), 0) /
          courses.filter((c) => c.status === 'Passed' && c.grade != null).length
        ).toFixed(2)
      : '-';
  const failedCourses = courses.filter((c) => c.status === 'Failed').length;
  const plannedCourses = courses.filter((c) => c.status === 'Planned').length;

  // Handlers
  const handleStatusChange = (courseId, newStatus) => {
    const originalCourses = [...courses];
    const updatedCourses = courses.map((course) =>
      course.id === courseId
        ? { ...course, status: newStatus, grade: newStatus === 'Passed' ? course.grade : null }
        : course
    );
    setCourses(updatedCourses);

    fetch(`http://localhost:8000/api/courses/${courseId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: newStatus }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to update status');
        }
        return response.json();
      })
      .catch((error) => {
        console.error('Error updating course status:', error);
        // Revert to the original state if the API call fails
        setCourses(originalCourses);
      });
  };

  const handleGradeChange = (idx, newGrade) => {
    setCourses((prev) =>
      prev.map((course, i) => (i === idx ? { ...course, grade: newGrade } : course))
    );
  };

  // const handleAddCourse = () => {
  //   const newCourseName = prompt('Enter the course name:');
  //   if (newCourseName && newCourseName.trim() !== '') {
  //     setCourses((prev) => [
  //       ...prev,
  //       { name: newCourseName.trim(), status: 'Current Semester', grade: null },
  //     ]);
  //   }
  // };

  // Only show courses in the current semester
  const currentSemesterCourses = courses.filter((c) => c.status === 'Current Semester');
  // For the completed courses section
  const completedCoursesData = courses.filter((c) => c.status === 'Passed');

  return (
    <div className="bg-gray-200 min-h-screen">
      <div className="flex flex-col items-center w-full max-w-8xl mx-auto p-8 md:p-14">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 w-full">DIT Hub</h1>

        {/* Table for current status*/}
        {/* Progress Overview */}
        <section className="mb-8 w-full">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">Progress Overview</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-800 rounded-lg shadow text-white">
              <tbody>
                <tr className="bg-gray-700">
                  <td className="py-2 px-4">Courses Completed</td>
                  <td className="py-2 px-4">{completedCourses}</td>
                </tr>
                <tr className="bg-gray-700">
                  <td className="py-2 px-4">ECTS Obtained</td>
                  <td className="py-2 px-4">
                    {completedECTS} / {totalECTS}
                  </td>
                </tr>
                <tr className="bg-gray-700">
                  <td className="py-2 px-4">Compulsory Completed</td>
                  <td className="py-2 px-4">
                    {completedCompulsory} / {totalCompulsory}
                  </td>
                </tr>
                <tr className="bg-gray-700">
                  <td className="py-2 px-4">Planned Courses</td>
                  <td className="py-2 px-4">{plannedCourses}</td>
                </tr>
                <tr className="bg-gray-700">
                  <td className="py-2 px-4">Failed Courses</td>
                  <td className="py-2 px-4">{failedCourses}</td>
                </tr>
                <tr className="bg-gray-700">
                  <td className="py-2 px-4">Average Grade</td>
                  <td className="py-2 px-4">{averageGrade}</td>
                </tr>
              </tbody>
            </table>

          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mb-8">
          {/* Current Semester Courses */}
          <Card className="bg-gray-800 border-gray-700 text-white">
            <CardHeader>
              <CardTitle>Current Semester Courses</CardTitle>
            </CardHeader>
            <CardContent>
              {currentSemesterCourses.length === 0 ? (
                <p className="text-gray-400">No courses in the current semester.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700 hover:bg-gray-700">
                      <TableHead className="text-white">Course Name</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentSemesterCourses.map((course) => (
                      <TableRow key={course.id} className="border-gray-700 hover:bg-gray-700">
                        <TableCell>{course.name}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Completed Courses List */}
          <Card className="bg-gray-800 border-gray-700 text-white">
            <CardHeader>
              <CardTitle>Completed Courses</CardTitle>
            </CardHeader>
            <CardContent>
              {completedCoursesData.length === 0 ? (
                <p className="text-gray-400">No courses completed yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700 hover:bg-gray-700">
                      <TableHead className="text-white">Course Name</TableHead>
                      <TableHead className="text-white text-right">Grade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {completedCoursesData.map((course) => (
                      <TableRow key={course.id} className="border-gray-700 hover:bg-gray-700">
                        <TableCell>{course.name}</TableCell>
                        <TableCell className="text-right">{course.grade ?? '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* See Courses Cards */}
        <section className="mb-8 w-full">
          <div>
            {/* <h2 className="text-2xl font-semibold mb-4 text-white">See Courses</h2> */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: See All Courses */}
              <div className="p-6 rounded-lg shadow bg-gray-800">
                <h3 className="text-xl font-semibold p-4 mb-2 text-white">See All Courses</h3>
                <button
                  className="w-full bg-gray-400 hover:bg-gray-500 text-gray-900 font-semibold py-2 px-4 rounded"
                  onClick={() => navigate('/all-courses')}
                >
                  All Courses
                </button>
              </div>
              {/* Card 2: Plan Courses */}
              <div className="p-6 rounded-lg shadow bg-gray-800">
                <h3 className="text-xl font-semibold p-4 mb-2 text-white">Plan Courses</h3>
                <button className="w-full bg-gray-400 hover:bg-gray-500 text-gray-900 font-semibold py-2 px-4 rounded">
                  Plan Courses
                </button>
              </div>
              {/* Card 3: See Timetable */}
              <div className="p-6 rounded-lg shadow bg-gray-800">
                <h3 className="text-xl font-semibold p-4 mb-2 text-white">See Timetable</h3>
                <button className="w-full bg-gray-400 hover:bg-gray-500 text-gray-900 font-semibold py-2 px-4 rounded">
                  Timetable
                </button>
              </div>
            </div>
          </div>
        </section>
              <span className="sr-only">YASUUU</span>
        {/* Other Features
        <section className="w-full">
          <h2 className="text-2xl font-semibold mb-4 text-white">Other Features</h2>
          <p className="text-white">More profile features coming soon...</p>
        </section> */}
      </div>
    </div>
  );
}

function App() {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:8000/api/courses')
      .then((res) => res.json())
      .then((data) => setCourses(data))
      .catch((error) => console.error('Error fetching courses:', error));
  }, []);


  return (
    <Routes>
      <Route
        path="/"
        element={<Dashboard courses={courses} setCourses={setCourses} navigate={navigate} />}
      />
      <Route path="/all-courses" element={<AllCourses />} />
    </Routes>
  );
}

export default App;
