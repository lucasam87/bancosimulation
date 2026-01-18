import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldCheck,
    ArrowLeft,
    Send,
    AlertCircle,
    CheckCircle,
    XCircle,
    Sparkles,
    Briefcase,
    Home,
    User
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const CreditApplication: React.FC = () => {
    const [age, setAge] = useState('');
    const [motherName, setMotherName] = useState('');
    const [salary, setSalary] = useState('');
    const [assets, setAssets] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const toastId = toast.loading('A IA do Gemini está analisando seu perfil...');

        try {
            const res = await api.post('/credit/apply', {
                age: parseInt(age),
                mother_name: motherName,
                monthly_income: parseFloat(salary),
                assets_value: parseFloat(assets)
            });
            setResult(res.data);
            toast.success('Análise concluída!', { id: toastId });
        } catch (err: any) {
            toast.error(err.response?.data?.detail || 'Erro na análise', { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ maxWidth: '800px' }}>
            <Toaster position="top-right" />

            <header style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Link to="/dashboard" style={{ color: 'var(--text-muted)' }}>
                    <ArrowLeft size={24} />
                </Link>
                <h1>Análise de Crédito IA</h1>
            </header>

            {!result ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card"
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', color: 'var(--primary)' }}>
                        <Sparkles size={24} />
                        <h2 style={{ margin: 0 }}>Solicitar Limite</h2>
                    </div>

                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                        Preencha os dados abaixo com sinceridade. Nossa inteligência artificial (Gemini) irá processar as informações em tempo real para decidir seu novo limite.
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div className="form-group">
                                <label><User size={14} /> Idade</label>
                                <input type="number" placeholder="Sua idade" value={age} onChange={(e) => setAge(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label><User size={14} /> Nome da Mãe</label>
                                <input type="text" placeholder="Nome completo" value={motherName} onChange={(e) => setMotherName(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label><Briefcase size={14} /> Renda Mensal (R$)</label>
                                <input type="number" placeholder="Ex: 3500.00" value={salary} onChange={(e) => setSalary(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label><Home size={14} /> Valor de Bens (R$)</label>
                                <input type="number" placeholder="Carro, Imóveis, etc" value={assets} onChange={(e) => setAssets(e.target.value)} required />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{ width: '100%', marginTop: '2rem', padding: '1rem', background: 'var(--primary)', color: '#fff', fontSize: '1.1rem' }}
                        >
                            {loading ? 'Analisando perfil...' : 'Enviar para Análise'}
                        </button>
                    </form>
                </motion.div>
            ) : (
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="card"
                    style={{ textAlign: 'center', padding: '3rem' }}
                >
                    {result.status === 'approved' ? (
                        <>
                            <div style={{ color: 'var(--success)', marginBottom: '1.5rem' }}>
                                <CheckCircle size={64} style={{ margin: '0 auto' }} />
                            </div>
                            <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Crédito Aprovado!</h2>

                            {result.score && (
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <span style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>Seu Score</span>
                                    <div style={{ fontSize: '3.5rem', fontWeight: '800', background: 'linear-gradient(to right, #10b981, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                        {result.score}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>de 1000</div>
                                </div>
                            )}

                            <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
                                {result.ai_feedback}
                            </p>
                            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '2rem', borderRadius: '1rem', marginBottom: '2rem' }}>
                                <p style={{ margin: 0, color: 'var(--text-muted)' }}>Seu novo limite:</p>
                                <h3 style={{ fontSize: '3rem', margin: '0.5rem 0', color: 'var(--success)' }}>
                                    R$ {Number(result.approved_limit).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </h3>
                            </div>
                        </>
                    ) : (
                        <>
                            <div style={{ color: 'var(--warning)', marginBottom: '1.5rem' }}>
                                <XCircle size={64} style={{ margin: '0 auto' }} />
                            </div>
                            <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Crédito Negado</h2>
                            <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
                                {result.ai_feedback}
                            </p>
                        </>
                    )}

                    <button onClick={() => navigate('/dashboard')} style={{ padding: '0.75rem 2rem' }}>
                        Voltar ao Início
                    </button>
                </motion.div>
            )}
        </div>
    );
};

export default CreditApplication;
