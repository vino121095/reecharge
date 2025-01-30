import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import AdminLayout from '../AdminLayout';
 
function UserList() {
  const [modalShow, setModalShow] = useState(false);
  const [operators, setOperators] = useState([]);
  const [paidList, setPaidList] = useState([]); // To store paid users
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [showView, setShowView] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'ascending' });
  const [editModalShow, setEditModalShow] = useState(false);
  const [newStatus, setNewStatus] = useState('Pending');
  const [viewUser, setViewUser] = useState(null); // To handle view modal
 
  // Fetch data from API and local storage for paid users
  useEffect(() => {
    const fetchOperators = async () => {
      try {
        const response = await fetch('https://recharge.rbtamilan.in/api/home_data');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
 
        const sanitizedData = data.map((user) => ({
          ...user,
          plan_type: user.plan_type || '',
          mobile_number: user.mobile_number || '',
          operator: user.operator || '',
          createdAt: user.createdAt || '',
          updatedAt: user.updatedAt || '',
          user_name: user.user_name || '', // Fallback to "N/A" if missing
          price: user.price || 'N/A', // Fallback to "N/A" if missing
          status: user.status || 'Pending', // Fallback to "Pending" if missing
          type: user.type || 'Basic', // Fallback to "Basic" if missing
        }));
 
        setOperators(sanitizedData);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
 
    const storedPaidList = JSON.parse(localStorage.getItem('paidList')) || [];
    setPaidList(storedPaidList);
 
    fetchOperators(); // Call the function on component mount
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
    setEditModalShow(true);
    setNewStatus(user.status); // Set the current status for editing
  };
 
  const handleStatusChange = (e) => {
    setNewStatus(e.target.value);
  };
 
  const handleSaveEdit = () => {
    const updatedUser = { ...currentUser, status: newStatus };
 
    // Update the operators list by changing the status to Paid
    const updatedOperators = operators.map((user) =>
      user.id === updatedUser.id ? updatedUser : user
    );
 
    // Save the updated operators list to localStorage
    localStorage.setItem('operators', JSON.stringify(updatedOperators));
 
    // If the status is changed to Paid, move the user to PaidList
    if (newStatus === 'Paid') {
      const newPaidList = [...paidList, updatedUser];
      setPaidList(newPaidList);
      localStorage.setItem('paidList', JSON.stringify(newPaidList));
 
      // Remove the user from the operators list
      const filteredOperators = updatedOperators.filter((user) => user.id !== updatedUser.id);
      setOperators(filteredOperators);
    } else {
      // Just update the status if PaidList is already filled
      setOperators(updatedOperators);
    }
 
    setEditModalShow(false); // Close the modal
  };
 
  const handleDelete = (userId) => {
    // Remove the user from the operators list
    const updatedOperators = operators.filter((user) => user.id !== userId);
 
    // Save the updated operators list to localStorage
    localStorage.setItem('operators', JSON.stringify(updatedOperators));
 
    // Also remove from paidList if user is in the paidList
    const updatedPaidList = paidList.filter((user) => user.id !== userId);
    localStorage.setItem('paidList', JSON.stringify(updatedPaidList));
 
    // Update the state
    setOperators(updatedOperators);
    setPaidList(updatedPaidList);
  };
 
  // View action to show user details in a modal
  const handleView = (user) => {
    setViewUser(user);
    setShowView(true);
  };
 
  const handleCloseView = () => {
    setShowView(false);
    setViewUser(null);
  };
 
  // Filter and pagination
  const filteredUsers = operators.filter((user) => {
    const username = user.operator || ''; // Fallback to an empty string if operator is missing
    const term = searchTerm || ''; // Fallback to an empty string if searchTerm is missing
    return username.toLowerCase().includes(term.toLowerCase());
  });
 
  const sortedUsers = filteredUsers.sort((a, b) => {
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
 
    if (aValue < bValue) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });
 
  // Pagination logic
  const totalItems = sortedUsers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const currentItems = sortedUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
 
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
 
  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
 
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
 
  return (
    <AdminLayout>
      <div className="container mt-4">
        <div className="d-flex justify-content-between mb-3">
          <h3>User List</h3>
        </div>
 
        {/* Filter and Search Controls */}
        <div className="row mb-3 align-items-end">
          <div className="col-md-4 mt-2">
            <input
              type="text"
              className="form-control mb-3"
              placeholder="Search by Operator"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="col-md-8 d-flex justify-content-end mt-2">
            <div className="col-md-1 me-2">
              {/* Items per page selection */}
              <div className="form-group">
                <select className="form-control mb-3" value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))}>
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
          </div>
        </div>
 
        <div style={{ height: '450px', overflowY: 'auto' }}>
          <table className="table text-center" style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead className="thead-light" style={{ position: 'sticky', top: 0, zIndex: 10, background: 'white' }}>
              <tr>
                <th onClick={() => handleSort('id')} style={{ cursor: 'pointer' }}>
                  S No
                  {sortConfig.key === 'id' && (
                    <i className={`bi ${sortConfig.direction === 'ascending' ? 'bi-arrow-up' : 'bi-arrow-down'}`}></i>
                  )}
                </th>
                <th onClick={() => handleSort('username')} style={{ cursor: 'pointer' }}>
                  Username 
                  {sortConfig.key === 'username' && (
                    <i className={`bi ${sortConfig.direction === 'ascending' ? 'bi-arrow-up' : 'bi-arrow-down'}`}></i>
                  )}
                </th>
                <th>Phone number</th>
                <th>Operator</th>
                <th>Type</th>
                <th>Date & Time</th>
                <th>Price</th>
                <th>Status</th>
 
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan="8">No users found.</td>
                </tr>
              ) : (
                currentItems.map((user, index) => (
                  <tr key={user.id}>
                    <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td>{user.user_name}</td>
                    <td>{user.mobile_number}</td>
                    <td>{user.operator}</td>
                    <td>{user.plan_type}</td>
                    <td>{new Date(user.createdAt).toLocaleString()}</td>
                    <td>₹200</td>
                    <td>{user.status}</td>
 
                    <td>
                      {/* <button onClick={() => handleView(user)} className="btn btn-info btn-sm me-2">
                        View
                      </button>
                      <button onClick={() => handleDelete(user.id)} className="btn btn-danger btn-sm me-2">
                        Delete
                      </button>
                      <button onClick={() => handleEditClick(user)} className="btn btn-primary btn-sm">
                        Edit
                      </button> */}
                        <i
                      onClick={() => handleView(user)}
                      style={{ cursor: "pointer", color: "#007bff", marginRight: "10px" }}
                       className="bi bi-eye-fill"></i>
                   
                 
                      <i
                      onClick={() => handleEditClick(user)}
                      style={{ cursor: "pointer", color: "#ffc107", marginRight: "10px" }}
                       className="bi bi-pencil-fill"></i>
                 
                   
                      <i
                      onClick={() => handleDelete(user.id)}
                      style={{ cursor: "pointer", color: "red", marginRight: "10px" }}
                       className="bi bi-trash-fill"></i>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
 
        {/* Pagination Controls */}
        <nav aria-label="Page navigation" className="mt-4">
          <ul className="pagination justify-content-center">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>Previous</button>
            </li>
            {currentPage > 3 && (
              <li className="page-item">
                <button className="page-link" onClick={() => setCurrentPage(1)}>1</button>
              </li>
            )}
            {currentPage > 4 && (
              <li className="page-item disabled">
                <span className="page-link">...</span>
              </li>
            )}
            {Array.from({ length: 3 }, (_, i) => {
              const pageNumber = currentPage - 1 + i;
              if (pageNumber > 0 && pageNumber <= totalPages) {
                return (
                  <li key={pageNumber} className={`page-item ${currentPage === pageNumber ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => setCurrentPage(pageNumber)}>{pageNumber}</button>
                  </li>
                );
              }
              return null;
            })}
            {currentPage < totalPages - 2 && (
              <li className="page-item disabled">
                <span className="page-link">...</span>
              </li>
            )}
            {currentPage < totalPages - 2 && (
              <li className="page-item">
                <button className="page-link" onClick={() => setCurrentPage(totalPages)}>{totalPages}</button>
              </li>
            )}
            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
            </li>
          </ul>
        </nav>
 
        {/* Modal for editing status */}
        {editModalShow && currentUser && (
          <div className="modal show" tabIndex="-1" style={{ display: 'block' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Edit User Status</h5>
                  <button className="btn-close" onClick={() => setEditModalShow(false)}></button>
                </div>
                <div className="modal-body">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    className="form-control"
                    value={newStatus}
                    onChange={handleStatusChange}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setEditModalShow(false)}>Close</button>
                  <button className="btn btn-primary" onClick={handleSaveEdit}>Save</button>
                </div>
              </div>
            </div>
          </div>
        )}
 
        {/* Modal for viewing user details */}
        {showView && viewUser && (
          <div className="modal show" tabIndex="-1" style={{ display: 'block' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">User Details</h5>
                  <button className="btn-close" onClick={handleCloseView}></button>
                </div>
                <div className="modal-body">
                  <p><strong>Username:</strong> {viewUser.user_name}</p>
                  <p><strong>Phone Number:</strong> {viewUser.mobile_number}</p>
                  <p><strong>Operator:</strong> {viewUser.operator}</p>
                  <p><strong>Type:</strong> {viewUser.plan_type}</p>
               
                  <p><strong>Created At:</strong> {new Date(viewUser.createdAt).toLocaleString()}</p>
                  <p><strong>Updated At:</strong> {new Date(viewUser.updatedAt).toLocaleString()}</p>
                  <p><strong>Price:</strong> {viewUser.price}</p>
                 
                  <p><strong>Status:</strong> {viewUser.status}</p>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={handleCloseView}>Close</button>
                </div>
              </div>
            </div>
          </div>
        )}
 
       
      </div>
    </AdminLayout>
  );
}
 
export default UserList;