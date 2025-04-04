import { db } from '../../firebaseConfig';
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  doc,
} from 'firebase/firestore';

export const sendMessage = async (
  senderId,
  senderName,
  receiverId,
  receiverName,
  content,
  attachments = [],
) => {
  try {
    const messageData = {
      senderId,
      senderName,
      receiverId,
      receiverName,
      messageContent: content,
      timestampCreated: serverTimestamp(),
      isRead: false,
      attachments: attachments || [],
    };

    const docRef = await addDoc(collection(db, 'messages'), messageData);
    return docRef.id;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const getUserMessageHistory = async (userId) => {
  try {
    const sentQ = query(
      collection(db, 'messages'),
      where('senderId', '==', userId),
    );
    const receivedQ = query(
      collection(db, 'messages'),
      where('receiverId', '==', userId),
    );

    const [sentDocs, receivedDocs] = await Promise.all([
      getDocs(sentQ),
      getDocs(receivedQ),
    ]);

    const messages = [
      ...sentDocs.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      ...receivedDocs.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
    ];

    const messagehistoryMap = {};

    messages.forEach((msg) => {
      const partnerId = msg.senderId == userId ? msg.receiverId : msg.senderId;
      const partnerName =
        msg.senderId == userId ? msg.receiverName : msg.senderName;

      if (!messagehistoryMap[partnerId]) {
        messagehistoryMap[partnerId] = {
          partnerId,
          partnerName,
          messages: [],
        };
      }

      messagehistoryMap[partnerId].messages.push(msg);
    });

    Object.values(messagehistoryMap).forEach((convo) => {
      convo.messages.sort((a, b) => {
        return (
          (b.timestampCreated?.toMillis() || 0) -
          (a.timestampCreated?.toMillis() || 0)
        );
      });
      convo.latestMessage = convo.messages[0];
    });

    return Object.values(messagehistoryMap);
  } catch (error) {
    console.error('Error fetching message history: ', error);
    throw error;
  }
};

export const getUsersConversation = async (userId1, userId2) => {
  try {
    const q1 = query(
      collection(db, 'messages'),
      where('senderId', '==', userId1),
      where('receiverId', '==', userId2),
      orderBy('timestampCreated', 'asc'),
    );

    const q2 = query(
      collection(db, 'messages'),
      where('senderId', '==', userId2),
      where('receiverId', '==', userId1),
      orderBy('timestampCreated', 'asc'),
    );

    const [snapshot1, snapshot2] = await Promise.all([
      getDocs(q1),
      getDocs(q2),
    ]);

    const messages = [
      ...snapshot1.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      ...snapshot2.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
    ].sort((a, b) => {
      return (
        (a.timestampCreated?.toMillis() || 0) -
        (b.timestampCreated?.toMillis() || 0)
      );
    });

    return messages;
  } catch (error) {
    console.error('Error getting conversation: ', error);
    throw error;
  }
};

export const markAsRead = async (messageIds) => {
  try {
    const updates = messageIds.map((id) => {
      const docRef = doc(db, 'messages', id);
      return updateDoc(docRef, { isRead: true });
    });

    await Promise.all(updates);
    return true;
  } catch (error) {
    console.error('Error marking message(s) as read: ', error);
    throw error;
  }
};

export const listenToConversation = (userId1, userId2, callback) => {
  const q1 = query(
    collection(db, 'messages'),
    where('senderId', '==', userId1),
    where('receiverId', '==', userId2),
    orderBy('timestampCreated', 'asc'),
  );

  const q2 = query(
    collection(db, 'messages'),
    where('senderId', '==', userId2),
    where('receiverId', '==', userId1),
    orderBy('timestampCreated', 'asc'),
  );

  const stopListener1 = onSnapshot(q1, () => {
    fetchAllMessages();
  });

  const stopListener2 = onSnapshot(q2, () => {
    fetchAllMessages();
  });

  const fetchAllMessages = async () => {
    try {
      const [snapshot1, snapshot2] = await Promise.all([
        getDocs(q1),
        getDocs(q2),
      ]);

      const messages = [
        ...snapshot1.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
        ...snapshot2.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      ].sort((a, b) => {
        return (
          (a.timestampCreated?.toMillis() || 0) -
          (b.timestampCreated?.toMillis() || 0)
        );
      });

      callback(messages);
    } catch (error) {
      console.error('Error in message listening: ', error);
    }
  };

  return () => {
    stopListener1();
    stopListener2();
  };
};
