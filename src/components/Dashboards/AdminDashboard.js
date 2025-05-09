import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useRouter } from 'next/router';
import styles from '../../styles/AdminDashboard.module.css';
import { useAuth } from '../../services/context/AuthContext';
import { useSessionTimeout } from '../../services/context/AuthContext';
import { createAdminUser } from '../../services/admin/CreateAdminUser';
import { countUsersByRole, getAdminUsers } from '../../services/admin/UserStats';
import { ReportService } from '../../services/Reports/Report';
import {
  getMonthlyReportCounts,
  getReportStatusCounts,
  updateReportStatus,
  getWeeklyUserActivity
} from '../../services/Reports/ReportStats';
import { sendReportEmail, getUserEmail } from '../../services/Reports/ReportEmailService';
import { format } from 'date-fns';

const ADMIN_SESSION_KEY = 'admin_session';

const AdminDashboard = () => {
  // Use session timeout hook for admin users
  useSessionTimeout();

  // State for reports data
  const [reportData, setReportData] = useState([]);
  const [userStats, setUserStats] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [reportFilter, setReportFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // User display name states
  const [reportedUserName, setReportedUserName] = useState("");
  const [reporterName, setReporterName] = useState("");

  // Email state
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailError, setEmailError] = useState('');

  // Chart data state
  const [statusData, setStatusData] = useState([]);
  const [monthlyReportsData, setMonthlyReportsData] = useState([]);
  const [userActivityData, setUserActivityData] = useState([]);

  // Action states
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusUpdateError, setStatusUpdateError] = useState('');

  // Admin creation state
  const [showAdminCreation, setShowAdminCreation] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminRole, setNewAdminRole] = useState('admin');
  const [adminCreationResult, setAdminCreationResult] = useState(null);
  const [creationError, setCreationError] = useState('');
  const [adminVerificationCode, setAdminVerificationCode] = useState('');
  const [adminUsers, setAdminUsers] = useState([]);

  // Current user context
  const { currentUser, userRole, isAdmin } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch user statistics
        const userRoleCounts = await countUsersByRole();
        setUserStats(userRoleCounts);

        // Fetch admin users
        const admins = await getAdminUsers();
        setAdminUsers(admins);

        // Fetch reports - properly handle the data structure
        const reports = await ReportService.query();
        const formattedReports = reports.map(report => ({
          id: report.id,
          ...report.data
        }));
        setReportData(formattedReports);

        // Fetch report status counts for pie chart
        const reportStatusCounts = await getReportStatusCounts();
        setStatusData(reportStatusCounts);

        // Fetch monthly report data for bar chart
        const monthlyData = await getMonthlyReportCounts();
        setMonthlyReportsData(monthlyData);

        // Fetch weekly user activity data for line chart
        const activityData = await getWeeklyUserActivity();
        setUserActivityData(activityData);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Chart colors
  const COLORS = ['#0088FE', '#FF8042', '#00C49F', '#FFBB28'];

  // Helper function to get user display name
  const fetchUserDisplayName = async (userId) => {
    try {
      // This is a simplified implementation - you might have a dedicated service for this
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        // Return display name or username, falling back to email or user ID
        return userData.displayName || userData.username || userData.email || userId;
      }
      return "Unknown User";
    } catch (error) {
      console.error('Error fetching user display name:', error);
      return "Unknown User";
    }
  };

  // Format timestamp to human-readable date
  const formatDate = (timestamp) => {
    try {
      // Handle Firebase timestamp or ISO string
      const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
      return format(date, 'MMM d, yyyy h:mm a');
    } catch (error) {
      return timestamp; // Return the original timestamp if formatting fails
    }
  };

  const handleReportSelect = async (report) => {
    setSelectedReport(report);
    // Reset any previous errors
    setStatusUpdateError('');
    setEmailError('');

    // Fetch display names for reported user and reporter
    try {
      setReportedUserName(await fetchUserDisplayName(report.reportedId));
      setReporterName(await fetchUserDisplayName(report.reporterId));
    } catch (error) {
      console.error('Error fetching user display names:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedReport) return;

    try {
      setSendingEmail(true);
      setEmailError('');

      // Use the mailto protocol to open default email client
      const success = await sendReportEmail(
        selectedReport.id,
        selectedReport.title,
        selectedReport.reporterId,
        messageText
      );

      if (success) {
        // Clear message text after sending
        setMessageText('');
      } else {
        setEmailError('Failed to open email client. Please check if reporter has a valid email.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setEmailError('Failed to send message. Please try again.');
    } finally {
      setSendingEmail(false);
    }
  };

  // Handle Firebase report status update
  const handleStatusUpdate = async (newStatus) => {
    if (!selectedReport) return;

    try {
      setUpdatingStatus(true);
      setStatusUpdateError('');

      // Update status in Firebase
      const success = await updateReportStatus(selectedReport.id, newStatus);

      if (success) {
        // Update local state
        setReportData(prevReports =>
          prevReports.map(report =>
            report.id === selectedReport.id
              ? { ...report, status: newStatus }
              : report
          )
        );
        setSelectedReport({ ...selectedReport, status: newStatus });

        // Refresh report status counts
        const reportStatusCounts = await getReportStatusCounts();
        setStatusData(reportStatusCounts);
      } else {
        setStatusUpdateError('Failed to update report status. Please try again.');
      }
    } catch (error) {
      console.error('Error updating report status:', error);
      setStatusUpdateError('An unexpected error occurred while updating the status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Handle admin creation
  const handleCreateAdmin = async (e) => {
    e.preventDefault();

    // Reset previous results/errors
    setCreationError('');
    setAdminCreationResult(null);

    // Simple validation
    if (!newAdminEmail || !newAdminEmail.includes('@')) {
      setCreationError('Please enter a valid email address');
      return;
    }

    // for demo, we use a simple verification instead of 2FA
    if (adminVerificationCode !== '123456') {
      setCreationError('Invalid verification code');
      return;
    }

    try {
      const result = await createAdminUser(
        newAdminEmail,
        newAdminRole,
        currentUser.uid
      );

      if (result.success) {
        setAdminCreationResult(result);

        // Refresh admin users list
        const updatedAdmins = await getAdminUsers();
        setAdminUsers(updatedAdmins);

        setNewAdminEmail('');
        setAdminVerificationCode('');
      } else {
        setCreationError(result.message);
      }
    } catch (error) {
      console.error('Error creating admin:', error);
      setCreationError('An unexpected error occurred');
    }
  };

  const filteredReports = reportFilter === 'all'
    ? reportData
    : reportData.filter(report => report.status === reportFilter);

  return (
    <div className={styles.dashboard}>
      <h1>Admin Dashboard</h1>

      {loading ? (
        <div className={styles.loadingContainer}>
          <p>Loading dashboard data...</p>
        </div>
      ) : (
        <>
          <div className={styles.statsOverview}>
            <div className={styles.statCard}>
              <h3>Total Reports</h3>
              <p className={styles.statNumber}>{reportData.length}</p>
            </div>
            <div className={styles.statCard}>
              <h3>Pending</h3>
              <p className={styles.statNumber}>{reportData.filter(r => r.status === 'pending assignee').length}</p>
            </div>
            <div className={styles.statCard}>
              <h3>In Progress</h3>
              <p className={styles.statNumber}>{reportData.filter(r => r.status === 'in progress').length}</p>
            </div>
            <div className={styles.statCard}>
              <h3>Resolved</h3>
              <p className={styles.statNumber}>{reportData.filter(r => r.status === 'resolved').length}</p>
            </div>
          </div>

          <div className={styles.grid}>
            {/* User Distribution Chart */}
            <section className={styles.section}>
              <h2>User Distribution</h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={userStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {userStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </section>

            {/* Report Status Distribution */}
            <section className={styles.section}>
              <h2>Report Status</h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </section>

            {/* Monthly Reports Trend */}
            <section className={styles.section}>
              <h2>Monthly Reports</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={monthlyReportsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="reports" fill="#8884d8" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </section>

            {/* User Activity Over Week */}
            <section className={styles.section}>
              <h2>User Activity (Past Week)</h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={userActivityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="students" stroke="#8884d8" strokeWidth={2} />
                  <Line type="monotone" dataKey="tutors" stroke="#82ca9d" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </section>

            {/* Admin Management Section - Only visible to IT admins */}
            {userRole === 'it' && (
              <section className={`${styles.section} ${styles.adminSection}`}>
                <h2>Admin Management</h2>
                {showAdminCreation ? (
                  <div className={styles.adminCreationForm}>
                    <h3>Create New Admin User</h3>
                    {creationError && <div className={styles.errorMessage}>{creationError}</div>}
                    {adminCreationResult && (
                      <div className={styles.successMessage}>
                        <p>Admin created successfully!</p>
                        <p><strong>Temporary Password:</strong> {adminCreationResult.temporaryPassword}</p>
                        <p className={styles.passwordWarning}>
                          Save this password! It won't be displayed again.
                        </p>
                      </div>
                    )}
                    <form onSubmit={handleCreateAdmin}>
                      <div className={styles.formGroup}>
                        <label>Admin Email:</label>
                        <input
                          type="email"
                          value={newAdminEmail}
                          onChange={(e) => setNewAdminEmail(e.target.value)}
                          placeholder="email@example.com"
                          required
                          className={styles.formInput}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Role:</label>
                        <select
                          value={newAdminRole}
                          onChange={(e) => setNewAdminRole(e.target.value)}
                          className={styles.formSelect}
                        >
                          <option value="admin">Admin</option>
                          <option value="it">IT Admin</option>
                        </select>
                      </div>
                      <div className={styles.formGroup}>
                        <label>Your Verification Code:</label>
                        <input
                          type="text"
                          value={adminVerificationCode}
                          onChange={(e) => setAdminVerificationCode(e.target.value)}
                          placeholder="2FA Code"
                          required
                          className={styles.formInput}
                        />
                        <p className={styles.helperText}>
                          Enter your 2FA code to confirm this action
                        </p>
                      </div>
                      <div className={styles.formActions}>
                        <button type="submit" className={styles.primaryBtn}>
                          Create Admin
                        </button>
                        <button
                          type="button"
                          className={styles.secondaryBtn}
                          onClick={() => setShowAdminCreation(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className={styles.adminList}>
                    <div className={styles.adminListHeader}>
                      <h3>Admin Users</h3>
                      <button
                        className={styles.primaryBtn}
                        onClick={() => setShowAdminCreation(true)}
                      >
                        Create New Admin
                      </button>
                    </div>
                    <div className={styles.adminTable}>
                      <div className={styles.adminTableHeader}>
                        <div>Email</div>
                        <div>Role</div>
                        <div>Created</div>
                        <div>Last Login</div>
                      </div>
                      {adminUsers.map(admin => (
                        <div key={admin.id} className={styles.adminTableRow}>
                          <div>{admin.email}</div>
                          <div>{admin.role}</div>
                          <div>{admin.createdAt}</div>
                          <div>{admin.lastLogin}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* Reports Management */}
            <section className={`${styles.section} ${styles.reportsSection}`}>
              <h2>Reports Management</h2>
              <div className={styles.reportFilters}>
                <select
                  value={reportFilter}
                  onChange={(e) => setReportFilter(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="all">All Reports</option>
                  <option value="pending assignee">Pending</option>
                  <option value="in progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

              <div className={styles.reportsList}>
                {filteredReports.length > 0 ? (
                  filteredReports.map(report => (
                    <div
                      key={report.id}
                      className={`${styles.reportItem} ${selectedReport?.id === report.id ? styles.selected : ''}`}
                      onClick={() => handleReportSelect(report)}
                    >
                      <div className={styles.reportHeader}>
                        <h4>{report.title}</h4>
                        <span className={`${styles.reportStatus} ${styles[report.status.replace(' ', '')]}`}>
                          {report.status}
                        </span>
                      </div>
                      <p className={styles.reportDate}>Reported on: {formatDate(report.createdAt)}</p>
                    </div>
                  ))
                ) : (
                  <p>No reports found.</p>
                )}
              </div>
            </section>

            {/* Report Details & Message System */}
            <section className={`${styles.section} ${styles.detailsSection}`}>
              <h2 className={styles.sectionTitle}>Report Details</h2>

              {selectedReport ? (
                <div className={styles.reportDetails}>
                  <h3 className={styles.reportTitle}>{selectedReport.title}</h3>

                  <div className={styles.statusDisplay}>
                    <span className={styles.label}>Status:</span>
                    <span className={`${styles.reportStatus} ${styles[selectedReport.status.replace(' ', '')]}`}>
                      {selectedReport.status}
                    </span>
                  </div>

                  <div className={styles.userInfoBox}>
                    <div className={styles.userInfo}>
                      <span className={styles.label}>Reported User:</span>
                      <div className={styles.userName}>{reportedUserName || "Loading..."}
                        <div className={styles.userId}>{selectedReport.reportedId}</div>
                      </div>
                    </div>
                  </div>

                  <div className={styles.userInfoBox}>
                    <div className={styles.userInfo}>
                      <span className={styles.label}>Reporter:</span>
                      <div className={styles.userName}>{reporterName || "Loading..."}
                        <div className={styles.userId}>{selectedReport.reporterId}</div>
                      </div>
                    </div>
                  </div>

                  <div className={styles.dateInfo}>
                    <span className={styles.label}>Date:</span>
                    <span className={styles.dateValue}>{formatDate(selectedReport.createdAt)}</span>
                  </div>

                  <div className={styles.reportContent}>
                    <div className={styles.contentLabel}>Content:</div>
                    <p className={styles.contentText}>{selectedReport.content}</p>
                  </div>

                  {statusUpdateError && (
                    <div className={styles.errorMessage}>
                      {statusUpdateError}
                    </div>
                  )}

                  <div className={styles.statusButtons}>
                    <button
                      className={`${styles.statusBtn} ${styles.pendingBtn}`}
                      onClick={() => handleStatusUpdate('pending assignee')}
                      disabled={selectedReport.status === 'pending assignee' || updatingStatus}
                    >
                      {updatingStatus ? 'Updating...' : 'Mark Pending'}
                    </button>
                    <button
                      className={`${styles.statusBtn} ${styles.progressBtn}`}
                      onClick={() => handleStatusUpdate('in progress')}
                      disabled={selectedReport.status === 'in progress' || updatingStatus}
                    >
                      {updatingStatus ? 'Updating...' : 'Mark In Progress'}
                    </button>
                    <button
                      className={`${styles.statusBtn} ${styles.resolvedBtn}`}
                      onClick={() => handleStatusUpdate('resolved')}
                      disabled={selectedReport.status === 'resolved' || updatingStatus}
                    >
                      {updatingStatus ? 'Updating...' : 'Mark Resolved'}
                    </button>
                  </div>

                  <div className={styles.messageSystem}>
                    <h4 className={styles.messageHeader}>Email User</h4>

                    {emailError && (
                      <div className={styles.errorMessage}>
                        {emailError}
                      </div>
                    )}

                    <div className={styles.emailForm}>
                      <p className={styles.emailNote}>
                        Sending an email will open your default email client with a pre-populated message.
                        The reporter can reply directly to continue the conversation.
                      </p>
                      <textarea
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder="Type your message to the reporter..."
                        className={styles.messageInput}
                      ></textarea>
                      <button
                        className={styles.sendBtn}
                        onClick={handleSendMessage}
                        disabled={!messageText.trim() || sendingEmail}
                      >
                        {sendingEmail ? 'Opening Email Client...' : 'Send Email'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <p className={styles.selectPrompt}>Select a report to view details</p>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard; 