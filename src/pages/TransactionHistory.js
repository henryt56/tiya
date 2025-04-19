import React, { useState } from 'react';
import styles from '../styles/TransactionHistory.module.css';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { TextField } from '@mui/material';
import dayjs from 'dayjs';

const ITEMS_PER_PAGE = 14;

const transactions = Array.from({ length: 112 }, (_, i) => ({
  id: i + 1,
  date: dayjs('2025-08-17').add(i, 'day').format('YYYY-MM-DD'),
  status: i % 7 === 0 ? 'Cancelled' : i % 5 === 0 ? 'Pending' : 'Processed',
  tutor: 'Tutor Name',
}));

export default function TransactionHistory() {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [page, setPage] = useState(1);

  const filteredTransactions = transactions.filter((t) => {
    if (!startDate || !endDate) return true;
    const tDate = dayjs(t.date);
    return (
      tDate.isAfter(dayjs(startDate).subtract(1, 'day')) &&
      tDate.isBefore(dayjs(endDate).add(1, 'day'))
    );
  });

  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  const pageData = filteredTransactions.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

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
        <span key={`ellipsis-${idx}`} className={styles.ellipsis}>...</span>
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
                  onChange={(newValue) => setStartDate(newValue)}
                  renderInput={(params) => <TextField {...params} size="small" />}
                />
                <span className={styles.toLabel}>to</span>
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={(newValue) => setEndDate(newValue)}
                  renderInput={(params) => <TextField {...params} size="small" />}
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
              {pageData.map((t) => (
                <tr key={t.id}>
                  <td><i>{t.date}</i></td>
                  <td><i>{t.status}</i></td>
                  <td><i>{t.tutor}</i></td>
                </tr>
              ))}
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
  );
}
