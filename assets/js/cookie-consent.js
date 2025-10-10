/**
 * Cookie Consent Manager
 * Implements GDPR-compliant cookie consent for Google Analytics
 * Handles user consent preferences with 365-day persistence
 */
(function() {
    'use strict';
    
    const COOKIE_NAME = 'hifaliz_cookie_consent';
    const COOKIE_EXPIRY_DAYS = 365;
    const GA_MEASUREMENT_ID = 'G-BT9P227DET';
    
    /**
     * Retrieves the current cookie consent status from browser cookies
     * @returns {string|null} - 'accepted', 'declined', or null if no choice made
     */
    function getCookieConsent() {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === COOKIE_NAME) {
                return value;
            }
        }
        return null;
    }
    
    /**
     * Persists user's cookie consent choice
     * @param {string} value - 'accepted' or 'declined'
     */
    function setCookieConsent(value) {
        const date = new Date();
        date.setTime(date.getTime() + (COOKIE_EXPIRY_DAYS * 24 * 60 * 60 * 1000));
        const expires = 'expires=' + date.toUTCString();
        document.cookie = `${COOKIE_NAME}=${value};${expires};path=/;SameSite=Lax`;
    }
    
    /**
     * Dynamically loads Google Analytics script and updates consent mode
     * Only executes when user has granted consent
     */
    function loadGoogleAnalytics() {
        if (typeof gtag === 'function') {
            gtag('consent', 'update', {
                'analytics_storage': 'granted'
            });
        }
        
        if (!document.querySelector('script[src*="googletagmanager.com/gtag/js"]')) {
            const script = document.createElement('script');
            script.async = true;
            script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
            document.head.appendChild(script);
            
            script.onload = function() {
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                window.gtag = gtag;
                gtag('js', new Date());
                gtag('config', GA_MEASUREMENT_ID, {
                    'anonymize_ip': true
                });
            };
        } else {
            if (typeof gtag === 'function') {
                gtag('js', new Date());
                gtag('config', GA_MEASUREMENT_ID, {
                    'anonymize_ip': true
                });
            }
        }
    }
    
    /**
     * Creates and displays the cookie consent banner with slide-up animation
     * Banner includes description, privacy policy links, and accept/decline buttons
     */
    function createCookieBanner() {
        const banner = document.createElement('div');
        banner.className = 'cookie-consent-banner';
        banner.setAttribute('role', 'dialog');
        banner.setAttribute('aria-label', 'Cookie consent');
        banner.setAttribute('aria-describedby', 'cookie-consent-description');
        
        banner.innerHTML = `
            <div class="cookie-consent-content">
                <div class="cookie-consent-text">
                    <h3>
                        <i class="fa-solid fa-cookie-bite" aria-hidden="true"></i>
                        <span data-i18n="cookie.title">Kami Menggunakan Cookies</span>
                    </h3>
                    <p id="cookie-consent-description">
                        <span data-i18n="cookie.description">Situs ini menggunakan cookies untuk meningkatkan pengalaman Anda dan menganalisis traffic website melalui Google Analytics. Data yang dikumpulkan bersifat anonim dan membantu kami memahami bagaimana pengunjung berinteraksi dengan situs kami.</span>
                    </p>
                    <p style="margin-top: 0.5rem; font-size: 1.3rem;">
                        <a href="/privacy.html" rel="noopener noreferrer" style="color: #4a9eff; text-decoration: underline; font-weight: 500;">
                            <i class="fa-solid fa-shield-halved" style="margin-right: 0.3rem;"></i>
                            <span data-i18n="cookie.privacy">Kebijakan Privasi</span>
                        </a>
                        <span style="margin: 0 0.5rem; color: rgba(255,255,255,0.5);">•</span>
                        <a href="https://policies.google.com/technologies/cookies" target="_blank" rel="noopener noreferrer" style="color: #4a9eff; text-decoration: underline;">
                            <span data-i18n="cookie.learnMore">Pelajari lebih lanjut</span>
                            <i class="fa-solid fa-external-link-alt" style="margin-left: 0.3rem; font-size: 1rem;"></i>
                        </a>
                    </p>
                </div>
                <div class="cookie-consent-buttons">
                    <button type="button" class="cookie-btn cookie-btn-accept" id="cookie-accept" aria-label="Accept cookies">
                        <i class="fa-solid fa-check" aria-hidden="true"></i>
                        <span data-i18n="cookie.accept">Terima</span>
                    </button>
                    <button type="button" class="cookie-btn cookie-btn-decline" id="cookie-decline" aria-label="Decline cookies">
                        <i class="fa-solid fa-xmark" aria-hidden="true"></i>
                        <span data-i18n="cookie.decline">Tolak</span>
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(banner);
        
        setTimeout(() => {
            banner.classList.add('show');
        }, 500);
        
        document.getElementById('cookie-accept').addEventListener('click', acceptCookies);
        document.getElementById('cookie-decline').addEventListener('click', declineCookies);
    }
    
    /**
     * Handles user acceptance of cookies
     * Enables analytics storage and loads Google Analytics tracking
     */
    function acceptCookies() {
        setCookieConsent('accepted');
        loadGoogleAnalytics();
        hideBanner();
    }
    
    /**
     * Handles user decline of cookies
     * Maintains denied analytics storage state
     */
    function declineCookies() {
        setCookieConsent('declined');
        
        if (typeof gtag === 'function') {
            gtag('consent', 'update', {
                'analytics_storage': 'denied'
            });
        }
        hideBanner();
    }
    
    /**
     * Removes cookie banner with fade-out animation
     */
    function hideBanner() {
        const banner = document.querySelector('.cookie-consent-banner');
        if (banner) {
            banner.classList.remove('show');
            setTimeout(() => {
                banner.remove();
            }, 400);
        }
    }
    
    /**
     * Initializes cookie consent system
     * Checks for existing consent and displays banner or loads analytics accordingly
     */
    function init() {
        const consent = getCookieConsent();
        
        if (consent === null) {
            createCookieBanner();
        } else if (consent === 'accepted') {
            loadGoogleAnalytics();
        }
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    /**
     * Global function to programmatically display cookie consent banner
     * Useful for "Cookie Settings" links in footer or privacy policy
     */
    window.showCookieConsent = function() {
        const banner = document.querySelector('.cookie-consent-banner');
        if (!banner) {
            createCookieBanner();
        }
    };
    
})();
