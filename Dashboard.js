import React, { useEffect, useState } from "react";
import { getDashboard } from "../api";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading…</div>;
  if (!data) return <div>Failed to load dashboard</div>;

  return (
    <div>
      <div className="page-header"><h1>Dashboard</h1></div>
      <div className="stat-grid">
        <div className="stat-card">
          <div className="label">Total Products</div>
          <div className="value">{data.total_products}</div>
        </div>
        <div className="stat-card">
          <div className="label">Total Customers</div>
          <div className="value">{data.total_customers}</div>
        </div>
        <div className="stat-card">
          <div className="label">Total Orders</div>
          <div className="value">{data.total_orders}</div>
        </div>
        <div className="stat-card">
          <div className="label">Low Stock Items</div>
          <div className="value" style={{ color: data.low_stock_products.length ? "#ef4444" : "#4f46e5" }}>
            {data.low_stock_products.length}
          </div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: 16, fontSize: "1rem" }}>⚠️ Low Stock Products (≤5 units)</h2>
        {data.low_stock_products.length === 0 ? (
          <p style={{ color: "#888" }}>All products are well-stocked.</p>
        ) : (
          <ul className="low-stock-list">
            {data.low_stock_products.map(p => (
              <li key={p.id}>
                <span>{p.name} <span style={{ color: "#888", fontSize: "0.82rem" }}>({p.sku})</span></span>
                <span className="badge badge-red">{p.quantity} left</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
