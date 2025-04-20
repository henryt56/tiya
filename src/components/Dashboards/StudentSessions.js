import { useState, useEffect } from 'react';
import { useAuth } from '../../services/context/AuthContext';
import {
	getUpcomingSessions,
	getPastSessions,
	updateSessionStatus,
	addSessionFeedback,
} from '../../services/database/sessionDatabase.js';
import Link from 'next/link';
import CheckoutButton from '../../components/StripeCheckout/CheckoutButton.js';

const StudentSessions = () => {
	const { currentUser } = useAuth();

	const [upcomingSessions, setUpcomingSessions] = useState([]);
	const [pastSessions, setPastSessions] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [actionLoading, setActionLoading] = useState(false);

	// For feedback submission
	const [selectedSessionId, setSelectedSessionId] = useState(null);
	const [rating, setRating] = useState(5);
	const [feedback, setFeedback] = useState('');

	useEffect(() => {
		if (!currentUser) return;

		loadSessions();
	}, [currentUser]);

	const loadSessions = async () => {
		try {
			setLoading(true);

			// Get upcoming sessions
			const upcoming = await getUpcomingSessions(currentUser.uid, 'student');
			setUpcomingSessions(upcoming);

			// Get past sessions
			const past = await getPastSessions(currentUser.uid, 'student');
			setPastSessions(past);
		} catch (err) {
			console.error('Error loading sessions:', err);
			setError('Failed to load sessions. Please try again later.');
		} finally {
			setLoading(false);
		}
	};

	const isSessionPaid = (session) => {
		return session.paymentStatus && session.paymentStatus !== 'unpaid';
	};

	const handleCancelSession = async (sessionId) => {
		try {
			if (window.confirm('Are you sure you want to cancel this session?')) {
				setActionLoading(true);

				await updateSessionStatus(sessionId, 'canceled');

				// Update UI
				setUpcomingSessions((prev) =>
					prev.filter((session) => session.id !== sessionId),
				);
			}
		} catch (err) {
			console.error('Error canceling session:', err);
			setError('Failed to cancel session.');
		} finally {
			setActionLoading(false);
		}
	};

	const handleOpenFeedbackModal = (sessionId) => {
		setSelectedSessionId(sessionId);
		// Reset form
		setRating(5);
		setFeedback('');
		// Open modal
		const modal = new bootstrap.Modal(document.getElementById('feedbackModal'));
		modal.show();
	};

	const handleSubmitFeedback = async () => {
		if (!selectedSessionId) return;

		try {
			setActionLoading(true);

			await addSessionFeedback(selectedSessionId, rating, feedback);

			// Update UI
			setPastSessions((prev) =>
				prev.map((session) =>
					session.id === selectedSessionId
						? { ...session, rating, feedback }
						: session,
				),
			);

			// Close modal
			const modalEl = document.getElementById('feedbackModal');
			const modal = bootstrap.Modal.getInstance(modalEl);
			modal.hide();

			// Reset form
			setSelectedSessionId(null);
			setRating(5);
			setFeedback('');
		} catch (err) {
			console.error('Error submitting feedback:', err);
			setError('Failed to submit feedback.');
		} finally {
			setActionLoading(false);
		}
	};

	// Format date
	const formatDate = (timestamp) => {
		const date = timestamp.toDate();
		return date.toLocaleDateString('en-US', {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});
	};

	const calcDuration = (startTime, endTime) => {
		const start = new Date(`1970-01-01T${startTime}`); // Using Unix epoch as reference point
		const end = new Date(`1970-01-01T${endTime}`);
		return (end - start) / (1000 * 60);
	};

	// Get status badge
	const getStatusBadge = (status) => {
		switch (status) {
			case 'pending':
				return <span className="badge bg-warning text-dark">Pending</span>;
			case 'confirmed':
				return <span className="badge bg-success">Confirmed</span>;
			case 'completed':
				return <span className="badge bg-info">Completed</span>;
			case 'canceled':
				return <span className="badge bg-danger">Canceled</span>;
			case 'declined':
				return <span className="badge bg-danger">Declined</span>;
			default:
				return <span className="badge bg-secondary">{status}</span>;
		}
	};

	if (loading) {
		return (
			<div className="d-flex justify-content-center py-5">
				<div className="spinner-border text-primary" role="status">
					<span className="visually-hidden">Loading...</span>
				</div>
			</div>
		);
	}

	return (
		<div className="student-sessions">
			{error && (
				<div className="alert alert-danger" role="alert">
					{error}
				</div>
			)}

			{/* Upcoming Sessions */}
			<div className="card shadow-sm mb-4">
				<div className="card-header bg-white d-flex justify-content-between align-items-center">
					<h5 className="mb-0">Upcoming Sessions</h5>
					<span className="badge bg-primary rounded-pill">
						{upcomingSessions.length}
					</span>
				</div>
				<div className="card-body p-0">
					{upcomingSessions.length === 0 ? (
						<div className="text-center py-4">
							<p className="text-muted mb-3">You have no upcoming sessions</p>
							<Link href="/Search" className="btn btn-primary">
								Find a Tutor
							</Link>
						</div>
					) : (
						<div className="list-group list-group-flush">
							{upcomingSessions.map((session) => (
								<div key={session.id} className="list-group-item">
									<div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center">
										<div>
											<div className="d-flex align-items-center gap-2 mb-1">
												<h6 className="mb-0">{session.subject}</h6>
												{getStatusBadge(session.status)}
												{isSessionPaid(session) && (
													<span className="badge bg-success">Paid</span>
												)}
											</div>
											<p className="mb-1 text-muted small">
												{formatDate(session.date)} | {session.startTime} -{' '}
												{session.endTime}
											</p>
											<p className="mb-0 small">
												Tutor: <strong>{session.tutorName}</strong>
											</p>
											<p className="mb-0 small">
												Session Type:{' '}
												<span className="text-capitalize">
													{session.meetingType}
												</span>
											</p>
										</div>
										{/* Changed div structure to accomodate CheckoutButton*/}
										<div className="d-flex flex-column gap-2 mt-2 mt-md-0">
											{session.status === 'confirmed' &&
												session.meetingType === 'online' &&
												session.meetingLink && (
													<a
														href={session.meetingLink}
														className="btn btn-primary btn-sm"
														target="_blank"
														rel="noopener noreferrer"
													>
														Join Meeting
													</a>
												)}

											{(session.status === 'pending' ||
												session.status === 'confirmed') && (
												<button
													className="btn btn-outline-danger btn-sm"
													onClick={() => handleCancelSession(session.id)}
													disabled={actionLoading}
												>
													Cancel
												</button>
											)}

											<Link
												href={`/TutorPublicProfile?id=${session.tutorId}`}
												className="btn btn-outline-secondary btn-sm"
											>
												View Tutor
											</Link>

											{session.status === 'confirmed' &&
												!isSessionPaid(session) && (
													<CheckoutButton
														tutorId={session.tutorId}
														studentId={currentUser.uid}
														dateTime={session.date}
														duration={calcDuration(
															session.startTime,
															session.endTime,
														)}
														sessionId={session.id}
														tutorName={session.tutorName}
													/>
												)}
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>

			{/* Past Sessions */}
			<div className="card shadow-sm">
				<div className="card-header bg-white d-flex justify-content-between align-items-center">
					<h5 className="mb-0">Past Sessions</h5>
					<span className="badge bg-secondary rounded-pill">
						{pastSessions.length}
					</span>
				</div>
				<div className="card-body p-0">
					{pastSessions.length === 0 ? (
						<div className="text-center py-4 text-muted">No past sessions</div>
					) : (
						<div className="list-group list-group-flush">
							{pastSessions.map((session) => (
								<div key={session.id} className="list-group-item">
									<div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center">
										<div>
											<div className="d-flex align-items-center gap-2 mb-1">
												<h6 className="mb-0">{session.subject}</h6>
												{getStatusBadge(session.status)}
											</div>
											<p className="mb-1 text-muted small">
												{formatDate(session.date)} | {session.startTime} -{' '}
												{session.endTime}
											</p>
											<p className="mb-0 small">
												Tutor: <strong>{session.tutorName}</strong>
											</p>

											{session.rating && (
												<div className="mt-1">
													<small className="text-muted">Your rating: </small>
													{[...Array(5)].map((_, i) => (
														<i
															key={i}
															className={`bi bi-star${i < session.rating ? '-fill' : ''} text-warning`}
														></i>
													))}
												</div>
											)}
										</div>
										<div className="d-flex gap-2 mt-2 mt-md-0">
											{session.status === 'completed' && !session.rating && (
												<button
													className="btn btn-outline-primary btn-sm"
													onClick={() => handleOpenFeedbackModal(session.id)}
												>
													Leave Feedback
												</button>
											)}

											<Link
												href={`/TutorPublicProfile?id=${session.tutorId}`}
												className="btn btn-outline-secondary btn-sm"
											>
												View Tutor
											</Link>
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>

			{/* Feedback Modal */}
			<div
				className="modal fade"
				id="feedbackModal"
				tabIndex="-1"
				aria-labelledby="feedbackModalLabel"
				aria-hidden="true"
			>
				<div className="modal-dialog">
					<div className="modal-content">
						<div className="modal-header">
							<h5 className="modal-title" id="feedbackModalLabel">
								Session Feedback
							</h5>
							<button
								type="button"
								className="btn-close"
								data-bs-dismiss="modal"
								aria-label="Close"
							></button>
						</div>
						<div className="modal-body">
							<div className="mb-3">
								<label className="form-label">Rating</label>
								<div className="star-rating d-flex gap-2">
									{[...Array(5)].map((_, i) => (
										<i
											key={i}
											className={`bi bi-star${i < rating ? '-fill' : ''} text-warning fs-3`}
											style={{ cursor: 'pointer' }}
											onClick={() => setRating(i + 1)}
										></i>
									))}
								</div>
							</div>

							<div className="mb-3">
								<label htmlFor="feedbackText" className="form-label">
									Feedback
								</label>
								<textarea
									className="form-control"
									id="feedbackText"
									rows="3"
									value={feedback}
									onChange={(e) => setFeedback(e.target.value)}
									placeholder="Tell us about your experience with this session"
								></textarea>
							</div>
						</div>
						<div className="modal-footer">
							<button
								type="button"
								className="btn btn-secondary"
								data-bs-dismiss="modal"
							>
								Cancel
							</button>
							<button
								type="button"
								className="btn btn-primary"
								onClick={handleSubmitFeedback}
								disabled={actionLoading}
							>
								{actionLoading ? 'Submitting...' : 'Submit Feedback'}
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default StudentSessions;
