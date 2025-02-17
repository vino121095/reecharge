import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import baseurl from '../Api Service/ApiService';

const PlanDetail = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { plan, homeDataId } = location.state || {};
    const [operatorData, setOperatorData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchOperatorData = async () => {
            try {
                if (!plan?.operator) return;

                const response = await axios.get(`${baseurl}/api/operators`);
                const selectedOperator = response.data.find(
                    op => op.operator.toLowerCase() === plan.operator.toLowerCase()
                );

                if (selectedOperator) {
                    setOperatorData(selectedOperator);
                } else {
                    setError('Operator not found.');
                }
            } catch (error) {
                setError('Error fetching operator data.');
                console.error('Error fetching operators:', error);
            }
        };

        fetchOperatorData();
    }, [plan?.operator]);

    // ✅ Ensured function is defined before calling inside handlePayment
    const updatePaymentStatus = async (status, transactionId = null) => {
        if (!homeDataId) {
            console.error("homeDataId is missing!");
            return;
        }

        try {
            await axios.put(`${baseurl}/api/home_data/payment/${homeDataId}`, {
                plan_id: plan?.pid,
                plan_name: plan?.plan_name,
                amount: plan?.new_price,
                payment_status: status,
                transaction_id: transactionId
            });
        } catch (error) {
            console.error('Error updating payment status:', error);
            setError('Failed to update payment status.');
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = () => {
      if (!plan?.new_price) {
          console.error("Plan details are missing!");
          alert("Invalid plan details. Please try again.");
          return;
      }
  
      try {
          setLoading(true);
          const paystackPublicKey = 'pk_test_7fdd906bb13e7ac7c22ddead913085145672d515';
  
          const paystackHandler = window.PaystackPop.setup({
              key: paystackPublicKey,
              email: 'vijay.deecodes@gmail.com',
              amount: plan.new_price * 100, // Convert to kobo
              currency: 'GHS',
              onClose: () => {
                  setLoading(false);
                  alert('Transaction was not completed, window closed.');
                  updatePaymentStatus('failed');
              },
              callback: (response) => {
                  try {
                      console.log("Payment Response:", response);
                      if (response && response.status === "success") {
                         updatePaymentStatus('pending', response.reference);
                          navigate('/');
                      } else {
                          alert('Payment verification failed!');
                          updatePaymentStatus('failed');
                      }
                  } catch (error) {
                      console.error("Error updating payment status:", error);
                      alert("Something went wrong. Please contact support.");
                  }
              },
          });
  
          paystackHandler.openIframe();
      } catch (error) {
          console.error("Error initializing payment:", error);
          alert("An unexpected error occurred. Please try again.");
          setLoading(false);
      }
  };
  

    if (!plan) {
        return <p>No plan details available.</p>;
    }

    if (error) {
        return <p className="text-danger">{error}</p>;
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
                        onClick={() => navigate(-1)}
                        aria-label="Go back"
                    ></i>
                    <h4 className="text-center mb-4">Payment</h4>

                    {operatorData && (
                        <div className="text-center">
                            <img
                                src={`${baseurl}/${operatorData.image}`}
                                alt={operatorData.operator}
                                style={{ width: '100px', height: 'auto' }}
                            />
                            <h5 className="mt-3">{operatorData.operator}</h5>
                        </div>
                    )}

                    <h2 className="text-center mt-4">
                        <span>₹</span>{plan.new_price}
                    </h2>
                    <p className="text-danger text-decoration-line-through text-center">
                        ₹{plan.old_price}
                    </p>

                    <div className="card mt-5">
                        <div className="card-body">
                            <h5>Plan Details:</h5>
                            <p>Data: {plan.data} GB/Day</p>
                            <p>Calls: {plan.cells} Calls</p>
                            <p className="mb-2">Validity: {plan.validity} Days</p>
                        </div>
                    </div>

                    <div className="card mt-3">
                        <div className="card-body">
                            <h5>Extra Benefits:</h5>
                            <p className="mb-2">{plan.extra_features}</p>
                        </div>
                    </div>

                    <button
                        className="btn btn-primary btn-block mt-4 mb-4 w-100"
                        onClick={handlePayment}
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : 'Pay Now'}
                    </button>
                    
                    <p style={{textAlign: "center"}}>
                        <a href="/contact">Contact Us</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PlanDetail;
