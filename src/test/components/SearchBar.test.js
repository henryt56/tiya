import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import SearchBar from '../../components/SearchBar'; // Corrected import path

describe('Test Scenario 1: User Searches for a Tutor', () => {
  test('User types subject and clicks search', () => {
    const mockSearch = jest.fn(); // Mock function to simulate search
    render(<SearchBar onSearch={mockSearch} />);

    // Find the input and button elements
    const input = screen.getByTestId('search-input');
    const button = screen.getByTestId('search-button');

    // Simulate typing "Math" and clicking Search
    fireEvent.change(input, { target: { value: 'Math' } });
    fireEvent.click(button);

    // Assert that the search function was called with the correct argument
    expect(mockSearch).toHaveBeenCalledWith('Math');
  });
});
