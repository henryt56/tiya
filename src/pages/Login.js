import AuthRoute from '../components/Routes/AuthRoute';
import Login from '../components/login-register/Login';

export default function LoginPage() {
  return (
    <AuthRoute>
      <Login />
    </AuthRoute>
  );
}
