// Admin configuration
window.CONFIG = {
    API_BASE_URL: 'http://localhost:3000/api',
    ADMIN_EMAIL: 'admin@example.com',
    ADMIN_PASSWORD: ''  // Password should not be stored here for security
};

// For Node.js/CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.CONFIG;
}