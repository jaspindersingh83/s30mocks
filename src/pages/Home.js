import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import './Home.css';

const Home = () => {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1>Elevate Your Interview Skills</h1>
          <p>
            Practice with experienced interviewers and get real-time feedback to
            ace your next technical interview.
          </p>
          {!isAuthenticated ? (
            <div className="hero-buttons">
              <Link to="/register" className="btn btn-primary">
                Get Started
              </Link>
              <Link to="/login" className="btn btn-primary">
                Login
              </Link>
            </div>
          ) : (
            <div className="hero-buttons">
              <Link to="/dashboard" className="btn btn-primary">
                Go to Dashboard
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="features">
        <h2>Why Choose S30 Mocks?</h2>
        <div className="feature-cards">
          <div className="feature-card">
            <h3>Expert Interviewers</h3>
            <p>
              Connect with interviewers from top tech companies who know what it
              takes to succeed.
            </p>
          </div>
          <div className="feature-card">
            <h3>Detailed Feedback</h3>
            <p>
              Receive comprehensive feedback on your performance to identify areas
              for improvement.
            </p>
          </div>
          <div className="feature-card">
            <h3>Simple UPI Payments</h3>
            <p>
              Pay directly to interviewers using UPI for a seamless booking
              experience.
            </p>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Create an Account</h3>
            <p>Sign up as a candidate or interviewer in just a few minutes.</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Book an Interview</h3>
            <p>Browse interviewers and schedule a mock interview at your convenience.</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Attend & Improve</h3>
            <p>Participate in the mock interview and receive valuable feedback.</p>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <h3>Make Payment</h3>
            <p>Pay directly to the interviewer using UPI by scanning their QR code.</p>
          </div>
        </div>
      </section>

      <section className="cta">
        <h2>Ready to Ace Your Next Interview?</h2>
        <p>Join thousands of candidates who have improved their interview skills with S30 Mocks.</p>
        {!isAuthenticated ? (
          <Link to="/register" className="btn btn-primary">
            Get Started Now
          </Link>
        ) : (
          <Link to="/dashboard" className="btn btn-primary">
            Go to Dashboard
          </Link>
        )}
      </section>
    </div>
  );
};

export default Home;
