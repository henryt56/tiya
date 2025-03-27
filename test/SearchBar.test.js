import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import SearchBar from '../src/components/SearchBar'; 

describe('Test Scenario 1: User Searches for a Tutor', () => {
  test('User types subject and clicks search', () => {
    const mockSearch = jest.fn(); // mock function to simulate search
    render(<SearchBar onSearch={mockSearch} />);

    // find the input and button
    const input = screen.getByTestId('search-input');
    const button = screen.getByTestId('search-button');

    // typing "Math" and click Search
    fireEvent.change(input, { target: { value: 'Math' } });
    fireEvent.click(button);

    // assert that the search function
    expect(mockSearch).toHaveBeenCalledWith('Math');
  });
});
