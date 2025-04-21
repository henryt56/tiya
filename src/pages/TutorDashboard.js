import ProtectedRoute from '../services/Routes/ProtectedRoute';
import TutorDashboard from '../components/Dashboards/TutorDashboard';
import SessionManagement from '../components/Dashboards/SessionManagement';

export default function TutorDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['tutor']}>
      <TutorDashboard />
    </ProtectedRoute>
  );
}
