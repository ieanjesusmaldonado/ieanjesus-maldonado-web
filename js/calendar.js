/**
 * IEANJESÚS Maldonado - Motor de Agenda y Calendario Mensual
 * Maneja la visualización interactiva del calendario y la lista cronológica de eventos.
 */

document.addEventListener('DOMContentLoaded', () => {
  const calendarDaysContainer = document.getElementById('calendar-days');
  const currentMonthDisplay = document.getElementById('calendar-current-month');
  const prevMonthBtn = document.getElementById('calendar-prev-btn');
  const nextMonthBtn = document.getElementById('calendar-next-btn');
  const upcomingEventsList = document.getElementById('upcoming-events-list');
  const eventDetailModal = document.getElementById('event-detail-modal');
  const eventModalClose = document.getElementById('event-modal-close');

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

  const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  // Formatear fecha a legible en español
  const formatEventDate = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const dateObj = new Date(year, month, day);
    const dayName = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][dateObj.getDay()];
    return `${dayName} ${day} de ${MONTH_NAMES[month]} de ${year}`;
  };

  // Renderizar Lista de Próximas Actividades
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
      const parts = evt.date.split('-');
      const dayNum = parts[2] || '';
      const monthNum = parseInt(parts[1], 10) - 1;
      const monthShort = MONTH_NAMES[monthNum] ? MONTH_NAMES[monthNum].slice(0, 3).toUpperCase() : '';

      const card = document.createElement('div');
      card.className = `agenda-event-card ${evt.featured ? 'featured-event' : ''}`;
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
            <span><i class="fa-regular fa-clock"></i> ${evt.time}</span>
            <span><i class="fa-solid fa-location-dot"></i> ${evt.location}</span>
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

      const dayEvents = allEvents.filter(e => e.public && e.date === fullDateStr);
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
        cell.setAttribute('title', dayEvents.map(e => `${e.time}: ${e.title}`).join('\n'));
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

  // Modal de Detalle de Evento
  const openEventModal = (event) => {
    if (!eventDetailModal) return;

    document.getElementById('modal-event-cat').textContent = event.category || 'Actividad';
    document.getElementById('modal-event-title').textContent = event.title;
    document.getElementById('modal-event-date').textContent = formatEventDate(event.date);
    document.getElementById('modal-event-time').textContent = event.time;
    document.getElementById('modal-event-location').textContent = event.location;
    document.getElementById('modal-event-desc').textContent = event.description || 'Sin descripción adicional.';

    const mapBtn = document.getElementById('modal-event-map-btn');
    if (mapBtn) {
      mapBtn.href = `https://maps.google.com/?q=${encodeURIComponent(event.location)}`;
    }

    const waBtn = document.getElementById('modal-event-wa-btn');
    if (waBtn) {
      const msg = `Hola, Dios le bendiga. Quisiera consultar sobre la actividad: ${event.title} (${event.date} - ${event.time})`;
      waBtn.href = `https://wa.me/59897432948?text=${encodeURIComponent(msg)}`;
    }

    eventDetailModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  // Modal cuando hay múltiples eventos el mismo día
  const openMultiEventModal = (dateStr, eventsList) => {
    if (!eventDetailModal) return;
    document.getElementById('modal-event-cat').textContent = `${eventsList.length} ACTIVIDADES`;
    document.getElementById('modal-event-title').textContent = `Actividades del ${formatEventDate(dateStr)}`;
    document.getElementById('modal-event-date').textContent = formatEventDate(dateStr);
    document.getElementById('modal-event-time').textContent = 'Múltiples horarios';
    document.getElementById('modal-event-location').textContent = 'IEANJESÚS Maldonado';

    const descHtml = eventsList.map(e => `
      <div style="margin-bottom: 1.25rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border-fine);">
        <strong style="color: var(--ink-primary); font-size: 1.05rem;">${e.title}</strong><br>
        <span style="font-size: 0.85rem; color: var(--accent-coral); font-weight: 600;">🕒 ${e.time} | 📍 ${e.location}</span>
        <p style="margin-top: 0.4rem; font-size: 0.9rem; color: var(--ink-secondary);">${e.description || ''}</p>
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
    if (e.key === 'Escape' && eventDetailModal && eventDetailModal.classList.contains('active')) {
      closeEventModal();
    }
  });

  // Inicializar
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
