import { collection, query, where, getDocs, updateDoc, doc, orderBy, getCountFromServer, Timestamp } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

export const getMonthlyReportCounts = async () => {
    try {
        const reportsRef = collection(db, 'reports');
        const querySnapshot = await getDocs(reportsRef);

        // Count reports by month
        const monthCounts = {};
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        // Initialize all months with 0
        months.forEach(month => {
            monthCounts[month] = 0;
        });

        // Count reports by month
        querySnapshot.forEach(doc => {
            const data = doc.data();
            if (data.createdAt) {
                const date = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
                const month = months[date.getMonth()];
                monthCounts[month]++;
            }
        });

        // Convert to array format for charts
        const result = Object.keys(monthCounts).map(month => ({
            month,
            reports: monthCounts[month]
        }));

        return result;
    } catch (error) {
        console.error('Error getting monthly report counts:', error);
        return [];
    }
};

export const getReportStatusCounts = async () => {
    try {
        const reportsRef = collection(db, 'reports');
        const statuses = ['pending assignee', 'in progress', 'resolved'];

        const statusCounts = await Promise.all(
            statuses.map(async (status) => {
                const statusQuery = query(reportsRef, where('status', '==', status));
                const snapshot = await getCountFromServer(statusQuery);
                return {
                    name: status === 'pending assignee' ? 'Pending' :
                        status === 'in progress' ? 'In Progress' : 'Resolved',
                    value: snapshot.data().count
                };
            })
        );

        return statusCounts;
    } catch (error) {
        console.error('Error getting report status counts:', error);
        return [];
    }
};

export const updateReportStatus = async (reportId, newStatus) => {
    try {
        // Validate the status
        const validStatuses = ['pending assignee', 'in progress', 'resolved'];
        if (!validStatuses.includes(newStatus)) {
            console.error(`Invalid status: ${newStatus}. Must be one of: ${validStatuses.join(', ')}`);
            return false;
        }

        const reportRef = doc(db, 'reports', reportId);
        await updateDoc(reportRef, {
            status: newStatus,
            lastUpdated: Timestamp.now()
        });
        return true;
    } catch (error) {
        console.error('Error updating report status:', error);
        return false;
    }
};

export const getWeeklyUserActivity = async () => {
    try {
        const usersRef = collection(db, 'users');
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        // Get current date and calculate dates for the past week
        const today = new Date();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - 7);

        // For demo, we'll return simulated data matching our structure
        // In a real app, we'd query login activity or sessions
        return [
            { day: 'Mon', students: 45, tutors: 32 },
            { day: 'Tue', students: 50, tutors: 35 },
            { day: 'Wed', students: 55, tutors: 40 },
            { day: 'Thu', students: 60, tutors: 38 },
            { day: 'Fri', students: 65, tutors: 42 },
            { day: 'Sat', students: 40, tutors: 30 },
            { day: 'Sun', students: 35, tutors: 25 },
        ];
    } catch (error) {
        console.error('Error getting weekly user activity:', error);
        return [];
    }
}; 