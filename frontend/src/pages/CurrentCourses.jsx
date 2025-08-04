import { useEffect, useState } from 'react';
import { Search, ChevronDown, BookOpen } from 'lucide-react';
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

function CurrentCourses() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        // Filter only current semester courses
        const currentCourses = data.filter((course) => course.status === 'Current Semester');
        setCourses(currentCourses);
        setLoading(false);
      })
      .catch(() => {
        toast.error(t('currentCourses.messages.failedToLoad'));
        setLoading(false);
      });
  }, [t]);

  const getStatusText = (status) => {
    switch (status) {
      case 'Passed':
        return t('allCourses.statuses.passed');
      case 'Failed':
        return t('allCourses.statuses.failed');
      case 'Planned':
        return t('allCourses.statuses.planned');
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
          t('currentCourses.messages.statusUpdated', { status: getStatusText(newStatus) })
        );
        // Remove from current courses list if status changed
        if (newStatus !== 'Current Semester') {
          setCourses((prev) => prev.filter((c) => c.id !== id));
        }
      })
      .catch(() => {
        toast.error(t('currentCourses.messages.failedToUpdate'));
        setCourses(originalCourses);
      });
  };

  const updateGrade = (id, newGrade) => {
    const gradeValue = parseFloat(newGrade);
    if (isNaN(gradeValue) || gradeValue < 0 || gradeValue > 10) {
      toast.error(t('currentCourses.messages.invalidGrade'));
      return;
    }

    const originalCourses = [...courses];
    setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, grade: gradeValue } : c)));

    fetch(`${API_URL}/${id}/grade`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ grade: gradeValue }),
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        toast.success(t('currentCourses.messages.gradeUpdated', { grade: gradeValue }));
      })
      .catch(() => {
        toast.error(t('currentCourses.messages.failedToUpdateGrade'));
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

  const totalECTS = courses.reduce((sum, course) => sum + course.ects, 0);

  return (
    <div className="bg-gray-900 min-h-screen text-white p-4 md:p-8">
      <header className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="h-8 w-8 text-purple-400" />
            <h1 className="text-4xl font-bold tracking-tight">{t('currentCourses.title')}</h1>
          </div>
          <p className="text-lg text-gray-400">
            {t('currentCourses.subtitle', { count: courses.length, ects: totalECTS })}
          </p>
        </div>
      </header>

      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            type="text"
            placeholder={t('currentCourses.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 h-12 bg-gray-800 border-gray-700 text-white rounded-md focus:border-purple-500 transition-all duration-200"
          />
        </div>
      </div>

      {loading ? (
        <p className="text-center py-10">{t('currentCourses.loading')}</p>
      ) : courses.length === 0 ? (
        <Card className="bg-gray-800 border-gray-700 p-8">
          <div className="text-center">
            <BookOpen className="h-16 w-16 text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-200 mb-2">
              {t('currentCourses.emptyState.title')}
            </h3>
            <p className="text-gray-400 mb-4">{t('currentCourses.emptyState.description')}</p>
            <Button
              onClick={() => navigate('/all-courses')}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {t('currentCourses.emptyState.buttonText')}
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="bg-gray-800 border-gray-700">
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-purple-400" />
              <span className="text-purple-400 font-medium">
                {filteredCourses.length === 1
                  ? t('currentCourses.summary.count', { count: filteredCourses.length })
                  : t('currentCourses.summary.countPlural', { count: filteredCourses.length })}{' '}
                {t('currentCourses.summary.ects', {
                  ects: filteredCourses.reduce((sum, course) => sum + course.ects, 0),
                })}
              </span>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="border-b-gray-700">
                <TableHead className="text-white">
                  {t('currentCourses.table.headers.courseName')}
                </TableHead>
                <TableHead className="text-white">
                  {t('currentCourses.table.headers.code')}
                </TableHead>
                <TableHead className="text-white hidden md:table-cell">
                  {t('currentCourses.table.headers.semester')}
                </TableHead>
                <TableHead className="text-white hidden md:table-cell">
                  {t('currentCourses.table.headers.type')}
                </TableHead>
                <TableHead className="text-white hidden md:table-cell">
                  {t('currentCourses.table.headers.ects')}
                </TableHead>
                <TableHead className="text-white hidden lg:table-cell">
                  {t('currentCourses.table.headers.grade')}
                </TableHead>
                <TableHead className="text-white text-right">
                  {t('currentCourses.table.headers.actions')}
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
                    <TableCell className="hidden lg:table-cell">
                      <Input
                        type="number"
                        step="0.5"
                        min="0"
                        max="10"
                        defaultValue={course.grade || ''}
                        onBlur={(e) => updateGrade(course.id, e.target.value)}
                        className="w-21 bg-gray-700 border-gray-600 text-white h-8"
                        placeholder={t('currentCourses.table.gradePlaceholder')}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-white hover:bg-gray-700 transition-colors duration-200"
                          >
                            {t('currentCourses.table.changeStatus')}{' '}
                            <ChevronDown className="h-4 w-4 ml-2" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="bg-gray-800 text-white border-gray-700"
                        >
                          <DropdownMenuItem
                            onClick={() => updateStatus(course.id, 'Passed')}
                            className="hover:bg-gray-700 text-white transition-colors duration-200 focus:bg-gray-700 focus:text-white"
                          >
                            {t('currentCourses.actions.markAsPassed')}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => updateStatus(course.id, 'Failed')}
                            className="hover:bg-gray-700 text-white transition-colors duration-200 focus:bg-gray-700 focus:text-white"
                          >
                            {t('currentCourses.actions.markAsFailed')}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => updateStatus(course.id, 'Planned')}
                            className="hover:bg-gray-700 text-white transition-colors duration-200 focus:bg-gray-700 focus:text-white"
                          >
                            {t('currentCourses.actions.moveToPlanned')}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => updateStatus(course.id, 'Not Taken')}
                            className="hover:bg-gray-700 text-white transition-colors duration-200 focus:bg-gray-700 focus:text-white"
                          >
                            {t('currentCourses.actions.resetStatus')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24 text-gray-400">
                    {t('currentCourses.search.noResults')}
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

export default CurrentCourses;
