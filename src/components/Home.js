import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState, useEffect } from 'react';
import {Link, useNavigate } from 'react-router-dom';

const Home = () => {
    const [selectedType, setSelectedType] = useState('prepaid');
    const [userName, setUserName] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [operator, setOperator] = useState('');
    const [operatorsList, setOperatorsList] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeSubmenu, setActiveSubmenu] = useState('');
    const navigate = useNavigate();
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    useEffect(() => {
        const fetchOperators = async () => {
            try {
                const response = await fetch("https://recharge.rbtamilan.in/api/operators");
                const data = await response.json();
                if (response.ok) {
                    setOperatorsList(data);
                } else {
                    console.error("Error fetching operators:", data);
                }
            } catch (error) {
                console.error("Fetch Error:", error);
            }
        };

        fetchOperators();

    // Define the resize handler
    const handleResize = () => {
        if (window.innerWidth >= 992) {
            setSidebarOpen(true);
        } else {
            setSidebarOpen(false);
        }
    };

    // Run once on mount to set the initial state
    handleResize();

    window.addEventListener("resize", handleResize);

    // Cleanup function
    return () => {
        window.removeEventListener("resize", handleResize);
    };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const planType = selectedType.charAt(0).toUpperCase() + selectedType.slice(1);

        const data = {
            user_name: userName,
            plan_type: planType,
            mobile_number: mobileNumber,
            operator,
        };

        try {
            const response = await fetch('https://recharge.rbtamilan.in/api/home_data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const result = await response.json();
            console.log('Success:', result);
            navigate('/about', { state: { planType: selectedType, operator } });
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const toggleSubmenu = (menu) => {
        setActiveSubmenu(activeSubmenu === menu ? '' : menu);
    };

    return (
        <div className="container-fluid">
            {/* Navbar */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-primary fixed-top">
                <div className="container-fluid">
                    <button 
                        className="navbar-toggler border-0 d-lg-none" 
                        type="button" 
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <a className="navbar-brand" href="#">Mobile Recharge</a>
                </div>
            </nav>

            {/* New Sidebar Design */}
            <div 
                className={`sidebar bg-white`} 
                style={{
                    width: '280px',
                    height: '100vh',
                    position: 'fixed',
                    left: sidebarOpen || window.innerWidth >= 992 ? '0' : '-280px',
                    top: '56px',
                    transition: 'all 0.3s ease',
                    zIndex: 1000,
                    paddingTop: '20px',
                    borderRight: '1px solid #e0e0e0',
                    overflowY: 'auto',
                    background: 'linear-gradient(to bottom, #ffffff, #f8f9fa)'
                }}
            >
                <div className="px-4 pb-4">
                    <div className="sidebar-header mb-4">
                        <h5 className="text-muted mb-3" style={{ fontSize: '0.85rem', letterSpacing: '1px' }}>MAIN MENU</h5>
                    </div>

                    <ul className="nav flex-column" style={{ gap: '8px' }}>
                        {/* Services Menu Item */}
                        <li className="nav-item">
                            <a 
                                className="nav-link rounded side-bar-link"
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    toggleSubmenu('services');
                                    navigate('/service');
                                    if (window.innerWidth < 992) {
                                        setSidebarOpen(false);
                                    }
                                }}
                                style={{
                                    color: '#000',
                                    padding: '12px 15px',
                                    position: 'relative',
                                    backgroundColor: activeSubmenu === 'services' ? '#f0f0f0' : 'transparent',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = activeSubmenu === 'services' ? '#f0f0f0' : 'transparent'}
                            >
                                <div className="d-flex align-items-center justify-content-between">
                                    <div className="d-flex align-items-center">
                                        <i className="bi bi-gear me-3" style={{ fontSize: '1.1rem' }}></i>
                                        <span style={{ fontSize: '0.95rem' }}>Services</span>
                                    </div>
                                </div>
                            </a>
                        </li>

                        {/* About Us Menu Item */}
                        <li className="nav-item">
                        <li className="nav-item">
    <Link 
        className="nav-link rounded side-bar-link"
        to="/about-us"
        onClick={(e) => {
            e.preventDefault();
            toggleSubmenu('about');
            navigate('/aboutus');
            if (window.innerWidth < 992) {
                setSidebarOpen(false);
            }
        }}
        style={{
            color: '#000',
            padding: '12px 15px',
            position: 'relative',
            backgroundColor: activeSubmenu === 'about' ? '#f0f0f0' : 'transparent',
            transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = activeSubmenu === 'about' ? '#f0f0f0' : 'transparent'}
    >
        <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
                <i className="bi bi-info-circle me-3" style={{ fontSize: '1.1rem' }}></i>
                <span style={{ fontSize: '0.95rem' }}>About Us</span>
            </div>
        </div>
    </Link>
</li>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Main Content */}
            <div 
                className="main-content" 
                style={{ 
                    marginTop: '76px', 
                    marginLeft: '0', 
                    transition: 'margin-left 0.3s ease-in-out',
                    padding: '20px'
                }}
            >
                <div className="row justify-content-center">
                    <div className="col-md-5">
                        <div className="card" id="signcard">
                            <div className="card-header text-center">
                                <h4>Mobile Recharge</h4>
                            </div>
                            <div className="card-body">
                                <form onSubmit={handleSubmit}>
                                    <div className="form-group">
                                        <div className="d-flex gap-4">
                                            <div className="form-check mt-2">
                                                <input
                                                    type="radio"
                                                    className="form-check-input"
                                                    id="prepaid"
                                                    name="mobileType"
                                                    value="prepaid"
                                                    checked={selectedType === 'prepaid'}
                                                    onChange={(e) => setSelectedType(e.target.value)}
                                                />
                                                <label className="form-check-label" htmlFor="prepaid">Prepaid</label>
                                            </div>
                                            <div className="form-check mt-2">
                                                <input
                                                    type="radio"
                                                    className="form-check-input"
                                                    id="postpaid"
                                                    name="mobileType"
                                                    value="postpaid"
                                                    checked={selectedType === 'postpaid'}
                                                    onChange={(e) => setSelectedType(e.target.value)}
                                                />
                                                <label className="form-check-label" htmlFor="postpaid">Postpaid</label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-group mt-4">
                                        <label htmlFor="name">Name</label>
                                        <input
                                            type="text"
                                            className="form-control mt-2"
                                            id="name"
                                            placeholder="Enter Your Name"
                                            required
                                            value={userName}
                                            onChange={(e) => setUserName(e.target.value)}
                                        />
                                    </div>

                                    <div className="form-group mt-4">
                                        <label htmlFor="mobile-number">Mobile Number</label>
                                        <input
                                            type="tel"
                                            className="form-control mt-2"
                                            id="mobile-number"
                                            placeholder="Enter mobile number"
                                            required
                                            value={mobileNumber}
                                            maxLength={10}
                                            pattern="\d{10}"
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/[^0-9]/g, '');
                                                if (value.length <= 10) {
                                                    setMobileNumber(value);
                                                }
                                            }}
                                        />
                                    </div>

                                    <div className="form-group mt-4">
                                        <label htmlFor="operator">Select Operator</label>
                                        <select
                                            className="form-control mt-2"
                                            id="operator"
                                            required
                                            value={operator}
                                            onChange={(e) => setOperator(e.target.value)}
                                        >
                                            <option value="" disabled>Select operator</option>
                                            {operatorsList.map((op, index) => (
                                                <option key={index} value={op.operator}>{op.operator}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="d-flex align-items-center mt-3">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id="terms"
                                            checked={agreedToTerms}
                                            onChange={() => setAgreedToTerms(!agreedToTerms)}
                                            style={{border: "1px solid #9f9f9f"}}
                                        />
                                        <label className="form-check-label ms-2" htmlFor="terms">
                                            I agree to the <a href="https://merchant.razorpay.com/policy/PMdxchTtQAyFBU/terms">Terms and Conditions</a>, <a href="/privacy-policy">Privacy Policy</a> and <a href="https://merchant.razorpay.com/policy/PMdxchTtQAyFBU/refund">Cancellation and Refund Policy</a>.
                                        </label>
                                    </div>

                                    <button type="submit" className="btn btn-primary btn-block mt-4 w-100" disabled={!agreedToTerms}>
                                        Proceed
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Overlay for mobile */}
            {sidebarOpen && window.innerWidth < 992 && (
                <div 
                    className="overlay" 
                    style={{
                        position: 'fixed',
                        top: '56px',
                        left: '0',
                        right: '0',
                        bottom: '0',
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        zIndex: 999
                    }}
                    onClick={() => {
                        setSidebarOpen(false);
                        setActiveSubmenu('');
                    }}
                />
            )}
        </div>
    );
}

export default Home;