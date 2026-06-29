import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getOrders, createOrder, deleteOrder, getCustomers, getProducts } from "../api";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [items, setItems] = useState([{ product_id: "", quantity: 1 }]);
  const [loading, setLoading] = useState(false);
  const [detailOrder, setDetailOrder] = useState(null);

  const load = () => getOrders().then(setOrders);
  useEffect(() => {
    load();
    getCustomers().then(setCustomers);
    getProducts().then(setProducts);
  }, []);

  const addItem = () => setItems(i => [...i, { product_id: "", quantity: 1 }]);
  const removeItem = (idx) => setItems(i => i.filter((_, j) => j !== idx));
  const updateItem = (idx, key, value) => setItems(i => i.map((item, j) => j === idx ? { ...item, [key]: value } : item));

  const handleSubmit = async () => {
    if (!customerId) return toast.error("Select a customer");
    if (items.some(i => !i.product_id)) return toast.error("Select a product for all items");
    setLoading(true);
    try {
      await createOrder({
        customer_id: parseInt(customerId),
        items: items.map(i => ({ product_id: parseInt(i.product_id), quantity: parseInt(i.quantity) }))
      });
      toast.success("Order created");
      setShowModal(false);
      setCustomerId(""); setItems([{ product_id: "", quantity: 1 }]);
      load();
      getProducts().then(setProducts); // refresh stock
    } catch (e) {
      toast.error(e.response?.data?.detail || "Error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Cancel this order?")) return;
    try {
      await deleteOrder(id);
      toast.success("Order cancelled");
      load();
    } catch (e) {
      toast.error("Error");
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Orders</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Order</button>
      </div>
      <div className="card">
        <table>
          <thead>
            <tr><th>#</th><th>Customer</th><th>Items</th><th>Total</th><th>Date</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {orders.length === 0 && <tr><td colSpan={6} style={{ textAlign: "center", color: "#888" }}>No orders yet.</td></tr>}
            {orders.map(o => (
              <tr key={o.id}>
                <td>#{o.id}</td>
                <td>{o.customer?.name || `Customer #${o.customer_id}`}</td>
                <td>{o.items?.length || 0} item(s)</td>
                <td>₹{o.total_amount.toFixed(2)}</td>
                <td>{new Date(o.created_at).toLocaleDateString()}</td>
                <td style={{ display: "flex", gap: 6 }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => setDetailOrder(o)}>View</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(o.id)}>Cancel</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Order Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
            <h2>New Order</h2>
            <div className="form-group">
              <label>Customer *</label>
              <select value={customerId} onChange={e => setCustomerId(e.target.value)}>
                <option value="">Select customer…</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 8, fontWeight: 600, fontSize: "0.85rem" }}>Order Items</div>
            {items.map((item, idx) => (
              <div className="item-row" key={idx}>
                <div className="form-group" style={{ flex: 2 }}>
                  <label>Product</label>
                  <select value={item.product_id} onChange={e => updateItem(idx, "product_id", e.target.value)}>
                    <option value="">Select…</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.quantity})</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Qty</label>
                  <input type="number" min={1} value={item.quantity} onChange={e => updateItem(idx, "quantity", e.target.value)} />
                </div>
                {items.length > 1 && (
                  <button className="btn btn-danger btn-sm" style={{ marginBottom: 14 }} onClick={() => removeItem(idx)}>✕</button>
                )}
              </div>
            ))}
            <button className="add-item-btn" onClick={addItem}>+ Add Item</button>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading ? "Placing…" : "Place Order"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {detailOrder && (
        <div className="modal-overlay" onClick={() => setDetailOrder(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Order #{detailOrder.id}</h2>
            <p style={{ marginBottom: 12, color: "#555" }}>Customer: <strong>{detailOrder.customer?.name}</strong></p>
            <table>
              <thead><tr><th>Product</th><th>Qty</th><th>Unit Price</th><th>Subtotal</th></tr></thead>
              <tbody>
                {detailOrder.items?.map(item => (
                  <tr key={item.id}>
                    <td>{item.product?.name || `#${item.product_id}`}</td>
                    <td>{item.quantity}</td>
                    <td>₹{item.unit_price.toFixed(2)}</td>
                    <td>₹{(item.quantity * item.unit_price).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ textAlign: "right", marginTop: 12, fontWeight: 700, fontSize: "1rem" }}>
              Total: ₹{detailOrder.total_amount.toFixed(2)}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDetailOrder(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
