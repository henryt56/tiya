import React, { useState, useEffect } from 'react';
import styles from '../styles/TransactionHistory.module.css';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../services/context/AuthContext';

const ITEMS_PER_PAGE = 14;

export default function TransactionHistory() {
	const { currentUser } = useAuth();
	const [startDate, setStartDate] = useState(null);
	const [endDate, setEndDate] = useState(null);
	const [page, setPage] = useState(1);
	const [transactions, setTransactions] = useState([]);
	const [loading, setLoading] = useState(true);
	const [dateFilterChanged, setDateFilterChanged] = useState(0);

	useEffect(() => {
		const fetchTransactions = async () => {
			if (!currentUser?.uid) return;

			try {
				setLoading(true);
				const sessionsRef = collection(db, 'sessions');
				const q = query(
					sessionsRef,
					where('studentId', '==', currentUser.uid),
					where('paymentStatus', 'in', ['paid', 'unpaid'])
				);

				const querySnapshot = await getDocs(q);
				const sessionData = [];

				querySnapshot.forEach((doc) => {
					const session = doc.data();

					let transactionDate;
					if (session.paymentStatus === 'paid' && session.updatedAt?.toDate) {
						transactionDate = session.updatedAt.toDate();
					} else if (session.date?.toDate) {
						transactionDate = session.date.toDate();
					} else {
						transactionDate = new Date();
					}

					let status = null;
					if (session.status === 'canceled') {
						status = 'Cancelled';
					} else if (
						session.status === 'confirmed' &&
						(!session.paymentStatus || session.paymentStatus === 'unpaid')
					) {
						status = 'Pending';
					} else if (
						session.status === 'confirmed' &&
						session.paymentStatus === 'paid'
					) {
						status = 'Processed';
					}

					sessionData.push({
						id: doc.id,
						date: dayjs(transactionDate).format('YYYY-MM-DD'),
						status: status,
						tutor: session.tutorName || '',
						rawDate: transactionDate,
					});
				});

				sessionData.sort((a, b) => b.rawDate - a.rawDate);
				setTransactions(sessionData);
			} catch (e) {
				console.error('Error fetching transactions:', e);
			} finally {
				setLoading(false);
			}
		};
		fetchTransactions();
	}, [currentUser]);

	const filteredTransactions = transactions.filter((t) => {
		if (!startDate && !endDate) return true;
		const tDate = dayjs(t.rawDate).format('YYYY-MM-DD');
		const start = startDate ? dayjs(startDate).format('YYYY-MM-DD') : null;
		const end = endDate ? dayjs(endDate).format('YYYY-MM-DD') : null;

		if (start && !end) return tDate >= start;
		if (!start && end) return tDate <= end;

		return tDate >= start && tDate <= end;
	});

	useEffect(() => {
		setPage(1);
	}, [startDate, endDate, dateFilterChanged]);

	const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE));
	const pageData = filteredTransactions.slice(
		(page - 1) * ITEMS_PER_PAGE,
		page * ITEMS_PER_PAGE
	);

	const handleStartDateChange = (newValue) => {
		setStartDate(newValue);
		setDateFilterChanged((prev) => prev + 1);
	};

	const handleEndDateChange = (newValue) => {
		setEndDate(newValue);
		setDateFilterChanged((prev) => prev + 1);
	};

	const renderPagination = () => {
		const pages = [];

		if (totalPages <= 7) {
			for (let i = 1; i <= totalPages; i++) {
				pages.push(i);
			}
		} else {
			if (page <= 4) {
				pages.push(1, 2, 3, 4, 5, '...', totalPages);
			} else if (page >= totalPages - 3) {
				pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
			} else {
				pages.push(1, '...', page - 1, page, page + 1, '...', totalPages);
			}
		}

		return pages.map((p, idx) =>
			p === '...' ? (
				<span key={`ellipsis-${idx}`} className={styles.ellipsis}>
					...
				</span>
			) : (
				<button
					key={p}
					onClick={() => setPage(p)}
					className={`${styles.pageButton} ${page === p ? styles.activePage : ''}`}
				>
					{p}
				</button>
			)
		);
	};

	return (
		<div className={styles.pageContainer}>
			<div className={styles.transactionHistoryContainer}>
				<div className={styles.flexLayout}>
					<div className={styles.leftColumn}>
						<h1 className={styles.heading}>Transaction History</h1>
						<div className={styles.calendarWrapper}>
							<label className={styles.rangeLabel}>Date Range</label>
							<LocalizationProvider dateAdapter={AdapterDayjs}>
								<div className={styles.dateInputs}>
									<DatePicker
										label="Start Date"
										value={startDate}
										onChange={handleStartDateChange}
										slotProps={{
											textField: { size: 'small' },
										}}
									/>
									<span className={styles.toLabel}>to</span>
									<DatePicker
										label="End Date"
										value={endDate}
										onChange={handleEndDateChange}
										slotProps={{
											textField: { size: 'small' },
										}}
									/>
								</div>
							</LocalizationProvider>
						</div>
					</div>

					<div className={styles.transactionTableWrapper}>
						<table className={styles.transactionTable}>
							<thead>
								<tr>
									<th>Date</th>
									<th>Status</th>
									<th>Order To</th>
								</tr>
							</thead>
							<tbody>
								{loading ? (
									<tr>
										<td colSpan={3} style={{ textAlign: 'center' }}>Loading...</td>
									</tr>
								) : pageData.length > 0 ? (
									pageData.map((t) => (
										<tr key={t.id}>
											<td><i>{t.date}</i></td>
											<td><i>{t.status}</i></td>
											<td><i>{t.tutor}</i></td>
										</tr>
									))
								) : (
									<tr>
										<td colSpan={3} style={{ textAlign: 'center' }}>
											No transactions found
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</div>

				<div className={styles.pagination}>
					<button onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1}>
						← Previous
					</button>
					{renderPagination()}
					<button onClick={() => setPage((p) => Math.min(p + 1, totalPages))} disabled={page === totalPages}>
						Next →
					</button>
				</div>
			</div>
		</div>
	);
}
