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
  const [deleteInProgress, setDeleteInProgress] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [assignedToMe, setAssignedToMe] = useState(0);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);

  // Function to format image paths correctly
  const formatImagePath = (path) => {
    if (!path) return null;
    
    // Replace backslashes with forward slashes for web URLs
    const formattedPath = path.replace(/\\/g, '/');
    
    // Check if path already includes base URL
    if (formattedPath.startsWith('http') || formattedPath.startsWith('/')) {
      return formattedPath;
    }
    
    // Add the base URL
    return `${baseurl}/${formattedPath}`;
  };

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

      let url;
      
      // Use different endpoints based on user role
      if (userRoleFromSession === 'admin') {
        // Admins see all pending records
        url = `${baseurl}/api/home_data/pending`;
      } else {
        // Employees only see records assigned to them
        url = `${baseurl}/api/home_data/getemployeedata/${Number(employeeIdFromSession)}`;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();

      // Process the data to handle null values and add flags
      const processedData = data.map(user => ({
        ...user,
        plan_type: user.plan_type || '',
        mobile_number: user.mobile_number || '',
        operator: user.operator || '',
        payment_date: user.payment_date || '',
        username: user.username || '',
        status: user.payment_status || 'pending',
        hasPrice: user.amount && parseFloat(user.amount) > 0,
        old_price: user.old_price || 0,
        // Format screenshot path correctly
        screenshot_url: formatImagePath(user.screenshot_url || user.screenshot_path || null)
      }));

      setOperators(processedData);
      setTotalRecords(data.length);
      
      // If employee role, count how many records are assigned to this employee
      if (userRoleFromSession === 'employee') {
        setAssignedToMe(data.length);
      } else if (userRoleFromSession === 'admin') {
        // For admin, count records assigned to each employee
        try {
          const activeEmployeesResponse = await fetch(`${baseurl}/api/active-employees`);
          if (activeEmployeesResponse.ok) {
            const activeEmployeesData = await activeEmployeesResponse.json();
            
            // If there are assigned records, show in console for admin visibility
            if (activeEmployeesData.data && activeEmployeesData.data.length > 0) {
              const assignmentCounts = {};
              
              data.forEach(record => {
                if (record.emp_id) {
                  assignmentCounts[record.emp_id] = (assignmentCounts[record.emp_id] || 0) + 1;
                }
              });
            }
          }
        } catch (error) {
          console.error("Error fetching employee assignment data:", error);
        }
      }

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
        setDeleteInProgress(true);
        
        // Call the delete API endpoint
        const response = await fetch(`${baseurl}/api/home_data/${userId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to delete user. Status: ${response.status}`);
        }

        // Update the UI after successful deletion
        const updatedOperators = operators.filter(op => op.id !== userId);
        setOperators(updatedOperators);
        
        // Show success message
        alert('User deleted successfully');
      } catch (error) {
        console.error('Error deleting user:', error);
        alert(`Error deleting user: ${error.message}`);
      } finally {
        setDeleteInProgress(false);
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

  const handleViewImage = (imageUrl) => {
    if (imageUrl) {
      setImagePreviewUrl(imageUrl);
      setShowImageModal(true);
    } else {
      alert('No screenshot available for this user.');
    }
  };

  const handleCloseImageModal = () => {
    setShowImageModal(false);
    setImagePreviewUrl(null);
  };

  const toggleRechargeDisplay = () => {
    setShowRechargeOnly(!showRechargeOnly);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleForceRedistribution = async () => {
    // Only admins can force redistribution
    if (userRole !== 'admin') return;
    
    if (window.confirm('Are you sure you want to redistribute all pending records among active employees?')) {
      try {
        setLoading(true);
        
        const response = await fetch(`${baseurl}/api/redistribute-pending`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to redistribute records');
        }
        
        const result = await response.json();
        alert(`Redistribution ${result.redistributed ? 'successful' : 'not needed'}. ${result.message}`);
        
        // Refresh data
        await fetchPendingData();
      } catch (error) {
        console.error('Error during redistribution:', error);
        alert(`Error: ${error.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  // Filter and sort logic
  const filteredUsers = operators.filter((user) => {
    // Text search filter
    const searchableFields = [
      user.operator,
      user.username,
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
                  <div className="d-flex justify-content-between flex-wrap">
                    <span><strong>Total Records:</strong> {totalRecords}</span>
                    <span><strong>Filtered Records:</strong> {totalItems}</span>
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
                    <th onClick={() => handleSort('username')} style={{ cursor: 'pointer' }}>
                      Username {sortConfig.key === 'username' && (
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
                    <th>Old Price</th>
                    <th onClick={() => handleSort('amount')} style={{ cursor: 'pointer' }}>
                      Price {sortConfig.key === 'amount' && (
                        <i className={`bi bi-arrow-${sortConfig.direction === 'ascending' ? 'up' : 'down'}`}></i>
                      )}
                    </th>
                    <th>Screenshot</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.length === 0 ? (
                    <tr>
                      <td colSpan="11" className="text-center">No records found</td>
                    </tr>
                  ) : (
                    currentItems.map((user, index) => (
                      <tr key={user.id} className={user.hasPrice ? "" : "table-light"}>
                        <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                        <td>{user.username}</td>
                        <td>{user.mobile_number}</td>
                        <td>{user.operator}</td>
                        <td>{user.plan_type}</td>
                        <td>{formatDateTime(user.user_payment_datetime)}</td>
                        <td>{user.old_price ? `₹${user.old_price}` : "-"}</td>
                        <td>{user.amount ? `₹${user.amount}` : "-"}</td>
                        <td>
                          {user.screenshot_url ? (
                            <button 
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => handleViewImage(user.screenshot_url)}
                            >
                             <i className="bi bi-image"></i> View
                            </button>
                          ) : (
                            <span className="text-muted">No image</span>
                          )}
                        </td>
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
                            disabled={deleteInProgress}
                          >
                            <i className="bi bi-trash-fill text-danger"></i>
                            {deleteInProgress && (
                              <span className="spinner-border spinner-border-sm ms-1" role="status" aria-hidden="true"></span>
                            )}
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
                  <div className="table-responsive">
                    <table className="table table-bordered">
                      <tbody>
                        <tr>
                          <th>ID</th>
                          <td>{viewUser.id}</td>
                        </tr>
                        <tr>
                          <th>Username</th>
                          <td>{viewUser.username}</td>
                        </tr>
                        <tr>
                          <th>Mobile Number</th>
                          <td>{viewUser.mobile_number}</td>
                        </tr>
                        <tr>
                          <th>Operator</th>
                          <td>{viewUser.operator}</td>
                        </tr>
                        <tr>
                          <th>Plan Type</th>
                          <td>{viewUser.plan_type}</td>
                        </tr>
                        <tr>
                          <th>Old Price</th>
                          <td>{viewUser.old_price ? `₹${viewUser.old_price}` : "-"}</td>
                        </tr>
                        <tr>
                          <th>New Price</th>
                          <td>{viewUser.amount ? `₹${viewUser.amount}` : "-"}</td>
                        </tr>
                        <tr>
                          <th>Status</th>
                          <td>{viewUser.status}</td>
                        </tr>
                        <tr>
                          <th>Payment Date</th>
                          <td>{formatDateTime(viewUser.payment_date)}</td>
                        </tr>
                        {viewUser.emp_id && (
                          <tr>
                            <th>Assigned Employee</th>
                            <td>{viewUser.emp_id}</td>
                          </tr>
                        )}
                        <tr>
                          <th>Screenshot</th>
                          <td>
                            {viewUser.screenshot_url ? (
                              <button 
                                className="btn btn-sm btn-primary"
                                onClick={() => handleViewImage(viewUser.screenshot_url)}
                              >
                                View Screenshot
                              </button>
                            ) : (
                              <span className="text-muted">No screenshot available</span>
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>
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

        {/* Edit Modal */}
        {editModalShow && currentUser && (
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Update Status</h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setEditModalShow(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="userDetails" className="form-label">User Details</label>
                    <div id="userDetails" className="form-text">
                      <strong>Username:</strong> {currentUser.username} <br />
                      <strong>Mobile:</strong> {currentUser.mobile_number} <br />
                      <strong>Operator:</strong> {currentUser.operator} <br />
                      <strong>Old Price:</strong> {currentUser.old_price}<br />
                      <strong>New Price:</strong> {currentUser.amount}<br />
                      <strong>Current Status:</strong> {currentUser.status}
                    </div>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="statusSelect" className="form-label">New Status</label>
                    <select 
                      id="statusSelect" 
                      className="form-select" 
                      value={newStatus} 
                      onChange={handleStatusChange}
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">paid</option>
                    </select>
                  </div>
                  {currentUser.screenshot_url && (
                    <div className="mb-3">
                      <label className="form-label">Screenshot</label>
                      <div>
                        <button 
                          className="btn btn-sm btn-primary"
                          onClick={() => handleViewImage(currentUser.screenshot_url)}
                        >
                          View Screenshot
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setEditModalShow(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-primary" 
                    onClick={handleSaveEdit}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Image Preview Modal */}
        {showImageModal && imagePreviewUrl && (
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Screenshot Preview</h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={handleCloseImageModal}
                  ></button>
                </div>
                <div className="modal-body text-center">
                  <img 
                    src={imagePreviewUrl} 
                    alt="User Screenshot" 
                    className="img-fluid" 
                    style={{ maxHeight: '70vh' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      console.error('Image failed to load:', imagePreviewUrl);
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5IiBkeT0iLjNlbSI+SW1hZ2UgZmFpbGVkIHRvIGxvYWQ8L3RleHQ+PC9zdmc+';
                    }}
                  />
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={handleCloseImageModal}
                  >
                    Close
                  </button>
                  <a 
                    href={imagePreviewUrl} 
                    className="btn btn-primary" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    Open in New Tab
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Backdrop for modals */}
        {(showView || editModalShow || showImageModal) && (
          <div 
            className="modal-backdrop fade show" 
            onClick={() => {
              setShowView(false);
              setEditModalShow(false);
              setShowImageModal(false);
            }}
          ></div>
        )}
      </div>
    </AdminLayout>
  );
};

export default UserList;