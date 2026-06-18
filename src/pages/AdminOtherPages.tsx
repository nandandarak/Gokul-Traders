import React, { useState } from 'react';
import { useECommerce, Category, Coupon, Blog } from '../context/ECommerceContext';
import { 
  Plus, Check, Trash, Layers, Sparkles, Image, 
  Tag, Percent, ShieldCheck, Star, ThumbsUp, Trash2, Eye 
} from 'lucide-react';

/* ==========================================================================
   1. CATEGORY MANAGEMENT COMPONENT
   ========================================================================== */
export const CategoryManagement: React.FC = () => {
  const { categories, addCategory, updateCategoriesOrder, currentRole } = useECommerce();
  
  const [newCatName, setNewCatName] = useState('');
  const [newSubcats, setNewSubcats] = useState('');
  const [newBanner, setNewBanner] = useState('');

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName || currentRole === 'Staff') return;
    
    addCategory({
      name: newCatName,
      subcategories: newSubcats.split(',').map(s => s.trim()).filter(Boolean),
      bannerUrl: newBanner || 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200'
    });

    setNewCatName('');
    setNewSubcats('');
    setNewBanner('');
  };

  const shiftOrder = (index: number, direction: 'up' | 'down') => {
    if (currentRole === 'Staff') return;
    const items = [...categories];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= items.length) return;

    // Swap
    const temp = items[index];
    items[index] = items[targetIdx];
    items[targetIdx] = temp;

    updateCategoriesOrder(items);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '24px', animation: 'slideIn 0.3s ease-out' }}>
      
      {/* Create Category form */}
      <div className="glass-card" style={{ height: 'fit-content' }}>
        <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Add Category Node</h3>
        
        <form onSubmit={handleCreateCategory} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label>Category Name</label>
            <input 
              type="text" 
              placeholder="e.g. Smart Home" 
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              required
            />
          </div>

          <div>
            <label>Subcategories (comma-separated)</label>
            <input 
              type="text" 
              placeholder="e.g. Lighting, Speakers, Thermostats" 
              value={newSubcats}
              onChange={(e) => setNewSubcats(e.target.value)}
            />
          </div>

          <div>
            <label>Banner Image URL</label>
            <input 
              type="text" 
              placeholder="Direct graphic URL link..." 
              value={newBanner}
              onChange={(e) => setNewBanner(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={currentRole === 'Staff'}>
            <Plus size={16} />
            <span>Create Category</span>
          </button>
        </form>
      </div>

      {/* List / Order ranks list */}
      <div className="glass-card">
        <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>Storefront Navigation Ranks</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginBottom: '16px' }}>
          Rearrange display order of navigation nodes on the storefront.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {categories.map((cat, index) => (
            <div 
              key={cat.id} 
              style={{ 
                padding: '16px', 
                borderRadius: '8px', 
                backgroundColor: 'var(--bg-primary)', 
                border: '1px solid var(--border-color)',
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center'
              }}
            >
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <img 
                  src={cat.bannerUrl} 
                  alt={cat.name} 
                  style={{ width: '50px', height: '40px', borderRadius: '4px', objectFit: 'cover' }}
                />
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 700 }}>{cat.name}</h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Subcategories: {cat.subcategories.join(', ') || 'None'}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => shiftOrder(index, 'up')}
                  disabled={index === 0 || currentRole === 'Staff'}
                  style={{ padding: '6px 10px', fontSize: '12px' }}
                >
                  ↑
                </button>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => shiftOrder(index, 'down')}
                  disabled={index === categories.length - 1 || currentRole === 'Staff'}
                  style={{ padding: '6px 10px', fontSize: '12px' }}
                >
                  ↓
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ==========================================================================
   2. CONTENT MANAGEMENT COMPONENT
   ========================================================================== */
