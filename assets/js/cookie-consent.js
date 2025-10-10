// Cookie Consent Manager
(function() {
    'use strict';
    
    const COOKIE_NAME = 'hifaliz_cookie_consent';
    const COOKIE_EXPIRY_DAYS = 365;
    const GA_MEASUREMENT_ID = 'G-BT9P227DET';
    
    // Check if user has already made a choice
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
    
    // Set cookie consent
    function setCookieConsent(value) {
        const date = new Date();
        date.setTime(date.getTime() + (COOKIE_EXPIRY_DAYS * 24 * 60 * 60 * 1000));
        const expires = 'expires=' + date.toUTCString();
        document.cookie = `${COOKIE_NAME}=${value};${expires};path=/;SameSite=Lax`;
    }
    
    // Load Google Analytics
    function loadGoogleAnalytics() {
        // Update consent
        if (typeof gtag === 'function') {
            gtag('consent', 'update', {
                'analytics_storage': 'granted'
            });
        }
        
        // Load gtag script if not already loaded
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
            // Script already loaded, just initialize
            if (typeof gtag === 'function') {
                gtag('js', new Date());
                gtag('config', GA_MEASUREMENT_ID, {
                    'anonymize_ip': true
                });
            }
        }
    }
    
    // Create cookie banner HTML
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
                    <p id="cookie-consent-description" data-i18n="cookie.description">
                        Situs ini menggunakan cookies untuk meningkatkan pengalaman Anda dan menganalisis traffic website melalui Google Analytics. 
                        Data yang dikumpulkan bersifat anonim dan membantu kami memahami bagaimana pengunjung berinteraksi dengan situs kami.
                        <a href="https://policies.google.com/technologies/cookies" target="_blank" rel="noopener noreferrer" data-i18n="cookie.learnMore">Pelajari lebih lanjut</a>
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
        
        // Show banner with animation
        setTimeout(() => {
            banner.classList.add('show');
        }, 500);
        
        // Event listeners
        document.getElementById('cookie-accept').addEventListener('click', acceptCookies);
        document.getElementById('cookie-decline').addEventListener('click', declineCookies);
    }
    
    // Accept cookies
    function acceptCookies() {
        setCookieConsent('accepted');
        loadGoogleAnalytics();
        hideBanner();
    }
    
    // Decline cookies
    function declineCookies() {
        setCookieConsent('declined');
        // Keep analytics_storage as denied (default)
        if (typeof gtag === 'function') {
            gtag('consent', 'update', {
                'analytics_storage': 'denied'
            });
        }
        hideBanner();
    }
    
    // Hide banner
    function hideBanner() {
        const banner = document.querySelector('.cookie-consent-banner');
        if (banner) {
            banner.classList.remove('show');
            setTimeout(() => {
                banner.remove();
            }, 400);
        }
    }
    
    // Initialize
    function init() {
        const consent = getCookieConsent();
        
        if (consent === null) {
            // No consent yet, show banner
            createCookieBanner();
        } else if (consent === 'accepted') {
            // User accepted, load analytics
            loadGoogleAnalytics();
        }
        // If declined, do nothing (analytics stays disabled)
    }
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Expose function to allow user to change consent later (optional)
    window.showCookieConsent = function() {
        const banner = document.querySelector('.cookie-consent-banner');
        if (!banner) {
            createCookieBanner();
        }
    };
    
})();
