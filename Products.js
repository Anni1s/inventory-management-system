import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getProducts, createProduct, updateProduct, deleteProduct } from "../api";

const empty = { name: "", sku: "", price: "", quantity: "" };

export default function Products() {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = () => getProducts().then(setProducts);
  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(empty); setEditing(null); setShowModal(true); };
  const openEdit = (p) => { setForm({ name: p.name, sku: p.sku, price: p.price, quantity: p.quantity }); setEditing(p.id); setShowModal(true); };

  const handleSubmit = async () => {
    if (!form.name || !form.sku || form.price === "" || form.quantity === "") {
      return toast.error("All fields are required");
    }
    setLoading(true);
    try {
      const payload = { name: form.name, sku: form.sku, price: parseFloat(form.price), quantity: parseInt(form.quantity) };
      if (editing) {
        await updateProduct(editing, payload);
        toast.success("Product updated");
      } else {
        await createProduct(payload);
        toast.success("Product created");
      }
      setShowModal(false);
      load();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await deleteProduct(id);
      toast.success("Deleted");
      load();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Error");
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Products</h1>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Product</button>
      </div>
      <div className="card">
        <table>
          <thead>
            <tr><th>Name</th><th>SKU</th><th>Price</th><th>Stock</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {products.length === 0 && <tr><td colSpan={5} style={{ textAlign: "center", color: "#888" }}>No products yet.</td></tr>}
            {products.map(p => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td><span className="badge badge-blue">{p.sku}</span></td>
                <td>₹{p.price.toFixed(2)}</td>
                <td>
                  <span className={`badge ${p.quantity <= 5 ? "badge-red" : "badge-green"}`}>{p.quantity}</span>
                </td>
                <td style={{ display: "flex", gap: 8 }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => openEdit(p)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id, p.name)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editing ? "Edit Product" : "Add Product"}</h2>
            {["name", "sku", "price", "quantity"].map(field => (
              <div className="form-group" key={field}>
                <label>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                <input
                  type={field === "price" || field === "quantity" ? "number" : "text"}
                  value={form[field]}
                  onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                  placeholder={field === "price" ? "0.00" : ""}
                  min={0}
                />
              </div>
            ))}
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
