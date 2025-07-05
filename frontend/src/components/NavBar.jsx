import React from 'react';

// Destructure setShowProfile from the props object
const NavBar = ({ setShowProfile }) => {
  return (
    <nav className="flex items-center justify-between w-full mb-10 px-4 py-3 bg-blue-600 rounded shadow">
      <span className="text-white text-xl font-bold">My DIT Planner</span>
      <button
        // On click, call the function passed down from the parent
        onClick={() => setShowProfile(true)}
        className="px-4 py-2 bg-white text-blue-600 rounded font-semibold hover:bg-blue-100 transition"
      >
        Profile
      </button>
    </nav>
  );
};

export default NavBar;