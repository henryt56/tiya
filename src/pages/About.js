import React from 'react';
import { FaUsers, FaGraduationCap, FaHandshake, FaLightbulb, FaMountain } from 'react-icons/fa';
import styles from '../styles/About.module.css';

function About() {
  return (
    <div className={styles.aboutPage}>
      <h1 className={styles.pageTitle}>About Us</h1>
      
      <section className={styles.missionSection}>
        <div className={styles.missionContent}>
          <h2>Our Mission</h2>
          <div className={styles.missionStatement}>
            <p>
              At TIYA (Tutors In Your Area), our mission is to revolutionize the way students and tutors connect, 
              making quality education more accessible to everyone. We believe that every student deserves 
              personalized support that suits their unique learning style and academic needs.
            </p>
            <p>
              We're dedicated to building a platform that empowers both students and educators, creating a 
              community where knowledge is shared, skills are developed, and academic goals are achieved.
            </p>
          </div>
          
          <div className={styles.valuesContainer}>
            <div className={styles.valueItem}>
              <div className={styles.valueIcon}>
                <FaUsers />
              </div>
              <h3>Community Focus</h3>
              <p>Building connections between students and qualified tutors within local communities.</p>
            </div>
            
            <div className={styles.valueItem}>
              <div className={styles.valueIcon}>
                <FaGraduationCap />
              </div>
              <h3>Educational Excellence</h3>
              <p>Promoting high-quality tutoring that helps students achieve their full potential.</p>
            </div>
            
            <div className={styles.valueItem}>
              <div className={styles.valueIcon}>
                <FaHandshake />
              </div>
              <h3>Meaningful Partnerships</h3>
              <p>Creating lasting connections between students and tutors that extend beyond single sessions.</p>
            </div>
          </div>
        </div>
      </section>
      
      <section className={styles.storySection}>
        <h2>Our Story</h2>
        <div className={styles.storyContent}>
          <div className={styles.storyImageWrapper}>
            <div className={styles.storyImage}>
              <FaLightbulb className={styles.storyIcon} />
            </div>
          </div>
          
          <div className={styles.storyText}>
            <p>
              The legend of TIYA began in the hallowed halls of Georgia State University, where five 
              determined computer science students found themselves united by a common frustration: the 
              disconnect between students needing academic help and qualified tutors ready to provide it.
            </p>
            
            <p>
              Their journey was not for the faint of heart. Through countless sleepless nights fueled by nothing 
              but determination and an alarming amount of caffeine, they faced the dragons of complex algorithms 
              and the mountains of database architecture. When conventional coding methods failed them, they 
              trekked to the digital volcano of innovation, where they forged their code in the molten lava of 
              cutting-edge technology.
            </p>
            
            
            <p>
              After battling through the wilderness of web development, conquering the beasts of backend 
              integration, and navigating the treacherous seas of user experience design, TIYA was born – not 
              just as a platform, but as a testament to their unyielding spirit and vision of a world where 
              educational support is just a click away.
            </p>
            
            <p>
              Today, TIYA stands as a monument to their journey – a digital bridge connecting eager minds with 
              knowledgeable guides, built on the foundation of resilience, innovation, and an unwavering belief 
              in the power of education.
            </p>
          </div>
        </div>
      </section>
      
      <section className={styles.teamSection}>
        <h2>Meet Our Team</h2>
        <div className={styles.teamIntro}>
          <p>
            The creators of TIYA are five passionate computer science students from Georgia State University 
            who combined their diverse skills and shared vision to build this platform.
          </p>
        </div>
        
        <div className={styles.teamGrid}>
          <div className={styles.teamMember}>
            <div className={styles.memberAvatar}>
              <FaMountain className={styles.avatarIcon} />
            </div>
            <h3>Kenny Pham</h3>
            <p>Payment Processing Pro</p>
            <p>Integrated Stripe for payment processing.</p>
          </div>
          
          <div className={styles.teamMember}>
            <div className={styles.memberAvatar}>
              <FaMountain className={styles.avatarIcon} />
            </div>
            <h3>Niko Avradopoulos</h3>
            <p>Admin Architect</p>
            <p>Created the admin and report systems.</p>
          </div>
          
          <div className={styles.teamMember}>
            <div className={styles.memberAvatar}>
              <FaMountain className={styles.avatarIcon} />
            </div>
            <h3>Simone Lattimore</h3>
            <p>Searching Savant</p>
            <p>Implemented the searching and filtering options.</p>
          </div>
          
          <div className={styles.teamMember}>
            <div className={styles.memberAvatar}>
              <FaMountain className={styles.avatarIcon} />
            </div>
            <h3>Henry Truong</h3>
            <p>Project Manager</p>
            <p>Completed session handling, along with the log in page and student dashboard.</p>
          </div>
          
          <div className={styles.teamMember}>
            <div className={styles.memberAvatar}>
              <FaMountain className={styles.avatarIcon} />
            </div>
            <h3>Jimmy Dang</h3>
            <p>Moral Support Specialist</p>
            <p>Brought muffins to the presentation.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;