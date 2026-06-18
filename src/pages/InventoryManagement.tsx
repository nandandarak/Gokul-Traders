import React, { useState } from 'react';
import { useECommerce } from '../context/ECommerceContext';
import { AlertTriangle, ShieldCheck, TrendingDown, Layers, Settings, RefreshCw, Warehouse } from 'lucide-react';

export const InventoryManagement: React.FC = () => {
  const { products, adjustStock, currentRole } = useECommerce();

  // Adjustment Modal state
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [adjustQty, setAdjustQty] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState<string>('Restocked');

  // Selected warehouse assignments mapping
  const warehouses = ['Mumbai Central (WH-1)', 'Delhi NCR (WH-2)', 'Bengaluru East (WH-3)'];
  
  const getWarehouseName = (id: string) => {
    // Deterministic mock warehouse mapping
    const code = id.charCodeAt(id.length - 1) || 0;
    return warehouses[code % warehouses.length];
  };

  const handleOpenAdjust = (prodId: string) => {
    if (currentRole === 'Staff') return;
    setSelectedProductId(prodId);
    setAdjustQty(0);
    setAdjustReason('Restocked');
  };

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || currentRole === 'Staff') return;
    adjustStock(selectedProductId, adjustQty, adjustReason);
    setSelectedProductId(null);
  };

  // Smart AI Inventory Out-of-Stock Forecasting
  const predictStockOut = (stock: number, sku: string) => {
    if (stock === 0) return { days: 0, risk: 'CRITICAL', text: 'Out of Stock', recommend: 50 };
    // Deterministic mock sales speed
    const baseSpeed = (sku.charCodeAt(sku.length - 1) % 4) + 1.2; // units sold/day
    const days = Math.round((stock / baseSpeed) * 10) / 10;
    
    let risk = 'LOW';
    let text = 'Healthy Stock';
    if (days <= 3) {
      risk = 'CRITICAL';
      text = 'Imminent Stockout';
    } else if (days <= 10) {
      risk = 'MEDIUM';
      text = 'Approaching Reorder Level';
    }

    // Recommended reorder quantity formula
    const recommend = Math.max(15, Math.ceil(baseSpeed * 30 - stock));

    return { days, risk, text, recommend };
  };

  const selectedProd = products.find(p => p.id === selectedProductId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'slideIn 0.3s ease-out' }}>
      <div>
        <h2>Warehouse Inventory Tracking</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
          Track warehouse logs, assign bins, adjust shelf margins, and see machine-learning stock forecasts.
        </p>
      </div>

      {/* Smart Inventory Prediction Panel */}
      <div className="glass-card" style={{ borderLeft: '4px solid var(--warning)' }}>
        <h3 style={{ fontSize: '15px', color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={18} />
          <span>AI-Powered Smart Inventory Forecasting</span>
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '4px', marginBottom: '16px' }}>
          Predicts stockout hazards by analyzing relative sales velocities, supplier lead-times, and seasonal spikes.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {products.map(p => {
            const pred = predictStockOut(p.stock, p.sku);
            return (
              <div 
                key={p.id} 
                style={{ 
                  padding: '16px', 
                  borderRadius: '8px', 
                  backgroundColor: 'var(--bg-secondary)', 
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: '13px' }}>{p.name}</span>
                  <span className={`badge ${
                    pred.risk === 'CRITICAL' ? 'badge-danger' : pred.risk === 'MEDIUM' ? 'badge-warning' : 'badge-success'
                  }`} style={{ fontSize: '9px' }}>
                    {pred.risk} RISK
                  </span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <span>Stock Remaining: <strong>{p.stock} units</strong></span>
                  <span>Est. Out-of-Stock: <strong style={{ color: pred.risk === 'CRITICAL' ? 'var(--danger)' : 'inherit' }}>
                    {pred.days === 0 ? 'Now' : `${pred.days} days`}
                  </strong></span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', borderTop: '1px dashed var(--border-color)', paddingTop: '6px' }}>
                  <span>Status: <strong>{pred.text}</strong></span>
                  <span>Rec. Reorder Qty: <strong style={{ color: 'var(--primary)' }}>+{pred.recommend}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Stock Table */}
      <div className="glass-card table-container" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr>
              <th>Product Details</th>
              <th>SKU</th>
              <th>Assigned Warehouse</th>
              <th>Stock Level</th>
              <th>Status Alert</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img 
                      src={p.images[0] || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=100'} 
                      alt={p.name} 
                      style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ fontWeight: 700 }}>{p.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{p.category}</div>
                    </div>
                  </div>
                </td>
                <td><code style={{ fontSize: '12px' }}>{p.sku}</code></td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                    <Warehouse size={14} style={{ color: 'var(--text-muted)' }} />
                    <span>{getWarehouseName(p.id)}</span>
                  </div>
                </td>
                <td>
                  <strong style={{ fontSize: '15px' }}>{p.stock}</strong>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '4px' }}>units</span>
                </td>
                <td>
                  {p.stock === 0 ? (
                    <span className="badge badge-danger">Out of Stock</span>
                  ) : p.stock <= 5 ? (
                    <span className="badge badge-warning">Low Stock</span>
                  ) : (
                    <span className="badge badge-success">Healthy</span>
                  )}
                </td>
                <td style={{ textAlign: 'right' }}>
                  {currentRole !== 'Staff' ? (
                    <button className="btn btn-secondary" onClick={() => handleOpenAdjust(p.id)} style={{ fontSize: '12px', padding: '6px 12px' }}>
                      <RefreshCw size={12} />
                      <span>Adjust Stock</span>
                    </button>
                  ) : (
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No Permissions</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Adjust Stock Overlay Modal */}
      {selectedProductId && selectedProd && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300 }}>
          <div className="glass-card" style={{ width: '400px', backgroundColor: 'var(--bg-secondary)' }}>
            <h4 style={{ fontSize: '16px', marginBottom: '8px' }}>Adjust Stock Units</h4>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Modify quantity level for <strong>{selectedProd.name}</strong>. Current level: {selectedProd.stock} units.
            </p>

            <form onSubmit={handleAdjustSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label>Stock Adjustment Quantity</label>
                <input 
                  type="number" 
                  value={adjustQty} 
                  onChange={(e) => setAdjustQty(Number(e.target.value))}
                  placeholder="e.g. +20 or -5"
                  required
                />
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                  Use positive numbers to add stock, and negative to deduct stock.
                </span>
              </div>

              <div>
                <label>Reason for Adjustment</label>
                <select value={adjustReason} onChange={(e) => setAdjustReason(e.target.value)}>
                  <option value="Restocked">Restocked / Supplier Delivery</option>
                  <option value="Inventory Audit Correction">Physical Inventory Audit Audit</option>
                  <option value="Damaged Item">Damaged / Written Off</option>
                  <option value="Customer Return">Customer Return</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedProductId(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Apply Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
