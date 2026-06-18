import React, { useState } from 'react';
import { useECommerce, Product } from '../context/ECommerceContext';
import { 
  Plus, Search, Filter, ArrowUpDown, Copy, Edit2, 
  Trash2, Archive, CheckCircle, HelpCircle, Eye, CornerDownRight
} from 'lucide-react';

interface ProductListProps {
  onAddProduct: () => void;
  onEditProduct: (id: string) => void;
}

export const ProductList: React.FC<ProductListProps> = ({ onAddProduct, onEditProduct }) => {
  const { products, duplicateProduct, deleteProduct, updateProduct, currentRole } = useECommerce();

  // Filter States
  const [textSearch, setTextSearch] = useState('');
  const [aiSearch, setAiSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [stockStatus, setStockStatus] = useState('');
  const [sortField, setSortField] = useState<'price' | 'lastUpdated' | ''>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Selection/Bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Natural Language AI Search Parser
  const parseAiSearch = (query: string, items: Product[]): Product[] => {
    if (!query) return items;
    
    let filtered = [...items];
    const normalized = query.toLowerCase();

    // 1. Stock Status constraint
    if (normalized.includes('low stock')) {
      filtered = filtered.filter(p => p.stock > 0 && p.stock <= 5);
    } else if (normalized.includes('out of stock')) {
      filtered = filtered.filter(p => p.stock === 0);
    } else if (normalized.includes('in stock')) {
      filtered = filtered.filter(p => p.stock > 0);
    }

    // 2. Price constraints: "under ₹?5000", "below 5000", "less than 5000"
    const underRegex = /(?:under|below|less than)\s*(?:₹|rs\.?)?\s*(\d+)/i;
    const underMatch = normalized.match(underRegex);
    if (underMatch) {
      const limit = parseInt(underMatch[1], 10);
      filtered = filtered.filter(p => (p.discountPrice || p.price) < limit);
    }

    const overRegex = /(?:over|above|more than)\s*(?:₹|rs\.?)?\s*(\d+)/i;
    const overMatch = normalized.match(overRegex);
    if (overMatch) {
      const limit = parseInt(overMatch[1], 10);
      filtered = filtered.filter(p => (p.discountPrice || p.price) > limit);
    }

    // 3. Category constraint
    const categoriesList = Array.from(new Set(items.map(p => p.category.toLowerCase())));
    categoriesList.forEach(cat => {
      if (normalized.includes(cat)) {
        filtered = filtered.filter(p => p.category.toLowerCase() === cat);
      }
    });

    // 4. Fallback search (if words aren't matching qualifiers, matches with names/brands/SKUs)
    const keywords = normalized
      .replace(underRegex, '')
      .replace(overRegex, '')
      .replace(/low stock|out of stock|in stock|show|all|products/g, '')
      .trim()
      .split(/\s+/)
      .filter(w => w.length > 2);

    if (keywords.length > 0) {
      filtered = filtered.filter(p => 
        keywords.every(kw => 
          p.name.toLowerCase().includes(kw) || 
          p.brand.toLowerCase().includes(kw) || 
          p.sku.toLowerCase().includes(kw)
        )
      );
    }

    return filtered;
  };

  // Compile final filtered & sorted items
  let processedProducts = [...products];

  // Apply standard text search
  if (textSearch) {
    processedProducts = processedProducts.filter(p => 
      p.name.toLowerCase().includes(textSearch.toLowerCase()) ||
      p.sku.toLowerCase().includes(textSearch.toLowerCase()) ||
      p.brand.toLowerCase().includes(textSearch.toLowerCase())
    );
  }

  // Apply Category filtering
  if (selectedCategory) {
    processedProducts = processedProducts.filter(p => p.category === selectedCategory);
  }

  // Apply Stock Status filter
  if (stockStatus) {
    if (stockStatus === 'in_stock') {
      processedProducts = processedProducts.filter(p => p.stock > 0);
    } else if (stockStatus === 'low_stock') {
      processedProducts = processedProducts.filter(p => p.stock > 0 && p.stock <= 5);
    } else if (stockStatus === 'out_of_stock') {
      processedProducts = processedProducts.filter(p => p.stock === 0);
    }
  }

  // Apply AI natural language search filter
  if (aiSearch) {
    processedProducts = parseAiSearch(aiSearch, processedProducts);
  }

  // Apply Sorting
  if (sortField) {
    processedProducts.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      // fallback discountPrice check
      if (sortField === 'price') {
        valA = a.discountPrice || a.price;
        valB = b.discountPrice || b.price;
      }

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      } else {
        return sortOrder === 'asc' ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
      }
    });
  }

  // Categories list for dropdown
  const categoriesList = Array.from(new Set(products.map(p => p.category)));

  // Pagination bounds
  const totalItems = processedProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = processedProducts.slice(startIndex, startIndex + itemsPerPage);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedProducts.map(p => p.id));
    }
  };

  // Bulk actions handlers
  const handleBulkArchive = () => {
    if (currentRole === 'Staff') return;
    selectedIds.forEach(id => updateProduct(id, { status: 'Archived' }));
    setSelectedIds([]);
  };

  const handleBulkDelete = () => {
    if (currentRole !== 'Super Admin') return;
    selectedIds.forEach(id => deleteProduct(id));
    setSelectedIds([]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'slideIn 0.3s ease-out' }}>
      
      {/* Header buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Product Inventory Catalog</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
            Manage, edit, duplicate or archive warehouse listings.
          </p>
        </div>
        
        {currentRole !== 'Staff' && (
          <button className="btn btn-primary" onClick={onAddProduct}>
            <Plus size={16} />
            <span>Add Product</span>
          </button>
        )}
      </div>

      {/* Natural Language AI Search Section */}
      <div className="glass-card" style={{ padding: '16px 20px', borderLeft: '4px solid var(--primary)' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--primary)' }}>
          <CheckCircle size={14} />
          <strong>Smart AI Natural Language Filter</strong>
        </label>
        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input 
              type="text" 
              placeholder='Try typing "Show electronics under 5000 with low stock" or "running shoes over 4000"...' 
              value={aiSearch}
              onChange={(e) => { setAiSearch(e.target.value); setCurrentPage(1); }}
              style={{ paddingLeft: '40px', fontSize: '13px', borderColor: aiSearch ? 'var(--primary)' : 'var(--border-color)' }}
            />
            <Search size={16} className="header-search-icon" style={{ color: aiSearch ? 'var(--primary)' : 'var(--text-muted)' }} />
          </div>
          {aiSearch && (
            <button 
              className="btn btn-secondary" 
              onClick={() => setAiSearch('')}
              style={{ padding: '10px 14px', fontSize: '12px' }}
            >
              Reset AI Filter
            </button>
          )}
        </div>
      </div>

      {/* Table filter controls */}
      <div className="glass-card" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', padding: '16px' }}>
        {/* Simple keyword search */}
        <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
          <input 
            type="text" 
            placeholder="Search by Product Name or SKU..." 
            value={textSearch}
            onChange={(e) => { setTextSearch(e.target.value); setCurrentPage(1); }}
            style={{ paddingLeft: '40px' }}
          />
          <Search size={16} className="header-search-icon" />
        </div>

        {/* Category filter dropdown */}
        <div style={{ width: '180px' }}>
          <select 
            value={selectedCategory} 
            onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
          >
            <option value="">All Categories</option>
            {categoriesList.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Stock status filter dropdown */}
        <div style={{ width: '180px' }}>
          <select 
            value={stockStatus} 
            onChange={(e) => { setStockStatus(e.target.value); setCurrentPage(1); }}
          >
            <option value="">All Stock Levels</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock (≤ 5)</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>

        {/* Price & date sorter */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className={`btn btn-secondary ${sortField === 'price' ? 'active' : ''}`}
            onClick={() => {
              setSortField('price');
              setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
              setCurrentPage(1);
            }}
            style={{ 
              borderColor: sortField === 'price' ? 'var(--primary)' : 'var(--border-color)',
              color: sortField === 'price' ? 'var(--primary)' : 'inherit'
            }}
          >
            <ArrowUpDown size={14} />
            <span>Price {sortField === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}</span>
          </button>

          <button 
            className={`btn btn-secondary ${sortField === 'lastUpdated' ? 'active' : ''}`}
            onClick={() => {
              setSortField('lastUpdated');
              setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
              setCurrentPage(1);
            }}
            style={{ 
              borderColor: sortField === 'lastUpdated' ? 'var(--primary)' : 'var(--border-color)',
              color: sortField === 'lastUpdated' ? 'var(--primary)' : 'inherit'
            }}
          >
            <ArrowUpDown size={14} />
            <span>Updated {sortField === 'lastUpdated' && (sortOrder === 'asc' ? '↑' : '↓')}</span>
          </button>
        </div>
      </div>

      {/* Bulk actions and count summaries */}
      {selectedIds.length > 0 && (
        <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', backgroundColor: 'var(--primary-light)', borderColor: 'var(--primary)' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary)' }}>
            {selectedIds.length} products selected
          </span>
          <div style={{ display: 'flex', gap: '12px' }}>
            {currentRole !== 'Staff' && (
              <button className="btn btn-secondary" onClick={handleBulkArchive} style={{ fontSize: '12px', padding: '8px 12px' }}>
                <Archive size={14} />
                <span>Archive</span>
              </button>
            )}
            {currentRole === 'Super Admin' && (
              <button className="btn btn-danger" onClick={handleBulkDelete} style={{ fontSize: '12px', padding: '8px 12px' }}>
                <Trash2 size={14} />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Products list grid table */}
      <div className="glass-card table-container" style={{ padding: 0 }}>
        {totalItems === 0 ? (
          <p style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No products match the criteria. Try adjusting filters or searches.
          </p>
        ) : (
          <table>
            <thead>
              <tr>
                <th style={{ width: '40px', textAlign: 'center' }}>
                  <input 
                    type="checkbox" 
                    checked={selectedIds.length === paginatedProducts.length && paginatedProducts.length > 0} 
                    onChange={toggleSelectAll}
                    style={{ width: 'auto' }}
                  />
                </th>
                <th>Product</th>
                <th>Category</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Last Updated</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map(p => (
                <tr key={p.id}>
                  <td style={{ textAlign: 'center' }}>
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(p.id)} 
                      onChange={() => toggleSelect(p.id)}
                      style={{ width: 'auto' }}
                    />
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img 
                        src={p.images[0] || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=100'} 
                        alt={p.name} 
                        style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover', border: '1px solid var(--border-color)' }}
                      />
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{p.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{p.brand}</div>
                      </div>
                    </div>
                  </td>
                  <td>{p.category}</td>
                  <td><code style={{ fontSize: '12px' }}>{p.sku}</code></td>
                  <td>
                    {p.discountPrice ? (
                      <div>
                        <span style={{ fontWeight: 700 }}>₹{p.discountPrice}</span>
                        <span style={{ fontSize: '11px', textDecoration: 'line-through', color: 'var(--text-muted)', marginLeft: '6px' }}>
                          ₹{p.price}
                        </span>
                      </div>
                    ) : (
                      <span style={{ fontWeight: 700 }}>₹{p.price}</span>
                    )}
                  </td>
                  <td>
                    {p.stock === 0 ? (
                      <span className="badge badge-danger">Out of Stock</span>
                    ) : p.stock <= 5 ? (
                      <span className="badge badge-warning">{p.stock} units left</span>
                    ) : (
                      <span>{p.stock} units</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${
                      p.status === 'Published' ? 'badge-success' : 
                      p.status === 'Draft' ? 'badge-info' : 
                      p.status === 'Scheduled' ? 'badge-warning' : 'badge-danger'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td>{new Date(p.lastUpdated).toLocaleDateString()}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      {currentRole !== 'Staff' && (
                        <>
                          <button 
                            className="action-btn" 
                            onClick={() => onEditProduct(p.id)} 
                            title="Edit Product"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            className="action-btn" 
                            onClick={() => duplicateProduct(p.id)} 
                            title="Duplicate Product"
                          >
                            <Copy size={14} />
                          </button>
                        </>
                      )}
                      
                      {currentRole === 'Super Admin' && (
                        <button 
                          className="action-btn" 
                          onClick={() => deleteProduct(p.id)} 
                          title="Delete Product"
                          style={{ color: 'var(--danger)' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Footer controls */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems} items
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className="btn btn-secondary" 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              style={{ padding: '6px 12px', opacity: currentPage === 1 ? 0.5 : 1 }}
            >
              Previous
            </button>
            <button 
              className="btn btn-secondary" 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              style={{ padding: '6px 12px', opacity: currentPage === totalPages ? 0.5 : 1 }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
