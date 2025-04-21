import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../services/context/AuthContext';

const ADMIN_SESSION_KEY = 'admin_session';
const WARNING_BEFORE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes before timeout
const ADMIN_SESSION_TIMEOUT_MINUTES = 30; // Must match the value in AuthContext

const SessionExpiryNotification = () => {
    const { isAdmin, currentUser } = useAuth();
    const [showWarning, setShowWarning] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);

    const extendSession = useCallback(() => {
        if (!isAdmin || !currentUser) return;

        try {
            const adminSession = sessionStorage.getItem(ADMIN_SESSION_KEY);
            if (adminSession) {
                const sessionData = JSON.parse(adminSession);
                // Reset the last activity timestamp
                sessionData.lastActivity = Date.now();
                sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(sessionData));
                setShowWarning(false);
            }
        } catch (error) {
            console.error('Error extending session:', error);
        }
    }, [isAdmin, currentUser]);

    useEffect(() => {
        if (!isAdmin || !currentUser) return;

        const checkSessionStatus = () => {
            try {
                const adminSession = sessionStorage.getItem(ADMIN_SESSION_KEY);
                if (!adminSession) return;

                const sessionData = JSON.parse(adminSession);
                const lastActivity = sessionData.lastActivity || sessionData.lastLogin;
                const now = Date.now();
                const timeoutMs = ADMIN_SESSION_TIMEOUT_MINUTES * 60 * 1000;
                const timeElapsed = now - lastActivity;
                const timeRemaining = timeoutMs - timeElapsed;

                if (timeRemaining <= WARNING_BEFORE_TIMEOUT_MS) {
                    setShowWarning(true);
                    setTimeLeft(Math.floor(timeRemaining / 60000)); // in minutes
                } else {
                    setShowWarning(false);
                }
            } catch (error) {
                console.error('Error checking session status:', error);
            }
        };

        // Check session status periodically
        const intervalId = setInterval(checkSessionStatus, 60000); // every minute
        checkSessionStatus(); // Check immediately on mount

        return () => {
            clearInterval(intervalId);
        };
    }, [isAdmin, currentUser]);

    if (!showWarning || !isAdmin) return null;

    return (
        <div style={styles.container}>
            <div style={styles.notification}>
                <h4 style={styles.heading}>Session Expiring Soon</h4>
                <p style={styles.message}>
                    Your session will expire in approximately {timeLeft} minute{timeLeft !== 1 ? 's' : ''} due to inactivity.
                </p>
                <button
                    style={styles.button}
                    onClick={extendSession}
                >
                    Extend Session
                </button>
            </div>
        </div>
    );
};

const styles = {
    container: {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 9999
    },
    notification: {
        backgroundColor: '#f8d7da',
        border: '1px solid #f5c6cb',
        borderRadius: '4px',
        padding: '15px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        maxWidth: '350px'
    },
    heading: {
        color: '#721c24',
        marginTop: 0,
        marginBottom: '10px'
    },
    message: {
        margin: '0 0 15px 0'
    },
    button: {
        backgroundColor: '#0d6efd',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        padding: '8px 16px',
        cursor: 'pointer',
        fontSize: '14px'
    }
};

export default SessionExpiryNotification; 