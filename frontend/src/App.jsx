import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  BookOpen,
  Target,
  CheckCircle2,
  XCircle,
  Clock,
  BookCopy,
  CalendarClock,
  ListTree,
  BadgeEuro,
} from 'lucide-react';

import AllCourses from '@/pages/AllCourses';
import PlanCourses from '@/pages/PlanCourses';
import FailedCourses from '@/pages/FailedCourses';
import CurrentCourses from '@/pages/CurrentCourses';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

function StatCard({ title, value, icon: Icon, color, onClick }) {
  return (
    <Card 
      className={`bg-gray-800 border-gray-700 text-white shadow-lg hover:bg-gray-700/50 transition-colors duration-300 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-300">{title}</CardTitle>
        <Icon className={`h-5 w-5 ${color || 'text-gray-400'}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

function Dashboard({ courses, navigate }) {
  const totalECTS = 240;
  const totalCompulsory = 16;
  const passedCourses = courses.filter((c) => c.status === 'Passed');
  const completedECTS = passedCourses.reduce((sum, course) => sum + course.ects, 0);
  const completedCompulsory = passedCourses.filter((c) => c.type === 'ΥΜ').length;
  const completedGE = passedCourses.filter((c) => c.type === 'ΓΠ').length;
  const failedCourses = courses.filter((c) => c.status === 'Failed').length;
  const plannedCourses = courses.filter((c) => c.status === 'Planned').length;
  const currentSemesterCourses = courses.filter((c) => c.status === 'Current Semester');

  const averageGrade =
    passedCourses.filter((c) => c.grade != null).length > 0
      ? (
          passedCourses
            .filter((c) => c.grade != null)
            .reduce((acc, c) => acc + Number(c.grade) * c.ects, 0) / completedECTS
        ).toFixed(2)
      : 'N/A';

  const ectsProgress = (completedECTS / totalECTS) * 100;

  return (
    <div className="bg-gray-900 min-h-screen text-white font-sans">
      <div className="w-full max-w-8xl mx-auto p-4 md:p-8">
        <header className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight">DIT Hub Dashboard</h1>
          <p className="text-lg text-gray-400">Your academic progress at a glance.</p>
        </header>

        <section className="mb-10">
          <Card className="bg-gray-800 border-gray-700 p-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium text-blue-300">ECTS Progress</h3>
              <span className="text-lg font-semibold text-blue-300">
                {completedECTS} / {totalECTS}
              </span>
            </div>
            <Progress value={ectsProgress} className="w-full h-3 bg-gray-700 [&>*]:bg-blue-500" />
          </Card>
        </section>

        <section className="mb-10">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <StatCard
              title="Average Grade"
              value={averageGrade}
              icon={GraduationCap}
              color="text-green-400"
            />
            <StatCard
              title="Courses Passed"
              value={passedCourses.length}
              icon={CheckCircle2}
              color="text-green-400"
            />
            <StatCard
              title="Compulsory Done"
              value={`${completedCompulsory + completedGE} / ${totalCompulsory}`}
              icon={Target}
              color="text-yellow-400"
            />
            <StatCard
              title="Courses Planned"
              value={plannedCourses}
              icon={Clock}
              color="text-sky-400"
            />
            <StatCard
              title="Current Courses"
              value={currentSemesterCourses.length}
              icon={BookOpen}
              color="text-purple-400"
              onClick={() => navigate('/current-courses')}
            />
            <StatCard
              title="Courses Failed"
              value={failedCourses}
              icon={XCircle}
              color="text-red-400"
              onClick={() => navigate('/failed-courses')}
            />
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 w-full mb-10">
          <Card className="bg-gray-800 border-gray-700 text-white">
            <CardHeader>
              <CardTitle>Recently Passed Courses</CardTitle>
            </CardHeader>
            <CardContent>
              {passedCourses.length === 0 ? (
                <p className="text-center py-10 text-gray-400">No courses completed yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700 hover:bg-gray-700/50">
                      <TableHead className="text-white">Course Name</TableHead>
                      <TableHead className="text-white text-right">Grade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {passedCourses.slice(0, 5).map((course) => (
                      <TableRow key={course.id} className="border-gray-700 hover:bg-gray-700/50">
                        <TableCell>{course.name}</TableCell>
                        <TableCell className="text-right">{course.grade ?? 'N/A'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        <section className="w-full">
          <h2 className="text-2xl font-semibold mb-4 text-gray-200">Tools & Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Browse All Courses', path: '/all-courses', icon: BookCopy },
              { title: 'Plan Your Semesters', path: '/plan-courses', icon: ListTree },
              { title: 'View Timetable', path: '/timetable', icon: CalendarClock },
            ].map((item) => (
              <Card
                key={item.title}
                className="bg-gray-800 border-gray-700 hover:border-blue-500 hover:bg-gray-800/80 transition-all duration-300 cursor-pointer group"
                onClick={() => navigate(item.path)}
              >
                <CardHeader className="flex-row items-center gap-4">
                  <item.icon className="h-8 w-8 text-blue-400 transition-transform group-hover:scale-110" />
                  <CardTitle className="text-lg text-gray-200">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    className="w-full border-gray-600 group-hover:bg-blue-600 group-hover:text-white transition-colors"
                  >
                    Go to {item.path.split('-').join(' ')}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function App() {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/courses')
      .then((res) => res.json())
      .then((data) => setCourses(data))
      .catch((error) => console.error('Error fetching courses:', error));
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Dashboard courses={courses} navigate={navigate} />} />
      <Route path="/all-courses" element={<AllCourses />} />
      <Route path="/plan-courses" element={<PlanCourses />} />
      <Route path="/failed-courses" element={<FailedCourses />} />
      <Route path="/current-courses" element={<CurrentCourses />} />
      <Route
        path="/timetable"
        element={
          <div className="flex items-center justify-center h-screen bg-gray-900 text-white text-2xl">
            Timetable page is under construction. Pay us to speed it up!{' '}
            <BadgeEuro className="inline-block ml-2" />
            <Button onClick={() => navigate('/')} className="ml-4">
              Go Back
            </Button>
          </div>
        }
      />
    </Routes>
  );
}

export default App;
