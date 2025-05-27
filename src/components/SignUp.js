import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import baseurl from "../Api Service/ApiService";

function SignUp() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible(!confirmPasswordVisible);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, phone, password, confirmPassword } = formData;

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const data = {
      name,
      phone,
      password,
      confirm_password: confirmPassword,
    };

    try {
      const response = await fetch(`${baseurl}/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.msg || "Registration failed. Please try again.");
        return;
      }

      alert("Registration successful!");
      setFormData({
        name: "",
        phone: "",
        password: "",
        confirmPassword: "",
      });
      setErrorMessage("");
      window.location.href = "/";
    } catch (error) {
      console.error("There was a problem with the registration:", error);
      setErrorMessage("Registration failed! Please try again.");
    }
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
            {/* Site Header */}
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
              <p className="text-white-50 mb-0">Join the Mobile Recharge Revolution</p>
            </div>
            
            <div className="card shadow-lg border-0" style={{borderRadius: '20px'}}>
              <div className="card-header text-center border-0 bg-transparent pt-4">
                <h4 className="mb-0 fw-bold text-dark">Create Account</h4>
                <p className="text-muted mt-2 mb-0">Start recharging your mobile instantly</p>
              </div>
              <div className="card-body px-4 pb-4">
                {errorMessage && (
                  <div className="alert alert-danger border-0" style={{
                    borderRadius: '12px',
                    backgroundColor: '#fee2e2',
                    color: '#dc2626',
                    border: 'none'
                  }}>
                    <i className="fas fa-exclamation-circle me-2"></i>
                    {errorMessage}
                  </div>
                )}
                <form onSubmit={handleSubmit}>
                  <div className="form-group mb-3">
                    <label htmlFor="name" className="form-label fw-semibold text-dark mb-2">
                      👤 Full Name
                    </label>
                    <input
                      type="text"
                      className="form-control py-3"
                      id="name"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      style={{
                        borderRadius: '12px',
                        border: '2px solid #e5e7eb',
                        fontSize: '16px'
                      }}
                    />
                  </div>
                  
                  <div className="form-group mb-3">
                    <label htmlFor="phone" className="form-label fw-semibold text-dark mb-2">
                      📞 Mobile Number
                    </label>
                    <input
                      type="tel"
                      className="form-control py-3"
                      id="phone"
                      placeholder="Enter 10-digit mobile number"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      pattern="\d{10}"
                      maxLength="10"
                      onInput={(e) => {
                        e.target.value = e.target.value
                          .replace(/[^0-9]/g, "")
                          .slice(0, 10);
                      }}
                      onInvalid={(e) => {
                        e.target.setCustomValidity("Please enter a valid 10-digit mobile number");
                      }}
                      style={{
                        borderRadius: '12px',
                        border: '2px solid #e5e7eb',
                        fontSize: '16px'
                      }}
                    />
                  </div>

                  <div className="form-group mb-3 position-relative">
                    <label htmlFor="password" className="form-label fw-semibold text-dark mb-2">
                      🔒 Password
                    </label>
                    <input
                      type={passwordVisible ? "text" : "password"}
                      className="form-control py-3"
                      id="password"
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={handleChange}
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
                        position: "absolute",
                        top: "70%",
                        right: "15px",
                        transform: "translateY(-50%)",
                        cursor: "pointer",
                        color: '#6b7280'
                      }}
                    >
                      <FontAwesomeIcon
                        icon={passwordVisible ? faEyeSlash : faEye}
                      />
                    </span>
                  </div>
                  <div className="form-group mb-4 position-relative">
                    <label htmlFor="confirmPassword" className="form-label fw-semibold text-dark mb-2">
                      🔐 Confirm Password
                    </label>
                    <input
                      type={confirmPasswordVisible ? "text" : "password"}
                      className="form-control py-3"
                      id="confirmPassword"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      style={{
                        borderRadius: '12px',
                        border: '2px solid #e5e7eb',
                        fontSize: '16px',
                        paddingRight: '50px'
                      }}
                    />
                    <span
                      onClick={toggleConfirmPasswordVisibility}
                      style={{
                        position: "absolute",
                        top: "70%",
                        right: "15px",
                        transform: "translateY(-50%)",
                        cursor: "pointer",
                        color: '#6b7280'
                      }}
                    >
                      <FontAwesomeIcon
                        icon={confirmPasswordVisible ? faEyeSlash : faEye}
                      />
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
                    🎉 Create Account & Start Recharging
                  </button>
                </form>
                
                <div className="text-center mt-4 pt-3" style={{borderTop: '1px solid #e5e7eb'}}>
                  <p className="mb-0 text-muted">
                    Already have an account? {' '}
                    <a href="/" className="fw-bold" style={{
                      color: '#0D6EFD',
                      textDecoration: 'none'
                    }}>
                      Sign In
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

export default SignUp;