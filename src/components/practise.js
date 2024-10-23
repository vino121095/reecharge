import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState } from 'react';

const Home = () => {
    const [selectedType, setSelectedType] = useState('prepaid'); // Default selection

    const handleTypeChange = (event) => {
        setSelectedType(event.target.value);
    };

    return (
        <div className="container">
            <div className="row justify-content-center text-align-center align-items-center vh-100">
                <div className="col-md-5">
                    <div className="card" id="signcard">
                        <div className="card-header text-center">
                            <h4>Mobile Recharge</h4>
                        </div>
                        <div className="card-body">
                            <form>
                            <div className="form-group">
            {/* <label>Select Type</label> */}
            <div className='d-flex gap-4'>
                <div className="form-check mt-2">
                    <input
                        type="radio"
                        className="form-check-input"
                        id="prepaid"
                        name="mobileType"
                        value="prepaid"
                        checked={selectedType === 'prepaid'}
                        onChange={handleTypeChange}
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
                        onChange={handleTypeChange}
                    />
                    <label className="form-check-label" htmlFor="postpaid">Postpaid</label>
                </div>
            </div>
        </div>
                                <div className="form-group mt-4">
    <label htmlFor="mobile-number">Mobile Number</label>
    <input
        type="tel"
        className="form-control mt-2"
        id="mobile-number"
        placeholder="Enter mobile number"
        required
        minLength={10}
        maxLength={15}
        pattern="\d{10,15}" // Regex to ensure only digits
        title="Please enter a valid mobile number (10 to 15 digits)"
        inputMode="numeric" // Ensures numeric keyboard on mobile
        onInput={(e) => {
            // Allow only digits
            e.target.value = e.target.value.replace(/\D/g, '');
        }}
    />
</div>


                              
                                <div className="form-group mt-4">
    <label htmlFor="operator">Select Operator</label>
    <select className="form-control mt-2" id="operator" required>
        <option value="" disabled selected>Select operator</option>
        <option value="verizon">Verizon</option>
        <option value="att">AT&T</option>
        <option value="t-mobile">T-Mobile</option>
        <option value="sprint">Sprint</option>
    </select>
</div>

                                <button type="submit" className="btn btn-primary btn-block mt-4 w-100">Proceed</button>
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

export default Home;
