import './App.css';
import React from 'react';
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

function App() {
  return (
      <div className="App">
        <div>
          <Routes>
            {/* Frontend */}
            {/* <Route path="/" element={<SignIn />} /> */}

            <Route path="/about" element={<About />} />
            <Route path="/plandetail" element={<PlanDetail />} />
            <Route path="/" element={<Home />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            {/* <Route path="/signup" element={<SignUp />} /> */}

            {/* Backend */}
            <Route path="/admin" element={<Login />} />
            <Route path="/userlist" element={<UserList />} />
            <Route path="/planlist" element={<PlanList />} />
            <Route path="/operatorlist" element={<OperatorList />} />
            <Route path="/addemployees" element={<AddEmployees />} />
            <Route path="/paidlist" element={<PaidList />} />
          </Routes>
        </div>
      </div>
  );
}

export default App;