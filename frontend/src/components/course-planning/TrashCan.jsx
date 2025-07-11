import { useDroppable } from '@dnd-kit/core';
import { Trash2 } from 'lucide-react';

function TrashCan() {
  const { setNodeRef, isOver } = useDroppable({
    id: 'trash',
  });

  const style = {
    transition: 'transform 0.2s ease-in-out, background-color 0.2s ease-in-out',
    transform: isOver ? 'scale(1.1)' : 'scale(1)',
    backgroundColor: isOver ? 'rgba(239, 68, 68, 0.8)' : 'rgba(156, 163, 175, 0.7)',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="fixed bottom-10 right-10 z-50 flex h-20 w-20 items-center justify-center rounded-full backdrop-blur-sm"
    >
      <Trash2 className="h-10 w-10 text-white" />
    </div>
  );
}

export default TrashCan;
