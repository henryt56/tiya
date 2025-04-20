import { useRouter } from 'next/router';
import { useState } from 'react';

const CheckoutButton = ({ tutorId, dateTime, sessionId, tutorName }) => {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	const handleCheckout = async () => {
		try {
			setIsLoading(true);

			const response = await fetch('/api/create-checkout-session', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					sessionId: sessionId,
				}),
			});

			if (!response.ok) {
				throw new Error('Failed to create checkout session');
			}

			const { clientSecret } = await response.json();

			localStorage.setItem('checkoutClientSecret', clientSecret);
			localStorage.setItem('checkoutTutorUid', tutorId);
			localStorage.setItem('tutorDisplayName', tutorName || '');

			router.push('/CheckoutPage');
		} catch (e) {
			alert('Error initiating checkout:', e);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<button
			onClick={handleCheckout}
			className="btn btn-outline-primary btn-sm"
			disabled={!dateTime || isLoading}
		>
			{isLoading ? 'Processing...' : 'Make Payment'}
		</button>
	);
};

export default CheckoutButton;
