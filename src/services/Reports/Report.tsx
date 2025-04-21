import {
	collection,
	query,
	where,
	getDocs,
	QuerySnapshot,
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { createReport } from './ReportCreation';
import React, { useEffect, useState } from 'react';

export interface ReportData {
	reportedId: string;
	reporterId: string;
	title: string;
	content: string;
	createdAt: string;
	status: 'pending assignee' | 'in progress' | 'resolved'; // extra/more detailed statuses can be added later
}

export interface ReportMetadata {
	id: string;
	data: ReportData;
}

export interface ReportQueryParams {
	reportedId?: string;
	reporterId?: string;
	title?: string;
	content?: string;
	status?: string;
	id?: string;
}

export function validateReport(
	report: Partial<ReportData>,
	options: { validateAll?: boolean } = { validateAll: false }, // more opts can be added later, e.g., allow empty, strict mode, ...
): void {
	const MIN_TITLE_LENGTH = 5;
	const MAX_TITLE_LENGTH = 100;
	const MIN_CONTENT_LENGTH = 20;
	const MAX_CONTENT_LENGTH = 1000;

	// basic report reqs
	if (!report.reportedId) {
		throw new Error('Reported ID is required.');
	}
	if (report.reportedId && typeof report.reportedId !== 'string') {
		throw new Error('Reported ID must be a string.');
	}

	if (!report.reporterId) {
		throw new Error('Reporter ID is required.');
	}
	if (report.reporterId && typeof report.reporterId !== 'string') {
		throw new Error('Reporter ID must be a string.');
	}

	if (report.title) {
		if (
			report.title.length < MIN_TITLE_LENGTH ||
			report.title.length > MAX_TITLE_LENGTH
		) {
			throw new Error(
				`Report title must be between ${MIN_TITLE_LENGTH} and ${MAX_TITLE_LENGTH} characters.`,
			);
		}
	} else {
		throw new Error('Report title is required.');
	}

	if (report.content) {
		if (
			report.content.length < MIN_CONTENT_LENGTH ||
			report.content.length > MAX_CONTENT_LENGTH
		) {
			throw new Error(
				`Report content must be between ${MIN_CONTENT_LENGTH} and ${MAX_CONTENT_LENGTH} characters.`,
			);
		}
	} else {
		throw new Error('Report content is required.');
	}

	// admin-facing attr checks
	if (options.validateAll && !report.createdAt) {
		throw new Error('Creation timestamp is required.');
	}
	if (report.createdAt && isNaN(Date.parse(report.createdAt))) {
		throw new Error('Creation timestamp must be a valid ISO date string.');
	}

	const validStatuses = ['pending assignee', 'in progress', 'resolved']; // ts interfaces only exist at compile time... no easy way to port these over
	if (options.validateAll && !report.status) {
		throw new Error('Status is required.');
	}
	if (report.status && !validStatuses.includes(report.status)) {
		throw new Error(`Status must be one of: ${validStatuses.join(', ')}.`);
	}
}

/**
 * Fetches all reports that match the specified query filters.
 * If no filters are provided, fetches all user reports.
 * @param filters - An optional partial ReportData object containing the fields (report attributes) to filter by - all reports if no filter supplied.
 * @returns A promise that resolves to an array of reports.
 */
export async function fetchUserReports(
	filters?: ReportQueryParams,
): Promise<ReportMetadata[]> {
	try {
		const reportsRef = collection(db, 'reports');
		let q = query(reportsRef);

		if (filters) {
			// Filter out the id property since it's not a field in the document
			const { id, ...docFilters } = filters;
			
			// Apply filters that exist in ReportData
			Object.entries(docFilters).forEach(([key, value]) => {
				if (value !== undefined) {
					q = query(q, where(key as keyof ReportData, '==', value));
				}
			});
		}

		const querySnapshot: QuerySnapshot = await getDocs(q);

		const reports: ReportMetadata[] = [];
		const reportErrors: { id: string; error: string }[] = []; // allows for bulk invalid report discovery

		querySnapshot.forEach((doc) => {
			const reportData: ReportData = doc.data() as ReportData;

			// check for injected entries
			try {
				validateReport(reportData, { validateAll: true });
				reports.push({ id: doc.id, data: reportData } as ReportMetadata);
			} catch (e) {
				console.error(`Validation failed for report ${doc.id}:`, e);
				reportErrors.push({
					id: doc.id,
					error: `${e instanceof Error ? e.message : String(e)}`,
				});
			}
		});

		if (reportErrors.length > 0) {
			console.warn(
				'Some reports failed validation. Please inspect for potential vulnerabilities:',
				reportErrors,
			);
		}

		return reports;
	} catch (error) {
		console.error('Error fetching user reports:', error);
		throw new Error('Failed to fetch user reports.');
	}
}

const Report = () => {
	const [reports, setReports] = useState<ReportMetadata[]>([]);
	const [reportQuery, setReportQuery] = useState<ReportQueryParams>({ id: '' });
	const [status, setStatus] = useState(''); // use for later modification... all we have atm is CR - now that i think about it we'll have to add `assignee` to metadata too
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const fetchReports = async () => {
		try {
			setLoading(true);
			setError('');
			setReports(await fetchUserReports(reportQuery));
		} catch (error: any) {
			setError(error.message || 'Failed to fetch reports.');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchReports();
	}, [reportQuery]);

	const handleQueryChange = (
		field: keyof ReportQueryParams,
		value: string,
	) => {
		setReportQuery((prev) => ({
			...prev,
			[field]: value || undefined,
		}));
	};

	return (
		<div>
			<h1>Reports</h1>
			<div className="filters">
				<input
					type="text"
					placeholder="Search by Report ID"
					onChange={(e) => handleQueryChange('id', e.target.value)}
				/>
				<input
					type="text"
					placeholder="Search by Reported User ID"
					onChange={(e) => handleQueryChange('reportedId', e.target.value)}
				/>
				<input
					type="text"
					placeholder="Search by Reporting User ID"
					onChange={(e) => handleQueryChange('reporterId', e.target.value)}
				/>
				<select
					onChange={(e) => handleQueryChange('status', e.target.value)}
					defaultValue=""
				>
					<option value="">All Statuses</option>
					<option value="pending assignee">Pending Assignee</option>
					<option value="in progress">In Progress</option>
					<option value="resolved">Resolved</option>
				</select>
				<input
					type="text"
					placeholder="Title"
					onChange={(e) => handleQueryChange('title', e.target.value)}
				/>
			</div>
			{error && <div className="error">{error}</div>}
			{loading ? (
				<div>Loading...</div>
			) : (
				<div className="reports">
					{reports.length > 0 ? (
						reports.map((report) => (
							<div key={report.id} className="report">
								<h3>{report.data.title}</h3>
								<p>Status: {report.data.status}</p>
								<p>Report Created at: {report.data.createdAt}</p>
								<p>Reported User: {report.data.reportedId}</p>
								<p>Reporter: {report.data.reporterId}</p>
								<p>Description: {report.data.content}</p>
							</div>
						))
					) : (
						<div>No reports found.</div>
					)}
				</div>
			)}
		</div>
	);
};

export default Report;

export const ReportService = {
	create: createReport,
	query: fetchUserReports,
	// modify: modifyReport,
	// resolve: resolveReport,
};
