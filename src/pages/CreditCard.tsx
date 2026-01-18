import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    CreditCard as CardIcon,
    ShieldCheck,
    Zap,
    Lock,
    CheckCircle,
    AlertCircle
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface Card {
    card_number: string;
    expiry_date: string;
    limit: number;
    status: string;
}

const CreditCardPage: React.FC = () => {
    const [card, setCard] = useState<Card | null>(null);
    const [loading, setLoading] = useState(true);
    const [requesting, setRequesting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [cvv, setCvv] = useState<string | null>(null);
    const [showCvv, setShowCvv] = useState(false);

    const fetchCard = async () => {
        try {
            const res = await api.get('/cards/me');
            setCard(res.data);
            setError(null);
        } catch (err: any) {
            if (err.response?.status === 404) {
                setCard(null);
            } else {
                setError(err.response?.data?.detail || "Erro ao carregar cartão");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCard();
    }, []);

    const handleRequest = async () => {
        setRequesting(true);
        const toastId = toast.loading('Analisando perfil para emissão...');
        try {
            const res = await api.post('/cards/request');
            setCard(res.data);
            toast.success('Parabéns! Seu cartão Retrograde foi emitido.', { id: toastId });
        } catch (err: any) {
            const msg = err.response?.data?.detail || "Não foi possível emitir seu cartão agora.";
            toast.error(msg, { id: toastId });
            setError(msg);
        } finally {
            setRequesting(false);
        }
    };

    const handleBlock = async () => {
        try {
            const res = await api.post('/cards/block');
            setCard(res.data);
            if (res.data.status === 'blocked') {
                toast('Cartão Bloqueado', { icon: '🔒' });
            } else {
                toast.success('Cartão Desbloqueado');
            }
        } catch (err) {
            toast.error('Erro ao alterar status do cartão');
        }
    };

    const handleViewCvv = async () => {
        if (showCvv) {
            setShowCvv(false);
            return;
        }

        try {
            const res = await api.get('/cards/cvv');
            setCvv(res.data.cvv);
            setShowCvv(true);
            setTimeout(() => setShowCvv(false), 5000); // Auto hide after 5s
        } catch (err) {
            toast.error('Erro ao recuperar CVV');
        }
    };

    if (loading) return null;

    return (
        <div className="container" style={{ maxWidth: '800px' }}>
            <Toaster position="top-right" />
            <header style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Link to="/dashboard" style={{ color: 'var(--text-muted)' }}>
                    <ArrowLeft size={24} />
                </Link>
                <h1>Meu Cartão</h1>
            </header>

            {!card ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="card"
                    style={{ textAlign: 'center', padding: '3rem 2rem' }}
                >
                    <div style={{
                        width: '80px', height: '80px', background: 'rgba(99, 102, 241, 0.1)',
                        borderRadius: '2rem', display: 'flex', justifyContent: 'center',
                        alignItems: 'center', margin: '0 auto 2rem', color: 'var(--primary)'
                    }}>
                        <CardIcon size={40} />
                    </div>
                    <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Desbloqueie seu Cartão Exclusive</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '2.5rem', maxWidth: '500px', margin: '0 auto 2.5rem' }}>
                        Baseado na sua inteligência financeira e movimentação, você pode ser elegível ao cartão com 1% de cashback e limite global.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textAlign: 'left' }}>
                            <Zap size={20} color="var(--warning)" />
                            <span style={{ fontSize: '0.9rem' }}>Aprovação Instatânea</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textAlign: 'left' }}>
                            <ShieldCheck size={20} color="var(--success)" />
                            <span style={{ fontSize: '0.9rem' }}>Segurança de Elite</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textAlign: 'left' }}>
                            <Lock size={20} color="var(--primary)" />
                            <span style={{ fontSize: '0.9rem' }}>Zero Anuidade</span>
                        </div>
                    </div>

                    {error && (
                        <div style={{ marginBottom: '2rem', padding: '1rem', borderRadius: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', display: 'flex', gap: '0.75rem', alignItems: 'center', justifyContent: 'center' }}>
                            <AlertCircle size={20} />
                            <span style={{ fontSize: '0.9rem' }}>{error}</span>
                        </div>
                    )}

                    <button
                        onClick={handleRequest}
                        disabled={requesting}
                        style={{ padding: '1.25rem 3rem', fontSize: '1.1rem', background: 'var(--primary)', boxShadow: '0 10px 30px rgba(99, 102, 241, 0.3)' }}
                    >
                        {requesting ? 'Analisando...' : 'Quero meu cartão agora'}
                    </button>
                </motion.div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                    {/* Visual Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        style={{
                            background: 'linear-gradient(135deg, #1e1e1e 0%, #000 100%)',
                            borderRadius: '1.5rem',
                            padding: '2.5rem',
                            aspectRatio: '1.58 / 1',
                            position: 'relative',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            overflow: 'hidden',
                            filter: card.status === 'blocked' ? 'grayscale(100%) opacity(0.8)' : 'none'
                        }}
                    >
                        {card.status === 'blocked' && (
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10, background: 'rgba(0,0,0,0.5)' }}>
                                <Lock size={48} color="#fff" />
                            </div>
                        )}
                        {/* Design Elements */}
                        <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '200px', height: '200px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '50%', filter: 'blur(50px)' }}></div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem' }}>
                            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', letterSpacing: '0.1em' }}>RETROGRADE</div>
                            <div style={{ width: '45px', height: '35px', background: 'linear-gradient(45deg, #f59e0b, #fbbf24)', borderRadius: '0.3rem' }}></div>
                        </div>

                        <div style={{ fontSize: '1.5rem', letterSpacing: '0.2em', marginBottom: '2rem', fontFamily: 'monospace' }}>
                            {card.card_number}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                            <div>
                                <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.5)', margin: '0 0 0.25rem 0', textTransform: 'uppercase' }}>Validade</p>
                                <p style={{ margin: 0, fontSize: '1rem' }}>{card.expiry_date}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <CardIcon size={32} color="rgba(255,255,255,0.3)" />
                            </div>
                        </div>
                    </motion.div>

                    {/* Card Info */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="card">
                        <h2 style={{ marginBottom: '1.5rem' }}>Detalhes do Cartão</h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Status</span>
                                <span style={{ color: card.status === 'active' ? 'var(--success)' : 'var(--danger)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    {card.status === 'active' ? <><CheckCircle size={16} /> Ativo</> : <><Lock size={16} /> Bloqueado</>}
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Limite do Cartão</span>
                                <span style={{ fontWeight: 'bold' }}>R$ {Number(card.limit).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Tipo</span>
                                <span style={{ fontWeight: 'bold' }}>Platinum Virtual</span>
                            </div>
                        </div>

                        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                            <button onClick={handleBlock} style={{ flex: 1, background: card.status === 'blocked' ? 'var(--success)' : 'var(--danger)', color: '#fff' }}>
                                {card.status === 'blocked' ? 'Desbloquear' : 'Bloquear'}
                            </button>
                            <button onClick={handleViewCvv} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid var(--border)' }}>
                                {showCvv ? `CVV: ${cvv}` : 'Ver CVV'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default CreditCardPage;
