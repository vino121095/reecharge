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
                payment_status: paymentDetails.status,
                transaction_id: paymentDetails.razorpay_payment_id,
                payment_method: paymentDetails.method || 'razorpay',
                currency: 'INR',
                payment_date: new Date().toISOString(),
                customer_email: paymentDetails.email,
                customer_contact: paymentDetails.contact,
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
                payment_status: paymentDetails.status,
                transaction_id: paymentDetails.razorpay_payment_id
            });

        } catch (error) {
            console.error('Error storing payment details:', error);
            setError('Failed to store payment details.');
            throw error; // Rethrow to handle in calling function
        }
    };

    const handlePayment = async () => {
        if (!plan?.new_price) {
            console.error("Plan details are missing!");
            alert("Invalid plan details. Please try again.");
            return;
        }

        try {
            setLoading(true);

            // Load Razorpay script dynamically
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            document.body.appendChild(script);

            script.onload = () => {
                const options = {
                    key: 'rzp_test_a60jtifB0U4uQy',
                    amount: plan.new_price * 100,
                    currency: 'INR',
                    name: 'Your Company Name',
                    description: `Payment for ${plan.plan_name}`,
                    handler: async function (response) {
                        try {
                            console.log("Payment Response:", response);
                            if (response.razorpay_payment_id) {
                                // Prepare payment details
                                const paymentDetails = {
                                    status: 'pending',
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_order_id: response.razorpay_order_id,
                                    razorpay_signature: response.razorpay_signature,
                                    method: 'razorpay',
                                    email: options.prefill.email,
                                    contact: options.prefill.contact,
                                    amount: plan.new_price,
                                    timestamp: new Date().toISOString()
                                };

                                // Store payment details
                                await updatePaymentStatus(paymentDetails);
                                navigate(`/payment-success/${homeDataId}`);
                            } else {
                                const failedPaymentDetails = {
                                    status: 'failed',
                                    razorpay_payment_id: null,
                                    error_description: 'Payment verification failed',
                                    email: options.prefill.email,
                                    contact: options.prefill.contact,
                                    timestamp: new Date().toISOString()
                                };
                                await updatePaymentStatus(failedPaymentDetails);
                                alert('Payment verification failed!');
                            }
                        } catch (error) {
                            console.error("Error processing payment:", error);
                            alert("Something went wrong. Please contact support.");
                        } finally {
                            setLoading(false);
                        }
                    },
                    prefill: {
                        email: 'customer@example.com',
                        contact: ''
                    },
                    theme: {
                        color: '#3399cc'
                    },
                    modal: {
                        ondismiss: async function () {
                            try {
                                const cancelledPaymentDetails = {
                                    status: 'cancelled',
                                    razorpay_payment_id: null,
                                    error_description: 'Payment cancelled by user',
                                    email: options.prefill.email,
                                    contact: options.prefill.contact,
                                    timestamp: new Date().toISOString()
                                };
                                await updatePaymentStatus(cancelledPaymentDetails);
                            } catch (error) {
                                console.error("Error updating cancelled payment:", error);
                            } finally {
                                setLoading(false);
                                alert('Payment cancelled');
                            }
                        }
                    }
                };

                const razorpayInstance = new window.Razorpay(options);
                razorpayInstance.open();
            };

            script.onerror = () => {
                setLoading(false);
                alert('Failed to load payment gateway. Please try again.');
            };

        } catch (error) {
            console.error("Error initializing payment:", error);
            alert("An unexpected error occurred. Please try again.");
            setLoading(false);
        }
    };

    // Fixed buildImageUrl function to correctly handle feature images
    const buildImageUrl = (imagePath) => {
        // If no path provided, return default image
        if (!imagePath) {
            return '/assets/icons/feature-default.png';
        }
        
        // If path already starts with http or https, return as is
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }
        
        // If the path includes `/uploads/`, it's already a full path
        if (imagePath.includes('/uploads/')) {
            return `${baseurl}${imagePath}`;
        }
        
        // Handle the case where only filename is provided (from the feature response)
        // This is the key fix for feature images
        if (!imagePath.startsWith('/')) {
            return `${baseurl}/api/features/image/${imagePath}`;
        }
        
        // For other API endpoint paths
        const base = baseurl.endsWith('/') ? baseurl.slice(0, -1) : baseurl;
        const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
        
        return `${base}${path}`;
    };

    // Fix for image error handling
    const handleImageError = (e, defaultImage) => {
        if (!e.target.src.includes(defaultImage.split('/').pop())) {
            e.target.src = defaultImage;
            e.target.onerror = null; // Prevent further error handling if default image fails
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
                                src={buildImageUrl(`/api/operators/image/${operatorData.oid}`)}
                                alt={operatorData.operator}
                                style={{ width: '100px', height: 'auto' }}
                                onError={(e) => handleImageError(e, '/assets/icons/operator-default.png')}
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