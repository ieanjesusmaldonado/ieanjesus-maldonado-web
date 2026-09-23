/**
 * IEANJESÚS Maldonado - Lógica e Interactividad Global
 * Menú Drawer "Herramientas y Recursos", Avisos Temporales, Modales de Cultos,
 * Emprendimientos, Filtros de Células y Recursos, Oración y Asistente IEAN-BOT.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Año dinámico en el footer
  const currentYearEl = document.getElementById('current-year');
  if (currentYearEl) {
    currentYearEl.textContent = new Date().getFullYear();
  }

  // 2. Efecto de Scroll en el Header Sticky
  const navbar = document.getElementById('navbar');
  if (navbar) {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  // 2.1 Reproducción inteligente de videos de fondo en el Hero
  const heroVideos = document.querySelectorAll('.hero-video');
  if (heroVideos.length > 0) {
    const playHeroVideos = () => {
      heroVideos.forEach(vid => {
        // Solo reproducir el video visible según el ancho de pantalla
        const isMobile = window.innerWidth <= 768;
        const isDesktopVideo = vid.classList.contains('hero-video-desktop');
        const isMobileVideo = vid.classList.contains('hero-video-mobile');

        if ((isMobile && isMobileVideo) || (!isMobile && isDesktopVideo)) {
          vid.muted = true;
          const playPromise = vid.play();
          if (playPromise !== undefined) {
            playPromise.catch(() => {
              const resumeOnInteraction = () => {
                vid.play();
                document.removeEventListener('touchstart', resumeOnInteraction);
                document.removeEventListener('click', resumeOnInteraction);
              };
              document.addEventListener('touchstart', resumeOnInteraction, { once: true });
              document.addEventListener('click', resumeOnInteraction, { once: true });
            });
          }
        } else {
          vid.pause();
        }
      });
    };

    playHeroVideos();
    window.addEventListener('resize', playHeroVideos, { passive: true });
  }

  // =========================================================================
  // 2.2 SISTEMA GLOBAL DE APARIENCIA (SISTEMA / CLARO / OSCURO)
  // =========================================================================
  // Dark mode is temporarily disabled for public release.
  // Set DARK_MODE_ENABLED to true when dark theme development resumes.
  const DARK_MODE_ENABLED = false;

  const THEME_STORAGE_KEY = 'iean_theme';
  const THEME_PROMPT_STORAGE_KEY = 'iean_theme_prompt_shown';

  function getSavedThemeChoice() {
    if (!DARK_MODE_ENABLED) return 'light';
    try {
      return localStorage.getItem(THEME_STORAGE_KEY) || 'system';
    } catch (e) {
      return 'system';
    }
  }

  function applyTheme(choice) {
    const root = document.documentElement;

    if (!DARK_MODE_ENABLED) {
      root.setAttribute('data-theme', 'light');
      root.setAttribute('data-theme-choice', 'light');
      root.setAttribute('data-theme-disabled', 'true');
      return;
    }

    root.removeAttribute('data-theme-disabled');
    root.setAttribute('data-theme-choice', choice);

    let effectiveTheme = choice;
    if (choice === 'system') {
      const isSystemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      effectiveTheme = isSystemDark ? 'dark' : 'light';
    }

    if (effectiveTheme === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.setAttribute('data-theme', 'light');
    }

    // Sincronizar botones del selector en el drawer menú
    const drawerThemeBtns = document.querySelectorAll('.theme-option-btn');
    drawerThemeBtns.forEach(btn => {
      const val = btn.getAttribute('data-theme-val');
      const isActive = val === choice;
      if (isActive) {
        btn.classList.add('active');
        btn.setAttribute('aria-checked', 'true');
      } else {
        btn.classList.remove('active');
        btn.setAttribute('aria-checked', 'false');
      }
    });

    // Sincronizar botones en el prompt flotante
    const promptThemeBtns = document.querySelectorAll('.theme-prompt-btn');
    promptThemeBtns.forEach(btn => {
      const val = btn.getAttribute('data-theme-val');
      if (val === choice) {
        btn.classList.add('is-active');
      } else {
        btn.classList.remove('is-active');
      }
    });
  }

  function setTheme(choice, userInitiated = true) {
    if (!DARK_MODE_ENABLED) return;
    applyTheme(choice);
    if (userInitiated) {
      try {
        localStorage.setItem(THEME_STORAGE_KEY, choice);
        localStorage.setItem(THEME_PROMPT_STORAGE_KEY, 'true');
      } catch (e) {}
      hideThemePrompt();
    }
  }

  // Listener para cambios de tema en el Sistema Operativo (solo si está habilitado y en 'system')
  if (DARK_MODE_ENABLED) {
    try {
      const darkMedia = window.matchMedia('(prefers-color-scheme: dark)');
      const handleOSThemeChange = () => {
        const currentChoice = getSavedThemeChoice();
        if (currentChoice === 'system') {
          applyTheme('system');
        }
      };
      if (darkMedia.addEventListener) {
        darkMedia.addEventListener('change', handleOSThemeChange);
      } else if (darkMedia.addListener) {
        darkMedia.addListener(handleOSThemeChange);
      }
    } catch (e) {}
  }

  // Wire botones del Drawer
  const drawerThemeBtns = document.querySelectorAll('.theme-option-btn');
  drawerThemeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (!DARK_MODE_ENABLED) return;
      const val = btn.getAttribute('data-theme-val');
      if (val) {
        setTheme(val, true);
      }
    });
  });

  // Prompt Flotante Inicial
  const themePromptBanner = document.getElementById('theme-prompt-banner');
  const themePromptCloseBtn = document.getElementById('theme-prompt-close-btn');

  function hideThemePrompt() {
    if (themePromptBanner) {
      themePromptBanner.style.transition = 'opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1), transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)';
      themePromptBanner.style.opacity = '0';
      themePromptBanner.style.transform = 'translateY(12px) scale(0.96)';
      setTimeout(() => {
        themePromptBanner.style.display = 'none';
      }, 260);
    }
  }

  // Inicialización visual del tema
  if (!DARK_MODE_ENABLED) {
    applyTheme('light');
    if (themePromptBanner) {
      themePromptBanner.style.display = 'none';
    }
    const drawerThemeSections = document.querySelectorAll('.drawer-theme-section');
    drawerThemeSections.forEach(sec => {
      sec.style.display = 'none';
      const prev = sec.previousElementSibling;
      if (prev && prev.classList.contains('drawer-divider')) {
        prev.style.display = 'none';
      }
    });
  } else {
    try {
      const savedChoice = localStorage.getItem(THEME_STORAGE_KEY);
      const promptShown = localStorage.getItem(THEME_PROMPT_STORAGE_KEY);

      // Inicializar estado visual
      applyTheme(savedChoice || 'system');

      // Si el usuario aún no ha guardado una preferencia ni descartado el prompt, mostrar sugerencia
      if (!savedChoice && !promptShown && themePromptBanner) {
        setTimeout(() => {
          themePromptBanner.style.display = 'block';
        }, 1200);
      }
    } catch (e) {
      applyTheme('system');
    }
  }

  // Wire botones del Prompt Flotante
  const promptThemeBtns = document.querySelectorAll('.theme-prompt-btn');
  promptThemeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (!DARK_MODE_ENABLED) return;
      const val = btn.getAttribute('data-theme-val');
      if (val) {
        setTheme(val, true);
      }
    });
  });

  if (themePromptCloseBtn) {
    themePromptCloseBtn.addEventListener('click', (e) => {
      e.preventDefault();
      try {
        localStorage.setItem(THEME_PROMPT_STORAGE_KEY, 'true');
      } catch (err) {}
      hideThemePrompt();
    });
  }

  // 3. DRAWER LATERAL: HERRAMIENTAS Y RECURSOS
  const drawerToggleBtns = document.querySelectorAll('.drawer-toggle-btn');
  const drawerBackdrop = document.getElementById('drawer-backdrop');
  const drawerCloseBtn = document.getElementById('drawer-close-btn');

  const openDrawer = () => {
    if (drawerBackdrop) {
      drawerBackdrop.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  };

  const closeDrawer = () => {
    if (drawerBackdrop) {
      drawerBackdrop.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  drawerToggleBtns.forEach(btn => btn.addEventListener('click', openDrawer));
  if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', closeDrawer);

  if (drawerBackdrop) {
    drawerBackdrop.addEventListener('click', (e) => {
      if (e.target === drawerBackdrop) closeDrawer();
    });
  }

  // Cerrar Drawer con tecla Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (drawerBackdrop && drawerBackdrop.classList.contains('active')) {
        closeDrawer();
      }
    }
  });

  // Cerrar Drawer al navegar por enlaces internos
  const drawerNavLinks = document.querySelectorAll('.drawer-links-list a, .drawer-resource-card, .drawer-grid-btn, .drawer-admin-card a');
  drawerNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeDrawer();
    });
  });

  // 4. AVISOS TEMPORALES DINÁMICOS
  const noticeBanner = document.getElementById('notice-banner');
  const noticeContent = document.getElementById('notice-text');
  const noticeClose = document.getElementById('notice-close');

  const checkAndRenderNotices = () => {
    if (!noticeBanner || !window.ieanDataStore) return;
    const activeNotices = window.ieanDataStore.getNotices(true);
    if (activeNotices && activeNotices.length > 0) {
      const currentNotice = activeNotices[0];
      if (noticeContent) {
        noticeContent.innerHTML = `<strong>${currentNotice.title ? currentNotice.title + ': ' : ''}</strong>${currentNotice.text}`;
      }
      noticeBanner.classList.add('active');
    } else {
      noticeBanner.classList.remove('active');
    }
  };

  if (noticeClose) {
    noticeClose.addEventListener('click', () => {
      noticeBanner.classList.remove('active');
    });
  }

  // 5. MODAL DE CULTO INTERACTIVO (Jueves, Evangelismo y Domingo)
  const serviceModal = document.getElementById('culto-modal');
  const serviceModalClose = document.getElementById('culto-modal-close');

  const defaultCultosFallback = {
    'sched-jueves': {
      id: 'sched-jueves',
      name: 'Reunión General de Jueves',
      day: 'Jueves',
      time: '19:30 hs',
      location: 'Sede Central (Av. Wilson Ferreira Aldunate & 25 de Agosto)',
      type: 'templo',
      shortDesc: 'Culto congregacional en sede central: alabanza y estudio de la Palabra de Dios.',
      fullDesc: 'Una reunión enfocada en la edificación espiritual de la congregación, la enseñanza profunda de las Sagradas Escrituras y un tiempo de oración intercesora por las familias y necesidades de Maldonado.',
      organizer: 'Liderazgo pastoral y ministerios de apoyo',
      target: 'Toda la familia, jóvenes, adultos y personas interesadas en conocer más de Dios',
      whatToExpect: 'Un ambiente acogedor y reverente, alabanzas congregacionales, predicación bíblica clara y un momento final de oración por peticiones personales.'
    },
    'sched-evangelismo-feria': {
      id: 'sched-evangelismo-feria',
      name: 'Evangelismo en la Feria',
      day: 'Domingo',
      time: '10:00 hs',
      location: 'Feria de Maldonado',
      type: 'evangelismo',
      shortDesc: 'Evangelismo en la Feria',
      fullDesc: 'Actividad de evangelismo y testimonio público en la feria de Maldonado, compartiendo las Buenas Nuevas y folletos bíblicos con la comunidad.',
      organizer: 'Equipo de evangelismo y liderazgo de la iglesia',
      target: 'Toda la comunidad y visitantes de la feria',
      whatToExpect: 'Evangelismo personal, entrega de folletos, oración por las necesidades y testimonio cristiano.'
    },
    'sched-domingo': {
      id: 'sched-domingo',
      name: 'Gran Celebración Dominical',
      day: 'Domingo',
      time: '18:30 hs',
      location: 'Sede Central (Av. Wilson Ferreira Aldunate & 25 de Agosto)',
      type: 'templo',
      shortDesc: 'Gran celebración dominical de adoración, comunión fraternal y predicación.',
      fullDesc: 'El encuentro principal de la semana donde toda la iglesia se reúne para adorar a Dios con gozo, escuchar el mensaje bíblico de salvación y compartir en comunidad fraterna.',
      organizer: 'Ministerio pastoral, coro/música y comités de servicio',
      target: 'Toda la familia, niños, amigos y visitantes de la comunidad',
      whatToExpect: 'Adoración en vivo con el ministerio de alabanza, predicación cristocéntrica, atención cálida para nuevas visitas y un tiempo especial de ministración espiritual.'
    }
  };

  const defaultGalleryFallback = {
    evangelismo: [
      { id: 'feria1', src: 'assets/images/feria1.jpg', alt: 'Actividad de evangelismo y distribución de literatura bíblica en la feria de Maldonado' },
      { id: 'feria2', src: 'assets/images/feria2.jpg', alt: 'Miembros de la iglesia compartiendo el mensaje de fe en la feria dominical' },
      { id: 'feria3', src: 'assets/images/feria3.jpg', alt: 'Diálogo testimonial y entrega de folletos del Plan Cornelio en la feria' },
      { id: 'feria4', src: 'assets/images/feria4.jpg', alt: 'Oración y testimonio cristiano en las calles de Maldonado' },
      { id: 'feria5', src: 'assets/images/feria5.jpg', alt: 'Equipo de evangelismo compartiendo la Palabra de Dios' }
    ],
    dominical: [
      { id: 'dominical1', src: 'assets/images/dominical1.jpg', alt: 'Alabanza congregacional y adoración en la Gran Celebración de domingo' },
      { id: 'dominical2', src: 'assets/images/dominical2.jpg', alt: 'Vista panorámica de la congregación durante el culto dominical de alabanza y adoración' },
      { id: 'dominical3', src: 'assets/images/dominical3.jpg', alt: 'Momento de oración y comunión espiritual en la Gran Celebración de domingo' },
      { id: 'dominical4', src: 'assets/images/dominical4.jpg', alt: 'Congregación reunida participando en la alabanza y la predicación bíblica' },
      { id: 'dominical5', src: 'assets/images/dominical5.jpg', alt: 'Tiempo de adoración congregacional en la sede central' },
      { id: 'dominical6', src: 'assets/images/dominical6.jpg', alt: 'Comunidad congregada alabando a Dios en la reunión dominical' }
    ]
  };

  window.openServiceModal = (serviceId) => {
    if (!serviceModal) return;
    
    let service = null;
    if (window.ieanDataStore && typeof window.ieanDataStore.getScheduleById === 'function') {
      service = window.ieanDataStore.getScheduleById(serviceId);
    }
    if (!service && defaultCultosFallback[serviceId]) {
      service = defaultCultosFallback[serviceId];
    }
    if (!service) return;

    const dayBadgeEl = document.getElementById('modal-culto-day-badge');
    if (dayBadgeEl) {
      const dayText = (service.day || 'CULTO').toUpperCase();
      const timeText = service.time ? ` · ${service.time.toUpperCase()}` : '';
      dayBadgeEl.textContent = `${dayText}${timeText}`;
    }

    const titleEl = document.getElementById('modal-culto-title');
    if (titleEl) titleEl.textContent = service.name || 'Culto Congregacional';

    const descEl = document.getElementById('modal-culto-desc');
    if (descEl) descEl.textContent = service.fullDesc || service.shortDesc || '';
    
    const orgEl = document.getElementById('modal-culto-organizer');
    if (orgEl) orgEl.textContent = service.organizer || 'Liderazgo pastoral y comités de apoyo';

    const targetEl = document.getElementById('modal-culto-target');
    if (targetEl) targetEl.textContent = service.target || 'Toda la familia y visitantes de la comunidad';

    const expectEl = document.getElementById('modal-culto-expect');
    if (expectEl) expectEl.textContent = service.whatToExpect || 'Enseñanza bíblica, alabanza y un ambiente de fe y comunión.';

    // Galería interna del culto / actividad
    const gallerySec = document.getElementById('modal-culto-gallery-section');
    const galleryDesc = document.getElementById('modal-culto-gallery-desc');
    const galleryGrid = document.getElementById('modal-culto-gallery-grid');

    if (gallerySec && galleryDesc && galleryGrid) {
      if (serviceId === 'sched-evangelismo-feria') {
        gallerySec.style.display = 'block';
        galleryDesc.textContent = 'Algunos momentos de nuestro trabajo de evangelismo y encuentro con la comunidad.';
        let photos = (window.ieanDataStore && typeof window.ieanDataStore.getGalleryPhotos === 'function')
          ? window.ieanDataStore.getGalleryPhotos('evangelismo')
          : [];
        if (!photos || !photos.length) photos = defaultGalleryFallback.evangelismo;

        galleryGrid.innerHTML = photos.map((p, idx) => `
          <div class="modal-gallery-thumb" data-photo-idx="${idx}" title="${p.alt}" tabindex="0" role="button" aria-label="${p.alt}">
            <img src="${p.src}" alt="${p.alt}" loading="lazy">
            <div class="thumb-overlay-hint"><i class="fa-solid fa-expand"></i></div>
          </div>
        `).join('');

        galleryGrid.querySelectorAll('.modal-gallery-thumb').forEach(thumb => {
          const handler = () => {
            const idx = parseInt(thumb.getAttribute('data-photo-idx'), 10) || 0;
            if (window.openGalleryLightbox) {
              window.openGalleryLightbox(photos, idx, thumb);
            }
          };
          thumb.addEventListener('click', handler);
          thumb.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handler();
            }
          });
        });
      } else if (serviceId === 'sched-domingo') {
        gallerySec.style.display = 'block';
        galleryDesc.textContent = 'Algunos momentos de nuestra celebración dominical y de la vida de nuestra congregación.';
        let photos = (window.ieanDataStore && typeof window.ieanDataStore.getGalleryPhotos === 'function')
          ? window.ieanDataStore.getGalleryPhotos('dominical')
          : [];
        if (!photos || !photos.length) photos = defaultGalleryFallback.dominical;

        galleryGrid.innerHTML = photos.map((p, idx) => `
          <div class="modal-gallery-thumb" data-photo-idx="${idx}" title="${p.alt}" tabindex="0" role="button" aria-label="${p.alt}">
            <img src="${p.src}" alt="${p.alt}" loading="lazy">
            <div class="thumb-overlay-hint"><i class="fa-solid fa-expand"></i></div>
          </div>
        `).join('');

        galleryGrid.querySelectorAll('.modal-gallery-thumb').forEach(thumb => {
          const handler = () => {
            const idx = parseInt(thumb.getAttribute('data-photo-idx'), 10) || 0;
            if (window.openGalleryLightbox) {
              window.openGalleryLightbox(photos, idx, thumb);
            }
          };
          thumb.addEventListener('click', handler);
          thumb.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handler();
            }
          });
        });
      } else {
        gallerySec.style.display = 'none';
        galleryGrid.innerHTML = '';
      }
    }

    const modalContentCard = serviceModal.querySelector('.modal-editorial-card');
    if (modalContentCard) {
      modalContentCard.scrollTop = 0;
    }

    serviceModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  // Delegación de eventos para apertura de modales de cultos (Desktop y Mobile)
  document.addEventListener('click', (e) => {
    const triggerBtn = e.target.closest('.open-culto-modal-btn');
    if (triggerBtn) {
      e.preventDefault();
      const serviceId = triggerBtn.getAttribute('data-culto-id');
      if (serviceId) {
        window.openServiceModal(serviceId);
      }
    }
  });

  if (serviceModalClose) {
    serviceModalClose.addEventListener('click', () => {
      serviceModal.classList.remove('active');
      document.body.style.overflow = '';
    });
  }

  if (serviceModal) {
    serviceModal.addEventListener('click', (e) => {
      if (e.target === serviceModal) {
        serviceModal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

  // Cerrar modal de culto con tecla Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && serviceModal && serviceModal.classList.contains('active')) {
      serviceModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  });

  // 6. MODAL DE EMPRENDIMIENTOS DE LA COMUNIDAD
  const bizModal = document.getElementById('biz-modal');
  const bizModalClose = document.getElementById('biz-modal-close');
  const bizCards = document.querySelectorAll('.biz-logo-card');

  const syncBusinessesFromStore = () => {
    if (!window.ieanDataStore || bizCards.length === 0) return;
    const allBusinesses = window.ieanDataStore.getBusinesses(false);
    bizCards.forEach(card => {
      const bizId = card.getAttribute('data-biz-id');
      const bObj = allBusinesses.find(b => b.id === bizId);
      if (bObj && bObj.visible === false) {
        card.style.display = 'none';
      } else {
        card.style.display = '';
      }
    });
  };

  bizCards.forEach(card => {
    card.addEventListener('click', () => {
      const bizId = card.getAttribute('data-biz-id');
      if (!window.ieanDataStore || !bizModal) return;
      const bizList = window.ieanDataStore.getBusinesses(false);
      const biz = bizList.find(b => b.id === bizId);
      if (!biz) return;

      const catEl = document.getElementById('biz-modal-cat');
      const nameEl = document.getElementById('biz-modal-name');
      const descEl = document.getElementById('biz-modal-desc');
      if (catEl) catEl.textContent = biz.category;
      if (nameEl) nameEl.textContent = biz.name;
      if (descEl) descEl.textContent = biz.description;
      
      const linkBtn = document.getElementById('biz-modal-link-btn');
      if (linkBtn) {
        linkBtn.style.display = 'inline-flex';
        const hasUrl = biz.url && biz.url.trim() !== '' && biz.url !== '#';
        linkBtn.href = hasUrl ? biz.url : '#';
        if (hasUrl) {
          linkBtn.setAttribute('target', '_blank');
          linkBtn.setAttribute('rel', 'noopener noreferrer');
        } else {
          linkBtn.removeAttribute('target');
          linkBtn.removeAttribute('rel');
        }

        let linkLabel = 'CONOCER EMPRENDIMIENTO';
        if (biz.linkType && biz.linkType.trim() !== '') {
          linkLabel += ` (${biz.linkType.trim()})`;
        }
        linkBtn.innerHTML = `${linkLabel} <i class="fa-solid fa-arrow-up-right-from-square"></i>`;
      }

      bizModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  if (bizModalClose) {
    bizModalClose.addEventListener('click', () => {
      bizModal.classList.remove('active');
      document.body.style.overflow = '';
    });
  }

  if (bizModal) {
    bizModal.addEventListener('click', (e) => {
      if (e.target === bizModal) {
        bizModal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

  // Helper de escape para atributos y texto HTML seguro
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function escapeAttr(str) {
    if (!str) return '';
    return String(str)
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // 7. FILTRADO DE CÉLULAS EN CELULAS.HTML & HOMEPAGE
  const filterTabs = document.querySelectorAll('.filter-tab-btn:not(.recurso-filter-btn)');
  const celulaCards = document.querySelectorAll('.celula-card-editorial');

  if (filterTabs.length > 0 && celulaCards.length > 0) {
    filterTabs.forEach(btn => {
      btn.addEventListener('click', () => {
        filterTabs.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter');

        celulaCards.forEach(card => {
          const category = card.getAttribute('data-category');
          if (filter === 'all' || category === filter) {
            card.style.setProperty('display', 'flex', 'important');
          } else {
            card.style.setProperty('display', 'none', 'important');
          }
        });
      });
    });
  }

  // 7.1 SINCRONIZACIÓN DINÁMICA DE CÉLULAS DESDE DATASTORE
  const syncCellsFromStore = () => {
    if (!window.ieanDataStore) return;
    const cells = window.ieanDataStore.getCells(false);
    if (!cells || cells.length === 0) return;

    const cards = document.querySelectorAll('.celula-card-editorial');
    if (cards.length === 0) return;

    cards.forEach(card => {
      const cellId = card.getAttribute('data-cell-id');
      if (!cellId) return;
      const cell = cells.find(c => c.id === cellId);
      if (!cell) return;

      if (cell.visible === false) {
        card.style.setProperty('display', 'none', 'important');
      } else {
        card.style.removeProperty('display');
        const nameEl = card.querySelector('.celula-name');
        const badgeEl = card.querySelector('.celula-badge');
        const metaItems = card.querySelectorAll('.celula-meta-list li');
        const waBtn = card.querySelector('.btn-whatsapp, .btn-whatsapp-editorial');

        if (nameEl) nameEl.textContent = cell.name;
        if (badgeEl) badgeEl.textContent = `${cell.day.toUpperCase()} · ${cell.time.toUpperCase()}`;
        if (metaItems.length >= 2) {
          metaItems[0].innerHTML = `<i class="fa-regular fa-clock"></i> ${cell.day} a las ${cell.time}`;
          metaItems[1].innerHTML = `<i class="fa-solid fa-location-dot"></i> ${cell.address || cell.zone}`;
        }
        if (waBtn && cell.whatsappUrl) {
          waBtn.href = cell.whatsappUrl;
        }
      }
    });
  };

  // 8. RENDERIZADO DINÁMICO DE MATERIAL GRATUITO EN RECURSOS.HTML
  let activeRecursoFilter = 'all';

  function getRecursoBadgeHtml(fileType) {
    const type = (fileType || 'PDF').toUpperCase();
    if (type.includes('PDF')) {
      return `<i class="fa-regular fa-file-pdf" style="color: #E53935;"></i> ${escapeHtml(type)}`;
    }
    if (type.includes('PRESENTAC') || type.includes('PPT')) {
      return `<i class="fa-regular fa-file-powerpoint" style="color: #E64A19;"></i> ${escapeHtml(type)}`;
    }
    if (type.includes('DOC') || type.includes('TEXTO') || type.includes('DOCUMENTO')) {
      return `<i class="fa-regular fa-file-lines" style="color: #1976D2;"></i> ${escapeHtml(type)}`;
    }
    if (type.includes('AUDIO') || type.includes('MP3')) {
      return `<i class="fa-regular fa-file-audio" style="color: #8E24AA;"></i> ${escapeHtml(type)}`;
    }
    if (type.includes('VIDEO') || type.includes('MP4')) {
      return `<i class="fa-regular fa-file-video" style="color: #D32F2F;"></i> ${escapeHtml(type)}`;
    }
    if (type.includes('FOLLETO')) {
      return `<i class="fa-regular fa-file-pdf" style="color: #E53935;"></i> ${escapeHtml(type)}`;
    }
    if (type.includes('ENLACE') || type.includes('WEB')) {
      return `<i class="fa-solid fa-link" style="color: #00897B;"></i> ${escapeHtml(type)}`;
    }
    return `<i class="fa-regular fa-file" style="color: #546E7A;"></i> ${escapeHtml(type)}`;
  }

  function getRecursoCtaInfo(url, fileType) {
    if (!url || url.trim() === '' || url === '#') {
      return {
        href: 'https://wa.me/59897432948?text=Hola,%20quisiera%20solicitar%20material%20bíblico%20de%20IEANJESÚS',
        label: 'SOLICITAR POR WHATSAPP',
        icon: 'fa-brands fa-whatsapp',
        target: '_blank'
      };
    }
    const cleanUrl = url.trim();
    const isWa = cleanUrl.includes('wa.me') || cleanUrl.includes('whatsapp.com');
    const isDrive = cleanUrl.includes('drive.google.com') || cleanUrl.includes('docs.google.com');
    const isExternal = cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://');

    if (isWa) {
      return {
        href: cleanUrl,
        label: 'SOLICITAR POR WHATSAPP',
        icon: 'fa-brands fa-whatsapp',
        target: '_blank'
      };
    }
    if (cleanUrl.startsWith('nosotros.html')) {
      return {
        href: cleanUrl,
        label: 'LEER EN LÍNEA',
        icon: 'fa-solid fa-arrow-right',
        target: '_self'
      };
    }
    if (isDrive) {
      return {
        href: cleanUrl,
        label: 'VER EN GOOGLE DRIVE',
        icon: 'fa-solid fa-arrow-up-right-from-square',
        target: '_blank'
      };
    }
    return {
      href: cleanUrl,
      label: 'DESCARGAR / VER',
      icon: 'fa-solid fa-arrow-up-right-from-square',
      target: isExternal ? '_blank' : '_self'
    };
  }

  const renderPublicResources = () => {
    const recursosGrid = document.getElementById('recursos-grid');
    if (!recursosGrid || !window.ieanDataStore) return;

    const allResources = window.ieanDataStore.getResources(true, 'all');

    const filtered = (activeRecursoFilter === 'all')
      ? allResources
      : allResources.filter(r => r.category && r.category.toLowerCase() === activeRecursoFilter.toLowerCase());

    if (filtered.length === 0) {
      recursosGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3.5rem 1rem; color: var(--ink-secondary); font-size: 0.95rem; background: var(--bg-surface-elevated); border: 1px dashed var(--border-card); border-radius: var(--radius-sm);">
          <i class="fa-regular fa-folder-open" style="font-size: 2rem; color: var(--green-inst); margin-bottom: 0.75rem; display: block;"></i>
          No hay materiales disponibles en esta sección por el momento.
        </div>
      `;
      return;
    }

    recursosGrid.innerHTML = filtered.map(res => {
      const cta = getRecursoCtaInfo(res.externalUrl, res.fileType);
      const badgeHtml = getRecursoBadgeHtml(res.fileType);
      const catLabel = (res.category || 'GENERAL').toUpperCase();
      const targetAttr = cta.target === '_blank' ? 'target="_blank" rel="noopener noreferrer"' : '';

      return `
        <div class="recurso-card-item" data-category="${escapeAttr(res.category || '')}">
          <div class="recurso-top-row">
            <span class="recurso-cat-tag">${escapeHtml(catLabel)}</span>
            <span class="recurso-type-badge">${badgeHtml}</span>
          </div>
          <h3 class="recurso-item-title">${escapeHtml(res.title || 'Sin Título')}</h3>
          <p class="recurso-item-desc">${escapeHtml(res.description || '')}</p>
          <div>
            <a href="${escapeAttr(cta.href)}" ${targetAttr} class="btn-editorial btn-dark" style="font-size: 0.82rem; padding: 0.55rem 1rem; width: 100%; text-align: center;">
              ${escapeHtml(cta.label)} <i class="${cta.icon}" style="font-size: 0.75rem;"></i>
            </a>
          </div>
        </div>
      `;
    }).join('');
  };

  const recursoFilterBtns = document.querySelectorAll('.recurso-filter-btn');
  if (recursoFilterBtns.length > 0) {
    recursoFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        recursoFilterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeRecursoFilter = btn.getAttribute('data-category') || 'all';
        renderPublicResources();
      });
    });
  }

  // 8.1 SINCRONIZACIÓN DINÁMICA DE HORARIOS DESDE DATASTORE
  const syncSchedulesFromStore = () => {
    if (!window.ieanDataStore) return;
    const schedules = window.ieanDataStore.getSchedules(false);
    
    // Jueves
    const schJueves = schedules.find(s => s.id === 'sched-jueves');
    const cardJueves = document.getElementById('schedule-item-jueves');
    const summaryJueves = document.getElementById('summary-item-jueves');
    if (schJueves) {
      if (cardJueves) {
        const timeEl = document.getElementById('time-jueves');
        const titleEl = document.getElementById('title-jueves');
        const descEl = document.getElementById('desc-jueves');
        if (timeEl) timeEl.textContent = schJueves.time;
        if (titleEl) titleEl.textContent = schJueves.name;
        if (descEl) descEl.textContent = schJueves.shortDesc;
        cardJueves.style.display = schJueves.visible !== false ? 'flex' : 'none';
      }
      if (summaryJueves) {
        const timeSummary = summaryJueves.querySelector('.schedule-time-display');
        const titleSummary = summaryJueves.querySelector('.schedule-title-text');
        const descSummary = summaryJueves.querySelector('.schedule-desc-text');
        if (timeSummary) timeSummary.textContent = `${schJueves.time} hs`;
        if (titleSummary) titleSummary.textContent = schJueves.name;
        if (descSummary) descSummary.textContent = schJueves.shortDesc;
        summaryJueves.style.display = schJueves.visible !== false ? 'flex' : 'none';
      }
    }

    // Evangelismo en la Feria
    const schEvangelismo = schedules.find(s => s.id === 'sched-evangelismo-feria');
    const cardEvangelismo = document.getElementById('schedule-item-evangelismo');
    const summaryEvangelismo = document.getElementById('summary-item-evangelismo');
    if (schEvangelismo) {
      if (cardEvangelismo) {
        const timeEl = document.getElementById('time-evangelismo');
        const titleEl = document.getElementById('title-evangelismo');
        const descEl = document.getElementById('desc-evangelismo');
        if (timeEl) timeEl.textContent = schEvangelismo.time;
        if (titleEl) titleEl.textContent = schEvangelismo.name;
        if (descEl) descEl.textContent = schEvangelismo.shortDesc;
        cardEvangelismo.style.display = schEvangelismo.visible !== false ? 'flex' : 'none';
      }
      if (summaryEvangelismo) {
        const timeSummary = summaryEvangelismo.querySelector('.schedule-time-display');
        const titleSummary = summaryEvangelismo.querySelector('.schedule-title-text');
        const descSummary = summaryEvangelismo.querySelector('.schedule-desc-text');
        if (timeSummary) timeSummary.textContent = `${schEvangelismo.time} hs`;
        if (titleSummary) titleSummary.textContent = schEvangelismo.name;
        if (descSummary) descSummary.textContent = schEvangelismo.shortDesc;
        summaryEvangelismo.style.display = schEvangelismo.visible !== false ? 'flex' : 'none';
      }
    }

    // Domingo Gran Celebración
    const schDomingo = schedules.find(s => s.id === 'sched-domingo');
    const cardDomingo = document.getElementById('schedule-item-domingo');
    const summaryDomingo = document.getElementById('summary-item-domingo');
    if (schDomingo) {
      if (cardDomingo) {
        const timeEl = document.getElementById('time-domingo');
        const titleEl = document.getElementById('title-domingo');
        const descEl = document.getElementById('desc-domingo');
        if (timeEl) timeEl.textContent = schDomingo.time;
        if (titleEl) titleEl.textContent = schDomingo.name;
        if (descEl) descEl.textContent = schDomingo.shortDesc;
        cardDomingo.style.display = schDomingo.visible !== false ? 'flex' : 'none';
      }
      if (summaryDomingo) {
        const timeSummary = summaryDomingo.querySelector('.schedule-time-display');
        const titleSummary = summaryDomingo.querySelector('.schedule-title-text');
        const descSummary = summaryDomingo.querySelector('.schedule-desc-text');
        if (timeSummary) timeSummary.textContent = `${schDomingo.time} hs`;
        if (titleSummary) titleSummary.textContent = schDomingo.name;
        if (descSummary) descSummary.textContent = schDomingo.shortDesc;
        summaryDomingo.style.display = schDomingo.visible !== false ? 'flex' : 'none';
      }
    }

    // Contacto: Horarios de Cultos
    const contactHorariosEl = document.getElementById('contact-horarios-list');
    if (contactHorariosEl) {
      let lines = [];
      if (schJueves && schJueves.visible !== false) lines.push(`Jueves: ${schJueves.time}`);
      if (schEvangelismo && schEvangelismo.visible !== false) lines.push(`Domingos (Evangelismo en la Feria): ${schEvangelismo.time}`);
      if (schDomingo && schDomingo.visible !== false) lines.push(`Domingos (Gran Celebración): ${schDomingo.time}`);
      if (lines.length > 0) {
        contactHorariosEl.innerHTML = lines.join('<br>');
      }
    }
  };

  // 8.1.1 TOGGLE DESPLEGABLE AGENDA MOBILE/TABLET
  const agendaToggleBtn = document.getElementById('agenda-toggle-btn');
  const agendaWrapper = document.getElementById('agenda-collapsible-wrapper');
  if (agendaToggleBtn && agendaWrapper) {
    agendaToggleBtn.addEventListener('click', () => {
      const isCurrentlyOpen = agendaWrapper.classList.contains('open');
      const newState = !isCurrentlyOpen;
      
      if (newState) {
        agendaWrapper.classList.add('open');
      } else {
        agendaWrapper.classList.remove('open');
      }

      agendaToggleBtn.setAttribute('aria-expanded', newState ? 'true' : 'false');
      const span = agendaToggleBtn.querySelector('span');
      const icon = agendaToggleBtn.querySelector('i');
      if (span) {
        span.textContent = newState ? 'OCULTAR HORARIOS' : 'VER HORARIOS Y CÉLULAS';
      }
      if (icon) {
        icon.className = newState ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down';
      }
    });
  }

  // 8.2 FORMULARIO DE CONTACTO (ESCRÍBENOS) EN CONTACTO.HTML
  const contactPageForm = document.getElementById('contact-page-form');
  if (contactPageForm) {
    contactPageForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('contact-name');
      const topicInput = document.getElementById('contact-topic');
      const msgInput = document.getElementById('contact-msg');

      const name = nameInput ? nameInput.value.trim() : '';
      const topic = topicInput && topicInput.selectedIndex >= 0 ? topicInput.options[topicInput.selectedIndex].text : '';
      const msg = msgInput ? msgInput.value.trim() : '';

      if (!name || !topic || !msg) {
        alert('Por favor, completa todos los campos requeridos para enviar tu mensaje.');
        return;
      }

      const formattedMsg = `Hola, Dios les bendiga.\n\nMi nombre es ${name}.\n\nMotivo: ${topic}\n\nMensaje:\n${msg}`;
      const waUrl = `https://wa.me/59897432948?text=${encodeURIComponent(formattedMsg)}`;
      window.open(waUrl, '_blank');
      contactPageForm.reset();
    });
  }

  // 9. MODAL DE PETICIÓN DE ORACIÓN RESTAURADO
  const prayerModal = document.getElementById('prayer-modal');
  const prayerCloseBtn = document.getElementById('prayer-close');
  const prayerForm = document.getElementById('prayer-form');
  const prayerAnonymousCheck = document.getElementById('prayer-anonymous');
  const prayerNameInput = document.getElementById('prayer-name');

  const openPrayerModal = () => {
    if (prayerModal) {
      prayerModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  };

  const closePrayerModal = () => {
    if (prayerModal) {
      prayerModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  document.querySelectorAll('.open-prayer-btn, #open-prayer-btn, #footer-prayer-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openPrayerModal();
    });
  });

  if (prayerCloseBtn) prayerCloseBtn.addEventListener('click', closePrayerModal);

  if (prayerModal) {
    prayerModal.addEventListener('click', (e) => {
      if (e.target === prayerModal) closePrayerModal();
    });
  }

  if (prayerAnonymousCheck && prayerNameInput) {
    prayerAnonymousCheck.addEventListener('change', () => {
      if (prayerAnonymousCheck.checked) {
        prayerNameInput.value = '';
        prayerNameInput.disabled = true;
        prayerNameInput.placeholder = 'Envío anónimo activado';
      } else {
        prayerNameInput.disabled = false;
        prayerNameInput.placeholder = 'Tu nombre completo';
      }
    });
  }

  if (prayerForm) {
    prayerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const isAnonymous = prayerAnonymousCheck ? prayerAnonymousCheck.checked : false;
      const name = (!isAnonymous && prayerNameInput) ? prayerNameInput.value.trim() : '';
      const motiveInput = document.getElementById('prayer-motive');
      const motive = motiveInput ? motiveInput.value.trim() : '';

      if (!motive) {
        alert('Por favor, ingresa tu petición de oración.');
        return;
      }

      let formattedPrayer = `Hola, Dios le bendiga. Quisiera compartir una petición de oración.\n\n`;
      if (name) {
        formattedPrayer += `Nombre: ${name}\n\n`;
      }
      formattedPrayer += `Petición:\n${motive}`;

      const waUrl = `https://wa.me/59897432948?text=${encodeURIComponent(formattedPrayer)}`;
      window.open(waUrl, '_blank');
      closePrayerModal();
      prayerForm.reset();
      if (prayerNameInput) {
        prayerNameInput.disabled = false;
        prayerNameInput.placeholder = 'Tu nombre completo';
      }
    });
  }

  // 9.1 MODAL DE DATOS DE TRANSFERENCIA BANCARIA (/donar)
  const transferModal = document.getElementById('transfer-modal');
  const transferCloseBtn = document.getElementById('transfer-modal-close');
  const openTransferBtn = document.getElementById('open-transfer-btn');
  const copyAccountBtn = document.getElementById('copy-account-btn');

  const openTransferModal = () => {
    if (transferModal) {
      transferModal.classList.add('active');
      document.body.style.overflow = 'hidden';
      if (transferCloseBtn) transferCloseBtn.focus();
    }
  };

  const closeTransferModal = () => {
    if (transferModal) {
      transferModal.classList.remove('active');
      document.body.style.overflow = '';
      if (openTransferBtn) openTransferBtn.focus();
    }
  };

  if (openTransferBtn) {
    openTransferBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openTransferModal();
    });
  }

  if (transferCloseBtn) {
    transferCloseBtn.addEventListener('click', closeTransferModal);
  }

  if (transferModal) {
    transferModal.addEventListener('click', (e) => {
      if (e.target === transferModal) closeTransferModal();
    });
  }

  if (copyAccountBtn) {
    copyAccountBtn.addEventListener('click', async () => {
      const accountNumber = '110718652-00001';
      try {
        if (navigator.clipboard && window.isSecureContext && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(accountNumber);
        } else {
          const tempInput = document.createElement('input');
          tempInput.value = accountNumber;
          tempInput.style.position = 'absolute';
          tempInput.style.left = '-9999px';
          document.body.appendChild(tempInput);
          tempInput.select();
          document.execCommand('copy');
          document.body.removeChild(tempInput);
        }

        const originalHtml = '<i class="fa-regular fa-copy"></i> <span>COPIAR CUENTA</span>';
        copyAccountBtn.classList.add('is-copied');
        copyAccountBtn.innerHTML = '<i class="fa-solid fa-check"></i> <span>CUENTA COPIADA ✓</span>';
        
        setTimeout(() => {
          copyAccountBtn.classList.remove('is-copied');
          copyAccountBtn.innerHTML = originalHtml;
        }, 2200);
      } catch (err) {
        console.error('Error al copiar número de cuenta:', err);
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && transferModal && transferModal.classList.contains('active')) {
      closeTransferModal();
    }
  });

  // 10. CHATBOT ASISTENTE VIRTUAL (IEAN-BOT)
  const chatbotToggle = document.getElementById('chatbot-toggle');
  const chatbotClose = document.getElementById('chatbot-close');
  const chatbotModal = document.getElementById('chatbot-modal');
  const chatBody = document.getElementById('chat-body');
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');

  if (chatbotToggle && chatbotModal && chatbotClose) {
    chatbotToggle.addEventListener('click', () => {
      chatbotModal.classList.toggle('active');
      if (chatbotModal.classList.contains('active') && chatInput) {
        chatInput.focus();
      }
    });

    chatbotClose.addEventListener('click', () => {
      chatbotModal.classList.remove('active');
    });

    const addMessage = (text, sender) => {
      const msgEl = document.createElement('div');
      msgEl.className = `chat-msg ${sender}`;
      msgEl.innerHTML = text;
      chatBody.appendChild(msgEl);
      chatBody.scrollTop = chatBody.scrollHeight;

      // Re-vincular botones de oración que aparezcan dentro de los mensajes del bot
      msgEl.querySelectorAll('.open-prayer-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const prayerModal = document.getElementById('prayer-modal');
          if (prayerModal) {
            prayerModal.classList.add('active');
            document.body.style.overflow = 'hidden';
          }
        });
      });
    };

    const normalizeText = (str) => {
      return (str || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
    };

    const botKnowledge = {
      donacion_transferencia: `Para realizar una <strong>transferencia bancaria en Uruguay</strong>, disponemos de cuenta en <strong>BROU</strong> (Caja de Ahorros). Puedes ver los datos exactos y copiarlos con un clic en nuestra sección oficial:<br><a href="donar.html" class="chat-link-cta"><i class="fa-solid fa-hand-holding-heart"></i> VER DATOS DE TRANSFERENCIA →</a>`,
      donacion_exterior: `Si deseas realizar tu aporte <strong>desde el exterior</strong>, puedes donar con <strong>tarjeta de crédito o débito</strong> a través de nuestra plataforma de Donaciones, o contactarnos por WhatsApp para coordinar otra alternativa.<br><a href="donar.html" class="chat-link-cta"><i class="fa-solid fa-credit-card"></i> IR A DONACIONES ONLINE →</a> <a href="https://wa.me/59897432948?text=Hola,%20quisiera%20hacer%20un%20aporte%20desde%20el%20exterior." target="_blank" class="chat-link-cta"><i class="fa-brands fa-whatsapp"></i> WHATSAPP INTERNACIONAL →</a>`,
      donacion: `Puedes realizar tu aporte desde nuestra sección de <strong>Donaciones</strong>. Allí encontrarás las opciones disponibles para donar con <strong>tarjeta o Mercado Pago</strong>, realizar una <strong>transferencia en Uruguay (BROU)</strong> o comunicarte por WhatsApp si necesitas otra alternativa.<br><a href="donar.html" class="chat-link-cta"><i class="fa-solid fa-hand-holding-heart"></i> IR A DONACIONES →</a>`,
      agenda: `Puedes consultar las próximas actividades, fechas especiales y la programación completa de la iglesia en nuestra <strong>Agenda Oficial</strong>, además de suscribirte a tu calendario personal:<br><a href="agenda.html" class="chat-link-cta"><i class="fa-regular fa-calendar-check"></i> VER AGENDA COMPLETA →</a>`,
      horarios: `Nuestros horarios de cultos generales en la Sede Central son:<br>• <strong>Jueves:</strong> 19:30 hs (Culto de Adoración y Palabra)<br>• <strong>Domingos:</strong> 10:00 hs (Evangelismo en la Feria)<br>• <strong>Domingos:</strong> 18:30 hs (Gran Celebración Dominical)<br><br>Además contamos con 8 células barriales entre semana.<br><a href="agenda.html" class="chat-link-cta"><i class="fa-regular fa-calendar-check"></i> VER AGENDA Y CULTOS →</a>`,
      celulas: `Contamos con 8 células familiares en distintos barrios:<br>• <strong>Lunes 19:00 hs:</strong> Hipódromo<br>• <strong>Martes 19:00 hs:</strong> La Milagrosa<br>• <strong>Martes 19:30 hs:</strong> Cerro Pelado<br>• <strong>Miércoles 19:30 hs:</strong> Cuñetti y Rocha<br>• <strong>Viernes 19:00 hs:</strong> Centro y Maldonado Nuevo<br>• <strong>Viernes 19:30 hs:</strong> Barrio Norte<br><br><a href="celulas.html" class="chat-link-cta"><i class="fa-solid fa-people-roof"></i> VER TODAS LAS CÉLULAS →</a> <a href="https://wa.me/59897432948?text=Hola,%20quisiera%20conocer%20la%20direcci%C3%B3n%20exacta%20de%20una%20c%C3%A9lula." target="_blank" class="chat-link-cta"><i class="fa-brands fa-whatsapp"></i> PEDIR UBICACIÓN EXACTA →</a>`,
      ministerios: `Nuestra iglesia cuenta con 10 ministerios y comités activos: <strong>Educación Cristiana</strong>, <strong>Comité de Jóvenes</strong>, <strong>Damas Dorcas</strong>, <strong>Caballeros</strong>, <strong>Música y Alabanza</strong>, <strong>Comunicaciones</strong>, <strong>Obra Social</strong>, <strong>Intercesión</strong>, <strong>Misiones y Extensión</strong> y <strong>Junta Local</strong>.<br><a href="ministerios.html" class="chat-link-cta"><i class="fa-solid fa-users"></i> CONOCER LOS MINISTERIOS →</a>`,
      pastor: `El <strong>Pastor Franklin Salas</strong> es misionero, predicador y consejero bíblico. Junto a su familia lidera IEANJESÚS Maldonado.<br><a href="nosotros.html#pastor" class="chat-link-cta"><i class="fa-solid fa-user"></i> PERFIL DEL PASTOR →</a> <a href="https://www.youtube.com/@pastorfranklinsalas" target="_blank" class="chat-link-cta"><i class="fa-brands fa-youtube"></i> YOUTUBE DEL PASTOR →</a> <a href="https://wa.me/59897432948?text=Hola,%20quisiera%20comunicarme%20con%20el%20Pastor%20Franklin%20Salas." target="_blank" class="chat-link-cta"><i class="fa-brands fa-whatsapp"></i> CONTACTAR AL PASTOR →</a>`,
      oracion: `Queremos orar por ti y tu familia. Puedes enviar tu motivo de intercesión a través de nuestro formulario oficial o escribirnos por WhatsApp.<br><button type="button" class="chat-link-cta open-prayer-btn"><i class="fa-solid fa-hands-praying"></i> ENVIAR PETICIÓN DE ORACIÓN →</button> <a href="https://wa.me/59897432948?text=Hola,%20quisiera%20pedir%20oraci%C3%B3n%20por..." target="_blank" class="chat-link-cta"><i class="fa-brands fa-whatsapp"></i> PEDIR POR WHATSAPP →</a>`,
      recursos: `En nuestra sección de <strong>Material Gratuito</strong> puedes descargar libremente folletos de evangelismo, estudios bíblicos, bosquejos y el Plan Cornelio:<br><a href="recursos.html" class="chat-link-cta"><i class="fa-solid fa-book-open"></i> DESCARGAR MATERIAL GRATUITO →</a>`,
      ubicacion: `Nuestra sede central se encuentra en <strong>Av. Wilson Ferreira Aldunate & 25 de Agosto</strong>, Maldonado, Uruguay.<br><a href="contacto.html" class="chat-link-cta"><i class="fa-solid fa-location-dot"></i> VER MAPA Y CONTACTO →</a> <a href="https://maps.app.goo.gl/Wde2KanvJQ8BYH8G6" target="_blank" class="chat-link-cta"><i class="fa-solid fa-diamond-turn-right"></i> ABRIR EN GOOGLE MAPS →</a>`,
      contacto: `Puedes comunicarte con nosotros por los canales oficiales:<br>• <strong>WhatsApp:</strong> +598 97 432 948<br>• <strong>Instagram:</strong> @ieanjesusmaldonado<br>• <strong>Facebook:</strong> IEANJESÚS Maldonado<br>• <strong>YouTube:</strong> @pastorfranklinsalas<br><a href="contacto.html" class="chat-link-cta"><i class="fa-solid fa-envelope"></i> IR A CONTACTO →</a> <a href="https://wa.me/59897432948" target="_blank" class="chat-link-cta"><i class="fa-brands fa-whatsapp"></i> ABRIR WHATSAPP →</a>`,
      jesus: `Jesucristo es el Señor y el Salvador de nuestras vidas. Te invitamos a leer nuestra guía sobre la fe, la gracia y el camino a Dios:<br><a href="jesus.html" class="chat-link-cta"><i class="fa-solid fa-heart"></i> CONOCE A JESÚS →</a>`,
      doctrina: `Nuestra doctrina se fundamenta en las Sagradas Escrituras: la Unicidad de Dios manifestado en Jesucristo (1 Timoteo 3:16), el Bautismo bíblico en el Nombre de Jesús y el poder del Espíritu Santo.<br><a href="nosotros.html#doctrina" class="chat-link-cta"><i class="fa-solid fa-book-bible"></i> LEER EN QUÉ CREEMOS →</a>`
    };

    const processBotQuery = (query) => {
      const q = normalizeText(query);
      let response = '';

      // 1. DONACIONES / OFRENDAS (Prioridad alta)
      if (q.includes('transferencia') || q.includes('brou') || q.includes('banco') || q.includes('cuenta bancaria')) {
        response = botKnowledge.donacion_transferencia;
      } else if (q.includes('otro pais') || q.includes('exterior') || q.includes('extranjero') || q.includes('afuera') || q.includes('internacional')) {
        response = botKnowledge.donacion_exterior;
      } else if (q.includes('donac') || q.includes('donar') || q.includes('ofrend') || q.includes('aporte') || q.includes('aportar') || q.includes('diezmo') || q.includes('colaborar') || q.includes('mercado pago') || q.includes('tarjeta') || q.includes('ayuda economica') || q.includes('ayudar economicamente') || q.includes('como puedo donar') || q.includes('como donar') || q.includes('dar una ofrenda')) {
        response = botKnowledge.donacion;
      }
      // 2. ORACIÓN / INTERCESIÓN
      else if (q.includes('oraci') || q.includes('orar') || q.includes('rezar') || q.includes('peticion') || q.includes('interces') || q.includes('oren por mi') || q.includes('necesito oracion') || q.includes('quiero pedir oracion') || q.includes('pedir oracion')) {
        response = botKnowledge.oracion;
      }
      // 3. HORARIOS DE CULTOS
      else if (q.includes('horari') || q.includes('hora') || q.includes('a que hora') || q.includes('cuando es el proximo culto') || q.includes('proximo culto') || q.includes('cuando son los cultos') || q.includes('dia de culto') || q.includes('dias de culto') || q.includes('culto dominical') || q.includes('feria') || q.includes('celebracion')) {
        response = botKnowledge.horarios;
      }
      // 4. AGENDA / ACTIVIDADES / EVENTOS
      else if (q.includes('agenda') || q.includes('actividad') || q.includes('evento') || q.includes('calendario') || q.includes('programacion') || q.includes('fechas') || q.includes('cuando hay') || q.includes('ics') || q.includes('google calendar')) {
        response = botKnowledge.agenda;
      }
      // 5. CÉLULAS
      else if (q.includes('celula') || q.includes('grupo familiar') || q.includes('hogar') || q.includes('hogares') || q.includes('barrio') || q.includes('rocha') || q.includes('cunetti') || q.includes('pelado') || q.includes('milagrosa') || q.includes('hipodromo')) {
        response = botKnowledge.celulas;
      }
      // 6. MINISTERIOS / COMITÉS
      else if (q.includes('ministerio') || q.includes('comite') || q.includes('damas') || q.includes('dorcas') || q.includes('jovenes') || q.includes('caballeros') || q.includes('musica') || q.includes('alabanza') || q.includes('educacion') || q.includes('comunicaciones') || q.includes('obra social') || q.includes('misiones') || q.includes('junta')) {
        response = botKnowledge.ministerios;
      }
      // 7. PASTOR FRANKLIN SALAS
      else if (q.includes('pastor') || q.includes('franklin') || q.includes('salas') || q.includes('hablar con el pastor') || q.includes('pastoral') || q.includes('lider')) {
        response = botKnowledge.pastor;
      }
      // 8. MATERIAL GRATUITO / DESCARGAS / ESTUDIOS
      else if (q.includes('material') || q.includes('gratuito') || q.includes('recurso') || q.includes('estudio') || q.includes('folleto') || q.includes('bosquejo') || q.includes('cornelio') || q.includes('descarga') || q.includes('biblico')) {
        response = botKnowledge.recursos;
      }
      // 9. UBICACIÓN / DIRECCIÓN / MAPA
      else if (q.includes('donde') || q.includes('direccion') || q.includes('ubicac') || q.includes('como llegar') || q.includes('mapa') || q.includes('donde queda') || q.includes('donde esta') || q.includes('sede central')) {
        response = botKnowledge.ubicacion;
      }
      // 10. CONTACTO / WHATSAPP / REDES
      else if (q.includes('whatsapp') || q.includes('contact') || q.includes('telefono') || q.includes('celular') || q.includes('redes') || q.includes('instagram') || q.includes('facebook') || q.includes('youtube') || q.includes('escribir')) {
        response = botKnowledge.contacto;
      }
      // 11. CONOCE A JESÚS / SALVACIÓN
      else if (q.includes('jesus') || q.includes('jesucristo') || q.includes('salvac') || q.includes('volver a dios') || q.includes('arrepent') || q.includes('conocer a jesus')) {
        response = botKnowledge.jesus;
      }
      // 12. DOCTRINA / EN QUÉ CREEMOS
      else if (q.includes('doctrina') || q.includes('cree') || q.includes('en que creemos') || q.includes('bautismo') || q.includes('unicidad') || q.includes('espiritu santo') || q.includes('fe')) {
        response = botKnowledge.doctrina;
      }
      // 13. FALLBACK
      else {
        response = `¡Gracias por escribirnos! Puedes consultar sobre nuestra <strong>agenda y actividades</strong>, <strong>horarios de cultos</strong>, <strong>células barriales</strong>, <strong>donaciones</strong>, <strong>material gratuito</strong>, <strong>peticiones de oración</strong>, <strong>nuestro pastor</strong> o <strong>ubicación</strong>.<br><br>También puedes escribirnos directamente por WhatsApp:<br><a href="https://wa.me/59897432948" target="_blank" class="chat-link-cta"><i class="fa-brands fa-whatsapp"></i> HABLAR POR WHATSAPP →</a>`;
      }

      setTimeout(() => {
        addMessage(response, 'bot');
      }, 250);
    };

    // Binding para chips de sugerencias rápidas
    document.querySelectorAll('.chat-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const query = chip.getAttribute('data-query') || chip.textContent.trim();
        addMessage(query, 'user');
        processBotQuery(query);
      });
    });

    if (chatForm && chatInput) {
      chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = chatInput.value.trim();
        if (!text) return;
        addMessage(text, 'user');
        chatInput.value = '';
        processBotQuery(text);
      });
    }
  }

  // 10. CONTROLADOR DE REPERTORIO FOTOGRÁFICO Y LIGHTBOX
  const galleryLightbox = document.getElementById('gallery-lightbox');
  const lightboxImg = document.getElementById('lightbox-image');
  const lightboxCloseBtn = document.getElementById('lightbox-close-btn');
  const lightboxPrevBtn = document.getElementById('lightbox-prev-btn');
  const lightboxNextBtn = document.getElementById('lightbox-next-btn');
  const lightboxCounter = document.getElementById('lightbox-counter');
  const lightboxCaption = document.getElementById('lightbox-caption');

  let currentGalleryList = [];
  let currentPhotoIndex = 0;
  let lastFocusedGalleryEl = null;

  const renderLightboxItem = () => {
    if (!currentGalleryList.length || !lightboxImg) return;
    if (currentPhotoIndex < 0) currentPhotoIndex = currentGalleryList.length - 1;
    if (currentPhotoIndex >= currentGalleryList.length) currentPhotoIndex = 0;

    const photo = currentGalleryList[currentPhotoIndex];
    lightboxImg.style.opacity = '0';
    lightboxImg.style.transform = 'scale(0.98)';
    
    setTimeout(() => {
      lightboxImg.src = photo.src;
      lightboxImg.alt = photo.alt || photo.title || 'Fotografía de la congregación';
      if (lightboxCounter) {
        lightboxCounter.textContent = `${currentPhotoIndex + 1} / ${currentGalleryList.length}`;
      }
      if (lightboxCaption) {
        lightboxCaption.textContent = photo.alt || photo.title || '';
      }
      lightboxImg.style.opacity = '1';
      lightboxImg.style.transform = 'scale(1)';
    }, 120);
  };

  const showPrevPhoto = () => {
    currentPhotoIndex--;
    renderLightboxItem();
  };

  const showNextPhoto = () => {
    currentPhotoIndex++;
    renderLightboxItem();
  };

  const closeGalleryLightbox = () => {
    if (!galleryLightbox) return;
    galleryLightbox.classList.remove('active');
    const anyModalActive = document.querySelector('.modal-editorial-backdrop.active');
    if (!anyModalActive) {
      document.body.style.overflow = '';
    }
    if (lastFocusedGalleryEl && typeof lastFocusedGalleryEl.focus === 'function') {
      lastFocusedGalleryEl.focus();
    }
  };

  window.openGalleryLightbox = (photoList, initialIndex = 0, triggerEl = null) => {
    if (!galleryLightbox || !photoList || !photoList.length) return;
    currentGalleryList = photoList;
    currentPhotoIndex = initialIndex >= 0 && initialIndex < photoList.length ? initialIndex : 0;
    lastFocusedGalleryEl = triggerEl || document.activeElement;

    renderLightboxItem();
    galleryLightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (lightboxCloseBtn) lightboxCloseBtn.focus();
  };

  if (lightboxCloseBtn) {
    lightboxCloseBtn.addEventListener('click', closeGalleryLightbox);
  }

  if (lightboxPrevBtn) {
    lightboxPrevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showPrevPhoto();
    });
  }

  if (lightboxNextBtn) {
    lightboxNextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showNextPhoto();
    });
  }

  if (galleryLightbox) {
    galleryLightbox.addEventListener('click', (e) => {
      if (e.target === galleryLightbox || e.target.classList.contains('gallery-lightbox-container') || e.target.classList.contains('gallery-lightbox-stage')) {
        closeGalleryLightbox();
      }
    });

    // Soporte táctil swipe para dispositivos móviles
    let touchStartX = 0;
    let touchStartY = 0;
    galleryLightbox.addEventListener('touchstart', (e) => {
      if (e.changedTouches && e.changedTouches.length > 0) {
        touchStartX = e.changedTouches[0].clientX;
        touchStartY = e.changedTouches[0].clientY;
      }
    }, { passive: true });

    galleryLightbox.addEventListener('touchend', (e) => {
      if (e.changedTouches && e.changedTouches.length > 0) {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const diffX = touchEndX - touchStartX;
        const diffY = touchEndY - touchStartY;
        if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
          if (diffX > 0) {
            showPrevPhoto();
          } else {
            showNextPhoto();
          }
        }
      }
    }, { passive: true });
  }

  // Inicializar clicks en la galería general de Nosotros
  const generalGalleryItems = document.querySelectorAll('.gallery-item-editorial');
  if (generalGalleryItems.length > 0 && window.ieanDataStore) {
    const allGalleryPhotos = [];
    generalGalleryItems.forEach(item => {
      const pid = item.getAttribute('data-photo-id');
      const photoObj = window.ieanDataStore.getPhotoById(pid) || {
        id: pid,
        src: item.querySelector('img')?.getAttribute('src') || '',
        alt: item.querySelector('img')?.getAttribute('alt') || ''
      };
      allGalleryPhotos.push(photoObj);
    });

    generalGalleryItems.forEach((item, idx) => {
      item.setAttribute('tabindex', '0');
      item.setAttribute('role', 'button');
      item.setAttribute('aria-label', allGalleryPhotos[idx]?.alt || 'Fotografía de la galería');
      const handler = () => {
        window.openGalleryLightbox(allGalleryPhotos, idx, item);
      };
      item.addEventListener('click', handler);
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handler();
        }
      });
    });
  }

  // Teclado global: Escape para cerrar, Flechas para navegar Lightbox
  document.addEventListener('keydown', (e) => {
    if (galleryLightbox && galleryLightbox.classList.contains('active')) {
      if (e.key === 'Escape') {
        closeGalleryLightbox();
        return;
      }
      if (e.key === 'ArrowLeft') {
        showPrevPhoto();
        return;
      }
      if (e.key === 'ArrowRight') {
        showNextPhoto();
        return;
      }
    }

    if (e.key === 'Escape') {
      closeDrawer();
      if (serviceModal) serviceModal.classList.remove('active');
      if (bizModal) bizModal.classList.remove('active');
      if (prayerModal) prayerModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  });

  // =========================================================================
  // INICIALIZACIÓN PÚBLICA ASÍNCRONA DESDE SUPABASE
  // =========================================================================
  const renderAllPublicData = () => {
    checkAndRenderNotices();
    syncSchedulesFromStore();
    syncCellsFromStore();
    syncBusinessesFromStore();
    renderPublicResources();
  };

  async function initializePublicSite() {
    if (window.ieanDataStore) {
      if (window.ieanDataStore.initPromise) {
        await window.ieanDataStore.initPromise;
      } else {
        await window.ieanDataStore.refreshAll();
      }
    }
    renderAllPublicData();
  }

  // Suscripción reactiva ante cambios en tiempo real
  if (window.ieanDataStore) {
    window.ieanDataStore.subscribe(renderAllPublicData);
  }

  // Ejecutar carga fresca de Supabase
  initializePublicSite();
});
