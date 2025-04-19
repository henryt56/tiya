import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ReportResolution from '../services/Reports/ReportResolution';

// Component for Reports & Report Resolution does NOT exist yet
// Thus, mockReportResolution is a mock of (what I expect of) ReportResolution
// As I haven't thought too much of what the Reports UI looks like, this will be very minimal, not reflective of production
// This is a component called ReportResolution (production will probably have Report Dashboard & Resolution Button (component) seperately)
const mockReportResolution = ({ reports, onResolve }) => {
	// "Creates" a component that has two props--reports (array of reports) and onResolve (callback function)
	return (
		<div>
			<h2>Report Resolution Dashboard</h2>
			<ul data-testid="reports-list">
				{reports.map((report) => (
					<li key={report.id} data-testid={`report-${report.id}`}>
						{report.title}
						<button
							data-testid={`resolve-btn-${report.id}`}
							onClick={() => onResolve(report.id)}
						>
							Resolve
						</button>
					</li>
				))}
			</ul>
		</div>
	);
};

// Creates a mock of the above component for testing
jest.mock('../services/Reports/ReportResolution', () => {
	return {
		__esModule: true,
		default: jest.fn((props) => mockReportResolution(props)),
	};
});

describe('IT/Admin Report Resolution Feature', () => {
	const mockReports = [
		{
			id: '1',
			title: "Can't book session w/ tutor",
			status: 'pending',
		},
		{
			id: '2',
			title: "Tutor here -- can't message my student",
			status: 'pending',
		},
	];

	const mockResolveReport = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
		ReportResolution.mockImplementation((props) => mockReportResolution(props));
	});

	test('displays a list of pending reports', () => {
		render(
			<ReportResolution reports={mockReports} onResolve={mockResolveReport} />,
		);

		expect(screen.getByTestId('reports-list')).toBeInTheDocument();
		expect(screen.getByTestId('report-1')).toBeInTheDocument();
		expect(screen.getByTestId('report-2')).toBeInTheDocument();
	});

	test('calls onResolve when resolve button clicked', () => {
		render(
			<ReportResolution reports={mockReports} onResolve={mockResolveReport} />,
		);

		fireEvent.click(screen.getByTestId('resolve-btn-1'));

		expect(mockResolveReport).toHaveBeenCalledTimes(1);
		expect(mockResolveReport).toHaveBeenCalledWith('1');
	});

	test('removes resolved report from list', () => {
		// Could also just update state of Report
		const updatedReports = [mockReports[1]]; // Creates new array, updatedReports, that only includes 'report 2' as 'report 1' is now resolved and removed

		const { rerender } = render(
			<ReportResolution reports={mockReports} onResolve={mockResolveReport} />,
		);

		// Re-renders the UPDATED list of reports

		rerender(
			<ReportResolution
				reports={updatedReports}
				onResolve={mockResolveReport}
			/>,
		);

		expect(screen.queryByTestId('report-1')).not.toBeInTheDocument();
		expect(screen.getByTestId('report-2')).toBeInTheDocument();
	});
});
