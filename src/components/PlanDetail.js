import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import baseurl from '../Api Service/ApiService';

const PlanDetail = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { plan, homeDataId } = location.state || {};
    const [operatorData, setOperatorData] = useState(null);
    const [planFeatures, setPlanFeatures] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    
    // Updated Merchant UPI details
    const merchantUpiId = "tamilkumaranm143-2@oksbi";
    const merchantName = "Rbtamilan";

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

    useEffect(() => {
        const fetchPlanFeatures = async () => {
            try {
                if (!plan?.pid) return;
                
                const response = await axios.get(`${baseurl}/api/plan-features/plan/${plan.pid}`);
                if (response.data && response.data.data) {
                    setPlanFeatures(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching plan features:', error);
            }
        };

        fetchPlanFeatures();
    }, [plan?.pid]);

    const updatePaymentStatus = async (paymentDetails) => {
        if (!homeDataId) {
            console.error("homeDataId is missing!");
            return;
        }

        try {
            // Create payment record in database
            const paymentData = {
                home_data_id: homeDataId,
                plan_id: plan?.pid,
                plan_name: plan?.plan_name,
                old_price: plan?.old_price,
                amount: plan?.new_price,
                payment_status: paymentDetails.status || 'pending',
                transaction_id: paymentDetails.transaction_id || 'pending',
                payment_method: paymentDetails.method || 'upi',
                currency: 'INR',
                payment_date: new Date().toISOString(),
                user_payment_datetime: new Date().toISOString(),
                customer_email: paymentDetails.email || '',
                customer_contact: paymentDetails.contact || '',
                operator: plan?.operator,
                payment_response: JSON.stringify(paymentDetails)
            };

            // Send payment data to your backend
            // await axios.post(`${baseurl}/api/payments`, paymentData);

            // Update home_data payment status
            await axios.put(`${baseurl}/api/home_data/payment/${homeDataId}`, {
                plan_id: plan?.pid,
                plan_name: plan?.plan_name,
                amount: plan?.new_price,
                old_price: plan?.old_price,
                payment_status: paymentDetails.status || 'pending',
                transaction_id: paymentDetails.transaction_id || 'pending',
            });

        } catch (error) {
            console.error('Error storing payment details:', error);
            setError('Failed to store payment details.');
            throw error;
        }
    };

    const initiateUpiPayment = async () => {
        if (!plan?.new_price) {
            alert("Invalid plan details. Please try again.");
            return;
        }

        try {
            setLoading(true);

            // Create transaction reference
            const txnRef = `UPI_${Date.now()}`;

            // First record the payment attempt in your system
            const paymentInitDetails = {
                status: 'pending',
                transaction_id: txnRef,
                method: 'upi',
                amount: plan.new_price,
                timestamp: new Date().toISOString()
            };

            await updatePaymentStatus(paymentInitDetails);

            // Store transaction reference in localStorage for verification when user returns
            localStorage.setItem('pendingTransaction', txnRef);
            localStorage.setItem('pendingHomeDataId', homeDataId);

            setLoading(false);

            // Navigate to payment page with all necessary data
            navigate('/payment', {
                state: {
                    plan,
                    homeDataId,
                    transactionRef: txnRef,
                    merchantUpiId,
                    merchantName,
                    operatorData
                }
            });

        } catch (error) {
            console.error("Error initiating payment:", error);
            alert("An unexpected error occurred. Please try again.");
            setLoading(false);
        }
    };

    // Handle manual verification after payment
    const verifyPayment = async () => {
        const pendingTransaction = localStorage.getItem('pendingTransaction');
        
        if (pendingTransaction) {
            try {
                setLoading(true);
                
                // Here you would normally check with your backend if payment was received
                // For demo purposes, we'll just update status to success
                
                const paymentDetails = {
                    status: 'pending',
                    transaction_id: pendingTransaction,
                    method: 'upi',
                    timestamp: new Date().toISOString()
                };
                
                await updatePaymentStatus(paymentDetails);
                
                // Clear the pending transaction
                localStorage.removeItem('pendingTransaction');
                localStorage.removeItem('pendingHomeDataId');
                
                // Redirect to success page
                navigate(`/payment-success/${homeDataId}`);
                
            } catch (error) {
                console.error("Error verifying payment:", error);
                alert("Failed to verify payment. Please contact support.");
                setLoading(false);
            }
        } else {
            alert("No pending transaction found.");
        }
    };

    const getImageUrl = (filename) => {
        if (!filename) {
            return '/assets/icons/operator-default.png';
        }
        return `${baseurl}/api/operators/image/${filename}`;
    };

    const buildImageUrl = (imagePath) => {
        if (!imagePath) {
            return '/assets/icons/feature-default.png'; 
        }
        
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }
        
        if (imagePath.includes('/uploads/')) {
            return `${baseurl}${imagePath}`;
        }
        
        if (!imagePath.startsWith('/')) {
            return `${baseurl}/api/features/image/${imagePath}`;
        }
        
        const base = baseurl.endsWith('/') ? baseurl.slice(0, -1) : baseurl;
        const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
        
        return `${base}${path}`;
    };

    const handleImageError = (e, defaultImage) => {
        if (!e.target.src.includes(defaultImage.split('/').pop())) {
            e.target.src = defaultImage;
            e.target.onerror = null;
        }
    };

    // Check if we're returning from a payment
    useEffect(() => {
        const pendingTransaction = localStorage.getItem('pendingTransaction');
        const pendingHomeDataId = localStorage.getItem('pendingHomeDataId');
        
        if (pendingTransaction && pendingHomeDataId && pendingHomeDataId === homeDataId) {
            // Show verification dialog
            const shouldVerify = window.confirm("Did you complete the payment? Click OK to verify payment or Cancel to try again.");
            if (shouldVerify) {
                verifyPayment();
            }
        }
    }, [homeDataId]);

    if (!plan) {
        return <p>No plan details available.</p>;
    }

    if (error) {
        return <p className="text-danger">{error}</p>;
    }

    return (
        <div>
            {/* Header */}
            <div 
                style={{
                    background: 'linear-gradient(135deg, #0D6EFD 0%, #0856D6 100%)',
                    color: 'white',
                    padding: '15px 0',
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 1000,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                }}
            >
                <div className="container">
                    <div className="d-flex align-items-center">
                        <i
                            className="bi bi-arrow-left me-3"
                            style={{
                                cursor: 'pointer',
                                fontSize: '20px',
                            }}
                            onClick={() => navigate(-1)}
                            aria-label="Go back"
                        ></i>
                        <h4 className="mb-0 fw-bold">Rbtamilan Recharge</h4>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container" style={{ paddingTop: '80px', paddingBottom: '20px' }}>
                <div className="row justify-content-center">
                    <div className="col-md-5">
                        <h5 className="text-center mb-4">Payment Details</h5>

                        {operatorData && (
                            <div className="text-center mb-4">
                                <img
                                    src={getImageUrl(operatorData.image)}
                                    alt={operatorData.operator}
                                    style={{ width: '100px', height: 'auto' }}
                                    onError={(e) => {
                                        e.target.src = '/assets/icons/operator-default.png';
                                        e.target.onerror = null;
                                    }}
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

                        <div className="card mt-4">
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
                                {planFeatures.length > 0 ? (
                                    <div>
                                        {planFeatures.map((feature, index) => (
                                            <div key={index} className="d-flex align-items-center mb-2">
                                                {feature.Feature?.image_path && (
                                                    <img 
                                                        src={buildImageUrl(feature.Feature.image_path)} 
                                                        alt={feature.Feature.feature_name || 'Feature'}
                                                        style={{ 
                                                            width: '24px', 
                                                            height: '24px', 
                                                            marginRight: '10px',
                                                            objectFit: 'contain'
                                                        }}
                                                        onError={(e) => handleImageError(e, '/assets/icons/feature-default.png')}
                                                    />
                                                )}
                                                <span style={{fontSize: '16px'}}>{feature.Feature?.feature_name || 'Additional Feature'}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="mb-2">{plan.extra_features || 'No additional features'}</p>
                                )}
                            </div>
                        </div>

                        {/* Pay Now Button */}
                        <div className="mt-4">
                            <button
                                className="btn btn-primary btn-block w-100 py-2"
                                onClick={initiateUpiPayment}
                                disabled={loading}
                                style={{
                                    background: 'linear-gradient(135deg, #0D6EFD 0%, #0856D6 100%)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    fontWeight: 'bold'
                                }}
                            >
                                {loading ? 'Processing...' : 'Pay Now'}
                            </button>
                        </div>
                        
                        {localStorage.getItem('pendingTransaction') && (
                            <button
                                className="btn btn-success btn-block w-100 mt-3 py-2"
                                onClick={verifyPayment}
                                disabled={loading}
                                style={{
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    fontWeight: 'bold'
                                }}
                            >
                                {loading ? 'Verifying...' : 'I have completed payment'}
                            </button>
                        )}
                        
                        <p style={{textAlign: "center"}} className="mt-4">
                            <a href="/contact" style={{ color: '#0D6EFD', textDecoration: 'none' }}>Contact Us</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlanDetail;