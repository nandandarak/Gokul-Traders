import React, { createContext, useContext, useState, useEffect } from 'react';

// Interfaces
export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  brand: string;
  price: number;
  discountPrice?: number;
  stock: number;
  sku: string;
  images: string[];
  tags: string[];
  specifications: Record<string, string>;
  seoTitle: string;
  seoDescription: string;
  status: 'Published' | 'Draft' | 'Scheduled' | 'Archived';
  publishDate?: string;
  version: number;
  lastUpdated: string;
  reviews: Review[];
  approvalWorkflow?: {
    status: 'Pending Review' | 'Approved' | 'Rejected';
    requestedBy: string;
    approvedBy?: string;
    feedback?: string;
  };
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  approved: boolean;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  total: number;
  status: 'New' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  date: string;
  trackingNumber?: string;
  refundRequested?: boolean;
  refundApproved?: boolean;
  history: { status: string; date: string; note: string }[];
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  totalSpend: number;
  ordersCount: number;
  notes: string;
  segment: 'VIP' | 'Regular' | 'New' | 'Inactive';
  loyaltyStatus: 'Gold' | 'Silver' | 'Bronze';
  joinDate: string;
}

export interface Category {
  id: string;
  name: string;
  subcategories: string[];
  bannerUrl: string;
  displayOrder: number;
}

export interface Coupon {
  code: string;
  type: 'Percentage' | 'Fixed';
  value: number;
  minSpend: number;
  isActive: boolean;
  uses: number;
}

export interface Blog {
  id: string;
  title: string;
  summary: string;
  content: string;
  image: string;
  date: string;
  author: string;
}

