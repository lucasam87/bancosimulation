import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import CreditApplication from './pages/CreditApplication';
import Loan from './pages/Loan';
import CreditCard from './pages/CreditCard';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { signed, loading } = useAuth();

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#6366f1' }}>
            Carregando...
        </div>
    );

    return signed ? <>{children}</> : <Navigate to="/login" />;
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route
                        path="/dashboard"
                        element={
                            <PrivateRoute>
                                <Dashboard />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/credit"
                        element={
                            <PrivateRoute>
                                <CreditApplication />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/loans"
                        element={
                            <PrivateRoute>
                                <Loan />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/card"
                        element={
                            <PrivateRoute>
                                <CreditCard />
                            </PrivateRoute>
                        }
                    />
                </Routes>
            </Router>
        </AuthProvider>
    );
};


export default App;
