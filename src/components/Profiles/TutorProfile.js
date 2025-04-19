import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebaseConfig';
import { useAuth } from '../../services/context/AuthContext';
import { syncUserToTutor } from '../../services/utilities/firebaseSync';

const TutorProfile = () => {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isNewUser, setIsNewUser] = useState(false);
  
  // Profile fields
  const [profileData, setProfileData] = useState({
    displayName: '',
    bio: '',
    education: '',
    experience: '',
    subjects: [],
    hourlyRate: '',
    availability: {
      monday: { available: false, slots: [] },
      tuesday: { available: false, slots: [] },
      wednesday: { available: false, slots: [] },
      thursday: { available: false, slots: [] },
      friday: { available: false, slots: [] },
      saturday: { available: false, slots: [] },
      sunday: { available: false, slots: [] },
    },
    profileComplete: false,
    profilePhoto: '',
    certifications: [],
    languages: [],
    email: '',
    phone: '',
    location: '',
    coordinates: null
  });
  
  
  // For adding new subjects
  const [newSubject, setNewSubject] = useState('');
  
  // For adding new certifications
  const [newCertification, setNewCertification] = useState({ name: '', issuer: '', year: '' });
  
  // For adding new languages
  const [newLanguage, setNewLanguage] = useState('');
  
  // For profile photo
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  
  // Predefined lists
  const subjectOptions = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology',
    'English', 'Literature', 'History', 'Geography',
    'Computer Science', 'Programming', 'Economics', 'Business Studies',
    'Languages', 'Music', 'Art', 'Physical Education'
  ];
  
  const languageOptions = [
    'English', 'Spanish', 'French', 'German', 'Mandarin', 'Japanese',
    'Arabic', 'Russian', 'Portuguese', 'Italian', 'Hindi', 'Bengali'
  ];
  
  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (!currentUser) return;
      
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          
          // Check if this is a new profile
          if (!userData.profileComplete && userData.role === 'tutor') {
            setIsNewUser(true);
          }
          
          // Initialize form with existing data or defaults
          setProfileData(prevData => ({
            ...prevData,
            displayName: userData.displayName || `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
            bio: userData.bio || '',
            education: userData.education || '',
            experience: userData.experience || '',
            subjects: userData.subjects || [],
            hourlyRate: userData.hourlyRate || '',
            availability: userData.availability || prevData.availability,
            profileComplete: userData.profileComplete || false,
            profilePhoto: userData.profilePhoto || '',
            certifications: userData.certifications || [],
            languages: userData.languages || [],
          }));
          
          // Set photo preview if exists
          if (userData.profilePhoto) {
            setPhotoPreview(userData.profilePhoto);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading profile:', error);
        setMessage({ text: 'Failed to load profile data.', type: 'danger' });
        setLoading(false);
      }
    };
    
    loadProfile();
  }, [currentUser]);
  
  // Handle profile photo change
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhotoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle subject selection
  const handleSubjectChange = (subject) => {
    if (profileData.subjects.includes(subject)) {
      setProfileData(prev => ({
        ...prev,
        subjects: prev.subjects.filter(s => s !== subject)
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        subjects: [...prev.subjects, subject]
      }));
    }
  };
  
  // Add custom subject
  const handleAddSubject = () => {
    if (newSubject && !profileData.subjects.includes(newSubject)) {
      setProfileData(prev => ({
        ...prev,
        subjects: [...prev.subjects, newSubject]
      }));
      setNewSubject('');
    }
  };
  
  // Handle language selection
  const handleLanguageChange = (language) => {
    if (profileData.languages.includes(language)) {
      setProfileData(prev => ({
        ...prev,
        languages: prev.languages.filter(l => l !== language)
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        languages: [...prev.languages, language]
      }));
    }
  };
  
  // Add custom language
  const handleAddLanguage = () => {
    if (newLanguage && !profileData.languages.includes(newLanguage)) {
      setProfileData(prev => ({
        ...prev,
        languages: [...prev.languages, newLanguage]
      }));
      setNewLanguage('');
    }
  };
  
  // Add certification
  const handleAddCertification = () => {
    if (newCertification.name && newCertification.issuer) {
      setProfileData(prev => ({
        ...prev,
        certifications: [...prev.certifications, { ...newCertification }]
      }));
      setNewCertification({ name: '', issuer: '', year: '' });
    }
  };
  
  // Remove certification
  const handleRemoveCertification = (index) => {
    setProfileData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };
  
  // Handle availability change
  const handleAvailabilityChange = (day, isAvailable) => {
    setProfileData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: {
          ...prev.availability[day],
          available: isAvailable
        }
      }
    }));
  };
  
  // Add time slot
  const handleAddTimeSlot = (day, startTime, endTime) => {
    if (startTime && endTime) {
      setProfileData(prev => ({
        ...prev,
        availability: {
          ...prev.availability,
          [day]: {
            ...prev.availability[day],
            slots: [...prev.availability[day].slots, { start: startTime, end: endTime }]
          }
        }
      }));
    }
  };
  
  // Remove time slot
  const handleRemoveTimeSlot = (day, index) => {
    setProfileData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: {
          ...prev.availability[day],
          slots: prev.availability[day].slots.filter((_, i) => i !== index)
        }
      }
    }));
  };
  
  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });
    
    try {
      // Create updated user data first, without the new photo
      let updatedUserData = {
        ...profileData,
        profileComplete: true,
        updatedAt: new Date().toISOString()
      };
      
      // Handle photo upload separately
      if (profilePhotoFile) {
        try {
          // Create a storage reference with a unique path
          const storageRef = ref(storage, `profile-photos/${currentUser.uid}`);
          
          // Upload the file
          await uploadBytes(storageRef, profilePhotoFile);
          console.log('File uploaded successfully');
          
          // Get the download URL
          const photoURL = await getDownloadURL(storageRef);
          console.log('Download URL retrieved:', photoURL);
          
          // Update the data object with the photo URL
          updatedUserData.profilePhoto = photoURL;
        } catch (uploadError) {
          console.error('Error uploading profile photo:', uploadError);
          // Continue with the save without updating the photo
        }
      }
      
      // Update profile data in Firestore
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, updatedUserData);
      
      setMessage({ text: 'Profile saved successfully!', type: 'success' });
      
      // If new user, redirect to dashboard
      if (isNewUser) {
        setTimeout(() => {
          router.push('/TutorDashboard');
        }, 1500);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage({ text: 'Failed to save profile: ' + error.message, type: 'danger' });
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container py-4">
      <h1 className="mb-4">{isNewUser ? 'Complete Your Tutor Profile' : 'Your Tutor Profile'}</h1>
      
      {message.text && (
        <div className={`alert alert-${message.type} mb-4`} role="alert">
          {message.text}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {/* Basic Information Section */}
        <div className="card mb-4 shadow-sm">
          <div className="card-header bg-white">
            <h2 className="h5 mb-0 text-primary">Basic Information</h2>
          </div>
          <div className="card-body">
            <div className="mb-4">
              <label>Profile Photo</label>
              <div className="d-flex align-items-center mt-2">
                {photoPreview ? (
                  <img 
                    src={photoPreview} 
                    alt="Profile preview" 
                    className="rounded-circle me-3"
                    style={{ width: '120px', height: '120px', objectFit: 'cover' }} 
                  />
                ) : (
                  <div 
                    className="rounded-circle bg-light d-flex align-items-center justify-content-center me-3"
                    style={{ width: '120px', height: '120px' }}
                  >
                    <span className="text-muted">DO NOT ADD PHOTO YET</span>
                  </div>
                )}
                <div>
                  <input
                    type="file"
                    id="profile-photo"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="form-control d-none"
                  />
                  <label htmlFor="profile-photo" className="btn btn-outline-primary">
                    PFP NOT WORKING CURRENTLY !
                  </label>
                </div>
              </div>
            </div>
            
            <div className="mb-3">
              <label htmlFor="displayName" className="form-label">Display Name</label>
              <input
                id="displayName"
                type="text"
                className="form-control"
                value={profileData.displayName}
                onChange={(e) => setProfileData({...profileData, displayName: e.target.value})}
                required
              />
            </div>
            
            <div className="mb-3">
              <label htmlFor="bio" className="form-label">Bio</label>
              <textarea
                id="bio"
                rows="4"
                className="form-control"
                value={profileData.bio}
                onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                placeholder="Tell students about yourself, your teaching style, and experience..."
                required
              ></textarea>
            </div>
            
            <div className="mb-3">
              <label htmlFor="hourlyRate" className="form-label">Hourly Rate ($)</label>
              <input
                id="hourlyRate"
                type="number"
                className="form-control"
                min="1"
                step="0.01"
                value={profileData.hourlyRate}
                onChange={(e) => setProfileData({...profileData, hourlyRate: e.target.value})}
                required
              />
            </div>
          </div>
        </div>
        
        {/* Education & Experience Section */}
        <div className="card mb-4 shadow-sm">
          <div className="card-header bg-white">
            <h2 className="h5 mb-0 text-primary">Education & Experience</h2>
          </div>
          <div className="card-body">
            <div className="mb-3">
              <label htmlFor="education" className="form-label">Education</label>
              <textarea
                id="education"
                rows="3"
                className="form-control"
                value={profileData.education}
                onChange={(e) => setProfileData({...profileData, education: e.target.value})}
                placeholder="List your degrees, institutions, graduation years..."
                required
              ></textarea>
            </div>
            
            <div className="mb-4">
              <label htmlFor="experience" className="form-label">Teaching Experience</label>
              <textarea
                id="experience"
                rows="3"
                className="form-control"
                value={profileData.experience}
                onChange={(e) => setProfileData({...profileData, experience: e.target.value})}
                placeholder="Describe your teaching experience, years in the field..."
                required
              ></textarea>
            </div>
            
            {/* Certifications */}
            <div className="mb-3">
              <label className="form-label">Certifications & Credentials</label>
              
              {profileData.certifications.length > 0 && (
                <div className="mb-3">
                  {profileData.certifications.map((cert, index) => (
                    <div key={index} className="d-flex align-items-center bg-light p-2 mb-2 rounded">
                      <span>{cert.name} - {cert.issuer} ({cert.year})</span>
                      <button
                        type="button"
                        className="btn btn-sm text-danger ms-auto"
                        onClick={() => handleRemoveCertification(index)}
                      >
                        <i className="bi bi-x-circle"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="row g-2 mb-2">
                <div className="col-md-5">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Certification Name"
                    value={newCertification.name}
                    onChange={(e) => setNewCertification({...newCertification, name: e.target.value})}
                  />
                </div>
                <div className="col-md-4">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Issuing Organization"
                    value={newCertification.issuer}
                    onChange={(e) => setNewCertification({...newCertification, issuer: e.target.value})}
                  />
                </div>
                <div className="col-md-2">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Year"
                    value={newCertification.year}
                    onChange={(e) => setNewCertification({...newCertification, year: e.target.value})}
                  />
                </div>
                <div className="col-md-1">
                  <button
                    type="button"
                    className="btn btn-primary w-100"
                    onClick={handleAddCertification}
                  >
                    <i className="bi bi-plus"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Subjects Section */}
        <div className="card mb-4 shadow-sm">
          <div className="card-header bg-white">
            <h2 className="h5 mb-0 text-primary">Subjects & Expertise</h2>
          </div>
          <div className="card-body">
            <div className="mb-4">
              <label className="form-label">Subjects You Teach</label>
              <div className="row mb-3">
                {subjectOptions.map((subject) => (
                  <div key={subject} className="col-md-3 mb-2">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`subject-${subject}`}
                        checked={profileData.subjects.includes(subject)}
                        onChange={() => handleSubjectChange(subject)}
                      />
                      <label className="form-check-label" htmlFor={`subject-${subject}`}>
                        {subject}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="row">
                <div className="col-md-9">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Add other subject"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                  />
                </div>
                <div className="col-md-3">
                  <button 
                    type="button" 
                    className="btn btn-primary w-100"
                    onClick={handleAddSubject}
                  >
                    Add Subject
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mb-3">
              <label className="form-label">Languages</label>
              <div className="row mb-3">
                {languageOptions.map((language) => (
                  <div key={language} className="col-md-3 mb-2">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`language-${language}`}
                        checked={profileData.languages.includes(language)}
                        onChange={() => handleLanguageChange(language)}
                      />
                      <label className="form-check-label" htmlFor={`language-${language}`}>
                        {language}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="row">
                <div className="col-md-9">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Add other language"
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value)}
                  />
                </div>
                <div className="col-md-3">
                  <button 
                    type="button" 
                    className="btn btn-primary w-100"
                    onClick={handleAddLanguage}
                  >
                    Add Language
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Availability Section */}
        <div className="card mb-4 shadow-sm">
          <div className="card-header bg-white">
            <h2 className="h5 mb-0 text-primary">Availability</h2>
          </div>
          <div className="card-body">
            <div className="row">
              {Object.entries(profileData.availability).map(([day, dayData]) => (
                <div key={day} className="col-md-6 mb-4">
                  <div className="card h-100">
                    <div className="card-header bg-light d-flex justify-content-between align-items-center">
                      <h3 className="h6 mb-0 text-capitalize">{day}</h3>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`available-${day}`}
                          checked={dayData.available}
                          onChange={(e) => handleAvailabilityChange(day, e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor={`available-${day}`}>
                          {dayData.available ? 'Available' : 'Unavailable'}
                        </label>
                      </div>
                    </div>
                    
                    {dayData.available && (
                      <div className="card-body">
                        {dayData.slots.length > 0 && (
                          <div className="mb-3">
                            {dayData.slots.map((slot, idx) => (
                              <div key={idx} className="d-flex align-items-center bg-light p-2 mb-2 rounded">
                                <span>{slot.start} - {slot.end}</span>
                                <button
                                  type="button"
                                  className="btn btn-sm text-danger ms-auto"
                                  onClick={() => handleRemoveTimeSlot(day, idx)}
                                >
                                  <i className="bi bi-x-circle"></i>
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <div className="row g-2">
                          <div className="col-5">
                            <input 
                              type="time" 
                              id={`${day}-start`} 
                              className="form-control"
                            />
                          </div>
                          <div className="col-5">
                            <input 
                              type="time" 
                              id={`${day}-end`} 
                              className="form-control" 
                            />
                          </div>
                          <div className="col-2">
                            <button
                              type="button"
                              className="btn btn-primary w-100"
                              onClick={() => {
                                const startEl = document.getElementById(`${day}-start`);
                                const endEl = document.getElementById(`${day}-end`);
                                handleAddTimeSlot(day, startEl.value, endEl.value);
                                startEl.value = '';
                                endEl.value = '';
                              }}
                            >
                              <i className="bi bi-plus"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="card mb-4 shadow-sm">
          <div className="card-header bg-white">
            <h2 className="h5 mb-0 text-primary">Contact Information</h2>
          </div>
          <div className="card-body">
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                id="email"
                type="email"
                className="form-control"
                value={profileData.email}
                onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                placeholder="Your contact email"
              />
            </div>
            
            <div className="mb-3">
              <label htmlFor="phone" className="form-label">Phone Number (optional)</label>
              <input
                id="phone"
                type="tel"
                className="form-control"
                value={profileData.phone || ''}
                onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                placeholder="Your phone number"
              />
            </div>
            
            <div className="mb-3">
              <label htmlFor="location" className="form-label">Location</label>
              <input
                id="location"
                type="text"
                className="form-control"
                value={profileData.location || ''}
                onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                placeholder="City, State"
              />
              <small className="text-muted">This helps students find tutors in their area</small>
            </div>
          </div>
        </div>
        
        <div className="d-grid gap-2 d-md-flex justify-content-md-end">
          <button
            type="submit"
            className="btn btn-primary btn-lg px-4"
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Saving...
              </>
            ) : (
              isNewUser ? 'Complete Profile' : 'Save Changes'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TutorProfile;