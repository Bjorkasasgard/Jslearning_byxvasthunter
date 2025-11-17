import React, { useState, useEffect } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';

const UserList = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const response = await api.get('/api/users');
    setUsers(response.data);
  };

  const deleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/api/users/${id}`);
        fetchUsers();
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  return (
    <div className="columns is-centered mt-5">
      <div className="column is-four-fifths">
        <div className="level">
          <div className="level-left">
            <div className="level-item">
              <h1 className="title">User Management</h1>
            </div>
          </div>
        </div>
        <div className="box">
          <table className="table is-striped is-fullwidth">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    <Link to={`/users/edit/${user.id}`} className="button is-warning is-small mr-2">Edit</Link>
                    <button onClick={() => deleteUser(user.id)} className="button is-danger is-small">Delete</button>
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

export default UserList;