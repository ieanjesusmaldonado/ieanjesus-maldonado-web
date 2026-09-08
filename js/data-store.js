/**
 * =============================================================================
 * IEANJESÚS Maldonado - Capa Central de Datos (DataStore con Supabase)
 * =============================================================================
 * Administra entidades: Horarios, Células, Agenda (Eventos), Avisos, Material Gratuito y Emprendimientos.
 * Conexión directa a PostgreSQL vía Supabase con soporte Realtime y caché local en memoria.
 * Mantiene la interfaz de lectura sincrónica para máxima velocidad y sin parpadeos visuales.
 * =============================================================================
 */

// Metadatos de contingencia (únicamente catálogo multimedia estático)
const DEFAULT_DATA = {
  notices: [],
  schedules: [],
  cells: [],
  events: [],
  resources: [],
  businesses: [],

  // Repertorio Fotográfico Oficial
  galleryPhotos: [
    {
      id: 'feria1',
      filename: 'feria1.jpg',
      src: 'assets/images/feria1.jpg',
      category: 'evangelismo',
      title: 'Evangelismo en la Feria',
      alt: 'Actividad de evangelismo y distribución de literatura bíblica en la feria de Maldonado',
      orientation: 'landscape',
      showInGeneral: true
    },
    {
      id: 'feria2',
      filename: 'feria2.jpg',
      src: 'assets/images/feria2.jpg',
      category: 'evangelismo',
      title: 'Evangelismo en la Feria',
      alt: 'Miembros de la iglesia compartiendo el mensaje de fe en la feria dominical',
      orientation: 'landscape',
      showInGeneral: true
    },
    {
      id: 'feria3',
      filename: 'feria3.jpg',
      src: 'assets/images/feria3.jpg',
      category: 'evangelismo',
      title: 'Evangelismo en la Feria',
      alt: 'Diálogo testimonial y entrega de folletos del Plan Cornelio en la feria',
      orientation: 'landscape',
      showInGeneral: true
    },
    {
      id: 'feria4',
      filename: 'feria4.jpg',
      src: 'assets/images/feria4.jpg',
      category: 'evangelismo',
      title: 'Evangelismo en la Feria',
      alt: 'Oración y testimonio cristiano en las calles de Maldonado',
      orientation: 'landscape',
      showInGeneral: true
    },
    {
      id: 'feria5',
      filename: 'feria5.jpg',
      src: 'assets/images/feria5.jpg',
      category: 'evangelismo',
      title: 'Evangelismo en la Feria',
      alt: 'Equipo de evangelismo compartiendo la Palabra de Dios',
      orientation: 'landscape',
      showInGeneral: true
    },
    {
      id: 'feria6',
      filename: 'feria6.jpg',
      src: 'assets/images/feria6.jpg',
      category: 'evangelismo',
      title: 'Evangelismo en la Feria',
      alt: 'Momento de evangelismo y proclamación del evangelio',
      orientation: 'landscape',
      showInGeneral: true
    },
    {
      id: 'feria7',
      filename: 'feria7.jpg',
      src: 'assets/images/feria7.jpg',
      category: 'evangelismo',
      title: 'Evangelismo en la Feria',
      alt: 'Hermanos de la congregación sirviendo en la feria local',
      orientation: 'landscape',
      showInGeneral: true
    },
    {
      id: 'dominical1',
      filename: 'dominical1.jpg',
      src: 'assets/images/dominical1.jpg',
      category: 'dominical',
      title: 'Gran Celebración Dominical',
      alt: 'Alabanza congregacional y adoración en la Gran Celebración de domingo',
      orientation: 'landscape',
      showInGeneral: true
    },
    {
      id: 'dominical2',
      filename: 'dominical2.jpg',
      src: 'assets/images/dominical2.jpg',
      category: 'dominical',
      title: 'Gran Celebración Dominical',
      alt: 'Vista panorámica de la congregación durante el culto dominical de alabanza y adoración',
      orientation: 'panoramic',
      showInGeneral: true
    },
    {
      id: 'dominical3',
      filename: 'dominical3.jpg',
      src: 'assets/images/dominical3.jpg',
      category: 'dominical',
      title: 'Gran Celebración Dominical',
      alt: 'Momento de oración y comunión espiritual en la Gran Celebración de domingo',
      orientation: 'standard',
      showInGeneral: true
    },
    {
      id: 'dominical4',
      filename: 'dominical4.jpg',
      src: 'assets/images/dominical4.jpg',
      category: 'dominical',
      title: 'Gran Celebración Dominical',
      alt: 'Congregación reunida participando en la alabanza y la predicación bíblica',
      orientation: 'standard',
      showInGeneral: true
    },
    {
      id: 'dominical5',
      filename: 'dominical5.jpg',
      src: 'assets/images/dominical5.jpg',
      category: 'dominical',
      title: 'Gran Celebración Dominical',
      alt: 'Tiempo de adoración congregacional en la sede central',
      orientation: 'standard',
      showInGeneral: true
    },
    {
      id: 'dominical6',
      filename: 'dominical6.jpg',
      src: 'assets/images/dominical6.jpg',
      category: 'dominical',
      title: 'Gran Celebración Dominical',
      alt: 'Comunidad congregada alabando a Dios en la reunión dominical',
      orientation: 'landscape',
      showInGeneral: true
    },
    {
      id: 'varios1',
      filename: 'varios1.jpg',
      src: 'assets/images/varios1.jpg',
      category: 'general',
      title: 'Vida de la Iglesia',
      alt: 'Comunión fraternal y actividades de la congregación de IEANJESÚS Maldonado',
      orientation: 'landscape',
      showInGeneral: true
    },
    {
      id: 'varios2',
      filename: 'varios2.jpg',
      src: 'assets/images/varios2.jpg',
      category: 'general',
      title: 'Vida de la Iglesia',
      alt: 'Encuentros y momentos especiales de la congregación',
      orientation: 'landscape',
      showInGeneral: true
    },
    {
      id: 'varios3',
      filename: 'varios3.jpg',
      src: 'assets/images/varios3.jpg',
      category: 'general',
      title: 'Vida de la Iglesia',
      alt: 'Reuniones de edificación y comunión espiritual',
      orientation: 'landscape',
      showInGeneral: true
    },
    {
      id: 'varios4',
      filename: 'varios4.jpg',
      src: 'assets/images/varios4.jpg',
      category: 'general',
      title: 'Vida de la Iglesia',
      alt: 'Actividades comunitarias y servicio cristiano',
      orientation: 'landscape',
      showInGeneral: true
    },
    {
      id: 'varios5',
      filename: 'varios5.jpg',
      src: 'assets/images/varios5.jpg',
      category: 'general',
      title: 'Vida de la Iglesia',
      alt: 'Testimonio de fe y vida congregacional en Maldonado',
      orientation: 'landscape',
      showInGeneral: true
    },
    {
      id: 'varios6',
      filename: 'varios6.jpg',
      src: 'assets/images/varios6.jpg',
      category: 'general',
      title: 'Vida de la Iglesia',
      alt: 'Compañerismo y crecimiento espiritual en la iglesia',
      orientation: 'landscape',
      showInGeneral: true
    },
    {
      id: 'varios7',
      filename: 'varios7.jpg',
      src: 'assets/images/varios7.jpg',
      category: 'general',
      title: 'Vida de la Iglesia',
      alt: 'Encuentro de la familia de fe en IEANJESÚS Maldonado',
      orientation: 'landscape',
      showInGeneral: true
    }
  ]
};

