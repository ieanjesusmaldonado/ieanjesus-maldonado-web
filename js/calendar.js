/**
 * =============================================================================
 * IEANJESÚS Maldonado - Motor de Agenda y Calendario Mensual
 * =============================================================================
 * Maneja la visualización interactiva del calendario mensual, la lista cronológica
 * de la programación completa y la interacción con el modal de suscripción.
 * =============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  const calendarDaysContainer = document.getElementById('calendar-days');
  const currentMonthDisplay = document.getElementById('calendar-current-month');
  const prevMonthBtn = document.getElementById('calendar-prev-btn');
  const nextMonthBtn = document.getElementById('calendar-next-btn');
  const upcomingEventsList = document.getElementById('upcoming-events-list');
  const eventDetailModal = document.getElementById('event-detail-modal');
  const eventModalClose = document.getElementById('event-modal-close');

  // Modal de suscripción a calendarios
  const subscribeModal = document.getElementById('calendar-subscribe-modal');
  const openSubscribeModalBtn = document.getElementById('open-subscribe-modal-btn');
  const subscribeModalClose = document.getElementById('subscribe-modal-close');
  const copyIcsBtns = document.querySelectorAll('.copy-ics-btn');

  if (!calendarDaysContainer || !upcomingEventsList) {
    // Si no estamos en la página de agenda, salir
    return;
  }

  let currentDate = new Date();
  let selectedYear = currentDate.getFullYear();
  let selectedMonth = currentDate.getMonth(); // 0-11

  const MONTH_NAMES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Formatear fecha a legible en español
  const formatEventDate = (dateStr) => {
    if (!dateStr) return '';
    if (dateStr.includes(' a ')) {
      const parts = dateStr.split(' a ');
      const p1 = parts[0].trim().split('-');
      const p2 = parts[1].trim().split('-');
      if (p1.length === 3 && p2.length === 3) {
        const mIdx = parseInt(p1[1], 10) - 1;
        return `Del ${parseInt(p1[2], 10)} al ${parseInt(p2[2], 10)} de ${MONTH_NAMES[mIdx]} de ${p1[0]}`;
      }
      return dateStr;
    }

    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const dateObj = new Date(year, month, day);
    const dayName = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][dateObj.getDay()];
    return `${dayName} ${day} de ${MONTH_NAMES[month]} de ${year}`;
  };

  // Renderizar Lista de Próximas Actividades (Calendario Completo)
  const renderUpcomingEvents = () => {
    const events = window.ieanDataStore ? window.ieanDataStore.getEvents(true) : [];
    upcomingEventsList.innerHTML = '';

    if (events.length === 0) {
      upcomingEventsList.innerHTML = `
        <div class="empty-agenda-state">
          <i class="fa-regular fa-calendar-check" style="font-size: 2rem; color: var(--ink-muted); margin-bottom: 0.75rem;"></i>
          <p style="color: var(--ink-secondary); font-size: 0.95rem;">No hay actividades públicas programadas para los próximos días.</p>
          <span style="font-size: 0.82rem; color: var(--ink-muted);">Consulta periódicamente o contáctanos para más información.</span>
        </div>
      `;
      return;
    }

    events.forEach(evt => {
      let dayNum = '';
      let monthShort = '';

      if (evt.date.includes(' a ')) {
        const startParts = evt.date.split(' a ')[0].trim().split('-');
        dayNum = startParts[2] || '';
        const monthNum = parseInt(startParts[1], 10) - 1;
        monthShort = MONTH_NAMES[monthNum] ? MONTH_NAMES[monthNum].slice(0, 3).toUpperCase() : '';
      } else {
        const parts = evt.date.split('-');
        dayNum = parts[2] || '';
        const monthNum = parseInt(parts[1], 10) - 1;
        monthShort = MONTH_NAMES[monthNum] ? MONTH_NAMES[monthNum].slice(0, 3).toUpperCase() : '';
      }

      const card = document.createElement('div');
      card.className = `agenda-event-card ${evt.featured ? 'featured-event' : ''}`;
      
      const timeHtml = evt.time 
        ? `<span><i class="fa-regular fa-clock"></i> ${evt.time}</span>` 
        : `<span><i class="fa-regular fa-calendar"></i> Fecha completa</span>`;

      card.innerHTML = `
        <div class="agenda-date-badge">
          <span class="agenda-date-day">${dayNum}</span>
          <span class="agenda-date-month">${monthShort}</span>
        </div>
        <div class="agenda-event-info">
          <div class="agenda-event-meta-top">
            <span class="agenda-cat-badge">${evt.category || 'Actividad'}</span>
            ${evt.featured ? '<span class="agenda-featured-pill">DESTACADO</span>' : ''}
          </div>
          <h3 class="agenda-event-title">${evt.title}</h3>
          <p class="agenda-event-desc">${evt.description || ''}</p>
          <div class="agenda-event-meta-bottom">
            ${timeHtml}
            <span><i class="fa-solid fa-location-dot"></i> ${evt.location || 'Sede Central IEANJESÚS Maldonado'}</span>
          </div>
        </div>
        <div class="agenda-event-action">
          <button class="btn-editorial btn-dark btn-view-event" data-id="${evt.id}" style="font-size: 0.78rem; padding: 0.5rem 0.9rem;">
            Ver detalle <i class="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      `;

      card.querySelector('.btn-view-event').addEventListener('click', () => {
        openEventModal(evt);
      });

      upcomingEventsList.appendChild(card);
    });
  };

  // Renderizar Grilla del Calendario Mensual
  const renderCalendar = () => {
    currentMonthDisplay.textContent = `${MONTH_NAMES[selectedMonth]} ${selectedYear}`;
    calendarDaysContainer.innerHTML = '';

    const firstDayIndex = new Date(selectedYear, selectedMonth, 1).getDay(); // 0 = Domingo
    const totalDaysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const totalDaysPrevMonth = new Date(selectedYear, selectedMonth, 0).getDate();

    const allEvents = window.ieanDataStore ? window.ieanDataStore.getEvents(false) : [];

    // Ajuste para comenzar semana en Lunes (1 = Lunes, 0 = Domingo al final)
    let startOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

    // Días del mes anterior (relleno sutil)
    for (let i = startOffset; i > 0; i--) {
      const prevDay = totalDaysPrevMonth - i + 1;
      const cell = document.createElement('div');
      cell.className = 'calendar-day-cell prev-month-cell';
      cell.innerHTML = `<span class="day-num">${prevDay}</span>`;
      calendarDaysContainer.appendChild(cell);
    }

    // Días del mes actual
    const today = new Date();
    const isCurrentMonthYear = today.getFullYear() === selectedYear && today.getMonth() === selectedMonth;
    const todayDateNum = today.getDate();

    for (let day = 1; day <= totalDaysInMonth; day++) {
      const dayStr = day < 10 ? `0${day}` : `${day}`;
      const monthStr = selectedMonth + 1 < 10 ? `0${selectedMonth + 1}` : `${selectedMonth + 1}`;
      const fullDateStr = `${selectedYear}-${monthStr}-${dayStr}`;

      // Filtrar eventos que caen en este día (fecha exacta o rango de fechas)
      const dayEvents = allEvents.filter(e => {
        if (!e.public) return false;
        if (e.date === fullDateStr) return true;
        if (e.date.includes(' a ')) {
          const [sDate, eDate] = e.date.split(' a ').map(s => s.trim());
          return fullDateStr >= sDate && fullDateStr <= eDate;
        }
        return false;
      });

      const isToday = isCurrentMonthYear && day === todayDateNum;
      const hasEvents = dayEvents.length > 0;

      const cell = document.createElement('div');
      cell.className = `calendar-day-cell current-month-cell ${isToday ? 'is-today' : ''} ${hasEvents ? 'has-events' : ''}`;
      
      let eventsDots = '';
      if (hasEvents) {
        eventsDots = `<div class="event-dots-wrap">
          ${dayEvents.slice(0, 3).map(() => `<span class="event-dot"></span>`).join('')}
        </div>`;
      }

      cell.innerHTML = `
        <span class="day-num">${day}</span>
        ${eventsDots}
        ${hasEvents ? `<span class="event-count-badge">${dayEvents.length}</span>` : ''}
      `;

      if (hasEvents) {
        cell.setAttribute('title', dayEvents.map(e => `${e.time ? e.time + ': ' : ''}${e.title}`).join('\n'));
        cell.addEventListener('click', () => {
          if (dayEvents.length === 1) {
            openEventModal(dayEvents[0]);
          } else {
            openMultiEventModal(fullDateStr, dayEvents);
          }
        });
      }

      calendarDaysContainer.appendChild(cell);
    }

    // Días de relleno del próximo mes para completar la grilla
    const totalRendered = startOffset + totalDaysInMonth;
    const nextDaysCount = (7 - (totalRendered % 7)) % 7;
    for (let j = 1; j <= nextDaysCount; j++) {
      const cell = document.createElement('div');
      cell.className = 'calendar-day-cell next-month-cell';
      cell.innerHTML = `<span class="day-num">${j}</span>`;
      calendarDaysContainer.appendChild(cell);
    }
  };

  // Modal de Detalle de Evento Individual
  const openEventModal = (event) => {
    if (!eventDetailModal) return;

    document.getElementById('modal-event-cat').textContent = event.category || 'Actividad';
    document.getElementById('modal-event-title').textContent = event.title;
    document.getElementById('modal-event-date').textContent = formatEventDate(event.date);
    document.getElementById('modal-event-time').textContent = event.time || 'Sin horario fijado';
    document.getElementById('modal-event-location').textContent = event.location || 'Sede Central IEANJESÚS Maldonado';
    document.getElementById('modal-event-desc').textContent = event.description || 'Sin descripción adicional.';

    const mapBtn = document.getElementById('modal-event-map-btn');
    if (mapBtn) {
      mapBtn.href = `https://maps.google.com/?q=${encodeURIComponent(event.location || 'IEANJESÚS Maldonado')}`;
    }

    const waBtn = document.getElementById('modal-event-wa-btn');
    if (waBtn) {
      const timeInfo = event.time ? ` (${event.time})` : '';
      const msg = `Hola, Dios le bendiga. Quisiera consultar sobre la actividad: ${event.title} - ${formatEventDate(event.date)}${timeInfo}`;
      waBtn.href = `https://wa.me/59897432948?text=${encodeURIComponent(msg)}`;
    }

    eventDetailModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  // Modal cuando hay múltiples eventos el mismo día
  const openMultiEventModal = (dateStr, eventsList) => {
    if (!eventDetailModal) return;
    document.getElementById('modal-event-cat').textContent = `${eventsList.length} ACTIVIDADES PROGRAMADAS`;
    document.getElementById('modal-event-title').textContent = `Actividades del ${formatEventDate(dateStr)}`;
    document.getElementById('modal-event-date').textContent = formatEventDate(dateStr);
    document.getElementById('modal-event-time').textContent = 'Múltiples horarios / actividades';
    document.getElementById('modal-event-location').textContent = 'IEANJESÚS Maldonado';

    const descHtml = eventsList.map(e => `
      <div style="margin-bottom: 1.25rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border-fine);">
        <strong style="color: var(--ink-primary); font-size: 1.05rem;">${e.title}</strong><br>
        <span style="font-size: 0.85rem; color: var(--accent-coral); font-weight: 600;">
          ${e.time ? '🕒 ' + e.time + ' | ' : ''}📍 ${e.location || 'Sede Central IEANJESÚS Maldonado'}
        </span>
        <p style="margin-top: 0.4rem; font-size: 0.9rem; color: var(--ink-secondary); line-height: 1.5;">${e.description || ''}</p>
      </div>
    `).join('');

    document.getElementById('modal-event-desc').innerHTML = descHtml;
    eventDetailModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeEventModal = () => {
    if (eventDetailModal) {
      eventDetailModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  if (eventModalClose) eventModalClose.addEventListener('click', closeEventModal);
  if (eventDetailModal) {
    eventDetailModal.addEventListener('click', (e) => {
      if (e.target === eventDetailModal) closeEventModal();
    });
  }

  // --- MODAL DE SUSCRIPCIÓN ---
  const configureSubscriptionLinks = () => {
    let baseOrigin = window.location.origin;
    if (!baseOrigin || baseOrigin === 'null' || baseOrigin.startsWith('file:')) {
      baseOrigin = 'https://ieanjesusmaldonado.org';
    }

    const iglesiaHttps = `${baseOrigin}/calendario/iglesia.ics`;
    const completoHttps = `${baseOrigin}/calendario/completo.ics`;

    const iglesiaWebcal = iglesiaHttps.replace(/^https?:\/\//i, 'webcal://');
    const completoWebcal = completoHttps.replace(/^https?:\/\//i, 'webcal://');

    const iglesiaGoogle = `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(iglesiaHttps)}`;
    const completoGoogle = `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(completoHttps)}`;

    const subIglesiaGoogle = document.getElementById('sub-iglesia-google');
    if (subIglesiaGoogle) subIglesiaGoogle.href = iglesiaGoogle;

    const subIglesiaApple = document.getElementById('sub-iglesia-apple');
    if (subIglesiaApple) subIglesiaApple.href = iglesiaWebcal;

    const subIglesiaCopy = document.getElementById('sub-iglesia-copy');
    if (subIglesiaCopy) subIglesiaCopy.setAttribute('data-url', iglesiaHttps);

    const subCompletoGoogle = document.getElementById('sub-completo-google');
    if (subCompletoGoogle) subCompletoGoogle.href = completoGoogle;

    const subCompletoApple = document.getElementById('sub-completo-apple');
    if (subCompletoApple) subCompletoApple.href = completoWebcal;

    const subCompletoCopy = document.getElementById('sub-completo-copy');
    if (subCompletoCopy) subCompletoCopy.setAttribute('data-url', completoHttps);
  };

  const openSubscribeModal = () => {
    if (!subscribeModal) return;
    configureSubscriptionLinks();
    subscribeModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeSubscribeModal = () => {
    if (!subscribeModal) return;
    subscribeModal.classList.remove('active');
    document.body.style.overflow = '';
  };

  if (openSubscribeModalBtn) {
    openSubscribeModalBtn.addEventListener('click', openSubscribeModal);
  }

  if (subscribeModalClose) {
    subscribeModalClose.addEventListener('click', closeSubscribeModal);
  }

  if (subscribeModal) {
    subscribeModal.addEventListener('click', (e) => {
      if (e.target === subscribeModal) closeSubscribeModal();
    });
  }

  // Copiar URL de feed ICS al portapapeles
  if (copyIcsBtns) {
    copyIcsBtns.forEach(btn => {
      btn.addEventListener('click', async () => {
        const url = btn.getAttribute('data-url');
        if (!url) return;

        try {
          await navigator.clipboard.writeText(url);
          const origHtml = btn.innerHTML;
          btn.innerHTML = '<i class="fa-solid fa-check"></i> ¡ENLACE COPIADO!';
          btn.style.borderColor = 'var(--green-inst)';
          btn.style.color = 'var(--green-inst)';

          setTimeout(() => {
            btn.innerHTML = origHtml;
            btn.style.borderColor = '';
            btn.style.color = '';
          }, 3000);
        } catch (err) {
          // Fallback manual para navegadores antiguos
          const tempInput = document.createElement('input');
          tempInput.value = url;
          document.body.appendChild(tempInput);
          tempInput.select();
          document.execCommand('copy');
          document.body.removeChild(tempInput);
          btn.innerHTML = '<i class="fa-solid fa-check"></i> ¡ENLACE COPIADO!';
          setTimeout(() => {
            btn.innerHTML = '<i class="fa-solid fa-link"></i> OTROS CALENDARIOS (COPIAR URL)';
          }, 3000);
        }
      });
    });
  }

  // Controles de mes
  if (prevMonthBtn) {
    prevMonthBtn.addEventListener('click', () => {
      selectedMonth--;
      if (selectedMonth < 0) {
        selectedMonth = 11;
        selectedYear--;
      }
      renderCalendar();
    });
  }

  if (nextMonthBtn) {
    nextMonthBtn.addEventListener('click', () => {
      selectedMonth++;
      if (selectedMonth > 11) {
        selectedMonth = 0;
        selectedYear++;
      }
      renderCalendar();
    });
  }

  // Teclado Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (eventDetailModal && eventDetailModal.classList.contains('active')) closeEventModal();
      if (subscribeModal && subscribeModal.classList.contains('active')) closeSubscribeModal();
    }
  });

  // Inicializar vistas
  configureSubscriptionLinks();
  renderUpcomingEvents();
  renderCalendar();

  // Suscribirse a cambios en el DataStore si se edita desde el panel
  if (window.ieanDataStore) {
    window.ieanDataStore.subscribe(() => {
      renderUpcomingEvents();
      renderCalendar();
    });
  }
});
