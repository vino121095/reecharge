import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import baseurl from '../../Api Service/ApiService';

function Admin() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [passwordVisible, setPasswordVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value });
    };

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    };

    const validatePassword = (password) => {
        return password.length >= 8; // Enforce minimum 8 characters for password
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { email, password } = formData;

        if (!validateEmail(email)) {
            setErrorMessage('Please enter a valid email address.');
            return;
        }

        if (!validatePassword(password)) {
            setErrorMessage('Password must be at least 8 characters long.');
            return;
        }

        const data = {
            email,
            password,
        };

        try {
            const response = await fetch(`${baseurl}/api/admin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                setErrorMessage(result.msg || 'Registration failed. Please try again.');
                return;
            }

            alert('Registration successful!');
            setFormData({
                email: '',
                password: '',
            });
            setErrorMessage('');

        } catch (error) {
            console.error('There was a problem with the registration:', error);
            setErrorMessage('Registration failed! Please try again.');
        }
    };

    return (
        <div className="container">
            <div className="row justify-content-center align-items-center vh-100">
                <div className="col-md-5">
                    <div className="card" id="signcard">
                        <div className="card-header text-center">
                            <h4>Sign Up</h4>
                        </div>
                        <div className="card-body">
                            {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
                            <form onSubmit={handleSubmit}>
                                <div className="form-group mt-4">
                                    <label htmlFor="email">Email address</label>
                                    <input
                                        type="email"
                                        className="form-control mt-2"
                                        id="email"
                                        placeholder="Enter email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="form-group mt-4 position-relative">
                                    <label htmlFor="password">Password</label>
                                    <input
                                        type={passwordVisible ? 'text' : 'password'}
                                        className="form-control mt-2"
                                        id="password"
                                        placeholder="Password (min 8 characters)"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                    <span className="mt-3"
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
                                <button type="submit" className="btn btn-primary btn-block mt-4 w-100">Sign Up</button>
                            </form>
                        </div>
                        <div className="card-footer text-center">
                            <p>Already have an account? <a href="/admin">Sign In</a></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Admin;
