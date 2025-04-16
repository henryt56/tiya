import { useRouter } from 'next/router';
import { useAuth } from '../../services/context/AuthContext';
import styles from './CheckoutButton.module.css';

// This is what should be implemented on every tutor's profile page, i.e.,
// Student selects Tutor Profile
// Student selects from tutor's availability on the calendar
// Prompts CheckoutButton
const CheckoutButton = ({ tutorUid, selectedDateTime, duration }) => {
  const router = useRouter();
  const { currentUser } = useAuth();

  const handleCheckout = async () => {
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tutorUid,
          studentUid: currentUser.uid,
          dateTime: selectedDateTime, // This will be the timeslot/session the student selects from tutor profile
          duration,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { clientSecret } = await response.json();

      localStorage.setItem('checkoutClientSecret', clientSecret);
      localStorage.setItem('checkoutTutorUid', tutorUid);

      router.push('/Checkout');
    } catch (error) {
      console.log('Error initiating checkout:', error);
      // Going to have it return a display on the page eventually
    }
  };

  return (
    <button
      onClick={handleCheckout}
      className={styles.checkoutButton}
      disabled={!selectedDateTime}
    >
      Proceed to Checkout
    </button>
  );
};

export default CheckoutButton;
