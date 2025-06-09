import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import baseurl from '../Api Service/ApiService';
 
const About = () => {
    const [categories, setCategories] = useState([]);
    const [plans, setPlans] = useState([]);
    const [groupedPlans, setGroupedPlans] = useState({});
    const [selectedCategory, setSelectedCategory] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [planFeatures, setPlanFeatures] = useState({}); // Store features for each plan
    const navigate = useNavigate();
    const location = useLocation();
 
    const { operator, planType, homeDataId } = location.state || {}; // operator and planType passed from the home page
 
    // Function to build image URL for features
    const buildImageUrl = (imagePath) => {
        if (!imagePath) {
            return '/assets/icons/feature-default.png'; 
        }
        
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }
        
        if (imagePath.includes('/uploads/')) {
            return `${baseurl}${imagePath}`;
        }
        
        if (!imagePath.startsWith('/')) {
            return `${baseurl}/api/features/image/${imagePath}`;
        }
        
        const base = baseurl.endsWith('/') ? baseurl.slice(0, -1) : baseurl;
        const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
        
        return `${base}${path}`;
    };

    // Function to handle image error
    const handleImageError = (e, defaultImage) => {
        if (!e.target.src.includes(defaultImage.split('/').pop())) {
            e.target.src = defaultImage;
            e.target.onerror = null;
        }
    };

    // Fetch plan features for a specific plan
    const fetchPlanFeatures = async (planId) => {
        try {
            const response = await axios.get(`${baseurl}/api/plan-features/plan/${planId}`);
            if (response.data && response.data.data) {
                setPlanFeatures(prev => ({
                    ...prev,
                    [planId]: response.data.data
                }));
            }
        } catch (error) {
            console.error('Error fetching plan features:', error);
        }
    };

    // Fetch categories and plans when the component mounts
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(`${baseurl}/api/add_category`);
                // console.log('Categories:', response.data); // Log the categories
                setCategories(response.data.data || []);
            } catch (error) {
                setError("Error fetching categories.");
                console.error("Error fetching categories:", error);
            }
        };
 
        const fetchPlans = async () => {
            try {
                const response = await axios.get(`${baseurl}/api/plan_list`);
                // console.log('Plans:', response.data); // Log the plans
                setPlans(response.data.data || []);
                
                // Fetch features for each plan
                response.data.data.forEach(plan => {
                    fetchPlanFeatures(plan.pid);
                });
            } catch (error) {
                setError("Error fetching plans.");
                console.error("Error fetching plans:", error);
            } finally {
                setLoading(false);
            }
        };
 
        fetchCategories();
        fetchPlans();
    }, []);
 
    // Whenever plans, categories, or operator/planType changes, filter and group the plans
    useEffect(() => {
        if (plans.length > 0 && operator && planType) {
            // Filter plans by operator and plan type (Prepaid/Postpaid)
            const filteredPlans = plans.filter(plan => {
                const operatorMatch = plan.operator && operator ? plan.operator.toLowerCase() === operator.toLowerCase() : false;
                const planTypeMatch = plan.type && planType ? plan.type.toLowerCase() === planType.toLowerCase() : false;
                return operatorMatch && planTypeMatch;
            });
 
            // console.log("Filtered Plans:", filteredPlans);  // Log filtered plans
 
            // Group filtered plans by category
            const grouped = filteredPlans.reduce((acc, plan) => {
                if (!acc[plan.category]) {
                    acc[plan.category] = [];
                }
                acc[plan.category].push(plan);
                return acc;
            }, {});
 
            // console.log("Grouped Plans by Category:", grouped);  // Log grouped plans
            setGroupedPlans(grouped);  // Update grouped plans state
 
            // Set default category to show on initial render (first category in the list)
            if (categories.length > 0 && !selectedCategory) {
                setSelectedCategory(categories[0].add_category); // Set the first category as default
            }
        }
    }, [plans, operator, planType, categories, selectedCategory]);
 
    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
    };
 
    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };
 
    const filteredPlans = (plans) => {
        return plans.filter(plan =>
            plan.new_price.toString().includes(searchTerm) ||
            plan.data.toString().includes(searchTerm) ||
            plan.validity.toString().includes(searchTerm)
        );
    };
 
    const handlePlanClick = (plan) => {
        navigate('/plandetail', { state: { plan, homeDataId } });
    };
 
    // Handle loading and error states
    if (loading) {
        return <div className="text-center">Loading...</div>;
    }
 
    if (error) {
        return <div className="text-danger text-center">{error}</div>;
    }
 
    return (
        <div className="container">
            <div 
                className="d-flex align-items-center mt-4"
                style={{
                    background: 'linear-gradient(135deg, #0D6EFD 0%, #0856D6 100%)',
                    color: 'white',
                    padding: '15px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                }}
            >
                <i
                    className="bi bi-arrow-left"
                    style={{ 
                        cursor: 'pointer', 
                        marginRight: '30px', 
                        marginBottom: '10px', 
                        fontSize: '20px',
                        color: 'white'
                    }}
                    onClick={() => navigate(-1)}
                ></i>
                <h4 className="text-center mb-0">Rbtamilan Recharge Plans for {operator} ({planType})</h4>
            </div>
 
            <form className="d-flex justify-content-center mb-4 mt-4" onSubmit={(e) => e.preventDefault()}>
                <input
                    type="text"
                    placeholder="Search Plans"
                    className="form-control me-2"
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
            </form>
 
            <div className="overflow-auto">
                <ul className="nav nav-tabs mb-3 flex-nowrap">
                    {categories.length > 0 ? (
                        categories.map((category, idx) => (
                            <li className="nav-item" key={idx}>
                                <button
                                    className={`nav-link ${selectedCategory === category.add_category ? 'active' : ''}`}
                                    onClick={() => handleCategoryClick(category.add_category)}
                                >
                                    {category.add_category}
                                </button>
                            </li>
                        ))
                    ) : (
                        <p>No categories available</p>
                    )}
                </ul>
            </div>
 
            {selectedCategory && groupedPlans[selectedCategory] ? (
                <div className="row">
                    {filteredPlans(groupedPlans[selectedCategory]).map(plan => (
                        <div className="col-md-4" key={plan.pid}>
                            <div className="card text-center mb-3" onClick={() => handlePlanClick(plan)}>
                                <div className="card-body">
                                    <p className="badge badge-primary">₹{plan.new_price}</p>
                                    <p className="text-danger text-decoration-line-through" id='striketext'>₹{plan.old_price}</p>
                                    <p id='plantext'>Data: {plan.data} GB</p>
                                    <p id='plantext'>Validity: {plan.validity} days</p>
                                    <p id='plantext'>Calls: {plan.cells} Calls</p>
                                    
                                    {/* Extra Benefits Section */}
                                    {planFeatures[plan.pid] && planFeatures[plan.pid].length > 0 && (
                                        <div className="mt-3 pt-3 border-top">
                                            <h6 className="mb-2">Extra Benefits:</h6>
                                            <div className="d-flex flex-wrap justify-content-center gap-2">
                                                {planFeatures[plan.pid].map((feature, index) => (
                                                    <div key={index} className="d-flex align-items-center">
                                                        {feature.Feature?.image_path && (
                                                            <img 
                                                                src={buildImageUrl(feature.Feature.image_path)} 
                                                                alt={feature.Feature.feature_name || 'Feature'}
                                                                style={{ 
                                                                    width: '20px', 
                                                                    height: '20px', 
                                                                    marginRight: '5px',
                                                                    objectFit: 'contain'
                                                                }}
                                                                onError={(e) => handleImageError(e, '/assets/icons/feature-default.png')}
                                                            />
                                                        )}
                                                        <small>{feature.Feature?.feature_name}</small>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p>No plans available for this category.</p>
            )}
            <p style={{textAlign: "center"}}><a href="/contact" >Contact Us</a></p>
        </div>
    );
};
 
export default About;
 
 