import React from 'react';
import { Gift, Smartphone, CreditCard, Clock, Zap, Check, Mail, Globe, Home } from 'lucide-react';
import { Link } from "react-router-dom";

const Services = () => {
  return (
    <div className="position-relative min-vh-100">
      {/* Back to Home Button - Fixed Position */}
      <div className="position-fixed top-0 start-0 m-3 z-3">
        <Link to="/" className="text-decoration-none">
          <button 
            className="btn btn-light d-flex align-items-center gap-2 shadow-sm"
            style={{ transition: 'all 0.3s ease' }}
          >
            <Home className="w-4 h-4" />
            <span className="d-none d-sm-inline">Back to Home</span>
          </button>
        </Link>
      </div>

      <div className="container py-5">
        {/* Header Section */}
        <div className="row mb-5 text-center">
          <div className="col-12">
            <h1 className="display-4 fw-bold mb-4">Our Services</h1>
            <p className="lead text-secondary mb-4">
              Mobile Recharge with Exclusive Offers - Stay connected effortlessly with our 
              quick, secure, and value-packed mobile recharge services. Whether you're on prepaid 
              or postpaid plans, we bring you the best recharge deals with exclusive discounts, 
              cashback, and special offers to maximize your savings.
            </p>
          </div>
        </div>

        {/* Why Choose Our Recharge Services Section */}
        <div className="row mb-5">
          <div className="col-12">
            <h2 className="text-center mb-4">Why Choose Our Recharge Services?</h2>
          </div>
          
          <div className="col-md-4 mb-4">
            <div className="card h-100 shadow-sm hover:shadow-lg transition-shadow duration-300">
              <div className="card-body text-center">
                <div className="mb-4">
                  <Zap className="text-primary" size={48} />
                </div>
                <h3 className="h4 mb-3">Instant Recharge</h3>
                <p className="text-secondary">
                  Quick and hassle-free mobile top-ups anytime, anywhere. Supporting all major operators 
                  including Airtel, Jio, Vi, BSNL, and more.
                </p>
              </div>
            </div>
          </div>

          <div className="col-md-4 mb-4">
            <div className="card h-100 shadow-sm hover:shadow-lg transition-shadow duration-300">
              <div className="card-body text-center">
                <div className="mb-4">
                  <Gift className="text-primary" size={48} />
                </div>
                <h3 className="h4 mb-3">Best Discounts & Cashback</h3>
                <p className="text-secondary">
                  Save more with our exclusive recharge offers. Get amazing discounts and 
                  cashback rewards on every recharge.
                </p>
              </div>
            </div>
          </div>

          <div className="col-md-4 mb-4">
            <div className="card h-100 shadow-sm hover:shadow-lg transition-shadow duration-300">
              <div className="card-body text-center">
                <div className="mb-4">
                  <CreditCard className="text-primary" size={48} />
                </div>
                <h3 className="h4 mb-3">Multiple Payment Options</h3>
                <p className="text-secondary">
                  Pay securely via UPI, debit/credit cards, and wallets. Experience safe and 
                  convenient transactions every time.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Exclusive Offers Section */}
        <div className="row mb-5">
          <div className="col-12">
            <h2 className="text-center mb-4">Exclusive Offers & Discounts</h2>
          </div>
          
          <div className="col-md-6 col-lg-3 mb-4">
            <div className="d-flex align-items-center">
              <Check className="text-success me-3" size={24} />
              <div>
                <h4 className="h5 mb-2">First Recharge Bonus</h4>
                <p className="text-secondary mb-0">
                  Get up to 20% off on your first mobile recharge
                </p>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-3 mb-4">
            <div className="d-flex align-items-center">
              <Check className="text-success me-3" size={24} />
              <div>
                <h4 className="h5 mb-2">Cashback Rewards</h4>
                <p className="text-secondary mb-0">
                  Enjoy up to ₹100 cashback on select recharges
                </p>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-3 mb-4">
            <div className="d-flex align-items-center">
              <Check className="text-success me-3" size={24} />
              <div>
                <h4 className="h5 mb-2">Special Weekend Offers</h4>
                <p className="text-secondary mb-0">
                  Recharge on weekends and get extra benefits
                </p>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-3 mb-4">
            <div className="d-flex align-items-center">
              <Check className="text-success me-3" size={24} />
              <div>
                <h4 className="h5 mb-2">Monthly Subscription Deals</h4>
                <p className="text-secondary mb-0">
                  Subscribe to monthly recharges and save up to 15%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="row mb-5">
          <div className="col-12">
            <h2 className="text-center mb-4">How It Works?</h2>
            <div className="row justify-content-center">
              <div className="col-md-8">
                <div className="d-flex flex-column gap-4">
                  <div className="d-flex align-items-center">
                    <div className="bg-primary text-white rounded-circle p-3 me-3">1</div>
                    <div>
                      <h5>Select Your Operator & Plan</h5>
                      <p className="text-secondary mb-0">Choose from a variety of prepaid and postpaid plans</p>
                    </div>
                  </div>
                  <div className="d-flex align-items-center">
                    <div className="bg-primary text-white rounded-circle p-3 me-3">2</div>
                    <div>
                      <h5>Apply Discount Code</h5>
                      <p className="text-secondary mb-0">Use exclusive promo codes for additional savings</p>
                    </div>
                  </div>
                  <div className="d-flex align-items-center">
                    <div className="bg-primary text-white rounded-circle p-3 me-3">3</div>
                    <div>
                      <h5>Make Secure Payment</h5>
                      <p className="text-secondary mb-0">Pay using your preferred method</p>
                    </div>
                  </div>
                  <div className="d-flex align-items-center">
                    <div className="bg-primary text-white rounded-circle p-3 me-3">4</div>
                    <div>
                      <h5>Instant Confirmation</h5>
                      <p className="text-secondary mb-0">Get your mobile recharged within seconds!</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action Section */}
        <div className="row text-center">
          <div className="col-12">
            <div className="p-5 bg-light rounded">
              <h2 className="mb-3">Never Run Out of Talk Time or Data!</h2>
              <p className="text-secondary mb-4">
                Stay connected with our best-in-class recharge services designed to give you 
                more savings and less hassle.
              </p>
              <button className="btn btn-primary btn-lg">
                Recharge Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;