export const ContentManagement: React.FC = () => {
  const { homeBanner, updateHomeBanner, blogs, addBlog, currentRole } = useECommerce();
  
  // Banner states
  const [bTitle, setBTitle] = useState(homeBanner.title);
  const [bSub, setBSub] = useState(homeBanner.subtitle);
  const [bUrl, setBUrl] = useState(homeBanner.bannerUrl);
  const [bannerSaved, setBannerSaved] = useState(false);

  // Blog states
  const [blogTitle, setBlogTitle] = useState('');
  const [blogSummary, setBlogSummary] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [blogImage, setBlogImage] = useState('');
  const [blogAuthor, setBlogAuthor] = useState('');

  const handleSaveBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentRole === 'Staff') return;
    updateHomeBanner(bTitle, bSub, bUrl);
    setBannerSaved(true);
    setTimeout(() => setBannerSaved(false), 2000);
  };

  const handleCreateBlog = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentRole === 'Staff') return;
    addBlog({
      title: blogTitle,
      summary: blogSummary,
      content: blogContent,
      image: blogImage || 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600',
      author: blogAuthor || 'Administrator'
    });
    setBlogTitle('');
    setBlogSummary('');
    setBlogContent('');
    setBlogImage('');
    setBlogAuthor('');
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', animation: 'slideIn 0.3s ease-out' }}>
      
      {/* Homepage Banners and Hero Configuration */}
      <div className="glass-card">
        <h3 style={{ fontSize: '16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Image size={16} /> Homepage Marketing Hero
        </h3>

        <form onSubmit={handleSaveBanner} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label>Promotional Header</label>
            <input type="text" value={bTitle} onChange={(e) => setBTitle(e.target.value)} required />
          </div>

          <div>
            <label>Subtitle / Feature Callout</label>
            <input type="text" value={bSub} onChange={(e) => setBSub(e.target.value)} required />
          </div>

          <div>
            <label>Banner Background Graphic URL</label>
            <input type="text" value={bUrl} onChange={(e) => setBUrl(e.target.value)} required />
          </div>

          <button type="submit" className="btn btn-primary" disabled={currentRole === 'Staff'}>
            {bannerSaved ? <Check size={16} /> : <Sparkles size={16} />}
            <span>{bannerSaved ? 'Banner Configuration Saved!' : 'Apply Hero Changes'}</span>
          </button>
        </form>
      </div>

      {/* Blogs Publisher */}
      <div className="glass-card">
        <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Publish Marketing Blog Article</h3>

        <form onSubmit={handleCreateBlog} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label>Blog Title</label>
            <input type="text" placeholder="e.g. The future of wireless gadgets..." value={blogTitle} onChange={(e) => setBlogTitle(e.target.value)} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label>Author</label>
              <input type="text" placeholder="e.g. Design Team" value={blogAuthor} onChange={(e) => setBlogAuthor(e.target.value)} />
            </div>
            <div>
              <label>Cover Graphic URL</label>
              <input type="text" placeholder="Paste URL..." value={blogImage} onChange={(e) => setBlogImage(e.target.value)} />
            </div>
          </div>

          <div>
            <label>Article Summary (Sleek teaser)</label>
            <input type="text" placeholder="Write a short summary..." value={blogSummary} onChange={(e) => setBlogSummary(e.target.value)} required />
          </div>

          <div>
            <label>Article Body Content</label>
            <textarea rows={3} placeholder="Compose markdown story..." value={blogContent} onChange={(e) => setBlogContent(e.target.value)} required />
          </div>

          <button type="submit" className="btn btn-primary" disabled={currentRole === 'Staff'}>
            <span>Publish Blog</span>
          </button>
        </form>
      </div>
    </div>
  );
};

/* ==========================================================================
   3. COUPONS & DISCOUNTS MANAGEMENT
   ========================================================================== */
