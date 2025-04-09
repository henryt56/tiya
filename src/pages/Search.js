import React, { useState } from 'react';
import './Search.css'; // Create this file too!

const tutors = [
  { name: 'Emily Johnson', subject: 'English', location: 'Atlanta, GA', image: 'https://randomuser.me/api/portraits/women/44.jpg' },
  { name: 'Michael Smith', subject: 'Mathematics', location: 'Decatur, GA', image: 'https://randomuser.me/api/portraits/men/32.jpg' },
  { name: 'Ava Williams', subject: 'Science', location: 'Marietta, GA', image: 'https://randomuser.me/api/portraits/women/65.jpg' },
  { name: 'Liam Brown', subject: 'History', location: 'Gwinnett, GA', image: 'https://randomuser.me/api/portraits/men/83.jpg' },
  { name: 'Sophia Davis', subject: 'English', location: 'Sandy Springs, GA', image: 'https://randomuser.me/api/portraits/women/51.jpg' },
  { name: 'Ethan Wilson', subject: 'Mathematics', location: 'Roswell, GA', image: 'https://randomuser.me/api/portraits/men/77.jpg' },
  { name: 'Isabella Moore', subject: 'Science', location: 'Peachtree City, GA', image: 'https://randomuser.me/api/portraits/women/36.jpg' },
  { name: 'James Anderson', subject: 'History', location: 'Athens, GA', image: 'https://randomuser.me/api/portraits/men/12.jpg' },
  { name: 'Olivia Taylor', subject: 'English', location: 'Macon, GA', image: 'https://randomuser.me/api/portraits/women/19.jpg' }
];

export default function Search() {
  const [selectedSubject, setSelectedSubject] = useState('All');

  const filteredTutors = selectedSubject === 'All'
    ? tutors
    : tutors.filter(t => t.subject === selectedSubject);

  return (
    <div className="search-page">
      <header className="search-header">
        <div className="logo">TIYA</div>
        <input
          type="text"
          placeholder="Search for tutors..."
          className="search-input"
        />
        <div className="icons">
          <span>📅</span>
          <span>🔔</span>
          <span>☰</span>
        </div>
      </header>

      <div className="filter-bar">
        <label>Subject: </label>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
        >
          <option>All</option>
          <option>English</option>
          <option>Science</option>
          <option>Mathematics</option>
          <option>History</option>
        </select>
      </div>

      <div className="grid-container">
        {filteredTutors.slice(0, 9).map((tutor, idx) => (
          <div key={idx} className="card">
            <img src={tutor.image} alt={tutor.name} className="card-image" />
            <div className="card-content">
              <h2>{tutor.name}</h2>
              <p>{tutor.subject}</p>
              <p>{tutor.location}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
