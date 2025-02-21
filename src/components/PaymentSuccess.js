import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import baseurl from '../Api Service/ApiService';

const PaymentSuccess = () => {
    const [paymentData, setPaymentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPaymentData = async () => {
            try {
                const response = await axios.get(`${baseurl}/api/home_data/${id}`);
                setPaymentData(response.data);
            } catch (err) {
                setError('Failed to fetch payment details');
                console.error('Error fetching payment details:', err);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchPaymentData();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="min-vh-100 d-flex justify-content-center align-items-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container min-vh-100 d-flex justify-content-center align-items-center">
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            </div>
        );
    }

    if (!paymentData) {
        return (
            <div className="container min-vh-100 d-flex justify-content-center align-items-center">
                <div className="alert alert-warning" role="alert">
                    No payment data found
                </div>
            </div>
        );
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatMobile = (number) => {
        return number.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
    };

    return (
        <div className="container py-5">
          
            <div className="row justify-content-center">
                <div className="col-12 col-md-8 col-lg-6">
                <div className="d-grid gap-2 mt-4">
                        <button 
                            className="btn btn-primary w-25"
                            onClick={() => navigate('/')}
                        >
                            <i className="bi-arrow-left me-2"></i>
                            Back
                        </button>
                    </div>
                    {/* Success Header */}
                    <div className="text-center mb-4">
                        <div className="display-1 text-success mb-3">
                            <i className="bi bi-check-circle-fill"></i>
                        </div>
                        <h1 className="h3 mb-3">Recharge Successful!</h1>
                        <p className="text-muted">Your mobile recharge has been completed successfully</p>
                    </div>

                    {/* Recharge Details Card */}
                    <div className="card shadow-sm">
                        <div className="card-header bg-light">
                            <h5 className="mb-0">Recharge Details</h5>
                        </div>
                        <div className="card-body">
                            <div className="row g-3">
                                <div className="col-12">
                                    <div className="d-flex justify-content-between align-items-center py-2">
                                        <span className="text-muted">Customer Name</span>
                                        <span className="fw-bold">{paymentData.username}</span>
                                    </div>
                                </div>

                                <div className="col-12">
                                    <div className="d-flex justify-content-between align-items-center py-2">
                                        <span className="text-muted">Mobile Number</span>
                                        <span className="fw-bold">{formatMobile(paymentData.mobile_number)}</span>
                                    </div>
                                </div>

                                <div className="col-12">
                                    <div className="d-flex justify-content-between align-items-center py-2">
                                        <span className="text-muted">Operator</span>
                                        <span className="fw-bold">{paymentData.operator}</span>
                                    </div>
                                </div>

                                <div className="col-12">
                                    <div className="d-flex justify-content-between align-items-center py-2">
                                        <span className="text-muted">Plan Type</span>
                                        <span className="fw-bold text-capitalize">{paymentData.plan_type}</span>
                                    </div>
                                </div>

                                <div className="col-12">
                                    <div className="d-flex justify-content-between align-items-center py-2">
                                        <span className="text-muted">Amount</span>
                                        <span className="fw-bold">₹{paymentData.amount}</span>
                                    </div>
                                </div>

                                {/* <div className="col-12">
                                    <div className="d-flex justify-content-between align-items-center py-2">
                                        <span className="text-muted">Status</span>
                                        <span className='fw-bold'>{paymentData.payment_status}</span>
                                    </div>
                                </div> */}

                                <div className="col-12">
                                    <div className="d-flex justify-content-between align-items-center py-2">
                                        <span className="text-muted">Date & Time</span>
                                        <span className="fw-bold">{formatDate(paymentData.payment_date)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Support Section */}
                    <div className="text-center mt-4">
                        <p className="text-muted mb-1">Need help with your recharge?</p>
                        <a href="/contact" className="btn btn-link text-decoration-none">
                            <i className="bi bi-headset me-2"></i>
                            Contact Support
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;