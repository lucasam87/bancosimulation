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

    const validateCPF = (cpf: string) => {
        cpf = cpf.replace(/[^\d]+/g, '');
        if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
        let soma = 0, resto;
        for (let i = 1; i <= 9; i++) soma = soma + parseInt(cpf.substring(i - 1, i)) * (11 - i);
        resto = (soma * 10) % 11;
        if ((resto === 10) || (resto === 11)) resto = 0;
        if (resto !== parseInt(cpf.substring(9, 10))) return false;
        soma = 0;
        for (let i = 1; i <= 10; i++) soma = soma + parseInt(cpf.substring(i - 1, i)) * (12 - i);
        resto = (soma * 10) % 11;
        if ((resto === 10) || (resto === 11)) resto = 0;
        if (resto !== parseInt(cpf.substring(10, 11))) return false;
        return true;
    };

    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const maskCPF = (value: string) => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})/, '$1-$2')
            .replace(/(-\d{2})\d+?$/, '$1');
    };

    const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCpf(maskCPF(e.target.value));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateCPF(cpf)) {
            toast.error('CPF inválido. Verifique os números.');
            return;
        }
        if (!validateEmail(email)) {
            toast.error('E-mail inválido.');
            return;
        }

        const toastId = toast.loading('Criando sua conta...');
        try {
            // Validate first
            // Note: In client-side flow, database uniqueness checks (CPF) are harder without Cloud Functions.
            // We will rely on Firebase Auth email uniqueness for now.

            // 1. Create User in Firebase Auth
            const { createUserWithEmailAndPassword } = await import("firebase/auth");
            const { doc, setDoc } = await import("firebase/firestore");
            const { auth, db } = await import("../firebase-config"); // Lazy load

            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. Create User Profile in Firestore
            await setDoc(doc(db, "users", user.uid), {
                name,
                email,
                cpf,
                uid: user.uid,
                createdAt: new Date().toISOString(),
                balance: 0, // Initial balance
                accountNumber: Math.floor(100000 + Math.random() * 900000).toString() // Random account
            });

            toast.success('Conta criada com sucesso! Você já está logado.', { id: toastId });
            navigate('/dashboard'); // Auto login
        } catch (err: any) {
            console.error(err);
            let msg = 'Erro ao criar conta.';
            if (err.code === 'auth/email-already-in-use') msg = 'E-mail já está em uso.';
            if (err.code === 'auth/weak-password') msg = 'Senha muito fraca.';
            toast.error(msg, { id: toastId });
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
                        <input
                            type="text"
                            placeholder="000.000.000-00"
                            value={cpf}
                            onChange={handleCpfChange}
                            maxLength={14}
                            required
                        />
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

