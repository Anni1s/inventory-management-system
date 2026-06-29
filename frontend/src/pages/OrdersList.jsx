import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { getOrders, getCustomers, getProducts, createOrder, deleteOrder } from '../services/api';

export default function OrdersList() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ customer_id: '', items: [{ product_id: '', quantity: 1 }] });

  const fetchData = async () => {
    try {
      const [oRes, cRes, pRes] = await Promise.all([getOrders(), getCustomers(), getProducts()]);
      setOrders(oRes.data);
      setCustomers(cRes.data);
      setProducts(pRes.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        customer_id: parseInt(formData.customer_id),
        items: formData.items.map(item => ({
          product_id: parseInt(item.product_id),
          quantity: parseInt(item.quantity)
        }))
      };
      await createOrder(payload);
      setShowModal(false);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.detail || "Error creating order. Check stock availability.");
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Cancel this order?")) {
      try {
        await deleteOrder(id);
        fetchData();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const addItem = () => {
    setFormData({ ...formData, items: [...formData.items, { product_id: '', quantity: 1 }] });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const openNewModal = () => {
    setFormData({ customer_id: customers.length > 0 ? customers[0].id : '', items: [{ product_id: '', quantity: 1 }] });
    setShowModal(true);
  };

  return (
    <div>
      <div className="flex-between" style={{marginBottom: '2rem'}}>
        <h1 className="page-title" style={{margin: 0}}>Orders</h1>
        <button className="btn btn-primary" onClick={openNewModal}>
          <Plus size={18} /> Create Order
        </button>
      </div>

      <div className="glass-card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Total Amount</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => {
                const c = customers.find(cust => cust.id === o.customer_id);
                return (
                  <tr key={o.id}>
                    <td>#{o.id}</td>
                    <td>{c ? c.full_name : `Customer ${o.customer_id}`}</td>
                    <td>${o.total_amount.toFixed(2)}</td>
                    <td>{new Date(o.created_at).toLocaleDateString()}</td>
                    <td>
                      <button className="btn-icon danger" onClick={() => handleDelete(o.id)}><Trash2 size={18} /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{maxWidth: '600px'}}>
            <div className="modal-header">
              <h3 className="modal-title">New Order</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Customer</label>
                <select required className="form-input" value={formData.customer_id} onChange={e => setFormData({...formData, customer_id: e.target.value})}>
                  <option value="">Select a customer</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <div className="flex-between">
                  <label>Order Items</label>
                  <button type="button" className="btn btn-secondary" style={{padding: '0.25rem 0.5rem', fontSize: '0.8rem'}} onClick={addItem}>Add Item</button>
                </div>
                
                {formData.items.map((item, index) => (
                  <div key={index} style={{display: 'flex', gap: '0.5rem', marginTop: '0.5rem', alignItems: 'center'}}>
                    <select required className="form-input" style={{flex: 2}} value={item.product_id} onChange={e => updateItem(index, 'product_id', e.target.value)}>
                      <option value="">Select Product</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id} disabled={p.quantity === 0}>{p.name} (${p.price}) - Stock: {p.quantity}</option>
                      ))}
                    </select>
                    <input required type="number" min="1" className="form-input" style={{flex: 1}} value={item.quantity} onChange={e => updateItem(index, 'quantity', e.target.value)} />
                    {formData.items.length > 1 && (
                      <button type="button" className="btn-icon danger" onClick={() => removeItem(index)}><Trash2 size={18} /></button>
                    )}
                  </div>
                ))}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Place Order</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