export interface AuditLog {
  id: string;
  user: string;
  role: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface SystemNotification {
  id: string;
  type: 'order' | 'stock' | 'payment' | 'approval';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface ECommerceContextType {
  products: Product[];
  orders: Order[];
  customers: Customer[];
  categories: Category[];
  coupons: Coupon[];
  blogs: Blog[];
  auditLogs: AuditLog[];
  notifications: SystemNotification[];
  currentRole: 'Super Admin' | 'Manager' | 'Staff';
  setRole: (role: 'Super Admin' | 'Manager' | 'Staff') => void;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  language: 'en' | 'es' | 'hi';
  setLanguage: (lang: 'en' | 'es' | 'hi') => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  
  // Actions
  addProduct: (product: Omit<Product, 'id' | 'version' | 'lastUpdated' | 'reviews'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  duplicateProduct: (id: string) => void;
  addReview: (productId: string, review: Omit<Review, 'id' | 'approved'>) => void;
  moderateReview: (productId: string, reviewId: string, approved: boolean) => void;
  
  // Inventory actions
  adjustStock: (productId: string, quantity: number, reason: string) => void;
  
  // Order actions
  placeOrder: (customerInfo: { name: string; email: string }, items: OrderItem[], total: number) => void;
  updateOrderStatus: (orderId: string, status: Order['status'], note: string, tracking?: string) => void;
  requestRefund: (orderId: string) => void;
  approveRefund: (orderId: string, approve: boolean) => void;
  
  // Customer actions
  updateCustomerNotes: (customerId: string, notes: string) => void;
  
  // Category actions
  addCategory: (category: Omit<Category, 'id' | 'displayOrder'>) => void;
  updateCategoriesOrder: (categories: Category[]) => void;
  
  // Content actions
  updateHomeBanner: (title: string, subtitle: string, bannerUrl: string) => void;
  homeBanner: { title: string; subtitle: string; bannerUrl: string };
  addBlog: (blog: Omit<Blog, 'id' | 'date'>) => void;
  
  // Coupon actions
  addCoupon: (coupon: Coupon) => void;
  toggleCoupon: (code: string) => void;
  
  // Audit/Notifications actions
  addLog: (action: string, details: string) => void;
  clearNotifications: () => void;
  markNotificationsAsRead: () => void;
}

const ECommerceContext = createContext<ECommerceContextType | undefined>(undefined);

// Initial Seed Data
const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Digital Vernier Caliper (150mm)',
    description: 'Professional 150mm (6 inch) digital vernier caliper for high-precision workshop measurements. Features a large, easy-to-read LCD display, metric/imperial conversion, fine-adjustment roller, and zero setting at any point. Crafted from hardened stainless steel with a protective storage case.',
    category: 'Linear Measurement',
    subcategory: 'Vernier Calipers',
    brand: 'Gokul Precision',
    price: 2499,
    discountPrice: 1999,
    stock: 45,
    sku: 'GKL-DVC-150',
    images: ['https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=600&auto=format&fit=crop&q=80'],
    tags: ['caliper', 'measuring', 'precision', 'engineering'],
    specifications: { Range: '0-150mm / 0-6 inch', Resolution: '0.01mm / 0.0005 inch', Accuracy: '±0.02mm', Material: 'Hardened Stainless Steel' },
    seoTitle: 'Digital Vernier Caliper 150mm - Gokul Precision Tools',
    seoDescription: 'Buy high precision 150mm digital vernier caliper with LCD display. Precision measuring instruments from Gokul Traders.',
    status: 'Published',
    version: 1,
    lastUpdated: new Date(Date.now() - 3600000 * 24).toISOString(),
    reviews: [
      { id: 'rev-1', userName: 'Rajesh K.', rating: 5, comment: 'Very accurate readings, zero drift works perfectly.', date: new Date().toISOString(), approved: true }
    ]
  },
  {
    id: 'prod-2',
    name: 'Outside Micrometer Screw Gauge',
    description: 'High-accuracy outside micrometer screw gauge designed for engineering workshops and machine tool inspection. Offers a 0-25mm measuring range with a mechanical vernier scale resolution of 0.01mm. Friction thimble design ensures constant pressure for exact repeatability.',
    category: 'Linear Measurement',
    subcategory: 'Micrometers',
    brand: 'Mitutoyo Std',
    price: 3499,
    stock: 20,
    sku: 'GKL-OMM-025',
    images: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80'],
    tags: ['micrometer', 'screwgauge', 'metrology', 'lathe'],
    specifications: { Range: '0-25mm', Graduation: '0.01mm', Accuracy: '±0.004mm', Frame: 'Hammer-tone green finish' },
    seoTitle: 'Precision Outside Micrometer 0-25mm - Gokul Traders',
    seoDescription: 'Accurate outside micrometer screw gauge with friction thimble. Ideal for machining and engine rebuilding.',
    status: 'Published',
    version: 1,
    lastUpdated: new Date().toISOString(),
    reviews: []
  },
  {
    id: 'prod-3',
    name: 'Plunger Dial Indicator Gauge',
    description: 'High-sensitivity plunger dial indicator gauge. Engineered with a shockproof geared movement and jeweled bearings for continuous workshop testing. Perfect for runout checks, shaft alignment, and flatness testing. Includes tolerance index markers.',
    category: 'Precision Calibration',
    subcategory: 'Dial Gauges',
    brand: 'Gokul Precision',
    price: 1899,
    discountPrice: 1599,
    stock: 15,
    sku: 'GKL-PDI-010',
    images: ['https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=80'],
    tags: ['dialgauge', 'alignment', 'machining', 'runout'],
    specifications: { Range: '0-10mm', Resolution: '0.01mm', Dial: '0-100 continuous', Stem: '8mm mounting diameter' },
    seoTitle: 'Plunger Dial Indicator Gauge 0-10mm - Gokul Traders',
    seoDescription: 'Shockproof dial indicator gauge with 0.01mm resolution. Perfect for alignment checks.',
    status: 'Published',
    version: 1,
    lastUpdated: new Date().toISOString(),
    reviews: []
  },
  {
    id: 'prod-4',
    name: 'Digital Angle Finder Protractor',
    description: 'Magnetic digital protractor and angle finder. Displays real-time angle pitch on a backlit LCD screen. Features a hold button to lock measurements, v-groove edges for pipe attachment, and automatic shut-off. Includes zero calibration button.',
    category: 'Electronic & Laser',
    subcategory: 'Angle Finders',
    brand: 'LaserLine',
    price: 2999,
    stock: 0,
    sku: 'GKL-DAF-360',
    images: ['https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&auto=format&fit=crop&q=80'],
    tags: ['protractor', 'digitalangle', 'carpentry', 'welding'],
    specifications: { Range: '4 x 90°', Accuracy: '±0.1° at 0° and 90°', Battery: '2x AAA cells', Magnet: 'Neodymium base' },
    seoTitle: 'Magnetic Digital Angle Finder & Protractor',
    seoDescription: 'Measure pitch and angles digitally with 0.1 degree accuracy. Buy at Gokul Traders.',
    status: 'Published',
    version: 1,
    lastUpdated: new Date().toISOString(),
    reviews: []
  },
  {
    id: 'prod-5',
    name: 'Laser Distance Rangefinder Meter',
    description: 'Professional 50-meter digital laser distance measuring tool. Perfect for quick space sizing, area calculations, volume metrics, and indirect height measurements. Equipped with dual bubble levels, back-lit multi-line display, and drop-resistant housing.',
    category: 'Electronic & Laser',
    subcategory: 'Laser Meters',
    brand: 'LaserLine',
    price: 4999,
    stock: 12,
    sku: 'GKL-LDM-050',
    images: ['https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=600&auto=format&fit=crop&q=80'],
    tags: ['lasermeter', 'rangefinder', 'surveying', 'construction'],
    specifications: { Range: '0.05m to 50m', Laser: 'Class II, 635nm, <1mW', Unit: 'm/in/ft', Memory: '20 reading logs' },
    seoTitle: 'Digital Laser Distance Meter 50m - Gokul Traders',
    seoDescription: 'Compact laser tape measure and distance rangefinder. Instant calculations for length, area, and volume.',
    status: 'Published',
    version: 1,
    lastUpdated: new Date().toISOString(),
    reviews: []
  },
  {
    id: 'prod-6',
    name: 'Metric Slip Gauge Calibration Set',
    description: 'Precision metric slip gauge block calibration set. Made of high-grade steel, heat-treated for dimensional stability. Crucial tool for calibrating workshop calipers, micrometers, and checking comparator accuracy.',
    category: 'Precision Calibration',
    subcategory: 'Slip Gauges',
    brand: 'Gokul Precision',
    price: 12999,
    stock: 5,
    sku: 'GKL-SGS-087',
    images: ['https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80'],
    tags: ['slipgauge', 'gaugeblock', 'calibration', 'standards'],
    specifications: { Blocks: '87 pieces set', Grade: 'Grade 2 workshop', Standard: 'ISO 3650 compliance', Packaging: 'Wooden display box' },
    seoTitle: 'Precision Slip Gauge Calibration Blocks Set - Grade 2',
    seoDescription: 'Calibrate your micrometers and workshop gauges with this 87-piece precision slip gauge set.',
    status: 'Draft',
    version: 1,
    lastUpdated: new Date().toISOString(),
    reviews: []
  }
];

const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-9831',
    customerName: 'Arjun Sharma',
    customerEmail: 'arjun.sharma@example.com',
    items: [{ productId: 'prod-3', productName: 'Plunger Dial Indicator Gauge', price: 1899, quantity: 1 }],
    total: 1899,
    status: 'Delivered',
    date: new Date(Date.now() - 3600000 * 48).toISOString(),
    trackingNumber: 'TRK-IND-99801',
    history: [
      { status: 'New', date: new Date(Date.now() - 3600000 * 48).toISOString(), note: 'Order placed by client.' },
      { status: 'Processing', date: new Date(Date.now() - 3600000 * 44).toISOString(), note: 'Payment validated. Packaging item.' },
      { status: 'Shipped', date: new Date(Date.now() - 3600000 * 30).toISOString(), note: 'Dispatched via Express Courier.' },
      { status: 'Delivered', date: new Date(Date.now() - 3600000 * 6).toISOString(), note: 'Handed over at customer address.' }
    ]
  },
  {
    id: 'ORD-9832',
    customerName: 'Priya Patel',
    customerEmail: 'priya.patel@example.com',
    items: [{ productId: 'prod-1', productName: 'Digital Vernier Caliper (150mm)', price: 2499, quantity: 1 }],
    total: 1999, // discounted
    status: 'Processing',
    date: new Date(Date.now() - 3600000 * 20).toISOString(),
    history: [
      { status: 'New', date: new Date(Date.now() - 3600000 * 20).toISOString(), note: 'Order registered.' },
      { status: 'Processing', date: new Date(Date.now() - 3600000 * 18).toISOString(), note: 'Preparing package at Chennai warehouse.' }
    ]
  },
  {
    id: 'ORD-9833',
    customerName: 'Kabir Mehta',
    customerEmail: 'kabir.m@example.com',
    items: [
      { productId: 'prod-2', productName: 'Outside Micrometer Screw Gauge', price: 3499, quantity: 1 },
      { productId: 'prod-3', productName: 'Plunger Dial Indicator Gauge', price: 1899, quantity: 1 }
    ],
    total: 5398,
    status: 'New',
    date: new Date().toISOString(),
    history: [
      { status: 'New', date: new Date().toISOString(), note: 'Order registered. Waiting payment settlement.' }
    ]
  }
];

