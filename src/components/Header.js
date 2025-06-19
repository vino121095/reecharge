import React, { useState, useEffect } from 'react';
import baseurl from '../Api Service/ApiService';
 
function Header({ toggleSidebar }) {
    const [userInfo, setUserInfo] = useState({
        name: '', // To store name of user
        email: '', // To store email of user
        userType: '' // To store user type (employee/admin)
    });
 
    useEffect(() => {
        const storedUserType = localStorage.getItem('userType');
        const storedEmail = localStorage.getItem('email');
        const storedToken = localStorage.getItem('token'); // Get token if you're using JWT
 
        if (storedUserType && storedEmail) {
            setUserInfo({
                userType: storedUserType,
                email: storedEmail,
                name: '' // Initialize name as empty
            });
 
            // Fetch user details from the correct API based on userType
            if (storedUserType === 'admin') {
                fetchAdminDetails(storedEmail, storedToken); // Admin-specific details
            } else if (storedUserType === 'employee') {
                fetchEmployeeDetails(storedEmail, storedToken); // Employee-specific details
            }
        }
    }, []);
 
    // Fetch employee details based on email
    const fetchEmployeeDetails = async (email, token) => {
        try {
            const response = await fetch(`${baseurl}/api/employees`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Pass the token for auth if necessary
                }
            });
 
            const data = await response.json();
 
            // If email matches the response, update the user name
            const user = data.find(user => user.email === email);
            if (user) {
                setUserInfo(prevState => ({
                    ...prevState,
                    name: user.name || 'No Name' // Set the name of the employee
                }));
            }
        } catch (error) {
            console.error('Error fetching employee details:', error);
        }
    };
 
    // Fetch admin details based on email
    const fetchAdminDetails = async (email, token) => {
        try {
            const response = await fetch(`${baseurl}/api/adminLogin`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Pass the token for auth if necessary
                }
            });
 
            const data = await response.json();
 
            // If email matches the response, update the user name
            const user = data.find(user => user.email === email);
            if (user) {
                setUserInfo(prevState => ({
                    ...prevState,
                    name: user.name || 'No Name' // Set the name of the admin
                }));
            }
        } catch (error) {
            console.error('Error fetching admin details:', error);
        }
    };
 
    // Logout handler: clears user data from localStorage and redirects to login
    // const handleLogout = () => {
    //     localStorage.removeItem('userType');
    //     localStorage.removeItem('email');
    //     localStorage.removeItem('token'); // If you're using a token
    //     window.location.href = '/admin'; // Redirect to login page
    // };
 
    return (
        <div className="header text-white d-flex justify-content-between align-items-center">
            <h2>Rechargee</h2>
           
            <div className="d-flex align-items-center">
                {/* Display User Info (name and email) */}
                <span className="mr-3">
                    {userInfo.name ? `Hello, ${userInfo.name}` : 'Hello, Admin'}
                </span>
 
                {/* Logout Button (only display if user is logged in) */}
                {/* {userInfo.userType && (
                    <button className="btn btn-outline-light" onClick={handleLogout}>
                        Logout
                    </button>
                )} */}
            </div>
           
            <button className="btn btn-outline-light d-md-none" onClick={toggleSidebar}>
                ☰
            </button>
        </div>
    );
}
 
export default Header;