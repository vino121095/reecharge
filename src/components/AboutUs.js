import React from 'react';
import { Gift, Book, Phone, Check, Mail, Globe, Home } from 'lucide-react';
import { Link } from "react-router-dom";

const AboutUs = () => {
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
            <h1 className="display-4 fw-bold mb-4">Who We Are</h1>
            <p className="lead text-secondary mb-4">
              Welcome to Rbtamilan, your one-stop destination for seamless e-commerce, 
              expert consultancy for college students, and exclusive mobile recharge offers. 
              We are a dynamic platform built to serve a diverse audience, ensuring convenience, 
              savings, and expert guidance—all in one place!
            </p>
          </div>
        </div>

        {/* What We Offer Section */}
        <div className="row mb-5">
          <div className="col-12">
            <h2 className="text-center mb-4">What We Offer</h2>
          </div>
          
          <div className="col-md-4 mb-4">
            <div className="card h-100 shadow-sm hover:shadow-lg transition-shadow duration-300">
              <div className="card-body text-center">
                <div className="mb-4">
                  <Gift className="text-primary" size={48} />
                </div>
                <h3 className="h4 mb-3">E-Commerce & WooCommerce Solutions</h3>
                <p className="text-secondary">
                  Shop with confidence! We bring you a wide range of products at unbeatable prices, 
                  powered by WooCommerce for a smooth and secure shopping experience.
                </p>
              </div>
            </div>
          </div>

          <div className="col-md-4 mb-4">
            <div className="card h-100 shadow-sm hover:shadow-lg transition-shadow duration-300">
              <div className="card-body text-center">
                <div className="mb-4">
                  <Book className="text-primary" size={48} />
                </div>
                <h3 className="h4 mb-3">Student Consultancy Services</h3>
                <p className="text-secondary">
                  Navigating college life can be overwhelming. Our expert consultants provide guidance 
                  on course selection, career planning, and study strategies.
                </p>
              </div>
            </div>
          </div>

          <div className="col-md-4 mb-4">
            <div className="card h-100 shadow-sm hover:shadow-lg transition-shadow duration-300">
              <div className="card-body text-center">
                <div className="mb-4">
                  <Phone className="text-primary" size={48} />
                </div>
                <h3 className="h4 mb-3">Mobile Recharge & Exclusive Offers</h3>
                <p className="text-secondary">
                  Stay connected without breaking the bank! We offer fast and easy mobile recharges 
                  with exclusive discounts and cashback offers.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Why Choose Us Section */}
        <div className="row mb-5">
          <div className="col-12">
            <h2 className="text-center mb-4">Why Choose Us?</h2>
          </div>
          
          <div className="col-md-6 col-lg-3 mb-4">
            <div className="d-flex align-items-center">
              <Check className="text-success me-3" size={24} />
              <div>
                <h4 className="h5 mb-2">Reliability</h4>
                <p className="text-secondary mb-0">
                  A trusted platform for shopping, student guidance, and mobile services.
                </p>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-3 mb-4">
            <div className="d-flex align-items-center">
              <Check className="text-success me-3" size={24} />
              <div>
                <h4 className="h5 mb-2">Exclusive Deals</h4>
                <p className="text-secondary mb-0">
                  Special discounts on recharges and e-commerce products.
                </p>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-3 mb-4">
            <div className="d-flex align-items-center">
              <Check className="text-success me-3" size={24} />
              <div>
                <h4 className="h5 mb-2">User-Friendly</h4>
                <p className="text-secondary mb-0">
                  Simple and secure transactions with a seamless interface.
                </p>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-3 mb-4">
            <div className="d-flex align-items-center">
              <Check className="text-success me-3" size={24} />
              <div>
                <h4 className="h5 mb-2">Expert Advice</h4>
                <p className="text-secondary mb-0">
                  Professional consultancy for students to shape their future.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="row text-center">
          <div className="col-12">
            <h2 className="mb-4">Get in Touch</h2>
            <div className="d-flex justify-content-center gap-4 mb-3">
              <a href="mailto:[Your Email]" className="text-decoration-none">
                <Mail className="text-primary" size={24} />
                <span className="ms-2">[Your Email]</span>
              </a>
              <a href="[Your Website URL]" className="text-decoration-none">
                <Globe className="text-primary" size={24} />
                <span className="ms-2">[Your Website]</span>
              </a>
            </div>
            <p className="text-secondary">
              Join us and experience the best of e-commerce, student consultancy, 
              and mobile services—all under one roof!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;