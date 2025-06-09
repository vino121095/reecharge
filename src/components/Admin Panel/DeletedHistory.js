import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import AdminLayout from '../AdminLayout';
import baseurl from '../../Api Service/ApiService';

const DeletedHistory = () => {
  const [deletedUsers, setDeletedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'deleted_at', direction: 'descending' });
  const [showView, setShowView] = useState(false);
  const [viewUser, setViewUser] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [deleteInProgress, setDeleteInProgress] = useState(false);

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

  const fetchDeletedData = async () => {
    try {
      const response = await fetch(`${baseurl}/api/home_data/deleted`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      
      // Process the data to format image paths
      const processedData = data.map(user => ({
        ...user,
        screenshot_url: formatImagePath(user.screenshot_url || user.screenshot_path || null)
      }));
      
      setDeletedUsers(processedData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching deleted data:", error);
      setError(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeletedData();
  }, []);

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
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
    }
  };

  const handleCloseImageModal = () => {
    setShowImageModal(false);
    setImagePreviewUrl(null);
  };

  const handlePermanentDelete = async (userId) => {
    if (window.confirm('Are you sure you want to permanently delete this record? This action cannot be undone.')) {
      try {
        setDeleteInProgress(true);
        
        const response = await fetch(`${baseurl}/api/home_data/permanent/${userId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to permanently delete record. Status: ${response.status}`);
        }

        // Update the UI after successful deletion
        const updatedDeletedUsers = deletedUsers.filter(user => user.id !== userId);
        setDeletedUsers(updatedDeletedUsers);
        
        // Show success message
        alert('Record permanently deleted');
      } catch (error) {
        console.error('Error permanently deleting record:', error);
        alert(`Error: ${error.message}`);
      } finally {
        setDeleteInProgress(false);
      }
    }
  };

  const filteredUsers = deletedUsers.filter((user) => {
    const searchableFields = [
      user.operator,
      user.username,
      user.mobile_number
    ].map(field => (field || '').toLowerCase());
    
    return searchableFields.some(field => 
      field.includes(searchTerm.toLowerCase())
    );
  });

  const sortedUsers = filteredUsers.sort((a, b) => {
    if (sortConfig.key === 'deleted_at' || sortConfig.key === 'payment_date') {
      const dateA = a[sortConfig.key] ? new Date(a[sortConfig.key]).getTime() : 0;
      const dateB = b[sortConfig.key] ? new Date(b[sortConfig.key]).getTime() : 0;
      return sortConfig.direction === 'ascending' ? dateA - dateB : dateB - dateA;
    }
    
    const aValue = a[sortConfig.key] || '';
    const bValue = b[sortConfig.key] || '';
    return sortConfig.direction === 'ascending' 
      ? aValue > bValue ? 1 : -1 
      : aValue < bValue ? 1 : -1;
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
          <div className="card-header bg-danger text-white">
            <h5 className="mb-0">Deleted History</h5>
          </div>
          <div className="card-body">
            {/* Search and Items Per Page Controls */}
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
                <div className="alert alert-danger py-2">
                  <div className="d-flex justify-content-between flex-wrap">
                    <span><strong>Total Deleted Records:</strong> {totalItems}</span>
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
                      Payment Date {sortConfig.key === 'payment_date' && (
                        <i className={`bi bi-arrow-${sortConfig.direction === 'ascending' ? 'up' : 'down'}`}></i>
                      )}
                    </th>
                    <th onClick={() => handleSort('deleted_at')} style={{ cursor: 'pointer' }}>
                      Deleted At {sortConfig.key === 'deleted_at' && (
                        <i className={`bi bi-arrow-${sortConfig.direction === 'ascending' ? 'up' : 'down'}`}></i>
                      )}
                    </th>
                    <th>Old Price</th>
                    <th>Price</th>
                    <th>Screenshot</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="text-center">No deleted records found</td>
                    </tr>
                  ) : (
                    currentItems.map((user, index) => (
                      <tr key={user.id}>
                        <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                        <td>{user.username}</td>
                        <td>{user.mobile_number}</td>
                        <td>{user.operator}</td>
                        <td>{user.plan_type}</td>
                        <td>{formatDateTime(user.payment_date)}</td>
                        <td>{formatDateTime(user.deleted_at)}</td>
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
                        <td>
                          <button
                            className="btn btn-link p-0 me-2"
                            onClick={() => handleView(user)}
                          >
                            <i className="bi bi-eye-fill text-primary"></i>
                          </button>
                          <button
                            className="btn btn-link p-0"
                            onClick={() => handlePermanentDelete(user.id)}
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
                  <h5 className="modal-title">Deleted User Details</h5>
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
                          <th>Payment Date</th>
                          <td>{formatDateTime(viewUser.payment_date)}</td>
                        </tr>
                        <tr>
                          <th>Deleted At</th>
                          <td>{formatDateTime(viewUser.deleted_at)}</td>
                        </tr>
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
        {(showView || showImageModal) && (
          <div 
            className="modal-backdrop fade show" 
            onClick={() => {
              setShowView(false);
              setShowImageModal(false);
            }}
          ></div>
        )}
      </div>
    </AdminLayout>
  );
};

export default DeletedHistory; 