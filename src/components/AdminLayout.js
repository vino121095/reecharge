// AdminLayout.js
import React, { useState } from 'react';
import Sidebar from './Sidebar'; // Assuming Sidebar is in a separate file
import Header from './Header';   // Assuming Header is in a separate file

function AdminLayout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(prev => !prev);
    };

    return (
        <div className="d-flex">
            <div className={`col-md-2 ${isSidebarOpen ? 'd-block' : 'd-none d-md-block'}`} id='newsidebar'> 
                <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            </div>
            <div className="col-md-10">
                <Header toggleSidebar={toggleSidebar} />
                <div className="p-4">
                    {children}
                </div>
            </div>
        </div>
    );
}

export default AdminLayout;
