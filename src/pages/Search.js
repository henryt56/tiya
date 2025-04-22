// Updated Search.js component
import React, { useState, useEffect } from 'react';
import styles from '../styles/Search.module.css';
import { useRouter } from 'next/router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import SearchBar from '../components/SearchBar';
import Link from 'next/link';

export default function Search() {
  const router = useRouter();
  const { q } = router.query;

  // State for tutor list and filters
  const [tutorList, setTutorList] = useState([]);
  const [globalSearch, setGlobalSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [selectedDay, setSelectedDay] = useState('All');
  const [selectedRating, setSelectedRating] = useState('All');
  const [selectedPrice, setSelectedPrice] = useState('All');
  const [sortOption, setSortOption] = useState('distance');

  const [zip, setZip] = useState('');
  const [radius, setRadius] = useState(10);
  const [zipCoords, setZipCoords] = useState(null);

  // Fetch tutors from users collection only
  useEffect(() => {
    const fetchTutors = async () => {
      try {
        // Only fetch from users collection (tutors only with completed profiles)
        const usersTutorsQuery = query(
          collection(db, 'users'), 
          where('role', '==', 'tutor'),
          where('profileComplete', '==', true)
        );
        const tutorsSnapshot = await getDocs(usersTutorsQuery);
        
        // Map user tutors to the format needed for display
        const tutorsData = tutorsSnapshot.docs.map(doc => {
          const userData = doc.data();
          
          return {
            id: doc.id,
            name: userData.displayName || `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
            subject: userData.subjects && userData.subjects.length > 0 ? userData.subjects[0] : "",
            subjects: userData.subjects || [],
            language: userData.languages && userData.languages.length > 0 ? userData.languages[0] : "",
            languages: userData.languages || [],
            availability: userData.availability || {},
            location: userData.location || "",
            price: Number(userData.hourlyRate) || 0,
            rating: userData.rating || 0,
            image: userData.profilePhoto || "",
            certifications: userData.certifications ? 
              userData.certifications.map(cert => cert.name).join(", ") : "",
            coordinates: userData.coordinates || null
          };
        });
        
        setTutorList(tutorsData);
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
          `https://maps.googleapis.com/maps/api/geocode/json?address=${zip}&key=AIzaSyDH5lSWgeZDm_UmxMa6PQnEr6IT1xFMdqg`
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
    const fields = [
      tutor.name, 
      ...(tutor.subjects || []), 
      ...(tutor.languages || []), 
      tutor.location
    ];
    
    return fields.reduce((score, field) =>
      score + (field?.toLowerCase().includes(query.toLowerCase()) ? 1 : 0), 0
    );
  };

  // Check if tutor is available on the selected day
  const checkDayAvailability = (tutor, selectedDay) => {
    if (selectedDay === 'All') return true;
    
    const availability = tutor.availability || {};
    return availability[selectedDay.toLowerCase()] && 
           availability[selectedDay.toLowerCase()].available &&
           availability[selectedDay.toLowerCase()].slots &&
           availability[selectedDay.toLowerCase()].slots.length > 0;
  };

  const filteredTutors = tutorList.filter((t) => {
    const q = globalSearch.toLowerCase();
    const matchesSearch =
      !q ||
      t.name.toLowerCase().includes(q) ||
      (t.subjects || []).some(subj => subj.toLowerCase().includes(q)) ||
      (t.languages || []).some(lang => lang.toLowerCase().includes(q)) ||
      (t.location?.toLowerCase() || '').includes(q) ||
      t.price?.toString().includes(q) ||
      t.rating?.toString().includes(q);

    const matchesZipRadius = zipCoords && t.coordinates
      ? calculateDistance(zipCoords.lat, zipCoords.lng, t.coordinates.lat, t.coordinates.lng) <= radius
      : true;

    return (
      matchesSearch &&
      (selectedSubject === 'All' || (t.subjects || []).includes(selectedSubject)) &&
      (selectedLanguage === 'All' || (t.languages || []).includes(selectedLanguage)) &&
      checkDayAvailability(t, selectedDay) &&
      (selectedRating === 'All' || Math.floor(t.rating) >= parseInt(selectedRating)) &&
      (selectedPrice === 'All' ||
        (selectedPrice === '<20' && t.price < 20) ||
        (selectedPrice === '20-40' && t.price >= 20 && t.price <= 40) ||
        (selectedPrice === '>40' && t.price > 40)) &&
      matchesZipRadius
    );
  });

  // Get unique subjects and languages from all tutors for filter options
  const allSubjects = [...new Set(tutorList.flatMap(t => t.subjects || []))].filter(Boolean);
  const allLanguages = [...new Set(tutorList.flatMap(t => t.languages || []))].filter(Boolean);

  // Format availability days for display
  const formatAvailabilityDays = (tutor) => {
    if (!tutor.availability) return '';
    
    const availableDays = Object.entries(tutor.availability)
      .filter(([_, dayData]) => dayData.available && dayData.slots && dayData.slots.length > 0)
      .map(([day]) => day.charAt(0).toUpperCase() + day.slice(1))
      .join(", ");
    
    return availableDays;
  };

  // Format time in AM/PM
  const formatTimeAMPM = (timeString) => {
    if (!timeString) return '';
    
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const sortedTutors = [...filteredTutors].sort((a, b) => {
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
          {allSubjects.map(subject => (
            <option key={subject} value={subject}>{subject}</option>
          ))}
        </select>
        <select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)} className={styles.filterPill}>
          <option value="All">Language</option>
          {allLanguages.map(language => (
            <option key={language} value={language}>{language}</option>
          ))}
        </select>
        <select value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)} className={styles.filterPill}>
          <option value="All">Availability</option>
          <option value="monday">Monday</option>
          <option value="tuesday">Tuesday</option>
          <option value="wednesday">Wednesday</option>
          <option value="thursday">Thursday</option>
          <option value="friday">Friday</option>
          <option value="saturday">Saturday</option>
          <option value="sunday">Sunday</option>
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
              onClick={() => router.push(`/TutorPublicProfile?id=${tutor.id}`)}
              style={{ cursor: 'pointer' }}
            >
              <img src={tutor.image || '/images/default-profile.png'} alt={tutor.name} className={styles.cardImageSmall} />
              <div className={styles.cardContentSmall}>
                <h2>{tutor.name}</h2>
                <p className={styles.detail}>
                  {tutor.subjects && tutor.subjects.slice(0, 2).join(", ")}
                  {tutor.subjects && tutor.subjects.length > 2 ? ', ...' : ''}
                </p>
                <p className={styles.detail}>
                  {tutor.languages && tutor.languages.slice(0, 2).join(", ")}
                  {tutor.languages && tutor.languages.length > 2 ? ', ...' : ''}
                </p>
                <p className={styles.detail}>{tutor.certifications}</p>
                <p className={styles.detail}>📅 Available: {formatAvailabilityDays(tutor)}</p>
                <p className={styles.detail}>📍 {tutor.location}{getDistanceLabel(tutor)}</p>
                <p className={styles.detail}>💵 ${tutor.price}/hr</p>
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