import ProtectedRoute from '../services/Routes/ProtectedRoute.js';
import StudentDashboard from '../components/Dashboards/StudentDashboard';
import StudentSessions from '../components/Dashboards/StudentSessions.js';

export default function StudentDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['student']}>
      <StudentDashboard />
      <StudentSessions/>
    </ProtectedRoute>
  );
}
