import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase-config';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, user => {
            setCurrentUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    useEffect(() => {
        if (currentUser) {
            startLogoutTimer();
        }
    }, [currentUser]);

    const login = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const logout = () => {
        stopLogoutTimer();
        return signOut(auth);
    };

    // Timer for auto logout
    let logoutTimer;

    const startLogoutTimer = () => {
        const logoutTime = 30 * 60 * 1000; // 30 minutes
        logoutTimer = setTimeout(() => {
            logout();
            alert('Has sido desconectado por inactividad.');
        }, logoutTime);
    };

    const stopLogoutTimer = () => {
        if (logoutTimer) {
            clearTimeout(logoutTimer);
        }
    };

    // Reset timer on user activity
    const resetLogoutTimer = () => {
        stopLogoutTimer();
        startLogoutTimer();
    };

    // Add event listeners for user activity
    useEffect(() => {
        window.addEventListener('mousemove', resetLogoutTimer);
        window.addEventListener('mousedown', resetLogoutTimer);
        window.addEventListener('click', resetLogoutTimer);
        window.addEventListener('keydown', resetLogoutTimer);
        window.addEventListener('scroll', resetLogoutTimer);

        return () => {
            window.removeEventListener('mousemove', resetLogoutTimer);
            window.removeEventListener('mousedown', resetLogoutTimer);
            window.removeEventListener('click', resetLogoutTimer);
            window.removeEventListener('keydown', resetLogoutTimer);
            window.removeEventListener('scroll', resetLogoutTimer);
        };
    }, []);

    const value = {
        currentUser,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
