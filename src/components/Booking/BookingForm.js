import { useState } from 'react';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useAuth } from '../../services/context/AuthContext';
import { useRouter } from 'next/router';

const BookingForm = ({ tutorId, tutorName, price }) => {
  const { currentUser } = useAuth();
  const router = useRouter();
  
  const [subject, setSubject] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [meetingType, setMeetingType] = useState('online');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      router.push('/Login?redirect=TutorPublicProfile?id=' + tutorId);
      return;
    }
    
    if (!date || !time || !subject) {
      setError('Please complete all required fields');
      return;
    }
    
    try {
      setLoading(true);
      
      // Create session date object
      const sessionDate = new Date(date);
      const [hours, minutes] = time.split(':').map(Number);
      sessionDate.setHours(hours, minutes, 0, 0);
      
      // Calculate end time (1 hour session)
      const endDate = new Date(sessionDate);
      endDate.setHours(endDate.getHours() + 1);
      
      // Format end time
      const endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
      
      // Create session in Firestore
      const sessionData = {
        tutorId,
        tutorName,
        studentId: currentUser.uid,
        studentName: currentUser.displayName || 'Student',
        subject,
        description: '',
        meetingType,
        date: Timestamp.fromDate(sessionDate),
        startTime: time,
        endTime,
        duration: 1, // 1 hour
        price: parseFloat(price),
        status: 'pending',
        paymentStatus: 'unpaid', // Add payment status field
        paymentId: null, // For Stripe payment ID
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      
      const docRef = await addDoc(collection(db, 'sessions'), sessionData);
      
      alert('Session request sent! The tutor will confirm your booking soon.');
      router.push('/StudentDashboard');
      
    } catch (err) {
      console.error('Error booking session:', err);
      setError('Failed to book session. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="card shadow-sm">
      <div className="card-body">
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="subject" className="form-label">Subject *</label>
            <input
              type="text"
              className="form-control"
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>
          
          <div className="mb-3">
            <label htmlFor="date" className="form-label">Date *</label>
            <input
              type="date"
              className="form-control"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>
          
          <div className="mb-3">
            <label htmlFor="time" className="form-label">Time *</label>
            <input
              type="time"
              className="form-control"
              id="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>
          
          <div className="mb-3">
            <label className="form-label">Session Type</label>
            <div className="d-flex">
              <div className="form-check me-3">
                <input
                  className="form-check-input"
                  type="radio"
                  name="meetingType"
                  id="online"
                  value="online"
                  checked={meetingType === 'online'}
                  onChange={() => setMeetingType('online')}
                />
                <label className="form-check-label" htmlFor="online">
                  Online
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="meetingType"
                  id="inPerson"
                  value="inPerson"
                  checked={meetingType === 'inPerson'}
                  onChange={() => setMeetingType('inPerson')}
                />
                <label className="form-check-label" htmlFor="inPerson">
                  In-Person
                </label>
              </div>
            </div>
          </div>
          
          <div className="card bg-light mb-3">
            <div className="card-body">
              <h6 className="card-title">Session Summary</h6>
              <p className="mb-0">Price: <strong>${price}/hour</strong></p>
            </div>
          </div>
          
          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Sending Request...
              </>
            ) : (
              'Request Session'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingForm;