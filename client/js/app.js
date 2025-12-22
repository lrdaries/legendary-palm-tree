(() => {
  const API_BASE = '';
  const POST_AUTH_REDIRECT_KEY = 'dk_post_auth_redirect';
  const CURRENCY_KEY = 'dk_currency';
  const FX_CACHE_KEY = 'dk_fx_rates_usd_v1';
  const FX_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const show = (el) => {
    if (!el) return;
    el.classList.remove('hidden');
  };

  const hide = (el) => {
    if (!el) return;
    el.classList.add('hidden');
  };

  const scrollToId = (id) => {
    const el = qs(id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const safeText = (v) => {
    const div = document.createElement('div');
    div.textContent = String(v ?? '');
    return div.innerHTML;
  };

  const SELLER_WHATSAPP_NUMBER = '+17083238600';

  const toWhatsAppDigits = (num) => String(num || '').replace(/[^0-9]/g, '');

  const buildWhatsAppUrl = ({ productName, productUrl } = {}) => {
    const digits = toWhatsAppDigits(SELLER_WHATSAPP_NUMBER);
    const url = digits ? `https://wa.me/${digits}` : 'https://wa.me/';
    const text = `Hello, I'm interested in: ${productName || 'a product'}${productUrl ? `\n${productUrl}` : ''}`;
    return `${url}?text=${encodeURIComponent(text)}`;
  };

  const currency = (() => {
    const fallbackRates = {
      USD: 1, EUR: 0.85, GBP: 0.73, JPY: 110.0,
      NGN: 1550.0, AUD: 1.35, CAD: 1.25, CNY: 6.45, INR: 74.5
    };

    let current = 'NGN';
    let rates = { ...fallbackRates };

    const loadSelected = () => {
      try {
        const v = (localStorage.getItem(CURRENCY_KEY) || '').trim().toUpperCase();
        if (v) current = v;
      } catch {
        // ignore
      }
    };

    const saveSelected = () => {
      try {
        localStorage.setItem(CURRENCY_KEY, current);
      } catch {
        // ignore
      }
    };

    const readFxCache = () => {
      try {
        const raw = localStorage.getItem(FX_CACHE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed.ts !== 'number' || typeof parsed.rates !== 'object') return null;
        if (Date.now() - parsed.ts > FX_TTL_MS) return null;
        return parsed.rates;
      } catch {
        return null;
      }
    };

    const writeFxCache = (r) => {
      try {
        localStorage.setItem(FX_CACHE_KEY, JSON.stringify({ ts: Date.now(), rates: r }));
      } catch {
        // ignore
      }
    };

    const init = async () => {
      loadSelected();

      const cached = readFxCache();
      if (cached) {
        rates = { ...fallbackRates, ...cached };
        return;
      }

      try {
        const res = await fetch('https://open.er-api.com/v6/latest/USD', { headers: { 'Accept': 'application/json' } });
        if (!res.ok) throw new Error('FX fetch failed');
        const json = await res.json();
        const fetched = json && json.rates && typeof json.rates === 'object' ? json.rates : null;
        if (fetched) {
          rates = { ...fallbackRates, ...fetched };
          writeFxCache(fetched);
        }
      } catch {
        rates = { ...fallbackRates };
      }
    };

    const set = (code) => {
      const v = String(code || '').trim().toUpperCase();
      if (!v) return;
      current = v;
      saveSelected();
    };

    const get = () => current;

    const convertFromUSD = (amountUSD) => {
      const n = Number(amountUSD);
      if (!Number.isFinite(n)) return 0;
      const rate = Number(rates[current]);
      if (!Number.isFinite(rate) || rate <= 0) return n;
      return n * rate;
    };

    const formatUSD = (amountUSD) => {
      const converted = convertFromUSD(amountUSD);
      try {
        return new Intl.NumberFormat(undefined, { style: 'currency', currency: current }).format(converted);
      } catch {
        return `${current} ${converted.toFixed(2)}`;
      }
    };

    return { init, set, get, formatUSD };
  })();

  const notify = (message, type = 'info') => {
    const colors = {
      success: 'bg-green-600',
      error: 'bg-red-600',
      info: 'bg-black'
    };
    const el = document.createElement('div');
    el.className = `fixed top-20 right-4 ${colors[type] || colors.info} text-white px-4 py-3 rounded shadow-lg z-50`;
    el.textContent = message;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  };

  const api = {
    async getProducts({ limit = 8, offset = 0, sort = 'featured' } = {}) {
      const url = new URL(`${API_BASE}/api/products`, window.location.origin);
      url.searchParams.set('limit', String(limit));
      url.searchParams.set('offset', String(offset));
      url.searchParams.set('sort', String(sort));

      const res = await fetch(url.toString(), { headers: { 'Accept': 'application/json' } });
      if (!res.ok) {
        throw new Error(`Failed to fetch products (${res.status})`);
      }
      const json = await res.json();
      return Array.isArray(json.data) ? json.data : [];
    },

    async register({ firstName, lastName, email, password }) {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, password })
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.message || `Registration failed (${res.status})`);
      }
      return json;
    },

    async requestOtp({ email }) {
      const res = await fetch(`${API_BASE}/api/auth/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email })
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.message || `Failed to request OTP (${res.status})`);
      }
      return json;
    },

    async verifyOtp({ email, otp }) {
      const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.message || `OTP verification failed (${res.status})`);
      }
      return json;
    }
  };

  const auth = (() => {
    const AUTH_KEY = 'dk_auth';

    const getSession = () => {
      try {
        const raw = sessionStorage.getItem(AUTH_KEY);
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    };

    const setSession = (session) => {
      try {
        sessionStorage.setItem(AUTH_KEY, JSON.stringify(session));
      } catch {
        // ignore
      }
    };

    const clearSession = () => {
      try {
        sessionStorage.removeItem(AUTH_KEY);
      } catch {
        // ignore
      }
    };

    return { getSession, setSession, clearSession };
  })();

  const ui = (() => {
    const els = {
      navNewArrivals: qs('#nav-new-arrivals'),
      navCollections: qs('#nav-collections'),
      heroBrowse: qs('#hero-browse-products'),
      productsSection: qs('#products'),
      productsGrid: qs('#products-grid'),
      sortSelect: qs('#sort-select'),
      resetBtn: qs('#clear-filters-btn'),

      currencySelector: qs('#currency-selector'),
      announcementCurrency: qs('#announcement-currency'),

      searchBtn: qs('#search-btn'),
      closeSearchBtn: qs('#close-search-btn'),
      searchModal: qs('#search-modal'),

      userBtn: qs('#user-btn'),
      authModal: qs('#auth-modal'),
      modalCloseBtn: qs('#modal-close-btn'),

      mobileMenuBtn: qs('#mobile-menu-btn'),
      mobileMenu: qs('#mobile-menu'),
      mobileMenuCloseBtn: qs('#mobile-menu-close-btn'),
      mobileNewArrivals: qs('#mobile-new-arrivals'),
      mobileCollections: qs('#mobile-collections'),
      mobileUserBtn: qs('#mobile-user-btn'),
      mobileUserText: qs('#mobile-user-text'),

      signinForm: qs('#signin-form'),
      signinEmail: qs('#signin-email'),
      createAccountBtn: qs('#create-account-btn'),

      otpForm: qs('#otp-form'),
      otpCode: qs('#otp-code'),
      otpEmailDisplay: qs('#otp-email-display'),
      resendOtpBtn: qs('#resend-otp-btn'),
      backToSigninBtn: qs('#back-to-signin-btn'),

      signupForm: qs('#signup-form'),
      signupFirstName: qs('#signup-firstname'),
      signupLastName: qs('#signup-lastname'),
      signupEmail: qs('#signup-email'),
      signupPassword: qs('#signup-password'),
      signupBackBtn: qs('#signup-back-btn'),
      verifyEmailDisplay: qs('#verify-email-display'),
      checkEmailBackBtn: qs('#check-email-back-btn'),
      closeAuthBtn: qs('#close-auth-btn'),

      continueHomeBtn: qs('#continue-home-btn'),

      userStatusDot: qs('#user-status'),
      headerLogoutBtn: qs('#header-logout-btn'),
      profileName: qs('#profile-name'),
      profileEmail: qs('#profile-email'),
      logoutBtn: qs('#logout-btn'),
      profileCloseBtn: qs('#profile-close-btn'),

      productQuickView: qs('#product-quick-view'),
      productQuickViewClose: qs('#product-quick-view-close'),
      productQuickViewContent: qs('#product-quick-view-content'),
    };

    const setStep = (stepId) => {
      const steps = ['#step-1', '#step-3', '#step-4', '#step-5', '#step-6', '#step-7'];
      steps.forEach((s) => hide(qs(s)));
      show(qs(stepId));
    };

    const openModal = (modal) => {
      show(modal);
      document.body.style.overflow = 'hidden';
    };

    const closeModal = (modal) => {
      hide(modal);
      document.body.style.overflow = '';
    };

    const openQuickView = (product) => {
      if (!els.productQuickView || !els.productQuickViewContent) return;

      const name = safeText(product?.name || 'Unnamed Product');
      const category = safeText(product?.category || '');
      const img = product?.image_url ? safeText(product.image_url) : '';
      const price = currency.formatUSD(product?.price);
      const description = safeText(product?.description || product?.details || '');
      const productUrl = window.location.href;

      const imgHtml = img
        ? `<div class="aspect-square bg-gray-100 overflow-hidden rounded-lg"><img src="${img}" alt="${name}" class="w-full h-full object-cover" loading="lazy"></div>`
        : `<div class="aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-gray-400"><i class="fas fa-image text-5xl"></i></div>`;

      const waUrl = buildWhatsAppUrl({ productName: product?.name || 'a product', productUrl });

      els.productQuickViewContent.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          ${imgHtml}
          <div>
            <div class="text-3xl font-bold text-gray-900 mb-2">${name}</div>
            <div class="text-2xl font-bold mb-4">${price}</div>
            ${category ? `<div class="text-sm text-gray-500 mb-4">${category}</div>` : ''}
            ${description ? `<div class=\"text-gray-600 mb-6\">${description}</div>` : ''}
            <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-semibold">
              <i class="fab fa-whatsapp mr-2"></i>
              Message Seller on WhatsApp
            </a>
          </div>
        </div>
      `;

      openModal(els.productQuickView);
    };

    const toggleMobileMenu = (open) => {
      if (!els.mobileMenu) return;
      const shouldOpen = open ?? els.mobileMenu.classList.contains('translate-x-full');
      if (shouldOpen) {
        els.mobileMenu.classList.remove('translate-x-full');
        els.mobileMenu.classList.add('translate-x-0');
      } else {
        els.mobileMenu.classList.add('translate-x-full');
        els.mobileMenu.classList.remove('translate-x-0');
      }
    };

    const renderProducts = (products) => {
      if (!els.productsGrid) return;

      if (!products || products.length === 0) {
        els.productsGrid.innerHTML = `<div class="col-span-full text-center text-gray-500 py-12">No products found.</div>`;
        return;
      }

      els.productsGrid.innerHTML = products
        .map((p) => {
          const name = safeText(p.name || 'Unnamed Product');
          const category = safeText(p.category || '');
          const img = p.image_url ? safeText(p.image_url) : '';
          const price = currency.formatUSD(p.price);

          const imgHtml = img
            ? `<div class="aspect-square bg-gray-100 overflow-hidden rounded-lg mb-4"><img src="${img}" alt="${name}" class="w-full h-full object-cover" loading="lazy"></div>`
            : `<div class="aspect-square bg-gray-100 rounded-lg mb-4"></div>`;

          return `
            <div class="bg-white rounded-xl shadow-sm hover:shadow-lg transition overflow-hidden cursor-pointer" data-product-id="${safeText(p.id)}" role="button" tabindex="0">
              <div class="p-4">
                ${imgHtml}
                <div class="text-sm text-gray-500 mb-1">${category}</div>
                <div class="font-semibold text-gray-900 mb-1">${name}</div>
                <div class="font-bold">${price}</div>
              </div>
            </div>
          `;
        })
        .join('');

      qsa('[data-product-id]', els.productsGrid).forEach((card) => {
        const id = Number(card.getAttribute('data-product-id'));
        card.addEventListener('click', () => {
          const product = products.find((p) => Number(p.id) === id);
          if (product) openQuickView(product);
        });
        card.addEventListener('keydown', (e) => {
          if (e.key !== 'Enter' && e.key !== ' ') return;
          e.preventDefault();
          const product = products.find((p) => Number(p.id) === id);
          if (product) openQuickView(product);
        });
      });
    };

    const syncAuthUI = () => {
      const session = auth.getSession();
      const loggedIn = Boolean(session?.token && session?.user?.email);

      if (els.userStatusDot) {
        els.userStatusDot.classList.toggle('bg-green-500', loggedIn);
        els.userStatusDot.classList.toggle('bg-red-500', !loggedIn);
      }

      if (els.mobileUserText) {
        els.mobileUserText.textContent = loggedIn ? 'Account' : 'Sign In';
      }

      if (els.headerLogoutBtn) {
        els.headerLogoutBtn.classList.toggle('hidden', !loggedIn);
      }
    };

    const syncCurrencyUI = () => {
      const cur = currency.get();
      if (els.currencySelector) {
        els.currencySelector.value = cur;
      }
      if (els.announcementCurrency) {
        els.announcementCurrency.textContent = cur;
      }
    };

    return {
      els,
      setStep,
      openModal,
      closeModal,
      toggleMobileMenu,
      renderProducts,
      openQuickView,
      syncAuthUI,
      syncCurrencyUI
    };
  })();

  const loadNewArrivals = async () => {
    try {
      const sort = ui.els.sortSelect?.value || 'featured';
      const products = await api.getProducts({ limit: 8, offset: 0, sort });
      ui.renderProducts(products);
    } catch (e) {
      console.error(e);
      ui.renderProducts([]);
      notify(e.message || 'Failed to load products', 'error');
    }
  };

  const wireUp = () => {
    ui.syncAuthUI();
    ui.syncCurrencyUI();

    ui.els.productQuickViewClose?.addEventListener('click', () => ui.closeModal(ui.els.productQuickView));
    ui.els.productQuickView?.addEventListener('click', (e) => {
      if (e.target === ui.els.productQuickView) ui.closeModal(ui.els.productQuickView);
    });

    ui.els.currencySelector?.addEventListener('change', async (e) => {
      currency.set(e.target.value);
      ui.syncCurrencyUI();
      await loadNewArrivals();
    });

    ui.els.navNewArrivals?.addEventListener('click', () => {
      scrollToId('#products');
    });

    ui.els.heroBrowse?.addEventListener('click', () => {
      scrollToId('#products');
    });

    const navigateToCollections = () => {
      const session = auth.getSession();
      const loggedIn = Boolean(session?.token && session?.user?.email);
      if (loggedIn) {
        window.location.href = 'collections.html';
        return;
      }

      try {
        localStorage.setItem(POST_AUTH_REDIRECT_KEY, 'collections.html');
      } catch {
        // ignore
      }
      notify('Please sign in or create an account to view collections.', 'info');
      openAuth();
    };

    ui.els.navCollections?.addEventListener('click', (e) => {
      e.preventDefault();
      navigateToCollections();
    });

    ui.els.mobileNewArrivals?.addEventListener('click', () => {
      ui.toggleMobileMenu(false);
      scrollToId('#products');
    });

    ui.els.mobileCollections?.addEventListener('click', (e) => {
      e.preventDefault();
      ui.toggleMobileMenu(false);
      navigateToCollections();
    });

    ui.els.mobileMenuBtn?.addEventListener('click', () => ui.toggleMobileMenu(true));
    ui.els.mobileMenuCloseBtn?.addEventListener('click', () => ui.toggleMobileMenu(false));

    ui.els.searchBtn?.addEventListener('click', () => ui.openModal(ui.els.searchModal));
    ui.els.closeSearchBtn?.addEventListener('click', () => ui.closeModal(ui.els.searchModal));

    const openAuth = () => {
      const session = auth.getSession();
      if (session?.token && session?.user?.email) {
        ui.els.profileName && (ui.els.profileName.textContent = session.user.firstName ? `${session.user.firstName} ${session.user.lastName || ''}`.trim() : 'User');
        ui.els.profileEmail && (ui.els.profileEmail.textContent = session.user.email);
        ui.setStep('#step-7');
      } else {
        ui.setStep('#step-1');
      }
      ui.openModal(ui.els.authModal);
    };

    ui.els.userBtn?.addEventListener('click', openAuth);
    ui.els.mobileUserBtn?.addEventListener('click', () => {
      ui.toggleMobileMenu(false);
      openAuth();
    });

    ui.els.modalCloseBtn?.addEventListener('click', () => ui.closeModal(ui.els.authModal));
    ui.els.profileCloseBtn?.addEventListener('click', () => ui.closeModal(ui.els.authModal));
    ui.els.closeAuthBtn?.addEventListener('click', () => ui.closeModal(ui.els.authModal));

    ui.els.logoutBtn?.addEventListener('click', () => {
      auth.clearSession();
      ui.syncAuthUI();
      ui.setStep('#step-1');
      notify('Logged out', 'success');
    });

    ui.els.headerLogoutBtn?.addEventListener('click', () => {
      auth.clearSession();
      ui.syncAuthUI();
      ui.setStep('#step-1');
      notify('Logged out', 'success');
    });

    ui.els.createAccountBtn?.addEventListener('click', () => ui.setStep('#step-5'));
    ui.els.signupBackBtn?.addEventListener('click', () => ui.setStep('#step-1'));
    ui.els.checkEmailBackBtn?.addEventListener('click', () => ui.setStep('#step-1'));
    ui.els.backToSigninBtn?.addEventListener('click', () => ui.setStep('#step-1'));
    ui.els.continueHomeBtn?.addEventListener('click', () => ui.closeModal(ui.els.authModal));

    ui.els.signinForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = ui.els.signinEmail?.value?.trim();
      if (!email) return;
      try {
        await api.requestOtp({ email });
        if (ui.els.otpEmailDisplay) ui.els.otpEmailDisplay.textContent = email;
        ui.setStep('#step-3');
        notify('OTP sent. Check your email.', 'success');
      } catch (err) {
        console.error(err);
        notify(err.message || 'Failed to request OTP', 'error');
      }
    });

    ui.els.resendOtpBtn?.addEventListener('click', async () => {
      const email = ui.els.signinEmail?.value?.trim() || ui.els.otpEmailDisplay?.textContent?.trim();
      if (!email) return;
      try {
        await api.requestOtp({ email });
        notify('OTP resent. Check your email.', 'success');
      } catch (err) {
        console.error(err);
        notify(err.message || 'Failed to resend OTP', 'error');
      }
    });

    ui.els.otpForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = ui.els.signinEmail?.value?.trim() || ui.els.otpEmailDisplay?.textContent?.trim();
      const otp = ui.els.otpCode?.value?.trim();
      if (!email || !otp) return;
      try {
        const json = await api.verifyOtp({ email, otp });
        const user = json.data || { email };
        auth.setSession({ token: json.token, user });
        ui.syncAuthUI();
        ui.setStep('#step-4');

        let redirectTo = '';
        try {
          redirectTo = localStorage.getItem(POST_AUTH_REDIRECT_KEY) || '';
          localStorage.removeItem(POST_AUTH_REDIRECT_KEY);
        } catch {
          // ignore
        }

        if (redirectTo) {
          window.location.href = redirectTo;
        }
      } catch (err) {
        console.error(err);
        notify(err.message || 'OTP verification failed', 'error');
      }
    });

    ui.els.signupForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const firstName = ui.els.signupFirstName?.value?.trim();
      const lastName = ui.els.signupLastName?.value?.trim();
      const email = ui.els.signupEmail?.value?.trim();
      const password = ui.els.signupPassword?.value;

      if (!firstName || !lastName || !email || !password) return;

      try {
        const json = await api.register({ firstName, lastName, email, password });
        if (ui.els.verifyEmailDisplay) ui.els.verifyEmailDisplay.textContent = email;
        ui.setStep('#step-6');

        if (json.verificationUrl) {
          notify('Account created. Open the verification link (dev mode).', 'success');
          console.log('Verification URL:', json.verificationUrl);
        } else {
          notify('Account created. Check your email to verify.', 'success');
        }
      } catch (err) {
        console.error(err);
        notify(err.message || 'Registration failed', 'error');
      }
    });

    ui.els.sortSelect?.addEventListener('change', () => {
      loadNewArrivals();
    });

    ui.els.resetBtn?.addEventListener('click', () => {
      if (ui.els.sortSelect) ui.els.sortSelect.value = 'featured';
      loadNewArrivals();
    });
  };

  window.addEventListener('DOMContentLoaded', async () => {
    await currency.init();
    wireUp();
    loadNewArrivals();
  });
})();