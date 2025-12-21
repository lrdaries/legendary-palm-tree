// API Configuration
const CONFIG = {
    API_BASE_URL: (typeof window !== 'undefined' && window.location)
        ? `${window.location.origin}/api`
        : '/api',
    STORAGE_KEYS: {
        TOKEN: 'authToken',
        USER: 'currentUser',
        PENDING_EMAIL: 'pendingEmail'
    }
};