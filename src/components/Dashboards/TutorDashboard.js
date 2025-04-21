import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import styles from '../../styles/TutorDashboard.module.css';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useRouter } from 'next/router';
import SessionManagement from './SessionManagement';
import { useAuth } from '../../services/context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

const TutorDashboard = () => {
  const router = useRouter();
  const [date, setDate] = useState(new Date());
  const { currentUser } = useAuth();
  const [tutorName, setTutorName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser && currentUser.uid) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log('User data:', userData);
            if (userData.displayName) {
              setTutorName(userData.displayName);
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser]);

  const horizontalData = [
    { student: 'Student A', reviews: 4 },
    { student: 'Student B', reviews: 5 },
    { student: 'Student C', reviews: 3 },
    { student: 'Student D', reviews: 4 },
  ];

  return (
    <div className={styles.dashboard}>
      <h1>
        Welcome, {loading ?
          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> :
          tutorName || 'Tutor'} 👋
      </h1>

      {/* Session Management */}
      <SessionManagement />

      {/* Profile Management */}
      <div className={styles.profileSpacing}>
        <div className="card mb-4 shadow-sm">
          <div className="card-header bg-white d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Profile Management</h5>
          </div>
          <div className="card-body">
            <p>Update your tutor profile information, availability, and certifications.</p>
            <button
              className="btn btn-primary"
              onClick={() => router.push('/TutorProfile')}
            >
              Update Profile
            </button>
          </div>
        </div>
      </div>

      {/* Grid with Calendar and Reviews */}
      <div className={styles.grid}>
        <section className={`${styles.section} ${styles.calendarSection}`}>
          <h2>Calendar</h2>
          <Calendar onChange={setDate} value={date} />
        </section>

        <section className={styles.section}>
          <h2>Student Reviews</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart layout="vertical" data={horizontalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                domain={[0, 5]}
                ticks={[0, 1, 2, 3, 4, 5]}
              />

              <YAxis type="category" dataKey="student" />
              <Tooltip />
              <Bar dataKey="reviews" fill="#ffa07a" radius={[0, 10, 10, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>
      </div>
    </div>
  );
};

export default TutorDashboard;
