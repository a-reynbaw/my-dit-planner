import { useEffect, useState } from 'react';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import DraggableCourse from '@/components/course-planning/DraggableCourse';
import DroppableContainer from '@/components/course-planning/DroppableContainer';
import TrashCan from '@/components/course-planning/TrashCan';

const API_URL = 'http://localhost:8000/api/courses';

function PlanCourses() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeCourse, setActiveCourse] = useState(null);

  const initialContainers = {
    unassigned: [],
    passed: [],
    ...Object.fromEntries([...Array(8).keys()].map((i) => [`semester-${i + 1}`, []])),
  };

  const [containers, setContainers] = useState(initialContainers);

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        setContainers((prev) => ({
          ...prev,
          unassigned: data.filter((c) => c.status === 'Planned'),
          passed: data.filter((c) => c.status === 'Passed'),
        }));
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching courses:', err);
        setLoading(false);
      });
  }, []);

  const sensors = useSensors(useSensor(PointerSensor));

  const totalECTS = 240;
  const plannedECTS = containers.unassigned.reduce((sum, course) => sum + (course.ects || 0), 0);
  const completedECTS = containers.passed.reduce((sum, course) => sum + (course.ects || 0), 0);

  const findContainerIdForCourse = (courseId) => {
    return Object.keys(containers).find((key) =>
      containers[key].some((course) => course.id === courseId)
    );
  };

  function handleDragStart(event) {
    const course = event.active.data.current?.course;
    if (course) {
      setActiveCourse(course);
    }
  }

  async function handleDragEnd(event) {
    const { active, over } = event;
    setActiveCourse(null);

    if (!over) return;

    const activeCourseId = active.id;
    const sourceContainerId = findContainerIdForCourse(activeCourseId);
    const destinationContainerId = over.id;

    if (!sourceContainerId) return;

    if (destinationContainerId === 'trash') {
      try {
        const response = await fetch(`${API_URL}/${activeCourseId}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'Not Taken' }),
        });

        if (!response.ok) throw new Error('Failed to update course status');

        setContainers((prev) => {
          const newContainers = { ...prev };
          newContainers[sourceContainerId] = newContainers[sourceContainerId].filter(
            (course) => course.id !== activeCourseId
          );
          return newContainers;
        });
      } catch (error) {
        console.error('Error un-planning course:', error);
      }
      return;
    }

    if (sourceContainerId !== destinationContainerId) {
      setContainers((prev) => {
        const newContainers = { ...prev };
        const sourceItems = [...newContainers[sourceContainerId]];
        const destinationItems = [...newContainers[destinationContainerId]];

        const activeIndex = sourceItems.findIndex((c) => c.id === activeCourseId);

        if (activeIndex !== -1) {
          const [movedItem] = sourceItems.splice(activeIndex, 1);
          destinationItems.push(movedItem);

          newContainers[sourceContainerId] = sourceItems;
          newContainers[destinationContainerId] = destinationItems;
        }

        return newContainers;
      });
    }
  }

  const isDragging = activeCourse !== null;
  const semesterKeys = Object.keys(containers).filter((k) => k.startsWith('semester'));

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="bg-gray-900 min-h-screen text-white font-sans p-4 md:p-8">
        <header className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Plan Your Semesters</h1>
            <p className="text-lg text-gray-400">
              Drag and drop courses to organize your academic path.
            </p>
          </div>
          <div>
            <h4 className="text-xl font-bold">Planned ECTS</h4>
            <span className="text-lg font-semibold text-blue-300">
              {plannedECTS + completedECTS} / {totalECTS}
            </span>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/')}
            className="bg-gray-800 border-gray-700 hover:bg-gray-700"
          >
            <Home className="h-5 w-5" />
          </Button>
        </header>

        {loading ? (
          <p className="text-center py-10 text-gray-400">Loading planned courses...</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <DroppableContainer
                id="unassigned"
                title="Courses to Plan"
                courses={containers.unassigned}
              />
            </div>

            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
              {semesterKeys.map((key) => (
                <DroppableContainer
                  key={key}
                  id={key}
                  title={`Semester ${key.split('-')[1]}`}
                  courses={containers[key]}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <DragOverlay>
        {activeCourse ? <DraggableCourse course={activeCourse} isOverlay /> : null}
      </DragOverlay>

      {isDragging && <TrashCan />}
    </DndContext>
  );
}

export default PlanCourses;
