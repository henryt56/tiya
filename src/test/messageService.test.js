import {
  sendMessage,
  getUserMessageHistory,
  getUsersConversation,
  markAsRead,
  listenToConversation,
} from '../services/Messages/messageService';

jest.mock('../firebaseConfig', () => ({
  db: {
    collection: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
    })),
  },
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  getDocs: jest.fn(),
  onSnapshot: jest.fn(),
  serverTimestamp: jest.fn(() => ({ toMillis: () => 1234567890 })),
  updateDoc: jest.fn(),
  doc: jest.fn(),
}));

describe('Message Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('sendMessage should create a message and return ID', async () => {
    const addDoc = require('firebase/firestore').addDoc;
    addDoc.mockResolvedValueOnce({ id: 'msg123' });

    const result = await sendMessage(
      'user1',
      'User One',
      'user2',
      'User Two',
      'Hello!',
    );

    expect(addDoc).toHaveBeenCalled();
    expect(result).toBe('msg123');
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
