import { useState, useEffect } from 'react';
import { useRouter } from 'react';
import Link from 'next/link';

function ReturnPage() {
  const [status, setStatus] = useState(null);
  const [bookingDetails, setBookingDetails] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;

    const { session_id } = router.query;
    if (!session_id) return;

    fetch(`/api/session-status?session_id=${session_id}`)
      .then((res) => res.json())
      .then((data) => {
        setStatus(data.status);
        setBookingDetails(data.booking_details);
      })
      .catch((error) => {
        console.log('Error fetching session status:', error);
      });
  }, [router.isReady, router.query]);

  if (!status) {
    return <div>Checking payment status...</div>;
  }

  if (status === 'open') {
    router.push('/CheckoutPage');
    return null;
  }

  if (status === 'complete') {
    return (
      <div className={styles.successContainer}>
        <h1>Booking Confirmed!</h1>

        {bookingDetails && (
          <div className={styles.bookingDetails}>
            <h2>Your booking details:</h2>
            <p>
              <strong>Tutor:</strong> {bookingDetails.tutorName}
            </p>
            <p>
              <strong>Date & Time:</strong>{' '}
              {new Date(bookingDetails.bookingDateTime).toLocale()}
            </p>
            <p>
              <strong>Duration:</strong> {bookingDetails.duration} minutes
            </p>
            <p>
              <strong>Subject:</strong> {bookingDetails.subject}
            </p>
          </div>
        )}

        <p>
          A confirmation email will be sent to your registered email address. If
          you have any questions, please reach out via our Contact page.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.error}>
      <h1>Payment Not Completed</h1>
      <p>
        Your booking has not been confirmed. Please try again or contact
        support.
      </p>
      <Link href="/HomePage">
        <a className={styles.returnButton}>Return to Home</a>
      </Link>
    </div>
  );
}

export default ReturnPage;
