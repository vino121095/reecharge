import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const SavingsSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { savings, planDetails } = location.state || {};
    
    const [showContent, setShowContent] = useState(false);
    const [userName, setUserName] = useState('');
    const [userId, setUserId] = useState('');
    const [showConfetti, setShowConfetti] = useState(true);

    useEffect(() => {
        // Trigger content animation after component mounts
        const timer = setTimeout(() => {
            setShowContent(true);
        }, 500);

        // Get user data from localStorage
        try {
            const userDataString = localStorage.getItem('userData');
            const userIdString = localStorage.getItem('userId');
            if (userDataString) {
                const userData = JSON.parse(userDataString);
                setUserName(
                    userData.name ||
                    userData.username ||
                    userData.firstName ||
                    (userData.email ? userData.email.split('@')[0] : '') ||
                    'User'
                );
            }
            if (userIdString) {
                setUserId(userIdString);
            }
        } catch (err) {
            setUserName('User');
            setUserId('');
        }

        // Hide confetti after 6 seconds
        const confettiTimer = setTimeout(() => {
            setShowConfetti(false);
        }, 6000);

        return () => {
            clearTimeout(timer);
            clearTimeout(confettiTimer);
        };
    }, []);

    if (!savings || !planDetails) {
        return (
            <div>
                <style>{`
                    .container { max-width: 1200px; margin: 0 auto; padding: 0 15px; }
                    .d-flex { display: flex; }
                    .align-items-center { align-items: center; }
                    .min-vh-100 { min-height: 100vh; }
                    .justify-content-center { justify-content: center; }
                    .alert { padding: 0.75rem 1.25rem; margin-bottom: 1rem; border: 1px solid transparent; border-radius: 0.25rem; }
                    .alert-warning { color: #856404; background-color: #fff3cd; border-color: #ffeaa7; }
                    .me-3 { margin-right: 1rem; }
                    .mb-0 { margin-bottom: 0; }
                    .fw-bold { font-weight: 700; }
                `}</style>
                {/* Header */}
                <div style={{
                    background: 'linear-gradient(135deg, #0D6EFD 0%, #0856D6 100%)',
                    color: 'white',
                    padding: '15px 0',
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 1000,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                }}>
                    <div className="container">
                        <div className="d-flex align-items-center">
                            <span
                                className="me-3"
                                style={{
                                    cursor: 'pointer',
                                    fontSize: '20px',
                                }}
                                onClick={() => navigate('/home')}
                                aria-label="Go back"
                            >←</span>
                            <h4 className="mb-0 fw-bold">Rbtamilan Recharge</h4>
                        </div>
                    </div>
                </div>

                <div className="container min-vh-100 d-flex justify-content-center align-items-center" style={{ paddingTop: '80px' }}>
                    <div className="alert alert-warning" role="alert">
                        No savings data found
                    </div>
                </div>
            </div>
        );
    }

    // Create confetti pieces
    const confettiPieces = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        animationDelay: Math.random() * 3,
        color: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'][Math.floor(Math.random() * 8)]
    }));

    const styles = {
        confettiContainer: {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 1001,
            overflow: 'hidden'
        },
        confettiPiece: {
            position: 'absolute',
            width: '10px',
            height: '10px',
            animation: 'confettiFall 3s linear infinite',
            borderRadius: '2px'
        },
        mainContent: {
            opacity: showContent ? 1 : 0,
            transform: showContent ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.8s ease-out'
        },
        celebrationIcon: {
            animation: 'bounce 2s infinite',
            fontSize: '4rem',
            background: 'linear-gradient(45deg, #1a73e8, #4285f4, #5c9ce6)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
        },
        savingsAmount: {
            animation: showContent ? 'scaleIn 0.8s ease-out 0.5s both' : 'none',
            color: 'white',
            textShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
        },
        card: {
            animation: showContent ? 'slideInUp 0.6s ease-out 0.3s both' : 'none',
            borderRadius: '16px',
            border: 'none',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            overflow: 'hidden'
        },
        gradientButton: {
            background: 'linear-gradient(135deg, #1a73e8 0%, #4285f4 100%)',
            border: 'none',
            borderRadius: '12px',
            padding: '12px 24px',
            fontWeight: '600',
            transition: 'all 0.3s ease',
            transform: 'translateY(0)',
            boxShadow: '0 4px 15px rgba(26, 115, 232, 0.4)'
        },
        header: {
            background: 'linear-gradient(135deg, #1a73e8 0%, #4285f4 100%)',
            color: 'white',
            padding: '15px 0',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            boxShadow: '0 2px 20px rgba(0,0,0,0.1)'
        }
    };

    return (
        <div>
            <style>{`
                @keyframes confettiFall {
                    0% {
                        transform: translateY(-100vh) rotate(0deg);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(100vh) rotate(720deg);
                        opacity: 0;
                    }
                }

                @keyframes bounce {
                    0%, 20%, 50%, 80%, 100% {
                        transform: translateY(0);
                    }
                    40% {
                        transform: translateY(-20px);
                    }
                    60% {
                        transform: translateY(-10px);
                    }
                }

                @keyframes scaleIn {
                    0% {
                        transform: scale(0.5);
                        opacity: 0;
                    }
                    50% {
                        transform: scale(1.1);
                    }
                    100% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }

                @keyframes slideInUp {
                    0% {
                        transform: translateY(50px);
                        opacity: 0;
                    }
                    100% {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }

                @keyframes pulse {
                    0% {
                        box-shadow: 0 4px 15px rgba(26, 115, 232, 0.4);
                    }
                    50% {
                        box-shadow: 0 4px 25px rgba(26, 115, 232, 0.6);
                    }
                    100% {
                        box-shadow: 0 4px 15px rgba(26, 115, 232, 0.4);
                    }
                }

                .btn-gradient:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(26, 115, 232, 0.6);
                }

                .btn-gradient:active {
                    transform: translateY(0);
                }

                .card-glow {
                    position: relative;
                    overflow: hidden;
                }

                .card-glow::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
                    animation: shimmer 2s infinite;
                }

                @keyframes shimmer {
                    0% {
                        left: -100%;
                    }
                    100% {
                        left: 100%;
                    }
                }
            `}</style>
            
            {/* Confetti Animation */}
            {showConfetti && (
                <div style={styles.confettiContainer}>
                    {confettiPieces.map((piece) => (
                        <div
                            key={piece.id}
                            style={{
                                ...styles.confettiPiece,
                                left: `${piece.left}%`,
                                backgroundColor: piece.color,
                                animationDelay: `${piece.animationDelay}s`
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Header */}
            <div style={styles.header}>
                <div className="container">
                    <div className="d-flex align-items-center">
                        <span
                            style={{ cursor: 'pointer', fontSize: '20px', marginRight: '1rem' }}
                            onClick={() => navigate('/home')}
                            aria-label="Go back"
                        >
                            ←
                        </span>
                        <h4 style={{ margin: 0, fontWeight: 'bold' }}>Rbtamilan Recharge</h4>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container" style={{ paddingTop: '80px', paddingBottom: '20px' }}>
                <div className="row justify-content-center">
                    <div className="col-12 col-md-8 col-lg-6" style={styles.mainContent}>
                        {/* User Info */}
                        <div className="text-center mb-4">
                            <h5 className="fw-bold" style={{ color: '#1a73e8' }}>
                                Welcome, {userName}{userId ? ` (ID: ${userId})` : ''}
                            </h5>
                        </div>
                        {/* Celebration Header */}
                        <div className="text-center mb-4">
                            <div className="mb-3" style={styles.celebrationIcon}>
                                🎉
                            </div>
                            <h1 className="h2 mb-3 fw-bold" style={{ 
                                background: 'linear-gradient(45deg, #1a73e8, #4285f4)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}>
                                Congratulations!
                            </h1>
                            <p className="text-muted fs-5">You've saved money on your recharge</p>
                        </div>

                        {/* Savings Card */}
                        <div className="card card-glow mb-4" style={styles.card}>
                            <div className="card-body text-center py-5" style={{
                                background: 'linear-gradient(135deg, #1a73e8 0%, #4285f4 100%)',
                                color: 'white'
                            }}>
                                <h1 className="display-3 mb-3 fw-bold" style={{
                                    ...styles.savingsAmount,
                                    fontSize: '3rem',
                                }}>
                                    ₹{savings}
                                </h1>
                                <p style={{ margin: 0, fontSize: '1.25rem', opacity: 0.9 }}>Total Savings</p>
                                <div className="mt-3">
                                    <span
                                        className="fw-bold"
                                        style={{
                                            fontWeight: 700,
                                            fontSize: '1.7rem',
                                            letterSpacing: '1px',
                                            background: 'linear-gradient(90deg, #f7971e 0%, #ffd200 100%)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            backgroundClip: 'text',
                                            textFillColor: 'transparent',
                                            display: 'inline-block',
                                        }}
                                    >
                                        RB Tamilan
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="d-grid gap-3">
                            <button 
                                className="btn btn-gradient text-white fw-bold"
                                style={{
                                    ...styles.gradientButton,
                                    padding: '12px 24px'
                                }}
                                onClick={() => navigate('/home')}
                                onMouseEnter={(e) => {
                                    e.target.style.animation = 'pulse 1s infinite';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.animation = 'none';
                                }}
                            >
                                <span className="fs-5">🔄</span> Make Another Recharge
                            </button>
                            <button 
                                className="btn btn-outline-primary fw-bold"
                                onClick={() => navigate('/recharge-history')}
                                style={{ 
                                    borderRadius: '12px',
                                    borderWidth: '2px',
                                    borderColor: '#1a73e8',
                                    color: '#1a73e8',
                                    transition: 'all 0.3s ease',
                                    padding: '12px 24px'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.transform = 'translateY(-2px)';
                                    e.target.style.boxShadow = '0 6px 20px rgba(26, 115, 232, 0.3)';
                                    e.target.style.backgroundColor = '#e8f0fe';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = 'none';
                                    e.target.style.backgroundColor = 'transparent';
                                }}
                            >
                                <span className="fs-5">📚</span> View Recharge History
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SavingsSuccess;