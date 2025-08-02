import { useEffect, useState } from 'react';
import { Search, ChevronDown, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toGreeklish, toGreek } from 'greek-utils';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const API_URL = '/api/courses';

const getStatusBadgeColor = (status) => {
  switch (status) {
    case 'Passed':
      return 'bg-green-600 hover:bg-green-700 text-white transition-colors duration-200';
    case 'Current Semester':
      return 'bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200';
    case 'Planned':
      return 'bg-yellow-500 hover:bg-yellow-600 text-black transition-colors duration-200';
    case 'Failed':
      return 'bg-red-600 hover:bg-red-700 text-white transition-colors duration-200';
    default:
      return 'bg-gray-500 hover:bg-gray-600 text-white transition-colors duration-200';
  }
};

// Helper function to get the background color based on the semester
const getSemesterBadgeClass = (semester) => {
  if (semester >= 1 && semester <= 2) return 'bg-blue-200 text-blue-800';
  if (semester >= 3 && semester <= 4) return 'bg-yellow-200 text-yellow-800';
  if (semester >= 5 && semester <= 6) return 'bg-orange-200 text-orange-800';
  if (semester >= 7 && semester <= 8) return 'bg-pink-200 text-pink-800';
  return 'bg-gray-500 text-white'; // Default case
};

function AllCourses() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ semester: 'all', type: 'all' });
  const [userCurrentSemester, setUserCurrentSemester] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch both courses and user's current semester
    Promise.all([
      fetch(API_URL).then((res) => res.json()),
      fetch('/api/profile/current_semester').then((res) => res.json()),
    ])
      .then(([coursesData, semesterData]) => {
        setCourses(coursesData);
        setUserCurrentSemester(semesterData.current_semester);
        setLoading(false);
      })
      .catch(() => {
        toast.error('Failed to load courses.');
        setLoading(false);
      });
  }, []);

  const checkSemesterParity = (courseId, newStatus) => {
    if (newStatus !== 'Current Semester') {
      return { valid: true };
    }

    // Find the course
    const course = courses.find((c) => c.id === courseId);
    if (!course) {
      return { valid: false, message: 'Course not found.' };
    }

    // Check if user has set their current semester
    if (!userCurrentSemester) {
      return {
        valid: false,
        message:
          'Please set your current semester in your profile before marking courses as current.',
        showProfileLink: true,
      };
    }

    // Check semester parity
    const courseSemester = course.semester;
    const userSemesterIsOdd = userCurrentSemester % 2 === 1;
    const courseSemesterIsOdd = courseSemester % 2 === 1;

    if (userSemesterIsOdd !== courseSemesterIsOdd) {
      const courseType = courseSemesterIsOdd ? 'odd' : 'even';
      const userType = userSemesterIsOdd ? 'odd' : 'even';

      return {
        valid: false,
        message: `Cannot mark this course as current. "${course.name}" is a semester ${courseSemester} (${courseType}) course, but you're currently in semester ${userCurrentSemester} (${userType}). Please update your current semester in your profile if this is correct.`,
        showProfileLink: true,
      };
    }

    return { valid: true };
  };

  const updateStatus = (id, newStatus) => {
    // Validate semester parity before making the request
    const validation = checkSemesterParity(id, newStatus);

    if (!validation.valid) {
      if (validation.showProfileLink) {
        toast.error(validation.message, {
          duration: 8000,
          action: {
            label: 'Update Profile',
            onClick: () => navigate('/profile'),
          },
        });
      } else {
        toast.error(validation.message);
      }
      return;
    }

    const originalCourses = [...courses];
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const updatedCourse = { ...c, status: newStatus };
          if (newStatus === 'Not Taken') {
            updatedCourse.grade = null;
          }
          return updatedCourse;
        }
        return c;
      })
    );

    fetch(`${API_URL}/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        toast.success(`Status updated to "${newStatus}"`);
      })
      .catch(() => {
        toast.error('Failed to update status. Reverting.');
        setCourses(originalCourses);
      });
  };

  const updateGrade = (id, newGrade) => {
    const gradeValue = parseFloat(newGrade);
    if (isNaN(gradeValue) || gradeValue < 0 || gradeValue > 10) {
      toast.error('Please enter a valid grade between 0 and 10.');
      return;
    }

    const originalCourses = [...courses];
    setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, grade: gradeValue } : c)));

    fetch(`/api/courses/${id}/grade`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ grade: gradeValue }),
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        toast.success(`Grade updated to ${gradeValue}`);
      })
      .catch(() => {
        toast.error('Failed to update grade. Reverting.');
        setCourses(originalCourses);
      });
  };

  // Helper function to check if a course has semester parity mismatch
  const hasSemesterMismatch = (course) => {
    if (!userCurrentSemester) return false;
    const userSemesterIsOdd = userCurrentSemester % 2 === 1;
    const courseSemesterIsOdd = course.semester % 2 === 1;
    return userSemesterIsOdd !== courseSemesterIsOdd;
  };

  const filteredCourses = courses.filter((c) => {
    const searchLower = search.toLowerCase();
    const courseName = c.name.toLowerCase();

    // Search logic
    const matchesSearch =
      search.trim() === '' ||
      courseName.includes(searchLower) ||
      c.code.toLowerCase().includes(searchLower) ||
      toGreek(courseName).includes(toGreek(searchLower)) ||
      toGreeklish(courseName).includes(toGreeklish(searchLower));

    // Filter logic
    const matchesSemester = filters.semester === 'all' || c.semester === filters.semester;
    const matchesType = filters.type === 'all' || c.type === filters.type;

    return matchesSearch && matchesSemester && matchesType;
  });

  const courseTypes = [...new Set(courses.map((c) => c.type))];

  return (
    <div className="bg-gray-900 min-h-screen text-white p-4 md:p-8">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">All University Courses</h1>
          <p className="text-lg text-gray-400">Browse, search, and manage all available courses.</p>
          {userCurrentSemester && (
            <p className="text-sm text-gray-400 mt-1">
              Current semester: {userCurrentSemester} (
              {userCurrentSemester % 2 === 1 ? 'odd' : 'even'})
            </p>
          )}
        </div>
      </header>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            type="text"
            placeholder="Search by name or code (Greek/Greeklish)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 h-12 bg-gray-800 border-gray-700 text-white rounded-md focus:border-blue-500 transition-all duration-200"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="h-12 w-full md:w-auto bg-gray-700 border-gray-600 text-white hover:bg-gray-600 hover:text-white transition-colors duration-200"
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" /> Filters
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-gray-800 text-white border-gray-700" align="end">
            <DropdownMenuLabel className="text-white">Filter by Semester</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gray-600" />
            {['all', 1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
              <DropdownMenuCheckboxItem
                key={sem}
                checked={filters.semester === sem}
                onCheckedChange={() => setFilters((f) => ({ ...f, semester: sem }))}
                className="text-white focus:bg-gray-700 focus:text-white"
              >
                {sem === 'all' ? 'All Semesters' : `Semester ${sem}`}
              </DropdownMenuCheckboxItem>
            ))}

            <DropdownMenuLabel className="mt-2 text-white">Filter by Type</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gray-600" />
            <DropdownMenuCheckboxItem
              checked={filters.type === 'all'}
              onCheckedChange={() => setFilters((f) => ({ ...f, type: 'all' }))}
              className="text-white focus:bg-gray-700 focus:text-white"
            >
              All Types
            </DropdownMenuCheckboxItem>
            {courseTypes.map((type) => (
              <DropdownMenuCheckboxItem
                key={type}
                checked={filters.type === type}
                onCheckedChange={() => setFilters((f) => ({ ...f, type }))}
                className="text-white focus:bg-gray-700 focus:text-white"
              >
                {type}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {loading ? (
        <p className="text-center py-10">Loading courses...</p>
      ) : (
        <Card className="bg-gray-800 border-gray-700">
          <Table>
            <TableHeader>
              <TableRow className="border-b-gray-700 hover:bg-transparent">
                <TableHead className="text-white">Name</TableHead>
                <TableHead className="text-white">Code</TableHead>
                <TableHead className="text-white hidden md:table-cell">Semester</TableHead>
                <TableHead className="text-white hidden md:table-cell">Type</TableHead>
                <TableHead className="text-white hidden md:table-cell">ECTS</TableHead>
                <TableHead className="text-white hidden lg:table-cell">Grade</TableHead>
                <TableHead className="text-white">Status</TableHead>
                <TableHead className="text-white text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course) => (
                  <TableRow
                    key={course.id}
                    className="border-b-gray-700 hover:bg-gray-700/50 transition-colors duration-200"
                  >
                    <TableCell className="font-medium text-white">{course.name}</TableCell>
                    <TableCell className="text-gray-300">{course.code}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge
                        variant="secondary"
                        className={`transition-all duration-200 hover:scale-105 ${getSemesterBadgeClass(course.semester)}`}
                      >
                        {course.semester}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge
                        variant="outline"
                        className="text-gray-300 transition-all duration-200 hover:bg-gray-700"
                      >
                        {course.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-gray-300">
                      {course.ects}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {course.status === 'Passed' ? (
                        <Input
                          type="number"
                          step="0.5"
                          min="0"
                          max="10"
                          defaultValue={course.grade || '5'}
                          onBlur={(e) => updateGrade(course.id, e.target.value)}
                          className="w-20 bg-gray-700 border-gray-600 text-white h-8"
                          placeholder="N/A"
                        />
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeColor(course.status)}>{course.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-white hover:bg-gray-700 hover:text-white transition duration-200"
                          >
                            Actions <ChevronDown className="h-4 w-4 ml-2" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="bg-gray-800 text-white border-gray-700 max-w-full overflow-hidden z-50"
                        >
                          <DropdownMenuItem
                            onClick={() => updateStatus(course.id, 'Passed')}
                            disabled={course.status === 'Passed'}
                            className="hover:bg-gray-700 text-white transition-colors duration-200 focus:bg-gray-700 focus:text-white"
                          >
                            Set as Passed
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => updateStatus(course.id, 'Failed')}
                            disabled={course.status === 'Failed'}
                            className="hover:bg-gray-700 text-white transition-colors duration-200 focus:bg-gray-700 focus:text-white"
                          >
                            Set as Failed
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => updateStatus(course.id, 'Current Semester')}
                            disabled={course.status === 'Current Semester'}
                            className={`hover:bg-gray-700 text-white transition-colors duration-200 focus:bg-gray-700 focus:text-white ${
                              hasSemesterMismatch(course) ? 'opacity-60' : ''
                            }`}
                          >
                            <span className="flex items-center justify-between w-full">
                              Set as Current
                              {hasSemesterMismatch(course) && (
                                <span
                                  className="ml-2 text-xs text-yellow-400"
                                  title="Semester parity mismatch"
                                >
                                  ⚠️
                                </span>
                              )}
                            </span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => updateStatus(course.id, 'Planned')}
                            disabled={course.status === 'Planned'}
                            className="hover:bg-gray-700 text-white transition-colors duration-200 focus:bg-gray-700 focus:text-white"
                          >
                            Set to Plan
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-gray-700" />
                          <DropdownMenuItem
                            onClick={() => updateStatus(course.id, 'Not Taken')}
                            disabled={course.status === 'Not Taken'}
                            className="hover:bg-gray-700 text-white transition-colors duration-200 focus:bg-gray-700 focus:text-white"
                          >
                            Reset Status
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center h-24 text-gray-400">
                    No courses found matching your criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}

export default AllCourses;
