import { useState, useEffect } from 'react';
import { useAuth } from '../../services/context/AuthContext';
import { useChat } from '../../services/context/ChatContext';
import ChatBox from './ChatBox';
import styles from './MessageButton.module.css';

const MessageButton = ({ userId, userName, userRole }) => {
	const { currentUser, userRole: currentUserRole } = useAuth();
	const { setIsAnyChatOpen } = useChat();
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

	useEffect(() => {
		if (chatOpen) {
			setIsAnyChatOpen(true);
		}

		return () => {
			if (chatOpen) {
				setIsAnyChatOpen(false);
			}
		};
	}, [chatOpen, setIsAnyChatOpen]);

	if (currentUser?.uid === userId || !canMessage) {
		return null;
	}

	const openChat = () => {
		setChatOpen(true);
	};

	const closeChat = () => {
		setChatOpen(false);
		setIsAnyChatOpen(false);
	};

	return (
		<>
			<button className="btn btn-primary w-100" onClick={openChat}>
				<span>Message {userName} </span>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					transform="translate(4, 0)"
					fill="white"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className={styles.profileChatIcon}
				>
					<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
				</svg>
			</button>

			<ChatBox
				isOpen={chatOpen}
				onClose={closeChat}
				initialUserId={userId}
				initialUserName={userName}
			/>
		</>
	);
};

export default MessageButton;
