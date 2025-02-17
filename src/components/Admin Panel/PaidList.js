import React, { useState, useEffect } from 'react';
import AdminLayout from '../AdminLayout';
import baseurl from '../../Api Service/ApiService';

function PaidList() {
  const [paidList, setPaidList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPaidData = async () => {
      try {
        const response = await fetch(`${baseurl}/api/home_data/paid`);
        if (!response.ok) {
          throw new Error('Failed to fetch paid records');
        }
        const data = await response.json();
        setPaidList(data);
      } catch (error) {
        console.error('Error fetching paid data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPaidData();
    const interval = setInterval(fetchPaidData, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <AdminLayout>
      <div className="container mt-4">
        <div className="card">
          <div className="card-header bg-success text-white">
            <h5 className="mb-0">Paid Users List</h5>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table text-center">
                <thead>
                  <tr>
                    <th>S No</th>
                    <th>Username</th>
                    <th>Phone Number</th>
                    <th>Operator</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Payment Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paidList.length === 0 ? (
                    <tr>
                      <td colSpan="8">No paid users found.</td>
                    </tr>
                  ) : (
                    paidList.map((user, index) => (
                      <tr key={user.id}>
                        <td>{index + 1}</td>
                        <td>{user.username}</td>
                        <td>{user.mobile_number}</td>
                        <td>{user.operator}</td>
                        <td>{user.plan_type}</td>
                        <td>₹{user.amount}</td>
                        <td>{new Date(user.payment_date).toLocaleString()}</td>
                        <td>
                          {user.payment_status}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default PaidList;