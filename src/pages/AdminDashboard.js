import ProtectedRoute from '../services/Routes/ProtectedRoute';
import AdminDashboard from '../components/Dashboards/AdminDashboard';
import SessionExpiryNotification from '../components/SessionExpiryNotification';

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['admin', 'it']}>
      <AdminDashboard />
      <SessionExpiryNotification />
    </ProtectedRoute>
  );
}
