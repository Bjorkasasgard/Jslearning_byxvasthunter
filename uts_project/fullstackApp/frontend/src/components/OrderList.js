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

  // Backend tidak punya delete order, jadi kita lewati
  // const deleteOrder = async (id) => { ... }

  return (
    <div>
      <h1 className="title">Order Management</h1>
      <Link to="/orders/add" className="button is-primary mb-4">Create New Order</Link>
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
              <td>${order.total_price}</td>
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
  );
};

export default OrderList;