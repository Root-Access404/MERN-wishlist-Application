/**
 * API Configuration
 * Loads API URL from environment variables
 * Falls back to localhost for development
 */

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

if (!API_URL) {
    console.warn('⚠️ REACT_APP_API_URL not set. Using default: http://localhost:5000');
}

export const API_CONFIG = {
    BASE_URL: API_URL,
    ENDPOINTS: {
        WISHLIST: '/api/wishlist',
        WISHLIST_ADD: '/api/wishlist/add',
    }
};

export const getWishlistUrl = () => `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.WISHLIST}`;
export const getWishlistAddUrl = () => `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.WISHLIST_ADD}`;

export default API_CONFIG;
