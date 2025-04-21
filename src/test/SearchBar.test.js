import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import SearchBar from '../components/SearchBar';
import { useRouter } from 'next/router';

// Mock the Next.js router
jest.mock('next/router', () => ({
  useRouter: jest.fn()
}));

describe('Test Scenario 1: User Searches for a Tutor', () => {
  beforeEach(() => {
    // Setup router mock for each test
    useRouter.mockImplementation(() => ({
      push: jest.fn()
    }));
  });

  test('User types subject and clicks search', () => {
    const mockSearch = jest.fn(); // Mock function to simulate search
    const mockRouterPush = jest.fn();
    
    // Setup router mock specifically for this test
    useRouter.mockImplementation(() => ({
      push: mockRouterPush
    }));
    
    render(<SearchBar onSearch={mockSearch} />);

    // Find the input and button elements
    // Note: The SearchBar component doesn't have data-testid="search-input"
    // We need to use a valid query
    const input = screen.getByPlaceholderText('Search by subject, name, language, availability...');
    const button = screen.getByTestId('search-button');

    // Simulate typing "Math" and clicking Search
    fireEvent.change(input, { target: { value: 'Math' } });
    fireEvent.click(button);

    // Assert that the search function was called with the correct argument
    expect(mockSearch).toHaveBeenCalledWith('Math');
    
    // Assert that router.push was called with the correct URL
    expect(mockRouterPush).toHaveBeenCalledWith('/Search?q=Math');
  });

  test('User presses Enter to search', () => {
    const mockSearch = jest.fn();
    const mockRouterPush = jest.fn();
    
    useRouter.mockImplementation(() => ({
      push: mockRouterPush
    }));
    
    render(<SearchBar onSearch={mockSearch} />);

    const input = screen.getByPlaceholderText('Search by subject, name, language, availability...');
    
    // Simulate typing and pressing Enter
    fireEvent.change(input, { target: { value: 'Physics' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    
    expect(mockSearch).toHaveBeenCalledWith('Physics');
    expect(mockRouterPush).toHaveBeenCalledWith('/Search?q=Physics');
  });
});
