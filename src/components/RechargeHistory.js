import { useState, useEffect, useRef } from 'react';
import { 
  Calendar, Clock, CreditCard, Phone, User, 
  Award, FileText, DollarSign, Tag, CheckCircle, AlertCircle,
  Home, Download, Printer, Search, Filter, ChevronLeft, RefreshCw
} from 'lucide-react';
import axios from 'axios';
import baseurl from '../Api Service/ApiService';
import html2pdf from 'html2pdf.js';

const RechargeHistory = () => {
  const [rechargeHistory, setRechargeHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const pdfRef = useRef(null);
  
  // Get user data from localStorage
  const getUserPhone = () => {
    try {
      const userDataString = localStorage.getItem('userId');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        return userData || null;
      }
      return null;
    } catch (err) {
      console.error('Error parsing userData from localStorage:', err);
      return null;
    }
  };
  
  useEffect(() => {
    fetchRechargeHistory();
  }, []);

  const fetchRechargeHistory = async () => {
    try {
      setLoading(true);
      
      const userId = getUserPhone();
      
      if (!userId) {
        throw new Error('User phone number not found');
      }
      
      // Use the endpoint to fetch recharge history by phone number
      const response = await axios.get(`${baseurl}/api/home_data/user/phone/${userId}`);
      
      if (response.status !== 200) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = response.data;
      setRechargeHistory(Array.isArray(data) ? data : [data]);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch recharge history. Please try again later.');
      setLoading(false);
      console.error('Error fetching recharge history:', err);
    }
  };

  // Format date to a more readable format
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Get status badge class based on payment status
  const getStatusBadgeClass = (status) => {
    return status === 'paid' 
      ? 'bg-success text-white px-2 py-1 rounded-1 d-inline-flex align-items-center'
      : 'bg-warning text-dark px-2 py-1 rounded-1 d-inline-flex align-items-center';
  };

  // Export PDF function
  const exportPDF = () => {
    const element = pdfRef.current;
    const opt = {
      margin: 10,
      filename: 'recharge-history.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };
    
    html2pdf().set(opt).from(element).save();
  };

  // Filter and search recharge history
  const filteredHistory = rechargeHistory.filter(recharge => {
    const matchesSearch = 
      (recharge.username && recharge.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (recharge.mobile_number && recharge.mobile_number.includes(searchTerm)) ||
      (recharge.operator && recharge.operator.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterStatus === 'all' || recharge.payment_status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  // Navigate back to home
  const goToHome = () => {
    window.location.href = '/home';
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '20rem' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <span className="ms-3 text-primary fw-medium">Loading recharge history...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger shadow-sm" role="alert">
        <div className="d-flex">
          <AlertCircle className="me-2" />
          <div>
            <h4 className="alert-heading mb-1">Error Loading Data</h4>
            <p className="mb-2">{error}</p>
            <button 
              className="btn btn-sm btn-outline-danger" 
              onClick={fetchRechargeHistory}
            >
              <RefreshCw size={14} className="me-1" /> Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <button 
            className="btn btn-outline-secondary mb-3" 
            onClick={goToHome}
          >
            <ChevronLeft size={18} className="me-1" /> Back to Home
          </button>
          <h2 className="h4 mb-1">Recharge Transaction History</h2>
          <p className="text-muted mb-0">View and manage your recharge transactions</p>
        </div>
        {/* <div className="d-flex gap-2">
          <button 
            className="btn btn-primary" 
            onClick={exportPDF}
          >
            <Download size={18} className="me-1" /> Export PDF
          </button>
          <button 
            className="btn btn-outline-dark" 
            onClick={() => window.print()}
          >
            <Printer size={18} className="me-1" /> Print
          </button>
        </div> */}
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-header bg-white py-3">
          <div className="row align-items-center">
            <div className="col-md-6 mb-3 mb-md-0">
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <Search size={16} />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search by name, number or operator..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="d-flex justify-content-md-end">
                <div className="me-3">
                  <select 
                    className="form-select"
                    style={{ width: '150px' }}
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="paid">Paid</option>
                    <option value="">Pending</option>
                  </select>
                </div>
                <button 
                  className="btn btn-outline-secondary"
                  onClick={fetchRechargeHistory}
                >
                  <RefreshCw size={16} className="me-1" /> Refresh
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div ref={pdfRef}>
          {rechargeHistory.length === 0 ? (
            <div className="text-center py-5">
              <FileText size={48} className="text-secondary mb-3" />
              <h3 className="h5 text-secondary">No recharge history found</h3>
              <p className="text-muted mt-2">You haven't made any recharges yet.</p>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-5">
              <Search size={48} className="text-secondary mb-3" />
              <h3 className="h5 text-secondary">No matching results</h3>
              <p className="text-muted mt-2">Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover table-striped mb-0">
                <thead className="table-light">
                  <tr>
                    <th>User Name</th>
                    <th>Mobile</th>
                    <th>Operator</th>
                    <th>Plan</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Payment Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map((recharge) => (
                    <tr key={recharge.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <User size={16} className="text-primary me-2" />
                          <span className="fw-medium">{recharge.username || 'N/A'}</span>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <Phone size={16} className="text-primary me-2" />
                          {recharge.mobile_number || 'N/A'}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <Tag size={16} className="text-primary me-2" />
                          <div>
                            <div className="fw-medium">{recharge.operator}</div>
                            <small className="text-muted">{recharge.plan_type}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <Award size={16} className="text-primary me-2" />
                          {recharge.plan_name || 'N/A'}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center fw-bold">
                          {/* <DollarSign size={16} className="text-success me-1" /> */}
                          <span>₹{parseFloat(recharge.amount).toFixed(2)}</span>
                        </div>
                      </td>
                      <td>
                        <div className={getStatusBadgeClass(recharge.payment_status)}>
                          {recharge.payment_status === 'paid' ? (
                            <>
                              <CheckCircle size={14} className="me-1" />
                              <span>Paid</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle size={14} className="me-1" />
                              <span>Pending</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center small">
                          <Calendar size={16} className="text-primary me-1" />
                          {formatDate(recharge.payment_date)}
                        </div>
                        {recharge.user_payment_datetime && (
                          <div className="d-flex align-items-center mt-1 small text-muted">
                            <Clock size={14} className="text-muted me-1" />
                            Initiated: {formatDate(recharge.user_payment_datetime)}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        <div className="card-footer bg-light py-3">
          <div className="row align-items-center">
            <div className="col">
              <small className="text-muted">
                <span className="fw-medium">Total transactions: </span><span className="fw-medium">{rechargeHistory.length}</span>  | 
                <span className="fw-medium ms-2">Displayed:</span><span className="fw-medium"> {filteredHistory.length}</span>
              </small>
            </div>
            <div className="col-auto">
              <p className="mb-0 small text-muted">Last updated: {new Date().toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RechargeHistory;