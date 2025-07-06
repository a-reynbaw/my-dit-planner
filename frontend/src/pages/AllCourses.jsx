import React, { useEffect, useState } from 'react';

// Backend API endpoint
const API_URL = 'http://localhost:8000/api/courses';

function AllCourses() {
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
      .then(() => {
        setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c)));
      });
  };

  // Filtered courses by search
  const filteredCourses = courses.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 font-sans w-full mx-auto text-white">
      <h1 className="text-3xl font-bold mb-6">All Courses</h1>
      <div className="mb-6 flex justify-center">
        <input
          type="text"
          placeholder="Search by name or code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-6 py-3 rounded-full bg-gray-800 text-white w-full md:w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      {loading ? (
        <p>Loading courses...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-gray-800 rounded-lg shadow text-white">
            <thead>
              <tr className="bg-gray-700">
                <th className="py-4 px-6 text-left">Name</th>
                <th className="py-4 px-6 text-left">Code</th>
                <th className="py-4 px-6 text-left">ECTS</th>
                <th className="py-4 px-6 text-left">Semester</th>
                <th className="py-4 px-6 text-left">Type</th>
                <th className="py-4 px-6 text-left">Status</th>
                <th className="py-4 px-6 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.map((course, index) => (
                <tr key={course.id} className={index % 2 === 0 ? "bg-gray-800" : "bg-gray-600"}>
                  <td className="py-4 px-6">{course.name}</td>
                  <td className="py-4 px-6">{course.code}</td>
                  <td className="py-4 px-6">{course.ects}</td>
                  <td className="py-4 px-6">{course.semester}</td>
                  <td className="py-4 px-6">{course.type}</td>
                  <td className="py-4 px-6">{course.status}</td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={() => updateStatus(course.id, 'Current Semester')}
                        className="w-full px-3 py-2 bg-blue-500 rounded hover:bg-blue-600 text-white text-sm"
                        disabled={course.status === 'Current Semester'}
                      >
                        Set as Current
                      </button>
                      <button
                        onClick={() => updateStatus(course.id, 'Passed')}
                        className="w-full px-3 py-2 bg-green-500 rounded hover:bg-green-600 text-white text-sm"
                        disabled={course.status === 'Passed'}
                      >
                        Set as Passed
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCourses.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-gray-400">
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

export default AllCourses;
