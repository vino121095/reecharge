import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import baseurl from '../Api Service/ApiService';

const SignIn = () => {
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const response = await fetch(`${baseurl}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    phone: phone,
                    password: password
                }),
            });

            const data = await response.json();
            
            if (response.ok) {
                
                // Store authentication token in localStorage
                if (data.token) {
                    localStorage.setItem("userToken", data.token);
                } else {
                    console.warn("Warning: No token found in response");
                }
                
                // Determine which user data to store
                let userData;
                let userId = null;
                let userPhone = null;
                
                if (data.user) {
                    userData = data.user;
                    userId = data.user.id || data.user._id || data.user.userId || data.user.uid;
                    userPhone = data.user.phone;
                } else if (data.userData) {
                    userData = data.userData;
                    userId = data.userData.id || data.userData._id || data.userData.userId || data.userData.uid;
                    userPhone = data.userData.phone;
                } else if (data.userInfo) {
                    userData = data.userInfo;
                    userId = data.userInfo.id || data.userInfo._id || data.userInfo.userId || data.userInfo.uid;
                    userPhone = data.userInfo.phone;
                } else if (data.data && data.data.user) {
                    userData = data.data.user;
                    userId = data.data.user.id || data.data.user._id || data.data.user.userId || data.data.user.uid;
                    userPhone = data.data.user.phone;
                } else {
                    userId = data.id || data._id || data.userId || data.uid || data.userid;
                    userPhone = data.phone;
                    
                    userData = {
                        phone: phone,
                        id: userId,
                        ...(data.name && { name: data.name }),
                        ...(data.role && { role: data.role }),
                        ...(data.phone && { phone: data.phone }),
                    };
                }
                
                if (!userId && data.userid) {
                    userId = data.userid;
                }
                
                if (!userId) {
                    console.warn("Warning: Could not determine user ID from response");
                    for (const key in data) {
                        if (key.toLowerCase().includes('id') && data[key]) {
                            userId = data[key];
                            break;
                        }
                    }
                }
                
                if (userId) {
                    localStorage.setItem("userId", userId.toString());
                    userData.id = userId;
                    if ('uid' in userData && userData.uid === userId) {
                        delete userData.uid;
                    }
                }
                
                // Store phone number
                if (userPhone) {
                    localStorage.setItem("phone", userPhone.toString());
                } else if (data.phone) {
                    localStorage.setItem("phone", data.phone.toString());
                } else {
                    localStorage.setItem("phone", phone.toString());
                }
                
                if (userData && Object.keys(userData).length > 0) {
                    localStorage.setItem("userData", JSON.stringify(userData));
                } else {
                    console.warn("Warning: No valid user data found to store");
                    localStorage.setItem("userData", JSON.stringify(data));
                }

                navigate('/home');
            } else {
                setError(data.msg || data.message || "Invalid mobile number or password");
            }
        } catch (error) {
            console.error("Error during login:", error);
            setError("An error occurred. Please try again.");
        }
    }

    const [passwordVisible, setPasswordVisible] = useState(false);

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0D6EFD 0%, #0856D6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-12 col-md-6 col-lg-4">
                        <div className="text-center mb-4">
                            <div style={{
                                background: 'white',
                                borderRadius: '50%',
                                width: '80px',
                                height: '80px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 20px',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                            }}>
                                <span style={{fontSize: '24px'}}>📱</span>
                            </div>
                            <h1 className="display-5 fw-bold text-white mb-2">Rbtamilan</h1>
                            <p className="text-white-50 mb-0">Mobile Recharge Made Easy</p>
                        </div>
                        
                        <div className="card shadow-lg border-0" style={{borderRadius: '20px'}}>
                            <div className="card-header text-center border-0 bg-transparent pt-4">
                                <h4 className="mb-0 fw-bold text-dark">Welcome Back</h4>
                                <p className="text-muted mt-2 mb-0">Sign in to recharge your mobile</p>
                            </div>
                            <div className="card-body px-4 pb-4">
                                {error && (
                                    <div className="alert alert-danger border-0" role="alert" style={{
                                        borderRadius: '12px',
                                        backgroundColor: '#fee2e2',
                                        color: '#dc2626',
                                        border: 'none'
                                    }}>
                                        <i className="fas fa-exclamation-circle me-2"></i>
                                        {error}
                                    </div>
                                )}
                                <form onSubmit={handleSubmit}>
                                    <div className="form-group mb-4">
                                        <label htmlFor="phone" className="form-label fw-semibold text-dark mb-2">
                                            📞 Mobile Number
                                        </label>
                                        <input
                                            type="tel"
                                            className="form-control py-3"
                                            id="phone"
                                            placeholder="Enter your 10-digit mobile number"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            required
                                            pattern="\d{10}"
                                            maxLength="10"
                                            onInput={(e) => {
                                                e.target.value = e.target.value
                                                    .replace(/[^0-9]/g, "")
                                                    .slice(0, 10);
                                            }}
                                            style={{
                                                borderRadius: '12px',
                                                border: '2px solid #e5e7eb',
                                                fontSize: '16px'
                                            }}
                                        />
                                    </div>
                                    <div className="form-group mb-4 position-relative">
                                        <label htmlFor="password" className="form-label fw-semibold text-dark mb-2">
                                            🔒 Password
                                        </label>
                                        <input
                                            type={passwordVisible ? 'text' : 'password'}
                                            className="form-control py-3"
                                            id="password"
                                            placeholder="Enter your password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            style={{
                                                borderRadius: '12px',
                                                border: '2px solid #e5e7eb',
                                                fontSize: '16px',
                                                paddingRight: '50px'
                                            }}
                                        />
                                        <span
                                            onClick={togglePasswordVisibility}
                                            style={{
                                                position: 'absolute',
                                                top: '70%',
                                                right: '15px',
                                                transform: 'translateY(-50%)',
                                                cursor: 'pointer',
                                                color: '#6b7280'
                                            }}
                                        >
                                            <FontAwesomeIcon icon={passwordVisible ? faEyeSlash : faEye} />
                                        </span>
                                    </div>

                                    <button 
                                        type="submit" 
                                        className="btn w-100 py-3 fw-bold"
                                        style={{
                                            background: 'linear-gradient(135deg, #0D6EFD 0%, #0856D6 100%)',
                                            border: 'none',
                                            borderRadius: '12px',
                                            color: 'white',
                                            fontSize: '16px',
                                            transition: 'transform 0.2s'
                                        }}
                                        onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                                        onMouseOut={(e) => e.target.style.transform = 'translateY(0px)'}
                                    >
                                        🚀 Sign In to Recharge
                                    </button>
                                </form>
                                
                                <div className="text-center mt-4 pt-3" style={{borderTop: '1px solid #e5e7eb'}}>
                                    <p className="mb-0 text-muted">
                                        New to mobile recharge? {' '}
                                        <a href="/signup" className="fw-bold" style={{
                                            color: '#0D6EFD',
                                            textDecoration: 'none'
                                        }}>
                                            Create Account
                                        </a>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SignIn;