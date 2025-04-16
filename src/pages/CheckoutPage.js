import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from '@stripe/react-stripe-js';
import { useRouter } from 'next/router';
import styles from '../styles/CheckoutPage.module.css';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
);

function CheckoutPage() {
  const [clientSecret, setClientSecret] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const secret = localStorage.getItem('checkoutClientSecret');
    const tutorUid = localStorage.getItem('checkoutTutorUid');
    // On a project we'd deploy, we should probably make it clear this data from
    // local storage afterwards, but this is just for a class project, so I'm
    // thinking I'll just leave it as is

    if (!secret) {
      if (tutorUid) {
        router.push(`/tutors/${tutorUid}`); // Assuming this is the structure for our tutor profile routing; may need to modify if not
      } else {
        router.push(`/tutors`);
      }
      return;
    }
    setClientSecret(secret);
    return () => {
      localStorage.removeItem('checkoutClientSecret');
    };
  }, [router]);

  const handleCancel = () => {
    const tutorUid = localStorage.getItem('checkoutTutorUid');
    if (tutorUid) {
      router.push(`/tutors/${tutorUid}`);
    } else {
      router.push(`/tutors`);
    }
  };

  if (!clientSecret) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.checkoutContainer}>
      <h1>Complete Your Booking</h1>

      <div className={styles.checkout}>
        <EmbeddedCheckoutProvider
          stripe={stripePromise}
          options={{ clientSecret }}
        >
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      </div>

      <button onClick={handleCancel} className={styles.cancelButton}>
        Cancel
      </button>
    </div>
  );
}

export default CheckoutPage;
