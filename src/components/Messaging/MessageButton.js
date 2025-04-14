import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import ChatBox from './ChatBox';
import styles from './MessageButton.module.css';

const MessageButton = ({ userId, userName, userRole }) => {
  const { currentUser, userRole: currentUserRole } = useAuth();
  const [chatOpen, setChatOpen] = useState(false);
  const [canMessage, setCanMessage] = useState(false);

  useEffect(() => {
    // Students can only message tutors, tutors can only message students
    if (
      (currentUserRole === 'student' && userRole === 'tutor') ||
      (currentUserRole === 'tutor' && userRole === 'student')
    ) {
      setCanMessage(true);
    } else {
      setCanMessage(false);
    }
  }, [currentUserRole, userRole]);

  if (currentUser?.uid === userId || !canMessage) {
    return null;
  }

  const openChat = () => {
    setChatOpen(true);
  };

  return (
    <>
      <button className={styles.profileChatButton} onClick={openChat}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={styles.profileChatIcon}
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <span>Message {userName}</span>
      </button>

      <ChatBox
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        initialUserId={userId}
        initialUserName={userName}
      />
    </>
  );
};

export default MessageButton;
