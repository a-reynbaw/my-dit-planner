const { ipcRenderer } = require('electron');

async function loadCourses() {
  const courses = await ipcRenderer.invoke('get-courses');
  // Render courses in your UI
  console.log(courses);
}

loadCourses();