import React, { useState } from 'react';
import { useECommerce, Customer } from '../context/ECommerceContext';
import { Users, Search, Download, Award, MessageSquare, Check, Eye } from 'lucide-react';

export const CustomerManagement: React.FC = () => {
  const { customers, updateCustomerNotes, currentRole } = useECommerce();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSegment, setActiveSegment] = useState<'All' | 'VIP' | 'Regular' | 'New' | 'Inactive'>('All');
  
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [customerNotes, setCustomerNotes] = useState('');

  // Segment filtration
  let filteredCustomers = customers;

  if (searchTerm) {
    filteredCustomers = filteredCustomers.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  if (activeSegment !== 'All') {
    filteredCustomers = filteredCustomers.filter(c => c.segment === activeSegment);
  }

  const handleEditNotes = (c: Customer) => {
    setEditingNotesId(c.id);
    setCustomerNotes(c.notes);
  };

  const handleSaveNotes = (id: string) => {
    updateCustomerNotes(id, customerNotes);
    setEditingNotesId(null);
  };

  // CSV Mock Exporter
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,ID,Name,Email,Segment,Loyalty,Spend,Orders,JoinDate\n';
    customers.forEach(c => {
      csvContent += `${c.id},"${c.name}",${c.email},${c.segment},${c.loyaltyStatus},${c.totalSpend},${c.ordersCount},${c.joinDate}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `customer_directory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'slideIn 0.3s ease-out' }}>
      
      {/* Header and buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>CRM & Customer Segments</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
            Inspect client transactions, update internal workspace notes, and export marketing rosters.
          </p>
        </div>

        <button className="btn btn-secondary" onClick={handleExportCSV}>
          <Download size={16} />
          <span>Export Customer Directory</span>
        </button>
      </div>

      {/* Grid of loyalty metrics */}
      <div className="dashboard-grid">
        {['VIP', 'Regular', 'New', 'Inactive'].map(seg => {
          const count = customers.filter(c => c.segment === seg).length;
          return (
            <div key={seg} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>{seg} SEGMENT</span>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <h3 style={{ fontSize: '24px' }}>{count}</h3>
                <span className="badge badge-info" style={{ fontSize: '9px' }}>
                  {customers.length > 0 ? Math.round((count / customers.length) * 100) : 0}% of total
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table filters */}
      <div className="glass-card" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', padding: '16px' }}>
        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <input 
            type="text" 
            placeholder="Search customers by name or email ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '40px' }}
          />
          <Search size={16} className="header-search-icon" />
        </div>

        <div style={{ width: '180px' }}>
          <select value={activeSegment} onChange={(e) => setActiveSegment(e.target.value as any)}>
            <option value="All">All Segments</option>
            <option value="VIP">VIP Tier</option>
            <option value="Regular">Regular customers</option>
            <option value="New">New Registrations</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Main Customers List */}
      <div className="glass-card table-container" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Profile Segment</th>
              <th>Loyalty Level</th>
              <th>Total spend</th>
              <th>Orders</th>
              <th>Client notes</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map(c => (
              <tr key={c.id}>
                <td>
                  <div>
                    <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{c.name}</strong>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{c.email} | Joined {c.joinDate}</div>
                  </div>
                </td>
                <td>
                  <span className={`badge ${
                    c.segment === 'VIP' ? 'badge-success' :
                    c.segment === 'Regular' ? 'badge-info' :
                    c.segment === 'New' ? 'badge-warning' : 'badge-danger'
                  }`}>
                    {c.segment}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                    <Award size={14} style={{ 
                      color: c.loyaltyStatus === 'Gold' ? 'var(--warning)' : c.loyaltyStatus === 'Silver' ? 'var(--text-muted)' : 'brown'
                    }} />
                    <strong>{c.loyaltyStatus}</strong>
                  </div>
                </td>
                <td><strong>₹{c.totalSpend.toLocaleString('en-IN')}</strong></td>
                <td>{c.ordersCount} purchases</td>
                <td style={{ maxWidth: '240px' }}>
                  {editingNotesId === c.id ? (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <input 
                        type="text" 
                        value={customerNotes} 
                        onChange={(e) => setCustomerNotes(e.target.value)}
                        style={{ padding: '6px 10px', fontSize: '12px' }}
                      />
                      <button className="btn btn-primary" onClick={() => handleSaveNotes(c.id)} style={{ padding: '6px' }}>
                        <Check size={12} />
                      </button>
                    </div>
                  ) : (
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.notes || <em style={{ color: 'var(--text-muted)' }}>No notes recorded.</em>}
                    </p>
                  )}
                </td>
                <td style={{ textAlign: 'right' }}>
                  {editingNotesId !== c.id && (
                    <button 
                      className="btn btn-secondary" 
                      onClick={() => handleEditNotes(c)}
                      style={{ fontSize: '11px', padding: '4px 8px' }}
                      disabled={currentRole === 'Staff'}
                    >
                      <MessageSquare size={12} />
                      <span>Edit Notes</span>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
