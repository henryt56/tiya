import AuthRoute from '../components/Routes/AuthRoute';
import Register from '../components/login-register/Register';

export default function RegisterPage() {
  return (
    <AuthRoute>
      <Register />
    </AuthRoute>
  );
}
