import React from 'react';
import Image from 'next/image';

function Header({ name, profilePicture, bio }) {
  return (
    <header className="profile-header">
      <div className="profile-picture">
        <Image
          src={profilePicture}
          alt="Tutor Profile"
          width={120} // Adjust width as needed
          height={120} // Adjust height as needed
        />
      </div>
      <div className="profile-info">
        <h1>{name}</h1>
        <p className="bio">{bio}</p>
      </div>
    </header>
  );
}

export default Header;