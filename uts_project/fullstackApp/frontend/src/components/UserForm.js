import React, { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate, useParams } from 'react-router-dom';

const UserForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('customer');
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      const fetchUser = async () => {
        const { data } = await api.get(`/api/users/${id}`);
        setName(data.name);
        setEmail(data.email);
        setRole(data.role);
      };
      fetchUser();
    }
  }, [id]);

  const saveUser = async (e) => {
    e.preventDefault();
    const userData = { name, email, role };
    try {
      if (id) {
        await api.patch(`/api/users/${id}`, userData);
      } else {
        await api.post('/api/register', userData);
      }
      navigate('/users');
    } catch (error) {
      console.error("Error saving user:", error);
      alert(error.response?.data?.msg || "An error occurred.");
    }
  };

  return (
    <div className="box">
      <h1 className="title">{id ? 'Edit User' : 'Add User'}</h1>
      <form onSubmit={saveUser}>
        <div className="field">
          <label className="label">Name</label>
          <div className="control">
            <input className="input" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" required />
          </div>
        </div>
        <div className="field">
          <label className="label">Email</label>
          <div className="control">
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Address" required />
          </div>
        </div>
        <div className="field">
          <label className="label">Role</label>
          <div className="control">
            <div className="select is-fullwidth">
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="customer">Customer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
        </div>
        <div className="field">
          <div className="control">
            <button type="submit" className="button is-success">{id ? 'Update' : 'Save'}</button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default UserForm;