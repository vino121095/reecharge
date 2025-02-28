import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import AdminLayout from '../AdminLayout';
import baseurl from '../../Api Service/ApiService';

// Feature Form Component
const FeatureUploadForm = () => {
  const [featureName, setFeatureName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [features, setFeatures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all features when component mounts
  useEffect(() => {
    fetchFeatures();
    // Don't add fetchFeatures as a dependency to avoid infinite loop
  }, []);

  // Function to fetch all features from the API
  const fetchFeatures = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${baseurl}/api/features`);
      if (response.data.success) {
        setFeatures(response.data.data);
      } else {
        setError('Failed to fetch features');
      }
    } catch (error) {
      console.error('Error fetching features:', error);
      setError(`Error: ${error.response?.data?.error || 'Failed to fetch features'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeatureNameChange = (e) => {
    setFeatureName(e.target.value);
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate inputs
    if (!featureName.trim()) {
      setMessage('Please enter a feature name');
      return;
    }
    
    if (!selectedFile) {
      setMessage('Please select an image file');
      return;
    }
    
    setIsUploading(true);
    setMessage('');
    
    // Create form data to send to server
    const formData = new FormData();
    formData.append('feature_name', featureName);
    formData.append('image', selectedFile);
    
    try {
      const response = await axios.post(`${baseurl}/api/features`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setMessage('Feature uploaded successfully!');
      setFeatureName('');
      setSelectedFile(null);
      // Reset file input
      document.getElementById('formFile').value = '';
      
      // Refresh the features list after successful upload
      fetchFeatures();

    } catch (error) {
      console.error('Error:', error);
      setMessage(`Error: ${error.response?.data?.error || 'Failed to upload feature'}`);
    } finally {
      setIsUploading(false);
    }
  };
  
  // Fix for Image URL
  const getImageUrl = (featureId) => {
    return `${baseurl}/api/features/image/${featureId}`;
  };
  
  return (
    <AdminLayout>
      <div className="container mt-4">
        <div className="row">
          <div className="col-md-6">
            <div className="card">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">Add New Feature</h5>
              </div>
              <div className="card-body">
                {message && (
                  <div className={`alert ${message.includes('Error') ? 'alert-danger' : 'alert-success'}`}>
                    {message}
                  </div>
                )}
                
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="featureName" className="form-label">Feature Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="featureName"
                      placeholder="Enter feature name"
                      value={featureName}
                      onChange={handleFeatureNameChange}
                      maxLength={100} // Based on varchar(100) in schema
                      required
                    />
                    <div className="form-text">Maximum 100 characters</div>
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="formFile" className="form-label">Upload Image</label>
                    <input
                      className="form-control"
                      type="file"
                      id="formFile"
                      accept="image/*"
                      onChange={handleFileChange}
                      required
                    />
                    <div className="form-text">Select an image file (JPG, PNG, etc.)</div>
                  </div>
                  
                  <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Uploading...
                        </>
                      ) : (
                        'Upload Feature'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
            
            {/* Preview section if a file is selected */}
            {selectedFile && (
              <div className="card mt-3">
                <div className="card-header bg-light">
                  <h6 className="mb-0">Image Preview</h6>
                </div>
                <div className="card-body text-center">
                  <img
                    src={URL.createObjectURL(selectedFile)}
                    className="img-fluid"
                    style={{ maxHeight: '200px' }}
                    alt="Preview"
                  />
                  <div className="mt-2">
                    <small className="text-muted">
                      {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                    </small>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Features Table */}
          <div className="col-md-6">
            <div className="card">
              <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Features List</h5>
                <button 
                  className="btn btn-sm btn-light" 
                  onClick={fetchFeatures}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  ) : (
                    <i className="bi bi-arrow-clockwise"></i>
                  )} Refresh
                </button>
              </div>
              <div className="card-body">
                {error && (
                  <div className="alert alert-danger">
                    {error}
                  </div>
                )}
                
                {isLoading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading features...</p>
                  </div>
                ) : features.length === 0 ? (
                  <div className="alert alert-info">
                    No features found. Add your first feature using the form.
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover table-striped">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Feature Name</th>
                          <th>Image</th>
                        </tr>
                      </thead>
                      <tbody>
                        {features.map((feature) => (
                          <tr key={feature.f_id}>
                            <td>{feature.f_id}</td>
                            <td>{feature.feature_name}</td>
                            <td>
                              <img 
                                src={getImageUrl(feature.image_path)}
                                alt={feature.feature_name}
                                className="img-thumbnail"
                                style={{ width: '80px', height: '60px', objectFit: 'cover' }}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'https://via.placeholder.com/80x60?text=No+Image';
                                }}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div className="card-footer text-muted">
                Total Features: {features.length}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default FeatureUploadForm;