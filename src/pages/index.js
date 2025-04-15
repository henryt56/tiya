import styles from '../styles/HomePage.module.css';
import Image from 'next/image';
import image from '../../public/images/student-studying.png';
import SearchBar from '../components/SearchBar/SearchBar';
import { useRouter } from 'next/router';

function HomePage() {
  const router = useRouter();
  return (
    <div className={styles.container}>
      <div className={styles.topsection}>
        <h1>24/7 Study Help Made Easy</h1>
        <p>
          With flexible pricing options and no long-term commitments, we make
          learning accessible to everyone. Choose your preferred tutor and
          schedule sessions at your convenience.
        </p>
      </div>
      <div className={styles.midsection}>
        <div className={styles.textColumns}>
          <section className={styles.mission}>
            <h2>Our Mission</h2>
            <p>
              At Tutors In Your Area, TIYA, we believe that education should be
              accessible to everyone, regardless of their location or
              circumstances. Our mission is to connect learners with expert
              tutors in their local communities, offering personalized,
              flexible, and high-quality tutoring services. By empowering
              individuals with the knowledge and support they need, we strive to
              foster a culture of lifelong learning and academic excellence.
            </p>
          </section>
          <section className={styles.services}>
            <h2>Our Services</h2>
            <p>
              TIYA offers a seamless tutoring experience by connecting students
              with expert tutors based on their subject needs, availability, and
              language preferences. Whether you need help with test prep,
              mastering a difficult topic, or ongoing academic support, our
              platform makes it easy to find the right tutor. With a
              user-friendly scheduling system and flexible pricing options, you
              can book one-time sessions or long-term tutoring without
              commitments.
            </p>
          </section>
        </div>
        <button
          className={styles.signUpButton}
          onClick={() => router.push('/Register')}
        >
          SIGN UP TODAY
        </button>
      </div>
      <div className={styles.bottomsection}>
        <section>
          <Image
            src={image}
            className={styles.image}
            alt="An image of a student stying"
            width={300}
            height={300}
          />
          <span className={styles.quote}>
            With over 7 million users, in 2 minutes get a quote and find the
            right tutor for you
          </span>
        </section>
        <section className={styles.buttonSection}>
          <h2>How TIYA works:</h2>
          <button className={styles.stepsBtn}>1. Create an Account</button>
          <button className={styles.stepsBtn}>2. Find your tutor</button>
          <button className={styles.stepsBtn}>3. Start learning</button>
          <SearchBar />
        </section>
      </div>
    </div>
  );
}

export default HomePage;
