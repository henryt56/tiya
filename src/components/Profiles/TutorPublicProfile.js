// Updated TutorPublicProfile.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import BookingForm from '../Booking/BookingForm';
import { useAuth } from '../../services/context/AuthContext';

const TutorPublicProfile = () => {
  const router = useRouter();
  const { id } = router.query;
  const { currentUser } = useAuth();
  
  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (!id) return;
    
    const fetchTutorProfile = async () => {
      try {
        setLoading(true);
        
        // Only look in users collection for tutor data
        const userDoc = await getDoc(doc(db, 'users', id));
        
        if (userDoc.exists() && userDoc.data().role === 'tutor') {
          setTutor({ id: userDoc.id, ...userDoc.data() });
        } else {
          setError('Tutor not found');
        }
      } catch (err) {
        console.error('Error fetching tutor profile:', err);
        setError('Failed to load tutor profile');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTutorProfile();
  }, [id]);
  
  // Helper functions to render complex data types properly
  const renderAvailability = (availabilityData) => {
    if (!availabilityData || typeof availabilityData !== 'object') {
      return 'No availability information';
    }
    
    // Convert the object to an array of days with their available slots
    const availableDays = Object.entries(availabilityData)
      .filter(([_, dayData]) => dayData.available)
      .map(([day, dayData]) => {
        const slots = dayData.slots.map(slot => `${slot.start}-${slot.end}`).join(', ');
        const formattedDay = day.charAt(0).toUpperCase() + day.slice(1);
        return slots.length ? `${formattedDay} (${slots})` : formattedDay;
      })
      .join(', ');
    
    return availableDays || 'No availability set';
  };
  
  const renderSubjects = (subjects) => {
    if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
      return <span className="badge bg-secondary">No subjects specified</span>;
    }
    
    return subjects.map((subject, index) => (
      <span key={index} className="badge bg-primary me-1 mb-1">{subject}</span>
    ));
  };
  
  const renderLanguages = (languages) => {
    if (!languages || !Array.isArray(languages) || languages.length === 0) {
      return <span>No languages specified</span>;
    }
    
    return languages.join(', ');
  };
  
  const renderCertifications = (certifications) => {
    if (!certifications || !Array.isArray(certifications) || certifications.length === 0) {
      return <p>No certifications</p>;
    }
    
    return certifications.map((cert, index) => (
      <div key={index} className="mb-1">
        {cert.name} - {cert.issuer} ({cert.year})
      </div>
    ));
  };
  
  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }
  
  if (!tutor) {
    return null;
  }
  
  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-md-4 mb-4">
          <div className="card shadow-sm">
            <div className="card-body text-center">
              {tutor.profilePhoto ? (
                <img 
                  src={tutor.profilePhoto} 
                  alt={tutor.displayName} 
                  className="rounded-circle mb-3"
                  style={{ width: '150px', height: '150px', objectFit: 'cover' }} 
                />
              ) : (
                <div 
                  className="rounded-circle bg-light d-flex align-items-center justify-content-center mx-auto mb-3"
                  style={{ width: '150px', height: '150px' }}
                >
                  <i className="bi bi-person-fill text-secondary" style={{ fontSize: '3rem' }}></i>
                </div>
              )}
              <h2 className="h4 mb-2">{tutor.displayName}</h2>
              <p className="text-muted mb-3">
                {tutor.subjects && tutor.subjects.length > 0 ? tutor.subjects[0] : 'Tutor'}
              </p>
              <div className="d-flex justify-content-center mb-3">
                <div className="px-3 border-end">
                  <p className="mb-0 fw-bold">${tutor.hourlyRate}/hr</p>
                  <small className="text-muted">Rate</small>
                </div>
                <div className="px-3 border-end">
                  <p className="mb-0 fw-bold">
                    {tutor.rating ? tutor.rating.toFixed(1) : 'N/A'}
                  </p>
                  <small className="text-muted">Rating</small>
                </div>
                <div className="px-3">
                  <p className="mb-0 fw-bold">
                    {tutor.languages && tutor.languages.length ? tutor.languages.length : '0'}
                  </p>
                  <small className="text-muted">Languages</small>
                </div>
              </div>
              
              {currentUser && currentUser.uid !== id && (
                <button 
                  className="btn btn-primary w-100"
                  onClick={() => document.getElementById('booking-section').scrollIntoView({ behavior: 'smooth' })}
                >
                  Book a Session
                </button>
              )}
            </div>
          </div>
          
          <div className="card shadow-sm mt-4">
            <div className="card-header bg-white">
              <h3 className="h5 mb-0">Contact Information</h3>
            </div>
            <div className="card-body">
              <p className="mb-2">
                <i className="bi bi-geo-alt-fill text-primary me-2"></i>
                {tutor.location || 'No location provided'}
              </p>
              <p className="mb-0">
                <i className="bi bi-translate text-primary me-2"></i>
                {renderLanguages(tutor.languages)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="col-md-8">
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-white">
              <h3 className="h5 mb-0">About This Tutor</h3>
            </div>
            <div className="card-body">
              {tutor.bio ? (
                <p>{tutor.bio}</p>
              ) : (
                <p>No bio provided</p>
              )}
              
              <h4 className="h6 mt-4 mb-2">Availability</h4>
              <p>{renderAvailability(tutor.availability)}</p>
            </div>
          </div>
          
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-white">
              <h3 className="h5 mb-0">Education & Experience</h3>
            </div>
            <div className="card-body">
              <h4 className="h6 mb-2">Education</h4>
              <p className="mb-3">{tutor.education || 'No education information provided'}</p>
              
              <h4 className="h6 mb-2">Teaching Experience</h4>
              <p className="mb-3">{tutor.experience || 'No experience information provided'}</p>
              
              <h4 className="h6 mb-2">Certifications</h4>
              {renderCertifications(tutor.certifications)}
            </div>
          </div>
          
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-white">
              <h3 className="h5 mb-0">Subjects</h3>
            </div>
            <div className="card-body">
              <div className="d-flex flex-wrap gap-2">
                {renderSubjects(tutor.subjects)}
              </div>
            </div>
          </div>
          
          {currentUser && currentUser.uid !== id && (
            <div id="booking-section" className="card shadow-sm mb-4">
              <div className="card-header bg-white">
                <h3 className="h5 mb-0">Book a Session</h3>
              </div>
              <div className="card-body">
                <BookingForm
                  tutorId={tutor.id}
                  tutorName={tutor.displayName}
                  price={tutor.hourlyRate} 
                />
              </div>
            </div>
          )}
          
          {!currentUser && (
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-white">
                <h3 className="h5 mb-0">Book a Session</h3>
              </div>
              <div className="card-body text-center py-5">
                <p className="mb-3">Please log in to book a session with this tutor.</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => router.push(`/Login?redirect=TutorPublicProfile?id=${id}`)}
                >
                  Log In
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TutorPublicProfile;