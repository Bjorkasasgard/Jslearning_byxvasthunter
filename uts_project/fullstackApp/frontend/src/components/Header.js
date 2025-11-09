import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <nav className="navbar is-dark" role="navigation" aria-label="main navigation">
      <div className="container">
        <div className="navbar-brand">
          <Link className="navbar-item" to="/">
            <strong>Simple Store</strong>
          </Link>
        </div>
        <div className="navbar-menu">
          <div className="navbar-start">
            <Link className="navbar-item" to="/">
              Products
            </Link>
            <Link className="navbar-item" to="/users">
              Users
            </Link>
            <Link className="navbar-item" to="/orders">
              Orders
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;