class DataStore {
  constructor() {
    this.data = {
      notices: [],
      schedules: [],
      cells: [],
      events: [],
      resources: [],
      businesses: [],
      galleryPhotos: [...(DEFAULT_DATA.galleryPhotos || [])]
    };
    this.listeners = [];
    this.isInitialized = false;

    // Iniciar carga asíncrona desde Supabase en cuanto el cliente esté listo
    this.initPromise = this.initSupabase();
  }

  // --- MAPEOS DE BASE DE DATOS (CamelCase <-> SnakeCase) ---
  fromDb(collection, row) {
    if (!row) return null;
    switch (collection) {
      case 'notices':
        return {
          id: row.id,
          title: row.title,
          text: row.text,
          startDate: row.start_date,
          endDate: row.end_date,
          visible: row.visible
        };
      case 'schedules':
        return {
          id: row.id,
          name: row.name,
          day: row.day,
          time: row.time,
          location: row.location,
          type: row.type || 'templo',
          shortDesc: row.short_desc,
          fullDesc: row.full_desc,
          organizer: row.organizer,
          target: row.target,
          whatToExpect: row.what_to_expect,
          displayOrder: row.display_order || 0,
          visible: row.visible
        };
      case 'cells':
        return {
          id: row.id,
          name: row.name,
          day: row.day,
          time: row.time,
          zone: row.zone,
          address: row.address,
          description: row.description,
          image: row.image,
          phone: row.phone,
          whatsappText: row.whatsapp_text,
          whatsappUrl: row.whatsapp_url,
          displayOrder: row.display_order || 0,
          visible: row.visible
        };
      case 'events':
        return {
          id: row.id,
          title: row.title,
          date: row.date,
          time: row.time,
          location: row.location,
          category: row.category,
          description: row.description,
          public: row.public,
          featured: row.featured
        };
      case 'resources':
        return {
          id: row.id,
          title: row.title,
          category: row.category,
          description: row.description,
          fileType: row.file_type,
          externalUrl: row.external_url,
          displayOrder: row.display_order || 0,
          visible: row.visible
        };
      case 'businesses':
        return {
          id: row.id,
          name: row.name,
          category: row.category,
          description: row.description,
          linkType: row.link_type,
          phone: row.phone,
          url: row.url,
          whatsappUrl: row.whatsapp_url,
          logoText: row.logo_text,
          logo: row.logo,
          displayOrder: row.display_order || 0,
          visible: row.visible
        };
      default:
        return row;
    }
  }

