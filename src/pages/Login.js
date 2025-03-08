import { AuthRoute } from '../components/Routes/AuthRoute.js';
import { Login } from '../components/login-register/Login.js';
export default function LoginPage() {
  return (
    <AuthRoute>
      <Login />
    </AuthRoute>
  );
}
