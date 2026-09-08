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

  // 7. FILTRADO DE CÉLULAS EN CELULAS.HTML & HOMEPAGE
  const filterTabs = document.querySelectorAll('.filter-tab-btn');
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
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  // 8. FILTRADO DE MATERIAL GRATUITO EN RECURSOS.HTML
  const recursoFilterBtns = document.querySelectorAll('.recurso-filter-btn');
  const recursoCards = document.querySelectorAll('.recurso-card-item');

  if (recursoFilterBtns.length > 0 && recursoCards.length > 0) {
    recursoFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        recursoFilterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.getAttribute('data-category');

        recursoCards.forEach(card => {
          const cat = card.getAttribute('data-category');
          if (filter === 'all' || cat === filter) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
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
    };

    const botKnowledge = {
      horarios: 'Nuestros cultos generales en la sede central son:<br>• <strong>Jueves:</strong> 19:30 hs<br>• <strong>Domingos:</strong> 18:30 hs.<br>Además tenemos 8 células en hogares de lunes a viernes. <a href="celulas.html" style="color: var(--green-inst); text-decoration: underline; font-weight: 600;">Ver todos los horarios</a>.',
      ubicacion: 'Nuestra sede central se encuentra en <strong>Av. Wilson Ferreira Aldunate & 25 de Agosto</strong>, Maldonado, Uruguay. <a href="contacto.html" style="color: var(--green-inst); text-decoration: underline; font-weight: 600;">Ver mapa y cómo llegar</a>.',
      celulas: 'Contamos con 8 células activas en: Centro (Viernes 19:00 hs), Barrio Norte (Viernes 19:30 hs), Cuñetti (Miércoles 19:30 hs), Cerro Pelado (Martes 19:30 hs), La Milagrosa (Martes 19:00 hs), Hipódromo (Lunes 19:00 hs), Maldonado Nuevo (Viernes 19:00 hs) y Rocha (Miércoles 19:30 hs). <a href="celulas.html" style="color: var(--green-inst); text-decoration: underline; font-weight: 600;">Explorar las células</a>.',
      pastor: 'Nuestro pastor es el <strong>Pastor Franklin Salas</strong>, misionero y predicador bíblico. <a href="nosotros.html#pastor" style="color: var(--green-inst); text-decoration: underline; font-weight: 600;">Conocer más del pastor</a>.',
      agenda: 'Puedes consultar nuestras próximas actividades y eventos especiales en la <a href="agenda.html" style="color: var(--green-inst); text-decoration: underline; font-weight: 600;">Agenda Oficial</a>.',
      recursos: 'Descarga folletos, materiales de evangelismo, Plan Cornelio y bosquejos en <a href="recursos.html" style="color: var(--green-inst); text-decoration: underline; font-weight: 600;">Material Gratuito</a>.',
      creencias: 'Creemos en un solo Dios manifestado en Jesucristo, en el bautismo bíblico en el Nombre de Jesús por inmersión y en la salvación por gracia (Efesios 4:5). <a href="nosotros.html#doctrina" style="color: var(--green-inst); text-decoration: underline; font-weight: 600;">Leer en qué creemos</a>.',
      jesus: 'Jesús es el camino, la verdad y la vida. Si deseas conocer su mensaje o dar el paso para acercarte a Dios, puedes leer nuestra guía. <a href="jesus.html" style="color: var(--green-inst); text-decoration: underline; font-weight: 600;">Ir a Conoce a Jesús</a>.',
      oracion: 'Puedes solicitar oración en cualquier momento abriendo nuestro formulario de intercesión o escribiéndonos directamente por WhatsApp.'
    };

    const processBotQuery = (query) => {
      const q = query.toLowerCase();
      let response = '';

      if (q.includes('horari') || q.includes('hora') || q.includes('dia') || q.includes('cuándo') || q.includes('reun')) {
        response = botKnowledge.horarios;
      } else if (q.includes('agenda') || q.includes('evento') || q.includes('actividad') || q.includes('fecha')) {
        response = botKnowledge.agenda;
      } else if (q.includes('recurso') || q.includes('material') || q.includes('folleto') || q.includes('bosquejo') || q.includes('cornelio')) {
        response = botKnowledge.recursos;
      } else if (q.includes('donde') || q.includes('direcci') || q.includes('ubicaci') || q.includes('mapa') || q.includes('llegar')) {
        response = botKnowledge.ubicacion;
      } else if (q.includes('celula') || q.includes('hogar') || q.includes('barrio')) {
        response = botKnowledge.celulas;
      } else if (q.includes('pastor') || q.includes('franklin') || q.includes('lider')) {
        response = botKnowledge.pastor;
      } else if (q.includes('cree') || q.includes('doctrina') || q.includes('bautismo') || q.includes('fe')) {
        response = botKnowledge.creencias;
      } else if (q.includes('jesus') || q.includes('salvac') || q.includes('volver') || q.includes('dios')) {
        response = botKnowledge.jesus;
      } else if (q.includes('oraci') || q.includes('rezar') || q.includes('peticion') || q.includes('pedir')) {
        response = botKnowledge.oracion;
      } else {
        response = 'Gracias por escribirnos. Puedes consultar sobre nuestra <strong>agenda</strong>, <strong>horarios</strong>, <strong>material gratuito</strong>, <strong>células barriales</strong> o nuestro <strong>pastor</strong>. También puedes <a href="https://wa.me/59897432948" target="_blank" style="color: var(--green-inst); text-decoration: underline; font-weight: 600;">escribirnos por WhatsApp</a>.';
      }

      setTimeout(() => {
        addMessage(response, 'bot');
      }, 300);
    };

    document.querySelectorAll('.chat-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const query = chip.getAttribute('data-query');
        addMessage(chip.textContent, 'user');
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
    syncBusinessesFromStore();
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
