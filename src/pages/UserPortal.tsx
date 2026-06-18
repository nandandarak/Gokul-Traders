import React, { useState } from 'react';
import { useECommerce, Product, OrderItem } from '../context/ECommerceContext';
import { 
  ShoppingBag, ChevronRight, Star, Heart, ArrowRight, 
  Trash2, X, ShieldCheck, AlertCircle, ShoppingCart, 
  Tag, Award, BookOpen, User, RefreshCw,
  MessageSquare, Send, Bot
} from 'lucide-react';

interface UserPortalProps {
  setView: (view: 'admin' | 'user') => void;
}

export const UserPortal: React.FC<UserPortalProps> = ({ setView }) => {
  const { 
    products, 
    categories, 
    homeBanner, 
    blogs, 
    coupons, 
    addReview, 
    placeOrder, 
    addLog 
  } = useECommerce();

  // Navigation state
  const [userTab, setUserTab] = useState<'home' | 'shop' | 'blogs'>('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  
  // Shopping Cart state
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);
  const [couponError, setCouponError] = useState('');

  // Checkout Form states
  const [showCheckout, setShowCheckout] = useState(false);
  const [custName, setCustName] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState<string | null>(null);
  const [paymentFailed, setPaymentFailed] = useState(false);

  // Filters for Shop view
  const [searchWord, setSearchWord] = useState('');
  const [shopCategory, setShopCategory] = useState('All');
  const [maxPrice, setMaxPrice] = useState(30000);

  // Review Form state
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Chatbot State definitions
  interface ChatMessage {
    id: string;
    sender: 'user' | 'bot';
    text: string;
    products?: Product[];
    timestamp: Date;
  }

  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatTyping, setChatTyping] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Namaste! Welcome to Gokul Traders metrology tool finder. How can I help you find the right precision measurement tools today?',
      timestamp: new Date()
    }
  ]);

  const submitChatText = (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMsg]);
    const query = text.toLowerCase().trim();
    setChatTyping(true);

    setTimeout(() => {
      setChatTyping(false);

      const matchedProducts = products.filter(p => {
        const nameMatch = p.name.toLowerCase().includes(query);
        const descMatch = p.description.toLowerCase().includes(query);
        const brandMatch = p.brand.toLowerCase().includes(query);
        const catMatch = p.category.toLowerCase().includes(query);
        const subcatMatch = p.subcategory.toLowerCase().includes(query);
        const tagMatch = p.tags.some(t => t.toLowerCase().includes(query));
        
        const vernierSynonym = (query.includes('caliper') || query.includes('vernier')) && p.name.toLowerCase().includes('caliper');
        const screwgaugeSynonym = (query.includes('micrometer') || query.includes('screw gauge') || query.includes('screwgauge') || query.includes('gauge')) && p.name.toLowerCase().includes('micrometer');
        const dialGaugeSynonym = (query.includes('dial') || query.includes('indicator') || query.includes('plunger')) && p.name.toLowerCase().includes('dial');
        const laserSynonym = (query.includes('laser') || query.includes('distance') || query.includes('rangefinder') || query.includes('meter')) && p.name.toLowerCase().includes('laser');
        const slipgaugeSynonym = (query.includes('slip') || query.includes('block') || query.includes('calibration') || query.includes('check')) && p.name.toLowerCase().includes('slip');
        const angleSynonym = (query.includes('angle') || query.includes('protractor') || query.includes('slope')) && p.name.toLowerCase().includes('angle');

        return nameMatch || descMatch || brandMatch || catMatch || subcatMatch || tagMatch ||
               vernierSynonym || screwgaugeSynonym || dialGaugeSynonym || laserSynonym || slipgaugeSynonym || angleSynonym;
      });

      let replyText = "";
      if (matchedProducts.length > 0) {
        replyText = `Based on your request, I found these measurement tools at Gokul Traders that fit your needs:`;
      } else {
        replyText = `I couldn't find a direct match for "${query}". At Gokul Traders, we specialize in high-precision Vernier Calipers, Micrometers, Plunger Dial Indicators, Laser Rangefinders, and Slip Gauge Calibration sets. What are you looking to measure?`;
      }

      const botMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        sender: 'bot',
        text: replyText,
        products: matchedProducts.slice(0, 3),
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, botMsg]);
    }, 850);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    submitChatText(chatInput);
    setChatInput('');
  };

  // Determine if a product is ready to show (Published, or Scheduled which passed publish dates)
  const getVisibleProducts = (items: Product[]) => {
    return items.filter(p => {
      if (p.status === 'Published') return true;
      if (p.status === 'Scheduled' && p.publishDate) {
        const release = new Date(p.publishDate);
        return release <= new Date();
      }
      return false; // draft and archived are hidden
    });
  };

  const visibleProducts = getVisibleProducts(products);

  // Filter items in Shop
  const shopProducts = visibleProducts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchWord.toLowerCase()) || 
                          p.brand.toLowerCase().includes(searchWord.toLowerCase());
    const matchesCat = shopCategory === 'All' || p.category === shopCategory;
    const finalPrice = p.discountPrice || p.price;
    const matchesPrice = finalPrice <= maxPrice;
    return matchesSearch && matchesCat && matchesPrice;
  });

  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);
  const cartSubtotal = cart.reduce((sum, c) => {
    const price = c.product.discountPrice || c.product.price;
    return sum + price * c.quantity;
  }, 0);

  const discountAmount = appliedCoupon 
    ? (appliedCoupon.type === 'Percentage' 
        ? Math.round(cartSubtotal * (appliedCoupon.value / 100)) 
        : appliedCoupon.value)
    : 0;

  const cartTotal = Math.max(0, cartSubtotal - discountAmount);

  // Cart operations
  const addToCart = (product: Product) => {
    if (product.stock === 0) return;
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: Math.min(product.stock, item.quantity + 1) } 
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setShowCartDrawer(true);
  };

  const updateCartQty = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === id) {
        const nextQty = item.quantity + delta;
        if (nextQty <= 0) return null;
        return { ...item, quantity: Math.min(item.product.stock, nextQty) };
      }
      return item;
    }).filter(Boolean) as any);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.product.id !== id));
  };

  const applyCoupon = () => {
    setCouponError('');
    const coupon = coupons.find(c => c.code.toUpperCase() === couponCode.toUpperCase().trim());
    if (!coupon) {
      setCouponError('Invalid Coupon Code.');
      setAppliedCoupon(null);
      return;
    }
    if (!coupon.isActive) {
      setCouponError('This coupon is inactive.');
      setAppliedCoupon(null);
      return;
    }
    if (cartSubtotal < coupon.minSpend) {
      setCouponError(`Min spend of ₹${coupon.minSpend} required.`);
      setAppliedCoupon(null);
      return;
    }
    setAppliedCoupon(coupon);
  };

  // Submit Review Form
  const handleReviewSubmit = (e: React.FormEvent, productId: string) => {
    e.preventDefault();
    if (!reviewName || !reviewComment) return;

    addReview(productId, {
      userName: reviewName,
      rating: reviewRating,
      comment: reviewComment,
      date: new Date().toISOString()
    });

    setReviewName('');
    setReviewComment('');
    setReviewSuccess(true);
    setTimeout(() => setReviewSuccess(false), 3000);
  };

  // Checkout process simulation
  const handleCheckoutSubmit = (simulatedSuccess: boolean) => {
    if (!custName || !custEmail) return;
    setPaymentLoading(true);
    setPaymentFailed(false);

    setTimeout(() => {
      setPaymentLoading(false);
      if (simulatedSuccess) {
        const itemsList: OrderItem[] = cart.map(c => ({
          productId: c.product.id,
          productName: c.product.name,
          price: c.product.discountPrice || c.product.price,
          quantity: c.quantity
        }));

        placeOrder({ name: custName, email: custEmail }, itemsList, cartTotal);
        
        // Log to Admin
        addLog('Store Sale', `Customer "${custName}" checked out cart total ₹${cartTotal}`);

        setOrderComplete(`ORD-${Math.floor(1000 + Math.random() * 9000)}`);
        setCart([]);
        setAppliedCoupon(null);
        setCouponCode('');
        setShowCheckout(false);
      } else {
        setPaymentFailed(true);
        // Failed payments register in Admin notifications center!
        addLog('Payment Failure', `Failed checkout transaction card attempted by ${custName} (${custEmail})`);
      }
    }, 1500);
  };

  const selectedProduct = products.find(p => p.id === selectedProductId);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', transition: 'var(--transition)' }}>
      {/* Top Store Nav */}
      <nav className="storefront-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="logo-icon" style={{ background: 'var(--primary-gradient)' }}>G</div>
          <h2 style={{ fontSize: '20px', letterSpacing: '-0.03em' }}>Gokul Traders</h2>
        </div>

        <div style={{ display: 'flex', gap: '24px', fontWeight: 600, fontSize: '14px' }}>
          <button 
            onClick={() => { setUserTab('home'); setSelectedProductId(null); }}
            style={{ background: 'none', border: 'none', color: userTab === 'home' ? 'var(--primary)' : 'var(--text-secondary)', cursor: 'pointer' }}
          >
            Home
          </button>
          <button 
            onClick={() => { setUserTab('shop'); setSelectedProductId(null); }}
            style={{ background: 'none', border: 'none', color: userTab === 'shop' ? 'var(--primary)' : 'var(--text-secondary)', cursor: 'pointer' }}
          >
            Shop Catalogue
          </button>
          <button 
            onClick={() => { setUserTab('blogs'); setSelectedProductId(null); }}
            style={{ background: 'none', border: 'none', color: userTab === 'blogs' ? 'var(--primary)' : 'var(--text-secondary)', cursor: 'pointer' }}
          >
            Editorial Blog
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            className="action-btn" 
            onClick={() => setShowCartDrawer(true)}
            style={{ color: 'var(--text-primary)' }}
          >
            <ShoppingBag size={20} />
            {cartCount > 0 && <span className="badge-count" style={{ top: '-2px', right: '-2px' }}>{cartCount}</span>}
          </button>

          <button 
            className="btn btn-primary" 
            onClick={() => setView('admin')}
            style={{ fontSize: '12px', padding: '8px 14px' }}
          >
            🛠️ Portal Admin
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      {selectedProductId && selectedProduct ? (
        /* ==========================================================================
           PRODUCT DETAILS VIEW
           ========================================================================== */
        <div style={{ maxWidth: '1100px', margin: '32px auto', padding: '0 24px', animation: 'slideIn 0.3s ease' }}>
          <button 
            className="btn btn-secondary" 
            onClick={() => setSelectedProductId(null)}
            style={{ marginBottom: '24px' }}
          >
            Back to catalogue
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '40px' }}>
            {/* Gallery Image */}
            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
              <img 
                src={selectedProduct.images[0] || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600'} 
                alt={selectedProduct.name} 
                style={{ width: '100%', height: '450px', objectFit: 'cover' }}
              />
            </div>

            {/* Specifications Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <span className="badge badge-info">{selectedProduct.brand}</span>
                <h1 style={{ fontSize: '28px', marginTop: '6px' }}>{selectedProduct.name}</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '2px' }}>SKU: {selectedProduct.sku}</p>
              </div>

              {/* Pricing */}
              <div>
                {selectedProduct.discountPrice ? (
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                    <h2 style={{ color: 'var(--primary)', fontSize: '28px' }}>₹{selectedProduct.discountPrice}</h2>
                    <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '16px' }}>₹{selectedProduct.price}</span>
                  </div>
                ) : (
                  <h2 style={{ color: 'var(--primary)', fontSize: '28px' }}>₹{selectedProduct.price}</h2>
                )}
              </div>

              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                {selectedProduct.description}
              </p>

              {/* Add to Cart */}
              <div>
                {selectedProduct.stock === 0 ? (
                  <button className="btn btn-secondary" style={{ cursor: 'not-allowed', width: '100%', opacity: 0.6 }} disabled>
                    Out of stock
                  </button>
                ) : (
                  <button className="btn btn-primary" onClick={() => addToCart(selectedProduct)} style={{ width: '100%', padding: '14px' }}>
                    <ShoppingCart size={16} />
                    <span>Add to shopping bag</span>
                  </button>
                )}
              </div>

              {/* Specifications table */}
              <div style={{ marginTop: '12px' }}>
                <h4 style={{ fontSize: '14px', marginBottom: '8px' }}>Specifications</h4>
                <div style={{ border: '1px solid var(--border-color)', borderRadius: '6px', overflow: 'hidden' }}>
                  {Object.entries(selectedProduct.specifications).map(([key, val], idx) => (
                    <div key={idx} style={{ display: 'flex', borderBottom: idx === Object.entries(selectedProduct.specifications).length - 1 ? 'none' : '1px solid var(--border-color)', fontSize: '13px' }}>
                      <div style={{ width: '150px', padding: '10px 14px', backgroundColor: 'var(--bg-secondary)', fontWeight: 700, borderRight: '1px solid var(--border-color)' }}>{key}</div>
                      <div style={{ padding: '10px 14px', flex: 1 }}>{val}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviews backlog lists */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '24px', marginTop: '16px' }}>
                <h4 style={{ fontSize: '16px', marginBottom: '16px' }}>Customer Reviews</h4>
                
                {/* Submit review form */}
                <form onSubmit={(e) => handleReviewSubmit(e, selectedProduct.id)} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px', padding: '16px' }}>
                  <h5 style={{ fontSize: '13px' }}>Share your feedback</h5>
                  {reviewSuccess && (
                    <div className="badge badge-success" style={{ width: 'fit-content' }}>
                      Review submitted! Awaiting administrator approval before publication.
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label>Nickname</label>
                      <input type="text" placeholder="e.g. Suman D." value={reviewName} onChange={(e) => setReviewName(e.target.value)} required />
                    </div>
                    <div>
                      <label>Rating star</label>
                      <select value={reviewRating} onChange={(e) => setReviewRating(Number(e.target.value))}>
                        <option value="5">⭐⭐⭐⭐⭐ (5/5)</option>
                        <option value="4">⭐⭐⭐⭐ (4/5)</option>
                        <option value="3">⭐⭐⭐ (3/5)</option>
                        <option value="2">⭐⭐ (2/5)</option>
                        <option value="1">⭐ (1/5)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label>Review comment</label>
                    <textarea rows={2} placeholder="Write details..." value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} required />
                  </div>

                  <button type="submit" className="btn btn-secondary" style={{ fontSize: '12px', width: 'fit-content' }}>
                    Post Review
                  </button>
                </form>

                {/* Approved reviews list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {selectedProduct.reviews.filter(r => r.approved).length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '12px', textAlign: 'center' }}>No reviews recorded. Be the first!</p>
                  ) : (
                    selectedProduct.reviews.filter(r => r.approved).map(rev => (
                      <div key={rev.id} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700 }}>
                          <span>{rev.userName}</span>
                          <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>{new Date(rev.date).toLocaleDateString()}</span>
                        </div>
                        <div style={{ display: 'flex', color: 'var(--warning)', margin: '4px 0' }}>
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <Star key={idx} size={10} fill={idx < rev.rating ? 'var(--warning)' : 'none'} />
                          ))}
                        </div>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>"{rev.comment}"</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      ) : userTab === 'home' ? (
        /* ==========================================================================
           HOMEPAGE VIEW
           ========================================================================== */
        <div style={{ animation: 'slideIn 0.3s ease' }}>
          {/* Hero Banner Grid */}
          <div 
            style={{ 
              height: '420px', 
              backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url(${homeBanner.bannerUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: '0 80px',
              color: '#fff'
            }}
          >
            <span className="badge badge-info" style={{ width: 'fit-content', marginBottom: '12px', background: 'var(--primary-gradient)', color: '#fff' }}>
              PROMOTION
            </span>
            <h1 style={{ fontSize: '42px', maxWidth: '600px', lineHeight: '1.2' }}>{homeBanner.title}</h1>
            <p style={{ fontSize: '16px', maxWidth: '500px', marginTop: '16px', color: '#e2e8f0' }}>{homeBanner.subtitle}</p>
            <button 
              className="btn btn-primary" 
              onClick={() => setUserTab('shop')} 
              style={{ marginTop: '24px', width: 'fit-content', padding: '12px 24px' }}
            >
              <span>Explore Catalogue</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Featured Collections Products */}
          <div style={{ padding: '60px 80px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <h2>Curated Featured Collection</h2>
              <button onClick={() => setUserTab('shop')} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}>
                View all catalogue &gt;
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '24px' }}>
              {visibleProducts.slice(0, 4).map(prod => {
                const finalPrice = prod.discountPrice || prod.price;
                return (
                  <div key={prod.id} className="store-card" onClick={() => setSelectedProductId(prod.id)} style={{ cursor: 'pointer' }}>
                    <img src={prod.images[0]} alt={prod.name} className="store-card-img" />
                    
                    <div className="store-card-content">
                      <span className="badge badge-info" style={{ width: 'fit-content', fontSize: '9px' }}>{prod.brand}</span>
                      <h4 style={{ fontSize: '15px', fontWeight: 700, margin: '4px 0' }}>{prod.name}</h4>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                        <strong>₹{finalPrice.toLocaleString('en-IN')}</strong>
                        {prod.stock === 0 ? (
                          <span style={{ fontSize: '11px', color: 'var(--danger)', fontWeight: 700 }}>OUT OF STOCK</span>
                        ) : (
                          <button 
                            className="btn btn-secondary" 
                            onClick={(e) => { e.stopPropagation(); addToCart(prod); }}
                            style={{ padding: '6px' }}
                          >
                            +
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : userTab === 'shop' ? (
        /* ==========================================================================
           SHOP CATALOGUE VIEW
           ========================================================================== */
        <div className="store-grid" style={{ animation: 'slideIn 0.3s ease' }}>
          {/* Shop Filters Sidebar */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label>Keyword search</label>
              <input 
                type="text" 
                placeholder="Search watches, shoes..." 
                value={searchWord}
                onChange={(e) => setSearchWord(e.target.value)}
              />
            </div>

            <div>
              <label>Category Group</label>
              <select value={shopCategory} onChange={(e) => setShopCategory(e.target.value)}>
                <option value="All">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Max budget:</span>
                <strong>₹{maxPrice.toLocaleString('en-IN')}</strong>
              </label>
              <input 
                type="range" 
                min="1000" 
                max="30000" 
                step="1000" 
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                style={{ width: '100%', cursor: 'pointer', padding: 0 }}
              />
            </div>
          </aside>

          {/* Catalog products lists */}
          <div>
            <h2 style={{ marginBottom: '24px' }}>Catalogue Collection ({shopProducts.length} items)</h2>
            
            {shopProducts.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', padding: '40px', textAlign: 'center' }}>No products match this budget or filters.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '24px' }}>
                {shopProducts.map(prod => {
                  const finalPrice = prod.discountPrice || prod.price;
                  return (
                    <div key={prod.id} className="store-card" onClick={() => setSelectedProductId(prod.id)} style={{ cursor: 'pointer' }}>
                      <img src={prod.images[0]} alt={prod.name} className="store-card-img" />
                      
                      <div className="store-card-content">
                        <span className="badge badge-info" style={{ width: 'fit-content', fontSize: '9px' }}>{prod.brand}</span>
                        <h4 style={{ fontSize: '15px', fontWeight: 700, margin: '4px 0' }}>{prod.name}</h4>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                          <strong>₹{finalPrice.toLocaleString('en-IN')}</strong>
                          {prod.stock === 0 ? (
                            <span style={{ fontSize: '11px', color: 'var(--danger)', fontWeight: 700 }}>OUT OF STOCK</span>
                          ) : (
                            <button 
                              className="btn btn-secondary" 
                              onClick={(e) => { e.stopPropagation(); addToCart(prod); }}
                              style={{ padding: '6px' }}
                            >
                              +
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ==========================================================================
           EDITORIAL BLOG VIEW
           ========================================================================== */
        <div style={{ maxWidth: '800px', margin: '32px auto', padding: '0 24px', animation: 'slideIn 0.3s ease' }}>
          <h2 style={{ marginBottom: '32px' }}>Editorial Blog Publications</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {blogs.map(blog => (
              <article key={blog.id} className="glass-card" style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', padding: '24px' }}>
                <img 
                  src={blog.image} 
                  alt={blog.title} 
                  style={{ width: '220px', height: '140px', borderRadius: '8px', objectFit: 'cover' }}
                />
                <div style={{ flex: 1, minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)' }}>
                    <span>By {blog.author}</span>
                    <span>{new Date(blog.date).toLocaleDateString()}</span>
                  </div>
                  <h3 style={{ fontSize: '18px' }}>{blog.title}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{blog.summary}</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic', borderTop: '1px dashed var(--border-color)', paddingTop: '8px', marginTop: 'auto' }}>
                    {blog.content}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* ==========================================================================
         SHOPPING CART DRAWER
         ========================================================================== */}
      <div className={`cart-drawer ${showCartDrawer ? 'open' : ''}`}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingCart size={18} />
            <span>Shopping Cart ({cartCount})</span>
          </h3>
          <button className="action-btn" onClick={() => setShowCartDrawer(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Cart items list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {cart.length === 0 ? (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', color: 'var(--text-muted)' }}>
              <ShoppingBag size={48} />
              <p>Your shopping cart bag is empty.</p>
            </div>
          ) : (
            cart.map(item => {
              const finalPrice = item.product.discountPrice || item.product.price;
              return (
                <div key={item.product.id} style={{ display: 'flex', gap: '12px', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
                  <img src={item.product.images[0]} alt={item.product.name} style={{ width: '50px', height: '50px', borderRadius: '6px', objectFit: 'cover' }} />
                  <div style={{ flex: 1 }}>
                    <h5 style={{ fontSize: '13px', fontWeight: 700 }}>{item.product.name}</h5>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>₹{finalPrice}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button className="btn btn-secondary" onClick={() => updateCartQty(item.product.id, -1)} style={{ padding: '2px 8px', fontSize: '12px' }}>-</button>
                    <span style={{ fontSize: '13px', fontWeight: 700 }}>{item.quantity}</span>
                    <button className="btn btn-secondary" onClick={() => updateCartQty(item.product.id, 1)} style={{ padding: '2px 8px', fontSize: '12px' }} disabled={item.quantity >= item.product.stock}>+</button>
                    <button className="action-btn" onClick={() => removeFromCart(item.product.id)} style={{ color: 'var(--danger)', marginLeft: '8px' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Subtotals & checkouts */}
        {cart.length > 0 && (
          <div style={{ padding: '24px', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            
            {/* Coupon field */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                placeholder="Enter Promo Code..." 
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                style={{ padding: '8px 12px', fontSize: '12px' }}
              />
              <button className="btn btn-secondary" onClick={applyCoupon} style={{ fontSize: '12px', padding: '8px 12px' }}>
                Apply
              </button>
            </div>
            {couponError && <p style={{ color: 'var(--danger)', fontSize: '11px' }}>{couponError}</p>}
            {appliedCoupon && (
              <p style={{ color: 'var(--success)', fontSize: '11px', fontWeight: 700 }}>
                Coupon code {appliedCoupon.code} applied! (-₹{discountAmount})
              </p>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span>Subtotal:</span>
              <span>₹{cartSubtotal}</span>
            </div>

            {appliedCoupon && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--success)' }}>
                <span>Promo Discount:</span>
                <span>-₹{discountAmount}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '15px', borderTop: '1px dashed var(--border-color)', paddingTop: '8px' }}>
              <span>Final Total:</span>
              <span style={{ color: 'var(--primary)' }}>₹{cartTotal.toLocaleString('en-IN')}</span>
            </div>

            {!showCheckout ? (
              <button className="btn btn-primary" onClick={() => setShowCheckout(true)} style={{ width: '100%', padding: '12px' }}>
                Proceed to Checkout
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)' }}>
                <h4 style={{ fontSize: '12px' }}>Billing Information</h4>
                <div>
                  <label style={{ fontSize: '11px' }}>Customer Name</label>
                  <input type="text" placeholder="e.g. Arjun Sharma" value={custName} onChange={(e) => setCustName(e.target.value)} style={{ padding: '6px 8px', fontSize: '12px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px' }}>Email Address</label>
                  <input type="email" placeholder="e.g. arjun@mail.com" value={custEmail} onChange={(e) => setCustEmail(e.target.value)} style={{ padding: '6px 8px', fontSize: '12px' }} />
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <button 
                    type="button" 
                    className="btn btn-primary" 
                    onClick={() => handleCheckoutSubmit(true)}
                    disabled={paymentLoading}
                    style={{ flex: 1, fontSize: '11px', padding: '8px' }}
                  >
                    {paymentLoading ? 'Processing...' : 'Simulate Success'}
                  </button>
                  
                  <button 
                    type="button" 
                    className="btn btn-danger" 
                    onClick={() => handleCheckoutSubmit(false)}
                    disabled={paymentLoading}
                    style={{ flex: 1, fontSize: '11px', padding: '8px' }}
                  >
                    Simulate Failure
                  </button>
                </div>
                {paymentFailed && (
                  <p style={{ color: 'var(--danger)', fontSize: '10px', textAlign: 'center', marginTop: '4px' }}>
                    Payment Simulation Failed. Insufficient funds or card decline. Check notification logs in Admin!
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Checkout Success lightbox */}
      {orderComplete && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300 }}>
          <div className="glass-card" style={{ width: '400px', backgroundColor: 'var(--bg-secondary)', textAlign: 'center', padding: '40px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'var(--success-light)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
              <ShieldCheck size={36} />
            </div>
            <h2>Order Placed Successfully!</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '8px', marginBottom: '24px' }}>
              Your order ID is <strong>{orderComplete}</strong>. The package is registered for dispatch.
            </p>
            <button className="btn btn-primary" onClick={() => setOrderComplete(null)}>
              Continue Shopping
            </button>
          </div>
        </div>
      )}
      {/* ==========================================================================
         FLOATING AI CHATBOT FINDER
         ========================================================================== */}
      {/* Floating Chat Trigger Button */}
      <button
        onClick={() => setChatOpen(!chatOpen)}
        style={{
          position: 'fixed',
          right: '24px',
          bottom: '24px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'var(--primary-gradient)',
          color: '#ffffff',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(99, 102, 241, 0.35)',
          zIndex: 999,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: chatOpen ? 'rotate(90deg) scale(0.95)' : 'scale(1)'
        }}
        title="Ask Gokul Assistant"
        onMouseEnter={(e) => e.currentTarget.style.transform = chatOpen ? 'rotate(90deg) scale(0.95)' : 'scale(1.08)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = chatOpen ? 'rotate(90deg) scale(0.95)' : 'scale(1)'}
      >
        {chatOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

      {/* Chat window overlay panel */}
      {chatOpen && (
        <div
          className="glass-card"
          style={{
            position: 'fixed',
            right: '24px',
            bottom: '90px',
            width: '380px',
            height: '500px',
            zIndex: 999,
            padding: 0,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
            border: '1px solid var(--border-color)',
            animation: 'chatSlideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            background: 'var(--bg-glass)'
          }}
        >
          {/* Chat Header */}
          <div
            style={{
              padding: '16px 20px',
              background: 'var(--primary-gradient)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div 
                style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '50%', 
                  backgroundColor: 'rgba(255,255,255,0.2)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}
              >
                <Bot size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 800, margin: 0 }}>Gokul AI Assistant</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--success)' }}></span>
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.8)' }}>Metrology Support</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setChatOpen(false)}
              style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', opacity: 0.8 }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Chat Messages Log */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              backgroundColor: 'var(--bg-primary)'
            }}
          >
            {chatMessages.map(msg => (
              <div 
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  gap: '4px'
                }}
              >
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: msg.sender === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                    backgroundColor: msg.sender === 'user' ? 'var(--primary)' : 'var(--bg-secondary)',
                    color: msg.sender === 'user' ? '#ffffff' : 'var(--text-primary)',
                    fontSize: '13px',
                    lineHeight: '1.4',
                    border: msg.sender === 'user' ? 'none' : '1px solid var(--border-color)',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                  }}
                >
                  {msg.text}
                </div>

                {/* Suggested Products list */}
                {msg.products && msg.products.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px', width: '260px' }}>
                    {msg.products.map(prod => (
                      <div
                        key={prod.id}
                        onClick={() => {
                          setSelectedProductId(prod.id);
                          setChatOpen(false);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        style={{
                          display: 'flex',
                          gap: '8px',
                          alignItems: 'center',
                          padding: '8px',
                          backgroundColor: 'var(--bg-secondary)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'var(--transition)',
                          boxShadow: '0 4px 10px rgba(0,0,0,0.02)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--primary)';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'var(--border-color)';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        <img 
                          src={prod.images[0]} 
                          alt={prod.name} 
                          style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} 
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h5 style={{ fontSize: '11.5px', fontWeight: 700, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-primary)' }}>
                            {prod.name}
                          </h5>
                          <span style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: 700 }}>
                            ₹{prod.price.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {chatTyping && (
              <div 
                style={{
                  alignSelf: 'flex-start',
                  padding: '10px 14px',
                  borderRadius: '12px 12px 12px 2px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span className="dot" style={{ width: '5px', height: '5px', backgroundColor: 'var(--text-muted)', borderRadius: '50%', animation: 'bounce 0.6s infinite alternate' }}></span>
                <span className="dot" style={{ width: '5px', height: '5px', backgroundColor: 'var(--text-muted)', borderRadius: '50%', animation: 'bounce 0.6s infinite alternate 0.2s' }}></span>
                <span className="dot" style={{ width: '5px', height: '5px', backgroundColor: 'var(--text-muted)', borderRadius: '50%', animation: 'bounce 0.6s infinite alternate 0.4s' }}></span>
              </div>
            )}
          </div>

          {/* Quick suggestions footer bar */}
          <div 
            style={{ 
              padding: '8px 12px', 
              display: 'flex', 
              gap: '6px', 
              overflowX: 'auto', 
              whiteSpace: 'nowrap',
              borderTop: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-secondary)'
            }}
          >
            {[
              'Vernier Caliper',
              'Micrometer',
              'Dial Indicator',
              'Slip Gauge'
            ].map(prompt => (
              <button
                key={prompt}
                onClick={() => submitChatText(prompt)}
                style={{
                  fontSize: '11px',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'var(--transition)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary)';
                  e.currentTarget.style.color = 'var(--primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Form Input */}
          <form
            onSubmit={handleSendChat}
            style={{
              padding: '12px 16px',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              gap: '8px',
              backgroundColor: 'var(--bg-secondary)'
            }}
          >
            <input
              type="text"
              placeholder="Ask for calipers, gauges..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              style={{
                flex: 1,
                height: '38px',
                fontSize: '13px',
                padding: '0 12px',
                borderRadius: '6px',
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-color)'
              }}
            />
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '38px', height: '38px', padding: 0, borderRadius: '6px', flexShrink: 0 }}
            >
              <Send size={15} />
            </button>
          </form>
          
          {/* Embedded animations for chatbot */}
          <style>{`
            @keyframes chatSlideUp {
              from { opacity: 0; transform: translateY(16px); }
              to { opacity: 1; transform: translateY(0); }
            }
            @keyframes bounce {
              to { transform: translateY(-4px); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
};
