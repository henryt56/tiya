import { useState, useEffect, useRef } from 'react';
import { useAuth, getUserData } from '../../services/context/AuthContext';

import {
	sendMessage,
	getUserMessageHistory,
	getUsersConversation,
	markAsRead,
	listenToConversation,
} from '../../services/Messages/messageService';
import styles from './ChatBox.module.css';

const ChatBox = ({
	isOpen,
	onClose,
	initialUserId = null,
	initialUserName = null,
}) => {
	const { currentUser, userRole } = useAuth();
	const [conversations, setConversations] = useState([]);
	const [activeConversation, setActiveConversation] = useState(null);
	const [messages, setMessages] = useState([]);
	const [newMessage, setNewMessage] = useState('');
	const [loading, setLoading] = useState(true);
	const [showConversations, setShowConversations] = useState(!initialUserId);
	const messagesEndRef = useRef(null);

	useEffect(() => {
		if (!currentUser?.uid || !isOpen) return;

		const fetchConversations = async () => {
			try {
				const userConversations = await getUserMessageHistory(currentUser.uid);

				const filteredConversations = [];

				for (const conversation of userConversations) {
					const partnerData = await getUserData(conversation.partnerId);
					const partnerRole = partnerData?.role;
					const profilePhoto = partnerData?.profilePhoto || null;

					const partnerName =
						partnerData?.displayName || conversation.partnerName;

					if (
						(userRole === 'student' && partnerRole === 'tutor') ||
						(userRole === 'tutor' && partnerRole === 'student')
					) {
						filteredConversations.push({
							...conversation,
							partnerName,
							partnerRole,
							profilePhoto,
						});
					}
				}

				filteredConversations.sort((a, b) => {
					const aTime = a.latestMessage?.timestampCreated?.toMillis() || 0;
					const bTime = b.latestMessage?.timestampCreated?.toMillis() || 0;
					return bTime - aTime;
				});

				setConversations(filteredConversations);

				if (initialUserId) {
					const targetConvo = filteredConversations.find(
						(convo) => convo.partnerId === initialUserId,
					);

					if (targetConvo) {
						selectConversation(targetConvo);
					} else {
						const userData = await getUserData(initialUserId);
						console.log('DEBUGGING NEW CONVERSATION:');
						console.log('- userData:', userData);
						console.log('- initialUserId:', initialUserId);
						console.log('- initialUserName:', initialUserName);
						if (
							userData &&
							((userRole === 'student' && userData.role === 'tutor') ||
								(userRole === 'tutor' && userData.role === 'student'))
						) {
							console.log(
								'Creating new conversation with user:',
								userData.displayName,
							);

							const newConvo = {
								partnerId: initialUserId,
								partnerName: userData.displayName,
								partnerRole: userData.role,
								profilePhoto: userData.profilePhoto || null,
								messages: [],
							};
							selectConversation(newConvo);
						}
					}
				} else if (filteredConversations.length > 0) {
					selectConversation(filteredConversations[0]);
				}

				setLoading(false);
			} catch (error) {
				console.error('Error fetching conversations:', error);
				setLoading(false);
			}
		};

		fetchConversations();
	}, [currentUser, isOpen, initialUserId]);

	useEffect(() => {
		if (!currentUser?.uid || !activeConversation?.partnerId || !isOpen) return;

		const stopListener = listenToConversation(
			currentUser.uid,
			activeConversation.partnerId,
			(updatedMessages) => {
				setMessages(updatedMessages);

				const unreadMessages = updatedMessages
					.filter((msg) => msg.receiverId === currentUser.uid && !msg.isRead)
					.map((msg) => msg.id);

				if (unreadMessages.length > 0) {
					markAsRead(unreadMessages).catch((error) => {
						console.error('Error marking messages as read:', error);
					});
				}
			},
		);

		return () => stopListener();
	}, [currentUser, activeConversation, isOpen]);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages]);

	const handleSendMessage = async (e) => {
		e.preventDefault();
		if (!newMessage.trim() || !activeConversation) return;

		try {
			const userData = await getUserData(currentUser.uid);
			const partnerData = await getUserData(activeConversation.partnerId);

			await sendMessage(
				currentUser.uid,
				userData.displayName || 'User',
				activeConversation.partnerId,
				partnerData.displayName,
				newMessage.trim(),
			);
			setNewMessage('');
		} catch (error) {
			console.error('Error sending message:', error);
		}
	};

	const selectConversation = async (conversation) => {
		setActiveConversation(conversation);
		setShowConversations(false);
		setLoading(true);

		try {
			const conversationMessages = await getUsersConversation(
				currentUser.uid,
				conversation.partnerId,
			);
			setMessages(conversationMessages);

			const unreadMessages = conversationMessages
				.filter((msg) => msg.receiverId === currentUser.uid && !msg.isRead)
				.map((msg) => msg.id);

			if (unreadMessages.length > 0) {
				await markAsRead(unreadMessages);
			}
		} catch (error) {
			console.error('Error fetching conversation:', error);
		} finally {
			setLoading(false);
		}
	};

	const formatTimestamp = (timestamp) => {
		if (!timestamp) return '';

		const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
		return date.toLocaleString('en-US', {
			hour: 'numeric',
			minute: 'numeric',
			hour12: true,
		});
	};

	if (!isOpen) return null;

	return (
		<div className={styles.chatBox}>
			<div className={styles.chatBoxHeader}>
				{showConversations ? (
					<div className={styles.chatTitle}>Messages</div>
				) : (
					<>
						<div
							className={styles.backButton}
							onClick={() => setShowConversations(true)}
						>
							←
						</div>
						<div className={styles.chatTitle}>
							{activeConversation?.profilePhoto ? (
								<img
									src={activeConversation.profilePhoto}
									alt={activeConversation.partnerName}
									className={styles.profilePhotoHeader}
								/>
							) : (
								<div className={styles.profilePhotoHeaderPlaceholder}>
									{activeConversation?.partnerName?.charAt(0).toUpperCase()}
								</div>
							)}
							{activeConversation?.partnerName}
						</div>
					</>
				)}
				<div className={styles.closeButton} onClick={onClose}>
					×
				</div>
			</div>

			<div className={styles.chatBoxContent}>
				{showConversations ? (
					<div className={styles.conversationsList}>
						{loading ? (
							<div className={styles.loadingState}>
								Loading conversations...
							</div>
						) : conversations.length === 0 ? (
							<div className={styles.emptyState}>No conversations yet</div>
						) : (
							conversations.map((conversation) => (
								<div
									key={conversation.partnerId}
									className={styles.conversationItem}
									onClick={() => selectConversation(conversation)}
								>
									<div className={styles.profilePhotoContainer}>
										{conversation.profilePhoto ? (
											<img
												src={conversation.profilePhoto}
												alt={conversation.partnerName}
												className={styles.profilePhoto}
											/>
										) : (
											<div className={styles.profilePhotoPlaceholder}>
												{conversation.partnerName.charAt(0).toUpperCase()}
											</div>
										)}
									</div>
									<div className={styles.conversationContent}>
										<div className={styles.conversationHeader}>
											<h3 className={styles.conversationName}>
												{conversation.partnerName}
											</h3>
											{conversation.latestMessage && (
												<span className={styles.conversationTime}>
													{formatTimestamp(
														conversation.latestMessage.timestampCreated,
													)}
												</span>
											)}
										</div>
										{conversation.latestMessage && (
											<p className={styles.conversationPreview}>
												{conversation.latestMessage.messageContent}
											</p>
										)}
									</div>
									{conversation.messages.some(
										(msg) => msg.receiverId === currentUser.uid && !msg.isRead,
									) && <div className={styles.unreadIndicator}></div>}
								</div>
							))
						)}
					</div>
				) : (
					<div className={styles.messagesContainer}>
						{loading ? (
							<div className={styles.loadingState}>Loading messages...</div>
						) : messages.length === 0 ? (
							<div className={styles.emptyState}>
								No messages yet. Start the conversation!
							</div>
						) : (
							messages.map((message) => (
								<div
									key={message.id}
									className={`${styles.messageItem} ${
										message.senderId === currentUser.uid
											? styles.sent
											: styles.received
									}`}
								>
									<div className={styles.messageBubble}>
										<p>{message.messageContent}</p>
									</div>
									<div className={styles.messageMeta}>
										{formatTimestamp(message.timestampCreated)}
										{message.senderId === currentUser.uid && (
											<span className={styles.readStatus}>
												{message.isRead ? 'Read ✓' : 'Delivered'}
											</span>
										)}
									</div>
								</div>
							))
						)}
						<div ref={messagesEndRef} />
					</div>
				)}
			</div>

			{!showConversations && activeConversation && (
				<div className={styles.chatBoxFooter}>
					<form onSubmit={handleSendMessage} className={styles.messageForm}>
						<input
							type="text"
							className={styles.messageInput}
							placeholder="Type a message..."
							value={newMessage}
							onChange={(e) => setNewMessage(e.target.value)}
						/>
						<button type="submit" className={styles.sendButton}>
							Send
						</button>
					</form>
				</div>
			)}
		</div>
	);
};

export default ChatBox;
