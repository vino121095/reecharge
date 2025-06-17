import './App.css';
import React from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './components/Home';
import About from './components/About';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import Login from './components/Admin Panel/Login';
import UserList from './components/Admin Panel/UserList';
import PlanList from './components/Admin Panel/PlanList';
import OperatorList from './components/Admin Panel/OperatorList';
import PlanDetail from './components/PlanDetail';
import AddEmployees from './components/Admin Panel/AddEmployees';
import PaidList from './components/Admin Panel/PaidList';
import ContactUs from './ContactUs';
import PrivacyPolicy from './PrivacyPolicy';
import AboutUs from './components/AboutUs';
import Services from './components/Service';
import PaymentSuccess from './components/PaymentSuccess';
import SavingsSuccess from './components/SavingsSuccess';
import AddFeaturesForm from './components/Admin Panel/AddFeaturesForm';
import EmployeesTask from './components/Admin Panel/EmployeesTask';
import RechargeHistory from './components/RechargeHistory';
import Payment from './components/Admin Panel/Payment';
import DeletedHistory from './components/Admin Panel/DeletedHistory';

function App() {
  return (
      <div className="App">
        <div>
          <Routes>
            {/* Frontend */}
            <Route path="/" element={<SignIn />} />
            <Route path="/about" element={<About />} />
            <Route path="/aboutus" element={<AboutUs />} />
            <Route path="/service" element={<Services />} />
            <Route path="/plandetail" element={<PlanDetail />} />
            <Route path="/home" element={<Home />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/recharge-history" element={<RechargeHistory />} />
            <Route path="/savings-success" element={<SavingsSuccess />} />
            {/* Backend */}
            <Route path="/admin" element={<Login />} />
            <Route path="/userlist" element={<UserList />} />
            <Route path="/planlist" element={<PlanList />} />
            <Route path="/operatorlist" element={<OperatorList />} />
            <Route path="/addemployees" element={<AddEmployees />} />
            <Route path="/paidlist" element={<PaidList />} />
            <Route path="/payment-success/:id" element={<PaymentSuccess />} />
            <Route path="/add-new-feature" element={<AddFeaturesForm />} />
            <Route path='/employees-task' element={<EmployeesTask />} />
            <Route path='/payment' element={<Payment />} />
            <Route path='/deleted-history' element={<DeletedHistory />} />
          </Routes>
        </div>
      </div>
  );
}

export default App;