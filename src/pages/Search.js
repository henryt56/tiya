import React, { useState, useEffect } from 'react';
import styles from '../styles/Search.module.css';
import { useRouter } from 'next/router';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import SearchBar from '../components/SearchBar';
import Link from 'next/link';

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
  const [sortOption, setSortOption] = useState('distance');

  const [zip, setZip] = useState('');
  const [radius, setRadius] = useState(10);
  const [zipCoords, setZipCoords] = useState(null);

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
    if (q) setGlobalSearch(q);
  }, [q]);

  useEffect(() => {
    if (!zip) return;

    const fetchCoords = async () => {
      try {
        const res = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${zip}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
        );
        const data = await res.json();
        const loc = data.results[0]?.geometry.location;
        if (loc) {
          console.log('✅ ZIP coords updated:', loc);
          setZipCoords({ lat: loc.lat, lng: loc.lng });
        } else {
          console.warn('⚠️ No location found for ZIP');
          setZipCoords(null);
        }
      } catch (err) {
        console.error('❌ ZIP lookup failed:', err);
      }
    };

    fetchCoords();
  }, [zip]);

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const toRad = deg => deg * (Math.PI / 180);
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const relevanceScore = (tutor, query) => {
    const fields = [tutor.name, tutor.subject, tutor.language, tutor.availability, tutor.location];
    return fields.reduce((score, field) =>
      score + (field?.toLowerCase().includes(query.toLowerCase()) ? 1 : 0), 0
    );
  };

  const filteredTutors = tutorList.filter((t) => {
    const q = globalSearch.toLowerCase();
    const matchesSearch =
      !q ||
      t.name.toLowerCase().includes(q) ||
      t.subject.toLowerCase().includes(q) ||
      t.language.toLowerCase().includes(q) ||
      t.availability.toLowerCase().includes(q) ||
      (t.location?.toLowerCase() || '').includes(q) ||
      t.price?.toString().includes(q) ||
      t.rating?.toString().includes(q);

    const matchesZipRadius = zipCoords && t.coordinates
      ? calculateDistance(zipCoords.lat, zipCoords.lng, t.coordinates.lat, t.coordinates.lng) <= radius
      : true;

    return (
      matchesSearch &&
      (selectedSubject === 'All' || t.subject === selectedSubject) &&
      (selectedLanguage === 'All' || t.language === selectedLanguage) &&
      (selectedAvailability === 'All' || t.availability === selectedAvailability) &&
      (selectedRating === 'All' || Math.floor(t.rating) >= parseInt(selectedRating)) &&
      (selectedPrice === 'All' ||
        (selectedPrice === '<20' && t.price < 20) ||
        (selectedPrice === '20-40' && t.price >= 20 && t.price <= 40) ||
        (selectedPrice === '>40' && t.price > 40)) &&
      matchesZipRadius
    );
  });

  console.log('Filtered tutors count:', filteredTutors.length);

  const uniqueTutors = Array.from(
    new Map(filteredTutors.map(t => [`${t.name}-${t.subject}`, t])).values()
  );

  const sortedTutors = [...uniqueTutors].sort((a, b) => {
    if (sortOption === 'lowToHigh') return a.price - b.price;
    if (sortOption === 'highToLow') return b.price - a.price;
    if (sortOption === 'relevance') return relevanceScore(b, globalSearch) - relevanceScore(a, globalSearch);
    if (sortOption === 'distance' && zipCoords && a.coordinates && b.coordinates) {
      const distA = calculateDistance(zipCoords.lat, zipCoords.lng, a.coordinates.lat, a.coordinates.lng);
      const distB = calculateDistance(zipCoords.lat, zipCoords.lng, b.coordinates.lat, b.coordinates.lng);
      return distA - distB;
    }
    return 0;
  });

  const getDistanceLabel = (tutor) => {
    if (!zipCoords || !tutor.coordinates) return '';
    const dist = calculateDistance(zipCoords.lat, zipCoords.lng, tutor.coordinates.lat, tutor.coordinates.lng);
    return ` (${dist.toFixed(1)} mi away)`;
  };

  return (
    <div className={styles.searchPage}>
      <div className={styles.globalSearchWrapper}>
        <div className={styles.searchSplitRow}>
          <div className={styles.searchColumn}>
            <SearchBar onSearch={(val) => setGlobalSearch(val)} />
          </div>
          <div className={styles.zipColumn}>
            <input
              type="text"
              className={styles.zipInputStyled}
              placeholder="ZIP"
              value={zip}
              onChange={(e) => setZip(e.target.value)}
            />
            <select
              className={styles.radiusSelect}
              value={radius}
              onChange={(e) => setRadius(parseInt(e.target.value))}
            >
              <option value={5}>5 mi</option>
              <option value={10}>10 mi</option>
              <option value={15}>15 mi</option>
              <option value={25}>25 mi</option>
            </select>
          </div>
        </div>
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
        <select value={sortOption} onChange={(e) => setSortOption(e.target.value)} className={styles.filterPill}>
          <option value="distance">Distance</option>
          <option value="relevance">Relevance</option>
          <option value="lowToHigh">Price: Low to High</option>
          <option value="highToLow">Price: High to Low</option>
        </select>
      </div>

      <h2 className={styles.resultsHeading}>Search Results</h2>
      <div className={styles.gridContainer}>
        {sortedTutors.length > 0 ? (
          sortedTutors.map((tutor, index) => (
            <section
              key={tutor.id || `${tutor.name}-${index}`}
              className={styles.cardSmallBox}
               //  Feel free to integrate the tutor profile here. Replace this with routing to a unique tutor id or tutor profile component
              onClick={() => router.push(`/TutorPublicProfile?id=${tutor.id}`)}
              style={{ cursor: 'pointer' }}
            >
              <img src={tutor.image} alt={tutor.name} className={styles.cardImageSmall} />
              <div className={styles.cardContentSmall}>
                <h2>{tutor.name}</h2>
                <p className={styles.detail}>{tutor.subject}</p>
                <p className={styles.detail}>{tutor.language}</p>
                <p className={styles.detail}>{tutor.certifications}</p>
                <p className={styles.detail}>⭐ {tutor.rating} — {tutor.availability}</p>
                <p className={styles.detail}>📍 {tutor.location}{getDistanceLabel(tutor)}</p>
                <p className={styles.detail}>💵 ${tutor.price}</p>
                <Link href={`/TutorPublicProfile?id=${tutor.id}`} className="btn btn-sm btn-primary mt-2">
                  View Profile
                </Link>
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
