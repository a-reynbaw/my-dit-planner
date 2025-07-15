import { useEffect, useState } from 'react';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { toast } from 'sonner';
import DraggableCourse from '@/components/course-planning/DraggableCourse';
import DroppableContainer from '@/components/course-planning/DroppableContainer';
import TrashCan from '@/components/course-planning/TrashCan';

const API_URL = '/api/courses';

function PlanCourses() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeCourse, setActiveCourse] = useState(null);

  // Initialize containers for semesters, unassigned, passed, and failed courses
  const initialContainers = {
    unassigned: [],
    passed: [],
    failed: [],
    ...Object.fromEntries([...Array(8).keys()].map((i) => [`semester-${i + 1}`, []])),
  };

  const [containers, setContainers] = useState(initialContainers);

  // Fetch all courses and distribute them into the correct containers on initial load
  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        const newContainers = { ...initialContainers };
        data.forEach((course) => {
          if (course.status === 'Passed') {
            newContainers.passed.push(course);
          } else if (course.status === 'Failed') {
            newContainers.failed.push(course);
          } else if (course.status === 'Planned') {
            if (course.planned_semester && course.planned_semester > 0) {
              const containerId = `semester-${course.planned_semester}`;
              if (newContainers[containerId]) {
                newContainers[containerId].push(course);
              } else {
                newContainers.unassigned.push(course); // Fallback
              }
            } else {
              newContainers.unassigned.push(course);
            }
          }
        });
        setContainers(newContainers);
        setLoading(false);
      })
      .catch((err) => {
        toast.error('Failed to load course data.');
        console.error('Error fetching courses:', err);
        setLoading(false);
      });
  }, []); // Empty dependency array ensures this runs only once on mount

  const sensors = useSensors(useSensor(PointerSensor));

  // Simplified ECTS calculations
  const totalECTS = 240;
  const completedECTS = containers.passed.reduce((sum, course) => sum + (course.ects || 0), 0);
  const plannedECTS = Object.keys(containers)
    .filter((key) => key.startsWith('semester') || key === 'unassigned')
    .reduce(
      (sum, key) =>
        sum + containers[key].reduce((containerSum, course) => containerSum + course.ects, 0),
      0
    );

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

  // Validation to check if a course can be dropped in a semester (odd/even rule)
  const canDropCourseInSemester = (course, destinationContainerId) => {
    if (!course || !destinationContainerId.startsWith('semester')) {
      return true; // Always allow drops to non-semester containers like 'unassigned'
    }
    const destinationSemester = parseInt(destinationContainerId.split('-')[1], 10);
    const courseSemester = course.semester;
    const isOddCourse = courseSemester % 2 === 1;
    const isOddDestination = destinationSemester % 2 === 1;
    return isOddCourse === isOddDestination;
  };

  async function handleDragEnd(event) {
    const { active, over } = event;
    setActiveCourse(null);

    if (!over) return;

    const activeCourseId = active.id;
    const sourceContainerId = findContainerIdForCourse(activeCourseId);
    const destinationContainerId = over.id;

    if (!sourceContainerId || sourceContainerId === destinationContainerId) return;

    const course = active.data.current?.course;

    if (!canDropCourseInSemester(course, destinationContainerId)) {
      toast.warning(
        `Cannot place a ${
          course.semester % 2 === 1 ? 'winter' : 'spring'
        } course in a ${destinationContainerId.split('-')[1] % 2 === 1 ? 'winter' : 'spring'} semester.`
      );
      return;
    }

    const sourceItems = [...containers[sourceContainerId]];
    const destinationItems =
      destinationContainerId === 'trash' ? [] : [...containers[destinationContainerId]];
    const activeIndex = sourceItems.findIndex((c) => c.id === activeCourseId);
    const [movedItem] = sourceItems.splice(activeIndex, 1);

    if (destinationContainerId !== 'trash') {
      destinationItems.push(movedItem);
    }

    // Optimistically update the UI
    setContainers((prev) => ({
      ...prev,
      [sourceContainerId]: sourceItems,
      [destinationContainerId]: destinationItems,
    }));

    // Handle the "Trash" action to un-plan a course
    if (destinationContainerId === 'trash') {
      try {
        const response = await fetch(`${API_URL}/${activeCourseId}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'Not Taken' }),
        });
        if (!response.ok) throw new Error('Server error');
        toast.success(`"${movedItem.name}" was successfully un-planned.`);
      } catch (error) {
        toast.error('Failed to un-plan the course. Please try again.');

        setContainers((prev) => ({
          ...prev,
          [sourceContainerId]: [...sourceItems, movedItem],
          [destinationContainerId]: destinationItems.filter((c) => c.id !== activeCourseId),
        }));
      }
      return;
    }

    const newPlannedSemester = destinationContainerId.startsWith('semester')
      ? parseInt(destinationContainerId.split('-')[1], 10)
      : 0;

    try {
      const response = await fetch(`${API_URL}/${activeCourseId}/planned_semester`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planned_semester: newPlannedSemester }),
      });
      if (!response.ok) throw new Error('Server error');
      toast.success(`Moved "${movedItem.name}" to ${destinationContainerId.replace('-', ' ')}.`);
    } catch (error) {
      toast.error('Failed to save plan. Please try again.');
      setContainers((prev) => ({
        ...prev,
        [sourceContainerId]: [...sourceItems, movedItem],
        [destinationContainerId]: destinationItems.filter((c) => c.id !== activeCourseId),
      }));
    }
  }

  const isDragging = activeCourse !== null;
  const semesterKeys = Object.keys(containers).filter((k) => k.startsWith('semester'));

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="bg-gray-900 min-h-screen text-white font-sans p-4 md:p-8">
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Plan Your Semesters</h1>
            <p className="text-lg text-gray-400">
              Drag and drop courses to organize your academic path.
            </p>
          </div>
          <div className="text-right">
            <h4 className="text-xl font-bold">Total ECTS Progress</h4>
            <span className="text-lg font-semibold text-blue-300">
              {completedECTS + plannedECTS} / {totalECTS}
            </span>
            <p className="text-sm text-gray-400">
              (Passed: {completedECTS}, Planned: {plannedECTS})
            </p>
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
          <p className="text-center py-10 text-gray-400">Loading your course plan...</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <DroppableContainer
                id="unassigned"
                title="Courses to Plan"
                courses={containers.unassigned}
                activeCourse={activeCourse}
              />
            </div>

            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
              {semesterKeys.map((key) => (
                <DroppableContainer
                  key={key}
                  id={key}
                  title={`Semester ${key.split('-')[1]}`}
                  courses={containers[key]}
                  activeCourse={activeCourse}
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
