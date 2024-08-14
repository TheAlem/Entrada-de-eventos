import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext'; 

const TokenContext = createContext();

export function useToken() {
    return useContext(TokenContext);
}

export function TokenProvider({ children }) {
    const { currentUser, isAdmin } = useAuth(); 
    const [token, setToken] = useState(localStorage.getItem('userToken') || null);

    useEffect(() => {
        if (isAdmin) {
            const adminToken = `admin-token-for-${currentUser.uid}`;
            localStorage.setItem('adminToken', adminToken);
            setToken(adminToken);
        } else if (currentUser && !isAdmin) {
            const userToken = localStorage.getItem('userToken');
            if (userToken) {
                setToken(userToken);
            } else {
                setToken(null);
            }
        } else {
            localStorage.removeItem('userToken');
            setToken(null);
        }
    }, [currentUser, isAdmin]);

    const updateToken = (newToken) => {
        localStorage.setItem('userToken', newToken);
        setToken(newToken);
    };

    return (
        <TokenContext.Provider value={{ token, updateToken }}>
            {children}
        </TokenContext.Provider>
    );
}
