import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Banknote,
    CheckCircle,
    AlertTriangle,
    Info,
    History,
    Layers
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface Account {
    credit_limit: number;
    balance: number;
}

interface Loan {
    id: number;
    amount: number;
    installments: number;
    interest_rate: number;
    installment_amount: number;
    total_to_pay: number;
    status: string;
    timestamp: string;
}

const Loan: React.FC = () => {
    const [account, setAccount] = useState<Account | null>(null);
    const [loans, setLoans] = useState<Loan[]>([]);
    const [amount, setAmount] = useState('');
    const [installments, setInstallments] = useState(1);
    const [loading, setLoading] = useState(true);
    const [requesting, setRequesting] = useState(false);

    const fetchData = async () => {
        try {
            const [accRes, loanRes] = await Promise.all([
                api.get('/accounts/me'),
                api.get('/loans/list')
            ]);
            setAccount(accRes.data);
            setLoans(loanRes.data);
        } catch (error) {
            toast.error('Erro ao carregar informações');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Interest Logic based on installments
    const baseRate = 2.5;
    const currentRate = baseRate + (0.1 * installments);
    const totalToPay = (parseFloat(amount) || 0) * (1 + (currentRate * installments / 100));
    const installmentAmount = totalToPay / installments;

    const handleLoanRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        const val = parseFloat(amount);

        if (!val || val <= 0) {
            toast.error('Insira um valor válido');
            return;
        }

        if (account && val > account.credit_limit) {
            toast.error('Valor acima do seu limite disponível');
            return;
        }

        setRequesting(true);
        const toastId = toast.loading('Processando seu empréstimo...');

        try {
            await api.post('/loans/request', {
                amount: val,
                installments: installments
            });
            toast.success('Empréstimo aprovado e creditado!', { id: toastId });
            setAmount('');
            setInstallments(1);
            await fetchData();
        } catch (err: any) {
            toast.error(err.response?.data?.detail || 'Erro ao solicitar empréstimo', { id: toastId });
        } finally {
            setRequesting(false);
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#6366f1' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                <Banknote size={48} />
            </motion.div>
        </div>
    );

    return (
        <div className="container" style={{ maxWidth: '1000px' }}>
            <Toaster position="top-right" />

            <header style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Link to="/dashboard" style={{ color: 'var(--text-muted)' }}>
                    <ArrowLeft size={24} />
                </Link>
                <h1>Empréstimos Inteligentes</h1>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
                {/* Request Side */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>
                        <Banknote size={24} />
                        <h2 style={{ margin: 0 }}>Simular Empréstimo</h2>
                    </div>

                    <div style={{ background: 'rgba(99, 102, 241, 0.05)', padding: '1.25rem', borderRadius: '1rem', border: '1px solid rgba(99, 102, 241, 0.1)', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.8rem' }}>Limite Disponível</p>
                                <h3 style={{ margin: '0.25rem 0', color: 'var(--primary)' }}>
                                    R$ {Number(account?.credit_limit || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </h3>
                            </div>
                            <Info size={20} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
                        </div>
                    </div>

                    <form onSubmit={handleLoanRequest}>
                        <div className="form-group">
                            <label>Valor Desejado (R$)</label>
                            <input
                                type="number"
                                placeholder="0,00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group" style={{ marginTop: '1.5rem' }}>
                            <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Número de Parcelas</span>
                                <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{installments}x</span>
                            </label>
                            <input
                                type="range"
                                min="1"
                                max="24"
                                value={installments}
                                onChange={(e) => setInstallments(parseInt(e.target.value))}
                                style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--primary)' }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                <span>1x</span>
                                <span>12x</span>
                                <span>24x</span>
                            </div>
                        </div>

                        {amount && parseFloat(amount) > 0 && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                style={{ marginTop: '1.5rem', padding: '1.25rem', borderRadius: '1rem', border: '1px dotted var(--border)', background: 'rgba(255,255,255,0.02)' }}
                            >
                                <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Custo Efetivo Total (CET)</h4>

                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Taxa Mensal:</span>
                                    <span style={{ fontWeight: '600', color: 'var(--success)' }}>{currentRate.toFixed(2)}%</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>{installments} parcelas de:</span>
                                    <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>R$ {installmentAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
                                    <span style={{ fontWeight: 'bold' }}>Total a pagar:</span>
                                    <span style={{ fontWeight: 'bold', color: 'var(--warning)' }}>R$ {totalToPay.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                </div>
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={requesting || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > (account?.credit_limit || 0)}
                            style={{ width: '100%', marginTop: '2rem', padding: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem' }}
                        >
                            {requesting ? 'Processando...' : (
                                <>
                                    <CheckCircle size={20} /> Confirmar Empréstimo
                                </>
                            )}
                        </button>
                    </form>
                </motion.div>

                {/* History Side */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: 'var(--success)' }}>
                        <History size={24} />
                        <h2 style={{ margin: 0 }}>Meus Contratos</h2>
                    </div>

                    <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                        {loans.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                                <Banknote size={48} style={{ color: 'var(--border)', marginBottom: '1rem' }} />
                                <p style={{ color: 'var(--text-muted)' }}>Nenhum contrato ativo.</p>
                            </div>
                        ) : (
                            loans.map(loan => (
                                <div key={loan.id} style={{ padding: '1.25rem', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.01)', borderRadius: '0.5rem', marginBottom: '0.75rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                                <Layers size={14} className="text-primary" />
                                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>CONTRATO #{loan.id}</span>
                                            </div>
                                            <p style={{ margin: 0, fontWeight: '700', fontSize: '1.2rem' }}>
                                                R$ {Number(loan.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </p>
                                        </div>
                                        <div style={{
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '2rem',
                                            fontSize: '0.65rem',
                                            fontWeight: 'bold',
                                            background: loan.status === 'active' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.1)',
                                            color: loan.status === 'active' ? 'var(--success)' : 'var(--text-muted)',
                                        }}>
                                            {loan.status === 'active' ? 'EM DIA' : 'QUITADO'}
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
                                        <div style={{ color: 'var(--text-muted)' }}>
                                            <p style={{ margin: '0 0 0.25rem 0' }}>Parcelamento:</p>
                                            <p style={{ margin: 0, color: 'var(--text-main)', fontWeight: '600' }}>{loan.installments}x de R$ {Number(loan.installment_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                        </div>
                                        <div style={{ color: 'var(--text-muted)', textAlign: 'right' }}>
                                            <p style={{ margin: '0 0 0.25rem 0' }}>Total a pagar:</p>
                                            <p style={{ margin: 0, color: 'var(--warning)', fontWeight: '600' }}>R$ {Number(loan.total_to_pay).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                        </div>
                                    </div>

                                    <div style={{ marginTop: '1rem', fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <Calendar size={12} /> Contratado em {new Date(loan.timestamp).toLocaleDateString('pt-BR')} às {new Date(loan.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

// Simple Calendar icon hack since I missed importing it
const Calendar = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
);

export default Loan;
