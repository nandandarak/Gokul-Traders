import React, { useState } from 'react';
import { useECommerce } from '../context/ECommerceContext';
import { 
  LayoutDashboard, ShoppingBag, BarChart3, Users, 
  Layers, FileText, Percent, MessageSquare, ShieldAlert,
  Bell, Sun, Moon, Languages, UserCheck, ExternalLink, HelpCircle,
  LogOut
} from 'lucide-react';

interface AdminLayoutProps {
  currentTab: string;
  setTab: (tab: string) => void;
  setView: (view: 'admin' | 'user') => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ currentTab, setTab, setView, children }) => {
  const { 
    notifications, 
    markNotificationsAsRead, 
    clearNotifications,
    currentRole, 
    setRole, 
    language, 
    setLanguage, 
    darkMode, 
    setDarkMode,
    logout
  } = useECommerce();

  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Super Admin', 'Manager', 'Staff'] },
    { id: 'products', label: 'Products', icon: ShoppingBag, roles: ['Super Admin', 'Manager', 'Staff'] },
    { id: 'inventory', label: 'Inventory', icon: BarChart3, roles: ['Super Admin', 'Manager', 'Staff'] },
    { id: 'orders', label: 'Orders', icon: FileText, roles: ['Super Admin', 'Manager', 'Staff'] },
    { id: 'customers', label: 'Customers', icon: Users, roles: ['Super Admin', 'Manager'] },
    { id: 'categories', label: 'Categories', icon: Layers, roles: ['Super Admin', 'Manager'] },
    { id: 'content', label: 'Content Manager', icon: FileText, roles: ['Super Admin', 'Manager'] },
    { id: 'coupons', label: 'Coupons', icon: Percent, roles: ['Super Admin'] },
    { id: 'reviews', label: 'Reviews Moderation', icon: MessageSquare, roles: ['Super Admin', 'Manager'] },
    { id: 'logs', label: 'Audit Trail', icon: ShieldAlert, roles: ['Super Admin'] },
  ];

  // Filters menu by active role
  const allowedItems = menuItems.filter(item => item.roles.includes(currentRole));

  // Language translation dictionary
  const t = {
    en: { title: 'Portal Admin', hello: 'Hello, Admin', viewStore: 'View Store', logout: 'Logout' },
    es: { title: 'Portal Admin', hello: 'Hola, Admin', viewStore: 'Ver Tienda', logout: 'Cerrar sesión' },
    hi: { title: 'प्रशासक पोर्टल', hello: 'नमस्ते, एडमिन', viewStore: 'स्टोर देखें', logout: 'लॉगआउट' }
  }[language];

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-icon">G</div>
          <div>
            <h1 className="logo-text">Gokul</h1>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
              {t.title}
            </span>
          </div>
        </div>

        <nav className="sidebar-menu">
          {allowedItems.map(item => {
            const IconComponent = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`menu-item ${isActive ? 'active' : ''}`}
                style={{ background: isActive ? undefined : 'none', border: 'none', width: '100%', textAlign: 'left' }}
              >
                <IconComponent size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button 
            className="btn btn-secondary"
            onClick={() => setView('user')}
            style={{ width: '100%', display: 'flex', gap: '8px', fontSize: '13px' }}
          >
            <ExternalLink size={14} />
            <span>{t.viewStore}</span>
          </button>
          
          <button 
            className="btn btn-secondary"
            onClick={logout}
            style={{ width: '100%', display: 'flex', gap: '8px', fontSize: '13px', marginTop: '8px', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.15)' }}
          >
            <LogOut size={14} />
            <span>{t.logout}</span>
          </button>
          
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '4px' }}>
            Gokul Traders Suite v1.2
          </div>
        </div>
      </aside>

      {/* Main Panel Shell */}
      <div className="main-content" style={{ display: 'flex', flexDirection: 'column', padding: 0 }}>
        {/* Top Navbar */}
        <header className="header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 700, fontSize: '16px', color: 'var(--text-secondary)' }}>
              {t.hello}
            </span>
            <span className="badge badge-info" style={{ fontSize: '10px' }}>
              {currentRole}
            </span>
          </div>

          <div className="header-actions">
            {/* Active Switcher role */}
            <div style={{ position: 'relative' }}>
              <button 
                className="action-btn" 
                onClick={() => { setShowRoleMenu(!showRoleMenu); setShowNotifMenu(false); setShowLangMenu(false); }}
                title="Switch Access Role"
              >
                <UserCheck size={20} />
              </button>
              {showRoleMenu && (
                <div className="glass-card" style={{ position: 'absolute', right: 0, top: '48px', padding: '8px', minWidth: '150px', zIndex: 120 }}>
                  <p style={{ fontSize: '11px', fontWeight: 700, padding: '4px 8px', color: 'var(--text-muted)' }}>SELECT ROLE</p>
                  {(['Super Admin', 'Manager', 'Staff'] as const).map(role => (
                    <button
                      key={role}
                      onClick={() => { setRole(role); setShowRoleMenu(false); }}
                      className="btn"
                      style={{ 
                        width: '100%', 
                        justifyContent: 'flex-start',
                        padding: '8px',
                        fontSize: '13px',
                        background: currentRole === role ? 'var(--primary-light)' : 'transparent',
                        color: currentRole === role ? 'var(--primary)' : 'var(--text-primary)'
                      }}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Language Selector */}
            <div style={{ position: 'relative' }}>
              <button 
                className="action-btn" 
                onClick={() => { setShowLangMenu(!showLangMenu); setShowNotifMenu(false); setShowRoleMenu(false); }}
                title="Change Language"
              >
                <Languages size={20} />
              </button>
              {showLangMenu && (
                <div className="glass-card" style={{ position: 'absolute', right: 0, top: '48px', padding: '8px', minWidth: '120px', zIndex: 120 }}>
                  {[
                    { code: 'en', name: 'English' },
                    { code: 'es', name: 'Español' },
                    { code: 'hi', name: 'हिन्दी' }
                  ].map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => { setLanguage(lang.code as any); setShowLangMenu(false); }}
                      className="btn"
                      style={{ 
                        width: '100%', 
                        justifyContent: 'flex-start',
                        padding: '8px',
                        fontSize: '13px',
                        background: language === lang.code ? 'var(--primary-light)' : 'transparent',
                        color: language === lang.code ? 'var(--primary)' : 'var(--text-primary)'
                      }}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Dark Mode toggle */}
            <button 
              className="action-btn" 
              onClick={() => setDarkMode(!darkMode)}
              title="Toggle Light/Dark Theme"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Notification bell dropdown */}
            <div style={{ position: 'relative' }}>
              <button 
                className="action-btn" 
                onClick={() => { setShowNotifMenu(!showNotifMenu); setShowRoleMenu(false); setShowLangMenu(false); }}
                title="System Notifications"
              >
                <Bell size={20} />
                {unreadCount > 0 && <span className="badge-count">{unreadCount}</span>}
              </button>
              
              {showNotifMenu && (
                <div className="glass-card" style={{ position: 'absolute', right: 0, top: '48px', width: '320px', padding: '16px', zIndex: 120, maxHeight: '400px', overflowY: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h4 style={{ fontSize: '14px' }}>Notifications</h4>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={markNotificationsAsRead} className="btn" style={{ fontSize: '11px', padding: '2px 6px', background: 'none', color: 'var(--primary)' }}>Read All</button>
                      <button onClick={clearNotifications} className="btn" style={{ fontSize: '11px', padding: '2px 6px', background: 'none', color: 'var(--danger)' }}>Clear</button>
                    </div>
                  </div>
                  
                  {notifications.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '12px', textAlign: 'center', padding: '12px' }}>No system alerts.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {notifications.map(notif => (
                        <div 
                          key={notif.id} 
                          style={{ 
                            padding: '10px', 
                            borderRadius: '6px', 
                            backgroundColor: notif.read ? 'transparent' : 'var(--primary-light)',
                            border: '1px solid var(--border-color)',
                            fontSize: '12px'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, marginBottom: '2px' }}>
                            <span style={{ 
                              color: notif.type === 'order' ? 'var(--success)' : notif.type === 'stock' ? 'var(--warning)' : 'var(--primary)'
                            }}>
                              {notif.title}
                            </span>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 400 }}>
                              {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.4' }}>{notif.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Main Area Content */}
        <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
};
