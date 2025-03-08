import { ProtectedRoute } from '../components/Routes/ProtectedRoute.js';
import  TutorDashboard from '../components/Dashboards/TutorDashboard';

export default function TutorDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['tutor']}>
      <TutorDashboard />
    </ProtectedRoute>
  );
}
