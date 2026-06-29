import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { getCustomers, createCustomer, deleteCustomer } from '../services/api';

export default function CustomersList() {
  const [customers, setCustomers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ full_name: '', email: '', phone: '' });

  const fetchCustomers = async () => {
    try {
      const res = await getCustomers();
      setCustomers(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createCustomer(formData);
      setShowModal(false);
      fetchCustomers();
    } catch (error) {
      alert("Error saving customer. Check if email is unique.");
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this customer?")) {
      try {
        await deleteCustomer(id);
        fetchCustomers();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const openNewModal = () => {
    setFormData({ full_name: '', email: '', phone: '' });
    setShowModal(true);
  };

  return (
    <div>
      <div className="flex-between" style={{marginBottom: '2rem'}}>
        <h1 className="page-title" style={{margin: 0}}>Customers</h1>
        <button className="btn btn-primary" onClick={openNewModal}>
          <Plus size={18} /> Add Customer
        </button>
      </div>

      <div className="glass-card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>{c.full_name}</td>
                  <td>{c.email}</td>
                  <td>{c.phone || '-'}</td>
                  <td>
                    <button className="btn-icon danger" onClick={() => handleDelete(c.id)}><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">New Customer</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input required className="form-input" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input required type="email" className="form-input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Phone (Optional)</label>
                <input className="form-input" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
