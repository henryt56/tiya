import ProtectedRoute from '../services/Routes/ProtectedRoute';
import TutorDashboard from '../components/Dashboards/TutorDashboard';

export default function TutorDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['tutor']}>
      <TutorDashboard />
    </ProtectedRoute>
  );
}
