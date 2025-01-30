import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios'; // Make sure axios is installed for API calls
 
const PlanDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { plan } = location.state || {}; // Retrieve the plan from state
 
  // State for storing operator data
  const [operatorData, setOperatorData] = useState(null);
  const [error, setError] = useState(null);
 
  useEffect(() => {
    // Fetch operator data from API
    const fetchOperatorData = async () => {
      try {
        const response = await axios.get('https://recharge.rbtamilan.in/api/operators');
        const operators = response.data; // Assuming response.data is an array of operators
       
        // Find the operator that matches the selected plan's operator
        const selectedOperator = operators.find(op => op.operator.toLowerCase() === plan.operator.toLowerCase());
        if (selectedOperator) {
          setOperatorData(selectedOperator); // Set the operator data if found
        } else {
          setError('Operator not found.');
        }
      } catch (error) {
        setError('Error fetching operator data.');
        console.error('Error fetching operators:', error);
      }
    };
 
    fetchOperatorData();
  }, [plan.operator]); // Fetch operator data when plan.operator changes
 
  // Handle payment
  const handlePayment = () => {
    const paystackPublicKey = 'pk_test_7fdd906bb13e7ac7c22ddead913085145672d515'; // Replace with your Paystack public key
 
    const handler = window.PaystackPop.setup({
      key: paystackPublicKey,
      email: 'vijay.deecodes@gmail.com', // Replace with customer’s email
      amount: plan.new_price * 100, // Amount in kobo (100 kobo = 1 unit of the currency)
      currency: 'GHS', // Currency code
      onClose: () => {
        alert('Transaction was not completed, you can close this window.');
      },
      callback: (response) => {
        console.log(response); // Log response for debugging
        // You can call your backend to confirm the transaction here
        // e.g., axios.post('/api/payment/verify', { reference: response.reference });
      },
    });
 
    handler.openIframe();
  };
 
  if (!plan) {
    return <p>No plan details available.</p>; // Handle no plan case
  }
 
  if (error) {
    return <p className="text-danger">{error}</p>; // Handle error fetching operator data
  }
 
  return (
    <div className="container">
      <div className="row justify-content-center text-align-center align-items-center vh-100">
        <div className="col-md-5">
          <i
            className="bi bi-arrow-left"
            style={{
              cursor: 'pointer',
              marginRight: '30px',
              marginBottom: '10px',
              fontSize: '20px',
            }}
            onClick={() => navigate(-1)} // Back navigation
            aria-label="Go back"
          ></i>
          <h4 className="text-center mb-4">Payment</h4>
 
          {/* Display operator image and name */}
          {operatorData ? (
            <div className="text-center">
              <img
                src={`http://localhost:8001/${operatorData.image}`} // Assuming the image URL is relative to the server root
                alt={operatorData.operator}
                style={{ width: '100px', height: 'auto' }}
              />
              <h5 className="mt-3">{operatorData.operator}</h5>
            </div>
          ) : (
            <p>Loading operator information...</p>
          )}
 
          <h2 className="text-center mt-4">
            <span>₹</span>{plan.new_price}
          </h2>
          <p className="text-danger text-decoration-line-through text-center" id='striketext'>₹{plan.old_price}</p>
 
          <div className="card mt-5">
            <div className="card-body">
              <h5 className="">Plan Details:</h5>
              <p id="plantext">Data: {plan.data} GB/Day</p>
              <p id="plantext">Calls: {plan.cells} Calls</p>
              <p id="plantext" className="mb-2">
                Validity: {plan.validity} Days
              </p>
            </div>
          </div>
 
          <div className="card mt-3">
            <div className="card-body">
              <h5 className="">Extra Benefits:</h5>
              <p id="plantext" className="mb-2">
                {plan.extra_features}
              </p>
            </div>
          </div>
 
          <button
            className="btn btn-primary btn-block mt-4 mb-4 w-100"
            onClick={handlePayment}
          >
            Pay Now
          </button>
          <p style={{textAlign: "center"}}><a href="/contact" >Contact Us</a></p>
        </div>
      </div>
    </div>
  );
};
 
export default PlanDetail;
 
 