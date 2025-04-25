/**
 * Utility functions for formatting data
 */

/**
 * Capitalizes the first letter of each word in a name
 * @param {string} name - The name to capitalize
 * @returns {string} - The capitalized name
 */
export const capitalizeName = (name) => {
  if (!name) return '';
  
  // Split the name into words
  return name.split(' ')
    .map(word => {
      // Skip empty words
      if (!word) return '';
      // Capitalize the first letter of each word
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
};
