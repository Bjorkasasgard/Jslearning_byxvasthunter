import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  const [isActive, setIsActive] = useState(false);

  return (
    <nav className="navbar is-dark" role="navigation" aria-label="main navigation">
      <div className="container">
        <div className="navbar-brand">
          <Link className="navbar-item" to="/">
            <strong>Bastian Store</strong>
          </Link>

          <a
            role="button"
            className={`navbar-burger ${isActive ? 'is-active' : ''}`}
            aria-label="menu"
            aria-expanded="false"
            onClick={() => setIsActive(!isActive)}
          >
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
          </a>
        </div>
        <div className={`navbar-menu ${isActive ? 'is-active' : ''}`}>
          <div className="navbar-start">
            <Link className="navbar-item" to="/">
              Product
            </Link>
            <Link className="navbar-item" to="/users">
              Users
            </Link>
            <Link className="navbar-item" to="/orders">
              Orders
            </Link>
          </div>
          <div className="navbar-end">
            <div className="navbar-item has-dropdown is-hoverable">
              <a className="navbar-link">
                Add New
              </a>
              <div className="navbar-dropdown is-right">
                <Link to="/add" className="navbar-item">
                  Product
                </Link>
                <Link to="/users/add" className="navbar-item">
                  User
                </Link>
                <Link to="/orders/add" className="navbar-item">
                  Order
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;