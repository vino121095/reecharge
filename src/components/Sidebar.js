import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import baseurl from '../Api Service/ApiService';
function Sidebar({ isOpen, toggleSidebar }) {
    const location = useLocation();
    const activeLink = location.pathname;
    const userType = localStorage.getItem('userType');
    const email = localStorage.getItem('email');
    const navigate = useNavigate();
    const handleLogout = async () => {
        if(userType === 'employee'){
            try {
                const response = await fetch(`${baseurl}/api/employees-logout`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email,
                        logoutTime: new Date().toISOString() // Send current timestamp
                    })
                });
                if (!response.ok) {
                    throw new Error('Logout failed');
                }
                // Clear localStorage
                localStorage.removeItem('userType');
                localStorage.removeItem('token');
                localStorage.removeItem('email');
                localStorage.removeItem('employeeId');
                localStorage.removeItem('loginTime');
                // Redirect to login page
                navigate('/admin');
            } catch (error) {
                console.error('Logout failed:', error);
                alert('Logout failed. Please try again.');
            }
        }
        else{
            localStorage.removeItem('userType');
            localStorage.removeItem('token');
            localStorage.removeItem('email');
            localStorage.removeItem('employeeId');
            navigate('/admin');
        }
    };
    return (
        <div className={`sidebar ${isOpen ? 'd-block' : 'd-none d-md-block'}`} id='newsidebar'>
            <div className='sidebarsize d-flex justify-content-between align-items-center'>
                <h4>Admin Panel</h4>
                <button className="btn btn-close d-md-none text-white" id='xbutton' onClick={toggleSidebar}></button>
            </div>
            <div className='newsidebarsize'>
                <ul>
                    <li className="nav-item">
                        <Link
                            to="/userlist"
                            className={`nav-link ${activeLink === '/userlist' ? 'active' : ''}`}
                            onClick={() => window.innerWidth < 992 && toggleSidebar()}
                        >
                            User List
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link
                            to="/deleted-history"
                            className={`nav-link ${activeLink === '/deleted-history' ? 'active' : ''}`}
                            onClick={() => window.innerWidth < 992 && toggleSidebar()}
                        >
                            Deleted History
                        </Link>
                    </li>
                    <Link to="/paidlist">
                        <li className={activeLink === '/paidlist' ? 'active-link' : ''}>Paid List</li>
                    </Link>
                    <Link to="/planlist">
                        <li className={activeLink === '/planlist' ? 'active-link' : ''}>Plans</li>
                    </Link>
                    <Link to="/operatorlist">
                        <li className={activeLink === '/operatorlist' ? 'active-link' : ''}>Operators</li>
                    </Link>
                    {userType === 'admin' && (
                        <Link to="/addemployees">
                            <li className={activeLink === '/addemployees' ? 'active-link' : ''}>Add Employees</li>
                        </Link>
                    )}
                    {userType === 'admin' && (
                        <Link to="/employees-task">
                            <li className={activeLink === '/employees-task' ? 'active-link' : ''}>Employees Task</li>
                        </Link>
                    )}
                    {userType === 'admin' && (
                       <Link to="/add-new-feature">
                       <li className={activeLink === '/add-new-feature' ? 'active-link' : ''}>Add New Feature</li>
                   </Link>
                    )}
                </ul>
            </div>
            <div className="mt-auto">
                <button className="btn btn-danger w-100" onClick={handleLogout}>Logout</button>
            </div>
            <style jsx>{`
                .active-link {
                    background-color: #0069D9;
                    color: white;
                }
            `}</style>
        </div>
    );
}
export default Sidebar;