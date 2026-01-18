import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowUpRight,
    ArrowDownLeft,
    LogOut,
    Wallet,
    History,
    TrendingUp,
    SendHorizontal,
    X,
    LayoutDashboard,
    PieChart as PieIcon,
    ArrowUpCircle,
    ArrowDownCircle,
    Sparkles,
    ShieldCheck,
    Banknote
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';

interface Account {
    number: string;
    balance: number;
    credit_limit: number;
    score?: number;
}

interface Transaction {
    id: number;
    type: string;
    category: string;
    amount: number;
    timestamp: string;
    balance_after: number;
}

interface Loan {
    id: number;
    amount: number;
    total_to_pay: number;
    status: string;
}

const CATEGORIES = ['Alimentação', 'Transporte', 'Lazer', 'Saúde', 'Educação', 'Contas', 'Outros'];
const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'];

const Dashboard: React.FC = () => {
    const { signOut } = useAuth();
    const [account, setAccount] = useState<Account | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loans, setLoans] = useState<Loan[]>([]);
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('Outros');
    const [loading, setLoading] = useState(true);
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [destAccount, setDestAccount] = useState('');
    const [transferAmount, setTransferAmount] = useState('');

    const fetchData = async () => {
        try {
            const [accRes, transRes, loanRes] = await Promise.all([
                api.get('/accounts/me'),
                api.get('/transactions/statement'),
                api.get('/loans/list')
            ]);
            setAccount(accRes.data);
            setTransactions(transRes.data);
            setLoans(loanRes.data);
        } catch (error) {
            toast.error('Erro ao carregar dados');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const totalDebt = loans.reduce((acc, l) => acc + (l.status === 'active' ? Number(l.total_to_pay) : 0), 0);
    const netWorth = (account?.balance || 0) - totalDebt;

    // Prepare chart data with Net Worth calculation
    let runningDebt = totalDebt;
    const chartData = [...transactions]
        .map(t => {
            const point = {
                time: new Date(t.timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                balance: Number(t.balance_after),
                netWorth: Number(t.balance_after) - runningDebt
            };
            // Going backwards: if this was a loan deposit, before it the debt was lower
            if (t.category === 'Empréstimo' && t.type === 'deposit') {
                runningDebt -= Number(t.amount);
            }
            return point;
        })
        .reverse();

    if (chartData.length === 0 && account) {
        chartData.push({ time: 'Início', balance: 0, netWorth: 0 }, { time: 'Hoje', balance: Number(account.balance), netWorth: netWorth });
    }

    // Category Spending Data
    const categoryData = transactions
        .filter(t => t.type === 'withdraw' || t.type === 'transfer_out')
        .reduce((acc, current) => {
            const found = acc.find(item => item.name === current.category);
            if (found) {
                found.value += Number(current.amount);
            } else {
                acc.push({ name: current.category, value: Number(current.amount) });
            }
            return acc;
        }, [] as { name: string, value: number }[]);

    // Monthly Summary
    const totals = transactions.reduce((acc, t) => {
        const val = Number(t.amount);
        if (t.type === 'deposit' || t.type === 'transfer_in') acc.income += val;
        else acc.expense += val;
        return acc;
    }, { income: 0, expense: 0 });

    const handleTransaction = async (type: 'deposit' | 'withdraw') => {
        const val = parseFloat(amount);
        if (!val || val <= 0) {
            toast.error('Insira um valor válido');
            return;
        }

        const toastId = toast.loading('Processando...');

        try {
            await api.post(`/transactions/${type}`, {
                amount: val,
                type: type,
                category: type === 'deposit' ? 'Depósito' : category
            });
            setAmount('');
            setCategory('Outros');
            await fetchData();
            toast.success(type === 'deposit' ? 'Depósito realizado!' : 'Saque realizado!', { id: toastId });
        } catch (err: any) {
            toast.error(err.response?.data?.detail || 'Erro na operação', { id: toastId });
        }
    };

    const handleTransfer = async () => {
        const val = parseFloat(transferAmount);
        if (!val || val <= 0 || !destAccount) {
            toast.error('Preencha os dados corretamente');
            return;
        }

        const toastId = toast.loading('Processando transferência...');

        try {
            await api.post('/transactions/transfer', {
                destination_account: destAccount,
                amount: val,
                category: 'Transferência'
            });
            setTransferAmount('');
            setDestAccount('');
            setShowTransferModal(false);
            await fetchData();
            toast.success('Transferência realizada com sucesso!', { id: toastId });
        } catch (err: any) {
            toast.error(err.response?.data?.detail || 'Erro na transferência', { id: toastId });
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#6366f1' }}>
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
                <TrendingUp size={48} />
            </motion.div>
        </div>
    );

    return (
        <div className="container">
            <Toaster position="top-right" />

            <AnimatePresence>
                {showTransferModal && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                        background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center',
                        alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(8px)'
                    }}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="card"
                            style={{ width: '100%', maxWidth: '400px', margin: '1rem', position: 'relative' }}
                        >
                            <button
                                onClick={() => setShowTransferModal(false)}
                                style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', padding: '0.5rem' }}
                            >
                                <X size={20} />
                            </button>
                            <h2>Transferência PIX</h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Envie dinheiro para outra conta instantaneamente.</p>

                            <div className="form-group">
                                <label>Número da Conta Destino</label>
                                <input
                                    type="text"
                                    placeholder="Ex: 12345"
                                    value={destAccount}
                                    onChange={(e) => setDestAccount(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>Valor (R$)</label>
                                <input
                                    type="number"
                                    placeholder="0,00"
                                    value={transferAmount}
                                    onChange={(e) => setTransferAmount(e.target.value)}
                                />
                            </div>
                            <button onClick={handleTransfer} style={{ width: '100%', marginTop: '1rem' }}>
                                Confirmar Transferência
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}
            >
                <div>
                    <h1 style={{ margin: 0 }}>Bankofthe Dashboard</h1>
                    <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0 0' }}>Sua saúde financeira em um só lugar.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Link to="/credit" style={{ textDecoration: 'none' }}>
                        <button style={{ background: 'rgba(139, 92, 246, 0.2)', color: '#a78bfa', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                            <Sparkles size={18} /> Crédito
                        </button>
                    </Link>
                    <Link to="/loans" style={{ textDecoration: 'none' }}>
                        <button style={{ background: 'rgba(52, 211, 153, 0.2)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.3)' }}>
                            <Banknote size={18} /> Empréstimo
                        </button>
                    </Link>
                    <Link to="/card" style={{ textDecoration: 'none' }}>
                        <button style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                            <Banknote size={18} /> Cartão
                        </button>
                    </Link>
                    <button onClick={() => setShowTransferModal(true)} style={{ background: 'var(--primary)' }}>
                        <SendHorizontal size={18} /> Transferir
                    </button>
                    <button onClick={signOut} className="btn-danger" style={{ backgroundColor: 'transparent', border: '1px solid var(--border)' }}>
                        <LogOut size={18} /> Sair
                    </button>
                </div>
            </motion.header>

            {/* Top Cards Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)', padding: '0.75rem', borderRadius: '1rem' }}>
                        <ArrowUpCircle size={28} />
                    </div>
                    <div>
                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Entradas</p>
                        <h3 style={{ margin: 0, color: 'var(--success)' }}>R$ {totals.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                    </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--warning)', padding: '0.75rem', borderRadius: '1rem' }}>
                        <ArrowDownCircle size={28} />
                    </div>
                    <div>
                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Saídas</p>
                        <h3 style={{ margin: 0, color: 'var(--warning)' }}>R$ {totals.expense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                    </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)', padding: '0.75rem', borderRadius: '1rem' }}>
                        <Wallet size={28} />
                    </div>
                    <div>
                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Saldo Atual</p>
                        <h3 style={{ margin: 0 }}>R$ {Number(account?.balance || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                    </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.75rem', borderRadius: '1rem' }}>
                        <Banknote size={28} />
                    </div>
                    <div>
                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Dívidas</p>
                        <h3 style={{ margin: 0, color: '#ef4444' }}>R$ {totalDebt.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                    </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(16, 185, 129, 0.1))' }}>
                    <div style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#fff', padding: '0.75rem', borderRadius: '1rem' }}>
                        <TrendingUp size={28} />
                    </div>
                    <div>
                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Patrimônio Líquido</p>
                        <h3 style={{ margin: 0, color: netWorth >= 0 ? 'var(--success)' : 'var(--warning)' }}>R$ {netWorth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '0.75rem', borderRadius: '1rem' }}>
                        <ShieldCheck size={28} />
                    </div>
                    <div>
                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Score Atual</p>
                        <h3 style={{ margin: 0, color: 'var(--success)' }}>{account?.score || 0}</h3>
                    </div>
                </motion.div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                <motion.div
                    className="card"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{ padding: '1.5rem' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <LayoutDashboard size={20} color="var(--primary)" />
                        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Evolução do Patrimônio</h2>
                    </div>
                    <div style={{ width: '100%', height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={12} />
                                <YAxis stroke="var(--text-muted)" fontSize={12} tickFormatter={(v) => `R$ ${v}`} />
                                <Tooltip
                                    contentStyle={{ background: '#1e293b', border: '1px solid var(--border)', borderRadius: '0.75rem' }}
                                    formatter={(v: any) => [`R$ ${Number(v).toLocaleString('pt-BR')}`]}
                                />
                                <Legend verticalAlign="top" height={36} />
                                <Area name="Saldo Bruto" type="monotone" dataKey="balance" stroke="#6366f1" fillOpacity={1} fill="url(#colorBalance)" />
                                <Area name="Patrimônio Líquido" type="monotone" dataKey="netWorth" stroke="#10b981" fillOpacity={1} fill="url(#colorNetWorth)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                <motion.div
                    className="card"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    style={{ padding: '1.5rem' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <PieIcon size={20} color="var(--primary)" />
                        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Gastos por Categoria</h2>
                    </div>
                    <div style={{ width: '100%', height: '230px' }}>
                        {categoryData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                Sem dados de gastos
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
                <motion.div
                    className="card"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <Wallet size={24} color="var(--primary)" />
                        <h2 style={{ margin: 0 }}>Ações Rápidas</h2>
                    </div>

                    <div className="form-group">
                        <label>Valor</label>
                        <input
                            type="number"
                            placeholder="0,00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label>Categoria (para saques)</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '0.5rem',
                                background: 'rgba(255,255,255,0.05)',
                                color: '#fff',
                                border: '1px solid var(--border)',
                                outline: 'none'
                            }}
                        >
                            {CATEGORIES.map(cat => <option key={cat} value={cat} style={{ background: '#111' }}>{cat}</option>)}
                        </select>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                        <button onClick={() => handleTransaction('deposit')} style={{ flex: 1, background: 'var(--success)' }}>
                            Depósito
                        </button>
                        <button onClick={() => handleTransaction('withdraw')} style={{ flex: 1, background: 'var(--warning)' }}>
                            Saque
                        </button>
                    </div>

                    <p style={{ marginTop: '2rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Conta: {account?.number}</p>
                </motion.div>

                <motion.div
                    className="card"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <History size={24} color="var(--success)" />
                        <h2 style={{ margin: 0 }}>Histórico</h2>
                    </div>

                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {transactions.map((t) => (
                            <div
                                key={t.id}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '1rem 0',
                                    borderBottom: '1px solid var(--border)'
                                }}
                            >
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <div style={{
                                        color: (t.type === 'deposit' || t.type === 'transfer_in') ? 'var(--success)' : 'var(--warning)',
                                        background: (t.type === 'deposit' || t.type === 'transfer_in') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                        padding: '0.5rem',
                                        borderRadius: '0.5rem'
                                    }}>
                                        {(t.type === 'deposit' || t.type === 'transfer_in') ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                                    </div>
                                    <div>
                                        <p style={{ margin: 0, fontWeight: '600', fontSize: '0.95rem' }}>{t.category}</p>
                                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(t.timestamp).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ margin: 0, fontWeight: '700', color: (t.type === 'deposit' || t.type === 'transfer_in') ? 'var(--success)' : 'var(--warning)' }}>
                                        {(t.type === 'deposit' || t.type === 'transfer_in') ? '+' : '-'} R$ {Number(t.amount).toFixed(2)}
                                    </p>
                                    <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)' }}>Pos: R$ {Number(t.balance_after).toFixed(2)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Dashboard;
