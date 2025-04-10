import React, { useState } from 'react';
import styles from '../styles/Search.module.css';

const tutors = [
  { name: 'Emily Johnson', subject: 'Reading & Writing', certifications: 'TESOL Certified', language: 'English', availability: 'Weekdays', rating: 4.5, price: 35, location: 'Atlanta, GA', image: 'https://randomuser.me/api/portraits/women/44.jpg' },
  { name: 'Michael Smith', subject: 'Mathematics', certifications: 'Math Masters', language: 'English', availability: 'Weekends', rating: 4.2, price: 25, location: 'Decatur, GA', image: 'https://randomuser.me/api/portraits/men/32.jpg' },
  { name: 'Ava Williams', subject: 'Science', certifications: 'STEM Scholar', language: 'Spanish', availability: 'Evenings', rating: 4.7, price: 40, location: 'Marietta, GA', image: 'https://randomuser.me/api/portraits/women/65.jpg' },
  { name: 'Liam Brown', subject: 'History', certifications: 'Social Studies Credential', language: 'English', availability: 'Weekdays', rating: 4.0, price: 20, location: 'Gwinnett, GA', image: 'https://randomuser.me/api/portraits/men/83.jpg' },
  { name: 'Sophia Davis', subject: 'Reading & Writing', certifications: 'Reading Specialist', language: 'French', availability: 'Weekends', rating: 4.8, price: 45, location: 'Sandy Springs, GA', image: 'https://randomuser.me/api/portraits/women/51.jpg' },
  { name: 'Ethan Wilson', subject: 'Mathematics', certifications: 'SAT Math Pro', language: 'English', availability: 'Evenings', rating: 4.3, price: 30, location: 'Roswell, GA', image: 'https://randomuser.me/api/portraits/men/77.jpg' },
  { name: 'Isabella Moore', subject: 'Science', certifications: 'Biology Olympiad Finalist', language: 'Spanish', availability: 'Weekdays', rating: 4.6, price: 38, location: 'Peachtree City, GA', image: 'https://randomuser.me/api/portraits/women/36.jpg' },
  { name: 'James Anderson', subject: 'History', certifications: 'US History Certified', language: 'German', availability: 'Weekends', rating: 3.9, price: 18, location: 'Athens, GA', image: 'https://randomuser.me/api/portraits/men/12.jpg' },
  { name: 'Olivia Taylor', subject: 'Reading & Writing', certifications: 'Grammar Guru', language: 'English', availability: 'Evenings', rating: 4.4, price: 27, location: 'Macon, GA', image: 'https://randomuser.me/api/portraits/women/19.jpg' }
];

export default function Search() {
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [selectedAvailability, setSelectedAvailability] = useState('All');
  const [selectedRating, setSelectedRating] = useState('All');
  const [selectedPrice, setSelectedPrice] = useState('All');
  const [sortOption, setSortOption] = useState('None');

  let filteredTutors = tutors.filter(t => {
    return (selectedSubject === 'All' || t.subject === selectedSubject) &&
           (selectedLanguage === 'All' || t.language === selectedLanguage) &&
           (selectedAvailability === 'All' || t.availability === selectedAvailability) &&
           (selectedRating === 'All' || Math.floor(t.rating) >= Number(selectedRating)) &&
           (selectedPrice === 'All' ||
             (selectedPrice === '<20' && t.price < 20) ||
             (selectedPrice === '20-40' && t.price >= 20 && t.price <= 40) ||
             (selectedPrice === '>40' && t.price > 40));
  });

  if (sortOption === 'price-low') {
    filteredTutors.sort((a, b) => a.price - b.price);
  } else if (sortOption === 'price-high') {
    filteredTutors.sort((a, b) => b.price - a.price);
  } else if (sortOption === 'rating') {
    filteredTutors.sort((a, b) => b.rating - a.rating);
  } else if (sortOption === 'name') {
    filteredTutors.sort((a, b) => a.name.localeCompare(b.name));
  }

  return (
    <div className={styles.searchPage}>
      <div className={styles.filterBar}>
        <label>Subject:</label>
        <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
          <option>All</option>
          <option>Reading & Writing</option>
          <option>Science</option>
          <option>Mathematics</option>
          <option>History</option>
        </select>

        <label>Language:</label>
        <select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)}>
          <option>All</option>
          <option>English</option>
          <option>Spanish</option>
          <option>French</option>
          <option>German</option>
        </select>

        <label>Availability:</label>
        <select value={selectedAvailability} onChange={(e) => setSelectedAvailability(e.target.value)}>
          <option>All</option>
          <option>Weekdays</option>
          <option>Weekends</option>
          <option>Evenings</option>
        </select>

        <label>Rating:</label>
        <select value={selectedRating} onChange={(e) => setSelectedRating(e.target.value)}>
          <option>All</option>
          <option value="5">5+</option>
          <option value="4">4+</option>
          <option value="3">3+</option>
        </select>

        <label>Price:</label>
        <select value={selectedPrice} onChange={(e) => setSelectedPrice(e.target.value)}>
          <option>All</option>
          <option value="<20">Under $20</option>
          <option value="20-40">$20 - $40</option>
          <option value=">40">Over $40</option>
        </select>

        <label>Sort By:</label>
        <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
          <option value="None">None</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="rating">Rating</option>
          <option value="name">Name (A-Z)</option>
        </select>
      </div>

      <div className={styles.gridContainer}>
        {filteredTutors.slice(0, 9).map((tutor, idx) => (
          <section key={idx} className={styles.cardSmallBox}>
            <img src={tutor.image} alt={tutor.name} className={styles.cardImageSmall} />
            <div className={styles.cardContentSmall}>
              <h2>{tutor.name}</h2>
              <p className={styles.detail}>{tutor.subject}</p>
              <p className={styles.detail}>{tutor.language}</p>
              <p className={styles.detail}>{tutor.certifications}</p>
              <p className={styles.detail}>⭐ {tutor.rating} — {tutor.availability}</p>
              <p className={styles.detail}>💵 ${tutor.price}</p>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
