import React, { useState } from 'react';
import { collection, addDoc, DocumentReference } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useAuth } from '../context/AuthContext';
import { ReportData, validateReport } from './Report';

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
const ReportCreator = ({ reportedId }: { reportedId: string }) => {
	const { currentUser } = useAuth();
	const [reportTitle, setReportTitle] = useState('');
	const [reportContent, setReportContent] = useState('');
	const [error, setError] = useState('');
	const [successMessage, setSuccessMessage] = useState('');
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();

		try {
			setError('');
			setSuccessMessage('');
			setLoading(true);

			if (!currentUser) {
				throw new Error('You must be logged in to create a report.');
			}

			createReport(currentUser, reportedId, reportTitle, reportContent, {
				returnId: false, // options specified here for ease of scalability
			});

			setSuccessMessage(
				'Report submitted successfully! Our team will be back with you shortly (if this were a real platform with a real team, that is 🙃).',
			);
			setReportTitle('');
			setReportContent('');
			// console.log(`Report ID: ${reportId}`); // do we really need to log report id here? this feels like a vulnerability - technically already logged in db
		} catch (error: any) {
			setError(error.message || 'Failed to create report.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="report-container">
			<h2>Create a Report</h2>

			{error && <div className="error-message">{error}</div>}
			{successMessage && (
				<div className="success-message">{successMessage}</div>
			)}

			<form onSubmit={handleSubmit}>
				<div className="form-group">
					{/* tells user who they are reporting */}
					<label htmlFor="reportedId">Reporting User {reportedId}</label>
				</div>
				<div className="form-group">
					<label htmlFor="reportTitle">Title</label>
					<input
						id="reportTitle"
						type="text"
						value={reportTitle}
						onChange={(e) => setReportTitle(e.target.value)}
						required
					/>
				</div>
				<div className="form-group">
					<label htmlFor="reportContent">Description</label>
					<textarea
						id="reportContent"
						value={reportContent}
						onChange={(e) => setReportContent(e.target.value)}
						required
					></textarea>
				</div>

				<button type="submit" disabled={loading}>
					{loading ? 'Submitting...' : 'Submit Report'}
				</button>
			</form>
		</div>
	);
};

export default ReportCreator;
