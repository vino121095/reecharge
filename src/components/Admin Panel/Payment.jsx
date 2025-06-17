import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import baseurl from '../../Api Service/ApiService';

const Payment = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { 
        plan, 
        homeDataId, 
        transactionRef, 
        merchantUpiId, 
        merchantName,
        operatorData 
    } = location.state || {};
    
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Updated UPI ID (fallback if not passed from previous component)
    const finalMerchantUpiId = merchantUpiId || "tamilkumaranm143-2@oksbi";
    const finalMerchantName = merchantName || "Rbtamilan";

    useEffect(() => {
        if (plan && transactionRef) {
            generateUpiQrCode();
        }
    }, [plan, transactionRef]);

    // Generate QR code for UPI payment
    const generateUpiQrCode = () => {
        if (!plan?.new_price) return;
        
        const amount = plan.new_price;
        const note = `Payment for ${plan.plan_name}`;
        
        // Generate QR code using UPI intent parameters with updated UPI ID
        const upiUrl = `upi://pay?pa=${encodeURIComponent(finalMerchantUpiId)}&pn=${encodeURIComponent(finalMerchantName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}&tr=${encodeURIComponent(transactionRef)}`;
        
        // Use a QR code generator API
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiUrl)}`;
        setQrCodeUrl(qrUrl);
    };

    // Function to download QR code
    const downloadQRCode = async () => {
        if (!qrCodeUrl) return;
        
        try {
            setLoading(true);
            
            // Fetch the QR code image
            const response = await fetch(qrCodeUrl);
            const blob = await response.blob();
            
            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `payment-qr-${transactionRef}.png`;
            
            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Clean up
            window.URL.revokeObjectURL(url);
            
            setLoading(false);
        } catch (error) {
            console.error('Error downloading QR code:', error);
            alert('Failed to download QR code. Please try again.');
            setLoading(false);
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

    // Function to share QR code
    const shareQRCode = async () => {
        if (!qrCodeUrl) return;
        
        try {
            // Check if Web Share API is supported
            if (navigator.share) {
                // Fetch the QR code image as blob
                const response = await fetch(qrCodeUrl);
                const blob = await response.blob();
                
                // Create a file from the blob
                const file = new File([blob], `payment-qr-${transactionRef}.png`, { type: 'image/png' });
                
                // Share using native share dialog
                await navigator.share({
                    title: 'Payment QR Code',
                    text: `Pay ₹${plan.new_price} to ${finalMerchantName} using this QR code. Reference: ${transactionRef}`,
                    files: [file]
                });
            } else {
                // Fallback: Copy link to clipboard
                await navigator.clipboard.writeText(qrCodeUrl);
                alert('QR code link copied to clipboard! You can share it manually.');
            }
        } catch (error) {
            console.error('Error sharing QR code:', error);
            // Additional fallback: try to copy just the UPI URL
            try {
                const upiUrl = `upi://pay?pa=${encodeURIComponent(finalMerchantUpiId)}&pn=${encodeURIComponent(finalMerchantName)}&am=${plan.new_price}&cu=INR&tn=${encodeURIComponent(`Payment for ${plan.plan_name}`)}&tr=${encodeURIComponent(transactionRef)}`;
                await navigator.clipboard.writeText(upiUrl);
                alert('Payment link copied to clipboard! You can share it in any app.');
            } catch (clipboardError) {
                alert('Sharing not supported on this device. You can take a screenshot and share manually.');
            }
        }
    };

    const updatePaymentStatus = async (paymentDetails) => {
        if (!homeDataId) {
            console.error("homeDataId is missing!");
            return;
        }

        try {
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

    // Handle manual verification after payment
    const verifyPayment = async () => {
        const pendingTransaction = localStorage.getItem('pendingTransaction');
        
        if (pendingTransaction) {
            try {
                setLoading(true);
                
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

    if (!plan || !transactionRef) {
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

                <div className="container" style={{ paddingTop: '80px' }}>
                    <div className="row justify-content-center align-items-center vh-100">
                        <div className="col-md-5 text-center">
                            <p className="text-danger">Payment details not found. Please try again.</p>
                            <button 
                                className="btn btn-primary" 
                                onClick={() => navigate(-1)}
                            >
                                Go Back
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
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
                <div className="row justify-content-center min-vh-100 py-4">
                    <div className="col-md-6 col-lg-5">
                        {/* Page Title */}
                        <h5 className="text-center mb-4">Make Payment</h5>

                        {/* Operator and Plan Summary */}
                        {operatorData && (
                            <div className="text-center mb-4">
                                <img
                                    src={getImageUrl(operatorData.image)}
                                    alt={operatorData.operator}
                                    style={{ width: '80px', height: 'auto' }}
                                    onError={(e) => {
                                        e.target.src = '/assets/icons/operator-default.png';
                                        e.target.onerror = null;
                                    }}
                                />
                                <h5 className="mt-2 mb-1">{operatorData.operator}</h5>
                                <p className="text-muted">{plan.plan_name}</p>
                            </div>
                        )}

                        {/* Amount */}
                        <div className="text-center mb-4">
                            <h2 className="text-primary mb-1">₹{plan.new_price}</h2>
                            <p className="text-danger text-decoration-line-through mb-0">₹{plan.old_price}</p>
                        </div>

                        {/* Payment Methods Card */}
                        <div className="card shadow-sm">
                            <div className="card-body">
                                <h5 className="text-center mb-4">Choose Payment Method</h5>
                                
                                {/* QR Code Section */}
                                <div className="text-center mb-4">
                                    <p className="fw-bold mb-3">Scan QR Code to Pay</p>
                                    {qrCodeUrl && (
                                        <div className="d-flex justify-content-center mb-3">
                                            <div className="border rounded p-3 bg-white">
                                                <img 
                                                    src={qrCodeUrl} 
                                                    alt="UPI QR Code" 
                                                    style={{width: "250px", height: "250px"}}
                                                />
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* QR Code Action Buttons */}
                                    <div className="d-flex justify-content-center gap-2 mb-3">
                                        <button 
                                            className="btn btn-outline-primary btn-sm" 
                                            onClick={shareQRCode}
                                            disabled={!qrCodeUrl}
                                        >
                                            <i className="bi bi-share me-1"></i> Share QR
                                        </button>
                                        <button 
                                            className="btn btn-outline-success btn-sm" 
                                            onClick={downloadQRCode}
                                            disabled={loading || !qrCodeUrl}
                                        >
                                            <i className="bi bi-download me-1"></i> 
                                            {loading ? 'Downloading...' : 'Download QR'}
                                        </button>
                                    </div>
                                    
                                    {/* Payment Completed Button */}
                                    <div className="d-grid mb-3">
                                        <button
                                            className="btn btn-success btn-lg py-3"
                                            onClick={verifyPayment}
                                            disabled={loading}
                                            style={{
                                                borderRadius: '8px',
                                                fontSize: '16px',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            <i className="bi bi-check-circle me-2"></i>
                                            {loading ? 'Verifying...' : 'Payment Completed'}
                                        </button>
                                    </div>
                                    
                                    <p className="text-muted small">
                                        Scan this QR code with any UPI app to pay
                                    </p>
                                </div>

                                <div className="text-center">
                                    <div className="d-flex align-items-center mb-3">
                                        <hr className="flex-grow-1" />
                                        <span className="px-3 text-muted small">OR</span>
                                        <hr className="flex-grow-1" />
                                    </div>
                                </div>
                                
                                {/* UPI ID Section */}
                                <div className="mb-4">
                                    <p className="fw-bold text-center mb-3">Pay using UPI ID</p>
                                    <div className="input-group mb-3">
                                        <input 
                                            type="text" 
                                            value={finalMerchantUpiId} 
                                            className="form-control text-center" 
                                            readOnly 
                                        />
                                        <button 
                                            className="btn btn-outline-primary" 
                                            onClick={() => copyToClipboard(finalMerchantUpiId)}
                                        >
                                            <i className="bi bi-clipboard"></i>
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Payment Details */}
                                <div className="bg-light rounded p-3 mb-4">
                                    <div className="row text-center">
                                        <div className="col-6">
                                            <p className="fw-bold mb-1">Amount</p>
                                            <p className="mb-0 text-primary">₹{plan.new_price}</p>
                                        </div>
                                        <div className="col-6">
                                            <p className="fw-bold mb-1">Reference</p>
                                            <p className="mb-0 small">{transactionRef}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Instructions */}
                                <div className="mb-4">
                                    <p className="fw-bold mb-2">Payment Instructions:</p>
                                    <ol className="small text-muted">
                                        <li>Open your UPI app (Google Pay, PhonePe, BHIM, etc.)</li>
                                        <li>Scan the QR code above OR enter UPI ID manually</li>
                                        <li>Enter amount: <span className="fw-bold text-dark">₹{plan.new_price}</span></li>
                                        <li>In remarks, enter: <span className="fw-bold text-dark">{transactionRef}</span></li>
                                        <li>Complete the payment</li>
                                        <li>Click "Payment Completed" button below</li>
                                    </ol>
                                </div>
                            </div>
                        </div>
                        
                        {/* Support Link */}
                        <p className="text-center mt-4">
                            <a href="/contact" className="text-muted" style={{ textDecoration: 'none' }}>
                                <i className="bi bi-headset me-1"></i>
                                Need Help? Contact Support
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payment;