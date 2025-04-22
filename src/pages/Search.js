// Updated Search.js component with improved search cards
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
    if (!tutor.availability) return 'No availability set';
    
    const availableDays = Object.entries(tutor.availability)
      .filter(([_, dayData]) => dayData.available && dayData.slots && dayData.slots.length > 0)
      .map(([day]) => day.charAt(0).toUpperCase() + day.slice(1))
      .join(", ");
    
    return availableDays || 'No availability set';
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
    return ` (${dist.toFixed(1)} mi)`;
  };

  return (
    <div className="container py-4">
      <div className="search-controls mb-4">
        <div className="row g-3 mb-3">
          <div className="col-md-8">
            <SearchBar 
              value={globalSearch} 
              onSearch={(val) => setGlobalSearch(val)} 
              placeholder="Search by name, subject, language or location..."
            />
          </div>
          <div className="col-md-4">
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="ZIP Code"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
              />
              <select
                className="form-select"
                value={radius}
                onChange={(e) => setRadius(parseInt(e.target.value))}
                style={{ maxWidth: '100px' }}
              >
                <option value={5}>5 mi</option>
                <option value={10}>10 mi</option>
                <option value={15}>15 mi</option>
                <option value={25}>25 mi</option>
              </select>
            </div>
          </div>
        </div>

        <div className="row g-2">
          <div className="col-6 col-md-2">
            <select 
              value={selectedSubject} 
              onChange={(e) => setSelectedSubject(e.target.value)} 
              className="form-select"
            >
              <option value="All">All Subjects</option>
              {allSubjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>
          <div className="col-6 col-md-2">
            <select 
              value={selectedLanguage} 
              onChange={(e) => setSelectedLanguage(e.target.value)} 
              className="form-select"
            >
              <option value="All">All Languages</option>
              {allLanguages.map(language => (
                <option key={language} value={language}>{language}</option>
              ))}
            </select>
          </div>
          <div className="col-6 col-md-2">
            <select 
              value={selectedDay} 
              onChange={(e) => setSelectedDay(e.target.value)} 
              className="form-select"
            >
              <option value="All">Any Day</option>
              <option value="monday">Monday</option>
              <option value="tuesday">Tuesday</option>
              <option value="wednesday">Wednesday</option>
              <option value="thursday">Thursday</option>
              <option value="friday">Friday</option>
              <option value="saturday">Saturday</option>
              <option value="sunday">Sunday</option>
            </select>
          </div>
          <div className="col-6 col-md-2">
            <select 
              value={selectedPrice} 
              onChange={(e) => setSelectedPrice(e.target.value)} 
              className="form-select"
            >
              <option value="All">Any Price</option>
              <option value="<20">Under $20</option>
              <option value="20-40">$20 - $40</option>
              <option value=">40">Over $40</option>
            </select>
          </div>
          <div className="col-6 col-md-4">
            <select 
              value={sortOption} 
              onChange={(e) => setSortOption(e.target.value)} 
              className="form-select"
            >
              <option value="distance">Sort by Distance</option>
              <option value="relevance">Sort by Relevance</option>
              <option value="lowToHigh">Price: Low to High</option>
              <option value="highToLow">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Search Results</h4>
        <small className="text-muted">{sortedTutors.length} tutors found</small>
      </div>

      {/* Improved search cards */}
      {sortedTutors.length > 0 ? (
        <div className="row g-3">
          {sortedTutors.map((tutor, index) => (
            <div
              key={tutor.id || `${tutor.name}-${index}`}
              className="col-md-6 col-lg-4"
              onClick={() => router.push(`/TutorPublicProfile?id=${tutor.id}`)}
              style={{ cursor: 'pointer' }}
            >
              <div className="tutor-card card h-100 shadow-sm hover-shadow">
                <div className="row g-0">
                  <div className="col-4 d-flex justify-content-center align-items-center p-3">
                    <div className="tutor-image-container">
                      <img 
                        src={tutor.image || '/images/default-profile.png'} 
                        alt={tutor.name} 
                        className="tutor-image rounded-circle"
                      />
                      <div className="price-badge">
                        <span>${tutor.price}/hr</span>
                      </div>
                    </div>
                  </div>
                  <div className="col-8">
                    <div className="card-body pt-3 pb-2 px-3">
                      <h5 className="card-title mb-1">{tutor.name}</h5>
                      
                      {/* Top subjects */}
                      <div className="mb-2">
                        {tutor.subjects && tutor.subjects.slice(0, 2).map((subject, idx) => (
                          <span key={idx} className="badge bg-primary me-1 mb-1">{subject}</span>
                        ))}
                        {tutor.subjects && tutor.subjects.length > 2 && (
                          <span className="badge bg-secondary">+{tutor.subjects.length - 2} more</span>
                        )}
                      </div>
                      
                      {/* Languages */}
                      {tutor.languages && tutor.languages.length > 0 && (
                        <div className="small mb-1">
                          <i className="bi bi-translate text-primary me-1"></i>
                          {tutor.languages.slice(0, 2).join(", ")}
                          {tutor.languages.length > 2 && " + "+(tutor.languages.length-2)+" more"}
                        </div>
                      )}
                      
                      {/* Location and distance */}
                      {tutor.location && (
                        <div className="small mb-1">
                          <i className="bi bi-geo-alt-fill text-primary me-1"></i>
                          {tutor.location}{getDistanceLabel(tutor)}
                        </div>
                      )}
                      
                      {/* Availability */}
                      <div className="small mb-1">
                        <i className="bi bi-calendar-check text-primary me-1"></i>
                        {formatAvailabilityDays(tutor)}
                      </div>
                      
                      {/* Certifications - only if they exist */}
                      {tutor.certifications && (
                        <div className="small text-truncate mb-1" title={tutor.certifications}>
                          <i className="bi bi-award text-primary me-1"></i>
                          {tutor.certifications}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 text-center">
          <i className="bi bi-search fs-1 text-muted mb-3"></i>
          <h4>No tutors found</h4>
          <p className="text-muted">Try adjusting your search filters or try another search term.</p>
        </div>
      )}
      <style jsx>{`
        .tutor-card {
          transition: all 0.2s ease;
          border-radius: 10px;
          overflow: hidden;
        }
        
        .hover-shadow:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
        }
        
        .tutor-image-container {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        
        .tutor-image {
          width: 90px;
          height: 90px;
          object-fit: cover;
          border: 3px solid #fff;
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
        }
        
        .price-badge {
          position: absolute;
          bottom: -5px;
          background-color: #0d6efd;
          color: white;
          font-weight: bold;
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 0.8rem;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
        
        .badge {
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}