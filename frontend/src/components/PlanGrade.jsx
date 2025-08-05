import { useState, useEffect } from 'react';
import { X, Calculator, TrendingUp, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';

function PlanGrade({ isOpen, onClose }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [gradeData, setGradeData] = useState([]);
  const [targetGrade, setTargetGrade] = useState(6.0);

  useEffect(() => {
    if (isOpen) {
      fetchGradeData();
    }
  }, [isOpen]);

  const fetchGradeData = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API endpoint
      // const response = await fetch('/api/grade-planning');
      // const data = await response.json();
      // setGradeData(data);

      // Placeholder data structure for now
      setGradeData([
        {
          id: 1,
          name: 'Αλγόριθμοι & Πολυπλοκότητα',
          code: 'CS201',
          ects: 6,
          currentGrade: null,
          requiredGrade: 7.2,
          semester: 3,
          status: 'Planned',
        },
        {
          id: 2,
          name: 'Βάσεις Δεδομένων',
          code: 'CS301',
          ects: 5,
          currentGrade: 5.5,
          requiredGrade: 8.1,
          semester: 4,
          status: 'Failed',
        },
      ]);
    } catch (error) {
      console.error('Error fetching grade data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateOverallGPA = () => {
    // TODO: Implement GPA calculation logic
    return 6.8;
  };

  const getTotalECTS = () => {
    return gradeData.reduce((sum, course) => sum + course.ects, 0);
  };

  const getGradeColor = (grade) => {
    if (grade >= 8.5) return 'text-green-400';
    if (grade >= 7.0) return 'text-blue-400';
    if (grade >= 6.0) return 'text-yellow-400';
    if (grade >= 5.0) return 'text-orange-400';
    return 'text-red-400';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Planned':
        return 'bg-blue-100 text-blue-800';
      case 'Failed':
        return 'bg-red-100 text-red-800';
      case 'Current Semester':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Calculator className="h-6 w-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">
              {t('planGrade.title', 'Grade Planning Calculator')}
            </h2>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-gray-700 border-gray-600">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="text-sm text-gray-400">
                      {t('planGrade.summary.targetGPA', 'Target GPA')}
                    </p>
                    <p className="text-2xl font-bold text-blue-400">{targetGrade.toFixed(1)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-700 border-gray-600">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                  <div>
                    <p className="text-sm text-gray-400">
                      {t('planGrade.summary.projectedGPA', 'Projected GPA')}
                    </p>
                    <p className={`text-2xl font-bold ${getGradeColor(calculateOverallGPA())}`}>
                      {calculateOverallGPA().toFixed(1)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-700 border-gray-600">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-purple-400" />
                  <div>
                    <p className="text-sm text-gray-400">
                      {t('planGrade.summary.totalECTS', 'Total ECTS')}
                    </p>
                    <p className="text-2xl font-bold text-purple-400">{getTotalECTS()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Target Grade Input */}
          <Card className="bg-gray-700 border-gray-600 mb-6">
            <CardHeader>
              <CardTitle className="text-white text-lg">
                {t('planGrade.settings.title', 'Grade Planning Settings')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <label className="text-sm text-gray-400 min-w-fit">
                  {t('planGrade.settings.targetGrade', 'Target Overall Grade:')}
                </label>
                <input
                  type="number"
                  min="5.0"
                  max="10.0"
                  step="0.1"
                  value={targetGrade}
                  onChange={(e) => setTargetGrade(parseFloat(e.target.value))}
                  className="bg-gray-600 text-white px-3 py-2 rounded border border-gray-500 w-24"
                />
                <span className="text-gray-400 text-sm">
                  {t('planGrade.settings.gradeRange', '(5.0 - 10.0)')}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Courses Table */}
          <Card className="bg-gray-700 border-gray-600">
            <CardHeader>
              <CardTitle className="text-white text-lg">
                {t('planGrade.coursesList.title', 'Courses & Required Grades')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">
                    {t('planGrade.loading', 'Loading grade calculations...')}
                  </p>
                </div>
              ) : gradeData.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">
                    {t('planGrade.noCourses', 'No courses found for grade planning')}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-600">
                        <th className="text-left py-3 px-2 text-gray-300 font-medium">
                          {t('planGrade.table.course', 'Course')}
                        </th>
                        <th className="text-center py-3 px-2 text-gray-300 font-medium">
                          {t('planGrade.table.ects', 'ECTS')}
                        </th>
                        <th className="text-center py-3 px-2 text-gray-300 font-medium">
                          {t('planGrade.table.currentGrade', 'Current Grade')}
                        </th>
                        <th className="text-center py-3 px-2 text-gray-300 font-medium">
                          {t('planGrade.table.requiredGrade', 'Required Grade')}
                        </th>
                        <th className="text-center py-3 px-2 text-gray-300 font-medium">
                          {t('planGrade.table.status', 'Status')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {gradeData.map((course) => (
                        <tr key={course.id} className="border-b border-gray-600 hover:bg-gray-600">
                          <td className="py-3 px-2">
                            <div>
                              <p className="text-white font-medium">{course.name}</p>
                              <p className="text-gray-400 text-sm">{course.code}</p>
                            </div>
                          </td>
                          <td className="text-center py-3 px-2 text-gray-300">{course.ects}</td>
                          <td className="text-center py-3 px-2">
                            {course.currentGrade ? (
                              <span className={`font-medium ${getGradeColor(course.currentGrade)}`}>
                                {course.currentGrade.toFixed(1)}
                              </span>
                            ) : (
                              <span className="text-gray-500">-</span>
                            )}
                          </td>
                          <td className="text-center py-3 px-2">
                            <span className={`font-bold ${getGradeColor(course.requiredGrade)}`}>
                              {course.requiredGrade.toFixed(1)}
                            </span>
                          </td>
                          <td className="text-center py-3 px-2">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(course.status)}`}
                            >
                              {course.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-700">
          <Button
            onClick={onClose}
            variant="outline"
            className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
          >
            {t('planGrade.actions.close', 'Close')}
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => {
              // TODO: Implement save/export functionality
              console.log('Save grade plan');
            }}
          >
            {t('planGrade.actions.save', 'Save Plan')}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default PlanGrade;
