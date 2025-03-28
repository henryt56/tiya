import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ReportCreation from '../components/Reports/ReportCreation';

// Component for Report Creation does NOT exist yet
// Thus, mockReportCreation is a mock of (what I expect of) ReportCreation
// This is a component called ReportCreation that handles tutors submitting reports about students
const mockReportCreation = ({ onSubmit }) => {
  // "Creates" a component that has onSubmit (callback function)
  return (
    <div>
      <button data-testid="create-report-btn">Create Report</button>
      <div data-testid="report-modal" style={{ display: 'none' }}>
        <h2>Report a Student</h2>
        <select data-testid="student-dropdown">
          <option value="">Select Student</option>
          <option value="student-1">Test Student</option>
        </select>
        <textarea
          data-testid="reason-textbox"
          placeholder="Enter reason for report"
        ></textarea>
        <button data-testid="submit-report-btn" onClick={() => {
          const studentId = document.querySelector("[data-testid='student-dropdown']").value;
          const reason = document.querySelector("[data-testid='reason-textbox']").value;
          
          if (!studentId || !reason) {
            if (!studentId) {
              const errorElement = document.createElement('p');
              errorElement.setAttribute('data-testid', 'student-error');
              errorElement.textContent = 'Please select a student';
              document.querySelector("[data-testid='report-modal']").appendChild(errorElement);
            }
            
            if (!reason) {
              const errorElement = document.createElement('p');
              errorElement.setAttribute('data-testid', 'reason-error');
              errorElement.textContent = 'Please enter a reason';
              document.querySelector("[data-testid='report-modal']").appendChild(errorElement);
            }
            return;
          }
          
          onSubmit({ studentId, reason });
          
          // Show success message
          const successElement = document.createElement('p');
          successElement.setAttribute('data-testid', 'success-message');
          successElement.textContent = 'Report submitted successfully';
          document.body.appendChild(successElement);
          
          // Hide modal
          document.querySelector("[data-testid='report-modal']").style.display = 'none';
        }}>
          Submit Report
        </button>
      </div>
    </div>
  );
};

// Creates a mock of the above component for testing
jest.mock('../components/Reports/ReportCreation', () => {
  return {
    __esModule: true,
    default: jest.fn((props) => mockReportCreation(props)),
  };
});

describe('Tutor Report Creation Feature', () => {
  const mockSubmitReport = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    ReportCreation.mockImplementation((props) => mockReportCreation(props));
  });

  test('A user creates a report', () => {
    render(<ReportCreation onSubmit={mockSubmitReport} />);
    
    // Click Create Report button to show modal
    fireEvent.click(screen.getByTestId('create-report-btn'));
    
    // Make modal visible for testing
    const modal = screen.getByTestId('report-modal');
    modal.style.display = 'block';
    
    // Select "Test Student" from dropdown
    const studentDropdown = screen.getByTestId('student-dropdown');
    fireEvent.change(studentDropdown, { target: { value: 'student-1' } });
    
    // Enter reason in textbox
    const reasonTextbox = screen.getByTestId('reason-textbox');
    fireEvent.change(reasonTextbox, { target: { value: 'This is a test reason' } });
    
    // Submit the report
    fireEvent.click(screen.getByTestId('submit-report-btn'));
    
    // Verify the submit callback was called with correct data
    expect(mockSubmitReport).toHaveBeenCalledTimes(1);
    expect(mockSubmitReport).toHaveBeenCalledWith({
      studentId: 'student-1',
      reason: 'This is a test reason'
    });
    
    // Verify success message appears
    expect(screen.getByTestId('success-message')).toBeInTheDocument();
    
    // Verify modal is hidden
    expect(modal.style.display).toBe('none');
  });
  
  test('Validation prevents submission without required fields', () => {
    render(<ReportCreation onSubmit={mockSubmitReport} />);
    
    // Click Create Report button to show modal
    fireEvent.click(screen.getByTestId('create-report-btn'));
    
    // Make modal visible for testing
    const modal = screen.getByTestId('report-modal');
    modal.style.display = 'block';
    
    // Try to submit without selecting student or entering reason
    fireEvent.click(screen.getByTestId('submit-report-btn'));
    
    // Verify error messages appear
    expect(screen.getByTestId('student-error')).toBeInTheDocument();
    expect(screen.getByTestId('reason-error')).toBeInTheDocument();
    
    // Verify the submit callback was not called
    expect(mockSubmitReport).not.toHaveBeenCalled();
  });
});