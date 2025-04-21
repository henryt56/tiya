import Stripe from 'stripe';
import admin from '../../services/utilities/firebaseAdmin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || 'http://localhost:3000';

const db = admin.firestore();

const createCheckoutSession = async (req, res) => {
	if (req.method === 'POST') {
		console.log('Request body:', req.body);
		try {
			const { sessionId } = req.body;
			const sessionDoc = await db.collection('sessions').doc(sessionId).get();

			if (!sessionDoc.exists) {
				return res.status(404).json({ error: 'Session not found' });
			}

			const sessionData = sessionDoc.data();

			const hourlyRate = sessionData.price || 0;
			const duration = sessionData.duration || 1; // duration is stored as hours
			const amountInCents = Math.round(hourlyRate * duration * 100);

			let formattedDate;

			if (sessionData.date && sessionData.date.toDate) {
				formattedDate = sessionData.date.toDate().toLocaleString();
			} else {
				formattedDate = 'Scheduled session';
			}

			console.log('Creating stripe session with:', {
				tutorName: sessionData.tutorName,
				amount: amountInCents,
				formattedDate,
			});

			const session = await stripe.checkout.sessions.create({
				ui_mode: 'embedded',
				line_items: [
					{
						price_data: {
							currency: 'usd',
							product_data: {
								name: `Session with ${sessionData.tutorName}`,
								description: `${duration * 60} minute tutoring session on ${formattedDate}`,
							},
							unit_amount: amountInCents,
						},
						quantity: 1,
					},
				],
				mode: 'payment',
				return_url: `${DOMAIN}/return?session_id={CHECKOUT_SESSION_ID}`,
				metadata: {
					sessionId: sessionId,
					tutorId: sessionData.tutorId,
					studentId: sessionData.studentId,
					subject: sessionData.subject || '',
				},
			});

			console.log('Stripe session created successfully:', session.id);

			res
				.status(200)
				.json({ clientSecret: session.client_secret, sessionId: session.id });
		} catch (error) {
			console.error('Details:', error);
			res.status(500).json({ error: error.message });
		}
	} else {
		res.setHeader('Allow', 'POST');
		res.status(405).end('Method Not Allowed');
	}
};

export default createCheckoutSession;
