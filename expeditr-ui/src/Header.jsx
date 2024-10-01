import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => (
  <header className="header">
    <Link to="/">
      <img src="/app_logo.png" alt="Expeditr logo" className="logo" />
    </Link>
  </header>
);

export default Header;