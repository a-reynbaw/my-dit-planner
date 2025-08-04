import { useEffect, useState } from 'react';
import { Search, ChevronDown, XCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
import { Badge } from '@/components/ui/badge';
import { toGreeklish, toGreek } from 'greek-utils';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const API_URL = '/api/courses';

function FailedCourses() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        // Filter only failed courses
        const failedCourses = data.filter((course) => course.status === 'Failed');
        setCourses(failedCourses);
        setLoading(false);
      })
      .catch(() => {
        toast.error(t('failedCourses.messages.failedToLoad'));
        setLoading(false);
      });
  }, [t]);

  const getStatusText = (status) => {
    switch (status) {
      case 'Current Semester':
        return t('allCourses.statuses.currentSemester');
      case 'Planned':
        return t('allCourses.statuses.planned');
      case 'Passed':
        return t('allCourses.statuses.passed');
      case 'Not Taken':
        return t('allCourses.statuses.notTaken');
      default:
        return status;
    }
  };

  const updateStatus = (id, newStatus) => {
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
        toast.success(
          t('failedCourses.messages.statusUpdated', { status: getStatusText(newStatus) })
        );
        // Remove from failed courses list if status changed
        if (newStatus !== 'Failed') {
          setCourses((prev) => prev.filter((c) => c.id !== id));
        }
      })
      .catch(() => {
        toast.error(t('failedCourses.messages.failedToUpdate'));
        setCourses(originalCourses);
      });
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

    return matchesSearch;
  });

  return (
    <div className="bg-gray-900 min-h-screen text-white p-4 md:p-8">
      <header className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <XCircle className="h-8 w-8 text-red-400" />
            <h1 className="text-4xl font-bold tracking-tight">{t('failedCourses.title')}</h1>
          </div>
          <p className="text-lg text-gray-400">
            {t('failedCourses.subtitle', { count: courses.length })}
          </p>
        </div>
      </header>

      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            type="text"
            placeholder={t('failedCourses.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 h-12 bg-gray-800 border-gray-700 text-white rounded-md focus:border-red-500 transition-all duration-200"
          />
        </div>
      </div>

      {loading ? (
        <p className="text-center py-10">{t('failedCourses.loading')}</p>
      ) : courses.length === 0 ? (
        <Card className="bg-gray-800 border-gray-700 p-8">
          <div className="text-center">
            <XCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-200 mb-2">
              {t('failedCourses.emptyState.title')}
            </h3>
            <p className="text-gray-400 mb-4">{t('failedCourses.emptyState.description')}</p>
            <Button
              onClick={() => navigate('/all-courses')}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {t('failedCourses.emptyState.buttonText')}
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="bg-gray-800 border-gray-700">
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-400" />
              <span className="text-red-400 font-medium">
                {filteredCourses.length === 1
                  ? t('failedCourses.summary.count', { count: filteredCourses.length })
                  : t('failedCourses.summary.countPlural', { count: filteredCourses.length })}
              </span>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="border-b-gray-700">
                <TableHead className="text-white">
                  {t('failedCourses.table.headers.courseName')}
                </TableHead>
                <TableHead className="text-white">
                  {t('failedCourses.table.headers.code')}
                </TableHead>
                <TableHead className="text-white hidden md:table-cell">
                  {t('failedCourses.table.headers.semester')}
                </TableHead>
                <TableHead className="text-white hidden md:table-cell">
                  {t('failedCourses.table.headers.type')}
                </TableHead>
                <TableHead className="text-white hidden md:table-cell">
                  {t('failedCourses.table.headers.ects')}
                </TableHead>
                <TableHead className="text-white text-right">
                  {t('failedCourses.table.headers.actions')}
                </TableHead>
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
                        className="transition-all duration-200 hover:scale-105"
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
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-white hover:bg-gray-700 transition-colors duration-200"
                          >
                            {t('failedCourses.table.changeStatus')}{' '}
                            <ChevronDown className="h-4 w-4 ml-2" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="bg-gray-800 text-white border-gray-700"
                        >
                          <DropdownMenuItem
                            onClick={() => updateStatus(course.id, 'Current Semester')}
                            className="hover:bg-gray-700 text-white transition-colors duration-200 focus:bg-gray-700 focus:text-white"
                          >
                            {t('failedCourses.actions.setAsCurrent')}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => updateStatus(course.id, 'Planned')}
                            className="hover:bg-gray-700 text-white transition-colors duration-200 focus:bg-gray-700 focus:text-white"
                          >
                            {t('failedCourses.actions.planToRetake')}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => updateStatus(course.id, 'Passed')}
                            className="hover:bg-gray-700 text-white transition-colors duration-200 focus:bg-gray-700 focus:text-white"
                          >
                            {t('failedCourses.actions.markAsPassed')}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => updateStatus(course.id, 'Not Taken')}
                            className="hover:bg-gray-700 text-white transition-colors duration-200 focus:bg-gray-700 focus:text-white"
                          >
                            {t('failedCourses.actions.resetStatus')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24 text-gray-400">
                    {t('failedCourses.search.noResults')}
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

export default FailedCourses;
