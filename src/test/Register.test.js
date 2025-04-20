import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc } from 'firebase/firestore';
import { useRouter } from 'next/router';
import Register from '../services/login-register/Register';

jest.mock('firebase/auth', () => ({
	createUserWithEmailAndPassword: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
	setDoc: jest.fn(() => Promise.resolve()),
	doc: jest.fn(() => ({ id: 'mockDocId' })),
}));

jest.mock('../firebaseConfig', () => ({
	auth: { mockAuthInstance: true },
	db: { mockDbInstance: true },
}));

jest.mock('next/router', () => ({
	useRouter: jest.fn(),
}));

describe('Register Component', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		useRouter.mockReturnValue({ push: mockPush });
	});

	//====================
	//    Unit tests
	//====================
	test('should render the registration form', () => {
		render(<Register />);
		expect(screen.getByText('Create Your Tiya Account')).toBeInTheDocument();
		expect(screen.getByLabelText('First Name')).toBeInTheDocument();
		expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
		expect(screen.getByLabelText('Email')).toBeInTheDocument();
		expect(screen.getByLabelText('Password')).toBeInTheDocument();
		expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
		expect(screen.getByText('Student')).toBeInTheDocument();
		expect(screen.getByText('Tutor')).toBeInTheDocument();
	});

	//====================
	//  Component tests
	//====================
	// - Ensure user is created, saved, and redirected to dashboard based on role
	const testCases = [
		{
			role: 'student',
			firstName: 'John',
			lastName: 'Doe',
			email: 'student@example.com',
			password: 'password123',
			expectedDashboard: '/StudentDashboard',
		},
		{
			role: 'tutor',
			firstName: 'Jane',
			lastName: 'Smith',
			email: 'tutor@example.com',
			password: 'password456',
			expectedDashboard: '/TutorProfile',
		},
	];

	// mock router push
	const mockPush = jest.fn();

	test.each(testCases)(
		'should register a user with role $role and redirect to $expectedDashboard',
		async ({
			role,
			firstName,
			lastName,
			email,
			password,
			expectedDashboard,
		}) => {
			const mockUid = role === 'student' ? 'stu123' : 'tut456';

			// Each test case creates only one user
			createUserWithEmailAndPassword.mockResolvedValueOnce({
				user: { email, uid: mockUid },
			});
			setDoc.mockResolvedValueOnce();

			render(<Register />);

			// Fill form fields & submit
			fireEvent.change(screen.getByLabelText('First Name'), {
				target: { value: firstName },
			});
			fireEvent.change(screen.getByLabelText('Last Name'), {
				target: { value: lastName },
			});
			fireEvent.change(screen.getByLabelText('Email'), {
				target: { value: email },
			});
			fireEvent.change(screen.getByLabelText('Password'), {
				target: { value: password },
			});
			fireEvent.change(screen.getByLabelText('Confirm Password'), {
				target: { value: password },
			});
			fireEvent.click(
				screen.getByText(role.charAt(0).toUpperCase() + role.slice(1)),
			);
			fireEvent.click(screen.getByText('Create Account'));

			// Create user
			expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
				expect.anything(), // auth instance
				email,
				password,
			);

			// Save user data
			await waitFor(() => {
				expect(setDoc).toHaveBeenCalledWith(
					expect.anything(), // doc ref
					expect.objectContaining({
						uid: mockUid,
						email,
						firstName,
						lastName,
						displayName: `${firstName} ${lastName}`,
						role,
						createdAt: expect.any(String),
					}),
				);
			});

			// Redirect to appropriate dash
			await waitFor(() => {
				expect(mockPush).toHaveBeenCalledWith(expectedDashboard);
			});
		},
	);
});
