import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import AdminLayout from '../AdminLayout';
 
 
const PlansList = () => {
  const [modalShow, setModalShow] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [plans, setPlans] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
 
  // Pagination and sorting state
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'plan_name', direction: 'ascending' });
 
  const [operator, setOperator] = useState('');
  const [operatorsList, setOperatorsList] = useState([]);
    // Fetch operators when the component mounts
    useEffect(() => {
      const fetchOperators = async () => {
          try {
              const response = await fetch("http://localhost:8000/api/operators");
              const data = await response.json();
              if (response.ok) {
                  // Assuming the response is an array of objects with an `operator` property
                  setOperatorsList(data); // Set the fetched operators list
              } else {
                  console.error("Error fetching operators:", data);
              }
          } catch (error) {
              console.error("Fetch Error:", error);
          }
      };
 
      fetchOperators();
  }, []);
 
  // Fetch plans from the API
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/plan_list');
        if (Array.isArray(response.data.data)) {
          setPlans(response.data.data);
        } else {
          console.error("Expected an array but got:", response.data);
          setPlans([]);
        }
      } catch (error) {
        console.error("Error fetching plans:", error);
      }
    };
 
    fetchPlans();
  }, []);
 
  // Fetch categories for the form
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/add_category');
        setCategories(response.data.data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
 
    fetchCategories();
  }, []);
 
  const handleAddPlan = async (formData) => {
    const dataToSubmit = {
      operator: operator,
      type: formData.type,
      plan_name: formData.plan_name,
      category: formData.category,
      data: formData.data,
      cells: formData.cells,
      validity: formData.validity,
      old_price: formData.old_price,
      new_price: formData.new_price,
      extra_features: formData.extra_features
    };
 
    try {
      const response = await fetch('http://localhost:8000/api/plan_list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSubmit)
      });
 
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
 
      const result = await response.json();
      console.log('Success:', result);
      setSuccess('Plan added successfully!');
      setError(null);
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred while adding the plan.');
    }
  };
 
 
  const handleUpdatePlan = async (formData) => {
    try {
      await axios.put(`http://localhost:8000/api/plan_list/${currentPlan.pid}`, formData);
      setPlans(plans.map(p => (p.pid === currentPlan.pid ? { ...p, ...formData } : p)));
      setSuccess('Plan updated successfully!');
    } catch (err) {
      console.error("Error updating plan:", err);
      setError(err.message);
    }
  };
 
  const handleAddOrUpdatePlan = async (formData) => {
    if (currentPlan) {
      await handleUpdatePlan(formData);
    } else {
      await handleAddPlan(formData);
    }
    setModalShow(false);
    setCurrentPlan(null);
    setError(null);
  };
 
 
  const handleEditClick = (plan) => {
    setCurrentPlan(plan);
    setModalShow(true);
  };
 
  const handleDeleteClick = async (planToDelete) => {
    if (window.confirm("Are you sure you want to delete this plan?")) {
      try {
        await axios.delete(`http://localhost:8000/api/plan_list/${planToDelete.pid}`);
        setPlans(plans.filter(plan => plan.pid !== planToDelete.pid));
      } catch (error) {
        console.error("Error deleting plan:", error);
      }
    }
  };
 
  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
 
  const filteredPlans = plans.filter(plan =>
    plan.plan_name.toLowerCase().includes(searchTerm.toLowerCase())
  );
 
  const sortedPlans = filteredPlans.sort((a, b) => {
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
 
  const totalItems = sortedPlans.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const currentItems = sortedPlans.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
 
  return (
    <AdminLayout>
      <div className="container mt-4">
      <div className="d-flex justify-content-between mb-3">
        <h3>Plans List</h3>
        <button className="btn btn-primary mb-3" onClick={() => setModalShow(true)}>Add Plan</button>
        </div>
 {/* Filter and Search Controls */}
 <div className="row mb-3 align-items-end">
        <div className="col-md-4 mt-2">
        <input
          type="text"
          className="form-control mb-3"
          placeholder="Search by Plan Name"
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
 
      {/* Scrollable Table with Fixed Header */}
       
      <div style={{ height: '450px', overflowY: 'auto' }}>
 
        <table className="table text-center"style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead className="thead-light"style={{ position: 'sticky', top: 0, zIndex: 10, background: 'white' }}>
            <tr>
              <th >S No
               
              </th>
              <th onClick={() => handleSort('plan_name')} style={{ cursor: 'pointer' }}>Plan Name
                {sortConfig.key === 'plan_name' && (
                  <i className={`bi ${sortConfig.direction === 'ascending' ? 'bi-arrow-up' : 'bi-arrow-down'}`}></i>
                )}
              </th>
              <th onClick={() => handleSort('operator')} style={{ cursor: 'pointer' }}>Operator
                {sortConfig.key === 'operator' && (
                  <i className={`bi ${sortConfig.direction === 'ascending' ? 'bi-arrow-up' : 'bi-arrow-down'}`}></i>
                )}
              </th>
              <th onClick={() => handleSort('type')} style={{ cursor: 'pointer' }}>Type
                {sortConfig.key === 'type' && (
                  <i className={`bi ${sortConfig.direction === 'ascending' ? 'bi-arrow-up' : 'bi-arrow-down'}`}></i>
                )}
              </th>
              <th onClick={() => handleSort('category')} style={{ cursor: 'pointer' }}>Category
                {sortConfig.key === 'category' && (
                  <i className={`bi ${sortConfig.direction === 'ascending' ? 'bi-arrow-up' : 'bi-arrow-down'}`}></i>
                )}
              </th>
              <th onClick={() => handleSort('data')} style={{ cursor: 'pointer' }}>Data
                {sortConfig.key === 'data' && (
                  <i className={`bi ${sortConfig.direction === 'ascending' ? 'bi-arrow-up' : 'bi-arrow-down'}`}></i>
                )}
              </th>
              <th onClick={() => handleSort('cells')} style={{ cursor: 'pointer' }}>Cells
                {sortConfig.key === 'cells' && (
                  <i className={`bi ${sortConfig.direction === 'ascending' ? 'bi-arrow-up' : 'bi-arrow-down'}`}></i>
                )}
              </th>
              <th onClick={() => handleSort('validity')} style={{ cursor: 'pointer' }}>Validity
                {sortConfig.key === 'validity' && (
                  <i className={`bi ${sortConfig.direction === 'ascending' ? 'bi-arrow-up' : 'bi-arrow-down'}`}></i>
                )}
              </th>
              <th onClick={() => handleSort('old_price')} style={{ cursor: 'pointer' }}>Old Price
                {sortConfig.key === 'old_price' && (
                  <i className={`bi ${sortConfig.direction === 'ascending' ? 'bi-arrow-up' : 'bi-arrow-down'}`}></i>
                )}
              </th>
              <th onClick={() => handleSort('new_price')} style={{ cursor: 'pointer' }}>New Price
                {sortConfig.key === 'new_price' && (
                  <i className={`bi ${sortConfig.direction === 'ascending' ? 'bi-arrow-up' : 'bi-arrow-down'}`}></i>
                )}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
  {currentItems.map((plan, idx) => (
    <tr key={plan.pid}>
      {/* Calculate serial number based on current page and items per page */}
      <td>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
      <td>{plan.plan_name}</td>
      <td>{plan.operator}</td>
      <td>{plan.type}</td>
      <td>{plan.category}</td>
      <td>{plan.data}</td>
      <td>{plan.cells}</td>
      <td>{plan.validity}</td>
      <td>{plan.old_price}</td>
      <td>{plan.new_price}</td>
      <td>
        <i
          onClick={() => handleEditClick(plan)}
          style={{ cursor: "pointer", color: "#ffc107", marginRight: "10px" }}
          className="bi bi-pencil-fill"
        />
        <i
          onClick={() => handleDeleteClick(plan)}
          style={{ cursor: "pointer", color: "red", marginRight: "10px" }}
          className="bi bi-trash-fill"
        />
      </td>
    </tr>
  ))}
</tbody>
 
        </table>
        </div>
 
 
        {/* Pagination Controls */}
        <nav aria-label="Page navigation" className='mt-4'>
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
 
     
 
        {modalShow && (
     <AddPlanForm
     onClose={() => setModalShow(false)}
     onAddOrUpdatePlan={handleAddOrUpdatePlan}
     currentPlan={currentPlan}
     categories={categories}
     setNewCategory={setNewCategory}
     newCategory={newCategory}
     setCategories={setCategories}
     setError={setError}
     setSuccess={setSuccess}
     operator={operator}          // Pass operator as prop
     setOperator={setOperator}    // Pass setOperator as prop
     operatorsList={operatorsList} // Pass operatorsList as prop
   />
   
     
        )}
 
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>{success}</p>}
      </div>
    </AdminLayout>
  );
};
 
