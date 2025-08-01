import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  Target,
  CheckCircle2,
  XCircle,
  Clock,
  BookCopy,
  CalendarClock,
  ListTree,
  ArrowRight,
  AlertTriangle,
  Loader2,
  User,
  Gem,
} from 'lucide-react';
import { Toaster } from 'sonner';

import AllCourses from '@/pages/AllCourses';
import PlanCourses from '@/pages/PlanCourses';
import FailedCourses from '@/pages/FailedCourses';
import CurrentCourses from '@/pages/CurrentCourses';
import DegreeRequirements from '@/pages/DegreeRequirements';
import Timetable from '@/pages/Timetable';
import Maintenance from '@/pages/Maintenance';
import NotFound from '@/pages/NotFound';
import Profile from '@/pages/Profile';
import Subscription from '@/pages/Subscription';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import HomeButton from './components/layout/HomeButton';

// Sidebar component for navigation
function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { title: 'Dashboard', path: '/', icon: LayoutDashboard },
    { title: 'All Courses', path: '/all-courses', icon: BookCopy },
    { title: 'Plan Semesters', path: '/plan-courses', icon: ListTree },
    { title: 'Degree Requirements', path: '/degree-requirements', icon: Target },
    { title: 'Timetable', path: '/timetable', icon: CalendarClock },
    { title: 'Current Courses', path: '/current-courses', icon: BookOpen },
    { title: 'Failed Courses', path: '/failed-courses', icon: XCircle },
    { title: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-gray-800 p-6 hidden lg:flex flex-col justify-between">
      <div>
        <h2 className="text-2xl font-bold text-white mb-10">DIT Hub</h2>
        <nav className="flex flex-col space-y-2">
          {navItems.map((item) => (
            <Button
              key={item.title}
              variant="ghost"
              onClick={() => navigate(item.path)}
              className={`justify-start text-left text-base p-3 h-auto ${
                location.pathname === item.path
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.title}
            </Button>
          ))}
        </nav>
      </div>

      {/* Subscription Link at the bottom */}
      <div>
        <Button
          variant="ghost"
          onClick={() => navigate('/subscription')}
          className="justify-start text-left w-full text-xs p-3 h-auto text-gray-500 hover:bg-gray-700 hover:text-white"
        >
          <Gem className="h-4 w-4 mr-3" />
          Subscription Plans
        </Button>
      </div>
    </aside>
  );
}

// A smaller, more focused StatCard
function SummaryCard({ title, value, icon: Icon, color, onClick, cta, showArrow }) {
  const isClickable = !!onClick;
  return (
    <Card
      className={`relative bg-gray-800 border-gray-700 text-white hover:border-blue-500/80 transition-colors duration-300 group ${
        isClickable ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-300">{title}</CardTitle>
        <Icon className={`h-5 w-5 transition-transform group-hover:scale-110 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {cta && <p className="text-xs text-gray-400 mt-1">{cta}</p>}
      </CardContent>
      {showArrow && (
        <ArrowRight className="absolute bottom-3 right-3 h-5 w-5 text-gray-400 transition-opacity md:opacity-0 md:group-hover:opacity-100" />
      )}
    </Card>
  );
}

// The new Dashboard component
function Dashboard() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]); // Add local state
  const [loading, setLoading] = useState(true); // Add loading state
  const totalECTS = 240;

  // Fetch courses every time Dashboard loads
  useEffect(() => {
    fetch('/api/courses')
      .then((res) => res.json())
      .then((data) => {
        setCourses(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Failed to fetch courses:', error);
        setLoading(false);
      });
  }, []); // This runs every time Dashboard component mounts

  // Show loading state
  if (loading) {
    return (
      <div className="bg-gray-900 min-h-screen text-white font-sans p-4 md:p-8">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
          <span className="ml-3 text-gray-400">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  // Calculations
  const passedCourses = courses.filter((c) => c.status === 'Passed');
  const completedECTS = passedCourses.reduce((sum, course) => sum + course.ects, 0);
  const ectsProgress = (completedECTS / totalECTS) * 100;
  const failedCourses = courses.filter((c) => c.status === 'Failed');
  const plannedCourses = courses.filter((c) => c.status === 'Planned');
  const currentSemesterCourses = courses.filter((c) => c.status === 'Current Semester');

  const averageGrade =
    passedCourses.filter((c) => c.grade != null).length > 0
      ? (
          passedCourses
            .filter((c) => c.grade != null)
            .reduce((acc, c) => acc + Number(c.grade) * c.ects, 0) / (completedECTS || 1)
        ).toFixed(2)
      : 'N/A';

  return (
    <div className="bg-gray-900 min-h-screen text-white font-sans p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-lg text-gray-400">Welcome back! Here's your academic snapshot.</p>
      </header>

      {/* Main Progress and Stats */}
      <section className="mb-8">
        <Card className="bg-gray-800 border-gray-700 p-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium text-blue-300">Overall ECTS Progress</h3>
            <span className="text-lg font-semibold text-blue-300">
              {completedECTS} / {totalECTS}
            </span>
          </div>
          <Progress value={ectsProgress} className="w-full h-3 bg-gray-700 [&>*]:bg-blue-500" />
        </Card>
      </section>

      <section className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard
          title="Average Grade"
          value={averageGrade}
          icon={GraduationCap}
          color="text-green-400"
          cta="Based on passed courses"
        />
        <SummaryCard
          title="Courses Passed"
          value={passedCourses.length}
          icon={CheckCircle2}
          color="text-green-400"
          cta="Total unique courses"
        />
        <SummaryCard
          title="Courses Planned"
          value={plannedCourses.length}
          icon={Clock}
          color="text-yellow-400"
          cta="Ready for future semesters"
          onClick={() => navigate('/plan-courses')}
          showArrow={true}
        />
        <SummaryCard
          title="Degree Requirements"
          value="Check"
          icon={Target}
          color="text-purple-400"
          cta="View your progress"
          onClick={() => navigate('/degree-requirements')}
          showArrow={true}
        />
      </section>

      {/* Two-column layout for current semester and actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Current Semester */}
        <div className="space-y-6">
          <Card className="bg-gray-800 border-gray-700 text-white">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>This Semester's Courses</span>
                <Badge variant="secondary">{currentSemesterCourses.length} enrolled</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentSemesterCourses.length > 0 ? (
                <ul className="space-y-3">
                  {currentSemesterCourses.slice(0, 5).map((course) => (
                    <li
                      key={course.id}
                      className="flex justify-between items-center bg-gray-700/50 p-3 rounded-md"
                    >
                      <div>
                        <p className="font-medium text-gray-200">{course.name}</p>
                        <p className="text-sm text-gray-400">
                          {course.code} • {course.ects} ECTS
                        </p>
                      </div>
                      <Badge variant="secondary">{course.type}</Badge>
                    </li>
                  ))}
                  {currentSemesterCourses.length > 5 && (
                    <p className="text-center text-sm text-gray-400 pt-2">
                      ...and {currentSemesterCourses.length - 5} more.
                    </p>
                  )}
                </ul>
              ) : (
                <p className="text-center py-6 text-gray-400">
                  No courses for the current semester.
                </p>
              )}
              <Button
                onClick={() => navigate('/current-courses')}
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700"
              >
                Manage Current Courses
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Actions & Quick Links */}
        <div className="space-y-6">
          <Card
            className="bg-gray-800 border-gray-700 hover:border-blue-500 hover:bg-gray-800/80 transition-all duration-300 cursor-pointer group"
            onClick={() => navigate('/timetable')}
          >
            <CardHeader className="flex-row items-center gap-4">
              <CalendarClock className="h-10 w-10 text-blue-400 transition-transform group-hover:scale-110" />
              <div>
                <CardTitle className="text-xl text-gray-100">View Timetable</CardTitle>
                <p className="text-gray-400 text-sm">See your weekly course schedule.</p>
              </div>
              <ArrowRight className="ml-auto h-6 w-6 text-gray-500 group-hover:text-white transition-colors" />
            </CardHeader>
          </Card>

          {failedCourses.length > 0 && (
            <Card
              className="bg-red-900/40 border-red-500/50 hover:border-red-500 hover:bg-red-900/60 transition-all duration-300 cursor-pointer group"
              onClick={() => navigate('/failed-courses')}
            >
              <CardHeader className="flex-row items-center gap-4">
                <AlertTriangle className="h-10 w-10 text-red-400 transition-transform group-hover:scale-110" />
                <div>
                  <CardTitle className="text-xl text-red-200">
                    {failedCourses.length} Failed Course{failedCourses.length > 1 ? 's' : ''}
                  </CardTitle>
                  <p className="text-red-300/80 text-sm">Review and plan to retake them.</p>
                </div>
                <ArrowRight className="ml-auto h-6 w-6 text-red-400/80 group-hover:text-red-200 transition-colors" />
              </CardHeader>
            </Card>
          )}

          <Card
            className="bg-gray-800 border-gray-700 hover:border-blue-500 hover:bg-gray-800/80 transition-all duration-300 cursor-pointer group"
            onClick={() => navigate('/all-courses')}
          >
            <CardHeader className="flex-row items-center gap-4">
              <BookCopy className="h-10 w-10 text-blue-400 transition-transform group-hover:scale-110" />
              <div>
                <CardTitle className="text-xl text-gray-100">Explore All Courses</CardTitle>
                <p className="text-gray-400 text-sm">Browse the full university course catalog.</p>
              </div>
              <ArrowRight className="ml-auto h-6 w-6 text-gray-500 group-hover:text-white transition-colors" />
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isBackendDown, setIsBackendDown] = useState(false);
  const location = useLocation();

  const showHomeButton = location.pathname !== '/' && location.pathname !== '*';

  useEffect(() => {
    // Health check first
    fetch('/api/health')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Backend is not responding');
        }
        // Just do health check, Dashboard will fetch its own courses
        setIsBackendDown(false);
      })
      .catch((error) => {
        console.error('Failed to fetch data:', error);
        setIsBackendDown(true);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <Loader2 className="h-12 w-12 animate-spin text-blue-400" />
      </div>
    );
  }

  if (isBackendDown) {
    return <Maintenance />;
  }

  return (
    <div className="flex min-h-screen bg-gray-900">
      <Toaster richColors theme="dark" />
      <Sidebar />
      <main className="flex-1">
        {showHomeButton && <HomeButton />}
        <Routes>
          <Route path="/" element={<Dashboard />} /> {/* Remove courses prop */}
          <Route path="/all-courses" element={<AllCourses />} />
          <Route path="/plan-courses" element={<PlanCourses />} />
          <Route path="/failed-courses" element={<FailedCourses />} />
          <Route path="/current-courses" element={<CurrentCourses />} />
          <Route path="/degree-requirements" element={<DegreeRequirements />} />
          <Route path="/timetable" element={<Timetable />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/subscription" element={<Subscription />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
