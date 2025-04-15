import React, { useState, useEffect } from 'react';
import styles from '../styles/Search.module.css';
import { useRouter } from 'next/router';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import SearchBar from '../components/SearchBar/SearchBar';

export default function Search() {
  const router = useRouter();
  const { q } = router.query;

  const [tutorList, setTutorList] = useState([]);
  const [globalSearch, setGlobalSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [selectedAvailability, setSelectedAvailability] = useState('All');
  const [selectedRating, setSelectedRating] = useState('All');
  const [selectedPrice, setSelectedPrice] = useState('All');
  const [sortOption, setSortOption] = useState('None');

  useEffect(() => {
    const fetchTutors = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'tutors'));
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTutorList(data);
      } catch (error) {
        console.error('Error fetching tutors:', error);
      }
    };

    fetchTutors();
  }, []);

  useEffect(() => {
    if (q) {
      setGlobalSearch(q);
    }
  }, [q]);

  const filteredTutors = tutorList.filter((t) => {
    const searchMatch = globalSearch.trim() === '' ||
      t.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
      t.subject.toLowerCase().includes(globalSearch.toLowerCase()) ||
      t.language.toLowerCase().includes(globalSearch.toLowerCase()) ||
      t.availability.toLowerCase().includes(globalSearch.toLowerCase());

    const subjectMatch = selectedSubject === 'All' || t.subject === selectedSubject;
    const languageMatch = selectedLanguage === 'All' || t.language === selectedLanguage;
    const availabilityMatch = selectedAvailability === 'All' || t.availability === selectedAvailability;
    const ratingMatch = selectedRating === 'All' || Math.floor(t.rating) >= parseInt(selectedRating);
    const priceMatch =
      selectedPrice === 'All' ||
      (selectedPrice === '<20' && t.price < 20) ||
      (selectedPrice === '20-40' && t.price >= 20 && t.price <= 40) ||
      (selectedPrice === '>40' && t.price > 40);

    return searchMatch && subjectMatch && languageMatch && availabilityMatch && ratingMatch && priceMatch;
  });

  return (
    <div className={styles.searchPage}>
      <div className={styles.globalSearchWrapper}>
        <SearchBar onSearch={(value) => setGlobalSearch(value)} />
      </div>

      <div className={styles.filterBar}>
        <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className={styles.filterPill}>
          <option value="All">Subject</option>
          <option>Mathematics</option>
          <option>Reading & Writing</option>
          <option>Science</option>
          <option>History</option>
        </select>
        <select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)} className={styles.filterPill}>
          <option value="All">Language</option>
          <option>English</option>
          <option>Spanish</option>
          <option>French</option>
          <option>German</option>
        </select>
        <select value={selectedAvailability} onChange={(e) => setSelectedAvailability(e.target.value)} className={styles.filterPill}>
          <option value="All">Availability</option>
          <option>Weekdays</option>
          <option>Weekends</option>
          <option>Evenings</option>
        </select>
        <select value={selectedRating} onChange={(e) => setSelectedRating(e.target.value)} className={styles.filterPill}>
          <option value="All">Rating</option>
          <option value="5">5+</option>
          <option value="4">4+</option>
          <option value="3">3+</option>
        </select>
        <select value={selectedPrice} onChange={(e) => setSelectedPrice(e.target.value)} className={styles.filterPill}>
          <option value="All">Price</option>
          <option value="<20">Under $20</option>
          <option value="20-40">$20 - $40</option>
          <option value=">40">Over $40</option>
        </select>
      </div>

      <h2 className={styles.resultsHeading}>Search Results</h2>

      <div className={styles.gridContainer}>
        {filteredTutors.length > 0 ? (
          filteredTutors.map((tutor, idx) => (
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
          ))
        ) : (
          <p className={styles.noResults}>No tutors found for your search. Please try again.</p>
        )}
      </div>
    </div>
  );
}