  toDb(collection, item) {
    if (!item) return null;
    switch (collection) {
      case 'notices':
        return {
          id: item.id,
          title: item.title,
          text: item.text,
          start_date: item.startDate,
          end_date: item.endDate,
          visible: item.visible !== false
        };
      case 'schedules':
        return {
          id: item.id,
          name: item.name,
          day: item.day,
          time: item.time,
          location: item.location,
          type: item.type || 'templo',
          short_desc: item.shortDesc,
          full_desc: item.fullDesc,
          organizer: item.organizer,
          target: item.target,
          what_to_expect: item.whatToExpect,
          display_order: item.displayOrder || 0,
          visible: item.visible !== false
        };
      case 'cells':
        return {
          id: item.id,
          name: item.name,
          day: item.day,
          time: item.time,
          zone: item.zone,
          address: item.address,
          description: item.description,
          image: item.image,
          phone: item.phone,
          whatsapp_text: item.whatsappText,
          whatsapp_url: item.whatsappUrl,
          display_order: item.displayOrder || 0,
          visible: item.visible !== false
        };
      case 'events':
        return {
          id: item.id,
          title: item.title,
          date: item.date,
          time: item.time,
          location: item.location,
          category: item.category || 'Actividad',
          description: item.description,
          public: item.public !== false,
          featured: item.featured === true
        };
      case 'resources':
        return {
          id: item.id,
          title: item.title,
          category: item.category,
          description: item.description,
          file_type: item.fileType || 'PDF',
          external_url: item.externalUrl,
          display_order: item.displayOrder || 0,
          visible: item.visible !== false
        };
      case 'businesses':
        return {
          id: item.id,
          name: item.name,
          category: item.category,
          description: item.description,
          link_type: item.linkType || 'WhatsApp',
          phone: item.phone,
          url: item.url,
          whatsapp_url: item.whatsappUrl,
          logo_text: item.logoText,
          logo: item.logo,
          display_order: item.displayOrder || 0,
          visible: item.visible !== false
        };
      default:
        return item;
    }
  }

  // --- INICIALIZACIÓN Y CARGA DESDE SUPABASE ---
  async initSupabase() {
    if (typeof window.supabaseClient === 'undefined') {
      setTimeout(() => this.initSupabase(), 100);
      return;
    }

    // Escuchar cambios de autenticación para refrescar datos según rol
    try {
      window.supabaseClient.auth.onAuthStateChange(async () => {
        await this.refreshAll();
      });
    } catch (e) {
      // Ignorar si auth no está listo
    }

    try {
      await this.refreshAll();
      this.isInitialized = true;
      this.setupRealtime();
    } catch (err) {
      console.warn('Error en inicialización con Supabase:', err);
    }
  }

