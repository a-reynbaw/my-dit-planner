import { useDroppable } from '@dnd-kit/core';
import DraggableCourse from './DraggableCourse';

function DroppableContainer({ id, title, courses }) {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 shadow-lg">
      <h3 className="text-lg font-semibold mb-4 text-blue-300">{title}</h3>
      <div
        ref={setNodeRef}
        className={`min-h-[200px] rounded-lg border-2 border-dashed transition-colors ${
          isOver ? 'border-blue-500 bg-gray-700/50' : 'border-gray-600'
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
