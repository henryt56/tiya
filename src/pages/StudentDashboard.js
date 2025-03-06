import ProtectedRoute from '../components/Routes/ProtectedRoute';
import StudentDashboard from '../components/Dashboards/StudentDashboard';

export default function StudentDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['student']}>
      <StudentDashboard />
    </ProtectedRoute>
  );
}