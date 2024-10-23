import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

function Sidebar({ isOpen, toggleSidebar }) {
    const location = useLocation(); // Get the current location
    const activeLink = location.pathname; // Use the current pathname as active link

    return (
        <div className={`sidebar ${isOpen ? 'd-block' : 'd-none d-md-block'}`} id='newsidebar'>
            <div className='sidebarsize d-flex justify-content-between align-items-center'>
                <h4>Admin Panel</h4>
                <button className="btn btn-close d-md-none text-white" id='xbutton' onClick={toggleSidebar}></button> {/* Close Button */}
            </div>
            <div className='newsidebarsize'>
                <ul>
                    <Link to="/userlist">
                        <li className={activeLink === '/userlist' ? 'active-link' : ''}>Users</li>
                    </Link>
                    <Link to="/planlist">
                        <li className={activeLink === '/planlist' ? 'active-link' : ''}>Plans</li>
                    </Link>
                    <Link to="/operatorlist">
                        <li className={activeLink === '/operatorlist' ? 'active-link' : ''}>Operators</li>
                    </Link>
                </ul>
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
