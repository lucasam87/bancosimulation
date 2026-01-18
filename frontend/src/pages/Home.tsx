import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ShieldCheck,
    Zap,
    TrendingUp,
    Smartphone,
    ArrowRight,
    ChevronRight,
    Globe,
    CreditCard
} from 'lucide-react';

const Home: React.FC = () => {
    return (
        <div style={{ minHeight: '100vh', overflowX: 'hidden' }}>
            {/* Header / Navbar */}
            <nav style={{
                padding: '1.5rem 2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                maxWidth: '1200px',
                margin: '0 auto'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ background: 'var(--primary)', padding: '0.5rem', borderRadius: '0.75rem', color: '#fff' }}>
                        <ShieldCheck size={24} />
                    </div>
                    <span style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.5px' }}>Retrograde</span>
                </div>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <Link to="/login" style={{ color: 'var(--text)', textDecoration: 'none', fontWeight: '500' }}>Login</Link>
                    <Link to="/register" className="btn" style={{
                        padding: '0.6rem 1.2rem',
                        borderRadius: '0.75rem',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid var(--border)',
                        color: '#fff',
                        textDecoration: 'none'
                    }}>
                        Abrir Conta
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section style={{
                padding: '8rem 2rem 4rem',
                textAlign: 'center',
                maxWidth: '900px',
                margin: '0 auto',
                position: 'relative'
            }}>
                {/* Background Glows */}
                <div style={{
                    position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
                    width: '300px', height: '300px', background: 'var(--primary)', filter: 'blur(120px)',
                    opacity: 0.15, zIndex: -1
                }} />

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.5rem 1rem', borderRadius: '2rem', background: 'rgba(249, 115, 22, 0.1)',
                        color: 'var(--primary)', fontSize: '0.85rem', fontWeight: '600', marginBottom: '2rem',
                        border: '1px solid rgba(249, 115, 22, 0.2)'
                    }}>
                        <Globe size={14} /> O futuro das finanças chegou
                    </div>
                    <h1 style={{ fontSize: '5rem', lineHeight: '0.9', marginBottom: '1.5rem', fontWeight: '900', letterSpacing: '-3px' }}>
                        Seu dinheiro em <span style={{ color: 'var(--primary)' }}>nova órbita.</span>
                    </h1>
                    <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
                        Uma experiência bancária completa, segura e 100% digital. Gerencie seu patrimônio com a tecnologia que você merece.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                        <Link to="/register" style={{
                            padding: '1.2rem 2.5rem', fontSize: '1.1rem', borderRadius: '1rem',
                            background: 'var(--primary)', color: '#fff', textDecoration: 'none',
                            fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.75rem',
                            boxShadow: '0 20px 40px rgba(249, 115, 22, 0.3)'
                        }} className="hero-btn">
                            Começar agora <ArrowRight size={20} />
                        </Link>
                    </div>
                </motion.div>
            </section>

            {/* Features Grid */}
            <section style={{ padding: '6rem 2rem', maxWidth: '1100px', margin: '0 auto' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '2rem'
                }}>
                    {[
                        { icon: <Zap />, title: 'Pix Instantâneo', desc: 'Envie e receba dinheiro em segundos, 24/7 sem taxas escondidas.' },
                        { icon: <TrendingUp />, title: 'Investimentos', desc: 'Acompanhe seu patrimônio evoluir com gráficos dinâmicos e precisos.' },
                        { icon: <CreditCard />, title: 'Cartão Virtual', desc: 'Gere cartões para compras online com segurança total em um clique.' },
                        { icon: <Smartphone />, title: 'Mobile First', desc: 'Toda a gestão do seu banco no controle do seu celular.' }
                    ].map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            viewport={{ once: true }}
                            className="card"
                            style={{ padding: '2.5rem', textAlign: 'left', border: '1px solid var(--border)' }}
                        >
                            <div style={{
                                background: 'rgba(255,255,255,0.03)', width: '48px', height: '48px',
                                borderRadius: '1rem', display: 'flex', justifyContent: 'center',
                                alignItems: 'center', marginBottom: '1.5rem', color: 'var(--primary)'
                            }}>
                                {feature.icon}
                            </div>
                            <h3 style={{ marginBottom: '0.75rem', fontSize: '1.25rem' }}>{feature.title}</h3>
                            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', margin: 0 }}>{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer style={{
                padding: '4rem 2rem', borderTop: '1px solid var(--border)', textAlign: 'center',
                color: 'var(--text-muted)', fontSize: '0.9rem'
            }}>
                <div style={{ marginBottom: '1.5rem', color: 'var(--text)' }}>
                    <strong>Retrograde</strong> Banking System © 2026
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem' }}>
                    <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Termos</a>
                    <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Privacidade</a>
                    <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Ajuda</a>
                </div>
            </footer>

            <style>{`
                .hero-btn:hover {
                    filter: brightness(1.1);
                    transform: translateY(-2px);
                    transition: all 0.3s ease;
                }
            `}</style>
        </div>
    );
};

export default Home;
