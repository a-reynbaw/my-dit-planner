import { useEffect, useState } from 'react';
import { Home, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import DraggableCourse from '@/components/course-planning/DraggableCourse';
import DroppableContainer from '@/components/course-planning/DroppableContainer';
import TrashCan from '@/components/course-planning/TrashCan';
import { toast } from 'sonner';

const API_URL = '/api/courses';

function PlanCourses() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeCourse, setActiveCourse] = useState(null);

  // Define the structure of our containers
  const createInitialContainers = () => ({
    unassigned: [],
    ...Object.fromEntries([...Array(8).keys()].map((i) => [`semester-${i + 1}`, []])),
  });

  const [containers, setContainers] = useState(createInitialContainers());
  const [totalECTS, setTotalECTS] = useState(240);

  // --- CORRECTED useEffect ---
  // This hook now correctly partitions the courses on initial load.
  useEffect(() => {
    setLoading(true);
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        const newContainers = createInitialContainers(); // Start with fresh, empty containers

        // Filter for only the courses that need planning
        const plannedCourses = data.filter((course) => course.status === 'Planned');

        plannedCourses.forEach((course) => {
          // If the course has a specific semester planned, place it there.
          if (course.planned_semester && course.planned_semester > 0) {
            const containerId = `semester-${course.planned_semester}`;
            // Ensure the container exists before pushing
            if (newContainers[containerId]) {
              newContainers[containerId].push(course);
            }
          } else {
            // Otherwise, it belongs in the 'unassigned' list.
            newContainers.unassigned.push(course);
          }
        });

        setContainers(newContainers); // Set the new, correctly partitioned state
      })
      .catch(() => {
        toast.error('Failed to load planned courses.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []); // Empty dependency array ensures this runs only once on mount

  const sensors = useSensors(useSensor(PointerSensor));

  const plannedECTS = Object.values(containers)
    .flat()
    .reduce((sum, course) => sum + (course.ects || 0), 0);

  const findContainerIdForCourse = (courseId) => {
    return Object.keys(containers).find((key) =>
      containers[key].some((course) => course.id === courseId)
    );
  };

  const handleDragStart = (event) => {
    const course = event.active.data.current?.course;
    if (course) {
      setActiveCourse(course);
    }
  };

  const updateCourseBackend = async (courseId, updates) => {
    if (updates.status) {
      await fetch(`${API_URL}/${courseId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: updates.status }),
      });
    }
    if (updates.planned_semester !== undefined) {
      await fetch(`${API_URL}/${courseId}/planned_semester`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planned_semester: updates.planned_semester }),
      });
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveCourse(null);

    if (!over) return;

    const activeCourseId = active.id;
    const sourceContainerId = findContainerIdForCourse(activeCourseId);
    const destinationContainerId = over.id;
    const course = active.data.current?.course;

    if (!sourceContainerId || !course || sourceContainerId === destinationContainerId) {
      return;
    }

    // --- Validation Logic (Odd/Even Semester) ---
    const isDroppingInSemester = destinationContainerId.startsWith('semester');
    if (isDroppingInSemester) {
      const destSemesterNum = parseInt(destinationContainerId.split('-')[1], 10);
      const isOddCourse = course.semester % 2 === 1;
      const isEvenDest = destSemesterNum % 2 === 0;
      if ((isOddCourse && isEvenDest) || (!isOddCourse && !isEvenDest)) {
        toast.warning('Course can only be placed in a corresponding odd/even semester.');
        return;
      }
    }

    // --- Optimistic UI Update ---
    const originalContainers = containers;
    setContainers((prev) => {
      const newContainers = JSON.parse(JSON.stringify(prev)); // Deep copy to prevent mutation
      const sourceItems = newContainers[sourceContainerId];
      const activeIndex = sourceItems.findIndex((c) => c.id === activeCourseId);
      
      if (activeIndex === -1) return prev; // Should not happen

      const [movedItem] = sourceItems.splice(activeIndex, 1);

      if (destinationContainerId === 'trash') {
        // Item is removed, handled by the API call below
      } else {
        newContainers[destinationContainerId].push(movedItem);
      }
      return newContainers;
    });

    // --- Backend API Call ---
    try {
      if (destinationContainerId === 'trash') {
        await updateCourseBackend(activeCourseId, { status: 'Not Taken', planned_semester: 0 });
        toast.success(`"${course.name}" was removed from your plan.`);
      } else {
        const newPlannedSemester = isDroppingInSemester
          ? parseInt(destinationContainerId.split('-')[1], 10)
          : 0; // 0 for 'unassigned'
        await updateCourseBackend(activeCourseId, { planned_semester: newPlannedSemester });
        toast.success(`Moved "${course.name}".`);
      }
    } catch (error) {
      toast.error('Failed to save changes. Reverting.');
      setContainers(originalContainers); // Rollback on API error
    }
  };
  
  const isDragging = activeCourse !== null;
  const semesterKeys = Object.keys(containers).filter((k) => k.startsWith('semester'));

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="bg-gray-900 min-h-screen text-white font-sans p-4 md:p-8">
        <header className="flex flex-wrap items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Plan Your Semesters</h1>
            <p className="text-lg text-gray-400">
              Drag & drop courses to organize your academic path.
            </p>
          </div>
          <div className="text-right">
            <h4 className="text-xl font-bold text-blue-300">Planned ECTS</h4>
            <span className="text-lg font-semibold">
              {plannedECTS} / {totalECTS}
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
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-blue-400" />
            <p className="ml-4 text-xl text-gray-400">Loading Planner...</p>
          </div>
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

      <DragOverlay>{activeCourse ? <DraggableCourse course={activeCourse} isOverlay /> : null}</DragOverlay>

      {isDragging && <TrashCan />}
    </DndContext>
  );
}

export default PlanCourses;