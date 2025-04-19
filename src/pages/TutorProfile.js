import ProtectedRoute from '../services/Routes/ProtectedRoute';
import TutorProfile from '../components/Profiles/TutorProfile';
import Head from 'next/head';

export default function TutorProfilePage() {
  return (
    <ProtectedRoute allowedRoles={['tutor']}>
      <Head>
        <title>Tutor Profile | TIYA</title>
        {/* Bootstrap CSS (if not already included in _app.js) */}
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css"
          rel="stylesheet"
        />
        {/* Bootstrap Icons */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css"
        />
      </Head>
      <TutorProfile />
    </ProtectedRoute>
  );
}