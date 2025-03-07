import ProtectedRoute from '../services/Routes/ProtectedRoute';
import StudentDashboard from '../components/Dashboards/StudentDashboard';

export default function StudentDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['student']}>
      <StudentDashboard />
    </ProtectedRoute>
  );
}
