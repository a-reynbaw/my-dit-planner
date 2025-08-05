import { useEffect, useState } from 'react';
import {
  Search,
  ChevronDown,
  SlidersHorizontal,
  CheckCircle2,
  XCircle,
  BookOpen,
  ListTodo,
  RotateCcw,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
import { useTranslation } from 'react-i18next';

const API_URL = '/api/courses';

// Custom hook to detect screen size
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    window.addEventListener('resize', listener);
    return () => window.removeEventListener('resize', listener);
  }, [matches, query]);
  return matches;
};

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

const getSemesterBadgeClass = (semester) => {
  if (semester >= 1 && semester <= 2) return 'bg-blue-200 text-blue-800';
  if (semester >= 3 && semester <= 4) return 'bg-yellow-200 text-yellow-800';
  if (semester >= 5 && semester <= 6) return 'bg-orange-200 text-orange-800';
  if (semester >= 7 && semester <= 8) return 'bg-pink-200 text-pink-800';
  return 'bg-gray-500 text-white';
};

// Mobile-friendly card component for a single course
function CourseCard({ course, updateStatus, updateGrade, getStatusText, getStatusBadgeColor, hasSemesterMismatch, t }) {
  return (
    <Card className="bg-gray-800 border border-gray-700 mb-4 overflow-hidden">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-4">
          <div className="pr-4">
            <h3 className="font-bold text-white leading-tight">{course.name}</h3>
            <p className="text-sm text-gray-400 font-mono">{course.code}</p>
          </div>
          <Badge className={`${getStatusBadgeColor(course.status)} flex-shrink-0`}>
            {getStatusText(course.status)}
          </Badge>
        </div>
        
        <div className="space-y-2 text-sm border-t border-gray-700 pt-3">
          <div className="flex justify-between">
            <span className="text-gray-400">{t('allCourses.headers.semester')}</span>
            <span className="font-medium text-white">{course.semester}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">{t('allCourses.headers.ects')}</span>
            <span className="font-medium text-white">{course.ects}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">{t('allCourses.headers.type')}</span>
            <span className="font-medium text-white">{course.type}</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-gray-700/50">
            <span className="text-gray-400 font-medium">{t('allCourses.headers.grade')}</span>
            {course.status === 'Passed' ? (
              <Input
                type="number"
                step="0.5"
                min="0"
                max="10"
                defaultValue={course.grade || ''}
                onBlur={(e) => updateGrade(course.id, e.target.value)}
                className="w-24 h-8 bg-gray-700 border-gray-600 text-white"
                placeholder={t('allCourses.gradePlaceholder')}
              />
            ) : (
              <span className="text-gray-500">{t('allCourses.gradeNA')}</span>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-900/50 p-2 flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="text-white hover:bg-gray-700 w-full">
              {t('allCourses.actions.actions')} <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-gray-800 text-white border-gray-700 w-56 z-50">
            <DropdownMenuItem
              onClick={() => updateStatus(course.id, 'Passed')}
              disabled={course.status === 'Passed'}
              className="flex items-center hover:bg-gray-700"
            >
              <CheckCircle2 className="mr-2 h-4 w-4 text-green-400" />
              <span>{t('allCourses.actions.setAsPassed')}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => updateStatus(course.id, 'Failed')}
              disabled={course.status === 'Failed'}
              className="flex items-center hover:bg-gray-700"
            >
              <XCircle className="mr-2 h-4 w-4 text-red-400" />
              <span>{t('allCourses.actions.setAsFailed')}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => updateStatus(course.id, 'Current Semester')}
              disabled={course.status === 'Current Semester'}
              className={`flex items-center hover:bg-gray-700 ${hasSemesterMismatch(course) ? 'opacity-60' : ''}`}
            >
              <BookOpen className="mr-2 h-4 w-4 text-blue-400" />
              <span className="flex items-center justify-between w-full">
                {t('allCourses.actions.setAsCurrent')}
                {hasSemesterMismatch(course) && <span title="Semester parity mismatch">⚠️</span>}
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => updateStatus(course.id, 'Planned')}
              disabled={course.status === 'Planned'}
              className="flex items-center hover:bg-gray-700"
            >
              <ListTodo className="mr-2 h-4 w-4 text-yellow-400" />
              <span>{t('allCourses.actions.setPlanned')}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-gray-700" />
            <DropdownMenuItem
              onClick={() => updateStatus(course.id, 'Not Taken')}
              disabled={course.status === 'Not Taken'}
              className="flex items-center hover:bg-gray-700"
            >
              <RotateCcw className="mr-2 h-4 w-4 text-gray-400" />
              <span>{t('allCourses.actions.resetStatus')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
}

function AllCourses() {
  const { t } = useTranslation();
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ semester: 'all', type: 'all' });
  const [userCurrentSemester, setUserCurrentSemester] = useState(null);
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 425px)');

  useEffect(() => {
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
        toast.error(t('allCourses.messages.failedToLoad'));
        setLoading(false);
      });
  }, [t]);

  const getStatusText = (status) => {
    switch (status) {
      case 'Passed': return t('allCourses.statuses.passed');
      case 'Current Semester': return t('allCourses.statuses.currentSemester');
      case 'Planned': return t('allCourses.statuses.planned');
      case 'Failed': return t('allCourses.statuses.failed');
      case 'Not Taken': return t('allCourses.statuses.notTaken');
      default: return status;
    }
  };

  const checkSemesterParity = (courseId, newStatus) => {
    if (newStatus !== 'Current Semester') return { valid: true };
    const course = courses.find((c) => c.id === courseId);
    if (!course) return { valid: false, message: 'Course not found.' };

    if (!userCurrentSemester) {
      return {
        valid: false,
        message: t('allCourses.messages.setSemesterFirst'),
        showProfileLink: true,
      };
    }

    const userSemesterIsOdd = userCurrentSemester % 2 === 1;
    const courseSemesterIsOdd = course.semester % 2 === 1;

    if (userSemesterIsOdd !== courseSemesterIsOdd) {
      const courseType = courseSemesterIsOdd ? t('allCourses.semesterTypes.odd') : t('allCourses.semesterTypes.even');
      const userType = userSemesterIsOdd ? t('allCourses.semesterTypes.odd') : t('allCourses.semesterTypes.even');
      return {
        valid: false,
        message: t('allCourses.messages.semesterMismatch', { courseName: course.name, courseSemester: course.semester, courseType, userSemester: userCurrentSemester, userType }),
        showProfileLink: true,
      };
    }
    return { valid: true };
  };

  const updateStatus = (id, newStatus) => {
    const validation = checkSemesterParity(id, newStatus);
    if (!validation.valid) {
      if (validation.showProfileLink) {
        toast.error(validation.message, {
          duration: 8000,
          action: { label: t('allCourses.messages.updateProfile'), onClick: () => navigate('/profile') },
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
          if (newStatus !== 'Passed') {
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
        toast.success(t('allCourses.messages.statusUpdated', { status: getStatusText(newStatus) }));
      })
      .catch(() => {
        toast.error(t('allCourses.messages.failedToUpdate'));
        setCourses(originalCourses);
      });
  };

  const updateGrade = (id, newGrade) => {
    const gradeValue = parseFloat(newGrade);
    if (isNaN(gradeValue) || gradeValue < 0 || gradeValue > 10) {
      toast.error(t('allCourses.messages.invalidGrade'));
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
        toast.success(t('allCourses.messages.gradeUpdated', { grade: gradeValue }));
      })
      .catch(() => {
        toast.error(t('allCourses.messages.failedToUpdateGrade'));
        setCourses(originalCourses);
      });
  };

  const hasSemesterMismatch = (course) => {
    if (!userCurrentSemester) return false;
    const userSemesterIsOdd = userCurrentSemester % 2 === 1;
    const courseSemesterIsOdd = course.semester % 2 === 1;
    return userSemesterIsOdd !== courseSemesterIsOdd;
  };

  const filteredCourses = courses.filter((c) => {
    const searchLower = search.toLowerCase();
    const courseName = c.name.toLowerCase();
    const matchesSearch =
      search.trim() === '' ||
      courseName.includes(searchLower) ||
      c.code.toLowerCase().includes(searchLower) ||
      toGreek(courseName).includes(toGreek(searchLower)) ||
      toGreeklish(courseName).includes(toGreeklish(searchLower));
    const matchesSemester = filters.semester === 'all' || c.semester === filters.semester;
    const matchesType = filters.type === 'all' || c.type === filters.type;
    return matchesSearch && matchesSemester && matchesType;
  });

  const courseTypes = [...new Set(courses.map((c) => c.type))];

  return (
    <div className="bg-gray-900 min-h-screen text-white p-4 md:p-8">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">{t('allCourses.title')}</h1>
          <p className="text-lg text-gray-400">{t('allCourses.subtitle')}</p>
          {userCurrentSemester && (
            <p className="text-sm text-gray-400 mt-1">
              {t('allCourses.currentSemester', { semester: userCurrentSemester, parity: userCurrentSemester % 2 === 1 ? t('allCourses.semesterTypes.odd') : t('allCourses.semesterTypes.even') })}
            </p>
          )}
        </div>
      </header>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            type="text"
            placeholder={t('allCourses.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 h-12 bg-gray-800 border-gray-700 text-white rounded-md focus:border-blue-500 transition-all duration-200"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-12 w-full md:w-auto bg-gray-700 border-gray-600 text-white hover:bg-gray-600 hover:text-white transition-colors duration-200">
              <SlidersHorizontal className="mr-2 h-4 w-4" /> {t('allCourses.filters')}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-gray-800 text-white border-gray-700" align="end">
            <DropdownMenuLabel className="text-white">{t('allCourses.filterBySemester')}</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gray-600" />
            {['all', 1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
              <DropdownMenuCheckboxItem key={sem} checked={filters.semester === sem} onCheckedChange={() => setFilters((f) => ({ ...f, semester: sem }))} className="text-white focus:bg-gray-700 focus:text-white">
                {sem === 'all' ? t('allCourses.allSemesters') : t('allCourses.semester', { number: sem })}
              </DropdownMenuCheckboxItem>
            ))}
            <DropdownMenuLabel className="mt-2 text-white">{t('allCourses.filterByType')}</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gray-600" />
            <DropdownMenuCheckboxItem checked={filters.type === 'all'} onCheckedChange={() => setFilters((f) => ({ ...f, type: 'all' }))} className="text-white focus:bg-gray-700 focus:text-white">
              {t('allCourses.allTypes')}
            </DropdownMenuCheckboxItem>
            {courseTypes.map((type) => (
              <DropdownMenuCheckboxItem key={type} checked={filters.type === type} onCheckedChange={() => setFilters((f) => ({ ...f, type }))} className="text-white focus:bg-gray-700 focus:text-white">
                {type}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {loading ? (
        <p className="text-center py-10">{t('allCourses.loading')}</p>
      ) : isMobile ? (
        <div className="space-y-4">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                updateStatus={updateStatus}
                updateGrade={updateGrade}
                getStatusText={getStatusText}
                getStatusBadgeColor={getStatusBadgeColor}
                hasSemesterMismatch={hasSemesterMismatch}
                t={t}
              />
            ))
          ) : (
            <div className="text-center py-10 text-gray-400">
              {t('allCourses.noCourses')}
            </div>
          )}
        </div>
      ) : (
        <Card className="bg-gray-800 border-gray-700">
          <Table>
            <TableHeader>
              <TableRow className="border-b-gray-700 hover:bg-transparent">
                <TableHead className="text-white">{t('allCourses.headers.name')}</TableHead>
                <TableHead className="text-white">{t('allCourses.headers.code')}</TableHead>
                <TableHead className="text-white hidden md:table-cell">{t('allCourses.headers.semester')}</TableHead>
                <TableHead className="text-white hidden md:table-cell">{t('allCourses.headers.type')}</TableHead>
                <TableHead className="text-white hidden md:table-cell">{t('allCourses.headers.ects')}</TableHead>
                <TableHead className="text-white hidden md:table-cell">{t('allCourses.headers.grade')}</TableHead>
                <TableHead className="text-white">{t('allCourses.headers.status')}</TableHead>
                <TableHead className="text-white text-right">{t('allCourses.headers.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course) => (
                  <TableRow key={course.id} className="border-b-gray-700 hover:bg-gray-700/50">
                    <TableCell className="font-medium text-white">{course.name}</TableCell>
                    <TableCell className="text-gray-300">{course.code}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="secondary" className={`${getSemesterBadgeClass(course.semester)}`}>
                        {course.semester}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="outline" className="text-gray-300">{course.type}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-gray-300">{course.ects}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {course.status === 'Passed' ? (
                        <Input type="number" step="0.5" min="0" max="10" defaultValue={course.grade || ''} onBlur={(e) => updateGrade(course.id, e.target.value)} className="w-20 bg-gray-700 border-gray-600 text-white h-8" placeholder={t('allCourses.gradePlaceholder')} />
                      ) : (
                        <span className="text-gray-500">{t('allCourses.gradeNA')}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeColor(course.status)}>
                        {getStatusText(course.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-white hover:bg-gray-700">
                            {t('allCourses.actions.actions')} <ChevronDown className="h-4 w-4 ml-2" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-gray-800 text-white border-gray-700 w-56 z-50">
                          <DropdownMenuItem onClick={() => updateStatus(course.id, 'Passed')} disabled={course.status === 'Passed'} className="flex items-center hover:bg-gray-700">
                            <CheckCircle2 className="mr-2 h-4 w-4 text-green-400" />
                            <span>{t('allCourses.actions.setAsPassed')}</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateStatus(course.id, 'Failed')} disabled={course.status === 'Failed'} className="flex items-center hover:bg-gray-700">
                            <XCircle className="mr-2 h-4 w-4 text-red-400" />
                            <span>{t('allCourses.actions.setAsFailed')}</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateStatus(course.id, 'Current Semester')} disabled={course.status === 'Current Semester'} className={`flex items-center hover:bg-gray-700 ${hasSemesterMismatch(course) ? 'opacity-60' : ''}`}>
                            <BookOpen className="mr-2 h-4 w-4 text-blue-400" />
                            <span className="flex items-center justify-between w-full">
                              {t('allCourses.actions.setAsCurrent')}
                              {hasSemesterMismatch(course) && <span className="ml-2 text-xs" title="Semester parity mismatch">⚠️</span>}
                            </span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateStatus(course.id, 'Planned')} disabled={course.status === 'Planned'} className="flex items-center hover:bg-gray-700">
                            <ListTodo className="mr-2 h-4 w-4 text-yellow-400" />
                            <span>{t('allCourses.actions.setPlanned')}</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-gray-700" />
                          <DropdownMenuItem onClick={() => updateStatus(course.id, 'Not Taken')} disabled={course.status === 'Not Taken'} className="flex items-center hover:bg-gray-700">
                            <RotateCcw className="mr-2 h-4 w-4 text-gray-400" />
                            <span>{t('allCourses.actions.resetStatus')}</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center h-24 text-gray-400">
                    {t('allCourses.noCourses')}
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