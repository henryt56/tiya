import { AuthRoute }from '../components/Routes/AuthRoute.js';
import { Register } from '../components/login-register/Register.js';

export default function RegisterPage() {
  return (
    <AuthRoute>
      <Register />
    </AuthRoute>
  );
}
