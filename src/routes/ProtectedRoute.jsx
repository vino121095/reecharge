import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

// Guards routes based on presence of tokens in localStorage.
// By default, protects admin/employee routes (expects 'token').
// role: 'admin' checks 'token'; 'user' checks 'userToken'; 'any' checks either.
const ProtectedRoute = ({ role = 'admin', children, redirectTo }) => {
	const hasAdminToken = typeof window !== 'undefined' && !!localStorage.getItem('token');
	const hasUserToken = typeof window !== 'undefined' && !!localStorage.getItem('userToken');

	const isAuthorized = role === 'admin' ? hasAdminToken : role === 'user' ? hasUserToken : (hasAdminToken || hasUserToken);

	if (!isAuthorized) {
		const fallback = redirectTo || (role === 'admin' ? '/admin' : '/');
		return <Navigate to={fallback} replace />;
	}

	// Support both element children and Route nesting via Outlet
	return children ? children : <Outlet />;
};

export default ProtectedRoute;


