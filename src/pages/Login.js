import AuthRoute from '../services/Routes/AuthRoute.js';
import Login from '../services/login-register/Login.js';

export default function LoginPage() {
  return (
    <AuthRoute>
      <Login />
    </AuthRoute>
  );
}
