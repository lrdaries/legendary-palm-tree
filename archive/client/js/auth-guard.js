(() => {
  const AUTH_KEY = 'dk_auth';
  const POST_AUTH_REDIRECT_KEY = 'dk_post_auth_redirect';

  const isLoggedIn = () => {
    try {
      const raw = sessionStorage.getItem(AUTH_KEY);
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      return Boolean(parsed && parsed.token && parsed.user && parsed.user.email);
    } catch {
      return false;
    }
  };

  const isCollectionsPage = () => {
    const path = window.location.pathname || '';
    return path.endsWith('/collections.html') || path === 'collections.html';
  };

  const redirectToLogin = () => {
    try {
      localStorage.setItem(POST_AUTH_REDIRECT_KEY, 'collections.html');
    } catch {
      // ignore
    }

    const path = window.location.pathname || '';
    const fromPagesFolder = path.includes('/pages/');
    const loginUrl = fromPagesFolder ? '../index.html' : 'index.html';
    window.location.replace(loginUrl);
  };

  if (isCollectionsPage() && !isLoggedIn()) {
    redirectToLogin();
  }
})();
