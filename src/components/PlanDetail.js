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
    const [transactionRef, setTransactionRef] = useState('');
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    
    // Merchant UPI details - replace with your actual details
    const merchantUpiId = "mugeshkumar891999@oksbi";
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

    // Generate QR code for UPI payment
    const generateUpiQrCode = () => {
        if (!plan?.new_price) return null;
        
        const amount = plan.new_price;
        const note = `Payment for ${plan.plan_name}`;
        const txnRef = transactionRef || `UPI_${Date.now()}`;
        
        // Generate QR code using UPI intent parameters
        const upiUrl = `upi://pay?pa=${encodeURIComponent(merchantUpiId)}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}&tr=${encodeURIComponent(txnRef)}`;
        
        // Use a QR code generator API - this example uses QR Server API
        return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUrl)}`;
    };

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
            setTransactionRef(txnRef);

            // Generate QR code URL
            const qrUrl = generateUpiQrCode();
            setQrCodeUrl(qrUrl);

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

    // Function to copy UPI ID to clipboard
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text)
            .then(() => {
                alert("UPI ID copied to clipboard!");
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
                alert("Failed to copy. Please manually select and copy the UPI ID.");
            });
    };

    // Function to open QR code in a new tab
    const openQrCodeInNewTab = () => {
        if (!qrCodeUrl) return;
        
        // Open the QR code in a new tab
        window.open(qrCodeUrl, '_blank');
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

                    {/* UPI Payment Section */}
                    {!qrCodeUrl ? (
                        <div className="mt-4">
                            <button
                                className="btn btn-primary btn-block w-100 py-2"
                                onClick={initiateUpiPayment}
                                disabled={loading}
                            >
                                {loading ? 'Processing...' : 'Pay Now'}
                            </button>
                        </div>
                    ) : (
                        <div className="card mt-4">
                            <div className="card-body">
                                <h5 className="text-center mb-3">Make Payment Using UPI</h5>
                                
                                {/* QR Code Section */}
                                <div className="text-center mb-4">
                                    <p className="fw-bold mb-2">Scan QR Code to Pay</p>
                                    <div className="d-flex justify-content-center">
                                        <img 
                                            src={qrCodeUrl} 
                                            alt="UPI QR Code" 
                                            style={{width: "200px", height: "200px"}}
                                            className="border p-2"
                                        />
                                    </div>
                                    <button 
                                        className="btn btn-sm btn-outline-primary mt-2" 
                                        onClick={openQrCodeInNewTab}
                                    >
                                        <i className="bi bi-box-arrow-up-right me-1"></i> Open QR Code
                                    </button>
                                    <p className="text-muted mt-2 small">
                                        Scan this QR code with any UPI app to pay
                                    </p>
                                </div>
                                
                                <div className="text-center">
                                    <div className="mb-3">
                                        <span className="fw-bold">Or pay using UPI ID:</span> 
                                        <div className="d-flex align-items-center justify-content-center mt-2">
                                            <input 
                                                type="text" 
                                                value={merchantUpiId} 
                                                className="form-control text-center" 
                                                readOnly 
                                                style={{maxWidth: "250px", margin: "0 auto"}}
                                            />
                                            <button 
                                                className="btn btn-sm btn-outline-primary ms-2" 
                                                onClick={() => copyToClipboard(merchantUpiId)}
                                            >
                                                <i className="bi bi-clipboard"></i>
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="mb-3">
                                        <span className="fw-bold">Amount:</span> 
                                        <div className="mt-1">₹{plan.new_price}</div>
                                    </div>
                                    
                                    <div className="mb-3">
                                        <span className="fw-bold">Transaction Reference:</span> 
                                        <div className="mt-1">{transactionRef}</div>
                                    </div>
                                    
                                    <hr />
                                    
                                    <div className="mb-3">
                                        <p className="fw-bold">How to pay:</p>
                                        <ol className="text-start">
                                            <li>Open your UPI app (Google Pay, PhonePe, BHIM, etc.)</li>
                                            <li>Scan the QR code above OR enter UPI ID manually</li>
                                            <li>Enter amount: <span className="fw-bold">₹{plan.new_price}</span></li>
                                            <li>In remarks/description, enter reference: <span className="fw-bold">{transactionRef}</span></li>
                                            <li>Complete the payment</li>
                                            <li>Click "I have completed payment" button below</li>
                                        </ol>
                                    </div>
                                </div>
                                
                                <div className="d-grid gap-2">
                                    <button
                                        className="btn btn-success py-2"
                                        onClick={verifyPayment}
                                        disabled={loading}
                                    >
                                        {loading ? 'Verifying...' : 'I have completed payment'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {localStorage.getItem('pendingTransaction') && !qrCodeUrl && (
                        <button
                            className="btn btn-success btn-block w-100 mt-3 py-2"
                            onClick={verifyPayment}
                            disabled={loading}
                        >
                            {loading ? 'Verifying...' : 'I have completed payment'}
                        </button>
                    )}
                    
                    <p style={{textAlign: "center"}} className="mt-4">
                        <a href="/contact">Contact Us</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PlanDetail;