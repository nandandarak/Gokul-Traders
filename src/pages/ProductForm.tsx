import React, { useState, useEffect } from 'react';
import { useECommerce, Product } from '../context/ECommerceContext';
import { 
  ArrowLeft, Upload, Sparkles, Check, AlertCircle, 
  Trash, Plus, Eye, Code, FileText, RefreshCw 
} from 'lucide-react';

interface ProductFormProps {
  productId?: string; // If set, we are editing
  onClose: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({ productId, onClose }) => {
  const { products, addProduct, updateProduct, categories, currentRole } = useECommerce();
  
  const [activeTab, setActiveTab] = useState<'manual' | 'ai'>('manual');
  const [previewMode, setPreviewMode] = useState<boolean>(false);

  // Form Field States
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState(0);
  const [discountPrice, setDiscountPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [sku, setSku] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [tagsInput, setTagsInput] = useState('');
  const [specGrid, setSpecGrid] = useState<{ key: string; value: string }[]>([
    { key: 'Color', value: '' },
    { key: 'Warranty', value: '' }
  ]);
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [status, setStatus] = useState<Product['status']>('Draft');
  const [publishDate, setPublishDate] = useState('');

  // Editing state sync
  useEffect(() => {
    if (productId) {
      const prod = products.find(p => p.id === productId);
      if (prod) {
        setName(prod.name);
        setDescription(prod.description);
        setCategory(prod.category);
        setSubcategory(prod.subcategory);
        setBrand(prod.brand);
        setPrice(prod.price);
        setDiscountPrice(prod.discountPrice || 0);
        setStock(prod.stock);
        setSku(prod.sku);
        setImageUrl(prod.images[0] || '');
        setTagsInput(prod.tags.join(', '));
        setSpecGrid(Object.entries(prod.specifications).map(([key, value]) => ({ key, value })));
        setSeoTitle(prod.seoTitle);
        setSeoDescription(prod.seoDescription);
        setStatus(prod.status);
        setPublishDate(prod.publishDate || '');
      }
    }
  }, [productId, products]);

  // Handle SKU Auto-Generation
  const handleAutoSku = () => {
    if (name && brand) {
      const bPart = brand.slice(0, 3).toUpperCase();
      const nPart = name.slice(0, 3).toUpperCase();
      const rand = Math.floor(100 + Math.random() * 900);
      setSku(`${bPart}-${nPart}-${rand}`);
    }
  };

  // Direct Image File Handlers
  const handleImageFile = (file: File) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('Image size is too large (maximum 2MB). Please select a smaller file.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageFile(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  // Specs helper
  const addSpecRow = () => {
    setSpecGrid(prev => [...prev, { key: '', value: '' }]);
  };

  const removeSpecRow = (index: number) => {
    setSpecGrid(prev => prev.filter((_, idx) => idx !== index));
  };

  const updateSpecRow = (index: number, field: 'key' | 'value', text: string) => {
    setSpecGrid(prev => prev.map((row, idx) => idx === index ? { ...row, [field]: text } : row));
  };

  // Form Submit Manual
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentRole === 'Staff') return;

    // Build specs record
    const specsRecord: Record<string, string> = {};
    specGrid.forEach(row => {
      if (row.key && row.value) specsRecord[row.key] = row.value;
    });

    const tagsArray = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    const imagesArray = imageUrl ? [imageUrl] : ['https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600'];

    const productData = {
      name,
      description,
      category: category || 'General',
      subcategory: subcategory || 'Miscellaneous',
      brand: brand || 'Generic',
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : undefined,
      stock: Number(stock),
      sku: sku || `SKU-${Date.now()}`,
      images: imagesArray,
      tags: tagsArray,
      specifications: specsRecord,
      seoTitle: seoTitle || name,
      seoDescription: seoDescription || description.slice(0, 150),
      status,
      publishDate: status === 'Scheduled' ? publishDate : undefined
    };

    if (productId) {
      updateProduct(productId, productData);
    } else {
      addProduct(productData);
    }

    onClose();
  };

  // AI-Extractor state
  const [aiUploading, setAiUploading] = useState(false);
  const [aiStep, setAiStep] = useState(0);
  const [aiProgress, setAiProgress] = useState(0);
  const [aiConfidence, setAiConfidence] = useState(0);
  const [extractedProducts, setExtractedProducts] = useState<any[]>([]);
  const [activeExtractedIndex, setActiveExtractedIndex] = useState(0);

  const aiSteps = [
    'Parsing document structures...',
    'Running Deep OCR on graphics blocks...',
    'Extracting semantic specifications...',
    'Structuring draft details & rendering images...'
  ];

  const handleAiUpload = () => {
    setAiUploading(true);
    setAiProgress(0);
    setAiStep(0);
    setExtractedProducts([]);

    // Simulate progress phases
    const interval = setInterval(() => {
      setAiProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setAiUploading(false);
          // Seed Extracted Drafts
          setAiConfidence(94);
          setExtractedProducts([
            {
              name: 'Nova Soundbar Subwoofer',
              description: 'Superb 120W cinematic soundbar with immersive dual subwoofers, Bluetooth 5.2 link, and customizable DSP configurations. Slim premium design crafted for modern lounge settings.',
              category: 'Electronics',
              subcategory: 'Audio',
              brand: 'Nova',
              price: 8999,
              stock: 35,
              sku: 'NOV-SND-980',
              image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop&q=80',
              tags: 'soundbar, audio, home-theater, wireless',
              specifications: { Output: '120 Watts', Connection: 'Bluetooth 5.2, HDMI Arc', Driver: '4 Full-Range' },
              seoTitle: 'Nova Cinematic Soundbar - Immersive Sound',
              seoDescription: 'Experience true cinematic sound with Nova 120W soundbar. Order now.'
            },
            {
              name: 'AeroAir Purifier 3S',
              description: 'Smart air purifier equipped with 3-stage H13 True HEPA filters, capturing 99.97% of airborne micro-particles. Operates silently at 22dB, making it perfect for office workspaces or baby bedrooms.',
              category: 'Smart Home',
              subcategory: 'Appliances',
              brand: 'AeroAir',
              price: 12499,
              stock: 12,
              sku: 'APF-3S-441',
              image: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&auto=format&fit=crop&q=80',
              tags: 'airpurifier, health, cleanair, home',
              specifications: { Filter: 'H13 HEPA', CADR: '250 m³/h', Noise: '22dB to 48dB' },
              seoTitle: 'AeroAir Purifier 3S with HEPA Filter',
              seoDescription: 'Smart silent air purifier for home and bedrooms. Order AeroAir.'
            }
          ]);
          return 100;
        }
        const nextProg = prev + 5;
        if (nextProg === 25) setAiStep(1);
        if (nextProg === 50) setAiStep(2);
        if (nextProg === 75) setAiStep(3);
        return nextProg;
      });
    }, 150);
  };

  const handleSaveAiDraft = (index: number) => {
    if (currentRole === 'Staff') return;
    const item = extractedProducts[index];
    addProduct({
      name: item.name,
      description: item.description,
      category: item.category,
      subcategory: item.subcategory,
      brand: item.brand,
      price: item.price,
      stock: item.stock,
      sku: item.sku,
      images: [item.image],
      tags: item.tags.split(',').map((t: string) => t.trim()),
      specifications: item.specifications,
      seoTitle: item.seoTitle,
      seoDescription: item.seoDescription,
      status: 'Draft'
    });
    // Remove from active extraction list
    setExtractedProducts(prev => prev.filter((_, idx) => idx !== index));
    setActiveExtractedIndex(0);
  };

  const handleEditExtractedField = (index: number, key: string, val: any) => {
    setExtractedProducts(prev => prev.map((item, idx) => {
      if (idx === index) {
        return { ...item, [key]: val };
      }
      return item;
    }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'slideIn 0.3s ease-out' }}>
      
      {/* Top action header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'space-between' }}>
        <button className="btn btn-secondary" onClick={onClose} style={{ padding: '8px 12px' }}>
          <ArrowLeft size={16} />
          <span>Back to products</span>
        </button>

        <h3 style={{ fontSize: '18px' }}>
          {productId ? 'Modify Catalog Product' : 'Create New Product'}
        </h3>
        
        <div style={{ width: '120px' }}></div>
      </div>

      {!productId && (
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', gap: '24px' }}>
          <button 
            onClick={() => setActiveTab('manual')}
            style={{ 
              background: 'none', border: 'none', padding: '12px 6px', fontSize: '14px', fontWeight: 700, 
              color: activeTab === 'manual' ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: activeTab === 'manual' ? '2px solid var(--primary)' : 'none',
              cursor: 'pointer'
            }}
          >
            Manual Entry Creator
          </button>
          
          <button 
            onClick={() => setActiveTab('ai')}
            style={{ 
              background: 'none', border: 'none', padding: '12px 6px', fontSize: '14px', fontWeight: 700, 
              color: activeTab === 'ai' ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: activeTab === 'ai' ? '2px solid var(--primary)' : 'none',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            <Sparkles size={14} />
            <span>AI Catalog PDF Importer</span>
          </button>
        </div>
      )}

      {activeTab === 'manual' ? (
        <div style={{ display: 'grid', gridTemplateColumns: previewMode ? '1fr 1fr' : '1fr', gap: '24px' }}>
          
          {/* Manual Entry Form */}
          <form className="glass-card" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ fontSize: '15px' }}>Product Configurations</h4>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setPreviewMode(!previewMode)}
                style={{ fontSize: '12px', padding: '6px 12px' }}
              >
                {previewMode ? <Code size={14} /> : <Eye size={14} />}
                <span>{previewMode ? 'Hide Live Preview' : 'Show Live Preview'}</span>
              </button>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Product Name*</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                  placeholder="e.g. NeoSound Earbuds"
                />
              </div>

              <div className="form-group">
                <label>Brand Name</label>
                <input 
                  type="text" 
                  value={brand} 
                  onChange={(e) => setBrand(e.target.value)} 
                  placeholder="e.g. Gokul Precision"
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <input 
                  type="text" 
                  list="categoriesList"
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)} 
                  placeholder="e.g. Electronics"
                />
                <datalist id="categoriesList">
                  {categories.map(c => <option key={c.id} value={c.name} />)}
                </datalist>
              </div>

              <div className="form-group">
                <label>Subcategory</label>
                <input 
                  type="text" 
                  value={subcategory} 
                  onChange={(e) => setSubcategory(e.target.value)} 
                  placeholder="e.g. Audio"
                />
              </div>

              <div className="form-group">
                <label>SKU Code</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="text" 
                    value={sku} 
                    onChange={(e) => setSku(e.target.value)} 
                    placeholder="e.g. VTX-NSE-10"
                  />
                  <button type="button" className="btn btn-secondary" onClick={handleAutoSku} style={{ padding: '10px' }}>
                    <RefreshCw size={14} />
                  </button>
                </div>
              </div>

              <div className="form-group form-group-full">
                <label>Product Cover Image*</label>
                
                {imageUrl ? (
                  <div 
                    style={{ 
                      position: 'relative',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      backgroundColor: 'var(--bg-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '12px'
                    }}
                  >
                    <img 
                      src={imageUrl} 
                      alt="Product Preview" 
                      style={{ 
                        width: '80px', 
                        height: '80px', 
                        objectFit: 'cover', 
                        borderRadius: '6px',
                        border: '1px solid var(--border-color)'
                      }} 
                    />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Cover Image Loaded</p>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {imageUrl.startsWith('data:') ? 'Local Image File (Encoded Base64)' : 'External Image URL'}
                      </p>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setImageUrl('')}
                      className="btn"
                      style={{ 
                        padding: '10px', 
                        color: 'var(--danger)', 
                        background: 'var(--danger-light)', 
                        borderColor: 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Remove Image"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                ) : (
                  <div 
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    style={{
                      border: `2px dashed ${dragActive ? 'var(--primary)' : 'var(--border-color)'}`,
                      borderRadius: '8px',
                      padding: '24px',
                      textAlign: 'center',
                      backgroundColor: dragActive ? 'var(--primary-light)' : 'var(--bg-secondary)',
                      transition: 'var(--transition)',
                      cursor: 'pointer',
                      position: 'relative'
                    }}
                  >
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageChange}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        opacity: 0,
                        cursor: 'pointer'
                      }}
                    />
                    <Upload size={32} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
                    <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Drag and drop your product image here, or <span style={{ color: 'var(--primary)' }}>browse</span>
                    </p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Supports PNG, JPG, JPEG, WEBP. Maximum 2MB.
                    </p>
                  </div>
                )}

                <div style={{ marginTop: '10px' }}>
                  <button 
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      color: 'var(--primary)', 
                      fontSize: '12px', 
                      fontWeight: 600, 
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    {showUrlInput ? 'Hide URL field' : 'Or paste a direct image URL instead'}
                  </button>
                  
                  {showUrlInput && (
                    <div style={{ marginTop: '8px' }}>
                      <input 
                        type="text" 
                        value={imageUrl} 
                        onChange={(e) => setImageUrl(e.target.value)} 
                        placeholder="Paste direct image graphic link (e.g. https://images.unsplash.com/...)"
                        style={{ fontSize: '12.5px' }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Base Price (₹)*</label>
                <input 
                  type="number" 
                  value={price || ''} 
                  onChange={(e) => setPrice(Number(e.target.value))} 
                  required 
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Discount/Sale Price (₹)</label>
                <input 
                  type="number" 
                  value={discountPrice || ''} 
                  onChange={(e) => setDiscountPrice(Number(e.target.value))} 
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Stock Count*</label>
                <input 
                  type="number" 
                  value={stock || '0'} 
                  onChange={(e) => setStock(Number(e.target.value))} 
                  required 
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Publish Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value as any)}>
                  <option value="Draft">Draft Mode</option>
                  <option value="Published">Publish Immediately</option>
                  <option value="Scheduled">Schedule Release</option>
                  <option value="Archived">Archive</option>
                </select>
              </div>

              {status === 'Scheduled' && (
                <div className="form-group form-group-full">
                  <label>Scheduled Publish Date & Time</label>
                  <input 
                    type="datetime-local" 
                    value={publishDate} 
                    onChange={(e) => setPublishDate(e.target.value)}
                  />
                </div>
              )}

              <div className="form-group form-group-full">
                <label>Description (Markdown rich-text compatible)</label>
                <textarea 
                  rows={4} 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  placeholder="Describe your product functions..."
                />
              </div>

              <div className="form-group form-group-full">
                <label>Product Tags (comma-separated)</label>
                <input 
                  type="text" 
                  value={tagsInput} 
                  onChange={(e) => setTagsInput(e.target.value)} 
                  placeholder="wearables, electronics, audio"
                />
              </div>

              {/* Specifications Block Grid */}
              <div className="form-group form-group-full">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ marginBottom: 0 }}>Product Specifications</label>
                  <button type="button" className="btn btn-secondary" onClick={addSpecRow} style={{ padding: '4px 8px', fontSize: '11px' }}>
                    <Plus size={12} /> Add Row
                  </button>
                </div>
                
                {specGrid.map((row, index) => (
                  <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                    <input 
                      type="text" 
                      placeholder="Property (e.g. Battery)" 
                      value={row.key} 
                      onChange={(e) => updateSpecRow(index, 'key', e.target.value)} 
                      style={{ flex: 1 }}
                    />
                    <input 
                      type="text" 
                      placeholder="Value (e.g. 15 hours)" 
                      value={row.value} 
                      onChange={(e) => updateSpecRow(index, 'value', e.target.value)} 
                      style={{ flex: 1 }}
                    />
                    <button type="button" className="btn btn-secondary" onClick={() => removeSpecRow(index)} style={{ padding: '10px', color: 'var(--danger)' }}>
                      <Trash size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {/* SEO Specifications */}
              <div className="form-group form-group-full" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '8px' }}>
                <h5 style={{ fontSize: '14px', marginBottom: '12px' }}>Search Engine Optimization (SEO)</h5>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label>SEO Title Tag</label>
                    <input 
                      type="text" 
                      value={seoTitle} 
                      onChange={(e) => setSeoTitle(e.target.value)} 
                      placeholder="Custom page title tag..."
                    />
                  </div>
                  <div>
                    <label>SEO Meta Description</label>
                    <textarea 
                      rows={2}
                      value={seoDescription} 
                      onChange={(e) => setSeoDescription(e.target.value)} 
                      placeholder="Custom page meta details..."
                    />
                  </div>
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              {currentRole !== 'Staff' && (
                <button type="submit" className="btn btn-primary">
                  <Check size={16} />
                  <span>{productId ? 'Save Changes' : 'Publish Product'}</span>
                </button>
              )}
            </div>
          </form>

          {/* Live Preview Panel */}
          {previewMode && (
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h4 style={{ fontSize: '15px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Eye size={16} /> Live Preview on Storefront
              </h4>
              
              <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'var(--bg-secondary)' }}>
                <img 
                  src={imageUrl || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600'} 
                  alt="Preview Image" 
                  style={{ width: '100%', height: '260px', objectFit: 'cover' }}
                />
                
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span className="badge badge-info" style={{ marginBottom: '6px' }}>{brand || 'Brand'}</span>
                      <h2 style={{ fontSize: '20px' }}>{name || 'Product Title'}</h2>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Category: {category || 'General'} &gt; {subcategory || 'Sub'}</span>
                    </div>
                    
                    <div style={{ textAlign: 'right' }}>
                      {discountPrice ? (
                        <div>
                          <h3 style={{ color: 'var(--primary)' }}>₹{discountPrice}</h3>
                          <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '12px' }}>₹{price}</span>
                        </div>
                      ) : (
                        <h3 style={{ color: 'var(--primary)' }}>₹{price || 0}</h3>
                      )}
                    </div>
                  </div>

                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                    {description || 'No description entered yet.'}
                  </p>

                  {/* Specs Table */}
                  <div style={{ marginTop: '12px' }}>
                    <h5 style={{ fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>Specifications</h5>
                    <div style={{ border: '1px solid var(--border-color)', borderRadius: '6px', overflow: 'hidden' }}>
                      {specGrid.some(row => row.key && row.value) ? (
                        specGrid.map((row, idx) => row.key && row.value && (
                          <div key={idx} style={{ display: 'flex', borderBottom: idx === specGrid.length - 1 ? 'none' : '1px solid var(--border-color)', fontSize: '12px' }}>
                            <div style={{ width: '120px', padding: '8px', backgroundColor: 'var(--bg-primary)', fontWeight: 700, borderRight: '1px solid var(--border-color)' }}>{row.key}</div>
                            <div style={{ padding: '8px', flex: 1 }}>{row.value}</div>
                          </div>
                        ))
                      ) : (
                        <p style={{ padding: '8px', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>No spec table details.</p>
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  {tagsInput && (
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '12px' }}>
                      {tagsInput.split(',').map((t, idx) => t.trim() && (
                        <span key={idx} className="badge badge-info" style={{ fontSize: '9px' }}>#{t.trim()}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* AI Catalog PDF Extraction Mode */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-card">
            <h4 style={{ fontSize: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} style={{ color: 'var(--primary)' }} /> AI Product Extractor Engine
            </h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px', marginBottom: '20px' }}>
              Upload any commercial catalog PDF or product details brochure. Our system extracts specifications tables, images, pricing structures, and generates search-optimized title cards.
            </p>

            {!aiUploading && extractedProducts.length === 0 ? (
              <div className="ai-dropzone" onClick={handleAiUpload}>
                <Upload size={32} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
                <h4>Drag and Drop Product Catalog PDF here</h4>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Supports .pdf, .docx, or high-res layout brochures. Max 15MB.
                </p>
                <button type="button" className="btn btn-secondary" style={{ marginTop: '16px', fontSize: '12px' }}>
                  Browse Local Files
                </button>
              </div>
            ) : aiUploading ? (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <Sparkles size={32} style={{ color: 'var(--primary)', animation: 'spin 2s linear infinite' }} />
                <h4 style={{ marginTop: '16px' }}>Processing catalog attachment...</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {aiSteps[aiStep]}
                </p>
                <div style={{ maxWidth: '300px', margin: '20px auto 0 auto' }}>
                  <div className="ai-progress-bar">
                    <div className="ai-progress-fill" style={{ width: `${aiProgress}%` }}></div>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>{aiProgress}% finished</span>
                </div>
              </div>
            ) : (
              /* PDF Extracted Review Screen */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--success-light)', padding: '12px 20px', borderRadius: '8px', border: '1px solid var(--success)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Check size={18} style={{ color: 'var(--success)' }} />
                    <div>
                      <strong style={{ color: 'var(--success)', fontSize: '13px' }}>AI Processing Complete</strong>
                      <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        Successfully extracted {extractedProducts.length} items from brochure attachments.
                      </p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Confidence Score</span>
                    <h4 style={{ color: 'var(--success)', fontSize: '18px', fontWeight: 800 }}>{aiConfidence}%</h4>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '24px' }}>
                  {/* Left Drawer list items */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>EXTRACTED ITEMS</span>
                    {extractedProducts.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveExtractedIndex(idx)}
                        className="btn"
                        style={{
                          width: '100%',
                          justifyContent: 'flex-start',
                          padding: '10px',
                          fontSize: '12px',
                          background: activeExtractedIndex === idx ? 'var(--primary-light)' : 'var(--bg-primary)',
                          color: activeExtractedIndex === idx ? 'var(--primary)' : 'var(--text-primary)',
                          border: `1px solid ${activeExtractedIndex === idx ? 'var(--primary)' : 'var(--border-color)'}`
                        }}
                      >
                        <FileText size={14} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.name || 'Unnamed item'}
                        </span>
                      </button>
                    ))}
                    
                    <button 
                      className="btn btn-secondary" 
                      onClick={() => { setExtractedProducts([]); setAiProgress(0); }}
                      style={{ marginTop: '16px', fontSize: '11px' }}
                    >
                      Clear and Re-upload
                    </button>
                  </div>

                  {/* Right Edit & Approve Form panel */}
                  {extractedProducts[activeExtractedIndex] && (
                    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ fontSize: '14px' }}>Edit Extracted Draft</h4>
                        <span className="badge badge-success">Confidence: 94%</span>
                      </div>

                      <div className="form-grid">
                        <div className="form-group">
                          <label>Product Title</label>
                          <input 
                            type="text" 
                            value={extractedProducts[activeExtractedIndex].name} 
                            onChange={(e) => handleEditExtractedField(activeExtractedIndex, 'name', e.target.value)}
                          />
                        </div>

                        <div className="form-group">
                          <label>SKU</label>
                          <input 
                            type="text" 
                            value={extractedProducts[activeExtractedIndex].sku} 
                            onChange={(e) => handleEditExtractedField(activeExtractedIndex, 'sku', e.target.value)}
                          />
                        </div>

                        <div className="form-group">
                          <label>Category</label>
                          <input 
                            type="text" 
                            value={extractedProducts[activeExtractedIndex].category} 
                            onChange={(e) => handleEditExtractedField(activeExtractedIndex, 'category', e.target.value)}
                          />
                        </div>

                        <div className="form-group">
                          <label>Brand</label>
                          <input 
                            type="text" 
                            value={extractedProducts[activeExtractedIndex].brand} 
                            onChange={(e) => handleEditExtractedField(activeExtractedIndex, 'brand', e.target.value)}
                          />
                        </div>

                        <div className="form-group">
                          <label>Price (₹)</label>
                          <input 
                            type="number" 
                            value={extractedProducts[activeExtractedIndex].price} 
                            onChange={(e) => handleEditExtractedField(activeExtractedIndex, 'price', Number(e.target.value))}
                          />
                        </div>

                        <div className="form-group">
                          <label>Stock</label>
                          <input 
                            type="number" 
                            value={extractedProducts[activeExtractedIndex].stock} 
                            onChange={(e) => handleEditExtractedField(activeExtractedIndex, 'stock', Number(e.target.value))}
                          />
                        </div>

                        <div className="form-group form-group-full">
                          <label>Image Preview</label>
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <img 
                              src={extractedProducts[activeExtractedIndex].image} 
                              alt="Extracted" 
                              style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--border-color)' }}
                            />
                            <input 
                              type="text" 
                              value={extractedProducts[activeExtractedIndex].image} 
                              onChange={(e) => handleEditExtractedField(activeExtractedIndex, 'image', e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="form-group form-group-full">
                          <label>Description</label>
                          <textarea 
                            rows={3} 
                            value={extractedProducts[activeExtractedIndex].description} 
                            onChange={(e) => handleEditExtractedField(activeExtractedIndex, 'description', e.target.value)}
                          />
                        </div>

                        <div className="form-group form-group-full">
                          <label>Tags</label>
                          <input 
                            type="text" 
                            value={extractedProducts[activeExtractedIndex].tags} 
                            onChange={(e) => handleEditExtractedField(activeExtractedIndex, 'tags', e.target.value)}
                          />
                        </div>
                      </div>

                      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                        {currentRole !== 'Staff' && (
                          <button 
                            className="btn btn-primary" 
                            onClick={() => handleSaveAiDraft(activeExtractedIndex)}
                            style={{ background: 'var(--primary-gradient)' }}
                          >
                            <Sparkles size={14} />
                            <span>Save Extracted Draft</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
