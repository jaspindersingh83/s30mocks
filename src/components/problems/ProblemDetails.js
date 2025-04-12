import React, { useState } from 'react';
import './ProblemDetails.css';

const ProblemDetails = ({ problem, isInterviewer }) => {
  const [activeTab, setActiveTab] = useState('problem');
  const [activeSolutionIndex, setActiveSolutionIndex] = useState(0);
  
  if (!problem) {
    return <div className="no-problem">No problem assigned yet.</div>;
  }

  return (
    <div className="problem-details-container">
      <div className="problem-header">
        <h3>{problem.title}</h3>
        <div className="problem-metadata">
          <span className={`difficulty-badge difficulty-${problem.difficulty}`}>
            {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
          </span>
        </div>
      </div>
      
      <div className="problem-tabs">
        <button 
          className={`tab-button ${activeTab === 'problem' ? 'active' : ''}`}
          onClick={() => setActiveTab('problem')}
        >
          Problem
        </button>
        <a 
          href={problem.leetcodeUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="leetcode-link"
        >
          View on LeetCode
        </a>
        {isInterviewer && (
          <button 
            className={`tab-button ${activeTab === 'hints' ? 'active' : ''}`}
            onClick={() => setActiveTab('hints')}
          >
            Hints
          </button>
        )}
        {isInterviewer && (
          <button 
            className={`tab-button ${activeTab === 'solutions' ? 'active' : ''}`}
            onClick={() => setActiveTab('solutions')}
          >
            Solutions
          </button>
        )}
        {isInterviewer && (
          <a 
            href={problem.solutionVideoUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="video-link"
          >
            Video Solution
          </a>
        )}
      </div>
      
      <div className="problem-content">
        {activeTab === 'problem' && (
          <div className="problem-description">
            <div className="leetcode-iframe-container">
              <iframe 
                src={problem.leetcodeUrl} 
                title={problem.title}
                className="leetcode-iframe"
              />
            </div>
          </div>
        )}
        
        {activeTab === 'hints' && isInterviewer && problem.hints && problem.hints.length > 0 && (
          <div className="problem-hints">
            <h4>Hints (For Interviewer Only)</h4>
            <ul className="hints-list">
              {problem.hints.map((hint, index) => (
                <li key={index} className="hint-item">{hint}</li>
              ))}
            </ul>
          </div>
        )}
        
        {activeTab === 'solutions' && isInterviewer && problem.solutions && problem.solutions.length > 0 && (
          <div className="problem-solutions">
            <h4>Solutions (For Interviewer Only)</h4>
            
            <div className="solution-language-tabs">
              {problem.solutions.map((solution, index) => (
                <button
                  key={index}
                  className={`language-tab ${index === activeSolutionIndex ? 'active' : ''}`}
                  onClick={() => setActiveSolutionIndex(index)}
                >
                  {solution.language.charAt(0).toUpperCase() + solution.language.slice(1)}
                </button>
              ))}
            </div>
            
            <div className="active-solution">
              <div className="solution-description">
                <h5>Approach</h5>
                <p>{problem.solutions[activeSolutionIndex].description}</p>
              </div>
              
              <div className="solution-complexity">
                <span className="complexity-badge">
                  Time: {problem.solutions[activeSolutionIndex].timeComplexity}
                </span>
                <span className="complexity-badge">
                  Space: {problem.solutions[activeSolutionIndex].spaceComplexity}
                </span>
              </div>
              
              <div className="solution-code">
                <h5>Code</h5>
                <pre className="code-block">
                  <code>{problem.solutions[activeSolutionIndex].code}</code>
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProblemDetails;
