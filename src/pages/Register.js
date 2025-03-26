import { AuthRoute } from '../services/Routes/AuthRoute';
import { Register } from '../services/login-register/Register';

export default function RegisterPage() {
  return (
    <AuthRoute>
      <Register />
    </AuthRoute>
  );
}
