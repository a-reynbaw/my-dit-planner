import { useEffect, useState } from 'react';
import { Loader2, Calculator } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import DraggableCourse from '@/components/course-planning/DraggableCourse';
import DroppableContainer from '@/components/course-planning/DroppableContainer';
import TrashCan from '@/components/course-planning/TrashCan';
import PlanGrade from '@/components/PlanGrade';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const API_URL = '/api/courses';

function PlanCourses() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [activeCourse, setActiveCourse] = useState(null);
  const [showGradePlanner, setShowGradePlanner] = useState(false);

  // Define the structure of our containers
  const createInitialContainers = () => ({
    unassigned: [],
    ...Object.fromEntries([...Array(8).keys()].map((i) => [`semester-${i + 1}`, []])),
  });

  const [containers, setContainers] = useState(createInitialContainers());
  const [totalECTS, setTotalECTS] = useState(240);

  useEffect(() => {
    setLoading(true);
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        const newContainers = createInitialContainers(); // Start with fresh, empty containers

        // Filter for only the courses that need planning
        const plannedCourses = data.filter((course) => course.status === 'Planned');

        console.log('[PLANNER] Fetched courses with "Planned" status:', plannedCourses);

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
        toast.error(t('planCourses.dragMessages.failedToLoad'));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [t]); // Add t to dependency array

  const sensors = useSensors(useSensor(PointerSensor));

  // Calculate ECTS from planned courses (in containers)
  const plannedECTS = Object.values(containers)
    .flat()
    .reduce((sum, course) => sum + (course.ects || 0), 0);

  console.log(`[PLANNER] ECTS from "Planned" courses (drag & drop area): ${plannedECTS}`);

  // We need to fetch and calculate current and failed courses ECTS
  const [additionalECTS, setAdditionalECTS] = useState(0);

  useEffect(() => {
    // This effect runs after the main data is loaded
    if (!loading) {
      fetch(API_URL)
        .then((res) => res.json())
        .then((data) => {
          // Calculate ECTS from current and failed courses
          const currentCourses = data.filter((course) => course.status === 'Current Semester');
          const failedCourses = data.filter((course) => course.status === 'Failed');

          const currentCoursesECTS = currentCourses.reduce(
            (sum, course) => sum + (course.ects || 0),
            0
          );
          const failedCoursesECTS = failedCourses.reduce(
            (sum, course) => sum + (course.ects || 0),
            0
          );

          // console.log(`[PLANNER] ECTS from "Current Semester" courses: ${currentCoursesECTS}`);
          // console.log(`[PLANNER] ECTS from "Failed" courses: ${failedCoursesECTS}`);

          setAdditionalECTS(currentCoursesECTS + failedCoursesECTS);
        })
        .catch((error) => {
          console.error('Error calculating additional ECTS:', error);
        });
    }
  }, [loading]);

  // Total ECTS including planned, current, and failed courses
  const totalPlannedECTS = plannedECTS + additionalECTS;

  // console.log(
  //   `[PLANNER] FINAL CALCULATION: totalPlannedECTS = ${plannedECTS} (planned) + ${additionalECTS} (current/failed) = ${totalPlannedECTS}`
  // );

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

    const isDroppingInSemester = destinationContainerId.startsWith('semester');
    if (isDroppingInSemester) {
      const destSemesterNum = parseInt(destinationContainerId.split('-')[1], 10);
      const isOddCourse = course.semester % 2 === 1;
      const isEvenDest = destSemesterNum % 2 === 0;
      if ((isOddCourse && isEvenDest) || (!isOddCourse && !isEvenDest)) {
        toast.warning(t('planCourses.dragMessages.oddEvenWarning'));
        return;
      }
    }

    const originalContainers = containers;
    setContainers((prev) => {
      const newContainers = JSON.parse(JSON.stringify(prev));
      const sourceItems = newContainers[sourceContainerId];
      const activeIndex = sourceItems.findIndex((c) => c.id === activeCourseId);

      if (activeIndex === -1) return prev;
      const [movedItem] = sourceItems.splice(activeIndex, 1);

      if (destinationContainerId === 'trash') {
        // Item is removed, handled by the API call below
      } else {
        newContainers[destinationContainerId].push(movedItem);
      }
      return newContainers;
    });

    try {
      if (destinationContainerId === 'trash') {
        await updateCourseBackend(activeCourseId, { status: 'Not Taken', planned_semester: 0 });
        toast.success(t('planCourses.dragMessages.courseRemoved', { courseName: course.name }));
      } else {
        const newPlannedSemester = isDroppingInSemester
          ? parseInt(destinationContainerId.split('-')[1], 10)
          : 0; // 0 for 'unassigned'
        await updateCourseBackend(activeCourseId, { planned_semester: newPlannedSemester });
        toast.success(t('planCourses.dragMessages.courseMoved', { courseName: course.name }));
      }
    } catch (error) {
      toast.error(t('planCourses.dragMessages.failedToSave'));
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
            <h1 className="text-4xl font-bold tracking-tight">{t('planCourses.title')}</h1>
            <p className="text-lg text-gray-400">{t('planCourses.subtitle')}</p>
          </div>
          <div className="text-center w-full">
            <h4 className="text-xl font-bold text-blue-300">{t('planCourses.plannedECTS')}</h4>
            <span className="text-lg font-semibold">
              {totalPlannedECTS} / {totalECTS}
            </span>
            <p className="text-xs text-gray-500 mt-1">{t('planCourses.ectsNote')}</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowGradePlanner(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Calculator className="h-4 w-4 mr-2" />
              {t('planCourses.gradeCalculator', 'Grade Calculator')}
            </Button>
          </div>
        </header>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-blue-400" />
            <p className="ml-4 text-xl text-gray-400">{t('planCourses.loading')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <DroppableContainer
                id="unassigned"
                title={t('planCourses.containers.unassigned')}
                courses={containers.unassigned}
                activeCourse={activeCourse}
              />
            </div>

            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
              {semesterKeys.map((key) => (
                <DroppableContainer
                  key={key}
                  id={key}
                  title={t('planCourses.containers.semester', { number: key.split('-')[1] })}
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

      {/* Grade Planner Popup */}
      <PlanGrade 
        isOpen={showGradePlanner} 
        onClose={() => setShowGradePlanner(false)} 
      />
    </DndContext>
  );
}

export default PlanCourses;
