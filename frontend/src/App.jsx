import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import AllCourses from '@/pages/AllCourses';

function Dashboard({ courses, setCourses, navigate }) {
  // Example static data; replace with backend data as needed
  // const [courses, setCourses] = useState([
  //   { name: 'Introduction to Programming', status: 'Passed', grade: 8.5 },
  //   { name: 'Mathematics I', status: 'Current Semester', grade: null },
  //   { name: 'Computer Architecture', status: 'Not Taken', grade: null },
  //   { name: 'Data Structures', status: 'Passed', grade: 7.8 },
  //   { name: 'Algorithms', status: 'Not Taken', grade: null },
  //   { name: 'Databases', status: 'Not Taken', grade: null },
  //   { name: 'Operating Systems', status: 'Not Taken', grade: null },
  //   { name: 'Web Development', status: 'Not Taken', grade: null },
  //   { name: 'Software Engineering', status: 'Not Taken', grade: null },
  //   { name: 'Networks', status: 'Not Taken', grade: null },
  // ]);
  const totalECTS = 240;
  const totalCompulsory = 16;

  // Derived stats
  const completedCourses = courses.filter((c) => c.status === 'Passed').length;
  const completedECTS = 60; // Replace with real calculation
  const completedCompulsory = 8; // Replace with real calculation
  const averageGrade =
    courses.filter((c) => c.status === 'Passed' && c.grade != null).length > 0
      ? (
          courses
            .filter((c) => c.status === 'Passed' && c.grade != null)
            .reduce((acc, c) => acc + Number(c.grade), 0) /
          courses.filter((c) => c.status === 'Passed' && c.grade != null).length
        ).toFixed(2)
      : '-';
  const failedCourses = 2; // Replace with real calculation
  const plannedCourses = courses.filter((c) => c.status === 'Current Semester').length;

  // Handlers
  const handleStatusChange = (idx, newStatus) => {
    setCourses((prev) =>
      prev.map((course, i) =>
        i === idx
          ? { ...course, status: newStatus, grade: newStatus === 'Passed' ? course.grade : null }
          : course
      )
    );
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
  const completedCoursesList = courses.filter((c) => c.status === 'Passed').map((c) => c.name);

  return (
    <div className="bg-purple-900 min-h-screen">
      <div className="flex flex-col items-center w-full max-w-8xl mx-auto p-8 md:p-14">
        <h1 className="text-3xl font-bold mb-6 text-white w-full">DIT Hub</h1>

        {/* Progress Overview */}
        <section className="mb-8 w-full">
          <h2 className="text-2xl font-semibold mb-4 text-white">Progress Overview</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-800 rounded-lg shadow text-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 text-left">Courses Completed</th>
                  <th className="py-2 px-4 text-left">ECTS Obtained</th>
                  <th className="py-2 px-4 text-left">Compulsory Completed</th>
                  <th className="py-2 px-4 text-left">Planned Courses</th>
                  <th className="py-2 px-4 text-left">Failed Courses</th>
                  <th className="py-2 px-4 text-left">Average Grade</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-gray-700">
                  <td className="py-2 px-4">{completedCourses}</td>
                  <td className="py-2 px-4">
                    {completedECTS} / {totalECTS}
                  </td>
                  <td className="py-2 px-4">
                    {completedCompulsory} / {totalCompulsory}
                  </td>
                  <td className="py-2 px-4">{plannedCourses}</td>
                  <td className="py-2 px-4">{failedCourses}</td>
                  <td className="py-2 px-4">{averageGrade}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Current Semester Courses */}
        <section className="mb-8 w-full">
          {/* <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-white">Current Semester Courses</h2>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-4 rounded"
              onClick={handleAddCourse}
            >
              + Add Course
            </button>
          </div> */}
          {currentSemesterCourses.length === 0 ? (
            <p className="text-gray-700">No courses in the current semester.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-gray-800 rounded-lg shadow text-white">
                <thead>
                  <tr>
                    <th className="py-2 px-4 text-left">Course Name</th>
                    <th className="py-2 px-4 text-left">Status</th>
                    <th className="py-2 px-4 text-left">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {currentSemesterCourses.map((course, idx) => {
                    // Find the index in the original courses array
                    const originalIdx = courses.findIndex(
                      (c) =>
                        c.name === course.name &&
                        c.status === course.status &&
                        c.grade === course.grade
                    );
                    return (
                      <tr key={originalIdx} className="bg-gray-700">
                        <td className="py-2 px-4">{course.name}</td>
                        <td className="py-2 px-4">
                          <select
                            className="bg-gray-900 text-white rounded px-2 py-1"
                            value={course.status}
                            onChange={(e) => handleStatusChange(originalIdx, e.target.value)}
                          >
                            <option value="Not Taken">Not Taken</option>
                            <option value="Current Semester">Current Semester</option>
                            <option value="Passed">Passed</option>
                          </select>
                        </td>
                        <td className="py-2 px-4">
                          {course.status === 'Passed' ? (
                            <input
                              type="number"
                              min="0"
                              max="10"
                              step="0.1"
                              className="bg-gray-900 text-white rounded px-2 py-1 w-24"
                              value={course.grade ?? ''}
                              onChange={(e) => handleGradeChange(originalIdx, e.target.value)}
                              placeholder="Grade"
                            />
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Completed Courses */}
        <section className="mb-8 w-full">
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-white">See Courses</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: See All Courses */}
              <div className="p-6 rounded-lg p-7 shadow bg-gray-400">
                <h3 className="text-xl font-semibold p-4 mb-2 text-gray-800">See All Courses</h3>
                <button
                  className="w-full bg-gray-500 hover:bg-gray-600 text-gray-900 font-semibold py-2 px-4 rounded"
                  onClick={() => navigate('/all-courses')}
                >
                  All Courses
                </button>
              </div>
              {/* Card 2: Plan Courses */}
              <div className="p-6 rounded-lg p-7 shadow bg-gray-400">
                <h3 className="text-xl font-semibold p-4 mb-2 text-gray-800">Plan Courses</h3>
                <button className="w-full bg-gray-500 hover:bg-gray-600 text-gray-900 font-semibold py-2 px-4 rounded">
                  Plan Courses
                </button>
              </div>
              {/* Card 3: See Timetable */}
              <div className="p-6 rounded-lg p-7 shadow bg-gray-400">
                <h3 className="text-xl font-semibold p-4 mb-2 text-gray-800">See Timetable</h3>
                <button className="w-full bg-gray-500 hover:bg-gray-600 text-gray-900 font-semibold py-2 px-4 rounded">
                  Timetable
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Other Features */}
        <section className="w-full">
          <h2 className="text-2xl font-semibold mb-4 text-white">Other Features</h2>
          <p className="text-white">More profile features coming soon...</p>
        </section>
      </div>
    </div>
  );
}

function App() {
  const [courses, setCourses] = useState([
    { name: 'Introduction to Programming', status: 'Passed', grade: 8.5 },
    { name: 'Mathematics I', status: 'Current Semester', grade: null },
    { name: 'Computer Architecture', status: 'Not Taken', grade: null },
    { name: 'Data Structures', status: 'Passed', grade: 7.8 },
    { name: 'Algorithms', status: 'Not Taken', grade: null },
    { name: 'Databases', status: 'Not Taken', grade: null },
    { name: 'Operating Systems', status: 'Not Taken', grade: null },
    { name: 'Web Development', status: 'Not Taken', grade: null },
    { name: 'Software Engineering', status: 'Not Taken', grade: null },
    { name: 'Networks', status: 'Not Taken', grade: null },
  ]);
  const navigate = useNavigate();

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
