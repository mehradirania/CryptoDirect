/**
 * CryptoDirect Utility Functions
 * Random ID generation and helper functions
 */

/**
 * Generate a secure random product ID
 * Requirements:
 * - Length between 12 and 20 characters
 * - Includes lowercase letters, uppercase letters, and numbers
 * - Can start with letter or number
 * 
 * @returns {string} Secure random ID
 */
function generateSecureId(minLength = 12, maxLength = 20) {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const allChars = lowercase + uppercase + numbers;
    
    // Random length between min and max
    const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
    
    let id = '';
    
    // Ensure we have at least one lowercase, one uppercase, and one number
    id += lowercase[Math.floor(Math.random() * lowercase.length)];
    id += uppercase[Math.floor(Math.random() * uppercase.length)];
    id += numbers[Math.floor(Math.random() * numbers.length)];
    
    // Fill the rest randomly
    for (let i = id.length; i < length; i++) {
        id += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the string
    return id.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Generate multiple secure IDs
 * @param {number} count - Number of IDs to generate
 * @returns {array} Array of secure random IDs
 */
function generateMultipleIds(count = 5) {
    const ids = [];
    for (let i = 0; i < count; i++) {
        ids.push(generateSecureId());
    }
    return ids;
}

/**
 * Validate if a string is a valid secure ID
 * @param {string} id - ID to validate
 * @returns {boolean} True if valid
 */
function isValidSecureId(id) {
    if (typeof id !== 'string') return false;
    if (id.length < 12 || id.length > 20) return false;
    
    const hasLowercase = /[a-z]/.test(id);
    const hasUppercase = /[A-Z]/.test(id);
    const hasNumber = /[0-9]/.test(id);
    const onlyValidChars = /^[a-zA-Z0-9]+$/.test(id);
    
    return hasLowercase && hasUppercase && hasNumber && onlyValidChars;
}

/**
 * Escape HTML characters to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, m => map[m]);
}

/**
 * Get URL parameter value
 * @param {string} param - Parameter name
 * @returns {string|null} Parameter value or null
 */
function getUrlParam(param) {
    const params = new URLSearchParams(window.location.search);
    return params.get(param);
}

/**
 * Format price to USD currency
 * @param {number} price - Price value
 * @returns {string} Formatted price
 */
function formatPrice(price) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(price);
}

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Validate USDT TRC20 address
 * @param {string} address - Wallet address to validate
 * @returns {boolean} True if valid TRC20 address
 */
function isValidTrc20Address(address) {
    if (typeof address !== 'string') return false;
    // TRC20 addresses start with 'T' and are 34 characters long
    return address.startsWith('T') && address.length === 34 && /^[1-9A-HJ-NP-Z]+$/.test(address);
}

/**
 * Sort products by creation date (newest first)
 * @param {object} productsData - Products object from JSON
 * @returns {array} Sorted array of products with IDs
 */
function sortProductsByDate(productsData) {
    const productsArray = Object.entries(productsData).map(([id, product]) => ({
        id,
        ...product
    }));

    return productsArray.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
    });
}

/**
 * Log payment attempt (for debugging/analytics)
 * @param {object} paymentData - Payment information
 */
function logPayment(paymentData) {
    const log = {
        timestamp: new Date().toISOString(),
        ...paymentData
    };
    console.log('Payment logged:', log);
    // In production, send this to analytics service
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        generateSecureId,
        generateMultipleIds,
        isValidSecureId,
        escapeHtml,
        getUrlParam,
        formatPrice,
        isValidEmail,
        isValidTrc20Address,
        sortProductsByDate,
        logPayment
    };
}
