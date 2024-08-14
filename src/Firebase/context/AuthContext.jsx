import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase-config';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);

            if (user) {
                // Verifica si el UID del usuario coincide con el del admin
                if (user.uid === "ru35UKp2uOXdImp33PnFRLGmkpB2") { // Reemplaza con el UID del admin
                    setIsAdmin(true);
                } else {
                    setIsAdmin(false);
                }
            } else {
                setIsAdmin(false);
            }
        });

        return unsubscribe;
    }, []);

    const login = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const logout = () => {
        return signOut(auth);
    };

    const value = {
        currentUser,
        isAdmin,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
