// Add to your firebaseConfig.js or create a new utilities file
import { doc, setDoc, writeBatch } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

// Function to sync user data to tutor collection
export const syncUserToTutor = async (userId, userData) => {
  try {
    // Only sync if this is a tutor account
    if (userData.role !== 'tutor') return;
    
    // Map user data to tutor format
    const tutorData = {
      id: userId,
      name: userData.displayName || `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
      subject: userData.subjects ? userData.subjects[0] || "" : "",
      language: userData.languages ? userData.languages[0] || "" : "",
      availability: userData.availability ? Object.keys(userData.availability)
        .filter(day => userData.availability[day].available)
        .join(", ") : "",
      location: userData.location || "",
      price: Number(userData.hourlyRate) || 0,
      rating: userData.rating || 0,
      image: userData.profilePhoto || "",
      certifications: userData.certifications ? 
        userData.certifications.map(cert => cert.name).join(", ") : "",
      coordinates: userData.coordinates || null
    };
    
    // Update tutor document
    await setDoc(doc(db, 'tutors', userId), tutorData, { merge: true });
    console.log('User data synced to tutor collection');
    
    return true;
  } catch (error) {
    console.error('Error syncing user to tutor:', error);
    throw error;
  }
};