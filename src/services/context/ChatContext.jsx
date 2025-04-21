import { createContext, useContext, useState } from 'react';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
	const [isAnyChatOpen, setIsAnyChatOpen] = useState(false);

	return (
		<ChatContext.Provider value={{ isAnyChatOpen, setIsAnyChatOpen }}>
			{children}
		</ChatContext.Provider>
	);
};

export const useChat = () => useContext(ChatContext);
