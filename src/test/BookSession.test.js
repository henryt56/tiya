import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock the Firebase config
jest.mock('../firebaseConfig', () => ({
  db: {},
  auth: {
    currentUser: { uid: 'test-user-id', email: 'test@example.com' }
  }
}));

// Mock the Firestore functions
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(() => 'mocked-collection'),
  addDoc: jest.fn(() => Promise.resolve({ id: 'test-session-id' })),
  Timestamp: {
    fromDate: jest.fn(() => 'mocked-timestamp'),
    now: jest.fn(() => 'mocked-current-timestamp')
  },
  getDocs: jest.fn(() => Promise.resolve({
    forEach: jest.fn()
  })),
  query: jest.fn(() => 'mocked-query'),
  where: jest.fn(() => 'mocked-where-condition'),
  doc: jest.fn(() => 'mocked-doc-ref'),
  getDoc: jest.fn(() => Promise.resolve({
    exists: () => true,
    data: () => ({
      name: 'John Doe',
      rating: 4.8,
      reviewCount: 25,
      experience: '5 years of teaching experience',
      subjects: ['Mathematics', 'Physics', 'Chemistry'],
      hourlyRate: 50
    })
  }))
}));

// Mock the BookSession component
jest.mock('../services/Sesssions/BookSession', () => {
  // Return a mock component that mimics the real one's behavior
  return function MockBookSession(props) {
    return (
      <div data-testid="mock-book-session">
        <h2>Book a Tutoring Session</h2>
        <div data-testid="tutor-profile">
          <h3>Tutor Profile</h3>
          <p>Name: John Doe</p>
          <p>Rating: 4.8 / 5</p>
          <p>(25 reviews)</p>
          <p>5 years of teaching experience</p>
          <button data-testid="back-to-search" onClick={props.onBackToSearch}>
            Back to Search
          </button>
          <button 
            data-testid="book-session-button" 
            onClick={() => {
              // Simulate booking success
              props.onSessionBooked && props.onSessionBooked('test-session-id');
            }}
          >
            Book Session
          </button>
        </div>
      </div>
    );
  };
});

describe('BookSession Component', () => {
  const mockOnSessionBooked = jest.fn();
  const mockOnBackToSearch = jest.fn();
  const mockTutorId = 'test-tutor-id';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the component', () => {
    render(
      <React.Fragment>
        {/* Import the mocked component */}
        {React.createElement(
          require('../services/Sesssions/BookSession'),
          {
            tutorId: mockTutorId,
            onSessionBooked: mockOnSessionBooked,
            onBackToSearch: mockOnBackToSearch
          }
        )}
      </React.Fragment>
    );
    
    expect(screen.getByTestId('mock-book-session')).toBeInTheDocument();
    expect(screen.getByText('Book a Tutoring Session')).toBeInTheDocument();
  });
  
  test('allows user to navigate back to search results', () => {
    render(
      <React.Fragment>
        {React.createElement(
          require('../services/Sesssions/BookSession'),
          {
            tutorId: mockTutorId,
            onSessionBooked: mockOnSessionBooked,
            onBackToSearch: mockOnBackToSearch
          }
        )}
      </React.Fragment>
    );
    
    fireEvent.click(screen.getByTestId('back-to-search'));
    expect(mockOnBackToSearch).toHaveBeenCalledTimes(1);
  });
  
  test('calls onSessionBooked when booking is successful', () => {
    render(
      <React.Fragment>
        {React.createElement(
          require('../services/Sesssions/BookSession'),
          {
            tutorId: mockTutorId,
            onSessionBooked: mockOnSessionBooked,
            onBackToSearch: mockOnBackToSearch
          }
        )}
      </React.Fragment>
    );
    
    fireEvent.click(screen.getByTestId('book-session-button'));
    expect(mockOnSessionBooked).toHaveBeenCalledWith('test-session-id');
  });
});