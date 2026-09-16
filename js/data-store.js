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
  events: [
    {
      id: 'evt-001',
      title: 'Voto Misionero Juvenil',
      date: '2026-09-06',
      time: '18:30 hs',
      location: 'Sede Central IEANJESÚS Maldonado',
      category: 'Jóvenes',
      description: 'Jornada especial de compromiso misionero del Comité de Jóvenes.',
      public: true,
      featured: false,
      includeChurchCalendar: true
    },
    {
      id: 'evt-002',
      title: 'Mes de la Familia #1',
      date: '2026-09-06',
      time: '18:30 hs',
      location: 'Sede Central IEANJESÚS Maldonado',
      category: 'Mes de la Familia',
      description: 'Primera jornada especial del Mes de la Familia.',
      public: true,
      featured: false,
      includeChurchCalendar: true
    },
    {
      id: 'evt-003',
      title: 'Culto dirigido por el Comité de Jóvenes',
      date: '2026-09-06',
      time: '18:30 hs',
      location: 'Sede Central IEANJESÚS Maldonado',
      category: 'Jóvenes',
      description: 'Culto dominical dirigido por el Comité de Jóvenes.',
      public: true,
      featured: false,
      includeChurchCalendar: false
    },
    {
      id: 'evt-004',
      title: 'Pro Misionero - Centro',
      date: '2026-09-09',
      time: '',
      location: 'Zona Centro, Maldonado',
      category: 'Evangelismo & Misiones',
      description: 'Actividad pro misionera en la zona Centro.',
      public: true,
      featured: false,
      includeChurchCalendar: true
    },
    {
      id: 'evt-005',
      title: 'Culto dirigido por el Comité de Damas Dorcas',
      date: '2026-09-10',
      time: '19:30 hs',
      location: 'Sede Central IEANJESÚS Maldonado',
      category: 'Damas Dorcas',
      description: 'Reunión general de la iglesia dirigida por el Comité de Damas Dorcas.',
      public: true,
      featured: false,
      includeChurchCalendar: false
    },
    {
      id: 'evt-006',
      title: 'Culto Misionero - Curva',
      date: '2026-09-12',
      time: '',
      location: 'Zona La Curva, Maldonado',
      category: 'Evangelismo & Misiones',
      description: 'Culto misionero en la zona de la Curva.',
      public: true,
      featured: false,
      includeChurchCalendar: true
    },
    {
      id: 'evt-007',
      title: 'Mes de la Familia #2',
      date: '2026-09-13',
      time: '18:30 hs',
      location: 'Sede Central IEANJESÚS Maldonado',
      category: 'Mes de la Familia',
      description: 'Segunda jornada especial del Mes de la Familia.',
      public: true,
      featured: false,
      includeChurchCalendar: true
    },
    {
      id: 'evt-008',
      title: 'Actividad económica del Comité de Comunicaciones',
      date: '2026-09-13',
      time: '18:30 hs',
      location: 'Sede Central IEANJESÚS Maldonado',
      category: 'Actividad Pro Templo',
      description: 'Actividad económica organizada por el Comité de Comunicaciones.',
      public: true,
      featured: false,
      includeChurchCalendar: true
    },
    {
      id: 'evt-009',
      title: 'Culto dirigido por la Junta Local',
      date: '2026-09-13',
      time: '18:30 hs',
      location: 'Sede Central IEANJESÚS Maldonado',
      category: 'Culto',
      description: 'Culto dominical dirigido por la Junta Local.',
      public: true,
      featured: false,
      includeChurchCalendar: false
    },
    {
      id: 'evt-010',
      title: 'Culto dirigido por el Comité de Damas Dorcas',
      date: '2026-09-17',
      time: '19:30 hs',
      location: 'Sede Central IEANJESÚS Maldonado',
      category: 'Damas Dorcas',
      description: 'Reunión general de la iglesia dirigida por el Comité de Damas Dorcas.',
      public: true,
      featured: false,
      includeChurchCalendar: false
    },
    {
      id: 'evt-011',
      title: 'Pro Misionero - Barrio Norte',
      date: '2026-09-18',
      time: '',
      location: 'Zona Barrio Norte, Maldonado',
      category: 'Evangelismo & Misiones',
      description: 'Actividad pro misionera en Barrio Norte.',
      public: true,
      featured: false,
      includeChurchCalendar: true
    },
    {
      id: 'evt-012',
      title: 'Reunión de Jóvenes',
      date: '2026-09-19',
      time: '',
      location: 'Sede Central IEANJESÚS Maldonado',
      category: 'Jóvenes',
      description: 'Encuentro del Comité de Jóvenes para compartir y crecer en la fe.',
      public: true,
      featured: false,
      includeChurchCalendar: true
    },
    {
      id: 'evt-013',
      title: 'Mes de la Familia #3',
      date: '2026-09-20',
      time: '18:30 hs',
      location: 'Sede Central IEANJESÚS Maldonado',
      category: 'Mes de la Familia',
      description: 'Tercera jornada especial del Mes de la Familia.',
      public: true,
      featured: false,
      includeChurchCalendar: true
    },
    {
      id: 'evt-014',
      title: 'Encuentro de Células',
      date: '2026-09-20',
      time: '18:30 hs',
      location: 'Sede Central IEANJESÚS Maldonado',
      category: 'Células',
      description: 'Encuentro especial de las células de la iglesia.',
      public: true,
      featured: false,
      includeChurchCalendar: true
    },
    {
      id: 'evt-015',
      title: 'Culto dirigido por las Células #7 y #8',
      date: '2026-09-20',
      time: '18:30 hs',
      location: 'Sede Central IEANJESÚS Maldonado',
      category: 'Células',
      description: 'Culto dominical dirigido por las Células #7 y #8.',
      public: true,
      featured: false,
      includeChurchCalendar: false
    },
    {
      id: 'evt-016',
      title: 'No hay Célula',
      date: '2026-09-21 a 2026-09-27',
      time: '',
      location: 'Sede Central IEANJESÚS Maldonado',
      category: 'Células',
      description: 'Durante este período no se realizarán reuniones de Célula.',
      public: true,
      featured: false,
      includeChurchCalendar: false
    },
    {
      id: 'evt-017',
      title: 'Culto dirigido por el Comité de Caballeros',
      date: '2026-09-24',
      time: '19:30 hs',
      location: 'Sede Central IEANJESÚS Maldonado',
      category: 'Caballeros',
      description: 'Reunión general de la iglesia dirigida por el Comité de Caballeros.',
      public: true,
      featured: false,
      includeChurchCalendar: false
    },
    {
      id: 'evt-018',
      title: 'Mes de la Familia #4',
      date: '2026-09-27',
      time: '18:30 hs',
      location: 'Sede Central IEANJESÚS Maldonado',
      category: 'Mes de la Familia',
      description: 'Cuarta jornada especial del Mes de la Familia.',
      public: true,
      featured: false,
      includeChurchCalendar: true
    },
    {
      id: 'evt-019',
      title: 'Culto dirigido por el Comité de Damas Dorcas',
      date: '2026-09-27',
      time: '18:30 hs',
      location: 'Sede Central IEANJESÚS Maldonado',
      category: 'Damas Dorcas',
      description: 'Culto dominical dirigido por el Comité de Damas Dorcas.',
      public: true,
      featured: false,
      includeChurchCalendar: false
    },
    {
      id: 'evt-020',
      title: 'Pro Misionero - Cuñetti',
      date: '2026-09-30',
      time: '',
      location: 'Zona Cuñetti, Maldonado',
      category: 'Evangelismo & Misiones',
      description: 'Actividad pro misionera en la zona Cuñetti.',
      public: true,
      featured: false,
      includeChurchCalendar: true
    },
    {
      id: 'evt-021',
      title: 'Culto dirigido por el Comité de Damas Dorcas',
      date: '2026-10-01',
      time: '19:30 hs',
      location: 'Sede Central IEANJESÚS Maldonado',
      category: 'Damas Dorcas',
      description: 'Reunión general de la iglesia dirigida por el Comité de Damas Dorcas.',
      public: true,
      featured: false,
      includeChurchCalendar: false
    },
    {
      id: 'evt-022',
      title: 'Integración de Damas',
      date: '2026-10-03',
      time: '19:00 hs',
      location: 'Sede Central IEANJESÚS Maldonado',
      category: 'Damas Dorcas',
      description: 'Encuentro de integración del Comité de Damas Dorcas.',
      public: true,
      featured: false,
      includeChurchCalendar: true
    },
    {
      id: 'evt-023',
      title: 'Integración de Caballeros',
      date: '2026-10-03',
      time: '19:00 hs',
      location: 'Sede Central IEANJESÚS Maldonado',
      category: 'Caballeros',
      description: 'Encuentro de integración del Comité de Caballeros.',
      public: true,
      featured: false,
      includeChurchCalendar: true
    },
    {
      id: 'evt-024',
      title: 'Inauguración de nueva obra en La Paz',
      date: '2026-10-03',
      time: '',
      location: 'La Paz, Canelones',
      category: 'Actividad general',
      description: 'Celebración por la inauguración de una nueva obra de IEANJESÚS en La Paz.',
      public: true,
      featured: false,
      includeChurchCalendar: true
    },
    {
      id: 'evt-025',
      title: 'Ayuno Nacional',
      date: '2026-10-04',
      time: '',
      location: 'Sede Central IEANJESÚS Maldonado',
      category: 'Oración y Ayuno',
      description: 'Jornada nacional de ayuno y oración.',
      public: true,
      featured: false,
      includeChurchCalendar: true
    },
    {
      id: 'evt-026',
      title: 'Clausura del Mes de la Familia',
      date: '2026-10-04',
      time: '18:30 hs',
      location: 'Sede Central IEANJESÚS Maldonado',
      category: 'Mes de la Familia',
      description: 'Jornada de cierre del Mes de la Familia.',
      public: true,
      featured: false,
      includeChurchCalendar: true
    },
    {
      id: 'evt-027',
      title: 'Culto dirigido por la Célula #1 - Centro',
      date: '2026-10-04',
      time: '18:30 hs',
      location: 'Sede Central IEANJESÚS Maldonado',
      category: 'Células',
      description: 'Culto dominical dirigido por la Célula #1 - Centro.',
      public: true,
      featured: false,
      includeChurchCalendar: false
    },
    {
      id: 'evt-028',
      title: 'Pro Misionero - Hipódromo',
      date: '2026-10-06',
      time: '',
      location: 'Zona Barrio Hipódromo, Maldonado',
      category: 'Evangelismo & Misiones',
      description: 'Actividad pro misionera en la zona Hipódromo.',
      public: true,
      featured: false,
      includeChurchCalendar: true
    },
    {
      id: 'evt-029',
      title: 'Culto dirigido por el Comité de Damas Dorcas',
      date: '2026-10-08',
      time: '19:30 hs',
      location: 'Sede Central IEANJESÚS Maldonado',
      category: 'Damas Dorcas',
      description: 'Reunión general de la iglesia dirigida por el Comité de Damas Dorcas.',
      public: true,
      featured: false,
      includeChurchCalendar: false
    },
    {
      id: 'evt-030',
      title: 'Convención Brasil',
      date: '2026-10-10',
      time: '',
      location: 'Brasil',
      category: 'Convención',
      description: 'Primera jornada de la Convención Brasil.',
      public: true,
      featured: false,
      includeChurchCalendar: true
    },
    {
      id: 'evt-031',
      title: 'Convención Brasil',
      date: '2026-10-11',
      time: '',
      location: 'Brasil',
      category: 'Convención',
      description: 'Segunda jornada de la Convención Brasil.',
      public: true,
      featured: false,
      includeChurchCalendar: true
    },
    {
      id: 'evt-032',
      title: 'Culto dirigido por el Comité de Comunicaciones',
      date: '2026-10-11',
      time: '18:30 hs',
      location: 'Sede Central IEANJESÚS Maldonado',
      category: 'Culto',
      description: 'Culto dominical dirigido por el Comité de Comunicaciones.',
      public: true,
      featured: false,
      includeChurchCalendar: false
    },
    {
      id: 'evt-033',
      title: 'Culto dirigido por el Comité de Damas Dorcas',
      date: '2026-10-15',
      time: '19:30 hs',
      location: 'Sede Central IEANJESÚS Maldonado',
      category: 'Damas Dorcas',
      description: 'Reunión general de la iglesia dirigida por el Comité de Damas Dorcas.',
      public: true,
      featured: false,
      includeChurchCalendar: false
    },
    {
      id: 'evt-034',
      title: 'Pro Misionero - Cerro',
      date: '2026-10-16',
      time: '',
      location: 'Zona Cerro Pelado, Maldonado',
      category: 'Evangelismo & Misiones',
      description: 'Actividad pro misionera en la zona Cerro.',
      public: true,
      featured: false,
      includeChurchCalendar: true
    },
    {
      id: 'evt-035',
      title: 'Pro Misionero - Rocha',
      date: '2026-10-17',
      time: '',
      location: 'Ciudad de Rocha',
      category: 'Evangelismo & Misiones',
      description: 'Actividad pro misionera en Rocha.',
      public: true,
      featured: false,
      includeChurchCalendar: true
    },
    {
      id: 'evt-036',
      title: 'Día del Pastor',
      date: '2026-10-18',
      time: '18:30 hs',
      location: 'Sede Central IEANJESÚS Maldonado',
      category: 'Actividad general',
      description: 'Jornada especial de reconocimiento y gratitud por la labor pastoral.',
      public: true,
      featured: false,
      includeChurchCalendar: true
    },
    {
      id: 'evt-037',
      title: 'Actividad económica del Comité de Música',
      date: '2026-10-18',
      time: '18:30 hs',
      location: 'Sede Central IEANJESÚS Maldonado',
      category: 'Actividad Pro Templo',
      description: 'Actividad económica organizada por el Comité de Música.',
      public: true,
      featured: false,
      includeChurchCalendar: true
    },
    {
      id: 'evt-038',
      title: 'Culto dirigido por la Célula #2',
      date: '2026-10-18',
      time: '18:30 hs',
      location: 'Sede Central IEANJESÚS Maldonado',
      category: 'Células',
      description: 'Culto dominical dirigido por la Célula #2.',
      public: true,
      featured: false,
      includeChurchCalendar: false
    },
    {
      id: 'evt-039',
      title: 'Pro Misionero - Milagrosa',
      date: '2026-10-20',
      time: '',
      location: 'Zona La Milagrosa, Maldonado',
      category: 'Evangelismo & Misiones',
      description: 'Actividad pro misionera en la zona Milagrosa.',
      public: true,
      featured: false,
      includeChurchCalendar: true
    },
    {
      id: 'evt-040',
      title: 'Culto dirigido por el Comité de Damas Dorcas',
      date: '2026-10-22',
      time: '19:30 hs',
      location: 'Sede Central IEANJESÚS Maldonado',
      category: 'Damas Dorcas',
      description: 'Reunión general de la iglesia dirigida por el Comité de Damas Dorcas.',
      public: true,
      featured: false,
      includeChurchCalendar: false
    },
    {
      id: 'evt-041',
      title: 'Pro Misionero - Maldonado Nuevo',
      date: '2026-10-23',
      time: '',
      location: 'Zona Maldonado Nuevo, Maldonado',
      category: 'Evangelismo & Misiones',
      description: 'Actividad pro misionera en Maldonado Nuevo.',
      public: true,
      featured: false,
      includeChurchCalendar: true
    },
    {
      id: 'evt-042',
      title: 'Reunión de Jóvenes',
      date: '2026-10-24',
      time: '',
      location: 'Sede Central IEANJESÚS Maldonado',
      category: 'Jóvenes',
      description: 'Encuentro del Comité de Jóvenes para compartir y crecer en la fe.',
      public: true,
      featured: false,
      includeChurchCalendar: true
    },
    {
      id: 'evt-043',
      title: 'Culto Misionero Juvenil',
      date: '2026-10-25',
      time: '18:30 hs',
      location: 'Sede Central IEANJESÚS Maldonado',
      category: 'Jóvenes',
      description: 'Culto misionero especial organizado por el Comité de Jóvenes.',
      public: true,
      featured: false,
      includeChurchCalendar: true
    },
    {
      id: 'evt-044',
      title: 'Culto dirigido por el Comité de Jóvenes',
      date: '2026-10-25',
      time: '18:30 hs',
      location: 'Sede Central IEANJESÚS Maldonado',
      category: 'Jóvenes',
      description: 'Culto dominical dirigido por el Comité de Jóvenes.',
      public: true,
      featured: false,
      includeChurchCalendar: false
    },
    {
      id: 'evt-045',
      title: 'Culto dirigido por el Comité de Caballeros',
      date: '2026-10-29',
      time: '19:30 hs',
      location: 'Sede Central IEANJESÚS Maldonado',
      category: 'Caballeros',
      description: 'Reunión general de la iglesia dirigida por el Comité de Caballeros.',
      public: true,
      featured: false,
      includeChurchCalendar: false
    },
    {
      id: 'evt-046',
      title: 'Ayuno - Día 1',
      date: '2026-10-31',
      time: '',
      location: 'Sede Central IEANJESÚS Maldonado',
      category: 'Oración y Ayuno',
      description: 'Primera jornada del ayuno de dos días.',
      public: true,
      featured: false,
      includeChurchCalendar: true
    },
    {
      id: 'evt-047',
      title: 'Ayuno - Día 2',
      date: '2026-11-01',
      time: '',
      location: 'Sede Central IEANJESÚS Maldonado',
      category: 'Oración y Ayuno',
      description: 'Segunda jornada del ayuno de dos días.',
      public: true,
      featured: false,
      includeChurchCalendar: true
    },
    {
      id: 'evt-048',
      title: 'Santa Cena',
      date: '2026-11-01',
      time: '10:00 hs',
      location: 'Sede Central IEANJESÚS Maldonado',
      category: 'Culto especial',
      description: 'Celebración de la Santa Cena con la congregación.',
      public: true,
      featured: false,
      includeChurchCalendar: true
    },
    {
      id: 'evt-049',
      title: 'Culto normal',
      date: '2026-11-01',
      time: '18:30 hs',
      location: 'Sede Central IEANJESÚS Maldonado',
      category: 'Culto',
      description: 'Culto dominical de la iglesia.',
      public: true,
      featured: false,
      includeChurchCalendar: false
    },
    {
      id: 'evt-050',
      title: 'Culto dirigido por el Comité de Damas Dorcas',
      date: '2026-11-05',
      time: '19:30 hs',
      location: 'Sede Central IEANJESÚS Maldonado',
      category: 'Damas Dorcas',
      description: 'Reunión general de la iglesia dirigida por el Comité de Damas Dorcas.',
      public: true,
      featured: false,
      includeChurchCalendar: false
    },
    {
      id: 'evt-051',
      title: 'Encuentro de Células',
      date: '2026-11-08',
      time: '18:30 hs',
      location: 'Sede Central IEANJESÚS Maldonado',
      category: 'Células',
      description: 'Encuentro especial de las células de la iglesia.',
      public: true,
      featured: false,
      includeChurchCalendar: true
    },
    {
      id: 'evt-052',
      title: 'Culto dirigido por las Células #1 y #4',
      date: '2026-11-08',
      time: '18:30 hs',
      location: 'Sede Central IEANJESÚS Maldonado',
      category: 'Células',
      description: 'Culto dominical dirigido por las Células #1 y #4.',
      public: true,
      featured: false,
      includeChurchCalendar: false
    },
    {
      id: 'evt-053',
      title: 'No hay Célula',
      date: '2026-11-09 a 2026-11-15',
      time: '',
      location: 'Sede Central IEANJESÚS Maldonado',
      category: 'Células',
      description: 'Durante este período no se realizarán reuniones de Célula.',
      public: true,
      featured: false,
      includeChurchCalendar: false
    },
    {
      id: 'evt-054',
      title: 'Culto dirigido por el Comité de Damas Dorcas',
      date: '2026-11-12',
      time: '19:30 hs',
      location: 'Sede Central IEANJESÚS Maldonado',
      category: 'Damas Dorcas',
      description: 'Reunión general de la iglesia dirigida por el Comité de Damas Dorcas.',
      public: true,
      featured: false,
      includeChurchCalendar: false
    },
    {
      id: 'evt-055',
      title: 'Actividad económica del Comité de Obra Social',
      date: '2026-11-15',
      time: '18:30 hs',
      location: 'Sede Central IEANJESÚS Maldonado',
      category: 'Actividad Pro Templo',
      description: 'Actividad económica organizada por el Comité de Obra Social.',
      public: true,
      featured: false,
      includeChurchCalendar: true
    },
    {
      id: 'evt-056',
      title: 'Culto dirigido por el Comité de Música',
      date: '2026-11-15',
      time: '18:30 hs',
      location: 'Sede Central IEANJESÚS Maldonado',
      category: 'Culto',
      description: 'Culto dominical dirigido por el Comité de Música.',
      public: true,
      featured: false,
      includeChurchCalendar: false
    },
    {
      id: 'evt-057',
      title: 'Culto dirigido por el Comité de Damas Dorcas',
      date: '2026-11-19',
      time: '19:30 hs',
      location: 'Sede Central IEANJESÚS Maldonado',
      category: 'Damas Dorcas',
      description: 'Reunión general de la iglesia dirigida por el Comité de Damas Dorcas.',
      public: true,
      featured: false,
      includeChurchCalendar: false
    },
    {
      id: 'evt-058',
      title: 'Reunión de Jóvenes',
      date: '2026-11-21',
      time: '',
      location: 'Sede Central IEANJESÚS Maldonado',
      category: 'Jóvenes',
      description: 'Encuentro del Comité de Jóvenes para compartir y crecer en la fe.',
      public: true,
      featured: false,
      includeChurchCalendar: true
    },
    {
      id: 'evt-059',
      title: 'Aniversario de la Iglesia',
      date: '2026-11-22',
      time: '18:30 hs',
      location: 'Sede Central IEANJESÚS Maldonado',
      category: 'Aniversario',
      description: 'Celebración especial por el aniversario de IEANJESÚS Maldonado.',
      public: true,
      featured: true,
      includeChurchCalendar: true
    },
    {
      id: 'evt-060',
      title: 'Culto dirigido por la Junta Local',
      date: '2026-11-22',
      time: '18:30 hs',
      location: 'Sede Central IEANJESÚS Maldonado',
      category: 'Culto',
      description: 'Culto dominical dirigido por la Junta Local.',
      public: true,
      featured: false,
      includeChurchCalendar: false
    },
    {
      id: 'evt-061',
      title: 'Culto dirigido por el Comité de Caballeros',
      date: '2026-11-26',
      time: '19:30 hs',
      location: 'Sede Central IEANJESÚS Maldonado',
      category: 'Caballeros',
      description: 'Reunión general de la iglesia dirigida por el Comité de Caballeros.',
      public: true,
      featured: false,
      includeChurchCalendar: false
    },
    {
      id: 'evt-062',
      title: 'Culto dirigido por la Célula #3',
      date: '2026-11-29',
      time: '18:30 hs',
      location: 'Sede Central IEANJESÚS Maldonado',
      category: 'Células',
      description: 'Culto dominical dirigido por la Célula #3.',
      public: true,
      featured: false,
      includeChurchCalendar: false
    },
    {
      id: 'evt-063',
      title: 'Culto dirigido por el Comité de Damas Dorcas',
      date: '2026-12-03',
      time: '19:30 hs',
      location: 'Sede Central IEANJESÚS Maldonado',
      category: 'Damas Dorcas',
      description: 'Reunión general de la iglesia dirigida por el Comité de Damas Dorcas.',
      public: true,
      featured: false,
      includeChurchCalendar: false
    },
    {
      id: 'evt-064',
      title: 'Convención UY - Día 1',
      date: '2026-12-05',
      time: '',
      location: 'Convención Nacional UY',
      category: 'Convención',
      description: 'Primera jornada de la Convención UY.',
      public: true,
      featured: true,
      includeChurchCalendar: true
    },
    {
      id: 'evt-065',
      title: 'Convención UY - Día 2',
      date: '2026-12-06',
      time: '',
      location: 'Convención Nacional UY',
      category: 'Convención',
      description: 'Segunda jornada de la Convención UY.',
      public: true,
      featured: true,
      includeChurchCalendar: true
    },
    {
      id: 'evt-066',
      title: 'Culto dirigido por el Comité de Damas Dorcas',
      date: '2026-12-10',
      time: '19:30 hs',
      location: 'Sede Central IEANJESÚS Maldonado',
      category: 'Damas Dorcas',
      description: 'Reunión general de la iglesia dirigida por el Comité de Damas Dorcas.',
      public: true,
      featured: false,
      includeChurchCalendar: false
    },
    {
      id: 'evt-067',
      title: 'Culto dirigido por el Comité de Obra Social',
      date: '2026-12-13',
      time: '18:30 hs',
      location: 'Sede Central IEANJESÚS Maldonado',
      category: 'Culto',
      description: 'Culto dominical dirigido por el Comité de Obra Social.',
      public: true,
      featured: false,
      includeChurchCalendar: false
    },
    {
      id: 'evt-068',
      title: 'Culto dirigido por el Comité de Caballeros',
      date: '2026-12-17',
      time: '19:30 hs',
      location: 'Sede Central IEANJESÚS Maldonado',
      category: 'Caballeros',
      description: 'Reunión general de la iglesia dirigida por el Comité de Caballeros.',
      public: true,
      featured: false,
      includeChurchCalendar: false
    },
    {
      id: 'evt-069',
      title: 'Reunión de Jóvenes',
      date: '2026-12-19',
      time: '',
      location: 'Sede Central IEANJESÚS Maldonado',
      category: 'Jóvenes',
      description: 'Encuentro del Comité de Jóvenes para compartir y crecer en la fe.',
      public: true,
      featured: false,
      includeChurchCalendar: true
    },
    {
      id: 'evt-070',
      title: 'Reunión de Hermanos',
      date: '2026-12-20',
      time: '18:30 hs',
      location: 'Sede Central IEANJESÚS Maldonado',
      category: 'Reunión',
      description: 'Reunión especial de los hermanos de la iglesia.',
      public: true,
      featured: false,
      includeChurchCalendar: true
    },
    {
      id: 'evt-071',
      title: 'Fin de Año - DED',
      date: '2026-12-20',
      time: '18:30 hs',
      location: 'Sede Central IEANJESÚS Maldonado',
      category: 'Actividad general',
      description: 'Actividad especial de fin de año de DED.',
      public: true,
      featured: false,
      includeChurchCalendar: true
    },
    {
      id: 'evt-072',
      title: 'Actividad económica de la Junta Local',
      date: '2026-12-20',
      time: '18:30 hs',
      location: 'Sede Central IEANJESÚS Maldonado',
      category: 'Actividad Pro Templo',
      description: 'Actividad económica organizada por la Junta Local.',
      public: true,
      featured: false,
      includeChurchCalendar: true
    },
    {
      id: 'evt-073',
      title: 'Culto dirigido por la Junta Local',
      date: '2026-12-20',
      time: '18:30 hs',
      location: 'Sede Central IEANJESÚS Maldonado',
      category: 'Culto',
      description: 'Culto dominical dirigido por la Junta Local.',
      public: true,
      featured: false,
      includeChurchCalendar: false
    },
    {
      id: 'evt-074',
      title: 'Encuentro de Células',
      date: '2026-12-27',
      time: '18:30 hs',
      location: 'Sede Central IEANJESÚS Maldonado',
      category: 'Células',
      description: 'Encuentro especial de las células de la iglesia.',
      public: true,
      featured: false,
      includeChurchCalendar: true
    },
    {
      id: 'evt-075',
      title: 'Clausura del Año',
      date: '2026-12-27',
      time: '18:30 hs',
      location: 'Sede Central IEANJESÚS Maldonado',
      category: 'Actividad general',
      description: 'Celebración de cierre de las actividades del año.',
      public: true,
      featured: false,
      includeChurchCalendar: true
    },
    {
      id: 'evt-076',
      title: 'Culto dirigido por las Células #3 y #5',
      date: '2026-12-27',
      time: '18:30 hs',
      location: 'Sede Central IEANJESÚS Maldonado',
      category: 'Células',
      description: 'Culto dominical dirigido por las Células #3 y #5.',
      public: true,
      featured: false,
      includeChurchCalendar: false
    },
    {
      id: 'evt-077',
      title: 'Año Nuevo',
      date: '2026-12-30',
      time: '',
      location: 'Sede Central IEANJESÚS Maldonado',
      category: 'Celebración',
      description: 'Primera jornada de las actividades de Año Nuevo.',
      public: true,
      featured: false,
      includeChurchCalendar: true
    },
    {
      id: 'evt-078',
      title: 'Año Nuevo',
      date: '2026-12-31',
      time: '',
      location: 'Sede Central IEANJESÚS Maldonado',
      category: 'Celebración',
      description: 'Segunda jornada de las actividades de Año Nuevo.',
      public: true,
      featured: false,
      includeChurchCalendar: true
    },
  ],
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
      events: [...(DEFAULT_DATA.events || [])],
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
          time: row.time || '',
          location: row.location || 'Sede Central IEANJESÃšS Maldonado',
          category: row.category || 'Actividad',
          description: row.description || '',
          public: row.public !== false,
          featured: row.featured === true,
          includeChurchCalendar: row.include_church_calendar === true
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
          time: item.time || '',
          location: item.location || 'Sede Central IEANJESÃšS Maldonado',
          category: item.category || 'Actividad',
          description: item.description || '',
          public: item.public !== false,
          featured: item.featured === true,
          include_church_calendar: item.includeChurchCalendar === true
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
        console.warn('Usando eventos predeterminados por contingencia de Supabase:', eventsRes.error.message || eventsRes.error);
        if (!this.data.events || this.data.events.length === 0) {
          this.data.events = [...(DEFAULT_DATA.events || [])];
        }
      } else if (Array.isArray(eventsRes.data) && eventsRes.data.length > 0) {
        this.data.events = eventsRes.data.map(r => this.fromDb('events', r));
      } else {
        // Si la tabla en Supabase estÃ¡ vacÃ­a o no tiene registros aÃºn, usar el catÃ¡logo oficial
        this.data.events = [...(DEFAULT_DATA.events || [])];
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

  getEvents(upcomingOnly = false, churchOnly = false) {
    let list = [...(this.data.events || [])];
    if (churchOnly) {
      list = list.filter(e => e.includeChurchCalendar);
    }
    if (upcomingOnly) {
      const todayStr = new Date().toISOString().split('T')[0];
      list = list.filter(e => {
        if (!e.public) return false;
        if (e.date.includes(' a ')) {
          const endDate = e.date.split(' a ')[1].trim();
          return endDate >= todayStr;
        }
        return e.date >= todayStr;
      });
    }
    return list.sort((a, b) => {
      const dateA = a.date.includes(' a ') ? a.date.split(' a ')[0].trim() : a.date;
      const dateB = b.date.includes(' a ') ? b.date.split(' a ')[0].trim() : b.date;
      return dateA > dateB ? 1 : -1;
    });
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
