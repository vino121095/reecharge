import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import baseurl from '../Api Service/ApiService';
 
 
const SignIn = () => {
 
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
 
    const handleSubmit = async (e) => {
        e.preventDefault();  // Prevent page refresh on form submit
        setError(""); // Clear any previous errors
 
        try {
            const response = await fetch(`${baseurl}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                }),
            });
 
            const data = await response.json();
            console.log(data);
            
            if (response.ok) {
                console.log("Login successful data:", data);
                
                // Store authentication token in localStorage
                if (data.token) {
                    localStorage.setItem("userToken", data.token);
                } else {
                    console.warn("Warning: No token found in response");
                }
                
                // Determine which user data to store
                let userData;
                let userId = null;
                let phone = null;
                
                if (data.user) {
                    userData = data.user;
                    userId = data.user.id || data.user._id || data.user.userId || data.user.uid;
                    phone = data.user.phone;
                } else if (data.userData) {
                    userData = data.userData;
                    userId = data.userData.id || data.userData._id || data.userData.userId || data.userData.uid;
                    phone = data.userData.phone;
                } else if (data.userInfo) {
                    userData = data.userInfo;
                    userId = data.userInfo.id || data.userInfo._id || data.userInfo.userId || data.userInfo.uid;
                    phone = data.userInfo.phone;
                } else if (data.data && data.data.user) {
                    userData = data.data.user;
                    userId = data.data.user.id || data.data.user._id || data.data.user.userId || data.data.user.uid;
                    phone = data.data.user.phone;
                } else {
                    // If no recognized user object, use the direct data
                    // Prioritize 'id' over 'uid' if both exist
                    userId = data.id || data._id || data.userId || data.uid || data.userid;
                    phone = data.phone;
                    
                    // Create a userData object with available information, but avoid redundancy
                    userData = {
                        email: email,
                        // Use only one ID field (prioritize 'id')
                        id: userId,
                        ...(data.name && { name: data.name }),
                        ...(data.role && { role: data.role }),
                        ...(data.phone && { phone: data.phone }),
                    };
                }
                
                // Ensure we have some form of user ID
                if (!userId && data.userid) {
                    userId = data.userid;
                }
                
                if (!userId) {
                    console.warn("Warning: Could not determine user ID from response");
                    // As a last resort, extract any property that looks like an ID
                    for (const key in data) {
                        if (key.toLowerCase().includes('id') && data[key]) {
                            userId = data[key];
                            break;
                        }
                    }
                }
                
                // Make sure user ID is explicitly stored with consistent key name
                if (userId) {
                    localStorage.setItem("userId", userId.toString());
                    // Ensure it's in the userData object with just one ID field
                    userData.id = userId;
                    // Remove any redundant ID fields
                    if ('uid' in userData && userData.uid === userId) {
                        delete userData.uid;
                    }
                }
                
                // Store phone number in localStorage if available
                if (phone) {
                    localStorage.setItem("phone", phone.toString());
                } else if (data.phone) {
                    localStorage.setItem("phone", data.phone.toString());
                }
                
                console.log("Storing user data:", userData);
                console.log("Storing user ID:", userId);
                console.log("Storing phone:", phone || data.phone);
                
                // Store user data if we have something valid
                if (userData && Object.keys(userData).length > 0) {
                    localStorage.setItem("userData", JSON.stringify(userData));
                } else {
                    console.warn("Warning: No valid user data found to store");
                    // Store the whole response as a fallback
                    localStorage.setItem("userData", JSON.stringify(data));
                }

                // Navigate to home page after successful authentication
                navigate('/home');
            } else {
                console.log("Login Failed:", data);
                setError(data.msg || data.message || "Invalid email or password");
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
        <div className="container">
            <div className="row justify-content-center align-items-center vh-100">
                <div className="col-md-5">
                    <div className="card" id="signcard">
                        <div className="card-header text-center">
                            <h4>Sign In</h4>
                        </div>
                        <div className="card-body">
                            {error && (
                                <div className="alert alert-danger" role="alert">
                                    {error}
                                </div>
                            )}
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label htmlFor="email">Email address</label>
                                    <input
                                        type="email"
                                        className="form-control mt-2"
                                        id="email"
                                        placeholder="Enter email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group mt-4 position-relative">
                                    <label htmlFor="password">Password</label>
                                    <input
                                        type={passwordVisible ? 'text' : 'password'}
                                        className="form-control mt-2"
                                        id="password"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <span className='mt-3'
                                        onClick={togglePasswordVisibility}
                                        style={{
                                            position: 'absolute',
                                            top: '50%',
                                            right: '10px',
                                            transform: 'translateY(-50%)',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <FontAwesomeIcon icon={passwordVisible ? faEyeSlash : faEye} />
                                    </span>
                                </div>
                                <div className="mt-4">
                                    {/* <a href="#">Forgot your password?</a> */}
                                </div>
 
                                <button type="submit" className="btn btn-primary btn-block mt-4 w-100">
                                    Sign In
                                </button>
                            </form>
                        </div>
                        <div className="card-footer text-center">
                            <p>
                                Don't have an account? <a href="/signup">Signup</a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
 
export default SignIn;