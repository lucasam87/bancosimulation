import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { signIn } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const toastId = toast.loading('Autenticando...');
        try {
            const formData = new FormData();
            formData.append('username', email);
            formData.append('password', password);

            const response = await api.post('/auth/login', formData);
            signIn(response.data.access_token);
            toast.success('Bem-vindo de volta!', { id: toastId });
            navigate('/dashboard');
        } catch (err: any) {
            toast.error(err.response?.data?.detail || 'E-mail ou senha incorretos', { id: toastId });
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '1rem' }}>
            <Toaster position="top-right" />
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card"
                style={{ width: '100%', maxWidth: '400px' }}
            >
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{ background: 'rgba(99, 102, 241, 0.2)', width: '64px', height: '64px', borderRadius: '1.25rem', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 1rem', color: 'var(--primary)' }}>
                        <ShieldCheck size={32} />
                    </div>
                    <h1>Seja bem-vindo</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Acesse sua conta com segurança.</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label><Mail size={14} style={{ marginRight: '4px' }} /> E-mail</label>
                        <input
                            type="email"
                            placeholder="seu@contato.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label><Lock size={14} style={{ marginRight: '4px' }} /> Senha</label>
                        <input
                            type="password"
                            placeholder="Sua senha secreta"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" style={{ width: '100%', marginTop: '1rem' }}>
                        Entrar <ArrowRight size={18} />
                    </button>
                </form>

                <div style={{ marginTop: '2rem', textAlign: 'center', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Ainda não tem conta? <Link to="/register">Criar Conta</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
