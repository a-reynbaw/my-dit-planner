import { useDroppable } from '@dnd-kit/core';
import DraggableCourse from './DraggableCourse';

function DroppableContainer({ id, title, courses, activeCourse }) {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  const isSemesterContainer = id.startsWith('semester');
  const semesterNumber = isSemesterContainer ? parseInt(id.split('-')[1], 10) : null;

  // Updated validation logic for odd/even semesters
  const isValidDropTarget = () => {
    if (!activeCourse) return false;
    
    // Always allow drops to unassigned container
    if (id === 'unassigned') return true;
    
    // For non-semester containers, allow drops
    if (!isSemesterContainer) return true;
    
    // For semester containers, check odd/even matching
    const courseSemester = activeCourse.semester;
    const isOddSemesterCourse = courseSemester % 2 === 1; // odd semester (1, 3, 5, 7)
    const isEvenSemesterCourse = courseSemester % 2 === 0; // even semester (2, 4, 6, 8)
    const isOddDestination = semesterNumber % 2 === 1;
    const isEvenDestination = semesterNumber % 2 === 0;

    // Check if the drop is valid based on odd/even semester matching
    return (isOddSemesterCourse && isOddDestination) || (isEvenSemesterCourse && isEvenDestination);
  };

  const isValidDrop = isValidDropTarget();

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 shadow-lg">
      <h3 className="text-lg font-semibold mb-4 text-blue-300">{title}</h3>
      <div
        ref={setNodeRef}
        className={`min-h-[200px] rounded-lg border-2 border-dashed transition-colors ${
          isOver && isValidDrop
            ? 'border-green-500 bg-gray-700/50'
            : isOver && !isValidDrop
              ? 'border-red-500 bg-red-900/20'
              : activeCourse && isValidDrop
                ? 'border-blue-500'
                : 'border-gray-600'
        }`}
      >
        {courses.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 p-3">
            {courses.map((course) => (
              <DraggableCourse key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            Drop courses here
          </div>
        )}
      </div>
    </div>
  );
}

export default DroppableContainer;
