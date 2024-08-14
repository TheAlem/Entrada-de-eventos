import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../Firebase/context/AuthContext';

function ProtectedRoute({ children }) {
    const { currentUser, isAdmin } = useAuth();

    if (!currentUser) {
        return <Navigate to="/login" />;
    }

    // Si es admin, puede acceder a cualquier ruta protegida
    if (isAdmin) {
        return children;
    }

    // Si no es admin, puedes redirigir a una página de acceso no autorizado o permitir el acceso si es aplicable
    return children;
}

export default ProtectedRoute;
