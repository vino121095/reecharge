import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState } from 'react';

const Home = () => {
    const [formData, setFormData] = useState({
        name: '',
        mobileNumber: '',
        message: '',
    });

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        localStorage.setItem('contactFormData', JSON.stringify(formData));
        alert('Send Successfully');
        setFormData({ name: '', mobileNumber: '', message: '' }); // Reset form fields
    };

    return (
        <div className="container">
            <div className="row justify-content-center align-items-center vh-100">
                <div className="col-md-5">
                    <div className="card" id="signcard">
                        <div className="card-header text-center">
                            <h4>Contact Us</h4>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <p>Email: <a href="mailto:rbtamilangroups@gmail.com">rbtamilangroups@gmail.com</a></p>
                                    <p>Phone: <a href="tel:9514262823" className="ms-1">9514262823</a></p>
                                    <p>Address: RT Gold Finance, Natraj complex, Mecheri Mettur taluka Salem District -636453</p>
                                </div>

                                <div className="form-group mt-4">
                                    <label htmlFor="name">Name</label>
                                    <input
                                        type="text"
                                        className="form-control mt-2"
                                        id="name"
                                        placeholder="Enter Your Name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-group mt-4">
                                    <label htmlFor="mobileNumber">Mobile Number</label>
                                    <input
                                        type="tel"
                                        className="form-control mt-2"
                                        id="mobileNumber"
                                        placeholder="Enter mobile number"
                                        value={formData.mobileNumber}
                                        onChange={handleChange}
                                        required
                                        maxLength={10}
                                        pattern="\d{10}"
                                    />
                                </div>

                                <div className="form-group mt-4">
                                    <label htmlFor="message">Message</label><br />
                                    <textarea
                                        className="form-control mt-2"
                                        id="message"
                                        placeholder="Message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <button type="submit" className="btn btn-primary btn-block mt-4 w-100">Submit</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
