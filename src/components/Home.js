import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
 
const Home = () => {
    const [selectedType, setSelectedType] = useState('prepaid');
    const [userName, setUserName] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [operator, setOperator] = useState('');
    const [operatorsList, setOperatorsList] = useState([]);
    const navigate = useNavigate();
    const [agreedToTerms, setAgreedToTerms] = useState(false);
 
    // Fetch operators when the component mounts
    useEffect(() => {
        const fetchOperators = async () => {
            try {
                const response = await fetch("https://recharge.boonnet.co/api/operators");
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
    }, []);
 
    const handleSubmit = async (e) => { // Add async here
        e.preventDefault();
        const planType = selectedType.charAt(0).toUpperCase() + selectedType.slice(1);
    
        const data = {
            user_name: userName,
            plan_type: planType,
            mobile_number: mobileNumber,
            operator,
        };
    
        try {
            const response = await fetch('https://recharge.boonnet.co/api/home_data', {
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
    
    const handleLogout = () => {
        // Example: Clear user session, local storage, etc.
        localStorage.removeItem('userToken');  // Remove token or user data from localStorage
        navigate('/');  // Redirect to login page (or homepage)
    };
    return (
        <div className="container">
            <div className="row justify-content-center align-items-center vh-100">
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
                                    <label htmlFor="mobile-number">Name</label>
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

                                {/* Terms and Conditions */}
                                <div className="d-flex align-items-center mt-3" >
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        id="terms"
                                        checked={agreedToTerms}
                                        onChange={() => setAgreedToTerms(!agreedToTerms)}
                                        style={{border: "1px solid #9f9f9f"}}
                                    />
                                    <label className="form-check-label" htmlFor="terms" required>
                                        I agree to the <a href="https://merchant.razorpay.com/policy/PMdxchTtQAyFBU/terms" >Terms and Conditions</a> , <a href="/privacy-policy" >Privacy Policy</a> and <a href="https://merchant.razorpay.com/policy/PMdxchTtQAyFBU/refund" >Cancellation and Refund Policy
                                        </a>.
                                    </label>
                                </div>
 
                                <button type="submit" className="btn btn-primary btn-block mt-4 w-100" disabled={!agreedToTerms}>Proceed</button>
                            </form>
                        </div>
                        {/* <div className="card-footer text-center">
                            <p>Need assistance? <a href="#">Contact Us</a></p>
                        </div> */}
                        <div className="card-footer text-center">
                            <p>Not you? <a href="#" onClick={handleLogout}>Log Out</a></p>
                            <p><a href="/contact" >Contact Us</a></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
 
export default Home;
 