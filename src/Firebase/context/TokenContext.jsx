import React, { createContext, useState, useContext } from 'react';

const TokenContext = createContext();

export function useToken() {
    return useContext(TokenContext);
}

export function TokenProvider({ children }) {
    const [token, setToken] = useState(localStorage.getItem('userToken') || null);

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
