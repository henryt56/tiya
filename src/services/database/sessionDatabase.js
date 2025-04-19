import { collection, addDoc, getDoc, getDocs, updateDoc, doc, query, where, Timestamp, orderBy } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

// Get tutor sessions with specific status
export const getTutorSessions = async (tutorId, status) => {
  try {
    const sessionsRef = collection(db, 'sessions');
    let q;
    
    if (status) {
      q = query(
        sessionsRef,
        where('tutorId', '==', tutorId),
        where('status', '==', status),
        orderBy('date', 'asc')
      );
    } else {
      q = query(
        sessionsRef,
        where('tutorId', '==', tutorId),
        orderBy('date', 'asc')
      );
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting tutor sessions:', error);
    throw error;
  }
};

// Get upcoming sessions for a user
export const getUpcomingSessions = async (userId, role) => {
  try {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    const sessionsRef = collection(db, 'sessions');
    const queryField = role === 'tutor' ? 'tutorId' : 'studentId';
    
    const q = query(
      sessionsRef,
      where(queryField, '==', userId),
      where('date', '>=', Timestamp.fromDate(now)),
      orderBy('date', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting upcoming sessions:', error);
    throw error;
  }
};

// Get past sessions for a user
export const getPastSessions = async (userId, role) => {
  try {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    const sessionsRef = collection(db, 'sessions');
    const queryField = role === 'tutor' ? 'tutorId' : 'studentId';
    
    const q = query(
      sessionsRef,
      where(queryField, '==', userId),
      where('date', '<', Timestamp.fromDate(now)),
      orderBy('date', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting past sessions:', error);
    throw error;
  }
};

// Update session status
export const updateSessionStatus = async (sessionId, status) => {
  try {
    const sessionRef = doc(db, 'sessions', sessionId);
    await updateDoc(sessionRef, {
      status,
      updatedAt: Timestamp.now()
    });
    return true;
  } catch (error) {
    console.error('Error updating session status:', error);
    throw error;
  }
};

// Add feedback to a session
export const addSessionFeedback = async (sessionId, rating, feedback) => {
  try {
    const sessionRef = doc(db, 'sessions', sessionId);
    await updateDoc(sessionRef, {
      rating,
      feedback,
      updatedAt: Timestamp.now()
    });
    return true;
  } catch (error) {
    console.error('Error adding session feedback:', error);
    throw error;
  }
};

// Add a meeting link to a session
export const addMeetingLink = async (sessionId, meetingLink) => {
  try {
    const sessionRef = doc(db, 'sessions', sessionId);
    await updateDoc(sessionRef, {
      meetingLink,
      updatedAt: Timestamp.now()
    });
    return true;
  } catch (error) {
    console.error('Error adding meeting link:', error);
    throw error;
  }
};

// Add session notes
export const addSessionNotes = async (sessionId, notes) => {
  try {
    const sessionRef = doc(db, 'sessions', sessionId);
    await updateDoc(sessionRef, {
      notes,
      updatedAt: Timestamp.now()
    });
    return true;
  } catch (error) {
    console.error('Error adding session notes:', error);
    throw error;
  }
};