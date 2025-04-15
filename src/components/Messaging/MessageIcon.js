import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useAuth } from '../../services/context/AuthContext';
import ChatBox from './ChatBox';
import styles from './MessageIcon.module.css';

const MessageIcon = () => {
  const { currentUser, userRole } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [targetUserId, setTargetUserId] = useState(null);

  useEffect(() => {
    if (!currentUser?.uid) return;

    const q = query(
      collection(db, 'messages'),
      where('receiverId', '==', currentUser.uid),
      where('isRead', '==', false),
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const unreadMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const filteredMessages = [];

      for (const msg of unreadMessages) {
        const senderRole = msg.senderRole;

        if (
          (userRole === 'student' && senderRole === 'tutor') ||
          (userRole === 'tutor' && senderRole === 'student')
        ) {
          filteredMessages.push(msg);
        }
      }

      setUnreadCount(filteredMessages.length);

      const messagesBySender = {};
      filteredMessages.forEach((msg) => {
        if (!messagesBySender[msg.senderId]) {
          messagesBySender[msg.senderId] = {
            senderId: msg.senderId,
            senderName: msg.senderName,
            senderRole: msg.senderRole,
            messages: [],
          };
        }
        messagesBySender[msg.senderId].messages.push(msg);
      });

      const notificationsList = Object.values(messagesBySender).map(
        (sender) => {
          sender.messages.sort((a, b) => {
            return (
              (b.timestampCreated?.toMillis() || 0) -
              (a.timestampCreated?.toMillis() || 0)
            );
          });
          return {
            ...sender,
            latestMessage: sender.messages[0],
          };
        },
      );

      notificationsList.sort((a, b) => {
        return (
          (b.latestMessage?.timestampCreated?.toMillis() || 0) -
          (a.latestMessage?.timestampCreated?.toMillis() || 0)
        );
      });

      setNotifications(notificationsList);
    });

    return () => unsubscribe();
  }, [currentUser, userRole]);

  const toggleChat = () => {
    setChatOpen(!chatOpen);
    if (chatOpen) {
      setShowNotifications(false);
      setTargetUserId(null);
    }
  };

  const toggleNotifications = (e) => {
    e.stopPropagation();
    if (!showNotifications && unreadCount > 0) {
      setShowNotifications(true);
    } else {
      setShowNotifications(false);
    }
  };

  const openChatWithUser = (userId) => {
    setShowNotifications(false);
    setTargetUserId(userId);
    setChatOpen(true);
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  if (loading || (userRole !== 'student' && userRole !== 'tutor')) {
    return null;
  }

  return (
    <div className={styles.messageIconContainer}>
      <div
        className={styles.messageIcon}
        onClick={toggleChat}
        onMouseEnter={toggleNotifications}
        onMouseLeave={() => setShowNotifications(false)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>

        {unreadCount > 0 && (
          <div className={styles.notificationBadge}>{unreadCount}</div>
        )}
      </div>

      {showNotifications && notifications.length > 0 && (
        <div className={styles.notificationsDropdown}>
          <div className={styles.notificationsHeader}>
            <h3>New Messages</h3>
          </div>
          <div className={styles.notificationsList}>
            {notifications.map((sender) => (
              <div
                key={sender.senderId}
                className={styles.notificationItem}
                onClick={() => openChatWithUser(sender.senderId)}
              >
                <div className={styles.notificationSender}>
                  {sender.senderName}
                  <span className={styles.notificationTime}>
                    {formatTimestamp(sender.latestMessage.timestampCreated)}
                  </span>
                </div>
                <p className={styles.notificationPreview}>
                  {sender.latestMessage.messageContent}
                </p>
                <div className={styles.notificationCount}>
                  {sender.messages.length}{' '}
                  {sender.messages.length === 1 ? 'message' : 'messages'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <ChatBox
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        initialUserId={targetUserId}
      />
    </div>
  );
};

export default MessageIcon;
