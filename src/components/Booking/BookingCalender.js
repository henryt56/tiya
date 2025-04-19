import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../services/context/AuthContext';
import { collection, doc, getDocs, query, where, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import BookingForm from './BookingForm';

const BookingCalendar = ({ tutorId, tutorName, availability, hourlyRate }) => {
  const router = useRouter();
  const { currentUser } = useAuth();
  
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [calendarDays, setCalendarDays] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  // Initialize calendar days for current month
  useEffect(() => {
    generateCalendarDays(currentMonth);
  }, [currentMonth]);
  
  // Fetch booked slots when tutor or date changes
  useEffect(() => {
    if (tutorId && selectedDate) {
      fetchBookedSlots();
    }
  }, [tutorId, selectedDate]);
  
  // Generate available slots when date or availability changes
  useEffect(() => {
    if (selectedDate && availability) {
      generateAvailableSlots();
    }
  }, [selectedDate, availability, bookedSlots]);
  
  // Generate calendar days for a given month
  const generateCalendarDays = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // First day of the month
    const firstDayOfMonth = new Date(year, month, 1);
    // Last day of the month
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    // Days from previous month to fill first week
    const daysFromPrevMonth = firstDayOfMonth.getDay();
    // Total days in current month
    const daysInMonth = lastDayOfMonth.getDate();
    
    // Generate array of day objects
    const days = [];
    
    // Add days from previous month
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      days.push({
        day,
        month: month - 1,
        year,
        isCurrentMonth: false,
        date: new Date(year, month - 1, day)
      });
    }
    
    // Add days from current month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      days.push({
        day: i,
        month,
        year,
        isCurrentMonth: true,
        date,
        dayName: dayNames[date.getDay()].toLowerCase()
      });
    }
    
    // Add days from next month to fill last week if needed
    const remainingDays = 7 - (days.length % 7);
    if (remainingDays < 7) {
      for (let i = 1; i <= remainingDays; i++) {
        days.push({
          day: i,
          month: month + 1,
          year,
          isCurrentMonth: false,
          date: new Date(year, month + 1, i)
        });
      }
    }
    
    setCalendarDays(days);
  };
  
  // Fetch booked slots from Firestore
  const fetchBookedSlots = async () => {
    try {
      setLoading(true);
      
      // Convert selected date to start and end of day timestamps
      const selectedDateObj = new Date(selectedDate);
      const startOfDay = new Date(selectedDateObj);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(selectedDateObj);
      endOfDay.setHours(23, 59, 59, 999);
      
      // Query Firestore for booked sessions on selected date with this tutor
      const sessionsRef = collection(db, 'sessions');
      const q = query(
        sessionsRef,
        where('tutorId', '==', tutorId),
        where('date', '>=', Timestamp.fromDate(startOfDay)),
        where('date', '<=', Timestamp.fromDate(endOfDay))
      );
      
      const querySnapshot = await getDocs(q);
      const booked = [];
      
      querySnapshot.forEach((doc) => {
        const sessionData = doc.data();
        booked.push({
          id: doc.id,
          startTime: sessionData.startTime,
          endTime: sessionData.endTime
        });
      });
      
      setBookedSlots(booked);
    } catch (err) {
      console.error('Error fetching booked slots:', err);
      setError('Failed to load availability');
    } finally {
      setLoading(false);
    }
  };
  
  // Generate available time slots based on tutor's availability and booked slots
  const generateAvailableSlots = () => {
    if (!selectedDate || !availability) return;
    
    const selectedDay = new Date(selectedDate).getDay();
    const dayName = dayNames[selectedDay].toLowerCase();
    
    // Check if tutor is available on selected day
    const dayAvailability = availability[dayName];
    
    if (!dayAvailability || !dayAvailability.available || !dayAvailability.slots || dayAvailability.slots.length === 0) {
      setAvailableSlots([]);
      return;
    }
    
    // Generate time slots
    const slots = [];
    dayAvailability.slots.forEach(slot => {
      const { start, end } = slot;
      
      // Check if slot is already booked
      const isBooked = bookedSlots.some(
        bookedSlot => 
          (start >= bookedSlot.startTime && start < bookedSlot.endTime) ||
          (end > bookedSlot.startTime && end <= bookedSlot.endTime) ||
          (start <= bookedSlot.startTime && end >= bookedSlot.endTime)
      );
      
      if (!isBooked) {
        slots.push({ start, end });
      }
    });
    
    setAvailableSlots(slots);
  };
  
  // Navigate to previous month
  const prevMonth = () => {
    const prevMonthDate = new Date(currentMonth);
    prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);
    setCurrentMonth(prevMonthDate);
  };
  
  // Navigate to next month
  const nextMonth = () => {
    const nextMonthDate = new Date(currentMonth);
    nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
    setCurrentMonth(nextMonthDate);
  };
  
  // Handle date selection
  const handleDateSelect = (dateObj) => {
    // Prevent selecting dates in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (dateObj.date < today) {
      return;
    }
    
    const formattedDate = dateObj.date.toISOString().split('T')[0];
    setSelectedDate(formattedDate);
    setSelectedSlot(null);
    setShowBookingForm(false);
  };
  
  // Handle time slot selection
  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    setShowBookingForm(true);
  };
  
  // Handle successful booking
  const handleBookingSuccess = () => {
    // Redirect to student dashboard or show confirmation
    router.push('/StudentDashboard');
  };
  
  // Format date for display
  const formatDisplayDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
  };
  
  // Get class names for calendar day
  const getDayClass = (day) => {
    let classes = 'position-relative p-2 ';
    
    if (!day.isCurrentMonth) {
      classes += 'text-muted ';
    }
    
    // Highlight selected date
    if (selectedDate && day.date.toISOString().split('T')[0] === selectedDate) {
      classes += 'bg-primary text-white rounded ';
    }
    
    // Show which days the tutor is available
    if (day.isCurrentMonth && availability && day.dayName) {
      const dayAvail = availability[day.dayName];
      if (dayAvail && dayAvail.available && dayAvail.slots && dayAvail.slots.length > 0) {
        classes += day.date.toISOString().split('T')[0] === selectedDate ? '' : 'border-primary ';
      }
    }
    
    // Disable past dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (day.date < today) {
      classes += 'text-decoration-line-through bg-light ';
    }
    
    return classes;
  };
  
  return (
    <div className="booking-calendar">
      {error && (
        <div className="alert alert-danger mb-3" role="alert">
          {error}
        </div>
      )}
      
      <div className="row">
        <div className="col-md-7">
          {/* Calendar Header */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="mb-0">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h4>
            <div className="btn-group">
              <button 
                type="button" 
                className="btn btn-outline-secondary"
                onClick={prevMonth}
              >
                <i className="bi bi-chevron-left"></i>
              </button>
              <button 
                type="button" 
                className="btn btn-outline-secondary"
                onClick={nextMonth}
              >
                <i className="bi bi-chevron-right"></i>
              </button>
            </div>
          </div>
          
          {/* Calendar Grid */}
          <div className="card mb-4">
            <div className="card-body p-0">
              {/* Weekday Headers */}
              <div className="row g-0 text-center">
                {dayNames.map((day, index) => (
                  <div key={index} className="col border-bottom p-2">
                    <small>{day.substring(0, 3)}</small>
                  </div>
                ))}
              </div>
              
              {/* Calendar Days */}
              <div className="calendar-grid">
                {calendarDays.length > 0 && (
                  <div className="row g-0">
                    {calendarDays.map((day, index) => (
                      <div
                        key={index}
                        className={`col text-center border ${getDayClass(day)}`}
                        onClick={() => handleDateSelect(day)}
                        style={{ cursor: 'pointer', height: '60px' }}
                      >
                        {day.day}
                        
                        {/* Availability Indicator */}
                        {day.isCurrentMonth && availability && day.dayName && 
                          availability[day.dayName]?.available && 
                          availability[day.dayName]?.slots?.length > 0 && 
                          day.date >= new Date().setHours(0, 0, 0, 0) && (
                            <div 
                              className="position-absolute bottom-0 start-50 translate-middle-x mb-1"
                              style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: day.date.toISOString().split('T')[0] === selectedDate ? 'white' : '#0d6efd' }}
                            ></div>
                          )
                        }
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Selected Date and Available Slots */}
          {selectedDate && (
            <div className="mb-4">
              <h5>Available Times on {formatDisplayDate(selectedDate)}</h5>
              
              {loading ? (
                <div className="d-flex justify-content-center my-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : availableSlots.length > 0 ? (
                <div className="row g-2">
                  {availableSlots.map((slot, index) => (
                    <div key={index} className="col-md-4 col-6">
                      <button
                        type="button"
                        className={`btn btn-outline-primary w-100 ${selectedSlot === slot ? 'active' : ''}`}
                        onClick={() => handleSlotSelect(slot)}
                      >
                        {slot.start} - {slot.end}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="alert alert-warning" role="alert">
                  No available slots on this date.
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="col-md-5">
          {/* Booking Form */}
          {showBookingForm && selectedSlot && (
            <BookingForm
              tutorId={tutorId}
              tutorName={tutorName}
              studentId={currentUser.uid}
              date={selectedDate}
              startTime={selectedSlot.start}
              endTime={selectedSlot.end}
              hourlyRate={hourlyRate}
              onBookingSuccess={handleBookingSuccess}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingCalendar;