import React, { useState, useEffect } from 'react';
import { collection, addDoc, Timestamp, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig';

// Create a simple email notification function
export const sendEmailNotification = async (emailData) => {
  try {
    // In a real implementation, this would call an API endpoint
    console.log('Sending email notification:', emailData);
    return true;
  } catch (error) {
    console.error('Error sending email notification:', error);
    return false;
  }
};

const BookSession = ({ tutorId, onSessionBooked, onBackToSearch }) => {
  const [step, setStep] = useState('tutor-profile'); // 'tutor-profile', 'time-selection', 'payment-confirmation'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [tutorDetails, setTutorDetails] = useState(null);
  const [hourlyRate, setHourlyRate] = useState(0);
  const [stripePaymentIntent, setStripePaymentIntent] = useState(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [cardError, setCardError] = useState(null);
  
  // Import Stripe elements (would typically be done at the top of the file)
  // import { loadStripe } from '@stripe/stripe-js';
  // import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
  // const stripePromise = loadStripe('your_publishable_key');

  // Fetch tutor details and available slots
  useEffect(() => {
    const fetchTutorData = async () => {
      setLoading(true);
      try {
        // Fetch tutor details
        const tutorRef = doc(db, 'tutors', tutorId);
        const tutorSnap = await getDoc(tutorRef);
        
        if (tutorSnap.exists()) {
          setTutorDetails(tutorSnap.data());
          setHourlyRate(tutorSnap.data().hourlyRate || 0);
        } else {
          setError('Tutor not found');
          return;
        }
        
        // Fetch available slots
        const availabilityRef = collection(db, 'tutorAvailability');
        const q = query(availabilityRef, where('tutorId', '==', tutorId));
        const querySnapshot = await getDocs(q);
        
        const slots = [];
        querySnapshot.forEach((doc) => {
          slots.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        setAvailableSlots(slots);
        setError(null);
      } catch (err) {
        setError('Failed to fetch tutor data. Please try again.');
        console.error('Error fetching tutor data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (tutorId) {
      fetchTutorData();
    }
  }, [tutorId]);

  const handleTimeSelection = (e) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTime || !subject) {
      setError('Please fill in all required fields');
      return;
    }
    
    // Move to payment confirmation step
    setError(null);
    setStep('payment-confirmation');
  };

  // Create Stripe payment intent when user moves to payment step
  useEffect(() => {
    const createPaymentIntent = async () => {
      if (step === 'payment-confirmation' && selectedDate && selectedTime) {
        try {
          setLoading(true);
          // Calculate session duration and total amount
          const sessionDuration = 1; // hours, could be dynamic based on selected slot
          const amountInCents = Math.round(hourlyRate * sessionDuration * 100);
          
          // Call your backend API to create a payment intent
          const response = await fetch('/api/create-payment-intent', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              amount: amountInCents,
              tutorId,
              date: selectedDate,
              time: selectedTime,
              userId: auth.currentUser?.uid
            }),
          });
          
          const data = await response.json();
          
          if (data.error) {
            throw new Error(data.error);
          }
          
          setStripePaymentIntent(data.clientSecret);
          setError(null);
        } catch (err) {
          setError('Failed to initialize payment. Please try again.');
          console.error('Error creating payment intent:', err);
        } finally {
          setLoading(false);
        }
      }
    };
    
    createPaymentIntent();
  }, [step, selectedDate, selectedTime, hourlyRate, tutorId]);

  const handlePaymentConfirmation = async (e) => {
    e.preventDefault();
    
    setPaymentProcessing(true);
    setError(null);
    setCardError(null);
    
    try {
      // In a real implementation, these would be imported at top of file
      // and accessed via React hooks
      const stripe = useStripe();
      const elements = useElements();
      
      if (!stripe || !elements) {
        throw new Error('Stripe has not been initialized');
      }
      
      const userId = auth.currentUser?.uid;
      
      if (!userId) {
        setError('You must be logged in to book a session');
        setPaymentProcessing(false);
        return;
      }
      
      // Confirm card payment
      const result = await stripe.confirmCardPayment(stripePaymentIntent, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            email: auth.currentUser.email,
          },
        }
      });
      
      if (result.error) {
        setCardError(result.error.message);
        throw new Error(result.error.message);
      }
      
      // Payment successful, create the session in Firestore
      const sessionDateTime = new Date(`${selectedDate}T${selectedTime}`);
      
      // Create a new booking in Firestore
      const sessionsRef = collection(db, 'sessions');
      const newSession = await addDoc(sessionsRef, {
        tutorId,
        userId,
        subject,
        description,
        sessionDateTime: Timestamp.fromDate(sessionDateTime),
        status: 'confirmed',
        paymentIntent: result.paymentIntent.id,
        paymentStatus: result.paymentIntent.status,
        hourlyRate,
        createdAt: Timestamp.now()
      });
      
      // Send confirmation email
      await sendEmailNotification({
        to: auth.currentUser.email,
        subject: 'Tutoring Session Confirmation',
        template: 'session-confirmation',
        data: {
          sessionId: newSession.id,
          tutorName: tutorDetails.name,
          date: selectedDate,
          time: selectedTime,
          subject,
          paymentId: result.paymentIntent.id
        }
      });
      
      // Call the callback function with the new session ID
      if (onSessionBooked) {
        onSessionBooked(newSession.id);
      }
      
      // Reset form and state
      setSelectedDate('');
      setSelectedTime('');
      setSubject('');
      setDescription('');
      setStripePaymentIntent(null);
      setStep('tutor-profile');
      
    } catch (err) {
      if (!cardError) {
        setError('Failed to process payment. Please try again.');
      }
      console.error('Error processing payment:', err);
    } finally {
      setPaymentProcessing(false);
    }
  };

  const handleBookSessionClick = () => {
    setStep('time-selection');
  };

  const renderTutorProfile = () => {
    if (!tutorDetails) return <div>Loading tutor profile...</div>;
    
    return (
      <div className="tutor-profile" data-testid="tutor-profile">
        <div className="back-link">
          <button onClick={onBackToSearch} data-testid="back-to-search">
            &larr; Back to Search
          </button>
        </div>
        
        <h2>{tutorDetails.name}</h2>
        
        <div className="tutor-info">
          <div className="tutor-ratings">
            <span>Rating: {tutorDetails.rating} / 5</span>
            <span>({tutorDetails.reviewCount} reviews)</span>
          </div>
          
          <div className="tutor-experience">
            <h3>Experience</h3>
            <p>{tutorDetails.experience}</p>
          </div>
          
          <div className="tutor-subjects">
            <h3>Subjects</h3>
            <ul>
              {tutorDetails.subjects && tutorDetails.subjects.map((subject, idx) => (
                <li key={idx}>{subject}</li>
              ))}
            </ul>
          </div>
          
          <div className="tutor-rate">
            <h3>Hourly Rate</h3>
            <p>${hourlyRate.toFixed(2)}</p>
          </div>
          
          <div className="tutor-availability">
            <h3>Availability</h3>
            <p>
              {availableSlots.length > 0 
                ? `Available on ${availableSlots.length} days` 
                : 'No available slots'}
            </p>
          </div>
        </div>
        
        <button 
          onClick={handleBookSessionClick} 
          disabled={loading || availableSlots.length === 0}
          className="book-session-btn"
          data-testid="book-session-button"
        >
          Book Session
        </button>
      </div>
    );
  };

  const renderTimeSelection = () => {
    return (
      <div className="time-selection" data-testid="time-selection">
        <h2>Select a Time Slot</h2>
        
        {error && <div className="error-message" data-testid="error-message">{error}</div>}
        
        <form onSubmit={handleTimeSelection} data-testid="time-selection-form">
          <div className="form-group">
            <label htmlFor="date">Date *</label>
            <input
              type="date"
              id="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              required
              data-testid="date-input"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="time">Time *</label>
            <select
              id="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              required
              data-testid="time-select"
            >
              <option value="">Select a time</option>
              {availableSlots
                .filter(slot => slot.date === selectedDate)
                .map(slot => slot.times.map(time => (
                  <option key={time} value={time}>{time}</option>
                )))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="subject">Subject *</label>
            <input
              type="text"
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              data-testid="subject-input"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              data-testid="description-input"
            />
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              onClick={() => setStep('tutor-profile')}
              className="back-btn"
              data-testid="back-to-profile"
            >
              Back
            </button>
            
            <button 
              type="submit" 
              disabled={loading}
              data-testid="continue-to-payment"
            >
              Continue to Payment
            </button>
          </div>
        </form>
      </div>
    );
  };

  const renderPaymentConfirmation = () => {
    return (
      <div className="payment-confirmation" data-testid="payment-confirmation">
        <h2>Confirm Payment</h2>
        
        {error && <div className="error-message" data-testid="error-message">{error}</div>}
        {cardError && <div className="card-error" data-testid="card-error">{cardError}</div>}
        
        <div className="booking-summary">
          <h3>Booking Summary</h3>
          <p><strong>Tutor:</strong> {tutorDetails?.name}</p>
          <p><strong>Date:</strong> {selectedDate}</p>
          <p><strong>Time:</strong> {selectedTime}</p>
          <p><strong>Subject:</strong> {subject}</p>
          <p><strong>Rate:</strong> ${hourlyRate.toFixed(2)} per hour</p>
          <p><strong>Total:</strong> ${hourlyRate.toFixed(2)}</p>
        </div>
        
        {/* This would typically be wrapped in a Stripe Elements component */}
        {/* <Elements stripe={stripePromise}> */}
        <form onSubmit={handlePaymentConfirmation} data-testid="payment-form">
          <div className="form-group">
            <label htmlFor="card-element">Credit or Debit Card</label>
            {/* CardElement would be rendered here in a real implementation */}
            <div 
              className="card-element-container" 
              data-testid="stripe-card-element"
            >
              {/* Visual representation of card input for demo purposes */}
              <div className="stripe-card-mock">
                <input 
                  type="text" 
                  placeholder="4242 4242 4242 4242" 
                  className="card-number-input" 
                />
                <div className="card-details">
                  <input type="text" placeholder="MM/YY" className="card-expiry-input" />
                  <input type="text" placeholder="CVC" className="card-cvc-input" />
                </div>
              </div>
            </div>
            {cardError && <div className="card-error">{cardError}</div>}
          </div>
          
          <div className="payment-actions">
            <button 
              type="button" 
              onClick={() => setStep('time-selection')}
              className="back-btn"
              data-testid="back-to-time-selection"
            >
              Back
            </button>
            
            <button 
              type="submit" 
              disabled={paymentProcessing || loading || !stripePaymentIntent}
              data-testid="confirm-payment"
            >
              {paymentProcessing ? 'Processing Payment...' : loading ? 'Loading...' : 'Pay Now'}
            </button>
          </div>
        </form>
        {/* </Elements> */}
      </div>
    );
  };

  // Render based on current step
  return (
    <div className="book-session-container">
      {step === 'tutor-profile' && renderTutorProfile()}
      {step === 'time-selection' && renderTimeSelection()}
      {step === 'payment-confirmation' && renderPaymentConfirmation()}
    </div>
  );
};

export default BookSession;