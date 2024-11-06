import React, { useState } from 'react';
 
import { Link, useLocation, useNavigate } from 'react-router-dom';
 
function Sidebar({ isOpen, toggleSidebar }) {
    const location = useLocation();  // Get the current location
    const activeLink = location.pathname;  // Use the current pathname as active link
 
    // Get the user role from localStorage
    const userType = localStorage.getItem('userType');  // Can be 'admin' or 'employee'
 
    const navigate = useNavigate(); // Use navigate to redirect after logout
 
    const handleLogout = () => {
        // Clear user-related data from localStorage (or sessionStorage)
        localStorage.removeItem('userType'); // You can also clear tokens if stored in localStorage/sessionStorage
        // Redirect to login page
        navigate('/admin');
    };
 
    return (
        <div className={`sidebar ${isOpen ? 'd-block' : 'd-none d-md-block'}`} id='newsidebar'>
            <div className='sidebarsize d-flex justify-content-between align-items-center'>
                <h4>Admin Panel</h4>
                <button className="btn btn-close d-md-none text-white" id='xbutton' onClick={toggleSidebar}></button> {/* Close Button */}
            </div>
            <div className='newsidebarsize'>
                <ul>
                    <Link to="/userlist">
                        <li className={activeLink === '/userlist' ? 'active-link' : ''}>Recharge</li>
                    </Link>
                    <Link to="/paidlist">
                        <li className={activeLink === '/paidlist' ? 'active-link' : ''}>Paid List</li>
                    </Link>
                    <Link to="/planlist">
                        <li className={activeLink === '/planlist' ? 'active-link' : ''}>Plans</li>
                    </Link>
                    <Link to="/operatorlist">
                        <li className={activeLink === '/operatorlist' ? 'active-link' : ''}>Operators</li>
                    </Link>
 
                    {/* Conditionally render "Add Employees" based on userType */}
                    {userType === 'admin' && (
                        <Link to="/addemployees">
                            <li className={activeLink === '/addemployees' ? 'active-link' : ''}>Add Employees</li>
                        </Link>
                    )}
                </ul>
            </div>
 
 
 {/* Logout button at the bottom of sidebar */}
 <div className="mt-auto">
                <button className="btn btn-danger w-100" onClick={handleLogout}>Logout</button>
            </div>
 
 
            {/* CSS for active link */}
            <style jsx>{`
                .active-link {
                    background-color: #0069d9;
                    color: white;
                }
            `}</style>
        </div>
    );
}
 
export default Sidebar;
 
 