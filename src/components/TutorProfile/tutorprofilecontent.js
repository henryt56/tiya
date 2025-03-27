import React from 'react';

function Content({ languages, subjects, certifications, reviews }) {
  return (
    <section className="profile-content">
      <div className="languages">
        <h3>Languages:</h3>
        <ul>
          {languages.map((language) => (
            <li key={language}>{language}</li>
          ))}
        </ul>
      </div>
      <div className="subjects">
        <h3>Subjects:</h3>
        <ul>
          {subjects.map((subject) => (
            <li key={subject}>{subject}</li>
          ))}
        </ul>
      </div>
      <div className="certifications">
        <h3>Certifications:</h3>
        <ul>
          {certifications.map((certification) => (
            <li key={certification}>{certification}</li>
          ))}
        </ul>
      </div>
      <div className="resources">
        <button className="resource-button">RESOURCE RECOMMENDATIONS</button>
      </div>
      <div className="reviews">
        <h2>Latest Reviews</h2>
        {reviews.map((review) => (
          <article className="review-card" key={review.date}>
            <h3>{review.title}</h3>
            <p>{review.body}</p>
            <p className="student-name">{review.studentName} - {review.date}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Content;