export const CouponsManagement: React.FC = () => {
  const { coupons, addCoupon, toggleCoupon, currentRole } = useECommerce();
  
  const [code, setCode] = useState('');
  const [type, setType] = useState<'Percentage' | 'Fixed'>('Percentage');
  const [val, setVal] = useState(0);
  const [minSpend, setMinSpend] = useState(0);

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || currentRole !== 'Super Admin') return;

    addCoupon({
      code: code.toUpperCase().trim(),
      type,
      value: Number(val),
      minSpend: Number(minSpend),
      isActive: true,
      uses: 0
    });

    setCode('');
    setVal(0);
    setMinSpend(0);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '24px', animation: 'slideIn 0.3s ease-out' }}>
      
      {/* Create Coupon form */}
      <div className="glass-card" style={{ height: 'fit-content' }}>
        <h3 style={{ fontSize: '16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Tag size={16} /> Add Promo Coupon
        </h3>

        {currentRole === 'Super Admin' ? (
          <form onSubmit={handleCreateCoupon} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label>Coupon Promo Code*</label>
              <input type="text" placeholder="e.g. SUMMERSAVE" value={code} onChange={(e) => setCode(e.target.value)} required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label>Discount Type</label>
                <select value={type} onChange={(e) => setType(e.target.value as any)}>
                  <option value="Percentage">Percentage (%)</option>
                  <option value="Fixed">Fixed Amount (₹)</option>
                </select>
              </div>
              <div>
                <label>Value*</label>
                <input type="number" value={val || ''} onChange={(e) => setVal(Number(e.target.value))} required min="1" />
              </div>
            </div>

            <div>
              <label>Minimum Purchase Limit (₹)</label>
              <input type="number" value={minSpend || ''} onChange={(e) => setMinSpend(Number(e.target.value))} min="0" />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              <span>Generate Coupon</span>
            </button>
          </form>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            Only Super Administrators hold access keys to publish promo coupon metrics.
          </p>
        )}
      </div>

      {/* Coupons List */}
      <div className="glass-card">
        <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Active Discount Codes</h3>
        
        <div className="table-container" style={{ margin: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Benefit</th>
                <th>Min Spend</th>
                <th>Uses</th>
                <th>Active</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map(coupon => (
                <tr key={coupon.code}>
                  <td><code style={{ fontWeight: 700, fontSize: '13px' }}>{coupon.code}</code></td>
                  <td>{coupon.type === 'Percentage' ? `${coupon.value}% off` : `₹${coupon.value} off`}</td>
                  <td>₹{coupon.minSpend}</td>
                  <td>{coupon.uses} checkouts</td>
                  <td>
                    <button 
                      className={`badge ${coupon.isActive ? 'badge-success' : 'badge-danger'}`}
                      onClick={() => toggleCoupon(coupon.code)}
                      disabled={currentRole !== 'Super Admin'}
                      style={{ border: 'none', cursor: currentRole === 'Super Admin' ? 'pointer' : 'default' }}
                    >
                      {coupon.isActive ? 'Active' : 'Disabled'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/* ==========================================================================
   4. REVIEWS MODERATION COMPONENT
   ========================================================================== */
export const ReviewsModeration: React.FC = () => {
  const { products, moderateReview, currentRole } = useECommerce();

  // Accumulate all unapproved reviews across products
  const reviewsQueue: { productId: string, productName: string, review: any }[] = [];
  products.forEach(p => {
    p.reviews.forEach(r => {
      if (!r.approved) {
        reviewsQueue.push({ productId: p.id, productName: p.name, review: r });
      }
    });
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'slideIn 0.3s ease-out' }}>
      <div>
        <h2>Ratings & Review Moderation</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
          Inspect user review entries for profanity or scams before publishing to the storefront.
        </p>
      </div>

      <div className="glass-card">
        <h3 style={{ fontSize: '15px', marginBottom: '16px' }}>Moderation Backlog ({reviewsQueue.length} claims pending)</h3>
        
        {reviewsQueue.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
            No comments in the queue. All submissions are moderated.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {reviewsQueue.map((item, idx) => (
              <div 
                key={idx} 
                style={{ 
                  padding: '16px', 
                  borderRadius: '8px', 
                  backgroundColor: 'var(--bg-primary)', 
                  border: '1px solid var(--border-color)',
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div style={{ flex: 1, minWidth: '280px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 700, fontSize: '14px' }}>{item.review.userName}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>on {item.productName}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '2px', margin: '4px 0', color: 'var(--warning)' }}>
                    {Array.from({ length: 5 }).map((_, starIdx) => (
                      <Star 
                        key={starIdx} 
                        size={12} 
                        fill={starIdx < item.review.rating ? 'var(--warning)' : 'none'} 
                      />
                    ))}
                  </div>

                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                    "{item.review.comment}"
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => moderateReview(item.productId, item.review.id, true)}
                    disabled={currentRole === 'Staff'}
                    style={{ fontSize: '12px', padding: '6px 12px', color: 'var(--success)', borderColor: 'var(--success)' }}
                  >
                    <ThumbsUp size={12} /> Approve
                  </button>
                  
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => moderateReview(item.productId, item.review.id, false)}
                    disabled={currentRole === 'Staff'}
                    style={{ fontSize: '12px', padding: '6px 12px', color: 'var(--danger)', borderColor: 'var(--danger)' }}
                  >
                    <Trash2 size={12} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ==========================================================================
   5. AUDIT LOGS COMPONENT
   ========================================================================== */
export const AuditLogs: React.FC = () => {
  const { auditLogs } = useECommerce();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'slideIn 0.3s ease-out' }}>
      <div>
        <h2>Security Audit Trail</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
          Read-only cryptographic logs capturing updates made by coordinators and administrators.
        </p>
      </div>

      <div className="glass-card table-container" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Administrator</th>
              <th>Access Role</th>
              <th>Transaction Action</th>
              <th>Change logs</th>
            </tr>
          </thead>
          <tbody>
            {auditLogs.map(log => (
              <tr key={log.id}>
                <td><code style={{ fontSize: '12px' }}>{new Date(log.timestamp).toLocaleString()}</code></td>
                <td><strong>{log.user}</strong></td>
                <td>
                  <span className="badge badge-info" style={{ fontSize: '9px' }}>{log.role}</span>
                </td>
                <td>
                  <span className="badge badge-success" style={{ fontSize: '9px' }}>{log.action}</span>
                </td>
                <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
