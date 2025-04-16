import Stripe from 'stripe';
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || 'http://localhost:3000';

const createCheckoutSession = async (req, res) => {
  if (req.method === 'POST') {
    try {
      const { tutorId, studentId, dateTime, duration } = req.body;

      const tutorDoc = await getDoc(doc(db, 'users', tutorId));
      if (!tutorDoc.exists()) {
        return res.status(404).json({ error: 'Tutor not found' });
      }

      const studentDoc = await getDoc(doc(db, 'users', studentId));
      if (!studentDoc.exists()) {
        return res.status(404).json({ error: 'Student not found' });
      }

      // "Tutors" collection in our db doesn't have an associated uid since we're using
      // hardcoded tutors, so query needed here
      const tutorRef = collection(db, 'tutors');
      const q = query(tutorRef, where('uid', '==', tutorId));
      const tutorQuerySnapshot = await getDocs(q);

      if (tutorQuerySnapshot.empty) {
        return res.status(404).json({ error: 'Tutor details not found' });
      }

      const tutorData = tutorQuerySnapshot.docs[0].data();
      const tutorUserData = tutorDoc.data();
      const studentData = studentDoc.data();

      const hourlyRate = tutorData.price;
      const amountInCents = Math.round(hourlyRate * (duration / 60) * 100);

      const session = await stripe.checkout.session.create({
        ui_mode: 'embedded',
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `Session with ${tutorUserData.displayName}`,
                description: `${duration} minute tutoring session on ${new Date(datetime).toLocaleString()}`,
              },
              unit_amount: amountInCents,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        return_url: `${DOMAIN}/return?session_id={CHECKOUT_SESSION_ID}`,
        metadata: {
          tutorUid: tutorUserData.uid,
          tutorName: tutorUserData.displayName,
          tutorEmail: tutorUserData.email,
          studentUid: studentData.uid,
          studentName: studentData.displayName,
          studentEmail: studentData.email,
          subject: tutorData.subject,
          bookingDateTime: dateTime,
          duration,
          hourlyRate,
        },
      });

      res.status(200).json({ clientSecret: session.client_secret });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
};

export default createCheckoutSession;
