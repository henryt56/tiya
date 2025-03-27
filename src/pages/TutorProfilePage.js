import { useState, useEffect } from "react";
import { db } from "../firebaseConfig.js";
import Content from "../components/TutorProfile/tutorprofilecontent";
import Footer from "../components/TutorProfile/footer.js";
import Header from "../components/TutorProfile/header.js";
import Sidebar from "../components/TutorProfile/sidebar";
import styles from "../components/TutorProfile/tutorProfile.module.css";

function TutorProfilePage({ tutor, error, tutorId }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tutor || error) {
      setLoading(false);
    }
  }, [tutor, error]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className={styles.container}>
      <Header
        name={tutor.name}
        profilePicture={tutor.profilePicture}
        bio={tutor.bio}
      />
      <div className={styles.profileMain}>
        <Sidebar availability={tutor.availability} tutorId={tutorId} />
        <Content
          languages={tutor.languages}
          subjects={tutor.subjects}
          certifications={tutor.certifications}
          reviews={tutor.reviews} // Make sure Content can handle missing reviews
        />
      </div>
      <Footer />
    </div>
  );
}

export async function getServerSideProps(context) {
  try {
    const tutorId = context.query.tutorId;

    const tutorDoc = await db.collection("tutors").doc(tutorId).get();

    if (tutorDoc.exists) {
      const tutorData = tutorDoc.data();
      return {
        props: {
          tutor: tutorData,
          tutorId: tutorId,
        },
      };
    } else {
      return { props: { error: "Tutor not found" } };
    }
  } catch (err) {
    console.error("Error fetching tutor data:", err);
    return { props: { error: "Error fetching tutor data" } };
  }
}

export default TutorProfilePage;
