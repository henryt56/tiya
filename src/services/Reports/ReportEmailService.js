// ReportEmailService.js
// Handles email communication for reports using mailto protocol

import { getDoc, doc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

/**
 * Gets the user email from their user ID
 * 
 * @param {string} userId - The ID of the user to get email for
 * @returns {Promise<string>} - Returns the user's email or throws an error
 */
export const getUserEmail = async (userId) => {
    try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            throw new Error(`User with ID ${userId} not found`);
        }

        const userData = userSnap.data();
        const email = userData.email;

        if (!email) {
            throw new Error('User email not found');
        }

        return email;
    } catch (error) {
        console.error('Error getting user email:', error);
        throw new Error('Failed to get user email');
    }
};

/**
 * Creates a mailto URL for sending an email to a report creator
 * 
 * @param {string} email - Email address of the recipient
 * @param {string} subject - Email subject
 * @param {string} body - Email body
 * @returns {string} - Returns a mailto URL
 */
export const createMailtoLink = (email, subject, body) => {
    // Encode the parameters to handle special characters
    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(body);

    // Construct and return the mailto link
    return `mailto:${email}?subject=${encodedSubject}&body=${encodedBody}`;
};

/**
 * Opens the user's default email client to send an email to the report creator
 * 
 * @param {string} reportId - The ID of the report
 * @param {string} reportTitle - The title of the report
 * @param {string} reporterId - The ID of the user who created the report
 * @param {string} message - Email message content
 * @returns {Promise<boolean>} - Returns true if successful, false otherwise
 */
export const sendReportEmail = async (reportId, reportTitle, reporterId, message) => {
    try {
        // Get the reporter's email address
        const reporterEmail = await getUserEmail(reporterId);

        // Create email subject with report ID for reference
        const subject = `Re: Report #${reportId.substring(0, 8)} - ${reportTitle}`;

        // Create email body with the message
        const body = `${message}\n\n---\nThis email is regarding Report #${reportId}`;

        // Create the mailto link
        const mailtoLink = createMailtoLink(reporterEmail, subject, body);

        // Open the default email client
        window.open(mailtoLink, '_blank');

        return true;
    } catch (error) {
        console.error('Error sending report email:', error);
        return false;
    }
}; 