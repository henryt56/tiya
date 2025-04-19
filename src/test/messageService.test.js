import {
  sendMessage,
  getUserMessageHistory,
  getUsersConversation,
  markAsRead,
  listenToConversation,
} from '../services/Messages/messageService';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import * as AuthContext from '../services/context/AuthContext';

jest.mock('../firebaseConfig', () => ({
  db: {
    collection: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
    })),
  },
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(() => 'messages-collection'),
  addDoc: jest.fn(() => Promise.resolve({ id: 'mock-message-id' })),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  getDocs: jest.fn(),
  onSnapshot: jest.fn(),
  serverTimestamp: jest.fn(() => ({ toMillis: () => 1234567890 })),
  updateDoc: jest.fn(),
  doc: jest.fn(),
}));

// Mock AuthContext
jest.mock('../services/context/AuthContext', () => ({
  getUserData: jest.fn()
}));

describe('Message Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sendMessage should create a message and return ID', async () => {
    // Set up mock user data
    AuthContext.getUserData.mockImplementation((uid) => {
      if (uid === 'sender123') {
        return Promise.resolve({
          uid: 'sender123',
          role: 'student',
          displayName: 'Test Sender'
        });
      } else if (uid === 'receiver456') {
        return Promise.resolve({
          uid: 'receiver456',
          role: 'tutor',
          displayName: 'Test Receiver'
        });
      }
      return Promise.resolve(null);
    });

    // Call the function with the correct parameters based on the implementation
    const messageId = await sendMessage(
      'sender123',              // senderId
      'Test Sender',            // senderName
      'receiver456',            // receiverId
      'Test Receiver',          // receiverName
      'Test message content'    // content
    );

    // Assertions
    expect(AuthContext.getUserData).toHaveBeenCalledWith('sender123');
    expect(AuthContext.getUserData).toHaveBeenCalledWith('receiver456');
    expect(addDoc).toHaveBeenCalledTimes(1);
    expect(addDoc).toHaveBeenCalledWith('messages-collection', expect.objectContaining({
      senderId: 'sender123',
      senderName: 'Test Sender',
      receiverId: 'receiver456',
      receiverName: 'Test Receiver',
      messageContent: 'Test message content',
      isRead: false
    }));
    expect(messageId).toBe('mock-message-id');
  });

  test('getUserMessageHistory should return conversations', async () => {
    const getDocs = require('firebase/firestore').getDocs;
    getDocs
      .mockResolvedValueOnce({ docs: [] })
      .mockResolvedValueOnce({ docs: [] });

    await getUserMessageHistory('user1');

    expect(getDocs).toHaveBeenCalledTimes(2);
  });

  test('getUsersConversation should return messages between users', async () => {
    const getDocs = require('firebase/firestore').getDocs;
    getDocs
      .mockResolvedValueOnce({ docs: [] })
      .mockResolvedValueOnce({ docs: [] });

    await getUsersConversation('user1', 'user2');

    expect(getDocs).toHaveBeenCalledTimes(2);
  });

  test('markAsRead should update message read status', async () => {
    const doc = require('firebase/firestore').doc;
    const updateDoc = require('firebase/firestore').updateDoc;

    doc.mockReturnValue('docRef');
    updateDoc.mockResolvedValue(undefined);

    const result = await markAsRead(['msg1']);

    expect(updateDoc).toHaveBeenCalledWith('docRef', { isRead: true });
    expect(result).toBe(true);
  });

  test('listenToConversation should set up listeners', () => {
    const onSnapshot = require('firebase/firestore').onSnapshot;
    const mockUnsubscribe = jest.fn();
    onSnapshot.mockReturnValue(mockUnsubscribe);

    const unsubscribe = listenToConversation('user1', 'user2', jest.fn());

    expect(onSnapshot).toHaveBeenCalledTimes(2);
    unsubscribe();
    expect(mockUnsubscribe).toHaveBeenCalledTimes(2);
  });
});
