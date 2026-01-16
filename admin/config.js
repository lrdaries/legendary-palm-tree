// Admin configuration
const CONFIG = {
    API_BASE_URL: (typeof window !== 'undefined' && window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') 
        ? 'http://localhost:3000/api'
        : '/api',
    ADMIN_EMAIL: 'admin@divaskloset.com',
    ADMIN_PASSWORD: ''  // Password should not be stored here for security
};

// For Node.js/CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} else {
    window.CONFIG = CONFIG;
}