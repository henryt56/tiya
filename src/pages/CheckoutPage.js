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
	const [tutorInfo, setTutorInfo] = useState({
		uid: '',
		displayName: '',
	});

	const router = useRouter();

	useEffect(() => {
		const secret = localStorage.getItem('checkoutClientSecret');
		const tutorUid = localStorage.getItem('checkoutTutorUid');
		const tutorName = localStorage.getItem('tutorDisplayName');

		if (!secret) {
			if (tutorUid) {
				router.push(`/TutorPublicProfile?id=${tutorUid}`); // Assuming this is the structure for our tutor profile routing; may need to modify if not
			} else {
				router.push(`/Search`);
			}
			return;
		}
		setClientSecret(secret);
		setTutorInfo({
			uid: tutorUid,
			displayName: tutorName,
		});

		return () => {
			localStorage.removeItem('checkoutClientSecret');
		};
	}, [router]);

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
		</div>
	);
}

export default CheckoutPage;
