import React, { useState } from 'react';
import { useECommerce } from '../context/ECommerceContext';
import { ShieldAlert, KeyRound, Mail, Eye, EyeOff, Sparkles, ExternalLink, ArrowRight } from 'lucide-react';

interface LoginProps {
  onBackToStore: () => void;
}

export const Login: React.FC<LoginProps> = ({ onBackToStore }) => {
  const { login } = useECommerce();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Short timeout to simulate authentication lookup & look highly premium
    setTimeout(() => {
      const success = login(email, password);
      setIsLoading(false);
      if (!success) {
        setError('Invalid credentials. Please verify your email and password.');
      }
    }, 800);
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      login(demoEmail, demoPass);
      setIsLoading(false);
    }, 400);
  };

  const demoAccounts = [
    { email: 'admin@gokultraders.com', pass: 'admin123', label: 'Super Admin', desc: 'Full root clearance', color: 'var(--success)' },
    { email: 'manager@gokultraders.com', pass: 'manager123', label: 'Manager', desc: 'Catalog & Orders control', color: 'var(--info)' },
    { email: 'staff@gokultraders.com', pass: 'staff123', label: 'Staff', desc: 'Viewer & workflow access', color: 'var(--warning)' }
  ];

  return (
    <div 
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        width: '100vw',
        padding: '24px',
        backgroundColor: 'var(--bg-primary)',
        backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.08) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(168, 85, 247, 0.08) 0%, transparent 40%)',
        animation: 'fadeIn 0.5s ease-out'
      }}
    >
      <div 
        className="glass-card" 
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '40px 32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.1)',
          borderRadius: '16px',
          border: '1px solid var(--border-color)',
          background: 'var(--bg-glass)'
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <div 
            className="logo-icon" 
            style={{ 
              width: '50px', 
              height: '50px', 
              fontSize: '24px', 
              borderRadius: '12px',
              background: 'var(--primary-gradient)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              boxShadow: '0 8px 16px -4px rgba(99, 102, 241, 0.3)',
              marginBottom: '4px'
            }}
          >
            G
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
            Gokul Traders Console
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>
            Enter administrator credentials to proceed
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && (
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: 'var(--danger-light)',
                border: '1px solid var(--danger)',
                color: 'var(--danger)',
                fontSize: '12.5px',
                fontWeight: 500,
                animation: 'shake 0.3s ease-in-out'
              }}
            >
              <ShieldAlert size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Mail size={14} style={{ color: 'var(--text-muted)' }} />
              <span>Email Address</span>
            </label>
            <input 
              type="email"
              placeholder="admin@gokultraders.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              style={{ 
                height: '46px',
                fontSize: '14px',
                paddingLeft: '14px',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '8px'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <KeyRound size={14} style={{ color: 'var(--text-muted)' }} />
              <span>Security Password</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                style={{ 
                  height: '46px',
                  fontSize: '14px',
                  paddingLeft: '14px',
                  paddingRight: '44px',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: '8px',
                  width: '100%'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isLoading}
            style={{ 
              height: '46px', 
              width: '100%', 
              fontSize: '14px', 
              marginTop: '8px',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)',
              position: 'relative'
            }}
          >
            {isLoading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="spinner" style={{
                  width: '14px',
                  height: '14px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderTopColor: '#ffffff',
                  borderRadius: '50%',
                  animation: 'spin 0.6s linear infinite'
                }}></span>
                <span>Authenticating...</span>
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>Access Dashboard</span>
                <ArrowRight size={15} />
              </span>
            )}
          </button>
        </form>

        {/* Separator */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '8px 0' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
          <span style={{ padding: '0 12px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Quick Demo Logins
          </span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
        </div>

        {/* Demo Quick Logins */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {demoAccounts.map((acc, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleQuickLogin(acc.email, acc.pass)}
              disabled={isLoading}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 16px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-secondary)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'var(--transition)',
                width: '100%'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = acc.color;
                e.currentTarget.style.backgroundColor = 'var(--primary-light)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span 
                  className="badge" 
                  style={{ 
                    backgroundColor: acc.color + '18', 
                    color: acc.color,
                    fontSize: '9px',
                    padding: '2px 6px'
                  }}
                >
                  {acc.label}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  {acc.desc}
                </span>
              </div>
              <Sparkles size={12} style={{ color: acc.color, opacity: 0.7 }} />
            </button>
          ))}
        </div>

        {/* Footer Link */}
        <div style={{ textAlign: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '4px' }}>
          <button
            onClick={onBackToStore}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'var(--transition)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
            onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
          >
            <ExternalLink size={14} />
            <span>Browse Storefront as Guest Customer</span>
          </button>
        </div>
      </div>

      {/* Embedded CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .spinner {
          display: inline-block;
        }
      `}</style>
    </div>
  );
};
