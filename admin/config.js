// Admin configuration
window.CONFIG = {
    API_BASE_URL: (typeof window !== 'undefined' && window.location)
        ? `${window.location.origin}/api`
        : '/api',
    ADMIN_EMAIL: 'admin@example.com',
    ADMIN_PASSWORD: ''  // Password should not be stored here for security
};

// For Node.js/CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.CONFIG;
}