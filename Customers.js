import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getCustomers, createCustomer, deleteCustomer } from "../api";

const empty = { name: "", email: "", phone: "" };

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);

  const load = () => getCustomers().then(setCustomers);
  useEffect(() => { load(); }, []);

  const handleSubmit = async () => {
    if (!form.name || !form.email) return toast.error("Name and email are required");
    setLoading(true);
    try {
      await createCustomer(form);
      toast.success("Customer added");
      setShowModal(false);
      setForm(empty);
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
      await deleteCustomer(id);
      toast.success("Deleted");
      load();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Error");
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Customers</h1>
        <button className="btn btn-primary" onClick={() => { setForm(empty); setShowModal(true); }}>+ Add Customer</button>
      </div>
      <div className="card">
        <table>
          <thead>
            <tr><th>Name</th><th>Email</th><th>Phone</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {customers.length === 0 && <tr><td colSpan={4} style={{ textAlign: "center", color: "#888" }}>No customers yet.</td></tr>}
            {customers.map(c => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.email}</td>
                <td>{c.phone || "—"}</td>
                <td>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id, c.name)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Add Customer</h2>
            {[["name","Name","text"],["email","Email","email"],["phone","Phone","text"]].map(([field, label, type]) => (
              <div className="form-group" key={field}>
                <label>{label}{field !== "phone" && " *"}</label>
                <input type={type} value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} />
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
