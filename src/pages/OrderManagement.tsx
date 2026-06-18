import React, { useState } from 'react';
import { useECommerce, Order } from '../context/ECommerceContext';
import { 
  FileText, Truck, RefreshCw, XCircle, CheckCircle, 
  MapPin, User, Calendar, CreditCard, ChevronRight, Download, Printer 
} from 'lucide-react';

export const OrderManagement: React.FC = () => {
  const { orders, updateOrderStatus, approveRefund, currentRole } = useECommerce();
  
  const [activeTab, setActiveTab] = useState<Order['status'] | 'All'>('All');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  
  // Status Update form state
  const [updateStatus, setUpdateStatus] = useState<Order['status']>('Processing');
  const [statusNote, setStatusNote] = useState('');
  const [trackingNo, setTrackingNo] = useState('');

  // Invoice Print Mock state
  const [showInvoiceId, setShowInvoiceId] = useState<string | null>(null);

  const filteredOrders = activeTab === 'All' 
    ? orders 
    : orders.filter(o => o.status === activeTab);

  const selectedOrder = orders.find(o => o.id === selectedOrderId);
  const invoiceOrder = orders.find(o => o.id === showInvoiceId);

  const handleOpenDetails = (id: string) => {
    setSelectedOrderId(id);
    const ord = orders.find(o => o.id === id);
    if (ord) {
      setUpdateStatus(ord.status);
      setStatusNote('');
      setTrackingNo(ord.trackingNumber || '');
    }
  };

  const handleUpdateStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId || currentRole === 'Staff') return;
    updateOrderStatus(selectedOrderId, updateStatus, statusNote || `Status changed to ${updateStatus}`, trackingNo);
    setStatusNote('');
  };

  const handleDownloadInvoice = () => {
    alert('Simulating PDF Invoice Generation. Downloading Invoice...');
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: selectedOrderId ? '1fr 1fr' : '1fr', gap: '24px', animation: 'slideIn 0.3s ease-out' }}>
      
      {/* Left side list of orders */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          <h2>Order Fullfillment Queue</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
            Process and ship transactions, moderate refund queries, and generate packaging invoices.
          </p>
        </div>

        {/* Tab filters */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', gap: '16px', flexWrap: 'wrap' }}>
          {(['All', 'New', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] as const).map(tab => {
            const count = tab === 'All' ? orders.length : orders.filter(o => o.status === tab).length;
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setSelectedOrderId(null); }}
                style={{ 
                  background: 'none', border: 'none', padding: '12px 6px', fontSize: '13px', fontWeight: 700,
                  color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                  borderBottom: isActive ? '2px solid var(--primary)' : 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>{tab}</span>
                <span className="badge badge-info" style={{ fontSize: '9px', padding: '2px 5px' }}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* Orders Table list */}
        <div className="glass-card table-container" style={{ padding: 0 }}>
          {filteredOrders.length === 0 ? (
            <p style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>No orders in this queue.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(o => (
                  <tr 
                    key={o.id}
                    onClick={() => handleOpenDetails(o.id)}
                    style={{ cursor: 'pointer', backgroundColor: selectedOrderId === o.id ? 'var(--primary-light)' : 'transparent' }}
                  >
                    <td><strong style={{ fontSize: '13px' }}>#{o.id}</strong></td>
                    <td>{new Date(o.date).toLocaleDateString()}</td>
                    <td>{o.customerName}</td>
                    <td>{o.items.reduce((sum, item) => sum + item.quantity, 0)} items</td>
                    <td><strong style={{ color: 'var(--text-primary)' }}>₹{o.total.toLocaleString('en-IN')}</strong></td>
                    <td>
                      <span className={`badge ${
                        o.status === 'Delivered' ? 'badge-success' :
                        o.status === 'Cancelled' ? 'badge-danger' :
                        o.status === 'Shipped' ? 'badge-info' : 'badge-warning'
                      }`}>
                        {o.status}
                      </span>
                      {o.refundRequested && (
                        <span className="badge badge-danger" style={{ marginLeft: '6px', fontSize: '9px' }}>REFUND REQ</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <ChevronRight size={16} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Right side detailed order view */}
      {selectedOrderId && selectedOrder && (
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', borderLeft: '3px solid var(--primary)', animation: 'slideIn 0.2s ease-out' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '16px' }}>Order Details #{selectedOrder.id}</h3>
            <button className="btn btn-secondary" onClick={() => setShowInvoiceId(selectedOrder.id)} style={{ padding: '6px 10px', fontSize: '11px' }}>
              <FileText size={14} />
              <span>Generate Invoice</span>
            </button>
          </div>

          {/* Refund request moderation banner */}
          {selectedOrder.refundRequested && (
            <div style={{ padding: '16px', backgroundColor: 'var(--danger-light)', borderRadius: '8px', border: '1px solid var(--danger)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <RefreshCw size={14} /> Refund Claim Filed
              </span>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                The customer has requested a cancellation/refund. If approved, items will be returned to catalog stock and payment reversed.
              </p>
              {currentRole !== 'Staff' && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <button className="btn btn-danger" onClick={() => approveRefund(selectedOrder.id, true)} style={{ fontSize: '11px', padding: '6px 12px' }}>
                    Approve and Refund
                  </button>
                  <button className="btn btn-secondary" onClick={() => approveRefund(selectedOrder.id, false)} style={{ fontSize: '11px', padding: '6px 12px' }}>
                    Decline Request
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Customer profile snippet */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <User size={12} /> CUSTOMER
              </span>
              <p style={{ fontSize: '13px', fontWeight: 700, marginTop: '4px' }}>{selectedOrder.customerName}</p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{selectedOrder.customerEmail}</p>
            </div>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={12} /> TRANSACTION TIME
              </span>
              <p style={{ fontSize: '13px', fontWeight: 700, marginTop: '4px' }}>
                {new Date(selectedOrder.date).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Items purchased */}
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>ORDER ITEMS</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
              {selectedOrder.items.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', backgroundColor: 'var(--bg-primary)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: '13px' }}>{item.productName}</span>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>₹{item.price} x {item.quantity}</p>
                  </div>
                  <strong>₹{item.price * item.quantity}</strong>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', fontWeight: 800, fontSize: '14px', borderTop: '2px solid var(--border-color)' }}>
                <span>Order Total:</span>
                <span style={{ color: 'var(--primary)' }}>₹{selectedOrder.total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Timeline workflow details */}
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>STATUS WORKFLOW TIMELINE</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px', borderLeft: '2px solid var(--border-color)', paddingLeft: '16px', marginLeft: '6px' }}>
              {selectedOrder.history.map((hist, idx) => (
                <div key={idx} style={{ position: 'relative' }}>
                  <div style={{ 
                    position: 'absolute', left: '-22px', top: '4px', width: '10px', height: '10px', borderRadius: '50%',
                    backgroundColor: idx === selectedOrder.history.length - 1 ? 'var(--primary)' : 'var(--text-muted)'
                  }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '12px' }}>
                    <span>{hist.status}</span>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>{new Date(hist.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>{hist.note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Update status form controls */}
          {currentRole !== 'Staff' && selectedOrder.status !== 'Cancelled' && selectedOrder.status !== 'Delivered' && (
            <form onSubmit={handleUpdateStatusSubmit} style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h4 style={{ fontSize: '13px' }}>Fulfill / Advance Status</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label>Fulfillment Stage</label>
                  <select value={updateStatus} onChange={(e) => setUpdateStatus(e.target.value as any)}>
                    <option value="Processing">Processing / Packaging</option>
                    <option value="Shipped">Shipped / In Transit</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                {updateStatus === 'Shipped' && (
                  <div>
                    <label>Tracking Number</label>
                    <input 
                      type="text" 
                      placeholder="e.g. TRK-DEL-109" 
                      value={trackingNo}
                      onChange={(e) => setTrackingNo(e.target.value)}
                      required
                    />
                  </div>
                )}
              </div>

              <div>
                <label>Timeline Update Notes</label>
                <input 
                  type="text" 
                  placeholder="e.g. Dispatched via BlueDart courier link..." 
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Apply Timeline Advancement
              </button>
            </form>
          )}
        </div>
      )}

      {/* Invoice Generator Lightbox overlay */}
      {showInvoiceId && invoiceOrder && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 400 }}>
          <div className="glass-card" style={{ width: '600px', backgroundColor: 'var(--bg-secondary)', padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid var(--border-color)', paddingBottom: '16px' }}>
              <div>
                <h2 style={{ color: 'var(--primary)' }}>INVOICE SHEET</h2>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Gokul Traders Ltd.</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h4>Order #{invoiceOrder.id}</h4>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Date: {new Date(invoiceOrder.date).toLocaleDateString()}</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', fontSize: '13px' }}>
              <div>
                <strong>Billed To:</strong>
                <p style={{ marginTop: '4px' }}>{invoiceOrder.customerName}</p>
                <p>{invoiceOrder.customerEmail}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <strong>Shipping Address:</strong>
                <p style={{ marginTop: '4px' }}>Sector 62, Electronic City</p>
                <p>Noida, Uttar Pradesh - 201301</p>
              </div>
            </div>

            <div style={{ border: '1px solid var(--border-color)', borderRadius: '6px', overflow: 'hidden', marginTop: '10px' }}>
              <table style={{ fontSize: '13px' }}>
                <thead style={{ backgroundColor: 'var(--bg-primary)' }}>
                  <tr>
                    <th style={{ padding: '8px' }}>Product</th>
                    <th style={{ padding: '8px', textAlign: 'center' }}>Price</th>
                    <th style={{ padding: '8px', textAlign: 'center' }}>Qty</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceOrder.items.map((item, idx) => (
                    <tr key={idx}>
                      <td style={{ padding: '8px' }}>{item.productName}</td>
                      <td style={{ padding: '8px', textAlign: 'center' }}>₹{item.price}</td>
                      <td style={{ padding: '8px', textAlign: 'center' }}>{item.quantity}</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>₹{item.price * item.quantity}</td>
                    </tr>
                  ))}
                  <tr style={{ fontWeight: 800 }}>
                    <td colSpan={3} style={{ padding: '12px', textAlign: 'right', borderTop: '2px solid var(--border-color)' }}>Final Total:</td>
                    <td style={{ padding: '12px', textAlign: 'right', color: 'var(--primary)', borderTop: '2px solid var(--border-color)' }}>₹{invoiceOrder.total.toLocaleString('en-IN')}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button className="btn btn-secondary" onClick={() => setShowInvoiceId(null)}>
                Close
              </button>
              <button className="btn btn-secondary" onClick={() => window.print()}>
                <Printer size={14} />
                <span>Print Invoice</span>
              </button>
              <button className="btn btn-primary" onClick={handleDownloadInvoice}>
                <Download size={14} />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
