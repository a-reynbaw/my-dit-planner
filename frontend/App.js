import React, { useState } from 'react';

function App() {
  const [activeTab, setActiveTab] = useState('home');

  const renderHome = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center justify-center py-16">
      <h1 className="text-4xl font-bold mb-4 text-blue-800">My DIT Planner</h1>
      <p className="text-lg text-blue-700 mb-8">
        Organize your university life: track courses, plan semesters, and manage your schedule!
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <span className="text-3xl">📚</span>
          <h3 className="text-xl font-semibold mb-2 mt-2">View Courses</h3>
          <p className="text-gray-600">Browse all available courses and details.</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <span className="text-3xl">🗓️</span>
          <h3 className="text-xl font-semibold mb-2 mt-2">Plan Semesters</h3>
          <p className="text-gray-600">Organize your courses by semester and create your study plan.</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <span className="text-3xl">⏰</span>
          <h3 className="text-xl font-semibold mb-2 mt-2">View Schedule</h3>
          <p className="text-gray-600">See your weekly schedule at a glance.</p>
        </div>
      </div>
    </div>
  );

  const renderCourses = () => (
    <div className="min-h-screen bg-blue-50 py-8">
      <div className="container mx-auto px-6 max-w-3xl">
        <h2 className="text-2xl font-bold mb-6 text-blue-800">Courses</h2>
        <p className="mb-4 text-gray-700">Here you will be able to view and search all DIT courses.</p>
        {/* TODO: List courses here */}
        <div className="bg-white rounded-xl shadow p-6 text-center text-gray-400">
          Course list coming soon!
        </div>
      </div>
    </div>
  );

  const renderSemesters = () => (
    <div className="min-h-screen bg-blue-50 py-8">
      <div className="container mx-auto px-6 max-w-3xl">
        <h2 className="text-2xl font-bold mb-6 text-blue-800">Plan Semesters</h2>
        <p className="mb-4 text-gray-700">Plan your semesters by adding courses to each term.</p>
        {/* TODO: Semester planning UI */}
        <div className="bg-white rounded-xl shadow p-6 text-center text-gray-400">
          Semester planning coming soon!
        </div>
      </div>
    </div>
  );

  const renderSchedule = () => (
    <div className="min-h-screen bg-blue-50 py-8">
      <div className="container mx-auto px-6 max-w-3xl">
        <h2 className="text-2xl font-bold mb-6 text-blue-800">Schedule</h2>
        <p className="mb-4 text-gray-700">View your weekly schedule here.</p>
        {/* TODO: Schedule visualization */}
        <div className="bg-white rounded-xl shadow p-6 text-center text-gray-400">
          Schedule view coming soon!
        </div>
      </div>
    </div>
  );

  const renderFuture = () => (
    <div className="min-h-screen bg-blue-50 py-8">
      <div className="container mx-auto px-6 max-w-3xl">
        <h2 className="text-2xl font-bold mb-6 text-blue-800">Future Features</h2>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>Progress tracking</li>
          <li>Exam reminders</li>
          <li>Collaboration with classmates</li>
          <li>Notes and resources per course</li>
        </ul>
      </div>
    </div>
  );

  return (
    <div className="App">
      {/* Navigation */}
      <nav className="bg-white shadow sticky top-0 z-50">
        <div className="container mx-auto px-6 flex justify-between items-center py-4">
          <span className="text-2xl font-bold text-blue-800">My DIT Planner</span>
          <div className="space-x-4">
            <button
              onClick={() => setActiveTab('home')}
              className={`py-2 px-4 rounded ${
                activeTab === 'home' ? 'bg-blue-500 text-white' : 'text-blue-700 hover:bg-blue-100'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setActiveTab('courses')}
              className={`py-2 px-4 rounded ${
                activeTab === 'courses' ? 'bg-blue-500 text-white' : 'text-blue-700 hover:bg-blue-100'
              }`}
            >
              View Courses
            </button>
            <button
              onClick={() => setActiveTab('semesters')}
              className={`py-2 px-4 rounded ${
                activeTab === 'semesters' ? 'bg-blue-500 text-white' : 'text-blue-700 hover:bg-blue-100'
              }`}
            >
              Plan Semesters
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`py-2 px-4 rounded ${
                activeTab === 'schedule' ? 'bg-blue-500 text-white' : 'text-blue-700 hover:bg-blue-100'
              }`}
            >
              View Schedule
            </button>
            <button
              onClick={() => setActiveTab('future')}
              className={`py-2 px-4 rounded ${
                activeTab === 'future' ? 'bg-blue-500 text-white' : 'text-blue-700 hover:bg-blue-100'
              }`}
            >
              Future Features
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      {activeTab === 'home' && renderHome()}
      {activeTab === 'courses' && renderCourses()}
      {activeTab === 'semesters' && renderSemesters()}
      {activeTab === 'schedule' && renderSchedule()}
      {activeTab === 'future' && renderFuture()}
    </div>
  );
}

export default App;