  async refreshAll() {
    if (!window.supabaseClient) return { success: false, error: 'Supabase client no disponible' };

    try {
      const [
        noticesRes,
        schedulesRes,
        cellsRes,
        eventsRes,
        resourcesRes,
        businessesRes
      ] = await Promise.all([
        window.supabaseClient.from('notices').select('*'),
        window.supabaseClient.from('schedules').select('*').order('display_order', { ascending: true }),
        window.supabaseClient.from('cells').select('*').order('display_order', { ascending: true }),
        window.supabaseClient.from('events').select('*').order('date', { ascending: true }),
        window.supabaseClient.from('resources').select('*').order('display_order', { ascending: true }),
        window.supabaseClient.from('businesses').select('*').order('display_order', { ascending: true })
      ]);

      if (noticesRes.error) {
        console.error('Error al obtener notices de Supabase:', noticesRes.error);
      } else if (Array.isArray(noticesRes.data)) {
        this.data.notices = noticesRes.data.map(r => this.fromDb('notices', r));
      }

      if (schedulesRes.error) {
        console.error('Error al obtener schedules de Supabase:', schedulesRes.error);
      } else if (Array.isArray(schedulesRes.data)) {
        this.data.schedules = schedulesRes.data.map(r => this.fromDb('schedules', r));
      }

      if (cellsRes.error) {
        console.error('Error al obtener cells de Supabase:', cellsRes.error);
      } else if (Array.isArray(cellsRes.data)) {
        this.data.cells = cellsRes.data.map(r => this.fromDb('cells', r));
      }

      if (eventsRes.error) {
        console.error('Error al obtener events de Supabase:', eventsRes.error);
      } else if (Array.isArray(eventsRes.data)) {
        this.data.events = eventsRes.data.map(r => this.fromDb('events', r));
      }

      if (resourcesRes.error) {
        console.error('Error al obtener resources de Supabase:', resourcesRes.error);
      } else if (Array.isArray(resourcesRes.data)) {
        this.data.resources = resourcesRes.data.map(r => this.fromDb('resources', r));
      }

      if (businessesRes.error) {
        console.error('Error al obtener businesses de Supabase:', businessesRes.error);
      } else if (Array.isArray(businessesRes.data)) {
        this.data.businesses = businessesRes.data.map(r => this.fromDb('businesses', r));
      }

      this.isInitialized = true;
      this.notifyListeners();
      return { success: true };
    } catch (err) {
      console.error('Excepción al sincronizar con Supabase:', err);
      return { success: false, error: err.message };
    }
  }

  setupRealtime() {
    if (!window.supabaseClient) return;

    try {
      window.supabaseClient
        .channel('public_data_changes')
        .on('postgres_changes', { event: '*', schema: 'public' }, async () => {
          await this.refreshAll();
        })
        .subscribe();
    } catch (e) {
      console.warn('Suscripción Realtime no disponible:', e);
    }
  }

  subscribe(callback) {
    if (typeof callback === 'function') {
      this.listeners.push(callback);
    }
  }

  notifyListeners() {
    this.listeners.forEach(cb => {
      try {
        cb(this.data);
      } catch (err) {
        console.error('Error en listener de DataStore:', err);
      }
    });
  }

  // --- MÉTODOS DE LECTURA SINCRÓNICA ---
  getNotices(activeOnly = true) {
    const list = this.data.notices || [];
    if (!activeOnly) return list;
    const nowStr = new Date().toISOString().split('T')[0];
    return list.filter(n => {
      if (!n.visible) return false;
      if (n.startDate && n.startDate > nowStr) return false;
      if (n.endDate && n.endDate < nowStr) return false;
      return true;
    });
  }

  getSchedules(publicOnly = true) {
    const list = this.data.schedules || [];
    if (!publicOnly) return list;
    return list.filter(s => s.visible !== false);
  }

  getScheduleById(id) {
    if (!id) return null;
    const list = this.data.schedules || [];
    return list.find(s => s.id === id) || null;
  }

  getCells(publicOnly = true) {
    const list = this.data.cells || [];
    if (!publicOnly) return list;
    return list.filter(c => c.visible !== false);
  }

  getEvents(upcomingOnly = false) {
    let list = [...(this.data.events || [])];
    if (upcomingOnly) {
      const todayStr = new Date().toISOString().split('T')[0];
      list = list.filter(e => e.public && e.date >= todayStr);
    }
    return list.sort((a, b) => (a.date > b.date ? 1 : -1));
  }

  getEventById(id) {
    if (!id) return null;
    const list = this.data.events || [];
    return list.find(e => e.id === id) || null;
  }

  getResources(publicOnly = true, category = 'all') {
    let list = [...(this.data.resources || [])];
    if (publicOnly) {
      list = list.filter(r => r.visible !== false);
    }
    if (category && category !== 'all') {
      list = list.filter(r => r.category && r.category.toLowerCase() === category.toLowerCase());
    }
    return list;
  }

  getBusinesses(publicOnly = true) {
    const list = this.data.businesses || [];
    if (!publicOnly) return list;
    return list.filter(b => b.visible !== false);
  }

  getGalleryPhotos(category = null) {
    const list = (this.data.galleryPhotos && this.data.galleryPhotos.length > 0)
      ? this.data.galleryPhotos
      : (DEFAULT_DATA.galleryPhotos || []);
    if (!category || category === 'all' || category === 'general_all') {
      return list;
    }
    return list.filter(p => p.category === category);
  }

