import React, { useState, useEffect } from 'react';
import AdminLayout from '../AdminLayout';
import baseurl from '../../Api Service/ApiService';

function PaidList() {
  const [paidList, setPaidList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'payment_date', direction: 'desc' });
  const [exportDate, setExportDate] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showDateRange, setShowDateRange] = useState(false);
  const [userType, setUserType] = useState('');
  const [userId, setUserId] = useState('');

  // Format date to match UserList format (DD-MM-YYYY HH:MM)
  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);

    if (isNaN(date.getTime())) return dateString;

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${day}-${month}-${year} ${hours}:${minutes}`;
  };

  useEffect(() => {
    // Check user type and ID from local storage
    const checkUserType = () => {
      try {
        const empid = localStorage.getItem('employeeId');
        const type = localStorage.getItem('userType');
        const id = empid;

        setUserType(type);
        setUserId(id);
      } catch (error) {
        console.error('Error parsing user data:', error);
        setError('Failed to load user information');
      }
    };

    checkUserType();
  }, []);

  useEffect(() => {
    const fetchPaidData = async () => {
      try {
        let response;

        // Use different API endpoints based on user type
        if (userType === 'admin') {
          // Admin sees all paid records
          response = await fetch(`${baseurl}/api/home_data/paid`);
        } else if (userType === 'employee' && userId) {
          // Employee sees only their own paid records
          response = await fetch(`${baseurl}/api/home_data/paid/employee/${userId}`);
        } else {
          // Default if type is not determined yet
          return;
        }

        if (!response.ok) {
          throw new Error(`Failed to fetch paid records: ${response.status}`);
        }

        const data = await response.json();
        setPaidList(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching paid data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch data if userType is determined
    if (userType) {
      fetchPaidData();
      const interval = setInterval(fetchPaidData, 10000);
      return () => clearInterval(interval);
    }
  }, [userType, userId]); // Dependency on userType and userId

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedData = () => {
    if (!paidList.length) return [];

    const sortableItems = [...paidList];
    sortableItems.sort((a, b) => {
      // Handle date fields consistently
      if (sortConfig.key === 'payment_date' ||
        sortConfig.key === 'user_payment_datetime' ||
        sortConfig.key === 'last_loginat' ||
        sortConfig.key === 'last_logoutat') {

        let dateA, dateB;

        if (sortConfig.key === 'last_loginat' || sortConfig.key === 'last_logoutat') {
          // For employee fields, check if they exist
          dateA = a.employee && a.employee[sortConfig.key] ? new Date(a.employee[sortConfig.key]) : new Date(0);
          dateB = b.employee && b.employee[sortConfig.key] ? new Date(b.employee[sortConfig.key]) : new Date(0);
        } else {
          // For direct fields
          dateA = new Date(a[sortConfig.key] || '');
          dateB = new Date(b[sortConfig.key] || '');
        }

        // Handle invalid dates
        if (isNaN(dateA.getTime())) dateA = new Date(0);
        if (isNaN(dateB.getTime())) dateB = new Date(0);

        if (dateA < dateB) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (dateA > dateB) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      } else if (sortConfig.key === 'amount') {
        const amountA = parseFloat(a[sortConfig.key] || 0);
        const amountB = parseFloat(b[sortConfig.key] || 0);
        return sortConfig.direction === 'asc'
          ? amountA - amountB
          : amountB - amountA;
      } else {
        const valA = a[sortConfig.key] || '';
        const valB = b[sortConfig.key] || '';
        if (valA < valB) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (valA > valB) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      }
    });
    return sortableItems;
  };

  const exportToExcel = () => {
    try {
      // Check if there's data to export
      if (paidList.length === 0) {
        alert('No data available to export');
        return;
      }

      // Filter data based on date selection
      let filteredData = [...paidList];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (exportDate === 'today') {
        filteredData = paidList.filter(user => {
          const paymentDate = new Date(user.payment_date || '');
          paymentDate.setHours(0, 0, 0, 0);
          return paymentDate.getTime() === today.getTime();
        });
      } else if (exportDate === 'date-range' && startDate && endDate) {
        const startDateTime = new Date(startDate);
        startDateTime.setHours(0, 0, 0, 0);

        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);

        filteredData = paidList.filter(user => {
          const paymentDate = new Date(user.payment_date || '');
          return paymentDate >= startDateTime && paymentDate <= endDateTime;
        });
      }

      // Check if filtered data is empty
      if (filteredData.length === 0) {
        alert('No data available for the selected date range');
        return;
      }

      // Prepare data for export
      const exportData = filteredData.map((user, index) => ({
        'S No': index + 1,
        'Username': user.username || '',
        'Phone Number': user.mobile_number || '',
        'Operator': user.operator || '',
        'Type': user.plan_type || '',
        'Amount': user.amount || 0,
        'User Payment Date': user.user_payment_datetime ? formatDateTime(user.user_payment_datetime) : '',
        'Employee Payment Date': user.payment_date ? formatDateTime(user.payment_date) : '',
        'Status': user.payment_status || '',
        'Last Login': user.employee?.last_loginat ? formatDateTime(user.employee.last_loginat) : '',
        'Last Logout': user.employee?.last_logoutat ? formatDateTime(user.employee.last_logoutat) : ''
      }));

      // Convert to CSV
      const headers = Object.keys(exportData[0] || {});
      const csvRows = [];
      csvRows.push(headers.join(','));

      exportData.forEach(row => {
        const values = headers.map(header => {
          const value = row[header] !== undefined ? row[header] : '';
          // Handle values with commas by enclosing in quotes
          return `"${value.toString().replace(/"/g, '""')}"`;
        });
        csvRows.push(values.join(','));
      });

      // Create and download CSV file
      const csvString = csvRows.join('\n');
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });

      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      const dateFormat = new Date().toISOString().split('T')[0];
      link.setAttribute('href', url);
      link.setAttribute('download', `paid_users_${dateFormat}.csv`);
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url); // Clean up
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  const getSortIndicator = (column) => {
    if (sortConfig.key === column) {
      return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
    }
    return '';
  };

  const handleExportDateChange = (e) => {
    const value = e.target.value;
    setExportDate(value);
    setShowDateRange(value === 'date-range');
  };

  if (loading) return (
    <AdminLayout>
      <div className="container mt-4">
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    </AdminLayout>
  );

  if (error) return (
    <AdminLayout>
      <div className="container mt-4">
        <div className="alert alert-danger" role="alert">
          Error: {error}
        </div>
      </div>
    </AdminLayout>
  );

  const sortedData = getSortedData();

  return (
    <AdminLayout>
      <div className="container mt-4">
        <div className="card">
          <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              {userType === 'admin' ? 'Paid Users List' : 'My Paid List'}
            </h5>
            <div className="export-controls d-flex">
              <select
                className="form-select form-select-sm me-2"
                value={exportDate}
                onChange={handleExportDateChange}
              >
                <option value="all">All Data</option>
                <option value="today">Today</option>
                <option value="date-range">Date Range</option>
              </select>

              {showDateRange && (
                <>
                  <input
                    type="date"
                    className="form-control form-control-sm me-2"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  <input
                    type="date"
                    className="form-control form-control-sm me-2"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </>
              )}

              <button
                className="btn btn-sm btn-light"
                onClick={exportToExcel}
                disabled={exportDate === 'date-range' && (!startDate || !endDate)}
              >
                Export Excel
              </button>
            </div>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table text-center">
                <thead>
                  <tr>
                    <th>S No</th>
                    <th onClick={() => requestSort('username')} style={{ cursor: 'pointer' }}>
                      Username {getSortIndicator('username')}
                    </th>
                    <th onClick={() => requestSort('mobile_number')} style={{ cursor: 'pointer' }}>
                      Phone Number {getSortIndicator('mobile_number')}
                    </th>
                    <th onClick={() => requestSort('operator')} style={{ cursor: 'pointer' }}>
                      Operator {getSortIndicator('operator')}
                    </th>
                    <th onClick={() => requestSort('plan_type')} style={{ cursor: 'pointer' }}>
                      Type {getSortIndicator('plan_type')}
                    </th>
                    <th onClick={() => requestSort('amount')} style={{ cursor: 'pointer' }}>
                      Amount {getSortIndicator('amount')}
                    </th>
                    <th onClick={() => requestSort('user_payment_datetime')} style={{ cursor: 'pointer' }}>
                      User Payment Date {getSortIndicator('user_payment_datetime')}
                    </th>
                    <th onClick={() => requestSort('payment_date')} style={{ cursor: 'pointer' }}>
                      Employee Payment Date {getSortIndicator('payment_date')}
                    </th>
                    <th onClick={() => requestSort('payment_status')} style={{ cursor: 'pointer' }}>
                      Status {getSortIndicator('payment_status')}
                    </th>
                    <th style={{ cursor: 'pointer' }}>
                      Image
                    </th>
                    <th onClick={() => requestSort('last_loginat')} style={{ cursor: 'pointer' }}>
                      Last Login {getSortIndicator('last_loginat')}
                    </th>
                    <th onClick={() => requestSort('last_logoutat')} style={{ cursor: 'pointer' }}>
                      Last Logout {getSortIndicator('last_logoutat')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedData.length === 0 ? (
                    <tr>
                      <td colSpan="11">No paid users found.</td>
                    </tr>
                  ) : (
                    sortedData.map((user, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{user.username || '-'}</td>
                        <td>{user.mobile_number || '-'}</td>
                        <td>{user.operator || '-'}</td>
                        <td>{user.plan_type || '-'}</td>
                        <td>₹{user.amount || '0'}</td>
                        <td>{formatDateTime(user.user_payment_datetime)}</td>
                        <td>{formatDateTime(user.payment_date)}</td>
                        <td>
                          {user.payment_status || '-'}
                        </td>
                        <td>
                          <img src={`${baseurl}/${user.screenshot_path}`} alt={user.username} style={{width:'50px'}}/>
                        </td>

                        <td>
                          {user.employee?.last_loginat
                            ? formatDateTime(user.employee.last_loginat)
                            : '-'}
                        </td>
                        <td>
                          {user.employee?.last_logoutat
                            ? formatDateTime(user.employee.last_logoutat)
                            : '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default PaidList;