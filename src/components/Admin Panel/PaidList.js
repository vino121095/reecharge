import React, { useState, useEffect } from 'react';
import AdminLayout from '../AdminLayout';
import baseurl from '../../Api Service/ApiService';

function PaidList() {
  const [paidList, setPaidList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'payment_date', direction: 'desc' });
  const [exportDate, setExportDate] = useState('today');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showDateRange, setShowDateRange] = useState(false);

  useEffect(() => {
    const fetchPaidData = async () => {
      try {
        const response = await fetch(`${baseurl}/api/home_data/paid`);
        if (!response.ok) {
          throw new Error('Failed to fetch paid records');
        }
        const data = await response.json();
        setPaidList(data);
      } catch (error) {
        console.error('Error fetching paid data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPaidData();
    const interval = setInterval(fetchPaidData, 10000);
    return () => clearInterval(interval);
  }, []);

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
      if (sortConfig.key === 'payment_date') {
        const dateA = new Date(a[sortConfig.key]);
        const dateB = new Date(b[sortConfig.key]);
        if (dateA < dateB) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (dateA > dateB) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      } else if (sortConfig.key === 'amount') {
        return sortConfig.direction === 'asc' 
          ? parseFloat(a[sortConfig.key]) - parseFloat(b[sortConfig.key])
          : parseFloat(b[sortConfig.key]) - parseFloat(a[sortConfig.key]);
      } else {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      }
    });
    return sortableItems;
  };

  const exportToExcel = () => {
    // Filter data based on date selection
    let filteredData = [...paidList];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (exportDate === 'today') {
      filteredData = paidList.filter(user => {
        const paymentDate = new Date(user.payment_date);
        paymentDate.setHours(0, 0, 0, 0);
        return paymentDate.getTime() === today.getTime();
      });
    } else if (exportDate === 'date-range' && startDate && endDate) {
      const startDateTime = new Date(startDate);
      startDateTime.setHours(0, 0, 0, 0);
      
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);
      
      filteredData = paidList.filter(user => {
        const paymentDate = new Date(user.payment_date);
        return paymentDate >= startDateTime && paymentDate <= endDateTime;
      });
    }

    // Prepare data for export
    const exportData = filteredData.map((user, index) => ({
      'S No': index + 1,
      'Username': user.username,
      'Phone Number': user.mobile_number,
      'Operator': user.operator,
      'Type': user.plan_type,
      'Amount': user.amount,
      'Payment Date': new Date(user.payment_date).toLocaleString(),
      'Status': user.payment_status
    }));

    // Convert to CSV
    const headers = Object.keys(exportData[0] || {});
    const csvRows = [];
    csvRows.push(headers.join(','));

    exportData.forEach(row => {
      const values = headers.map(header => {
        const value = row[header] || '';
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
  };

  const getSortIndicator = (column) => {
    if (sortConfig.key === column) {
      return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
    }
    return '';
  };

  const handleExportDateChange = (e) => {
    setExportDate(e.target.value);
    setShowDateRange(e.target.value === 'date-range');
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const sortedData = getSortedData();

  return (
    <AdminLayout>
      <div className="container mt-4">
        <div className="card">
          <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Paid Users List</h5>
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
                    <th onClick={() => requestSort('username')} style={{cursor: 'pointer'}}>
                      Username {getSortIndicator('username')}
                    </th>
                    <th onClick={() => requestSort('mobile_number')} style={{cursor: 'pointer'}}>
                      Phone Number {getSortIndicator('mobile_number')}
                    </th>
                    <th onClick={() => requestSort('operator')} style={{cursor: 'pointer'}}>
                      Operator {getSortIndicator('operator')}
                    </th>
                    <th onClick={() => requestSort('plan_type')} style={{cursor: 'pointer'}}>
                      Type {getSortIndicator('plan_type')}
                    </th>
                    <th onClick={() => requestSort('amount')} style={{cursor: 'pointer'}}>
                      Amount {getSortIndicator('amount')}
                    </th>
                    <th onClick={() => requestSort('payment_date')} style={{cursor: 'pointer'}}>
                      Payment Date {getSortIndicator('payment_date')}
                    </th>
                    <th onClick={() => requestSort('payment_status')} style={{cursor: 'pointer'}}>
                      Status {getSortIndicator('payment_status')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedData.length === 0 ? (
                    <tr>
                      <td colSpan="8">No paid users found.</td>
                    </tr>
                  ) : (
                    sortedData.map((user, index) => (
                      <tr key={user.id}>
                        <td>{index + 1}</td>
                        <td>{user.username}</td>
                        <td>{user.mobile_number}</td>
                        <td>{user.operator}</td>
                        <td>{user.plan_type}</td>
                        <td>₹{user.amount}</td>
                        <td>{new Date(user.payment_date).toLocaleString()}</td>
                        <td>
                          {user.payment_status}
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