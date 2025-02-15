import { db } from "../firebaseConfig";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";

// Book a tutor session
export const bookSession = async (studentId, tutorId, date) => {
    return await addDoc(collection(db, "bookings"), {
        studentId,
        tutorId,
        date,
        status: "pending",
    });
};

// Get a student's bookings
export const getStudentBookings = async (studentId) => {
    const q = query(collection(db, "bookings"), where("studentId", "==", studentId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data());
};