const AddPlanForm = ({
  onClose,
  onAddOrUpdatePlan,
  currentPlan,
  categories,
  setNewCategory,
  newCategory,
  setCategories,
  setError,
  setSuccess,
  operator,              // Receive operator
  setOperator,          // Receive setOperator
  operatorsList,        // Receive operatorsList
}) =>  {
  const [formData, setFormData] = useState({
    operator: '',
    type: '',
    plan_name: '',
    category: '',
    data: '',
    cells: '',
    validity: '',
    old_price: '',
    new_price: '',
    extra_features: ''
  });
 
  useEffect(() => {
    if (currentPlan) {
      setFormData({ ...currentPlan });
    } else {
      setFormData({
        operator: '',
        type: '',
        plan_name: '',
        category: '',
        data: '',
        cells: '',
        validity: '',
        old_price: '',
        new_price: '',
        extra_features: ''
      });
    }
  }, [currentPlan]);
 
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
 
  const handleSubmit = (e) => {
    e.preventDefault();
    onAddOrUpdatePlan(formData);
  };
 
  const handleAddCategory = async () => {
    const trimmedCategory = newCategory.trim();
 
    if (trimmedCategory && !categories.map(cat => cat.add_category).includes(trimmedCategory)) {
      try {
        const response = await fetch('http://localhost:8000/api/add_category', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ add_category: trimmedCategory }),
        });
 
        if (response.ok) {
          setCategories((prevCategories) => [...prevCategories, { add_category: trimmedCategory }]);
          setNewCategory('');
        } else {
          const errorMessage = await response.text();
          console.error('Error adding category:', response.statusText, errorMessage);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    } else {
      console.error('Invalid category name:', trimmedCategory);
    }
  };
 
  return (
    <div className="modal show" style={{ display: 'block' }} onClick={onClose}>
      <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{currentPlan ? 'Edit Plan' : 'Add Plan'}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
         
            <form onSubmit={handleSubmit}>
           
            <div className="row">
 
            <div className="col-md-6">
 
 
              <div className="mb-3">
              <label htmlFor="operator">Select Operator</label>
                                    <select
                                        className="form-control mt-2"
                                        id="operator"
                                        required
                                        value={operator}
                                        onChange={(e) => setOperator(e.target.value)}
                                    >
                                        <option value="" disabled selected>Select operator</option>
                                        {operatorsList.map((operator, index) => (
                                            <option key={index} value={operator.operator}>{operator.operator}</option>
                                        ))}
                                    </select>
              </div>
              {/* <div className="mb-3">
                <label className="form-label">Type:</label>
                <input type="text" className="form-control" name="type" value={formData.type} onChange={handleChange} required />
              </div> */}
              <div className="mb-3">
  <label className="form-label">Type:</label>
  <select className="form-select" name="type" value={formData.type} onChange={handleChange} required>
    <option value="">Select Type</option>
    <option value="Prepaid">Prepaid</option>
    <option value="Postpaid">Postpaid</option>
  </select>
</div>
 
              <div className="mb-3">
                <label className="form-label">Plan Name:</label>
                <input type="text" className="form-control" name="plan_name" value={formData.plan_name} onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Category:</label>
                <select className="form-select" name="category" value={formData.category} onChange={handleChange} required>
                  <option value="">Select Category</option>
                  {categories.map((category, index) => (
                    <option key={index} value={category.add_category}>
                      {category.add_category}
                    </option>
                  ))}
                </select>
              </div>
              <div className="input-group mb-3">
                <input
                  type="text"
                  className="form-control"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Add new category"
                />
                <button type="button" className="btn btn-outline-primary" onClick={handleAddCategory}>
                  Add
                </button>
              </div>
              <div className="mb-3">
                <label className="form-label">Data:</label>
                <input type="text" className="form-control" name="data" value={formData.data} onChange={handleChange} required />
              </div>
              </div>
         
 
 
             
              <div className="col-md-6">
 
              <div className="mb-3">
                <label className="form-label">Cells:</label>
                <input type="text" className="form-control" name="cells" value={formData.cells} onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Validity:</label>
                <input type="text" className="form-control" name="validity" value={formData.validity} onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Old Price:</label>
                <input type="text" className="form-control" name="old_price" value={formData.old_price} onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label">New Price:</label>
                <input type="text" className="form-control" name="new_price" value={formData.new_price} onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Extra Features:</label>
                <textarea className="form-control" name="extra_features" value={formData.extra_features} onChange={handleChange}></textarea>
              </div>
              <button type="submit" className="btn btn-primary">{currentPlan ? 'Update Plan' : 'Add Plan'}</button>
              </div>
       
              </div>
         
           
         
            </form>
         
          </div>
        </div>
      </div>
    </div>
  );
};
 
export default PlansList;