import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import baseurl from '../Api Service/ApiService';

const PaymentSuccess = () => {
    const [paymentData, setPaymentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [file, setFile] = useState(null);
    const [uploadStatus, setUploadStatus] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [screenshotExists, setScreenshotExists] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPaymentData = async () => {
            try {
                const response = await axios.get(`${baseurl}/api/home_data/${id}`);
                setPaymentData(response.data);
                
                // Check if screenshot exists
                if (response.data.screenshot_path) {
                    setScreenshotExists(true);
                    // Set preview URL for existing screenshot
                    setPreviewUrl(`${baseurl}/api/screenshot/${id}`);
                }
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

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            
            // Create a preview URL
            const objectUrl = URL.createObjectURL(selectedFile);
            setPreviewUrl(objectUrl);
            
            // Reset status when new file is selected
            setUploadStatus(null);
            
            // Will be true if a new file is selected, even if one was uploaded before
            setScreenshotExists(false);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) {
            setUploadStatus({
                type: 'danger',
                message: 'Please select a file to upload'
            });
            return;
        }

        // Check file type
        const fileType = file.type;
        if (!fileType.includes('image/')) {
            setUploadStatus({
                type: 'danger',
                message: 'Please upload only image files'
            });
            return;
        }

        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setUploadStatus({
                type: 'danger',
                message: 'File size should not exceed 5MB'
            });
            return;
        }

        setUploading(true);
        
        try {
            const formData = new FormData();
            formData.append('screenshot', file);
            formData.append('paymentId', id);
            
            const response = await axios.post(`${baseurl}/api/upload-screenshot`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            setUploadStatus({
                type: 'success',
                message: 'Screenshot uploaded successfully!'
            });
            
            // Set flag that a screenshot exists
            setScreenshotExists(true);
            
            // Update previewUrl to point to the server
            setPreviewUrl(`${baseurl}/api/screenshot/${id}?t=${new Date().getTime()}`);
            
            // Clear the file input
            setFile(null);
            document.getElementById('screenshotUpload').value = '';
            
        } catch (err) {
            console.error('Error uploading screenshot:', err);
            setUploadStatus({
                type: 'danger',
                message: 'Failed to upload screenshot. Please try again.'
            });
        } finally {
            setUploading(false);
        }
    };

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
                            onClick={() => navigate('/home')}
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

                                <div className="col-12">
                                    <div className="d-flex justify-content-between align-items-center py-2">
                                        <span className="text-muted">Date & Time</span>
                                        <span className="fw-bold">{formatDate(paymentData.payment_date)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Screenshot Upload Card */}
                    <div className="card shadow-sm mt-4">
                        <div className="card-header bg-light">
                            <h5 className="mb-0">Save Your Receipt</h5>
                        </div>
                        <div className="card-body">
                            {uploadStatus && (
                                <div className={`alert alert-${uploadStatus.type} alert-dismissible fade show`} role="alert">
                                    {uploadStatus.message}
                                    <button type="button" className="btn-close" onClick={() => setUploadStatus(null)} aria-label="Close"></button>
                                </div>
                            )}
                            
                            <div className="mb-3">
                                <p className="text-muted mb-3">
                                    {screenshotExists 
                                        ? "You've already uploaded a screenshot. You can view it below or upload a new one."
                                        : "Take a screenshot of this page and upload it for your records"}
                                </p>
                                
                                <form onSubmit={handleUpload}>
                                    <div className="input-group mb-3">
                                        <input 
                                            type="file" 
                                            className="form-control" 
                                            id="screenshotUpload" 
                                            accept="image/*"
                                            onChange={handleFileChange}
                                        />
                                        <button 
                                            className="btn btn-primary" 
                                            type="submit"
                                            disabled={!file || uploading}
                                        >
                                            {uploading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                    Uploading...
                                                </>
                                            ) : (
                                                screenshotExists && !file ? 'Upload New' : 'Upload'
                                            )}
                                        </button>
                                    </div>
                                    
                                    <div className="text-muted small mb-3">
                                        <p className="mb-0">
                                            <i className="bi bi-info-circle me-1"></i>
                                            Only image files are accepted. Maximum file size: 5MB
                                        </p>
                                    </div>
                                    
                                    {/* Image Preview */}
                                    {previewUrl && (
                                        <div className="text-center mt-3">
                                            <p className="fw-bold mb-2">
                                                {screenshotExists && !file ? 'Your Uploaded Receipt' : 'Preview'}
                                            </p>
                                            <div className="border p-2 mb-3">
                                                <img 
                                                    src={previewUrl} 
                                                    alt="Receipt Preview" 
                                                    className="img-fluid" 
                                                    style={{ maxHeight: '300px' }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </form>
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