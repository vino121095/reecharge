import React, { useState, useEffect } from 'react';
import AdminLayout from '../AdminLayout';
 
function PaidList() {
  const [paidList, setPaidList] = useState([]);
 
  useEffect(() => {
    const storedPaidList = JSON.parse(localStorage.getItem('paidList')) || [];
    setPaidList(storedPaidList);
  }, []);
 
  return (
    <AdminLayout>
      <div className="container mt-4">
        <h3>Paid Users List</h3>
        <div className="mt-4">
          <table className="table text-center">
            <thead>
              <tr>
                <th>S No</th>
                <th>Username</th>
                <th>Phone Number</th>
                <th>Operator</th>
                <th>Type</th>
                <th>Date & Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {paidList.length === 0 ? (
                <tr>
                  <td colSpan="7">No paid users found.</td>
                </tr>
              ) : (
                paidList.map((user, index) => (
                  <tr key={user.id}>
                    <td>{index + 1}</td>
                    <td>{user.username}</td>
                    <td>{user.mobile_number}</td>
                    <td>{user.operator}</td>
                    <td>{user.type}</td>
                    <td>{new Date(user.createdAt).toLocaleString()}</td>
                    <td>{user.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
 
export default PaidList;