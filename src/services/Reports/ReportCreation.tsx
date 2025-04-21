import React, { useState } from 'react';
import { collection, addDoc, DocumentReference } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useAuth } from '../context/AuthContext';
import { ReportData, validateReport } from './Report';
import { useRouter } from 'next/router';

/**
 * Creates a user report.
 * @param reportedId - ID of user being reported.
 * @param reporterId - ID of user creating the report.
 * @param reportTitle - Between 5 and 100 characters.
 * @param reportContent - Between 20 and 1000 characters.
 * @param options - Only option specified thus far is `returnId` - will return report ID if true
 * @returns A promise that resolves to the document ID of the created report.
 */
export async function createReport(
	currentUser: { uid: string },
	reportedId: string,
	reportTitle: string,
	reportContent: string,
	options?: { returnId?: boolean },
): Promise<string | undefined> {
	try {
		const reporterId = currentUser.uid;
		const reportData: ReportData = {
			reportedId,
			reporterId,
			title: reportTitle,
			content: reportContent,
			createdAt: new Date().toISOString(),
			status: 'pending assignee',
		};

		validateReport(reportData);

		const docRef: DocumentReference = await addDoc(
			collection(db, 'reports'),
			reportData,
		);
		if (options && options.returnId) {
			return docRef.id;
		}
	} catch (error) {
		console.error('Error creating report:', error);
		throw new Error('Failed to create report.');
	}
}

// Users can create reports via another user's profile (profile > "report this user")
const ReportCreator = ({ reportedId, reportedUserName }: { reportedId: string, reportedUserName?: string }) => {
	const router = useRouter();
	const { currentUser, userRole } = useAuth();
	const [reportTitle, setReportTitle] = useState('');
	const [reportContent, setReportContent] = useState('');
	const [error, setError] = useState('');
	const [successMessage, setSuccessMessage] = useState('');
	const [loading, setLoading] = useState(false);
	const [redirecting, setRedirecting] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();

		try {
			setError('');
			setSuccessMessage('');
			setLoading(true);

			if (!currentUser) {
				throw new Error('You must be logged in to create a report.');
			}

			await createReport(currentUser, reportedId, reportTitle, reportContent, {
				returnId: false, // options specified here for ease of scalability
			});

			setSuccessMessage(
				'Report submitted successfully! Our team will be back with you shortly (if this were a real platform with a real team, that is 🙃).',
			);
			setReportTitle('');
			setReportContent('');
			
			// Set a short timeout before redirecting
			setRedirecting(true);
			setTimeout(() => {
				// Redirect to the appropriate dashboard based on user role
				if (userRole === 'tutor') {
					router.push('/TutorDashboard');
				} else if (userRole === 'student'){
					// Default to student dashboard
					router.push('/StudentDashboard');
				}
			}, 1500);
			
		} catch (error: any) {
			setError(error.message || 'Failed to create report.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="report-container">
			<h2 className="h3 mb-4">Create a Report</h2>

			{error && (
				<div className="alert alert-danger mb-4" role="alert">
					{error}
				</div>
			)}
			
			{successMessage && (
				<div className="alert alert-success mb-4" role="alert">
					<p className="mb-1">{successMessage}</p>
					{redirecting && (
						<div className="progress mt-2" style={{ height: '5px' }}>
							<div 
								className="progress-bar progress-bar-striped progress-bar-animated" 
								role="progressbar" 
								style={{ width: '100%' }}
							></div>
						</div>
					)}
				</div>
			)}

			<div className="mb-4 d-flex align-items-center">
				<div className="rounded-circle bg-light d-flex align-items-center justify-content-center me-3" 
					style={{ width: '60px', height: '60px', flexShrink: 0 }}>
					<i className="bi bi-person-fill text-secondary" style={{ fontSize: '1.5rem' }}></i>
				</div>
				<div>
					<h5 className="mb-0">Reporting User:</h5>
					<p className="mb-0 text-primary fw-bold">{reportedUserName || reportedId}</p>
				</div>
			</div>

			<form onSubmit={handleSubmit} className="mt-4">
				<div className="mb-3">
					<label htmlFor="reportTitle" className="form-label fw-bold">Title</label>
					<input
						id="reportTitle"
						type="text"
						className="form-control"
						placeholder="Briefly describe the issue"
						value={reportTitle}
						onChange={(e) => setReportTitle(e.target.value)}
						required
					/>
					<div className="form-text">5-100 characters</div>
				</div>
				
				<div className="mb-4">
					<label htmlFor="reportContent" className="form-label fw-bold">Description</label>
					<textarea
						id="reportContent"
						className="form-control"
						rows={5}
						placeholder="Please provide details about the issue"
						value={reportContent}
						onChange={(e) => setReportContent(e.target.value)}
						required
					></textarea>
					<div className="form-text">20-1000 characters</div>
				</div>

				<div className="d-grid gap-2 d-sm-flex justify-content-sm-end">
					<button 
						type="submit" 
						className="btn btn-primary" 
						disabled={loading}
					>
						{loading ? (
							<>
								<span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
								Submitting...
							</>
						) : 'Submit Report'}
					</button>
				</div>
			</form>
		</div>
	);
};

export default ReportCreator;
