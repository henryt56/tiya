import { useState, useEffect } from 'react';
import { useAuth } from '../../services/context/AuthContext';
import { getTutorSessions, getUpcomingSessions, updateSessionStatus } from '../../services/database/sessionDatabase.js';

const SessionManagement = () => {
  const { currentUser } = useAuth();
  
  const [pendingSessions, setPendingSessions] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  
  useEffect(() => {
    if (!currentUser) return;
    
    loadSessions();
  }, [currentUser]);
  
  const loadSessions = async () => {
    try {
      setLoading(true);
      
      // Get pending sessions (requests)
      const pending = await getTutorSessions(currentUser.uid, 'pending');
      setPendingSessions(pending);
      
      // Get confirmed upcoming sessions
      const upcoming = await getUpcomingSessions(currentUser.uid, 'tutor');
      const confirmed = upcoming.filter(session => session.status === 'confirmed');
      setUpcomingSessions(confirmed);
      
    } catch (err) {
      console.error('Error loading sessions:', err);
      setError('Failed to load sessions. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAcceptSession = async (sessionId) => {
    try {
      setActionLoading(true);
      
      await updateSessionStatus(sessionId, 'confirmed');
      
      // Update UI
      setPendingSessions(prev => prev.filter(session => session.id !== sessionId));
      loadSessions(); // Reload all sessions
      
    } catch (err) {
      console.error('Error accepting session:', err);
      setError('Failed to accept session request.');
    } finally {
      setActionLoading(false);
    }
  };
  
  const handleDeclineSession = async (sessionId) => {
    try {
      setActionLoading(true);
      
      await updateSessionStatus(sessionId, 'declined');
      
      // Update UI
      setPendingSessions(prev => prev.filter(session => session.id !== sessionId));
      
    } catch (err) {
      console.error('Error declining session:', err);
      setError('Failed to decline session request.');
    } finally {
      setActionLoading(false);
    }
  };
  
  const handleCancelSession = async (sessionId) => {
    try {
      if (window.confirm('Are you sure you want to cancel this session?')) {
        setActionLoading(true);
        
        await updateSessionStatus(sessionId, 'canceled');
        
        // Update UI
        setUpcomingSessions(prev => prev.filter(session => session.id !== sessionId));
      }
    } catch (err) {
      console.error('Error canceling session:', err);
      setError('Failed to cancel session.');
    } finally {
      setActionLoading(false);
    }
  };
  
  // Format date
  const formatDate = (timestamp) => {
    const date = timestamp.toDate();
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="session-management">
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      
      {/* Session Requests */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Session Requests</h5>
          <span className="badge bg-primary rounded-pill">
            {pendingSessions.length}
          </span>
        </div>
        <div className="card-body p-0">
          {pendingSessions.length === 0 ? (
            <div className="text-center py-4 text-muted">
              No pending session requests
            </div>
          ) : (
            <div className="list-group list-group-flush">
              {pendingSessions.map(session => (
                <div key={session.id} className="list-group-item">
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center">
                    <div>
                      <h6 className="mb-1">{session.subject}</h6>
                      <p className="mb-1 text-muted small">
                        {formatDate(session.date)} | {session.startTime} - {session.endTime}
                      </p>
                      <p className="mb-0 small">
                        Student: <strong>{session.studentName}</strong>
                      </p>
                      {session.description && (
                        <p className="mb-0 small text-muted fst-italic">
                          "{session.description}"
                        </p>
                      )}
                    </div>
                    <div className="d-flex gap-2 mt-2 mt-md-0">
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleAcceptSession(session.id)}
                        disabled={actionLoading}
                      >
                        Accept
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleDeclineSession(session.id)}
                        disabled={actionLoading}
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Upcoming Sessions */}
      <div className="card shadow-sm">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Upcoming Sessions</h5>
          <span className="badge bg-success rounded-pill">
            {upcomingSessions.length}
          </span>
        </div>
        <div className="card-body p-0">
          {upcomingSessions.length === 0 ? (
            <div className="text-center py-4 text-muted">
              No upcoming sessions
            </div>
          ) : (
            <div className="list-group list-group-flush">
              {upcomingSessions.map(session => (
                <div key={session.id} className="list-group-item">
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center">
                    <div>
                      <h6 className="mb-1">{session.subject}</h6>
                      <p className="mb-1 text-muted small">
                        {formatDate(session.date)} | {session.startTime} - {session.endTime}
                      </p>
                      <p className="mb-0 small">
                        Student: <strong>{session.studentName}</strong>
                      </p>
                      <p className="mb-0 small">
                        Session Type: <span className="text-capitalize">{session.meetingType}</span>
                      </p>
                    </div>
                    <div className="d-flex gap-2 mt-2 mt-md-0">
                      {session.meetingType === 'online' && !session.meetingLink && (
                        <button className="btn btn-primary btn-sm">
                          Set Up Meeting
                        </button>
                      )}
                      {session.meetingType === 'online' && session.meetingLink && (
                        <a href={session.meetingLink} className="btn btn-primary btn-sm" target="_blank" rel="noopener noreferrer">
                          Join Meeting
                        </a>
                      )}
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleCancelSession(session.id)}
                        disabled={actionLoading}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionManagement;