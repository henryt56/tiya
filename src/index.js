import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import HomePage from './pages/HomePage';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import SearchPage from './pages/Search';
import StudentDashboardPage from './pages/StudentDashboard';
import TutorDashboardPage from './pages/TutorDashboard';
import AdminDashboardPage from './pages/AdminDashboard';
import TutorProfilePage from './pages/TutorProfile';
import PaymentPage from './pages/Payments';
import TransactionHistoryPage from './pages/TransactionHistory';
import NotFoundPage from './pages/NotFoundPage';

const router = createBrowserRouter([
    {
        path: '/',
        element: <HomePage />,
        errorElement: <NotFoundPage />
    },
    {
        path: '/tutorprofile',
        element: <TutorProfilePage />,
        errorElement: <NotFoundPage />
    },
    {
        path: '/admindashboard',
        element: <AdminDashboardPage />,
        errorElement: <NotFoundPage />
    },
    {
        path: '/register',
        element: <RegisterPage />,
        errorElement: <NotFoundPage />
    },
    {
        path: '/login',
        element: <LoginPage />,
        errorElement: <NotFoundPage />
    },
    {
        path: '/payment',
        element: <PaymentPage />,
        errorElement: <NotFoundPage />
    },
    {
        path: '/search',
        element: <SearchPage />,
        errorElement: <NotFoundPage />,
    },
    {
        path: '/tutordashboard',
        element: <TutorDashboardPage />,
        errorElement: <NotFoundPage />
    },
    {
        path: '/studentdashboard',
        element: <StudentDashboardPage />,
        errorElement: <NotFoundPage />
    },
    {
        path: '/transactionhistory',
        element: <TransactionHistoryPage />,
        errorElement: <NotFoundPage />
    }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
)