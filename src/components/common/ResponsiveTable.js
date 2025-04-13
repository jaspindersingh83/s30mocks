import React from 'react';
import './ResponsiveTable.css';

const ResponsiveTable = ({ headers, data, renderRow }) => {
  return (
    <div className="responsive-table-container">
      {/* Desktop version */}
      <table className="responsive-table desktop-table">
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th key={index}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => renderRow(item, index))}
        </tbody>
      </table>

      {/* Mobile version */}
      <div className="mobile-table">
        {data.map((item, index) => (
          <div key={index} className="mobile-table-card">
            {headers.map((header, headerIndex) => {
              // Skip rendering action columns without a label
              if (header === '' && headerIndex === headers.length - 1) {
                return null;
              }
              
              return (
                <div key={headerIndex} className="mobile-table-row">
                  <div className="mobile-table-header">{header}</div>
                  <div className="mobile-table-cell">
                    {renderMobileCell(item, headerIndex, headers)}
                  </div>
                </div>
              );
            })}
            
            {/* Render actions separately at the bottom of the card */}
            {headers[headers.length - 1] === '' && (
              <div className="mobile-table-actions">
                {renderMobileCell(item, headers.length - 1, headers)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Helper function to render mobile cell content
const renderMobileCell = (item, columnIndex, headers) => {
  // This is a simplified approach - for complex content, you would need a more sophisticated solution
  const values = Object.values(item);
  
  // If it's the last column and it's an action column
  if (columnIndex === headers.length - 1 && headers[columnIndex] === '') {
    // Assume the last value might be a React element (like buttons)
    return values[values.length - 1];
  }
  
  // Otherwise, try to match the column index with the value index
  // This is a simple approach that works for basic data
  return values[columnIndex] || 'N/A';
};

export default ResponsiveTable;
