/**
 * IEANJESÚS Maldonado - Módulo Centralizado de Analítica y Consentimiento (GA4)
 * ID de Medición: G-78TR9VB9TB
 * Cumplimiento con Google Consent Mode v2 y Política de Privacidad
 */

(function () {
  'use strict';

  // 1. Constantes de configuración
  var GA_MEASUREMENT_ID = 'G-78TR9VB9TB';
  var STORAGE_KEY = 'iean_ga_consent';

  // 2. Exclusión estricta de páginas administrativas
  var path = (window.location.pathname || '').toLowerCase();
  if (path.indexOf('admin.html') !== -1 || path.indexOf('/admin') !== -1) {
    return;
  }

  // 3. Inicializar dataLayer y función gtag global
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = window.gtag || gtag;

  // 4. Lectura y escritura segura de preferencia en localStorage
  function getStoredConsent() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function setStoredConsent(value) {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch (e) {}
  }

  var currentConsent = getStoredConsent();

  // 5. Configuración inicial de Google Consent Mode v2
  // Publicidad y personalización siempre denegadas (no se utiliza publicidad en el sitio).
  // Almacenamiento de analítica denegado por defecto hasta que el usuario decida.
  gtag('consent', 'default', {
    'analytics_storage': currentConsent === 'granted' ? 'granted' : 'denied',
    'ad_storage': 'denied',
    'ad_user_data': 'denied',
    'ad_personalization': 'denied',
    'wait_for_update': 500
  });

  // 6. Carga diferida y segura de Google Analytics 4 (gtag.js)
  function loadGtagScript() {
    if (!document.getElementById('ga4-script')) {
      var script = document.createElement('script');
      script.id = 'ga4-script';
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_MEASUREMENT_ID;

      var firstScript = document.getElementsByTagName('script')[0];
      if (firstScript && firstScript.parentNode) {
        firstScript.parentNode.insertBefore(script, firstScript);
      } else {
        (document.head || document.documentElement).appendChild(script);
      }
    }

    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID, {
      anonymize_ip: true,
      send_page_view: true
    });
  }

  // 6.1 Eliminación segura y selectiva de cookies de Google Analytics ante revocación
  function clearGaCookies() {
    try {
      var cookies = document.cookie ? document.cookie.split(';') : [];
      var hostname = window.location.hostname || '';
      var domainParts = hostname.split('.');

      var domainVariants = ['', '; domain=' + hostname, '; domain=.' + hostname];
      if (domainParts.length > 2) {
        var rootDomain = '.' + domainParts.slice(-2).join('.');
        domainVariants.push('; domain=' + rootDomain);
      }

      var pathVariants = ['/', ''];

      for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i].trim();
        var eqPos = cookie.indexOf('=');
        var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;

        // Filtrar estrictamente solo cookies que comiencen con _ga, _gid, _gat, _gac
        if (/^(_ga|_gid|_gat|_gac)/i.test(name)) {
          for (var p = 0; p < pathVariants.length; p++) {
            for (var d = 0; d < domainVariants.length; d++) {
              var pathStr = pathVariants[p] ? '; path=' + pathVariants[p] : '';
              document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC' + pathStr + domainVariants[d];
            }
          }
        }
      }
    } catch (e) {}
  }

  // Si el usuario ya aceptó previamente, inicializar GA4
  if (currentConsent === 'granted') {
    loadGtagScript();
  }

  // 7. Renderizado y gestión del Banner de Consentimiento
  var bannerEl = null;

  function createConsentBanner() {
    if (document.getElementById('iean-cookie-banner')) {
      bannerEl = document.getElementById('iean-cookie-banner');
      return bannerEl;
    }

    var banner = document.createElement('div');
    banner.id = 'iean-cookie-banner';
    banner.className = 'iean-cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-live', 'polite');
    banner.setAttribute('aria-label', 'Consentimiento de cookies y analítica');

    banner.innerHTML =
      '<div class="iean-cookie-banner-card">' +
        '<div class="iean-cookie-banner-header">' +
          '<div class="iean-cookie-banner-badge">' +
            '<i class="fa-solid fa-shield-halved"></i> PRIVACIDAD & ANALÍTICA' +
          '</div>' +
        '</div>' +
        '<p class="iean-cookie-banner-text">' +
          'Utilizamos herramientas de analítica para comprender cómo se utiliza nuestro sitio y poder mejorarlo. ' +
          '<a href="privacidad.html" class="iean-cookie-banner-link">Más información</a>' +
        '</p>' +
        '<div class="iean-cookie-banner-actions">' +
          '<button type="button" id="iean-cookie-reject-btn" class="iean-cookie-btn iean-cookie-btn-reject">RECHAZAR</button>' +
          '<button type="button" id="iean-cookie-accept-btn" class="iean-cookie-btn iean-cookie-btn-accept">ACEPTAR</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(banner);

    var acceptBtn = document.getElementById('iean-cookie-accept-btn');
    var rejectBtn = document.getElementById('iean-cookie-reject-btn');

    if (acceptBtn) {
      acceptBtn.addEventListener('click', function () {
        window.acceptAnalytics();
      });
    }

    if (rejectBtn) {
      rejectBtn.addEventListener('click', function () {
        window.rejectAnalytics();
      });
    }

    bannerEl = banner;
    return banner;
  }

  function showBanner() {
    if (!bannerEl) {
      createConsentBanner();
    }
    setTimeout(function () {
      if (bannerEl) {
        bannerEl.classList.add('is-visible');
      }
    }, 150);
  }

  function hideBanner() {
    if (bannerEl) {
      bannerEl.classList.remove('is-visible');
      setTimeout(function () {
        if (bannerEl && !bannerEl.classList.contains('is-visible') && bannerEl.parentNode) {
          bannerEl.parentNode.removeChild(bannerEl);
          bannerEl = null;
        }
      }, 300);
    }
  }

  // 8. Métodos globales expuestos
  window.acceptAnalytics = function () {
    setStoredConsent('granted');
    gtag('consent', 'update', {
      'analytics_storage': 'granted'
    });
    loadGtagScript();
    hideBanner();
  };

  window.rejectAnalytics = function () {
    setStoredConsent('denied');
    gtag('consent', 'update', {
      'analytics_storage': 'denied'
    });
    clearGaCookies();
    hideBanner();
  };

  window.openCookieSettings = function () {
    showBanner();
  };

  /**
   * Envía un evento personalizado a Google Analytics 4 únicamente si el visitante ha otorgado su consentimiento.
   * @param {string} eventName - Nombre del evento en GA4 (ej. 'click_contacto', 'descarga_material')
   * @param {Object} [eventParams] - Parámetros complementarios (nunca incluir datos personales)
   */
  window.trackEvent = function (eventName, eventParams) {
    try {
      if (getStoredConsent() === 'granted' && typeof window.gtag === 'function') {
        window.gtag('event', eventName, eventParams || {});
      }
    } catch (e) {
      // Manejo silencioso de excepciones
    }
  };

  // 9. Inicialización al cargar el DOM si aún no existe decisión previa
  function initConsentUI() {
    if (getStoredConsent() === null) {
      showBanner();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initConsentUI);
  } else {
    initConsentUI();
  }
})();
