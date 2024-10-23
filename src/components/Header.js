import React from 'react';

function Header({ toggleSidebar }) {
    return (
        <div className="header text-white d-flex justify-content-between align-items-center p-3 ">
        <h2>Rechargee</h2>
        <button className="btn btn-outline-light d-md-none" onClick={toggleSidebar}>
            ☰
        </button>
    </div>
    );
}

export default Header;
