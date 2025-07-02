fetch('/api/courses')
  .then(res => res.json())
  .then(courses => {
    // Render courses in your UI
    console.log(courses);
  });

loadCourses();