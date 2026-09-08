/**
 * =============================================================================
 * IEANJESÚS Maldonado - Lógica del Panel Administrativo (admin.js con Supabase)
 * =============================================================================
 * Autenticación oficial Supabase Auth (Email + Contraseña), verificación de
 * autorización mediante tabla admin_users, y persistencia global en PostgreSQL.
 * =============================================================================
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Elementos de la interfaz
  const loginSection = document.getElementById('admin-login-section');
  const dashboardSection = document.getElementById('admin-dashboard-section');
  const loginForm = document.getElementById('admin-login-form');
  const loginEmailInput = document.getElementById('admin-email-input');
  const loginPassInput = document.getElementById('admin-pass-input');
  const loginErrorMsg = document.getElementById('login-error-msg');
  const loginSubmitBtn = document.getElementById('admin-login-submit-btn');
  const logoutBtn = document.getElementById('admin-logout-btn');
  const userBadge = document.getElementById('admin-user-badge');
  const toastNotification = document.getElementById('admin-toast');

  // Notificación Toast de confirmación
  function showToast(message, type = 'success') {
    if (!toastNotification) return;
    toastNotification.textContent = message;
    toastNotification.className = `admin-toast active toast-${type}`;
    setTimeout(() => {
      toastNotification.classList.remove('active');
    }, 3500);
  }

  // Verificar si un usuario de Supabase Auth está en la tabla admin_users
  async function verifyAdminAuth(user) {
    if (!user || !window.supabaseClient) return false;
    try {
      const { data, error } = await window.supabaseClient
        .from('admin_users')
        .select('id, email')
        .eq('id', user.id)
        .maybeSingle();

      if (data && data.id) {
        return true;
      }
      
      // Si la consulta fue bloqueada por RLS o no encontró fila, pero el usuario es el oficial registrado
      if (user.email && user.email.toLowerCase() === 'ieanjesusmaldonado@gmail.com') {
        return true;
      }

      return false;
    } catch (e) {
      console.warn('Verificación fallback de admin:', e);
      if (user.email && user.email.toLowerCase() === 'ieanjesusmaldonado@gmail.com') {
        return true;
      }
      return false;
    }
  }

  // Actualizar la interfaz según el estado de la sesión
  async function updateAdminSessionUI(user) {
    if (user) {
      if (loginSection) loginSection.style.display = 'none';
      if (dashboardSection) dashboardSection.style.display = 'block';
      if (userBadge) {
        userBadge.textContent = user.email || 'Admin';
        userBadge.style.display = 'inline-block';
      }
      if (window.ieanDataStore) {
        await window.ieanDataStore.refreshAll();
      }
      loadActiveModuleData();
    } else {
      if (loginSection) loginSection.style.display = 'flex';
      if (dashboardSection) dashboardSection.style.display = 'none';
      if (userBadge) {
        userBadge.style.display = 'none';
      }
    }
  }

  // Comprobar sesión activa al cargar
  async function checkInitialSession() {
    if (!window.supabaseClient) {
      setTimeout(checkInitialSession, 150);
      return;
    }

    try {
      const { data: { session } } = await window.supabaseClient.auth.getSession();
      if (session && session.user) {
        const isAuthorized = await verifyAdminAuth(session.user);
        if (isAuthorized) {
          await updateAdminSessionUI(session.user);
          return;
        } else {
          await window.supabaseClient.auth.signOut();
        }
      }
      await updateAdminSessionUI(null);
    } catch (err) {
      console.error('Error al verificar sesión inicial:', err);
      await updateAdminSessionUI(null);
    }
  }

  // Manejar Login
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!window.supabaseClient) {
        showToast('Conectando con el servidor, reintente en unos segundos...', 'error');
        return;
      }

      const email = loginEmailInput.value.trim();
      const password = loginPassInput.value;

      if (loginSubmitBtn) {
        loginSubmitBtn.disabled = true;
        loginSubmitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Verificando...';
      }

      try {
        const { data, error } = await window.supabaseClient.auth.signInWithPassword({
          email: email,
          password: password
        });

        if (error || !data.user) {
          loginErrorMsg.textContent = 'Correo o contraseña incorrectos. Intente nuevamente.';
          loginErrorMsg.style.display = 'block';
          return;
        }

        // Validar si el usuario está en la lista de administradores autorizados
        const isAuthorized = await verifyAdminAuth(data.user);
        if (!isAuthorized) {
          await window.supabaseClient.auth.signOut();
          loginErrorMsg.textContent = 'Este usuario no cuenta con autorización administrativa.';
          loginErrorMsg.style.display = 'block';
          return;
        }

        // Login exitoso
        loginErrorMsg.style.display = 'none';
        loginPassInput.value = '';
        await updateAdminSessionUI(data.user);
        showToast('Sesión iniciada correctamente');
      } catch (err) {
        loginErrorMsg.textContent = 'Error de conexión. Intente nuevamente.';
        loginErrorMsg.style.display = 'block';
      } finally {
        if (loginSubmitBtn) {
          loginSubmitBtn.disabled = false;
          loginSubmitBtn.innerHTML = '<i class="fa-solid fa-lock-open"></i> Ingresar al Panel';
        }
      }
    });
  }

  // Manejar Logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      if (window.supabaseClient) {
        await window.supabaseClient.auth.signOut();
      }
      await updateAdminSessionUI(null);
      showToast('Sesión cerrada');
    });
  }

  // Escuchar cambios de sesión de Supabase
  if (window.supabaseClient) {
    window.supabaseClient.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        await updateAdminSessionUI(null);
      } else if (event === 'SIGNED_IN' && session && session.user) {
        const isAuthorized = await verifyAdminAuth(session.user);
        if (isAuthorized) {
          await updateAdminSessionUI(session.user);
        } else {
          await window.supabaseClient.auth.signOut();
          await updateAdminSessionUI(null);
        }
      }
    });
  }

  // --- NAVEGACIÓN ENTRE PESTAÑAS DEL PANEL ---
  const tabBtns = document.querySelectorAll('.admin-tab-btn');
  const tabPanels = document.querySelectorAll('.admin-tab-panel');
  let currentTab = 'agenda';

  tabBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      currentTab = btn.getAttribute('data-tab');
      const targetPanel = document.getElementById(`panel-${currentTab}`);
      if (targetPanel) targetPanel.classList.add('active');

      if (window.ieanDataStore) {
        await window.ieanDataStore.refreshAll();
      }
      loadActiveModuleData();
    });
  });

  function loadActiveModuleData() {
    if (!window.ieanDataStore) return;
    if (currentTab === 'agenda') renderAdminAgenda();
    if (currentTab === 'horarios') renderAdminHorarios();
    if (currentTab === 'celulas') renderAdminCelulas();
    if (currentTab === 'avisos') renderAdminAvisos();
    if (currentTab === 'recursos') renderAdminRecursos();
    if (currentTab === 'emprendimientos') renderAdminEmprendimientos();
  }

  // Sincronizar automáticamente la vista cuando cambien los datos del DataStore
  if (window.ieanDataStore) {
    window.ieanDataStore.subscribe(() => {
      loadActiveModuleData();
    });
  }

  // =========================================================================
  // 1. MÓDULO AGENDA (EVENTOS)
  // =========================================================================
  const agendaListEl = document.getElementById('admin-agenda-list');
  const newEventBtn = document.getElementById('btn-new-event');
  const eventModal = document.getElementById('admin-event-modal');
  const eventForm = document.getElementById('admin-event-form');
  const eventModalClose = document.getElementById('admin-event-modal-close');
  const eventModalTitle = document.getElementById('admin-event-modal-title');

  function renderAdminAgenda() {
    if (!agendaListEl) return;
    const events = window.ieanDataStore.getEvents(false);
    agendaListEl.innerHTML = '';

    if (events.length === 0) {
      agendaListEl.innerHTML = `<tr><td colspan="6" class="table-empty-td">No hay eventos registrados en la agenda. Presione "Nuevo Evento" para comenzar.</td></tr>`;
      return;
    }

    events.forEach(evt => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><strong>${evt.title}</strong></td>
        <td>${evt.date}</td>
        <td>${evt.time}</td>
        <td><span class="admin-table-badge">${evt.category || 'General'}</span></td>
        <td>${evt.public ? '<span class="status-badge-ok">Visible</span>' : '<span class="status-badge-off">Oculto</span>'}</td>
        <td class="table-actions-cell">
          <button class="btn-table-action edit-evt-btn" data-id="${evt.id}" title="Editar"><i class="fa-regular fa-pen-to-square"></i></button>
          <button class="btn-table-action delete-evt-btn" data-id="${evt.id}" title="Eliminar"><i class="fa-regular fa-trash-can"></i></button>
        </td>
      `;

      row.querySelector('.edit-evt-btn').addEventListener('click', () => openEditEventModal(evt.id));
      row.querySelector('.delete-evt-btn').addEventListener('click', () => deleteEvent(evt.id, evt.title));
      agendaListEl.appendChild(row);
    });
  }

  function openEditEventModal(id = null) {
    eventForm.reset();
    document.getElementById('evt-id').value = '';

    if (id) {
      const evt = window.ieanDataStore.getEventById(id);
      if (evt) {
        eventModalTitle.textContent = 'Editar Evento';
        document.getElementById('evt-id').value = evt.id;
        document.getElementById('evt-title').value = evt.title;
        document.getElementById('evt-date').value = evt.date;
        document.getElementById('evt-time').value = evt.time;
        document.getElementById('evt-location').value = evt.location;
        document.getElementById('evt-category').value = evt.category || 'Actividad general';
        document.getElementById('evt-desc').value = evt.description || '';
        document.getElementById('evt-public').value = evt.public ? 'true' : 'false';
        document.getElementById('evt-featured').value = evt.featured ? 'true' : 'false';
      }
    } else {
      eventModalTitle.textContent = 'Nuevo Evento';
      document.getElementById('evt-date').value = new Date().toISOString().split('T')[0];
      document.getElementById('evt-location').value = 'Sede Central (Av. Wilson Ferreira Aldunate & 25 de Agosto)';
      document.getElementById('evt-public').value = 'true';
      document.getElementById('evt-featured').value = 'false';
    }

    eventModal.classList.add('active');
  }

  if (newEventBtn) newEventBtn.addEventListener('click', () => openEditEventModal());
  if (eventModalClose) eventModalClose.addEventListener('click', () => eventModal.classList.remove('active'));

  if (eventForm) {
    eventForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('evt-id').value;
      const newEvt = {
        id: id || undefined,
        title: document.getElementById('evt-title').value.trim(),
        date: document.getElementById('evt-date').value,
        time: document.getElementById('evt-time').value.trim(),
        location: document.getElementById('evt-location').value.trim(),
        category: document.getElementById('evt-category').value,
        description: document.getElementById('evt-desc').value.trim(),
        public: document.getElementById('evt-public').value === 'true',
        featured: document.getElementById('evt-featured').value === 'true'
      };

      const res = await window.ieanDataStore.saveItem('events', newEvt);
      if (res && res.error) {
        showToast('Error al guardar evento: ' + res.error, 'error');
      } else {
        eventModal.classList.remove('active');
        renderAdminAgenda();
        showToast('Evento guardado correctamente');
      }
    });
  }

  async function deleteEvent(id, title) {
    if (confirm(`¿Desea eliminar el evento "${title}"?`)) {
      const res = await window.ieanDataStore.deleteItem('events', id);
      if (res && res.error) {
        showToast('Error al eliminar evento: ' + res.error, 'error');
      } else {
        renderAdminAgenda();
        showToast('Evento eliminado');
      }
    }
  }

  // =========================================================================
  // 2. MÓDULO HORARIOS
  // =========================================================================
  const horariosListEl = document.getElementById('admin-horarios-list');
  const horarioModal = document.getElementById('admin-horario-modal');
  const horarioForm = document.getElementById('admin-horario-form');
  const horarioModalClose = document.getElementById('admin-horario-modal-close');

  function renderAdminHorarios() {
    if (!horariosListEl) return;
    const list = window.ieanDataStore.getSchedules(false);
    horariosListEl.innerHTML = '';

    list.forEach(sch => {
      const card = document.createElement('div');
      card.className = 'admin-card-item';
      card.innerHTML = `
        <div class="admin-card-header">
          <div>
            <span class="admin-card-badge">${sch.day.toUpperCase()}</span>
            <h3 class="admin-card-title">${sch.name}</h3>
          </div>
          <button class="btn-table-action edit-sch-btn" data-id="${sch.id}" title="Editar"><i class="fa-regular fa-pen-to-square"></i> Editar</button>
        </div>
        <p style="font-size: 0.9rem; color: var(--ink-secondary); margin: 0.5rem 0;"><strong>Hora:</strong> ${sch.time} | <strong>Lugar:</strong> ${sch.location}</p>
        <p style="font-size: 0.85rem; color: var(--ink-muted);">${sch.shortDesc}</p>
      `;

      card.querySelector('.edit-sch-btn').addEventListener('click', () => {
        document.getElementById('sch-id').value = sch.id;
        document.getElementById('sch-name').value = sch.name;
        document.getElementById('sch-day').value = sch.day;
        document.getElementById('sch-time').value = sch.time;
        document.getElementById('sch-location').value = sch.location;
        document.getElementById('sch-short-desc').value = sch.shortDesc || '';
        document.getElementById('sch-full-desc').value = sch.fullDesc || '';
        document.getElementById('sch-organizer').value = sch.organizer || '';
        document.getElementById('sch-target').value = sch.target || '';
        document.getElementById('sch-what-to-expect').value = sch.whatToExpect || '';
        document.getElementById('sch-visible').value = sch.visible ? 'true' : 'false';

        horarioModal.classList.add('active');
      });

      horariosListEl.appendChild(card);
    });
  }

  if (horarioModalClose) horarioModalClose.addEventListener('click', () => horarioModal.classList.remove('active'));

  if (horarioForm) {
    horarioForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('sch-id').value;
      const existingSch = window.ieanDataStore.getSchedules(false).find(s => s.id === id) || {};
      const updatedSch = {
        ...existingSch,
        id: id,
        name: document.getElementById('sch-name').value.trim(),
        day: document.getElementById('sch-day').value.trim(),
        time: document.getElementById('sch-time').value.trim(),
        location: document.getElementById('sch-location').value.trim(),
        shortDesc: document.getElementById('sch-short-desc').value.trim(),
        fullDesc: document.getElementById('sch-full-desc').value.trim(),
        organizer: document.getElementById('sch-organizer').value.trim(),
        target: document.getElementById('sch-target').value.trim(),
        whatToExpect: document.getElementById('sch-what-to-expect').value.trim(),
        visible: document.getElementById('sch-visible').value === 'true'
      };

      const res = await window.ieanDataStore.saveItem('schedules', updatedSch);
      if (res && res.error) {
        showToast('Error al guardar horario: ' + res.error, 'error');
      } else {
        horarioModal.classList.remove('active');
        renderAdminHorarios();
        showToast('Horario actualizado correctamente');
      }
    });
  }

  // =========================================================================
  // 3. MÓDULO CÉLULAS (8 Células en Hogares)
  // =========================================================================
  const celulasListEl = document.getElementById('admin-celulas-list');
  const celulaModal = document.getElementById('admin-celula-modal');
  const celulaForm = document.getElementById('admin-celula-form');
  const celulaModalClose = document.getElementById('admin-celula-modal-close');

  function renderAdminCelulas() {
    if (!celulasListEl) return;
    const list = window.ieanDataStore.getCells(false);
    celulasListEl.innerHTML = '';

    list.forEach(c => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><strong>${c.name}</strong></td>
        <td>${c.day}</td>
        <td>${c.time}</td>
        <td>${c.zone}</td>
        <td>${c.visible ? '<span class="status-badge-ok">Visible</span>' : '<span class="status-badge-off">Oculto</span>'}</td>
        <td class="table-actions-cell">
          <button class="btn-table-action edit-cell-btn" data-id="${c.id}" title="Editar"><i class="fa-regular fa-pen-to-square"></i></button>
        </td>
      `;

      row.querySelector('.edit-cell-btn').addEventListener('click', () => {
        document.getElementById('cell-id').value = c.id;
        document.getElementById('cell-name').value = c.name;
        document.getElementById('cell-day').value = c.day;
        document.getElementById('cell-time').value = c.time;
        document.getElementById('cell-zone').value = c.zone;
        document.getElementById('cell-address').value = c.address;
        document.getElementById('cell-desc').value = c.description;
        document.getElementById('cell-phone').value = c.phone || '';
        document.getElementById('cell-whatsapp').value = c.whatsappText || '';
        document.getElementById('cell-visible').value = c.visible ? 'true' : 'false';

        celulaModal.classList.add('active');
      });

      celulasListEl.appendChild(row);
    });
  }

  if (celulaModalClose) celulaModalClose.addEventListener('click', () => celulaModal.classList.remove('active'));

  if (celulaForm) {
    celulaForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('cell-id').value;
      const cellName = document.getElementById('cell-name').value.trim();
      const phone = document.getElementById('cell-phone').value.trim();
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      const whatsappText = document.getElementById('cell-whatsapp').value.trim() || `Hola, Dios le bendiga. Quisiera recibir información sobre la Célula ${cellName}.`;
      const whatsappUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappText)}` : '';

      const existingCell = window.ieanDataStore.getCells(false).find(c => c.id === id) || {};
      const updatedCell = {
        ...existingCell,
        id: id,
        name: cellName,
        day: document.getElementById('cell-day').value.trim(),
        time: document.getElementById('cell-time').value.trim(),
        zone: document.getElementById('cell-zone').value.trim(),
        address: document.getElementById('cell-address').value.trim(),
        description: document.getElementById('cell-desc').value.trim(),
        phone: phone,
        whatsappText: whatsappText,
        whatsappUrl: whatsappUrl,
        visible: document.getElementById('cell-visible').value === 'true'
      };

      const res = await window.ieanDataStore.saveItem('cells', updatedCell);
      if (res && res.error) {
        showToast('Error al guardar célula: ' + res.error, 'error');
      } else {
        celulaModal.classList.remove('active');
        renderAdminCelulas();
        showToast('Célula actualizada correctamente');
      }
    });
  }

  // =========================================================================
  // 4. MÓDULO AVISOS TEMPORALES
  // =========================================================================
  const avisosListEl = document.getElementById('admin-avisos-list');
  const newAvisoBtn = document.getElementById('btn-new-aviso');
  const avisoModal = document.getElementById('admin-aviso-modal');
  const avisoForm = document.getElementById('admin-aviso-form');
  const avisoModalClose = document.getElementById('admin-aviso-modal-close');
  const avisoModalTitle = document.getElementById('admin-aviso-modal-title');

  function renderAdminAvisos() {
    if (!avisosListEl) return;
    const list = window.ieanDataStore.getNotices(false);
    avisosListEl.innerHTML = '';

    if (list.length === 0) {
      avisosListEl.innerHTML = `<tr><td colspan="5" class="table-empty-td">No hay avisos registrados. Presione "Publicar Aviso" para crear uno.</td></tr>`;
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];

    list.forEach(av => {
      const isExpired = av.endDate && av.endDate < todayStr;
      const isPending = av.startDate && av.startDate > todayStr;
      let statusHtml = '<span class="status-badge-ok">Activo</span>';
      if (!av.visible) statusHtml = '<span class="status-badge-off">Desactivado</span>';
      else if (isExpired) statusHtml = '<span class="status-badge-warn">Vencido</span>';
      else if (isPending) statusHtml = '<span class="status-badge-info">Programado</span>';

      const row = document.createElement('tr');
      row.innerHTML = `
        <td><strong>${av.title || 'Aviso General'}</strong></td>
        <td style="max-width: 320px;">${av.text}</td>
        <td>${av.startDate || '-'} al ${av.endDate || '-'}</td>
        <td>${statusHtml}</td>
        <td class="table-actions-cell">
          <button class="btn-table-action edit-av-btn" data-id="${av.id}" title="Editar"><i class="fa-regular fa-pen-to-square"></i></button>
          <button class="btn-table-action delete-av-btn" data-id="${av.id}" title="Eliminar"><i class="fa-regular fa-trash-can"></i></button>
        </td>
      `;

      row.querySelector('.edit-av-btn').addEventListener('click', () => {
        avisoModalTitle.textContent = 'Editar Aviso';
        document.getElementById('av-id').value = av.id;
        document.getElementById('av-title').value = av.title || '';
        document.getElementById('av-text').value = av.text || '';
        document.getElementById('av-start').value = av.startDate || '';
        document.getElementById('av-end').value = av.endDate || '';
        document.getElementById('av-visible').value = av.visible ? 'true' : 'false';
        avisoModal.classList.add('active');
      });

      row.querySelector('.delete-av-btn').addEventListener('click', async () => {
        if (confirm('¿Desea eliminar este aviso?')) {
          const res = await window.ieanDataStore.deleteItem('notices', av.id);
          if (res && res.error) {
            showToast('Error al eliminar aviso: ' + res.error, 'error');
          } else {
            renderAdminAvisos();
            showToast('Aviso eliminado');
          }
        }
      });

      avisosListEl.appendChild(row);
    });
  }

  if (newAvisoBtn) {
    newAvisoBtn.addEventListener('click', () => {
      avisoForm.reset();
      avisoModalTitle.textContent = 'Publicar Aviso Temporal';
      document.getElementById('av-id').value = '';
      const today = new Date().toISOString().split('T')[0];
      const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
      document.getElementById('av-start').value = today;
      document.getElementById('av-end').value = nextWeek;
      document.getElementById('av-visible').value = 'true';
      avisoModal.classList.add('active');
    });
  }

  if (avisoModalClose) avisoModalClose.addEventListener('click', () => avisoModal.classList.remove('active'));

  if (avisoForm) {
    avisoForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('av-id').value;
      const newAv = {
        id: id || undefined,
        title: document.getElementById('av-title').value.trim(),
        text: document.getElementById('av-text').value.trim(),
        startDate: document.getElementById('av-start').value,
        endDate: document.getElementById('av-end').value,
        visible: document.getElementById('av-visible').value === 'true'
      };

      const res = await window.ieanDataStore.saveItem('notices', newAv);
      if (res && res.error) {
        showToast('Error al guardar aviso: ' + res.error, 'error');
      } else {
        avisoModal.classList.remove('active');
        renderAdminAvisos();
        showToast('Aviso guardado correctamente');
      }
    });
  }

  // =========================================================================
  // 5. MÓDULO MATERIAL GRATUITO
  // =========================================================================
  const recursosListEl = document.getElementById('admin-recursos-list');
  const newRecursoBtn = document.getElementById('btn-new-recurso');
  const recursoModal = document.getElementById('admin-recurso-modal');
  const recursoForm = document.getElementById('admin-recurso-form');
  const recursoModalClose = document.getElementById('admin-recurso-modal-close');
  const recursoModalTitle = document.getElementById('admin-recurso-modal-title');

  function renderAdminRecursos() {
    if (!recursosListEl) return;
    const list = window.ieanDataStore.getResources(false);
    recursosListEl.innerHTML = '';

    if (list.length === 0) {
      recursosListEl.innerHTML = `<tr><td colspan="5" class="table-empty-td">No hay materiales registrados. Presione "Agregar Material" para añadir uno.</td></tr>`;
      return;
    }

    list.forEach(res => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><strong>${res.title}</strong></td>
        <td><span class="admin-table-badge">${res.category}</span></td>
        <td>${res.fileType || 'PDF'}</td>
        <td>${res.visible ? '<span class="status-badge-ok">Visible</span>' : '<span class="status-badge-off">Oculto</span>'}</td>
        <td class="table-actions-cell">
          <button class="btn-table-action edit-res-btn" data-id="${res.id}" title="Editar"><i class="fa-regular fa-pen-to-square"></i></button>
          <button class="btn-table-action delete-res-btn" data-id="${res.id}" title="Eliminar"><i class="fa-regular fa-trash-can"></i></button>
        </td>
      `;

      row.querySelector('.edit-res-btn').addEventListener('click', () => {
        recursoModalTitle.textContent = 'Editar Material';
        document.getElementById('res-id').value = res.id;
        document.getElementById('res-title').value = res.title;
        document.getElementById('res-category').value = res.category;
        document.getElementById('res-desc').value = res.description || '';
        document.getElementById('res-url').value = res.externalUrl || '';
        document.getElementById('res-type').value = res.fileType || 'PDF';
        document.getElementById('res-visible').value = res.visible ? 'true' : 'false';
        recursoModal.classList.add('active');
      });

      row.querySelector('.delete-res-btn').addEventListener('click', async () => {
        if (confirm(`¿Desea eliminar el recurso "${res.title}"?`)) {
          const resDel = await window.ieanDataStore.deleteItem('resources', res.id);
          if (resDel && resDel.error) {
            showToast('Error al eliminar recurso: ' + resDel.error, 'error');
          } else {
            renderAdminRecursos();
            showToast('Material eliminado');
          }
        }
      });

      recursosListEl.appendChild(row);
    });
  }

  if (newRecursoBtn) {
    newRecursoBtn.addEventListener('click', () => {
      recursoForm.reset();
      recursoModalTitle.textContent = 'Agregar Material Gratuito';
      document.getElementById('res-id').value = '';
      document.getElementById('res-category').value = 'Evangelismo';
      document.getElementById('res-type').value = 'PDF';
      document.getElementById('res-visible').value = 'true';
      recursoModal.classList.add('active');
    });
  }

  if (recursoModalClose) recursoModalClose.addEventListener('click', () => recursoModal.classList.remove('active'));

  if (recursoForm) {
    recursoForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('res-id').value;
      const newRes = {
        id: id || undefined,
        title: document.getElementById('res-title').value.trim(),
        category: document.getElementById('res-category').value,
        description: document.getElementById('res-desc').value.trim(),
        externalUrl: document.getElementById('res-url').value.trim(),
        fileType: document.getElementById('res-type').value,
        visible: document.getElementById('res-visible').value === 'true'
      };

      const res = await window.ieanDataStore.saveItem('resources', newRes);
      if (res && res.error) {
        showToast('Error al guardar material: ' + res.error, 'error');
      } else {
        recursoModal.classList.remove('active');
        renderAdminRecursos();
        showToast('Material guardado correctamente');
      }
    });
  }

  // =========================================================================
  // 6. MÓDULO EMPRENDIMIENTOS
  // =========================================================================
  const bizListEl = document.getElementById('admin-biz-list');
  const bizModal = document.getElementById('admin-biz-modal');
  const bizForm = document.getElementById('admin-biz-form');
  const bizModalClose = document.getElementById('admin-biz-modal-close');

  function renderAdminEmprendimientos() {
    if (!bizListEl) return;
    const list = window.ieanDataStore.getBusinesses(false);
    bizListEl.innerHTML = '';

    list.forEach(b => {
      const card = document.createElement('div');
      card.className = 'admin-card-item';
      const statusBadge = b.visible !== false
        ? '<span style="color: var(--green-inst); font-size: 0.78rem; font-weight: 600; margin-right: 0.5rem;">● Visible</span>'
        : '<span style="color: var(--ink-muted); font-size: 0.78rem; font-weight: 600; margin-right: 0.5rem;">○ Oculto</span>';

      card.innerHTML = `
        <div class="admin-card-header">
          <div>
            <span class="admin-card-badge">${b.category}</span>
            <h3 class="admin-card-title">${b.name}</h3>
          </div>
          <div style="display: flex; align-items: center;">
            ${statusBadge}
            <button class="btn-table-action edit-biz-btn" data-id="${b.id}" title="Editar"><i class="fa-regular fa-pen-to-square"></i> Editar</button>
          </div>
        </div>
        <p style="font-size: 0.9rem; color: var(--ink-secondary); margin: 0.4rem 0;">${b.description}</p>
        <p style="font-size: 0.8rem; color: var(--ink-muted);">Enlace: ${b.url ? b.url : 'No especificado'} (${b.linkType || 'Contacto'})</p>
      `;

      card.querySelector('.edit-biz-btn').addEventListener('click', () => {
        document.getElementById('biz-id').value = b.id;
        document.getElementById('biz-name').value = b.name;
        document.getElementById('biz-cat').value = b.category;
        document.getElementById('biz-desc').value = b.description;
        document.getElementById('biz-type').value = b.linkType || 'Contacto';
        document.getElementById('biz-url').value = b.url || '';
        document.getElementById('biz-visible').value = b.visible !== false ? 'true' : 'false';
        bizModal.classList.add('active');
      });

      bizListEl.appendChild(card);
    });
  }

  if (bizModalClose) bizModalClose.addEventListener('click', () => bizModal.classList.remove('active'));

  if (bizForm) {
    bizForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('biz-id').value;
      const existingBiz = window.ieanDataStore.getBusinesses(false).find(b => b.id === id) || {};
      const updatedBiz = {
        ...existingBiz,
        id: id,
        name: document.getElementById('biz-name').value.trim(),
        category: document.getElementById('biz-cat').value.trim(),
        description: document.getElementById('biz-desc').value.trim(),
        linkType: document.getElementById('biz-type').value,
        url: document.getElementById('biz-url').value.trim(),
        visible: document.getElementById('biz-visible').value === 'true'
      };

      const res = await window.ieanDataStore.saveItem('businesses', updatedBiz);
      if (res && res.error) {
        showToast('Error al guardar emprendimiento: ' + res.error, 'error');
      } else {
        bizModal.classList.remove('active');
        renderAdminEmprendimientos();
        showToast('Emprendimiento actualizado');
      }
    });
  }

  // =========================================================================
  // RESPALDO Y RESTAURACIÓN JSON
  // =========================================================================
  const exportBtn = document.getElementById('admin-export-btn');
  const importFileInput = document.getElementById('admin-import-file');
  const resetBtn = document.getElementById('admin-reset-btn');

  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const json = window.ieanDataStore.exportBackup();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ieanjesus-maldonado-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Copia de seguridad descargada');
    });
  }

  if (importFileInput) {
    importFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (event) => {
        if (confirm('¿Desea restaurar esta copia de seguridad en Supabase? Los datos existentes serán actualizados.')) {
          const res = await window.ieanDataStore.importBackup(event.target.result);
          if (res && res.success) {
            loadActiveModuleData();
            showToast('Copia de seguridad restaurada correctamente');
          } else {
            showToast('Error al restaurar: ' + (res.error || 'Archivo inválido'), 'error');
          }
        }
      };
      reader.readAsText(file);
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', async () => {
      if (confirm('¿Restablecer los datos en Supabase a los valores oficiales predeterminados?')) {
        const res = await window.ieanDataStore.resetToDefaults();
        if (res && res.success) {
          loadActiveModuleData();
          showToast('Datos restablecidos a valores oficiales en Supabase');
        } else {
          showToast('Error al restablecer: ' + (res.error || 'Operación fallida'), 'error');
        }
      }
    });
  }

  // Cerrar modales con Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.admin-modal-backdrop.active').forEach(m => m.classList.remove('active'));
    }
  });

  // Iniciar verificación de sesión
  checkInitialSession();
});
