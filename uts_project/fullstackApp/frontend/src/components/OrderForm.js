import React, { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const OrderForm = () => {
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  
  const [userId, setUserId] = useState('');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const { data: usersData } = await api.get('/api/users');
      const { data: productsData } = await api.get('/api/products');
      setUsers(usersData);
      setProducts(productsData);
    };
    fetchData();
  }, []);

  const saveOrder = async (e) => {
    e.preventDefault();
    if (!userId || !productId) {
      alert("Please select a user and a product.");
      return;
    }
    try {
      await api.post('/api/orders', {
        userId,
        productId,
        quantity: Number(quantity),
        total_price: Number(totalPrice)
      });
      navigate('/orders');
    } catch (error) {
      console.error("Error creating order:", error);
    }
  };

  return (
    <div className="box">
      <h1 className="title">Create New Order</h1>
      <form onSubmit={saveOrder}>
        <div className="field">
          <label className="label">User</label>
          <div className="control">
            <div className="select is-fullwidth">
              <select value={userId} onChange={(e) => setUserId(e.target.value)} required>
                <option value="">-- Select User --</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="field">
          <label className="label">Product</label>
          <div className="control">
            <div className="select is-fullwidth">
              <select value={productId} onChange={(e) => setProductId(e.target.value)} required>
                <option value="">-- Select Product --</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>{product.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="columns">
          <div className="column">
            <div className="field">
              <label className="label">Quantity</label>
              <div className="control">
                <input className="input" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} min="1" required />
              </div>
            </div>
          </div>
          <div className="column">
            <div className="field">
              <label className="label">Total Price</label>
              <div className="control">
                <input className="input" type="number" value={totalPrice} onChange={(e) => setTotalPrice(e.target.value)} placeholder="e.g., 50" required />
              </div>
            </div>
          </div>
        </div>
        <div className="field">
          <div className="control">
            <button type="submit" className="button is-success">Create Order</button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default OrderForm;
