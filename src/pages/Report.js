import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAuth } from '../services/context/AuthContext';
import ReportCreator from '../services/Reports/ReportCreation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const Report = () => {
    const router = useRouter();
    const { reportedId } = router.query;
    const { currentUser } = useAuth();
    const [reportedUser, setReportedUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!reportedId) return;

        const fetchReportedUser = async () => {
            try {
                setLoading(true);
                const userDoc = await getDoc(doc(db, 'users', reportedId));

                if (userDoc.exists()) {
                    setReportedUser({ id: userDoc.id, ...userDoc.data() });
                } else {
                    setError('User not found');
                }
            } catch (err) {
                console.error('Error fetching user data:', err);
                setError('Failed to load user data');
            } finally {
                setLoading(false);
            }
        };

        fetchReportedUser();
    }, [reportedId]);

    // If not logged in, redirect to login
    useEffect(() => {
        if (!currentUser && !loading) {
            router.push('/Login?redirect=' + encodeURIComponent(`/report?reportedId=${reportedId}`));
        }
    }, [currentUser, loading, router, reportedId]);

    if (loading) {
        return (
            <div className="container py-5">
                <div className="d-flex justify-content-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container py-5">
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => router.back()}
                >
                    Go Back
                </button>
            </div>
        );
    }

    if (!reportedUser) {
        return null;
    }

    return (
        <div className="container py-5">
            <div className="card shadow">
                <div className="card-body p-4">
                    <ReportCreator
                        reportedId={reportedId}
                        reportedUserName={reportedUser.displayName}
                    />

                    <div className="d-flex justify-content-start mt-4 pt-3 border-top">
                        <button
                            className="btn btn-outline-secondary"
                            onClick={() => router.back()}
                        >
                            <i className="bi bi-arrow-left me-2"></i>
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Report; 