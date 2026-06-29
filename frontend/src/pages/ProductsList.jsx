import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../services/api';

export default function ProductsList() {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ id: null, name: '', sku: '', price: '', quantity: '' });

  const fetchProducts = async () => {
    try {
      const res = await getProducts();
      setProducts(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.id) {
        await updateProduct(formData.id, formData);
      } else {
        await createProduct({ ...formData, price: parseFloat(formData.price), quantity: parseInt(formData.quantity) });
      }
      setShowModal(false);
      fetchProducts();
    } catch (error) {
      alert("Error saving product. Check SKU uniqueness and values.");
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this product?")) {
      try {
        await deleteProduct(id);
        fetchProducts();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const openEditModal = (product) => {
    setFormData(product);
    setShowModal(true);
  };

  const openNewModal = () => {
    setFormData({ id: null, name: '', sku: '', price: '', quantity: '' });
    setShowModal(true);
  };

  return (
    <div>
      <div className="flex-between" style={{marginBottom: '2rem'}}>
        <h1 className="page-title" style={{margin: 0}}>Products</h1>
        <button className="btn btn-primary" onClick={openNewModal}>
          <Plus size={18} /> Add Product
        </button>
      </div>

      <div className="glass-card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Name</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td>{p.sku}</td>
                  <td>{p.name}</td>
                  <td>${p.price.toFixed(2)}</td>
                  <td>{p.quantity}</td>
                  <td>
                    {p.quantity > 10 ? (
                      <span className="badge badge-success">In Stock</span>
                    ) : p.quantity > 0 ? (
                      <span className="badge" style={{background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.2)'}}>Low Stock</span>
                    ) : (
                      <span className="badge badge-danger">Out of Stock</span>
                    )}
                  </td>
                  <td>
                    <button className="btn-icon" onClick={() => openEditModal(p)}><Edit size={18} /></button>
                    <button className="btn-icon danger" onClick={() => handleDelete(p.id)}><Trash2 size={18} /></button>
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
              <h3 className="modal-title">{formData.id ? 'Edit Product' : 'New Product'}</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input required className="form-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>SKU</label>
                <input required className="form-input" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Price</label>
                <input required type="number" step="0.01" min="0.01" className="form-input" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Quantity</label>
                <input required type="number" min="0" className="form-input" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} />
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
