import React, { useState } from 'react';
import { ECommerceProvider, useECommerce } from './context/ECommerceContext';
import { AdminLayout } from './components/AdminLayout';
import { AdminDashboard } from './pages/AdminDashboard';
import { ProductList } from './pages/ProductList';
import { ProductForm } from './pages/ProductForm';
import { InventoryManagement } from './pages/InventoryManagement';
import { OrderManagement } from './pages/OrderManagement';
import { CustomerManagement } from './pages/CustomerManagement';
import { 
  CategoryManagement, 
  ContentManagement, 
  CouponsManagement, 
  ReviewsModeration, 
  AuditLogs 
} from './pages/AdminOtherPages';
import { UserPortal } from './pages/UserPortal';
import { Login } from './pages/Login';
import './App.css';

const AppContent: React.FC = () => {
  const { currentRole, isAuthenticated } = useECommerce();
  
  // Views toggle: 'admin' or 'user' (storefront)
  const [view, setView] = useState<'admin' | 'user'>('admin');
  
  // Admin inner tabs: 'dashboard', 'products', 'inventory', 'orders', etc.
  const [adminTab, setAdminTab] = useState<string>('dashboard');

  // Products flow tracking states
  const [editingProductId, setEditingProductId] = useState<string | undefined>(undefined);
  const [isAddingProduct, setIsAddingProduct] = useState<boolean>(false);

  const handleEditProduct = (id: string) => {
    setEditingProductId(id);
    setIsAddingProduct(false);
  };

  const handleAddProduct = () => {
    setEditingProductId(undefined);
    setIsAddingProduct(true);
  };

  const handleCloseProductForm = () => {
    setEditingProductId(undefined);
    setIsAddingProduct(false);
  };

  // Safe tab switcher: resets edit form state when swapping tabs
  const handleSetTab = (tab: string) => {
    setAdminTab(tab);
    handleCloseProductForm();
  };

  if (view === 'user') {
    return <UserPortal setView={setView} />;
  }

  if (!isAuthenticated) {
    return <Login onBackToStore={() => setView('user')} />;
  }

  // Active sub-page in Admin
  const renderAdminPageContent = () => {
    switch (adminTab) {
      case 'dashboard':
        return <AdminDashboard />;
      
      case 'products':
        if (isAddingProduct || editingProductId) {
          return (
            <ProductForm 
              productId={editingProductId} 
              onClose={handleCloseProductForm} 
            />
          );
        }
        return (
          <ProductList 
            onAddProduct={handleAddProduct} 
            onEditProduct={handleEditProduct} 
          />
        );
      
      case 'inventory':
        return <InventoryManagement />;
      
      case 'orders':
        return <OrderManagement />;
      
      case 'customers':
        if (currentRole === 'Staff') return <AdminDashboard />;
        return <CustomerManagement />;
      
      case 'categories':
        if (currentRole === 'Staff') return <AdminDashboard />;
        return <CategoryManagement />;
      
      case 'content':
        if (currentRole === 'Staff') return <AdminDashboard />;
        return <ContentManagement />;
      
      case 'coupons':
        if (currentRole !== 'Super Admin') return <AdminDashboard />;
        return <CouponsManagement />;
      
      case 'reviews':
        if (currentRole === 'Staff') return <AdminDashboard />;
        return <ReviewsModeration />;
      
      case 'logs':
        if (currentRole !== 'Super Admin') return <AdminDashboard />;
        return <AuditLogs />;
      
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <AdminLayout 
      currentTab={adminTab} 
      setTab={handleSetTab} 
      setView={setView}
    >
      {renderAdminPageContent()}
    </AdminLayout>
  );
};

export default function App() {
  return (
    <ECommerceProvider>
      <AppContent />
    </ECommerceProvider>
  );
}
