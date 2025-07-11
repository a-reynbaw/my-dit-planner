import { useDraggable } from '@dnd-kit/core';

function DraggableCourse({ course, isOverlay = false }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: course.id,
    data: { course },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        bg-gray-800 text-white p-3 rounded-lg cursor-grab active:cursor-grabbing
        transition-all duration-200 hover:bg-gray-700/80 border border-gray-700
        ${isDragging ? 'opacity-50' : ''}
        ${isOverlay ? 'shadow-lg rotate-3' : ''}
        min-h-[80px] flex flex-col justify-center
      `}
    >
      <h4 className="font-semibold text-sm mb-1 text-blue-300">{course.code}</h4>
      <p className="text-xs text-gray-300 opacity-90 line-clamp-2">{course.name}</p>
    </div>
  );
}

export default DraggableCourse;
