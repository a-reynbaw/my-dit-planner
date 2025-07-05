import React, { useEffect, useState } from 'react';

// Replace with your actual backend API endpoint
const API_URL = 'http://localhost:5000/api/courses';

function Courses() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch all courses from backend
  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        setCourses(data);
        setLoading(false);
      });
  }, []);

  // Handler to update course status
  const updateStatus = (id, newStatus) => {
    fetch(`${API_URL}/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
      .then((res) => res.json())
      .then((updated) => {
        setCourses((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
        );
      });
  };

  // Filtered courses by search
  const filteredCourses = courses.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 font-sans max-w-5xl mx-auto text-white">
      <h1 className="text-3xl font-bold mb-6">All Courses</h1>
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name or code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 rounded bg-gray-800 text-white w-full md:w-1/2"
        />
      </div>
      {loading ? (
        <p>Loading courses...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-800 rounded-lg shadow text-white">
            <thead>
              <tr>
                <th className="py-2 px-4 text-left">Name</th>
                <th className="py-2 px-4 text-left">Code</th>
                <th className="py-2 px-4 text-left">ECTS</th>
                <th className="py-2 px-4 text-left">Semester</th>
                <th className="py-2 px-4 text-left">Type</th>
                <th className="py-2 px-4 text-left">Status</th>
                <th className="py-2 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.map((course) => (
                <tr key={course.id} className="bg-gray-700">
                  <td className="py-2 px-4">{course.name}</td>
                  <td className="py-2 px-4">{course.code}</td>
                  <td className="py-2 px-4">{course.ects}</td>
                  <td className="py-2 px-4">{course.semester}</td>
                  <td className="py-2 px-4">{course.type}</td>
                  <td className="py-2 px-4">{course.status}</td>
                  <td className="py-2 px-4 space-x-2">
                    <button
                      onClick={() => updateStatus(course.id, 'Current Semester')}
                      className="px-2 py-1 bg-blue-500 rounded hover:bg-blue-600 text-white text-sm"
                      disabled={course.status === 'Current Semester'}
                    >
                      Set as Current
                    </button>
                    <button
                      onClick={() => updateStatus(course.id, 'Passed')}
                      className="px-2 py-1 bg-green-500 rounded hover:bg-green-600 text-white text-sm"
                      disabled={course.status === 'Passed'}
                    >
                      Set as Passed
                    </button>
                  </td>
                </tr>
              ))}
              {filteredCourses.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-4 text-center text-gray-400">
                    No courses found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Courses;