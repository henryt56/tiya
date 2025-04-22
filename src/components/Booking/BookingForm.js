import { useState, useEffect } from 'react';
import { addDoc, collection, Timestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useAuth } from '../../services/context/AuthContext';
import { useRouter } from 'next/router';

const BookingForm = ({ tutorId, tutorName, price }) => {
  const { currentUser } = useAuth();
  const router = useRouter();
  
  const [subject, setSubject] = useState('');
  const [date, setDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [meetingType, setMeetingType] = useState('online');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // New state for tutor availability and subjects
  const [tutorAvailability, setTutorAvailability] = useState(null);
  const [tutorSubjects, setTutorSubjects] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDay, setSelectedDay] = useState('');
  
  // Fetch tutor's availability and subjects
  useEffect(() => {
    const fetchTutorInfo = async () => {
      try {
        if (!tutorId) return;
        
        const tutorDoc = await getDoc(doc(db, 'users', tutorId));
        if (tutorDoc.exists()) {
          const tutorData = tutorDoc.data();
          
          // Set tutor availability
          if (tutorData.availability) {
            setTutorAvailability(tutorData.availability);
          }
          
          // Set tutor subjects
          if (tutorData.subjects && Array.isArray(tutorData.subjects) && tutorData.subjects.length > 0) {
            setTutorSubjects(tutorData.subjects);
            // Set the first subject as default if none selected
            if (!subject) {
              setSubject(tutorData.subjects[0]);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching tutor info:', err);
      }
    };
    
    fetchTutorInfo();
  }, [tutorId]);
  
  // Update available slots when date changes
  useEffect(() => {
    if (!date || !tutorAvailability) return;
    
    // Get day of the week from selected date
    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    setSelectedDay(dayOfWeek);
    
    // Check if tutor is available on this day
    const dayAvailability = tutorAvailability[dayOfWeek];
    
    if (dayAvailability && dayAvailability.available && dayAvailability.slots) {
      setAvailableSlots(dayAvailability.slots);
    } else {
      setAvailableSlots([]);
    }
    
    // Reset selected time slot
    setSelectedTimeSlot(null);
  }, [date, tutorAvailability]);
  
  // Format time to 12-hour format with AM/PM
  const formatTime = (timeString) => {
    if (!timeString) return '';
    
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    
    return `${formattedHour}:${minutes} ${ampm}`;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      router.push('/Login?redirect=TutorPublicProfile?id=' + tutorId);
      return;
    }
    
    if (!date || !selectedTimeSlot || !subject) {
      setError('Please complete all required fields');
      return;
    }
    
    try {
      setLoading(true);
      
      // Create session date object
      const sessionDate = new Date(date);
      const [hours, minutes] = selectedTimeSlot.start.split(':').map(Number);
      sessionDate.setHours(hours, minutes, 0, 0);
      
      // Calculate end time
      const [endHours, endMinutes] = selectedTimeSlot.end.split(':').map(Number);
      const endDate = new Date(sessionDate);
      endDate.setHours(endHours, endMinutes, 0, 0);
      
      // Calculate duration in hours (can handle variable durations)
      const durationHours = (endDate - sessionDate) / (1000 * 60 * 60);
      
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
        startTime: selectedTimeSlot.start,
        endTime: selectedTimeSlot.end,
        duration: durationHours, // Duration in hours
        price: parseFloat(price) * durationHours, // Total price based on duration
        status: 'pending',
        paymentStatus: 'unpaid',
        paymentId: null,
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
            {tutorSubjects.length > 0 ? (
              <select
                id="subject"
                className="form-select"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              >
                <option value="" disabled>Select a subject</option>
                {tutorSubjects.map((subj, index) => (
                  <option key={index} value={subj}>
                    {subj}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                className="form-control"
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="This tutor hasn't specified subjects yet"
                required
              />
            )}
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
            {date && tutorAvailability && !tutorAvailability[selectedDay]?.available && (
              <small className="text-danger">Tutor is not available on this day</small>
            )}
          </div>
          
          {date && availableSlots.length > 0 && (
            <div className="mb-3">
              <label className="form-label">Available Time Slots *</label>
              <div className="d-flex flex-wrap gap-2">
                {availableSlots.map((slot, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`btn ${selectedTimeSlot === slot ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setSelectedTimeSlot(slot)}
                  >
                    {formatTime(slot.start)} - {formatTime(slot.end)}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {date && availableSlots.length === 0 && (
            <div className="alert alert-warning">
              No time slots available on this day. Please select another date.
            </div>
          )}
          
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
              {selectedTimeSlot && (
                <>
                  <p className="mb-0">
                    Time: <strong>{formatTime(selectedTimeSlot.start)} - {formatTime(selectedTimeSlot.end)}</strong>
                  </p>
                  <p className="mb-0">
                    Duration: <strong>{((new Date(`2023-01-01T${selectedTimeSlot.end}:00`) - new Date(`2023-01-01T${selectedTimeSlot.start}:00`)) / (1000 * 60 * 60)).toFixed(1)} hours</strong>
                  </p>
                  <p className="mb-0">
                    Total: <strong>${(price * ((new Date(`2023-01-01T${selectedTimeSlot.end}:00`) - new Date(`2023-01-01T${selectedTimeSlot.start}:00`)) / (1000 * 60 * 60))).toFixed(2)}</strong>
                  </p>
                </>
              )}
            </div>
          </div>
          
          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading || !selectedTimeSlot}
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