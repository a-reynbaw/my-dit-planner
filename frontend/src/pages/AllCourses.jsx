import { useEffect, useState } from 'react';
import { Search, ChevronDown, Home } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toGreeklish, toGreek } from 'greek-utils';
import { useNavigate } from 'react-router-dom';

// Backend API endpoint
const API_URL = 'http://localhost:8000/api/courses';

function AllCourses() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch all courses from backend
  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        setCourses(data);
        setLoading(false);
      });
  }, []);

  // Handler to update course status
  const updateStatus = (id, newStatus) => {
    fetch(`${API_URL}/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
      .then((res) => res.json())
      .then(() => {
        setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c)));
      });
  };

  // Enhanced search with Greek/Greeklish support
  const filteredCourses = courses.filter((c) => {
    if (!search.trim()) return true; // Show all courses if search is empty

    const searchLower = search.toLowerCase();
    const courseName = c.name.toLowerCase();
    const courseCode = c.code.toLowerCase();

    // Convert search term and course data for bidirectional matching
    const searchAsGreek = toGreek(searchLower);
    const searchAsGreeklish = toGreeklish(searchLower);
    const courseNameAsGreeklish = toGreeklish(courseName);
    const courseCodeAsGreeklish = toGreeklish(courseCode);

    return (
      courseName.includes(searchLower) ||
      courseCode.includes(searchLower) ||
      courseName.includes(searchAsGreek) ||
      courseCode.includes(searchAsGreek) ||
      courseNameAsGreeklish.includes(searchLower) ||
      courseCodeAsGreeklish.includes(searchLower) ||
      courseNameAsGreeklish.includes(searchAsGreeklish) ||
      courseCodeAsGreeklish.includes(searchAsGreeklish)
    );
  });

  return (
    <div className="p-8 font-sans w-full mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">All Courses</h1>
        <Button variant="outline" size="icon" onClick={() => navigate('/')}>
          <Home className="h-4 w-4" />
        </Button>
      </div>

      {/* Search Bar with Lucide Icon */}
      <div className="mb-6 flex justify-center">
        <div className="relative w-full md:w-1/2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Search by name or code (Greek/Greeklish)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-full"
          />
        </div>
      </div>

      {loading ? (
        <p>Loading courses...</p>
      ) : (
        <div className="rounded-md border">
          <Table className="table-fixed w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>ECTS</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCourses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="truncate">{course.name}</TableCell>
                  <TableCell>{course.code}</TableCell>
                  <TableCell>{course.ects}</TableCell>
                  <TableCell>{course.semester}</TableCell>
                  <TableCell>{course.type}</TableCell>
                  <TableCell>
                    <span className="text-xs md:text-sm">{course.status}</span>
                  </TableCell>
                  <TableCell>
                    {/* Desktop: Two separate buttons */}
                    <div className="hidden md:flex flex-col space-y-2">
                      <Button
                        onClick={() => updateStatus(course.id, 'Current Semester')}
                        variant="default"
                        size="sm"
                        disabled={course.status === 'Current Semester'}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Current
                      </Button>
                      <Button
                        onClick={() => updateStatus(course.id, 'Passed')}
                        variant="default"
                        size="sm"
                        disabled={course.status === 'Passed'}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Passed
                      </Button>
                    </div>

                    {/* Mobile: Dropdown menu */}
                    <div className="md:hidden">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="w-full px-2 text-xs">
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => updateStatus(course.id, 'Current Semester')}
                            disabled={course.status === 'Current Semester'}
                            className="text-blue-600"
                          >
                            Set as Current
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => updateStatus(course.id, 'Passed')}
                            disabled={course.status === 'Passed'}
                            className="text-green-600"
                          >
                            Set as Passed
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredCourses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No courses found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

export default AllCourses;
