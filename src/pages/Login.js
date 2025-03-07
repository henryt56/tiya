import AuthRoute from '../services/Routes/AuthRoute';
import Login from '../services/login-register/Login';

export default function LoginPage() {
  return (
    <AuthRoute>
      <Login />
    </AuthRoute>
  );
}
