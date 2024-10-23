import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
 
const PlanDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { plan } = location.state || {}; // Retrieve the plan from state
 
  if (!plan) {
    return <p>No plan details available.</p>; // Handle no plan case
  }
 
  const handlePayment = () => {
    const paystackPublicKey = 'pk_test_7fdd906bb13e7ac7c22ddead913085145672d515'; // Replace with your Paystack public key
 
    const handler = window.PaystackPop.setup({
        key: paystackPublicKey,
        email: 'vijay.deecodes@gmail.com', // Replace with customer’s email
        amount: 10000, // Amount in kobo (10000 kobo = 100 Naira)
        currency: 'GHS', // Currency code
        onClose: () => {
            alert('Transaction was not completed, you can close this window.');
        },
        callback: (response) => {
            // Make a post request to your server to verify payment
            console.log(response); // Log response for debugging
 
            // You can call your backend to confirm the transaction here
            // e.g., axios.post('/api/payment/verify', { reference: response.reference });
        },
    });
 
    handler.openIframe();
};
 
  return (
<div className="container">

 
 
      <div className="row justify-content-center text-align-center align-items-center vh-100">
<div className="col-md-5">
<i
            className="bi bi-arrow-left"
            style={{ cursor: 'pointer', marginRight: '30px', marginBottom: '10px', fontSize: '20px' }}
            onClick={() => navigate(-1)} // Back navigation
            aria-label="Go back"
></i>
<h4 className="text-center mb-4">Payment</h4>
<img 
                        src={`${process.env.PUBLIC_URL}/airtel.png`} 
                        alt="Payment Method" 
                        id='payicon'
                        style={{ display: 'block', margin: '0 auto' }} 
                    />
<h2 className="text-center mt-4"><span>₹</span>{plan.new_price}</h2>
 
          <div className='card mt-5'>
<div className='card-body'>
<h5 className="">Plan</h5>
<p id='plantext'>Data: {plan.data} GB/Day</p>
<p id='plantext'>Calls: {plan.cells} Calls</p>
<p id='plantext' className='mb-2'>Validity: {plan.validity} Days</p>
</div>
</div>
 
          <div className='card mt-3'>
<div className='card-body'>
<h5 className="">Extra Benefits</h5>
<p id='plantext' className='mb-2'>{plan.extra_features}</p>
</div>
</div>
<button className="btn btn-primary btn-block mt-4 mb-4 w-100" onClick={handlePayment}>Pay Now</button>
 
        </div>
</div>
</div>
  );
};
 
export default PlanDetail;