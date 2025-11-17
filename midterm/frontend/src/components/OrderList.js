import React, { useState, useEffect } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';

const OrderList = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const { data } = await api.get('/api/orders');
    setOrders(data);
  };

  const updateStatusHandler = async (id, newStatus) => {
    try {
      await api.patch(`/api/orders/${id}/status`, { status: newStatus });
      fetchOrders();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

 
  return (
    <div className="columns is-centered mt-5">
      <div className="column is-four-fifths">
        <div className="level">
          <div className="level-left">
            <div className="level-item">
              <h1 className="title">Order Management</h1>
            </div>
          </div>
        </div>
        <div className="box">
          <table className="table is-striped is-fullwidth">
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Product</th>
                <th>Qty</th>
                <th>Total Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.user?.name || 'N/A'}</td>
                  <td>{order.product?.name || 'N/A'}</td>
                  <td>{order.quantity}</td>
                  <td>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(order.total_price || 0)}</td>
                  <td>
                    <span className={`tag ${order.status === 'completed' ? 'is-success' : 'is-warning'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    {order.status === 'pending' && (
                      <button className="button is-success is-small" onClick={() => updateStatusHandler(order.id, 'completed')}>
                        Mark as Completed
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrderList;