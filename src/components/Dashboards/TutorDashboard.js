import React, { useState } from 'react';
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

const TutorDashboard = () => {
  const [date, setDate] = useState(new Date());

  const verticalData = [
    { month: 'Jan', sessions: 12 },
    { month: 'Feb', sessions: 18 },
    { month: 'Mar', sessions: 10 },
    { month: 'Apr', sessions: 22 },
    { month: 'May', sessions: 15 },
  ];

  const horizontalData = [
    { student: 'Student A', reviews: 4 },
    { student: 'Student B', reviews: 5 },
    { student: 'Student C', reviews: 3 },
    { student: 'Student D', reviews: 4 },
  ];

  return (
    <div className={styles.dashboard}>
      <h1>Welcome, Tutor 👋</h1>

      <div className={styles.grid}>
        <section className={styles.section}>
          <h2>Upcoming / Past Sessions</h2>
          <ul className={styles.sessionList}>
            <li className={styles.upcoming}>April 10 – Student A: Math Practice</li>
            <li className={styles.upcoming}>April 12 – Student B: Reading</li>
            <li className={styles.past}>April 1 – Student C: Algebra review</li>
            <li className={styles.past}>March 29 – Student D: SAT Prep</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>Students</h2>
          <ul className={styles.studentList}>
            <li>Student 1</li>
            <li>Student 2</li>
            <li>Student 3</li>
            <li>Student 4</li>
          </ul>
        </section>

        <section className={`${styles.section} ${styles.calendarSection}`}>
          <h2>Calendar</h2>
          <Calendar onChange={setDate} value={date} />
        </section>

        <section className={styles.section}>
          <h2>Monthly Sessions</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={verticalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sessions" fill="#66c0ff" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>

        <section className={styles.section}>
          <h2>Student Reviews</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart layout="vertical" data={horizontalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="student" />
              <Tooltip />
              <Bar dataKey="reviews" fill="#ffa07a" radius={[0, 10, 10, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>

        <section className={styles.section}>
          <h2>Certifications</h2>
          <div className={styles.certificationBox}>
            <p>Upload your tutoring certifications 📤</p>
            <button className={styles.certBtn}>Upload Certification</button>
          </div>
        </section>
      </div>

      <button className={styles.reportBtn}>Make a Report</button>
    </div>
  );
};

export default TutorDashboard;
