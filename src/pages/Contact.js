import React, { useState } from 'react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import styles from '../styles/Contact.module.css';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [formStatus, setFormStatus] = useState({
    submitted: false,
    error: false,
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate form submission
    setFormStatus({
      submitted: true,
      error: false,
      message: 'Thank you for your message! We will get back to you soon.'
    });
    
    // In a real application, you would send the form data to your backend here
    console.log('Form submitted:', formData);
    
    // Reset form after submission
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
  };

  return (
    <div className={styles.contactPage}>
      <h1 className={styles.pageTitle}>Contact Page</h1>
      
      <div className={styles.contactContainer}>
        <div className={styles.contactInfo}>
          <h2>Get in Touch</h2>
          <p>
            Have questions about TIYA or need help finding a tutor? We're here to help you connect with the right tutors in your area.
          </p>
          
          <div className={styles.contactMethods}>
            <div className={styles.contactMethod}>
              <FaPhone className={styles.contactIcon} />
              <div>
                <h3>Phone</h3>
                <p>(123) 456-7890</p>
              </div>
            </div>
            
            <div className={styles.contactMethod}>
              <FaEnvelope className={styles.contactIcon} />
              <div>
                <h3>Email</h3>
                <p>support@tiya.com</p>
              </div>
            </div>
            
            <div className={styles.contactMethod}>
              <FaMapMarkerAlt className={styles.contactIcon} />
              <div>
                <h3>Address</h3>
                <p>123 Education Street<br />Learning City, LC 12345</p>
              </div>
            </div>
          </div>
          
          <div className={styles.supportHours}>
            <h3>Support Hours</h3>
            <p>Monday - Friday: 9am - 5pm<br />Saturday: 10am - 2pm<br />Sunday: Closed</p>
          </div>
        </div>
        
        <div className={styles.contactFormContainer}>
          <h2>Send Us a Message</h2>
          
          {formStatus.submitted ? (
            <div className={`${styles.formMessage} ${formStatus.error ? styles.error : styles.success}`}>
              {formStatus.message}
            </div>
          ) : (
            <form className={styles.contactForm} onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label htmlFor="name">Your Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="subject">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  value={formData.message}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>
              
              <button type="submit" className={styles.submitButton}>Send Message</button>
            </form>
          )}
        </div>
      </div>
      
      <div className={styles.faqSection}>
        <h2>Frequently Asked Questions</h2>
        <div className={styles.faqContainer}>
          <div className={styles.faqItem}>
            <h3>How does TIYA work?</h3>
            <p>TIYA connects students with qualified tutors in their area. Students can search for tutors based on subject, location, and availability, while tutors can create profiles showcasing their expertise and teaching style.</p>
          </div>
          
          <div className={styles.faqItem}>
            <h3>How do I find a tutor?</h3>
            <p>You can search for tutors using our search page. Filter by subject, location, price range, and availability to find the perfect match for your learning needs.</p>
          </div>
          
          <div className={styles.faqItem}>
            <h3>How do I become a tutor on TIYA?</h3>
            <p>To become a tutor, register an account, complete your profile with your qualifications and expertise, set your availability and rates, and wait for verification from our team.</p>
          </div>
          
          <div className={styles.faqItem}>
            <h3>Is TIYA available in my area?</h3>
            <p>TIYA is expanding to new locations regularly. Check our coverage page or contact us directly to see if we're available in your area.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;