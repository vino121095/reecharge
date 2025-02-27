import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import AdminLayout from '../AdminLayout';
import baseurl from '../../Api Service/ApiService';

const UserList = () => {
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'ascending' });
  const [editModalShow, setEditModalShow] = useState(false);
  const [showView, setShowView] = useState(false);
  const [viewUser, setViewUser] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [employeeId, setEmployeeId] = useState(null);
  const [userRole, setUserRole] = useState('');
  const [showRechargeOnly, setShowRechargeOnly] = useState(false);

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

  const fetchPendingData = async () => {
    try {
      const userRoleFromSession = localStorage.getItem('userType') || 'employee';
      const employeeIdFromSession = JSON.parse(localStorage.getItem('employeeId'));
      setUserRole(userRoleFromSession);
      setEmployeeId(employeeIdFromSession);

      const response = await fetch(`${baseurl}/api/home_data/pending`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();

      let sanitizedData = data.map(user => ({
        ...user,
        plan_type: user.plan_type || '',
        mobile_number: user.mobile_number || '',
        operator: user.operator || '',
        createdAt: user.createdAt || '',
        updatedAt: user.updatedAt || '',
        user_name: user.user_name || '',
        status: user.payment_status || 'pending',
        hasPrice: user.amount && parseFloat(user.amount) > 0
      }));

      // Only apply recharge distribution logic for employees
      if (userRoleFromSession === 'employee') {
        try {
          const activeEmployeesResponse = await fetch(`${baseurl}/api/active-employees`);
          if (!activeEmployeesResponse.ok) throw new Error("Failed to fetch active employees.");
          const activeEmployeesData = await activeEmployeesResponse.json();

          if (sanitizedData.length >= 1) {
            const employeeCount = activeEmployeesData.data.length;
            const rechargesPerEmployee = Math.floor(sanitizedData.length / employeeCount);

            const employeeIndex = activeEmployeesData.data.findIndex(emp => emp.eid === employeeIdFromSession);

            if (employeeIndex !== -1) {
              const startIndex = employeeIndex * rechargesPerEmployee;
              let endIndex = startIndex + rechargesPerEmployee;

              if (employeeIndex === employeeCount - 1) {
                endIndex = sanitizedData.length;
              }

              sanitizedData = sanitizedData.slice(startIndex, endIndex);
            }
          }
        } catch (error) {
          console.error("Error in employee data distribution:", error);
          // Continue with full dataset if distribution fails
        }
      }

      setOperators(sanitizedData);
      setLoading(false);
    } catch (error) {
      console.error("Error Occurred:", error.message);
      setError(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingData();
    const interval = setInterval(fetchPendingData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Rest of your component code remains the same...
  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleEditClick = (user) => {
    setCurrentUser(user);
    setNewStatus(user.status);
    setEditModalShow(true);
  };

  const handleStatusChange = (e) => {
    setNewStatus(e.target.value);
  };

  const handleSaveEdit = async () => {
    try {
      if (!currentUser) return;

      const response = await fetch(`${baseurl}/api/home_data/payment/${currentUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_status: newStatus,
          payment_date: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update payment status');
      }

      await fetchPendingData();
      setEditModalShow(false);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const updatedOperators = operators.filter(op => op.id !== userId);
        setOperators(updatedOperators);
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleView = (user) => {
    setViewUser(user);
    setShowView(true);
  };

  const handleCloseView = () => {
    setShowView(false);
    setViewUser(null);
  };

  const toggleRechargeDisplay = () => {
    setShowRechargeOnly(!showRechargeOnly);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  // Filter and sort logic
  const filteredUsers = operators.filter((user) => {
    // Text search filter
    const searchableFields = [
      user.operator,
      user.user_name,
      user.mobile_number
    ].map(field => (field || '').toLowerCase());
    
    const matchesSearch = searchableFields.some(field => 
      field.includes(searchTerm.toLowerCase())
    );
    
    // Price filter (only apply if toggle is ON)
    const matchesPriceFilter = showRechargeOnly ? user.hasPrice : true;
    
    return matchesSearch && matchesPriceFilter;
  });

  const sortedUsers = filteredUsers.sort((a, b) => {
    if (sortConfig.key === 'payment_date') {
      // Special handling for date sorting
      const dateA = a.payment_date ? new Date(a.payment_date).getTime() : 0;
      const dateB = b.payment_date ? new Date(b.payment_date).getTime() : 0;
      
      return sortConfig.direction === 'ascending' 
        ? dateA - dateB
        : dateB - dateA;
    } else {
      // Regular sorting for other fields
      const aValue = a[sortConfig.key] || '';
      const bValue = b[sortConfig.key] || '';
      
      return sortConfig.direction === 'ascending' 
        ? aValue > bValue ? 1 : -1 
        : aValue < bValue ? 1 : -1;
    }
  });

  const totalItems = sortedUsers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const currentItems = sortedUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) return (
    <AdminLayout>
      <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    </AdminLayout>
  );

  if (error) return (
    <AdminLayout>
      <div className="alert alert-danger m-4" role="alert">
        Error: {error}
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div className="container-fluid mt-4">
        <div className="card">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">User List {userRole === 'admin' ? '(Admin View)' : '(Employee View)'}</h5>
          </div>
          <div className="card-body">
            {/* Search, Filter Controls, and Toggle */}
            <div className="row mb-3">
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by Operator, Username, or Phone"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="toggleRecharge"
                    checked={showRechargeOnly}
                    onChange={toggleRechargeDisplay}
                  />
                  <label className="form-check-label" htmlFor="toggleRecharge">
                    {showRechargeOnly ? "Showing items with recharge price only" : "Showing all items"}
                  </label>
                </div>
              </div>
              <div className="col-md-2 ms-auto">
                <select 
                  className="form-select"
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value={5}>5 per page</option>
                  <option value={10}>10 per page</option>
                  <option value={20}>20 per page</option>
                  <option value={50}>50 per page</option>
                </select>
              </div>
            </div>

            {/* Stats Summary */}
            <div className="row mb-3">
              <div className="col-md-12">
                <div className="alert alert-info py-2">
                  <div className="d-flex justify-content-between">
                    <span><strong>Total Records:</strong> {operators.length}</span>
                    {/* <span><strong>Filtered Records:</strong> {totalItems}</span> */}
                    <span><strong>Records with Price:</strong> {operators.filter(op => op.hasPrice).length}</span>
                    <span><strong>Records without Price:</strong> {operators.filter(op => !op.hasPrice).length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th onClick={() => handleSort('id')} style={{ cursor: 'pointer' }}>
                      S No {sortConfig.key === 'id' && (
                        <i className={`bi bi-arrow-${sortConfig.direction === 'ascending' ? 'up' : 'down'}`}></i>
                      )}
                    </th>
                    <th onClick={() => handleSort('user_name')} style={{ cursor: 'pointer' }}>
                      Username {sortConfig.key === 'user_name' && (
                        <i className={`bi bi-arrow-${sortConfig.direction === 'ascending' ? 'up' : 'down'}`}></i>
                      )}
                    </th>
                    <th>Phone Number</th>
                    <th>Operator</th>
                    <th>Type</th>
                    <th onClick={() => handleSort('payment_date')} style={{ cursor: 'pointer' }}>
                      Date & Time {sortConfig.key === 'payment_date' && (
                        <i className={`bi bi-arrow-${sortConfig.direction === 'ascending' ? 'up' : 'down'}`}></i>
                      )}
                    </th>
                    <th onClick={() => handleSort('amount')} style={{ cursor: 'pointer' }}>
                      Price {sortConfig.key === 'amount' && (
                        <i className={`bi bi-arrow-${sortConfig.direction === 'ascending' ? 'up' : 'down'}`}></i>
                      )}
                    </th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="text-center">No records found</td>
                    </tr>
                  ) : (
                    currentItems.map((user, index) => (
                      <tr key={user.id} className={user.hasPrice ? "" : "table-light"}>
                        <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                        <td>{user.username}</td>
                        <td>{user.mobile_number}</td>
                        <td>{user.operator}</td>
                        <td>{user.plan_type}</td>
                        <td>{formatDateTime(user.payment_date)}</td>
                        <td>{user.amount ? `₹${user.amount}` : "-"}</td>
                        <td>{user.status}</td>
                        <td>
                          <button
                            className="btn btn-link p-0 me-2"
                            onClick={() => handleView(user)}
                          >
                            <i className="bi bi-eye-fill text-primary"></i>
                          </button>
                          <button
                            className="btn btn-link p-0 me-2"
                            onClick={() => handleEditClick(user)}
                          >
                            <i className="bi bi-pencil-fill text-warning"></i>
                          </button>
                          <button
                            className="btn btn-link p-0"
                            onClick={() => handleDelete(user.id)}
                          >
                            <i className="bi bi-trash-fill text-danger"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <nav className="mt-3">
                <ul className="pagination justify-content-center">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => setCurrentPage(prev => prev - 1)}
                    >
                      Previous
                    </button>
                  </li>
                  {[...Array(totalPages)].map((_, i) => (
                    <li 
                      key={i + 1} 
                      className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}
                    >
                      <button 
                        className="page-link" 
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </button>
                    </li>
                  ))}
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => setCurrentPage(prev => prev + 1)}
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            )}
          </div>
        </div>

        {/* View Modal */}
        {showView && viewUser && (
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">User Details</h5>
                  <button type="button" className="btn-close" onClick={handleCloseView}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-2"><strong>Username:</strong> {viewUser.username}</div>
                  <div className="mb-2"><strong>Phone Number:</strong> {viewUser.mobile_number}</div>
                  <div className="mb-2"><strong>Operator:</strong> {viewUser.operator}</div>
                  <div className="mb-2"><strong>Type:</strong> {viewUser.plan_type}</div>
                  <div className="mb-2"><strong>Created At:</strong> {formatDateTime(viewUser.payment_date)}</div>
                  <div className="mb-2"><strong>Price:</strong> {viewUser.amount ? `₹${viewUser.amount}` : "No price set"}</div>
                  <div className="mb-2">
                    <strong>Status:</strong> {viewUser.status}
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={handleCloseView}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal - Updated to include user details */}
        {editModalShow && currentUser && (
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Edit Status</h5>
                  <button type="button" className="btn-close" onClick={() => setEditModalShow(false)}></button>
                </div>
                <div className="modal-body">
                  {/* User Details Section */}
                  <div className="user-details mb-4 p-3 border rounded bg-light">
                    <h6 className="border-bottom pb-2 mb-3">User Details</h6>
                    <div className="mb-2"><strong>Username:</strong> {currentUser.username}</div>
                    <div className="mb-2"><strong>Phone Number:</strong> {currentUser.mobile_number}</div>
                    <div className="mb-2"><strong>Operator:</strong> {currentUser.operator}</div>
                    <div className="mb-2"><strong>Type:</strong> {currentUser.plan_type}</div>
                    <div className="mb-2"><strong>Created At:</strong> {formatDateTime(currentUser.payment_date)}</div>
                    <div className="mb-2"><strong>Price:</strong> {currentUser.amount ? `₹${currentUser.amount}` : "No price set"}</div>
                  </div>
                  
                  {/* Status Update Section */}
                  <div className="mt-3">
                    <label className="form-label fw-bold">Update Status:</label>
                    <select
                      className="form-select"
                      value={newStatus}
                      onChange={handleStatusChange}
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setEditModalShow(false)}
                  >
                    Close
                  </button>
                  <button 
                    type="button"
                    className="btn btn-primary" 
                    onClick={handleSaveEdit}
                    disabled={!newStatus}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Backdrop */}
        {(showView || editModalShow) && <div className="modal-backdrop show"></div>}
      </div>
    </AdminLayout>
  );
};

export default UserList;