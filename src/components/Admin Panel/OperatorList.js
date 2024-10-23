import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import AdminLayout from '../AdminLayout';

function OperatorList() {
    const [operator, setOperator] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [operatorsList, setOperatorsList] = useState([]);
    const [modalShow, setModalShow] = useState(false);
    const [currentOperator, setCurrentOperator] = useState(null);
    const [modalImagePreview, setModalImagePreview] = useState('');

    // Search and pagination state
    const [searchTerm, setSearchTerm] = useState('');
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: 'operator', direction: 'ascending' });

    useEffect(() => {
        // Fetch initial operators list from the API
        const fetchOperators = async () => {
            const response = await axios.get('http://localhost:8000/api/operators');
            setOperatorsList(response.data);
        };
        fetchOperators();
    }, []);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
                setImageFile(file); // Save the file for uploading
            };
            reader.readAsDataURL(file);
        } else {
            setImagePreview('');
            setImageFile(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!operator.trim() || !imageFile) {
            alert("Operator name and image cannot be empty!");
            return;
        }

        const formData = new FormData();
        formData.append('operator', operator);
        formData.append('image', imageFile);

        try {
            const response = await axios.post('http://localhost:8000/api/operators', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setOperatorsList(prevList => [...prevList, response.data]);
            resetForm();
        } catch (error) {
            console.error("Error adding operator:", error);
        }
    };

    const resetForm = () => {
        setOperator('');
        setImagePreview('');
        setImageFile(null);
        document.getElementById('imageInput').value = '';
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:8000/api/operators/${id}`);
            setOperatorsList(operatorsList.filter(op => op.oid !== id));
        } catch (error) {
            console.error("Error deleting operator:", error);
        }
    };

    const handleEdit = (op) => {
        setCurrentOperator(op);
        setModalImagePreview(op.image);
        setModalShow(true);
    };

    const handleModalSubmit = async (e) => {
        e.preventDefault();
        if (!currentOperator.operator.trim()) {
            alert("Operator name cannot be empty!");
            return;
        }

        const formData = new FormData();
        formData.append('operator', currentOperator.operator);
        if (modalImagePreview) {
            formData.append('image', modalImagePreview);
        }

        try {
            const response = await axios.put(`http://localhost:8000/api/operators/${currentOperator.oid}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            const updatedOperatorsList = operatorsList.map(op =>
                op.oid === currentOperator.oid ? response.data : op
            );

            setOperatorsList(updatedOperatorsList);
            handleModalClose();
        } catch (error) {
            console.error("Error updating operator:", error);
        }
    };

    const handleModalClose = () => {
        setModalShow(false);
        setCurrentOperator(null);
        setModalImagePreview('');
    };

    // Search filter
    const filteredOperators = operatorsList.filter(op =>
        op.operator.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sorting
    const sortedOperators = filteredOperators.sort((a, b) => {
        const aValue = a[sortConfig.key].toLowerCase();
        const bValue = b[sortConfig.key].toLowerCase();

        if (aValue < bValue) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
    });

    // Pagination
    const totalItems = sortedOperators.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const currentItems = sortedOperators.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    return (
        <AdminLayout>
            <div className="container mt-4">
                <h3 id="operators">Operators</h3>
                <div className="card mt-4">
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3 row">
                                <div className="col-md-5">
                                    <label htmlFor="operatorInput" className="col-form-label">Add Operator</label>
                                    <input
                                        type="text"
                                        id="operatorInput"
                                        className="form-control mt-2"
                                        placeholder="Enter operator"
                                        value={operator}
                                        onChange={(e) => setOperator(e.target.value)}
                                    />
                                    <input
                                        type="file"
                                        id="imageInput"
                                        className="form-control mt-4"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />
                                    <div className="mt-3" style={{ width: '100px', height: '100px', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {imagePreview ? (
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="img-thumbnail"
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <span className='text-center' style={{ color: '#888', fontSize: '12px' }}>No Image Uploaded</span>
                                        )}
                                    </div>
                                    <button type="submit" className="btn btn-primary mt-3">Add</button>
                                </div>
                            </div>
                        </form>

                        {/* Search and Items Per Page */}
                        <h3 className="mt-4">Operators List</h3>
                        <div className="mb-4 mt-4 row justify-content-between">
                            <div className="col-md-6">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search Operators"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="col-md-2">
                                <select className="form-select" value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))}>
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ height: '450px', overflowY: 'auto' }}>
                            <table className="table text-center" style={{ borderCollapse: 'collapse', width: '100%' }}>
                                <thead className="thead-light" style={{ position: 'sticky', top: 0, zIndex: 10, background: 'white' }}>
                                    <tr>
                                        <th>S No</th>
                                        <th onClick={() => handleSort('operator')} style={{ cursor: 'pointer' }}>
                                            Operator Name
                                            {sortConfig.key === 'operator' && (
                                                <i className={`bi ${sortConfig.direction === 'ascending' ? 'bi-arrow-up' : 'bi-arrow-down'}`}></i>
                                            )}
                                        </th>
                                        <th>Logo</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map((op, index) => (
                                        <tr key={op.oid}>
                                            <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                            <td>{op.operator}</td>
                                            <td>
                                                {op.image ? (
                                                    <img
                                                        src={`http://localhost:8000/${op.image}`} // Adjust this path as needed
                                                        alt="Logo"
                                                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                                    />
                                                ) : (
                                                    <span>No Logo Uploaded</span>
                                                )}
                                            </td>
                                            <td>
                                                <i
                                                    onClick={() => handleEdit(op)}
                                                    style={{ cursor: "pointer", color: "#007bff", marginRight: "10px" }}
                                                    className="bi bi-pencil-fill"
                                                />
                                                <i
                                                    onClick={() => handleDelete(op.oid)}
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
                        <nav aria-label="Page navigation">
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
                    </div>
                </div>

                {/* Modal for editing operator details */}
                {modalShow && currentOperator && (
                    <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)' }} onClick={handleModalClose}>
                        <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Edit Operator</h5>
                                </div>
                                <div className="modal-body">
                                    <form onSubmit={handleModalSubmit}>
                                        <div className="mb-3">
                                            <label htmlFor="editOperatorInput" className="col-form-label">Operator Name</label>
                                            <input
                                                type="text"
                                                id="editOperatorInput"
                                                className="form-control"
                                                value={currentOperator.operator}
                                                onChange={(e) => setCurrentOperator({ ...currentOperator, operator: e.target.value })}
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="editImageInput" className="col-form-label">Choose Logo</label>
                                            <input
                                                type="file"
                                                id="editImageInput"
                                                className="form-control"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                            />
                                            <div className="mt-3" style={{ width: '100px', height: '100px', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {modalImagePreview || currentOperator.image ? (
                                                    <img
                                                        src={modalImagePreview || currentOperator.image}
                                                        alt="Preview"
                                                        className="img-thumbnail"
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    />
                                                ) : (
                                                    <span style={{ color: '#888' }}>No Image Uploaded</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="modal-footer">
                                            <button type="submit" className="btn btn-primary">Save Changes</button>
                                            <button type="button" className="btn btn-secondary" onClick={handleModalClose}>Close</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

export default OperatorList;
