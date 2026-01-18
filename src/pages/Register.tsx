import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { motion } from 'framer-motion';
import { UserPlus, User, Mail, Lock, CreditCard, ArrowRight } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const Register: React.FC = () => {
    const [name, setName] = useState('');
    const [cpf, setCpf] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const toastId = toast.loading('Criando sua conta...');
        try {
            await api.post('/auth/register', {
                name,
                cpf,
                email,
                password
            });
            toast.success('Conta criada com sucesso! Faça seu primeiro login.', { id: toastId });
            navigate('/login');
        } catch (err: any) {
            toast.error(err.response?.data?.detail || 'Erro ao registrar', { id: toastId });
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '1rem' }}>
            <Toaster position="top-right" />
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card"
                style={{ width: '100%', maxWidth: '450px' }}
            >
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ background: 'rgba(99, 102, 241, 0.2)', width: '64px', height: '64px', borderRadius: '1.25rem', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 1rem', color: 'var(--primary)' }}>
                        <UserPlus size={32} />
                    </div>
                    <h1 style={{ marginBottom: '0.5rem' }}>Abrir Conta</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Comece sua jornada financeira hoje.</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label><User size={14} style={{ marginRight: '4px' }} /> Nome Completo</label>
                        <input type="text" placeholder="Como quer ser chamado?" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label><CreditCard size={14} style={{ marginRight: '4px' }} /> CPF</label>
                        <input type="text" placeholder="000.000.000-00" value={cpf} onChange={(e) => setCpf(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label><Mail size={14} style={{ marginRight: '4px' }} /> E-mail</label>
                        <input type="email" placeholder="exemplo@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label><Lock size={14} style={{ marginRight: '4px' }} /> Senha</label>
                        <input type="password" placeholder="Mínimo 8 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>

                    <button type="submit" style={{ width: '100%', marginTop: '1rem' }}>
                        Criar Conta <ArrowRight size={18} />
                    </button>
                </form>

                <div style={{ marginTop: '2rem', textAlign: 'center', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Já tem conta? <Link to="/login">Acessar Banco</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;

