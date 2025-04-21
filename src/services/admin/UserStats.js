import { collection, query, where, getDocs, getCountFromServer } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

export const countUsersByRole = async () => {
    try {
        const usersRef = collection(db, 'users');

        // Define the roles we want to count
        const roles = ['student', 'tutor', 'admin', 'it'];

        // Use Promise.all to run all queries in parallel
        const counts = await Promise.all(
            roles.map(async (role) => {
                const roleQuery = query(usersRef, where('role', '==', role));
                const snapshot = await getCountFromServer(roleQuery);
                return {
                    name: role === 'it' ? 'IT Admins' : role.charAt(0).toUpperCase() + role.slice(1) + 's',
                    value: snapshot.data().count
                };
            })
        );

        // Filter out any roles with 0 users
        return counts.filter(item => item.value > 0);
    } catch (error) {
        console.error('Error counting users by role:', error);
        // Return empty array in case of error
        return [];
    }
};

export const getAdminUsers = async () => {
    try {
        const usersRef = collection(db, 'users');
        const adminQuery = query(
            usersRef,
            where('role', 'in', ['admin', 'it'])
        );

        const querySnapshot = await getDocs(adminQuery);
        const admins = [];

        querySnapshot.forEach((doc) => {
            const userData = doc.data();
            admins.push({
                id: doc.id,
                email: userData.email,
                role: userData.role,
                createdAt: userData.createdAt?.toDate?.()?.toISOString() || 'N/A',
                lastLogin: userData.lastLogin?.toDate?.()?.toISOString() || 'N/A'
            });
        });

        return admins;
    } catch (error) {
        console.error('Error fetching admin users:', error);
        return [];
    }
}; 