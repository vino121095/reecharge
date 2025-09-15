import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

// Redirects authenticated users away from public pages like login.
// role: 'admin' checks 'token'; 'user' checks 'userToken'; 'any' checks either.
// redirectTo: default destination when already authenticated.
const PublicRoute = ({ role = 'admin', redirectTo, children }) => {
	const hasAdminToken = typeof window !== 'undefined' && !!localStorage.getItem('token');
	const hasUserToken = typeof window !== 'undefined' && !!localStorage.getItem('userToken');

	const isAuthenticated = role === 'admin' ? hasAdminToken : role === 'user' ? hasUserToken : (hasAdminToken || hasUserToken);

	if (isAuthenticated) {
		const fallback = redirectTo || (hasAdminToken ? '/userlist' : '/home');
		return <Navigate to={fallback} replace />;
	}

	return children ? children : <Outlet />;
};

export default PublicRoute;


