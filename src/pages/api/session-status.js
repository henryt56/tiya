import Stripe from 'stripe';
import { doc, Timestamp, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const getSessionStatus = async (req, res) => {
	if (req.method === 'GET') {
		try {
			const session = await stripe.checkout.sessions.retrieve(
				req.query.session_id,
			);

			if (session.status === 'complete') {
				const { sessionId, tutorUid, studentUid } = session.metadata;

				if (sessionId) {
					try {
						const sessionRef = doc(db, 'sessions', sessionId);
						const sessionDoc = await getDoc(sessionRef);

						if (sessionDoc.exists()) {
							const sessionData = sessionDoc.data();

							if (
								sessionData.tutorId === tutorUid &&
								sessionData.studentId === studentUid
							) {
								await updateDoc(sessionRef, {
									paymentStatus: 'paid',
									paymentId: session.payment_intent || session.id,
									updatedAt: Timestamp.now(),
								});

								console.log(`Updated session ${sessionId} with payment info`);
							} else {
								console.error('Session user IDs do not match payment data');
							}
						} else {
							console.error(`Session ${sessionId} not found in db`);
						}
					} catch (e) {
						console.error('Error updating session with payment infO:', e);
					}
				}
			}
			res.status(200).json({
				status: session.status,
				customer_email: session.customer_details?.email,
				booking_details: session.metadata,
			});
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	} else {
		res.setHeader('Allow', 'GET');
		res.status(405).end('Method Not Allowed');
	}
};

export default getSessionStatus;
