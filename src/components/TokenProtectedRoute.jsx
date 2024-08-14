import React from 'react';
import { Navigate } from 'react-router-dom';
import { useToken } from '../Firebase/context/TokenContext';
import { useAuth } from '../Firebase/context/AuthContext';

function TokenProtectedRoute({ children }) {
    const { token } = useToken();
    const { isAdmin } = useAuth();

    if (isAdmin) {
        return children;
    }

    return token ? children : <Navigate to="/personal-data" />;
}

export default TokenProtectedRoute;
