import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
 
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("employee"); // Default to employee
  const [passwordVisible, setPasswordVisible] = useState(false);
  const navigate = useNavigate();
 
  const handleSubmit = async (e) => {
    e.preventDefault();
 
    // Select the appropriate endpoint based on user type
    const endpoint = userType === "admin" ? 'http://localhost:8001/api/adminLogin' : 'http://localhost:8001/api/employees-login';
 
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }), // Send email and password
      });
 
      const data = await response.json();
 
      if (response.ok) {
        console.log("Login successful:", data);
        // Store user type or token if needed, e.g., in localStorage
        localStorage.setItem('userType', userType); // Optional: store user type for session management
        // Redirect based on user type
        navigate(userType === "admin" ? "/userlist" : "/userlist");
        // Clear input fields only after successful login
        setEmail("");
        setPassword("");
      } else {
        console.log("Login Failed:", data);
        alert(data.msg || "Login failed"); // Provide user feedback
      }
 
    } catch (error) {
      console.error("Error during login:", error);
      alert("An error occurred. Please try again.");
    }
  };
 
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };
 
  return (
    <div className="container">
      <div className="row justify-content-center align-items-center vh-100">
        <div className="col-md-5">
          <div className="card" id="signcard">
            <div className="card-header text-center">
              <h4>Login</h4>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="userType">Login As</label>
                  <div className="d-flex gap-4 mt-2">
                    <div className="form-check">
                      <input
                        type="radio"
                        id="employee"
                        name="userType"
                        value="employee"
                        checked={userType === "employee"}
                        onChange={(e) => setUserType(e.target.value)}
                        className="form-check-input"
                      />
                      <label htmlFor="employee" className="form-check-label">Employee</label>
                    </div>
                    <div className="form-check">
                      <input
                        type="radio"
                        id="admin"
                        name="userType"
                        value="admin"
                        checked={userType === "admin"}
                        onChange={(e) => setUserType(e.target.value)}
                        className="form-check-input"
                      />
                      <label htmlFor="admin" className="form-check-label">Admin</label>
                    </div>
                  </div>
                </div>
                <div className="form-group mt-4">
                  <label htmlFor="username">Email</label>
                  <input
                    type="email"
                    className="form-control mt-2"
                    id="username"
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
                <button type="submit" className="btn btn-primary btn-block mt-4 w-100">Login</button>
              </form>
            </div>
            <div className="card-footer text-center">
              <p>Need assistance? <a href="#">Contact Us</a></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
 
export default Login;