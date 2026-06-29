import { useState, useEffect } from 'react';
import { Package, Users, ShoppingCart, AlertTriangle } from 'lucide-react';
import { getProducts, getCustomers, getOrders } from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    productsCount: 0,
    customersCount: 0,
    ordersCount: 0,
    lowStockCount: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [productsRes, customersRes, ordersRes] = await Promise.all([
          getProducts(),
          getCustomers(),
          getOrders()
        ]);

        const products = productsRes.data;
        setStats({
          productsCount: products.length,
          customersCount: customersRes.data.length,
          ordersCount: ordersRes.data.length,
          lowStockCount: products.filter(p => p.quantity < 10).length,
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div>
      <h1 className="page-title">Dashboard Overview</h1>
      
      <div className="dashboard-grid">
        <div className="glass-card stat-card">
          <div className="stat-icon"><Package size={24} /></div>
          <span className="stat-title">Total Products</span>
          <span className="stat-value">{stats.productsCount}</span>
        </div>
        
        <div className="glass-card stat-card">
          <div className="stat-icon" style={{color: 'var(--secondary-color)', background: 'rgba(236, 72, 153, 0.1)'}}><Users size={24} /></div>
          <span className="stat-title">Total Customers</span>
          <span className="stat-value">{stats.customersCount}</span>
        </div>
        
        <div className="glass-card stat-card">
          <div className="stat-icon" style={{color: 'var(--success-color)', background: 'rgba(16, 185, 129, 0.1)'}}><ShoppingCart size={24} /></div>
          <span className="stat-title">Total Orders</span>
          <span className="stat-value">{stats.ordersCount}</span>
        </div>
        
        <div className="glass-card stat-card">
          <div className="stat-icon" style={{color: 'var(--danger-color)', background: 'rgba(239, 68, 68, 0.1)'}}><AlertTriangle size={24} /></div>
          <span className="stat-title">Low Stock Items</span>
          <span className="stat-value">{stats.lowStockCount}</span>
        </div>
      </div>
    </div>
  );
}
