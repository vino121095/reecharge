import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

function About() {
    const [key, setKey] = useState('');
    const [categories, setCategories] = useState([]);
    const [plans, setPlans] = useState([]);
    const [currentPlan, setCurrentPlan] = useState({ items: [] });
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    // Retrieve the state passed from Home page
    const { planType, operator } = location.state || {};

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/add_category');
                const fetchedCategories = response.data.data || [];
                setCategories(fetchedCategories);
                if (fetchedCategories.length > 0) {
                    setKey(fetchedCategories[0].cid);
                }
            } catch (error) {
                setError("Error fetching categories.");
                console.error("Error fetching categories:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/plan_list');
                if (Array.isArray(response.data.data)) {
                    setPlans(response.data.data);
                    if (categories.length > 0) {
                        const filteredPlans = response.data.data.filter(plan => 
                            plan.category === categories[0].add_category
                        );
                        setCurrentPlan({ items: filteredPlans });
                    }
                }
            } catch (error) {
                setError("Error fetching plans.");
                console.error("Error fetching plans:", error);
            }
        };

        fetchPlans();
    }, [categories]);

    useEffect(() => {
        if (plans.length > 0 && planType && operator) {
            const filteredPlans = plans.filter(plan => 
                plan.type === planType && plan.operator === operator // Adjust based on your plan structure
            );
            setCurrentPlan({ items: filteredPlans });
        }
    }, [plans, planType, operator]);

    const handleCategoryClick = (category) => {
        setKey(category.cid);
        const filteredPlans = plans.filter(plan => plan.category === category.add_category);
        setCurrentPlan({ items: filteredPlans });
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const filteredPlans = currentPlan.items.filter(plan =>
        plan.new_price.toString().includes(searchTerm) || 
        plan.data.toString().includes(searchTerm) || 
        plan.cells.toString().includes(searchTerm) || 
        plan.validity.toString().includes(searchTerm)
    );

    const handlePlanClick = (plan) => {
        navigate('/plandetail', { state: { plan } });
    };

    if (loading) {
        return <div className="text-center">Loading...</div>;
    }

    if (error) {
        return <div className="text-danger text-center">{error}</div>;
    }

    return (
        <div className="container">
            <div className="d-flex align-items-center mt-4">
                <i 
                    className="bi bi-arrow-left" 
                    style={{ cursor: 'pointer', marginRight: '30px', marginBottom: '10px', fontSize: '20px' }} 
                    onClick={() => navigate(-1)}
                ></i>
                <h4 className="text-center">Available Recharge Plans</h4>
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
                    {categories.map((category) => (
                        <li className="nav-item" key={category.cid}>
                            <button
                                className={`nav-link ${key === category.cid ? 'active' : ''}`}
                                onClick={() => handleCategoryClick(category)}
                            >
                                {category.add_category}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="row">
                {filteredPlans.length > 0 ? (
                    filteredPlans.map((plan) => (
                        <div className="col-md-4" key={plan.pid}>
                            <div 
                                className="card text-center mb-3" 
                                id='planbigcard'
                                onClick={() => handlePlanClick(plan)} 
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="card-body" id='plancard'>
                                    <div className='d-flex justify-content-around align-items-center'>
                                        <div>
                                            <p className="badge badge-primary">₹{plan.new_price}</p>
                                            <p className="text-danger text-decoration-line-through" id='striketext'>₹{plan.old_price}</p>
                                        </div>
                                        <div>
                                            <p id='plantext'>Data: {plan.data} GB/Day</p>
                                            <p id='plantext'>Calls: {plan.cells} Calls</p>
                                            <p id='plantext'>Validity: {plan.validity} Days</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No plans available for this category.</p>
                )}
            </div>
        </div>
    );
}

export default About;
