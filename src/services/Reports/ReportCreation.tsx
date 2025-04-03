import React, { useState } from 'react';
import { collection, addDoc, DocumentReference } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useAuth } from '../context/AuthContext';
import { ReportData } from './Report';

export function validateReport(title: string, content: string): void {
	const MIN_TITLE_LENGTH = 5;
	const MAX_TITLE_LENGTH = 100;
	const MIN_CONTENT_LENGTH = 20;
	const MAX_CONTENT_LENGTH = 1000;

	if (title.length < MIN_TITLE_LENGTH || title.length > MAX_TITLE_LENGTH) {
		throw new Error(
			`Report title must be between ${MIN_TITLE_LENGTH} and ${MAX_TITLE_LENGTH} characters.`,
		);
	}
	if (
		content.length < MIN_CONTENT_LENGTH ||
		content.length > MAX_CONTENT_LENGTH
	) {
		throw new Error(
			`Report content must be between ${MIN_CONTENT_LENGTH} and ${MAX_CONTENT_LENGTH} characters.`,
		);
	}
}

/**
 * Creates user report.
 * @param reportedId - ID of user being reported.
 * @param reporterId - ID of user creating the report.
 * @param reportTitle - Between 5 and 100 characters.
 * @param reportContent - Between 20 and 1000 characters.
 * @returns A promise that resolves to the document ID of the created report.
 */
export async function createReport(
	currentUser: { uid: string },
	reportedId: string,
	reportTitle: string,
	reportContent: string,
): Promise<string> {
	try {
		validateReport(reportTitle, reportContent);

		const reporterId = currentUser.uid;
		const reportData: ReportData = {
			reportedId,
			reporterId,
			title: reportTitle,
			content: reportContent,
			createdAt: new Date().toISOString(),
		};

		const docRef: DocumentReference = await addDoc(
			collection(db, 'reports'),
			reportData,
		);
		return docRef.id;
	} catch (error) {
		console.error('Error creating report:', error);
		throw new Error('Failed to create report.');
	}
}

const ReportCreator = () => {
	const { currentUser } = useAuth();
	const [reportedId, setReportedId] = useState('');
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

			const reportId = createReport(
				currentUser,
				reportedId,
				reportTitle,
				reportContent,
			);

			setSuccessMessage(
				'Report submitted successfully! Our team will be back with you shortly (if this were a real platform with a real team, that is 🙃).',
			);
			setReportedId('');
			setReportTitle('');
			setReportContent('');
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
					<label htmlFor="reportedId">User to Report (ID)</label>
					<input
						id="reportedId"
						type="text"
						value={reportedId}
						onChange={(e) => setReportedId(e.target.value)}
						required
					/>
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
