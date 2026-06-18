import React, { useState } from 'react';
import { useECommerce } from '../context/ECommerceContext';
import { 
  TrendingUp, ShoppingBag, DollarSign, AlertTriangle, 
  Clock, ArrowUpRight, ArrowDownRight, Package, UserPlus, ShieldAlert
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { products, orders, auditLogs, language } = useECommerce();

  // Computations
  const totalProducts = products.length;
  const totalOrders = orders.length;
  const activeOrders = orders.filter(o => o.status !== 'Cancelled');
  const totalRevenue = activeOrders.reduce((sum, o) => sum + o.total, 0);
  const lowStockCount = products.filter(p => p.stock <= 5).length;
  const pendingOrdersCount = orders.filter(o => o.status === 'New' || o.status === 'Processing').length;

  // Language translation dictionary
  const t = {
    en: {
      stats: 'Overview Statistics',
      revenue: 'Total Revenue',
      orders: 'Total Orders',
      products: 'Total Products',
      lowStock: 'Low Stock Alerts',
      pending: 'Pending Orders',
      revTrend: 'Revenue Performance (Last 6 Months)',
      orderTrend: 'Order Analytics (Volume)',
      bestSellers: 'Best Selling Products',
      recentActivity: 'Recent Audit Logs',
      alerts: 'Inventory Alerts',
      price: 'Price',
      stock: 'Stock',
      action: 'Action'
    },
    es: {
      stats: 'Estadísticas Generales',
      revenue: 'Ingresos Totales',
      orders: 'Pedidos Totales',
      products: 'Productos Totales',
      lowStock: 'Alertas de Stock Bajo',
      pending: 'Pedidos Pendientes',
      revTrend: 'Rendimiento de Ingresos (Últimos 6 Meses)',
      orderTrend: 'Análisis de Pedidos (Volumen)',
      bestSellers: 'Productos Más Vendidos',
      recentActivity: 'Registros de Auditoría Recientes',
      alerts: 'Alertas de Inventario',
      price: 'Precio',
      stock: 'Inventario',
      action: 'Acción'
    },
    hi: {
      stats: 'सांख्यिकी अवलोकन',
      revenue: 'कुल राजस्व',
      orders: 'कुल ऑर्डर',
      products: 'कुल उत्पाद',
      lowStock: 'कम स्टॉक अलर्ट',
      pending: 'लंबित ऑर्डर',
      revTrend: 'राजस्व प्रदर्शन (पिछले 6 महीने)',
      orderTrend: 'ऑर्डर विश्लेषिकी (मात्रा)',
      bestSellers: 'सबसे अधिक बिकने वाले उत्पाद',
      recentActivity: 'हालिया ऑडिट लॉग',
      alerts: 'इन्वेंटरी अलर्ट',
      price: 'कीमत',
      stock: 'स्टॉक',
      action: 'कार्रवाई'
    }
  }[language];

  // SVG Chart Mock Data coordinates
  // Revenue: Jan: 12k, Feb: 19k, Mar: 15k, Apr: 28k, May: 22k, Jun: 35k
  const revenueData = [12000, 19000, 15000, 28000, 22000, totalRevenue > 0 ? totalRevenue / 10 : 35000];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  
  // Custom SVG path generator for Line Chart
  const lineChartWidth = 500;
  const lineChartHeight = 200;
  const padding = 20;
  
  const getPointsPath = () => {
    const maxVal = Math.max(...revenueData) * 1.15;
    const points = revenueData.map((val, idx) => {
      const x = padding + (idx * (lineChartWidth - padding * 2)) / (revenueData.length - 1);
      const y = lineChartHeight - padding - (val / maxVal) * (lineChartHeight - padding * 2);
      return { x, y };
    });
    
    // Create bezier curve
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i];
      const next = points[i + 1];
      const cpX1 = curr.x + (next.x - curr.x) / 2;
      const cpY1 = curr.y;
      const cpX2 = curr.x + (next.x - curr.x) / 2;
      const cpY2 = next.y;
      d += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${next.x} ${next.y}`;
    }
    return d;
  };

  const getAreaPath = (linePath: string) => {
    return `${linePath} L ${lineChartWidth - padding} ${lineChartHeight - padding} L ${padding} ${lineChartHeight - padding} Z`;
  };

  const [hoveredPoint, setHoveredPoint] = useState<{ x: number, y: number, value: number, label: string } | null>(null);

  // Bar Chart Data (Orders by status)
  const barData = [
    { label: 'New', count: orders.filter(o => o.status === 'New').length, color: 'var(--primary)' },
    { label: 'Process', count: orders.filter(o => o.status === 'Processing').length, color: 'var(--info)' },
    { label: 'Ship', count: orders.filter(o => o.status === 'Shipped').length, color: 'var(--warning)' },
    { label: 'Deliver', count: orders.filter(o => o.status === 'Delivered').length, color: 'var(--success)' },
    { label: 'Cancel', count: orders.filter(o => o.status === 'Cancelled').length, color: 'var(--danger)' }
  ];
  const maxBarCount = Math.max(...barData.map(b => b.count), 4);

  // Filter low stock products
  const lowStockProducts = products.filter(p => p.stock <= 5);

  return (
    <div style={{ animation: 'slideIn 0.3s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>{t.stats}</h2>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
          Updated Real-Time
        </span>
      </div>

      {/* KPI Cards Grid */}
      <div className="dashboard-grid">
        <div className="glass-card kpi-card">
          <div>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>{t.revenue}</span>
            <h3 style={{ fontSize: '24px', marginTop: '6px' }}>
              ₹{totalRevenue.toLocaleString('en-IN')}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--success)', marginTop: '4px', fontWeight: 600 }}>
              <TrendingUp size={12} />
              <span>+18.4% this month</span>
            </div>
          </div>
          <div className="kpi-icon" style={{ backgroundColor: 'var(--success-light)', color: 'var(--success)' }}>
            <DollarSign size={24} />
          </div>
        </div>

        <div className="glass-card kpi-card">
          <div>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>{t.orders}</span>
            <h3 style={{ fontSize: '24px', marginTop: '6px' }}>{totalOrders}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--success)', marginTop: '4px', fontWeight: 600 }}>
              <TrendingUp size={12} />
              <span>+10.2% vs yesterday</span>
            </div>
          </div>
          <div className="kpi-icon" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
            <ShoppingBag size={24} />
          </div>
        </div>

        <div className="glass-card kpi-card">
          <div>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>{t.lowStock}</span>
            <h3 style={{ fontSize: '24px', marginTop: '6px', color: lowStockCount > 0 ? 'var(--danger)' : 'inherit' }}>
              {lowStockCount}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: lowStockCount > 0 ? 'var(--danger)' : 'var(--text-muted)', marginTop: '4px', fontWeight: 600 }}>
              <AlertTriangle size={12} />
              <span>{lowStockCount > 0 ? 'Immediate action required' : 'Stock level healthy'}</span>
            </div>
          </div>
          <div className="kpi-icon" style={{ backgroundColor: lowStockCount > 0 ? 'var(--danger-light)' : 'var(--warning-light)', color: lowStockCount > 0 ? 'var(--danger)' : 'var(--warning)' }}>
            <Package size={24} />
          </div>
        </div>

        <div className="glass-card kpi-card">
          <div>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>{t.pending}</span>
            <h3 style={{ fontSize: '24px', marginTop: '6px' }}>{pendingOrdersCount}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--warning)', marginTop: '4px', fontWeight: 600 }}>
              <Clock size={12} />
              <span>Awaiting fulfillment</span>
            </div>
          </div>
          <div className="kpi-icon" style={{ backgroundColor: 'var(--warning-light)', color: 'var(--warning)' }}>
            <Clock size={24} />
          </div>
        </div>
      </div>

      {/* Graphs Grid */}
      <div className="charts-grid">
        {/* Revenue SVG Line Graph */}
        <div className="glass-card">
          <h3 style={{ fontSize: '16px', fontWeight: 700 }}>{t.revTrend}</h3>
          <div className="svg-chart-container">
            <svg viewBox={`0 0 ${lineChartWidth} ${lineChartHeight}`} style={{ width: '100%', height: '100%' }}>
              {/* Grid Lines */}
              <line x1={padding} y1={padding} x2={lineChartWidth - padding} y2={padding} className="svg-grid-line" />
              <line x1={padding} y1={lineChartHeight / 2} x2={lineChartWidth - padding} y2={lineChartHeight / 2} className="svg-grid-line" />
              <line x1={padding} y1={lineChartHeight - padding} x2={lineChartWidth - padding} y2={lineChartHeight - padding} className="svg-grid-line" />
              
              {/* Area Under Line */}
              <path d={getAreaPath(getPointsPath())} fill="var(--primary)" className="svg-chart-area" />
              
              {/* Bezier Line */}
              <path d={getPointsPath()} stroke="var(--primary)" className="svg-chart-line" />

              {/* Data Points */}
              {revenueData.map((val, idx) => {
                const maxVal = Math.max(...revenueData) * 1.15;
                const x = padding + (idx * (lineChartWidth - padding * 2)) / (revenueData.length - 1);
                const y = lineChartHeight - padding - (val / maxVal) * (lineChartHeight - padding * 2);
                
                return (
                  <circle
                    key={idx}
                    cx={x}
                    cy={y}
                    r={hoveredPoint?.x === x ? 6 : 4}
                    fill="var(--bg-secondary)"
                    stroke="var(--primary)"
                    strokeWidth={hoveredPoint?.x === x ? 3 : 2}
                    style={{ cursor: 'pointer', transition: 'r 0.1s ease' }}
                    onMouseEnter={() => setHoveredPoint({ x, y, value: val, label: months[idx] })}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                );
              })}
            </svg>

            {/* Tooltip */}
            {hoveredPoint && (
              <div 
                className="svg-chart-tooltip" 
                style={{ 
                  left: `${(hoveredPoint.x / lineChartWidth) * 100}%`, 
                  top: `${(hoveredPoint.y / lineChartHeight) * 100 - 20}%`,
                  transform: 'translate(-50%, -100%)'
                }}
              >
                <strong>{hoveredPoint.label}</strong>: ₹{hoveredPoint.value.toLocaleString('en-IN')}
              </div>
            )}
          </div>
          {/* Legend labels */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 20px', marginTop: '8px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600 }}>
            {months.map(m => <span key={m}>{m}</span>)}
          </div>
        </div>

        {/* Order Status SVG Bar Chart */}
        <div className="glass-card">
          <h3 style={{ fontSize: '16px', fontWeight: 700 }}>{t.orderTrend}</h3>
          <div className="svg-chart-container" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', paddingBottom: '20px' }}>
            {barData.map((bar, idx) => {
              const heightPct = (bar.count / maxBarCount) * 85;
              return (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '8px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>{bar.count}</div>
                  <div 
                    style={{ 
                      width: '24px', 
                      height: `${Math.max(heightPct, 6)}px`, 
                      background: bar.color, 
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 0.5s ease',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }} 
                  />
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>{bar.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid of details */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
        {/* Left Side: Audit Activity Logs */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>{t.recentActivity}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
            {auditLogs.slice(0, 5).map(log => (
              <div key={log.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', marginTop: '2px' }}>
                  <ShieldAlert size={16} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                    <span style={{ fontWeight: 700, fontSize: '13px' }}>{log.action}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '12px', lineHeight: '1.4' }}>{log.details}</p>
                  <span style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: 600 }}>By {log.user} ({log.role})</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Inventory Stock Alerts */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>{t.alerts}</h3>
          {lowStockProducts.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--text-muted)' }}>
              <Package size={36} />
              <p style={{ fontSize: '13px' }}>All product stocks are healthy!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
              {lowStockProducts.map(prod => (
                <div 
                  key={prod.id} 
                  style={{ 
                    padding: '12px', 
                    borderRadius: '8px', 
                    backgroundColor: prod.stock === 0 ? 'var(--danger-light)' : 'var(--warning-light)',
                    border: `1px solid ${prod.stock === 0 ? 'var(--danger)' : 'var(--warning)'}`,
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '13px', fontWeight: 700 }}>{prod.name}</h4>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>SKU: {prod.sku} | {prod.category}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className={`badge ${prod.stock === 0 ? 'badge-danger' : 'badge-warning'}`} style={{ fontSize: '10px' }}>
                      {prod.stock === 0 ? 'OUT OF STOCK' : `${prod.stock} LEFT`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
