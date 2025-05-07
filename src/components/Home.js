// Home.js
import "bootstrap/dist/css/bootstrap.min.css";
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import baseurl from "../Api Service/ApiService";

const Home = () => {
  const [selectedType, setSelectedType] = useState("prepaid");
  const [userName, setUserName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [operator, setOperator] = useState("");
  const [operatorsList, setOperatorsList] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOperators = async () => {
      try {
        const response = await fetch(`${baseurl}/api/operators`);
        const data = await response.json();
        if (response.ok) {
          setOperatorsList(data);
        } else {
          console.error("Error fetching operators:", data);
        }
      } catch (error) {
        console.error("Fetch Error:", error);
      }
    };

    fetchOperators();

    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 992);
    };

    handleResize(); // Set initial sidebar state
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const planType =
      selectedType.charAt(0).toUpperCase() + selectedType.slice(1);
    const userId = JSON.parse(localStorage.getItem('userId'));
    const data = {
      userId:userId,
      username: userName,
      plan_type: planType,
      mobile_number: mobileNumber,
      payment_status: "pending",
      operator,
    };

    try {
      const response = await fetch(`${baseurl}/api/home_data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Network response was not ok");

      const result = await response.json();
      navigate("/about", {
        state: {
          planType: selectedType,
          operator,
          homeDataId: result.id,
        },
      });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("userId");
    navigate("/");
    if (window.innerWidth < 992) setSidebarOpen(false);
  };

  const goToRechargeHistory = () => {
    navigate("/recharge-history");
    if (window.innerWidth < 992) setSidebarOpen(false);
  };

  const toggleSubmenu = (menu) => {
    setActiveSubmenu(activeSubmenu === menu ? "" : menu);
  };

  return (
    <div className="container-fluid">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary fixed-top">
        <div className="container-fluid">
          <button
            className="navbar-toggler border-0 d-lg-none"
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <a className="navbar-brand" href="#">
            Mobile Recharge
          </a>
        </div>
      </nav>

      {/* Sidebar */}
      <div
        className="sidebar bg-white"
        style={{
          width: "280px",
          height: "100vh",
          position: "fixed",
          left: sidebarOpen || window.innerWidth >= 992 ? "0" : "-280px",
          top: "56px",
          transition: "all 0.3s ease",
          zIndex: 1000,
          paddingTop: "20px",
          borderRight: "1px solid #e0e0e0",
          overflowY: "auto",
          background: "linear-gradient(to bottom, #ffffff, #f8f9fa)",
        }}
      >
        <div className="px-4 pb-4">
          <h5 className="text-muted mb-3" style={{ fontSize: "0.85rem", letterSpacing: "1px" }}>
            MAIN MENU
          </h5>

          <ul className="nav flex-column" style={{ gap: "8px" }}>
            {/* Recharge History */}
            <li className="nav-item">
              <a
                className="nav-link rounded side-bar-link"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  goToRechargeHistory();
                }}
                style={{
                  color: "#000",
                  padding: "12px 15px",
                  backgroundColor:
                    activeSubmenu === "history" ? "#f0f0f0" : "transparent",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#f5f5f5")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    activeSubmenu === "history" ? "#f0f0f0" : "transparent")
                }
              >
                <div className="d-flex align-items-center">
                  <i className="bi bi-clock-history me-3" style={{ fontSize: "1.1rem" }}></i>
                  <span style={{ fontSize: "0.95rem" }}>Recharge History</span>
                </div>
              </a>
            </li>

            {/* Services */}
            <li className="nav-item">
              <a
                className="nav-link rounded side-bar-link"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  toggleSubmenu("services");
                  navigate("/service");
                  if (window.innerWidth < 992) setSidebarOpen(false);
                }}
                style={{
                  color: "#000",
                  padding: "12px 15px",
                  backgroundColor:
                    activeSubmenu === "services" ? "#f0f0f0" : "transparent",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#f5f5f5")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    activeSubmenu === "services" ? "#f0f0f0" : "transparent")
                }
              >
                <div className="d-flex align-items-center">
                  <i className="bi bi-gear me-3" style={{ fontSize: "1.1rem" }}></i>
                  <span style={{ fontSize: "0.95rem" }}>Services</span>
                </div>
              </a>
            </li>

            {/* About Us */}
            <li className="nav-item">
              <Link
                className="nav-link rounded side-bar-link"
                to="/about-us"
                onClick={(e) => {
                  e.preventDefault();
                  toggleSubmenu("about");
                  navigate("/aboutus");
                  if (window.innerWidth < 992) setSidebarOpen(false);
                }}
                style={{
                  color: "#000",
                  padding: "12px 15px",
                  backgroundColor:
                    activeSubmenu === "about" ? "#f0f0f0" : "transparent",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#f5f5f5")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    activeSubmenu === "about" ? "#f0f0f0" : "transparent")
                }
              >
                <div className="d-flex align-items-center">
                  <i className="bi bi-info-circle me-3" style={{ fontSize: "1.1rem" }}></i>
                  <span style={{ fontSize: "0.95rem" }}>About Us</span>
                </div>
              </Link>
            </li>

            {/* Logout */}
            <li className="nav-item mt-3">
              <button
                className="nav-link rounded side-bar-link w-100 text-start"
                onClick={handleLogout}
                style={{
                  color: "#dc3545",
                  padding: "12px 15px",
                  border: "none",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#f5f5f5")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <div className="d-flex align-items-center">
                  <i className="bi bi-box-arrow-right me-3" style={{ fontSize: "1.1rem" }}></i>
                  <span style={{ fontSize: "0.95rem" }}>Logout</span>
                </div>
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Main Content */}
      <div
        className="main-content"
        style={{
          marginTop: "76px",
          padding: "20px",
        }}
      >
        <div className="row justify-content-center">
          <div className="col-md-5">
            <div className="card" id="signcard">
              <div className="card-header text-center">
                <h4>Mobile Recharge</h4>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <div className="d-flex gap-4">
                      <div className="form-check mt-2">
                        <input
                          type="radio"
                          className="form-check-input"
                          id="prepaid"
                          name="mobileType"
                          value="prepaid"
                          checked={selectedType === "prepaid"}
                          onChange={(e) => setSelectedType(e.target.value)}
                        />
                        <label className="form-check-label" htmlFor="prepaid">
                          Prepaid
                        </label>
                      </div>
                      <div className="form-check mt-2">
                        <input
                          type="radio"
                          className="form-check-input"
                          id="postpaid"
                          name="mobileType"
                          value="postpaid"
                          checked={selectedType === "postpaid"}
                          onChange={(e) => setSelectedType(e.target.value)}
                        />
                        <label className="form-check-label" htmlFor="postpaid">
                          Postpaid
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="form-group mt-4">
                    <label htmlFor="name">Name</label>
                    <input
                      type="text"
                      className="form-control mt-2"
                      id="name"
                      placeholder="Enter Your Name"
                      required
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                    />
                  </div>

                  <div className="form-group mt-4">
                    <label htmlFor="mobile-number">Mobile Number</label>
                    <input
                      type="tel"
                      className="form-control mt-2"
                      id="mobile-number"
                      placeholder="Enter mobile number"
                      required
                      value={mobileNumber}
                      maxLength={10}
                      pattern="\d{10}"
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, "");
                        if (value.length <= 10) {
                          setMobileNumber(value);
                        }
                      }}
                    />
                  </div>

                  <div className="form-group mt-4">
                    <label htmlFor="operator">Select Operator</label>
                    <select
                      className="form-control mt-2"
                      id="operator"
                      required
                      value={operator}
                      onChange={(e) => setOperator(e.target.value)}
                    >
                      <option value="" disabled>
                        Select operator
                      </option>
                      {operatorsList.map((op, index) => (
                        <option key={index} value={op.operator}>
                          {op.operator}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="d-flex align-items-center mt-3">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="terms"
                      checked={agreedToTerms}
                      onChange={() => setAgreedToTerms(!agreedToTerms)}
                    />
                    <label className="form-check-label ms-2" htmlFor="terms">
                      I agree to the{" "}
                      <a href="https://merchant.razorpay.com/policy/PMdxchTtQAyFBU/terms">
                        Terms and Conditions
                      </a>
                      , <a href="/privacy-policy">Privacy Policy</a> and{" "}
                      <a href="https://merchant.razorpay.com/policy/PMdxchTtQAyFBU/refund">
                        Cancellation and Refund Policy
                      </a>
                      .
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-block mt-4 w-100"
                    disabled={!agreedToTerms}
                  >
                    Proceed
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {sidebarOpen && window.innerWidth < 992 && (
        <div
          className="overlay"
          style={{
            position: "fixed",
            top: "56px",
            left: "0",
            right: "0",
            bottom: "0",
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 999,
          }}
          onClick={() => {
            setSidebarOpen(false);
            setActiveSubmenu("");
          }}
        />
      )}
    </div>
  );
};

export default Home;