const INITIAL_CUSTOMERS: Customer[] = [
  { id: 'cust-1', name: 'Arjun Sharma', email: 'arjun.sharma@example.com', totalSpend: 15000, ordersCount: 4, notes: 'Deliver to Machine Shop B near entrance.', segment: 'VIP', loyaltyStatus: 'Gold', joinDate: '2025-01-12' },
  { id: 'cust-2', name: 'Priya Patel', email: 'priya.patel@example.com', totalSpend: 1999, ordersCount: 1, notes: 'Requires calibration test certificate.', segment: 'Regular', loyaltyStatus: 'Silver', joinDate: '2025-05-18' },
  { id: 'cust-3', name: 'Kabir Mehta', email: 'kabir.m@example.com', totalSpend: 5398, ordersCount: 1, notes: '', segment: 'New', loyaltyStatus: 'Bronze', joinDate: '2026-06-01' },
  { id: 'cust-4', name: 'Meera Nair', email: 'meera.nair@example.com', totalSpend: 0, ordersCount: 0, notes: 'Newsletter lead from tool expo.', segment: 'Inactive', loyaltyStatus: 'Bronze', joinDate: '2026-04-10' }
];

const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Linear Measurement', subcategories: ['Vernier Calipers', 'Micrometers', 'Height Gauges'], bannerUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&auto=format&fit=crop&q=80', displayOrder: 1 },
  { id: 'cat-2', name: 'Precision Calibration', subcategories: ['Slip Gauges', 'Dial Indicators', 'Angle Gauges'], bannerUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200&auto=format&fit=crop&q=80', displayOrder: 2 },
  { id: 'cat-3', name: 'Electronic & Laser', subcategories: ['Laser Rangefinders', 'Digital Protractor'], bannerUrl: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=1200&auto=format&fit=crop&q=80', displayOrder: 3 },
  { id: 'cat-4', name: 'Workshop Essentials', subcategories: ['Steel Rulers', 'Measuring Tapes', 'Pitch Gauges'], bannerUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1200&auto=format&fit=crop&q=80', displayOrder: 4 }
];

const INITIAL_COUPONS: Coupon[] = [
  { code: 'GOKUL10', type: 'Percentage', value: 10, minSpend: 1000, isActive: true, uses: 12 },
  { code: 'CALIBRATE1500', type: 'Fixed', value: 1500, minSpend: 10000, isActive: true, uses: 5 },
  { code: 'SAVEMORE', type: 'Percentage', value: 20, minSpend: 5000, isActive: false, uses: 0 }
];

const INITIAL_BLOGS: Blog[] = [
  {
    id: 'blog-1',
    title: 'Understanding Caliper Calibration Standards',
    summary: 'Essential procedures to ensure measurement repeatability in workshop calipers.',
    content: 'A vernier caliper is the backbone of metal fabrication and toolmaking. Over time, sliding jaws suffer wear and thermal expansions. Regular verification against master slip gauge blocks ensures precision to 0.01mm and prevents costly milling errors.',
    image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop&q=80',
    date: '2026-06-10',
    author: 'Gokul Metrology Team'
  },
  {
    id: 'blog-2',
    title: 'Vernier vs Digital Micrometers',
    summary: 'A guide to choosing mechanical ratchet stops or high-speed LCD indicators.',
    content: 'While digital micrometers display instant absolute values and ease imperial conversions, mechanical micrometers remain the pure favorite. Their physical vernier sleeves never suffer battery failures and provide raw tactile feedback via friction thimbles.',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
    date: '2026-06-15',
    author: 'Gokul Quality Control'
  }
];

export const ECommerceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Persistence Helper
  const getStored = (key: string, initial: any) => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : initial;
  };

  const [products, setProducts] = useState<Product[]>(() => getStored('gt_products', INITIAL_PRODUCTS));
  const [orders, setOrders] = useState<Order[]>(() => getStored('gt_orders', INITIAL_ORDERS));
  const [customers, setCustomers] = useState<Customer[]>(() => getStored('gt_customers', INITIAL_CUSTOMERS));
  const [categories, setCategories] = useState<Category[]>(() => getStored('gt_categories', INITIAL_CATEGORIES));
  const [coupons, setCoupons] = useState<Coupon[]>(() => getStored('gt_coupons', INITIAL_COUPONS));
  const [blogs, setBlogs] = useState<Blog[]>(() => getStored('gt_blogs', INITIAL_BLOGS));
  const [currentRole, setRole] = useState<'Super Admin' | 'Manager' | 'Staff'>(() => getStored('gt_role', 'Super Admin'));
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => getStored('gt_auth', false));
  const [language, setLanguage] = useState<'en' | 'es' | 'hi'>(() => getStored('gt_lang', 'en'));
  const [darkMode, setDarkMode] = useState<boolean>(() => getStored('gt_dark_v2', false));
  
  const [homeBanner, setHomeBanner] = useState<{ title: string; subtitle: string; bannerUrl: string }>(() => 
    getStored('gt_banner', {
      title: 'Precision Industrial Metrology Tools',
      subtitle: 'Gokul Traders - Hardened stainless steel verniers, screw gauges, slip block calibrators, and workshop essentials.',
      bannerUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&auto=format&fit=crop&q=80'
    })
  );

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => getStored('gt_audit', [
    { id: 'log-1', user: 'Admin System', role: 'Super Admin', action: 'Initialize Database', details: 'Database seeded with default mock records.', timestamp: new Date(Date.now() - 3600000 * 24).toISOString() }
  ]));

  const [notifications, setNotifications] = useState<SystemNotification[]>(() => getStored('gt_notifs', [
    { id: 'not-1', type: 'stock', title: 'Low Stock Alert', message: 'Digital Vernier Caliper (150mm) is down to 2 units.', timestamp: new Date(Date.now() - 1200000).toISOString(), read: false },
    { id: 'not-2', type: 'order', title: 'New Order Placed', message: 'Order ORD-9833 placed by Kabir Mehta for ₹5,398.', timestamp: new Date().toISOString(), read: false }
  ]));

  // Sync state to localStorage on changes
  useEffect(() => {
    localStorage.setItem('gt_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('gt_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('gt_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('gt_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('gt_coupons', JSON.stringify(coupons));
  }, [coupons]);

  useEffect(() => {
    localStorage.setItem('gt_blogs', JSON.stringify(blogs));
  }, [blogs]);

  useEffect(() => {
    localStorage.setItem('gt_role', JSON.stringify(currentRole));
  }, [currentRole]);

  useEffect(() => {
    localStorage.setItem('gt_auth', JSON.stringify(isAuthenticated));
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('gt_lang', JSON.stringify(language));
  }, [language]);

  useEffect(() => {
    localStorage.setItem('gt_dark_v2', JSON.stringify(darkMode));
    // Apply toggle class on body
    if (darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('gt_banner', JSON.stringify(homeBanner));
  }, [homeBanner]);

  useEffect(() => {
    localStorage.setItem('gt_audit', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('gt_notifs', JSON.stringify(notifications));
  }, [notifications]);

  // Actions
  const addLog = (action: string, details: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      user: currentRole === 'Super Admin' ? 'Devon Admin' : currentRole === 'Manager' ? 'Siddharth Manager' : 'Neha Staff',
      role: currentRole,
      action,
      details,
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const triggerNotification = (type: SystemNotification['type'], title: string, message: string) => {
    const newNotif: SystemNotification = {
      id: `not-${Date.now()}`,
      type,
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const addProduct = (productData: Omit<Product, 'id' | 'version' | 'lastUpdated' | 'reviews'>) => {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      version: 1,
      lastUpdated: new Date().toISOString(),
      reviews: []
    };
    setProducts(prev => [...prev, newProduct]);
    addLog('Create Product', `Product "${newProduct.name}" created with SKU ${newProduct.sku} as ${newProduct.status}.`);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        const updated = {
          ...p,
          ...updates,
          version: p.version + 1,
          lastUpdated: new Date().toISOString()
        };
        addLog('Update Product', `Product "${updated.name}" (SKU ${updated.sku}) updated. New version: ${updated.version}.`);
        return updated;
      }
      return p;
    }));
  };

  const deleteProduct = (id: string) => {
    const prod = products.find(p => p.id === id);
    if (!prod) return;
    setProducts(prev => prev.filter(p => p.id !== id));
    addLog('Delete Product', `Product "${prod.name}" (SKU ${prod.sku}) was deleted.`);
  };

  const duplicateProduct = (id: string) => {
    const prod = products.find(p => p.id === id);
    if (!prod) return;
    const duplicated: Product = {
      ...prod,
      id: `prod-${Date.now()}`,
      name: `${prod.name} (Copy)`,
      sku: `${prod.sku}-COPY`,
      status: 'Draft',
      version: 1,
      lastUpdated: new Date().toISOString(),
      reviews: []
    };
    setProducts(prev => [...prev, duplicated]);
    addLog('Duplicate Product', `Duplicated "${prod.name}" to create "${duplicated.name}".`);
  };

  const adjustStock = (productId: string, quantity: number, reason: string) => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const newStock = Math.max(0, p.stock + quantity);
        addLog('Stock Adjustment', `Adjusted stock for "${p.name}" by ${quantity > 0 ? '+' : ''}${quantity} units. Reason: ${reason}.`);
        
        // Notification threshold check
        if (newStock === 0) {
          triggerNotification('stock', 'Out of Stock Alert', `"${p.name}" has run out of stock!`);
        } else if (newStock <= 5) {
          triggerNotification('stock', 'Low Stock Alert', `"${p.name}" is low in stock (${newStock} remaining).`);
        }
        
        return { ...p, stock: newStock, lastUpdated: new Date().toISOString() };
      }
      return p;
    }));
  };

  const addReview = (productId: string, reviewData: Omit<Review, 'id' | 'approved'>) => {
    const newReview: Review = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      approved: false // requires admin moderation
    };
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        return { ...p, reviews: [...p.reviews, newReview] };
      }
      return p;
    }));
    triggerNotification('approval', 'New Product Review', `A review was submitted for product ID: ${productId} by ${reviewData.userName}.`);
  };

  const moderateReview = (productId: string, reviewId: string, approved: boolean) => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const reviews = approved 
          ? p.reviews.map(r => r.id === reviewId ? { ...r, approved: true } : r)
          : p.reviews.filter(r => r.id !== reviewId);
        return { ...p, reviews };
      }
      return p;
    }));
    addLog('Moderate Review', `Review ID: ${reviewId} on Product ID: ${productId} was ${approved ? 'approved' : 'rejected/removed'}.`);
  };

  const placeOrder = (customerInfo: { name: string; email: string }, items: OrderItem[], total: number) => {
    const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      id: orderId,
      customerName: customerInfo.name,
      customerEmail: customerInfo.email,
      items,
      total,
      status: 'New',
      date: new Date().toISOString(),
      history: [{ status: 'New', date: new Date().toISOString(), note: 'Order placed via User Portal.' }]
    };

    setOrders(prev => [newOrder, ...prev]);

    // Update customers profiles or add new customer
    setCustomers(prev => {
      const existing = prev.find(c => c.email.toLowerCase() === customerInfo.email.toLowerCase());
      if (existing) {
        const totalSpend = existing.totalSpend + total;
        const ordersCount = existing.ordersCount + 1;
        const segment = totalSpend >= 30000 ? 'VIP' : 'Regular';
        const loyaltyStatus = totalSpend >= 30000 ? 'Gold' : totalSpend >= 10000 ? 'Silver' : 'Bronze';
        return prev.map(c => c.id === existing.id ? { ...c, totalSpend, ordersCount, segment, loyaltyStatus } : c);
      } else {
        const newCustomer: Customer = {
          id: `cust-${Date.now()}`,
          name: customerInfo.name,
          email: customerInfo.email,
          totalSpend: total,
          ordersCount: 1,
          notes: '',
          segment: 'New',
          loyaltyStatus: total >= 10000 ? 'Silver' : 'Bronze',
          joinDate: new Date().toISOString().split('T')[0]
        };
        return [...prev, newCustomer];
      }
    });

    // Reduce stocks
    items.forEach(item => {
      adjustStock(item.productId, -item.quantity, `Sold in order ${orderId}`);
    });

    triggerNotification('order', 'New Order Received', `Order ${orderId} placed by ${customerInfo.name} for ₹${total.toLocaleString('en-IN')}`);
  };

  const updateOrderStatus = (orderId: string, status: Order['status'], note: string, tracking?: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const history = [...o.history, { status, date: new Date().toISOString(), note }];
        addLog('Update Order', `Order ${orderId} status updated to ${status}.`);
        return {
          ...o,
          status,
          trackingNumber: tracking || o.trackingNumber,
          history
        };
      }
      return o;
    }));
  };

  const requestRefund = (orderId: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        triggerNotification('payment', 'Refund Requested', `Customer has requested a refund for order ${orderId}.`);
        return { ...o, refundRequested: true };
      }
      return o;
    }));
  };

  const approveRefund = (orderId: string, approve: boolean) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        let status = o.status;
        if (approve) {
          status = 'Cancelled';
          // return inventory stock
          o.items.forEach(item => {
            adjustStock(item.productId, item.quantity, `Stock returned via refund of ${orderId}`);
          });
          addLog('Approve Refund', `Approved refund for ${orderId}. Order cancelled.`);
        } else {
          addLog('Decline Refund', `Declined refund for ${orderId}.`);
        }
        return {
          ...o,
          status,
          refundRequested: false,
          refundApproved: approve,
          history: [...o.history, { status: approve ? 'Cancelled' : o.status, date: new Date().toISOString(), note: approve ? 'Refund processed and stock returned.' : 'Refund request declined by admin.' }]
        };
      }
      return o;
    }));
  };

  const updateCustomerNotes = (customerId: string, notes: string) => {
    setCustomers(prev => prev.map(c => c.id === customerId ? { ...c, notes } : c));
    addLog('Update Customer', `Updated CRM notes for customer ID: ${customerId}.`);
  };

  const addCategory = (categoryData: Omit<Category, 'id' | 'displayOrder'>) => {
    const newCat: Category = {
      ...categoryData,
      id: `cat-${Date.now()}`,
      displayOrder: categories.length + 1
    };
    setCategories(prev => [...prev, newCat]);
    addLog('Create Category', `Created category "${newCat.name}" with subcategories: ${newCat.subcategories.join(', ')}.`);
  };

  const updateCategoriesOrder = (updatedCats: Category[]) => {
    const ordered = updatedCats.map((cat, idx) => ({ ...cat, displayOrder: idx + 1 }));
    setCategories(ordered);
    addLog('Reorder Categories', `Rearranged primary navigation display ranks.`);
  };

  const updateHomeBanner = (title: string, subtitle: string, bannerUrl: string) => {
    setHomeBanner({ title, subtitle, bannerUrl });
    addLog('Update Store Content', `Updated homepage marketing hero banner settings.`);
  };

  const addBlog = (blogData: Omit<Blog, 'id' | 'date'>) => {
    const newBlog: Blog = {
      ...blogData,
      id: `blog-${Date.now()}`,
      date: new Date().toISOString().split('T')[0]
    };
    setBlogs(prev => [newBlog, ...prev]);
    addLog('Publish Blog Post', `Published article "${newBlog.title}" by ${newBlog.author}.`);
  };

  const addCoupon = (newCoupon: Coupon) => {
    setCoupons(prev => [...prev, newCoupon]);
    addLog('Add Coupon', `Created promotional coupon code ${newCoupon.code}.`);
  };

  const toggleCoupon = (code: string) => {
    setCoupons(prev => prev.map(c => {
      if (c.code === code) {
        addLog('Toggle Coupon', `Coupon code ${code} is now ${!c.isActive ? 'active' : 'inactive'}.`);
        return { ...c, isActive: !c.isActive };
      }
      return c;
    }));
  };

  const login = (email: string, password: string): boolean => {
    const creds: Record<string, { role: 'Super Admin' | 'Manager' | 'Staff', pass: string[], name: string }> = {
      'admin@gokultraders.com': { role: 'Super Admin', pass: ['admin123', 'admin@123'], name: 'Gokul Admin' },
      'manager@gokultraders.com': { role: 'Manager', pass: ['manager123', 'manager@123'], name: 'Gokul Manager' },
      'staff@gokultraders.com': { role: 'Staff', pass: ['staff123', 'staff@123'], name: 'Gokul Staff' }
    };

    const user = creds[email.toLowerCase().trim()];
    if (user && user.pass.includes(password)) {
      setRole(user.role);
      setIsAuthenticated(true);
      
      const newLog: AuditLog = {
        id: `log-${Date.now()}`,
        user: user.name,
        role: user.role,
        action: 'User Login',
        details: `Role "${user.role}" logged in successfully.`,
        timestamp: new Date().toISOString()
      };
      setAuditLogs(prev => [newLog, ...prev]);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      user: currentRole === 'Super Admin' ? 'Devon Admin' : currentRole === 'Manager' ? 'Siddharth Manager' : 'Neha Staff',
      role: currentRole,
      action: 'User Logout',
      details: `Active role session terminated.`,
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const markNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <ECommerceContext.Provider
      value={{
        products,
        orders,
        customers,
        categories,
        coupons,
        blogs,
        auditLogs,
        notifications,
        currentRole,
        setRole,
        isAuthenticated,
        login,
        logout,
        language,
        setLanguage,
        darkMode,
        setDarkMode,
        
        addProduct,
        updateProduct,
        deleteProduct,
        duplicateProduct,
        addReview,
        moderateReview,
        adjustStock,
        placeOrder,
        updateOrderStatus,
        requestRefund,
        approveRefund,
        updateCustomerNotes,
        addCategory,
        updateCategoriesOrder,
        updateHomeBanner,
        homeBanner,
        addBlog,
        addCoupon,
        toggleCoupon,
        addLog,
        clearNotifications,
        markNotificationsAsRead
      }}
    >
      {children}
    </ECommerceContext.Provider>
  );
};

export const useECommerce = () => {
  const context = useContext(ECommerceContext);
  if (context === undefined) {
    throw new Error('useECommerce must be used within an ECommerceProvider');
  }
  return context;
};
