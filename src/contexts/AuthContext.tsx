import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api';

interface AuthContextData {
    signed: boolean;
    token: string | null;
    signIn: (token: string) => void;
    signOut: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storagedToken = localStorage.getItem('token');
        if (storagedToken) {
            setToken(storagedToken);
        }
        setLoading(false);
    }, []);

    function signIn(newToken: string) {
        setToken(newToken);
        localStorage.setItem('token', newToken);
    }

    function signOut() {
        setToken(null);
        localStorage.removeItem('token');
    }

    return (
        <AuthContext.Provider value={{ signed: !!token, token, signIn, signOut, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export function useAuth() {
    const context = useContext(AuthContext);
    return context;
}
