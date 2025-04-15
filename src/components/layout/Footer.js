import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>S30 Mocks</h3>
          <p>Affordable DSA and System Design Mocks with MAANG Engineers</p>
        </div>

        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li>
              <a href="/">Home</a>
            </li>
            <li>
              <a href="/about">About</a>
            </li>
            <li>
              <a href="/interviews">Interviews</a>
            </li>
            <li>
              <a href="/contact">Contact</a>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Contact</h3>
          <p>Email: jaspinder@thes30.com</p>
          <p>Phone: +91 (988) 694-454</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          &copy; {new Date().getFullYear()} S30 Inteview Prep Pvt Limited. All
          rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
