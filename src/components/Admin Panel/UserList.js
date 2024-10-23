import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import AdminLayout from '../AdminLayout';
 
function UserList() {
  const [modalShow, setModalShow] = useState(false);
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [showView, setShowView] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOperator, setFilterOperator] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'ascending' });
  const [deleteModalShow, setDeleteModalShow] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
 
  useEffect(() => {
    const fetchOperators = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/home_data');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setOperators(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };
 
    fetchOperators();
}, []);
 
if (loading) return <div>Loading...</div>;
if (error) return <div>Error: {error}</div>;
 
  const users = [
    { id: 1, username: 'john_doe', type: 'Prepaid', phoneNumber: '123-456-7890', price: '$10', dateTime: '2024-01-01 10:00 AM', status: 'Completed' },
  ];
 
  const filteredUsers = users.filter(user =>
    (filterOperator === '' || user.operator === filterOperator) &&
    (user.username.toLowerCase().includes(searchTerm.toLowerCase()))
  );
 
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
 
  const totalItems = sortedUsers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const currentItems = sortedUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
 
  const combinedItems = [...operators, ...currentItems];
 
  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
 
  const handleViewClick = (user) => {
    setCurrentUser(user);
    setShowView(true);
    setModalShow(true);
  };
 
  const handleClose = () => {
    setModalShow(false);
    setCurrentUser(null);
    setShowView(false);
  };
 
  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setDeleteModalShow(true);
  };
 
  const confirmDelete = () => {
    // Implement the delete functionality here
    console.log("Delete user with id:", userToDelete.id);
    setDeleteModalShow(false);
    setUserToDelete(null);
    // Optionally, filter users state here
  };
 
  const handleModalClick = (e) => {
    e.stopPropagation();
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
              className="form-control"
              placeholder="Search by Username"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
 
          <div className="col-md-8 d-flex justify-content-end mt-2">
            <div className="col-md-1 me-2">
              <select
                className="form-select"
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
              </select>
            </div>
          </div>
        </div>
 
        {/* Scrollable Table with Fixed Header */}
 
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
                <th onClick={() => handleSort('operator')} style={{ cursor: 'pointer' }}>
                  Operator
                  {sortConfig.key === 'operator' && (
                    <i className={`bi ${sortConfig.direction === 'ascending' ? 'bi-arrow-up' : 'bi-arrow-down'}`}></i>
                  )}
                </th>
                <th onClick={() => handleSort('type')} style={{ cursor: 'pointer' }}>
                  Type
                  {sortConfig.key === 'type' && (
                    <i className={`bi ${sortConfig.direction === 'ascending' ? 'bi-arrow-up' : 'bi-arrow-down'}`}></i>
                  )}
                </th>
                <th onClick={() => handleSort('phoneNumber')} style={{ cursor: 'pointer' }}>
                  Phone Number
                  {sortConfig.key === 'phoneNumber' && (
                    <i className={`bi ${sortConfig.direction === 'ascending' ? 'bi-arrow-up' : 'bi-arrow-down'}`}></i>
                  )}
                </th>
                <th onClick={() => handleSort('price')} style={{ cursor: 'pointer' }}>
                  Price
                  {sortConfig.key === 'price' && (
                    <i className={`bi ${sortConfig.direction === 'ascending' ? 'bi-arrow-up' : 'bi-arrow-down'}`}></i>
                  )}
                </th>
                <th onClick={() => handleSort('dateTime')} style={{ cursor: 'pointer' }}>
                  Date & Time
                  {sortConfig.key === 'dateTime' && (
                    <i className={`bi ${sortConfig.direction === 'ascending' ? 'bi-arrow-up' : 'bi-arrow-down'}`}></i>
                  )}
                </th>
                <th onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>
                  Status
                  {sortConfig.key === 'status' && (
                    <i className={`bi ${sortConfig.direction === 'ascending' ? 'bi-arrow-up' : 'bi-arrow-down'}`}></i>
                  )}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
                        {combinedItems.map((item, index) => (
                            <tr key={item.id}>
                                <td>{index + 1}</td>
                                <td></td> {/* Fallback if username is not available */}
                                <td>{item.operator}</td>
                                <td>{item.plan_type}</td> {/* Use plan_type or type */}
                                <td>{item.mobile_number}</td> {/* Mobile number field */}
                                <td></td> {/* Fallback if price is not available */}
                                <td>{new Date(item.createdAt).toLocaleString()}</td> {/* Use createdAt or dateTime */}
                                <td></td> {/* Fallback if status is not available */}
                                <td>
                                    <i
                                        onClick={() => handleViewClick(item)}
                                        style={{ cursor: "pointer", color: "#007bff", marginRight: "10px" }}
                                        className="bi bi-eye-fill"
                                    />
                                    <i
                                        onClick={() => handleDeleteClick(item)}
                                        style={{ cursor: "pointer", color: "red" }}
                                        className="bi bi-trash-fill"
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
          </table>
        </div>
 
        {/* Pagination Controls */}
        <nav>
          <ul className="pagination justify-content-center">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>Previous</button>
            </li>
            {Array.from({ length: totalPages }, (_, index) => (
              <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                <button className="page-link" onClick={() => setCurrentPage(index + 1)}>{index + 1}</button>
              </li>
            ))}
            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
            </li>
          </ul>
        </nav>
 
        {/* Modal for Viewing User */}
        {modalShow && (
          <div className={`modal ${modalShow ? 'show' : ''}`} style={{ display: modalShow ? 'block' : 'none' }} onClick={handleClose}>
            <div className="modal-dialog modal-dialog-centered" onClick={handleModalClick}>
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">View User</h5>
                </div>
                <div className="modal-body text-left">
                  {currentUser && (
                    <div>
                      <p style={{ margin: 0 }}><strong>Username:</strong> {currentUser.username}</p>
                      <p style={{ margin: 0 }}><strong>Operator:</strong> {currentUser.operator}</p>
                      <p style={{ margin: 0 }}><strong>Type:</strong> {currentUser.type}</p>
                      <p style={{ margin: 0 }}><strong>Phone Number:</strong> {currentUser.phoneNumber}</p>
                      <p style={{ margin: 0 }}><strong>Price:</strong> {currentUser.price}</p>
                      <p style={{ margin: 0 }}><strong>Date & Time:</strong> {currentUser.dateTime}</p>
                      <p style={{ margin: 0 }}><strong>Status:</strong> {currentUser.status}</p>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={handleClose}>Close</button>
                </div>
              </div>
            </div>
          </div>
        )}
        {modalShow && <div className="modal-backdrop fade show" />}
 
        {/* Confirmation Modal for Deletion */}
        {deleteModalShow && (
          <div className={`modal show`} style={{ display: 'block' }} onClick={() => setDeleteModalShow(false)}>
            <div className="modal-dialog modal-dialog-centered" onClick={handleModalClick}>
              <div className="modal-content" >
                <div className="modal-header">
                  <h5 className="modal-title">Confirm Deletion</h5>
                </div>
                <div className="modal-body text-left">
                  <p>Are you sure you want to delete this user?</p>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-dark" onClick={confirmDelete}>Yes</button>
                  <button type="button" className="btn btn-light" onClick={() => setDeleteModalShow(false)}>No</button>
                </div>
              </div>
            </div>
          </div>
        )}
        {deleteModalShow && <div className="modal-backdrop fade show" />}
      </div>
    </AdminLayout>
  );
}
 
export default UserList;