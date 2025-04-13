import React from 'react';
import ResponsiveNavbar from './ResponsiveNavbar';
import Footer from './Footer';
import './Layout.css';

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <ResponsiveNavbar />
      <main className="main-content">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
