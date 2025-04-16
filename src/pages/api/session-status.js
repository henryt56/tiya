import Stripe from 'stripe';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const getSessionStatus = async (req, res) => {
  if (req.method === 'GET') {
    try {
      const session = await stripe.checkout.sessions.retrieve(
        req.query.session_id,
      );

      if (session.status === 'complete') {
        const { tutorUid, studentUid, bookingDateTime, duration, subject } =
          session.metadata;

        const bookingId = `booking_${session.id}`;

        await setDoc(doc(db, 'bookings', bookingId), {
          tutorUid,
          studentUid,
          subject,
          bookingDateTime: Timestamp.fromDate(new Date(bookingDateTime)),
          duration: parseInt(duration),
          paymentStatus: 'completed',
          paymentId: session.id,
          createdAt: Timestamp.now(),
          amount: parseInt(session.amount_total) / 100,
          customerEmail: session.customer_details?.email,
        });
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
