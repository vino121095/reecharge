import React, { useState, useEffect } from 'react';
import AdminLayout from '../AdminLayout';
import baseurl from '../../Api Service/ApiService';

const EmployeesTask = () => {
  const [activeEmployees, setActiveEmployees] = useState([]);
  const [employeeTasks, setEmployeeTasks] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('assigned'); // 'assigned' or 'completed'
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [exportDate, setExportDate] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showDateRange, setShowDateRange] = useState(false);
  const [employeeLoginDetails, setEmployeeLoginDetails] = useState({});

  // Fetch active employees
  useEffect(() => {
    const fetchActiveEmployees = async () => {
      try {
        const response = await fetch(`${baseurl}/api/active-employees`);
        if (!response.ok) throw new Error("Failed to fetch active employees");
        const data = await response.json();
        setActiveEmployees(data.data || []);
        
        // If we have employees, select the first one by default
        if (data.data && data.data.length > 0) {
          setSelectedEmployee(data.data[0].eid);
        }
      } catch (error) {
        console.error("Error fetching active employees:", error);
        setError("Failed to load active employees. " + error.message);
      }
    };

    fetchActiveEmployees();
  }, []);

  // Fetch tasks for selected employee
  useEffect(() => {
    const fetchEmployeeTasks = async () => {
      if (!selectedEmployee) return;
      
      setLoading(true);
      try {
        // Fetch appropriate data based on view mode
        let endpoint;
        
        if (viewMode === 'assigned') {
          // Using the correct endpoint for pending tasks
          endpoint = `${baseurl}/api/home_data/getemployeedata/${selectedEmployee}`;
        } else {
          // Using the correct endpoint for paid tasks
          endpoint = `${baseurl}/api/home_data/paid/employee/${selectedEmployee}`;
        }
        
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error(`Failed to fetch ${viewMode} tasks`);
        
        const data = await response.json();
        
        // Extract login/logout information from first task (if available)
        if (data.length > 0 && data[0].employee) {
          setEmployeeLoginDetails({
            [selectedEmployee]: {
              lastLogin: data[0].employee.last_loginat,
              lastLogout: data[0].employee.last_logoutat,
              name: data[0].employee.name
            }
          });
        }
        
        // Update the tasks for this employee
        setEmployeeTasks(prev => ({
          ...prev,
          [selectedEmployee]: {
            ...prev[selectedEmployee],
            [viewMode]: data
          }
        }));
      } catch (error) {
        console.error(`Error fetching ${viewMode} tasks:`, error);
        setError(`Failed to load ${viewMode} tasks. ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeTasks();
    
    // Set up polling for real-time updates
    const interval = setInterval(fetchEmployeeTasks, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, [selectedEmployee, viewMode]);

  // Fetch all tasks for employees to display counts
  useEffect(() => {
    const fetchAllEmployeeTasks = async () => {
      if (!activeEmployees.length) return;
      
      try {
        // For each employee, fetch their task counts
        const fetchPromises = activeEmployees.map(async (employee) => {
          // Fetch pending tasks
          const pendingResponse = await fetch(`${baseurl}/api/home_data/getemployeedata/${employee.eid}`);
          if (!pendingResponse.ok) throw new Error(`Failed to fetch pending tasks for ${employee.name}`);
          const pendingData = await pendingResponse.json();
          
          // Fetch paid tasks
          const paidResponse = await fetch(`${baseurl}/api/home_data/paid/employee/${employee.eid}`);
          if (!paidResponse.ok) throw new Error(`Failed to fetch paid tasks for ${employee.name}`);
          const paidData = await paidResponse.json();
          
          // Extract login/logout info if available
          if (pendingData.length > 0 && pendingData[0].employee) {
            setEmployeeLoginDetails(prev => ({
              ...prev,
              [employee.eid]: {
                lastLogin: pendingData[0].employee.last_loginat,
                lastLogout: pendingData[0].employee.last_logoutat,
                name: pendingData[0].employee.name
              }
            }));
          }
          
          return {
            employeeId: employee.eid,
            tasks: {
              assigned: pendingData,
              completed: paidData
            }
          };
        });
        
        const results = await Promise.all(fetchPromises);
        
        // Update the employeeTasks state with all fetched data
        const newTasksState = {};
        results.forEach(result => {
          newTasksState[result.employeeId] = result.tasks;
        });
        
        setEmployeeTasks(newTasksState);
      } catch (error) {
        console.error("Error fetching all employee tasks:", error);
        // Don't set global error here to avoid disrupting the UI
      }
    };
    
    fetchAllEmployeeTasks();
  }, [activeEmployees]);

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

  const handleExportDateChange = (e) => {
    setExportDate(e.target.value);
    setShowDateRange(e.target.value === 'date-range');
  };

  const exportToExcel = () => {
    if (!selectedEmployee || !employeeTasks[selectedEmployee]?.[viewMode]) return;
    
    // Get the employee name
    const employee = activeEmployees.find(emp => emp.eid === selectedEmployee);
    const employeeName = employee ? employee.name : 'Unknown';
    
    // Filter data based on date selection
    let taskData = [...employeeTasks[selectedEmployee][viewMode]];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (exportDate === 'today') {
      taskData = taskData.filter(task => {
        const taskDate = new Date(viewMode === 'assigned' ? task.createdAt : task.payment_date);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate.getTime() === today.getTime();
      });
    } else if (exportDate === 'date-range' && startDate && endDate) {
      const startDateTime = new Date(startDate);
      startDateTime.setHours(0, 0, 0, 0);
      
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);
      
      taskData = taskData.filter(task => {
        const taskDate = new Date(viewMode === 'assigned' ? task.createdAt : task.payment_date);
        return taskDate >= startDateTime && taskDate <= endDateTime;
      });
    }

    // Prepare data for export
    const exportData = taskData.map((task, index) => ({
      'S No': index + 1,
      'Username': task.username,
      'Phone Number': task.mobile_number,
      'Operator': task.operator,
      'Type': task.plan_type,
      'Amount': task.amount || '0',
      'Date': formatDateTime(viewMode === 'assigned' ? task.createdAt : task.payment_date),
      'Last Login': formatDateTime(task.employee?.last_loginat),
      'Last Logout': formatDateTime(task.employee?.last_logoutat),
      'Status': viewMode === 'assigned' ? 'pending' : 'paid'
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
    const taskType = viewMode === 'assigned' ? 'pending_recharges' : 'completed_recharges';
    link.setAttribute('href', url);
    link.setAttribute('download', `${employeeName}_${taskType}_${dateFormat}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getTaskCountForEmployee = (employeeId, mode) => {
    if (!employeeTasks[employeeId]?.[mode]) return '...';
    return employeeTasks[employeeId][mode].length;
  };

  return (
    <AdminLayout>
      <div className="container-fluid mt-4">
        <div className="row">
          {/* Left Sidebar - Employee List */}
          <div className="col-md-3">
            <div className="card">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">Active Employees</h5>
              </div>
              <div className="card-body p-0">
                <ul className="list-group list-group-flush">
                  {activeEmployees.length === 0 ? (
                    <li className="list-group-item text-center">No active employees found</li>
                  ) : (
                    activeEmployees.map(employee => (
                      <li 
                        key={employee.eid} 
                        className={`list-group-item ${selectedEmployee === employee.eid ? 'active' : ''}`}
                        onClick={() => setSelectedEmployee(employee.eid)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="justify-content-between align-items-center">
                          <div>
                            <span className="fw-bold">{employee.name}</span>
                            <small className="d-block">{employee.email}</small>
                            
                            <span className="">pending: {getTaskCountForEmployee(employee.eid, 'assigned')}</span><br/>
                            <span className="">paid: {getTaskCountForEmployee(employee.eid, 'completed')}</span>
                            
                            {employeeLoginDetails[employee.eid] && (
                              <div className="mt-1 small">
                                <div className="">
                                  Last login: {formatDateTime(employeeLoginDetails[employee.eid].lastLogin)}
                                </div>
                                <div className="">
                                  Last logout: {formatDateTime(employeeLoginDetails[employee.eid].lastLogout)}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Main Content - Employee Tasks */}
          <div className="col-md-9">
            <div className="card">
              <div className="card-header">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    {selectedEmployee ? 
                      `${activeEmployees.find(emp => emp.eid === selectedEmployee)?.name}'s ${viewMode === 'assigned' ? 'Pending Recharges' : 'Completed Recharges'}` :
                      'Select an Employee'
                    }
                  </h5>
                  
                  <div className="d-flex align-items-center">
                    {/* View mode toggle */}
                    <div className="form-check form-switch me-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="viewModeSwitch"
                        checked={viewMode === 'completed'}
                        onChange={() => setViewMode(viewMode === 'assigned' ? 'completed' : 'assigned')}
                      />
                      <label className="form-check-label" htmlFor="viewModeSwitch">
                        {viewMode === 'assigned' ? 'Pending Recharges' : 'Completed Recharges'}
                      </label>
                    </div>
                    
                    {/* Export controls */}
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
                        disabled={!selectedEmployee || (exportDate === 'date-range' && (!startDate || !endDate))}
                      >
                        Export Excel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card-body">
                {loading ? (
                  <div className="d-flex justify-content-center p-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : error ? (
                  <div className="alert alert-danger">{error}</div>
                ) : !selectedEmployee ? (
                  <div className="alert alert-info">Please select an employee from the list</div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>S No</th>
                          <th>Username</th>
                          <th>Phone Number</th>
                          <th>Operator</th>
                          <th>Type</th>
                          <th>Price</th>
                          <th>Date & Time</th>
                          <th>Last Login</th>
                          <th>Last Logout</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {!employeeTasks[selectedEmployee]?.[viewMode] ? (
                          <tr>
                            <td colSpan="10" className="text-center">Loading data...</td>
                          </tr>
                        ) : employeeTasks[selectedEmployee][viewMode].length === 0 ? (
                          <tr>
                            <td colSpan="10" className="text-center">No {viewMode === 'assigned' ? 'pending' : 'completed'} tasks found</td>
                          </tr>
                        ) : (
                          employeeTasks[selectedEmployee][viewMode].map((task, index) => (
                            <tr key={task.id || index} className={task.amount && parseFloat(task.amount) > 0 ? "" : "table-light"}>
                              <td>{index + 1}</td>
                              <td>{task.username}</td>
                              <td>{task.mobile_number}</td>
                              <td>{task.operator}</td>
                              <td>{task.plan_type}</td>
                              <td>{task.amount ? `₹${task.amount}` : "-"}</td>
                              <td>{formatDateTime(viewMode === 'assigned' ? task.createdAt : task.payment_date)}</td>
                              <td>{formatDateTime(task.employee?.last_loginat)}</td>
                              <td>{formatDateTime(task.employee?.last_logoutat)}</td>
                              <td>
                                <span style={{fontSize:'16px'}}>
                                  {viewMode === 'assigned' ? 'pending' : 'paid'}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default EmployeesTask;