  getPhotoById(id) {
    const list = (this.data.galleryPhotos && this.data.galleryPhotos.length > 0)
      ? this.data.galleryPhotos
      : (DEFAULT_DATA.galleryPhotos || []);
    return list.find(p => p.id === id) || null;
  }

  // --- MÉTODOS DE MUTACIÓN ASINCRÓNICA CON SUPABASE ---
  async saveItem(collectionName, item) {
    if (!window.supabaseClient) {
      return { success: false, error: 'Cliente de Supabase no inicializado.' };
    }

    if (!item.id) {
      item.id = `${collectionName.slice(0, 3)}-${Date.now()}`;
    }

    try {
      const dbRow = this.toDb(collectionName, item);
      const { data, error } = await window.supabaseClient
        .from(collectionName)
        .upsert(dbRow)
        .select();

      if (error) {
        console.error(`Error al guardar en Supabase [${collectionName}]:`, error);
        return { success: false, error: error.message };
      }

      if (!data || data.length === 0) {
        console.warn(`Supabase upsert no afectó ninguna fila [${collectionName}]. Verifica permisos RLS.`);
        return {
          success: false,
          error: 'No se actualizó ningún registro en Supabase. Revisa los permisos de administrador o la sesión.'
        };
      }

      // Sincronizar directamente con el registro devuelto por Supabase
      const savedItem = this.fromDb(collectionName, data[0]);
      if (!this.data[collectionName]) this.data[collectionName] = [];
      const idx = this.data[collectionName].findIndex(i => i.id === savedItem.id);
      if (idx !== -1) {
        this.data[collectionName][idx] = savedItem;
      } else {
        this.data[collectionName].push(savedItem);
      }

      this.notifyListeners();
      return { success: true, data: savedItem };
    } catch (err) {
      console.error(`Excepción al guardar en Supabase [${collectionName}]:`, err);
      return { success: false, error: err.message };
    }
  }

  async deleteItem(collectionName, id) {
    if (!window.supabaseClient) {
      return { success: false, error: 'Cliente de Supabase no inicializado.' };
    }

    try {
      const { data, error } = await window.supabaseClient
        .from(collectionName)
        .delete()
        .eq('id', id)
        .select();

      if (error) {
        console.error(`Error al eliminar de Supabase [${collectionName}]:`, error);
        return { success: false, error: error.message };
      }

      if (!data || data.length === 0) {
        console.warn(`Supabase delete no afectó ninguna fila [${collectionName}] con id ${id}.`);
        return {
          success: false,
          error: 'No se eliminó ningún registro en Supabase. Verifica el ID o los permisos.'
        };
      }

      if (this.data[collectionName]) {
        this.data[collectionName] = this.data[collectionName].filter(i => i.id !== id);
        this.notifyListeners();
      }

      return { success: true };
    } catch (err) {
      console.error(`Excepción al eliminar de Supabase [${collectionName}]:`, err);
      return { success: false, error: err.message };
    }
  }

  async resetToDefaults() {
    if (window.supabaseClient) {
      try {
        const collections = ['notices', 'schedules', 'cells', 'events', 'resources', 'businesses'];
        for (const col of collections) {
          const rows = DEFAULT_DATA[col].map(item => this.toDb(col, item));
          const { error } = await window.supabaseClient.from(col).upsert(rows);
          if (error) throw error;
        }
        await this.refreshAll();
        return { success: true };
      } catch (err) {
        console.error('Error al restablecer valores en Supabase:', err);
        return { success: false, error: err.message };
      }
    }
    this.data = JSON.parse(JSON.stringify(DEFAULT_DATA));
    this.notifyListeners();
    return { success: true };
  }

  exportBackup() {
    return JSON.stringify(this.data, null, 2);
  }

  async importBackup(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || typeof parsed !== 'object') {
        return { success: false, error: 'Formato de JSON inválido.' };
      }

      if (window.supabaseClient) {
        const collections = ['notices', 'schedules', 'cells', 'events', 'resources', 'businesses'];
        for (const col of collections) {
          if (Array.isArray(parsed[col])) {
            const rows = parsed[col].map(item => this.toDb(col, item));
            if (rows.length > 0) {
              const { error } = await window.supabaseClient.from(col).upsert(rows);
              if (error) throw error;
            }
          }
        }
        await this.refreshAll();
        return { success: true };
      }

      this.data = { ...DEFAULT_DATA, ...parsed };
      this.notifyListeners();
      return { success: true };
    } catch (e) {
      console.error('Error importando respaldo:', e);
      return { success: false, error: e.message };
    }
  }
}

// Instancia global del almacén de datos
window.ieanDataStore = new DataStore();
