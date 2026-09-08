/**
 * =============================================================================
 * IEANJESÚS Maldonado - Capa Central de Datos (DataStore con Supabase)
 * =============================================================================
 * Administra entidades: Horarios, Células, Agenda (Eventos), Avisos, Material Gratuito y Emprendimientos.
 * Conexión directa a PostgreSQL vía Supabase con soporte Realtime y caché local en memoria.
 * Mantiene la interfaz de lectura sincrónica para máxima velocidad y sin parpadeos visuales.
 * =============================================================================
 */

// Datos de contingencia / iniciales oficiales
const DEFAULT_DATA = {
  // 1. Avisos Temporales
  notices: [
    {
      id: 'notice-1',
      title: 'Cultos Congregacionales',
      text: 'Les recordamos que nuestros cultos generales en sede central son los Jueves 19:30 hs y Domingos 18:30 hs. ¡Te esperamos junto a tu familia!',
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      visible: true
    }
  ],

  // 2. Horarios de Cultos en Templo Central
  schedules: [
    {
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
      whatToExpect: 'Un ambiente acogedor y reverente, alabanzas congregacionales, predicación bíblica clara y un momento final de oración por peticiones personales.',
      displayOrder: 1,
      visible: true
    },
    {
      id: 'sched-evangelismo-feria',
      name: 'Evangelismo en la Feria',
      day: 'Domingo',
      time: '10:00',
      location: 'Feria de Maldonado',
      type: 'evangelismo',
      shortDesc: 'Evangelismo en la Feria',
      fullDesc: 'Actividad de evangelismo y testimonio público en la feria de Maldonado, compartiendo las Buenas Nuevas y folletos bíblicos con la comunidad.',
      organizer: 'Equipo de evangelismo y liderazgo de la iglesia',
      target: 'Toda la comunidad y visitantes de la feria',
      whatToExpect: 'Evangelismo personal, entrega de folletos, oración por las necesidades y testimonio cristiano.',
      displayOrder: 2,
      visible: true
    },
    {
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
      whatToExpect: 'Adoración en vivo con el ministerio de alabanza, predicación cristocéntrica, atención cálida para nuevas visitas y un tiempo especial de ministración espiritual.',
      displayOrder: 3,
      visible: true
    }
  ],

  // 3. Red de 8 Células de Hogar
  cells: [
    {
      id: 'cell-hipodromo',
      name: 'Barrio Hipódromo',
      day: 'Lunes',
      time: '19:00 hs',
      zone: 'Barrio Hipódromo',
      address: 'Sector Barrio Hipódromo, Maldonado',
      description: 'Reunión en hogar para compartir la Palabra, orar por las necesidades y fortalecer los lazos fraternos.',
      image: 'assets/images/celula-hipodromo.jpg',
      phone: '+598 93 836 423',
      whatsappText: 'Hola, Dios le bendiga. Quisiera recibir información sobre la Célula Barrio Hipódromo.',
      whatsappUrl: 'https://wa.me/59893836423?text=Hola,%20Dios%20le%20bendiga.%20Quisiera%20recibir%20informaci%C3%B3n%20sobre%20la%20C%C3%A9lula%20Barrio%20Hip%C3%B3dromo.',
      displayOrder: 1,
      visible: true
    },
    {
      id: 'cell-la-milagrosa',
      name: 'La Milagrosa',
      day: 'Martes',
      time: '19:00 hs',
      zone: 'Barrio La Milagrosa',
      address: 'Barrio La Milagrosa, Maldonado',
      description: 'Espacio de estudio bíblico, crecimiento en la fe y oración por la familia en un ambiente cálido.',
      image: 'assets/images/celula-la-milagrosa.jpg',
      phone: '+598 95 712 960',
      whatsappText: 'Hola, Dios le bendiga. Quisiera recibir información sobre la Célula La Milagrosa.',
      whatsappUrl: 'https://wa.me/59895712960?text=Hola,%20Dios%20le%20bendiga.%20Quisiera%20recibir%20informaci%C3%B3n%20sobre%20la%20C%C3%A9lula%20La%20Milagrosa.',
      displayOrder: 2,
      visible: true
    },
    {
      id: 'cell-cerro-pelado',
      name: 'Cerro Pelado',
      day: 'Martes',
      time: '19:30 hs',
      zone: 'Barrio Cerro Pelado',
      address: 'Barrio Cerro Pelado, Maldonado',
      description: 'Encuentro familiar para profundizar en las Escrituras y apoyarnos mutuamente en oración.',
      image: 'assets/images/celula-cerro-pelado.jpg',
      phone: '+598 94 181 784',
      whatsappText: 'Hola, Dios le bendiga. Quisiera recibir información sobre la Célula Cerro Pelado.',
      whatsappUrl: 'https://wa.me/59894181784?text=Hola,%20Dios%20le%20bendiga.%20Quisiera%20recibir%20informaci%C3%B3n%20sobre%20la%20C%C3%A9lula%20Cerro%20Pelado.',
      displayOrder: 3,
      visible: true
    },
    {
      id: 'cell-cunetti',
      name: 'Cuñetti',
      day: 'Miércoles',
      time: '19:30 hs',
      zone: 'Barrio Cuñetti',
      address: 'Barrio Cuñetti, Maldonado',
      description: 'Reunión vecinal para compartir reflexiones bíblicas prácticas y orar por los hogares del barrio.',
      image: 'assets/images/celula-cunetti.jpg',
      phone: '+598 93 943 580',
      whatsappText: 'Hola, Dios le bendiga. Quisiera recibir información sobre la Célula Cuñetti.',
      whatsappUrl: 'https://wa.me/59893943580?text=Hola,%20Dios%20le%20bendiga.%20Quisiera%20recibir%20informaci%C3%B3n%20sobre%20la%20C%C3%A9lula%20Cu%C3%B1etti.',
      displayOrder: 4,
      visible: true
    },
    {
      id: 'cell-rocha',
      name: 'Ciudad de Rocha',
      day: 'Miércoles',
      time: '19:30 hs',
      zone: 'Ciudad de Rocha',
      address: 'Ciudad de Rocha (Punto de Extensión)',
      description: 'Misión y grupo de extensión para la comunidad de Rocha con enseñanza bíblica y oración.',
      image: 'assets/images/celula-rocha.jpg',
      phone: '+598 94 867 047',
      whatsappText: 'Hola, Dios le bendiga. Quisiera recibir información sobre la Célula Rocha.',
      whatsappUrl: 'https://wa.me/59894867047?text=Hola,%20Dios%20le%20bendiga.%20Quisiera%20recibir%20informaci%C3%B3n%20sobre%20la%20C%C3%A9lula%20Rocha.',
      displayOrder: 5,
      visible: true
    },
    {
      id: 'cell-maldonado-nuevo',
      name: 'Maldonado Nuevo',
      day: 'Viernes',
      time: '19:00 hs',
      zone: 'Maldonado Nuevo',
      address: 'Sector Maldonado Nuevo, Maldonado',
      description: 'Discipulado práctico en el hogar, alabanza y compañerismo en el amor de Cristo.',
      image: 'assets/images/celula-maldonado-nuevo.jpg',
      phone: '+598 91 884 036',
      whatsappText: 'Hola, Dios le bendiga. Quisiera recibir información sobre la Célula Maldonado Nuevo.',
      whatsappUrl: 'https://wa.me/59891884036?text=Hola,%20Dios%20le%20bendiga.%20Quisiera%20recibir%20informaci%C3%B3n%20sobre%20la%20C%C3%A9lula%20Maldonado%20Nuevo.',
      displayOrder: 6,
      visible: true
    },
    {
      id: 'cell-centro',
      name: 'Centro',
      day: 'Viernes',
      time: '19:00 hs',
      zone: 'Maldonado Centro',
      address: 'Maldonado Centro',
      description: 'Reunión céntrica de estudio bíblico, alabanza y bienvenida a quienes trabajan o viven en el centro.',
      image: 'assets/images/celula-centro.jpg',
      phone: '+598 91 479 591',
      whatsappText: 'Hola, Dios le bendiga. Quisiera recibir información sobre la Célula Centro.',
      whatsappUrl: 'https://wa.me/59891479591?text=Hola,%20Dios%20le%20bendiga.%20Quisiera%20recibir%20informaci%C3%B3n%20sobre%20la%20C%C3%A9lula%20Centro.',
      displayOrder: 7,
      visible: true
    },
    {
      id: 'cell-barrio-norte',
      name: 'Barrio Norte',
      day: 'Viernes',
      time: '19:30 hs',
      zone: 'Sector Barrio Norte',
      address: 'Sector Barrio Norte, Maldonado',
      description: 'Comunión cristiana, adoración y estudio de la Palabra para edificación de los hogares.',
      image: 'assets/images/celula-barrio-norte.jpg',
      phone: '+598 95 615 798',
      whatsappText: 'Hola, Dios le bendiga. Quisiera recibir información sobre la Célula Barrio Norte.',
      whatsappUrl: 'https://wa.me/59895615798?text=Hola,%20Dios%20le%20bendiga.%20Quisiera%20recibir%20informaci%C3%B3n%20sobre%20la%20C%C3%A9lula%20Barrio%20Norte.',
      displayOrder: 8,
      visible: true
    }
  ],

  // 4. Agenda y Próximas Actividades (Fechas específicas)
  events: [
    {
      id: 'evt-1',
      title: 'Culto Especial de Oración e Intercesión',
      date: '2026-09-10',
      time: '19:30 hs',
      location: 'Sede Central (Av. Wilson Ferreira Aldunate & 25 de Agosto)',
      category: 'Culto especial',
      description: 'Noche consagrada al clamor por las familias, sanidad divina y dirección espiritual para nuestra comunidad.',
      public: true,
      featured: true
    },
    {
      id: 'evt-2',
      title: 'Encuentro Unido de Jóvenes',
      date: '2026-09-19',
      time: '18:00 hs',
      location: 'Sede Central IEANJESÚS Maldonado',
      category: 'Jóvenes',
      description: 'Reunión especial de adoración, dinámicas, palabra para la juventud y refrigerio compartido.',
      public: true,
      featured: true
    },
    {
      id: 'evt-3',
      title: 'Jornada de Evangelismo y Plan Cornelio',
      date: '2026-09-26',
      time: '15:30 hs',
      location: 'Punto de encuentro: Sede Central Maldonado',
      category: 'Evangelismo',
      description: 'Salida misionera para compartir el mensaje del evangelio y folletos en los barrios de Maldonado.',
      public: true,
      featured: false
    },
    {
      id: 'evt-4',
      title: 'Santa Cena y Celebración Congregacional',
      date: '2026-10-04',
      time: '18:30 hs',
      location: 'Sede Central IEANJESÚS Maldonado',
      category: 'Culto especial',
      description: 'Conmemoración solemne del sacrificio de nuestro Señor Jesucristo y tiempo de profunda comunión espiritual.',
      public: true,
      featured: true
    },
    {
      id: 'evt-5',
      title: 'Seminario de Discipulado y Doctrina Bíblica',
      date: '2026-10-17',
      time: '16:00 hs',
      location: 'Salón Principal Sede Central',
      category: 'Enseñanza',
      description: 'Taller formativo para nuevos creyentes y líderes sobre los fundamentos bíblicos y la vida práctica en Cristo.',
      public: true,
      featured: false
    }
  ],

  // 5. Catálogo de Material Gratuito
  resources: [
    {
      id: 'res-1',
      title: 'Folleto: El Camino Bíblico de la Salvación',
      category: 'Evangelismo',
      description: 'Material explicativo claro y directo con citas bíblicas para compartir con familiares, vecinos y amigos.',
      fileType: 'PDF',
      externalUrl: 'https://drive.google.com/drive/folders/1example-evangelismo',
      displayOrder: 1,
      visible: true
    },
    {
      id: 'res-2',
      title: 'Plan Cornelio — Guía Práctica de Evangelismo y Discipulado',
      category: 'Plan Cornelio',
      description: 'Manual de orientación para visitas en hogares, diálogo testimonial y acompañamiento de nuevas personas interesadas en el evangelio.',
      fileType: 'Presentación',
      externalUrl: 'https://drive.google.com/drive/folders/1example-plan-cornelio',
      displayOrder: 2,
      visible: true
    },
    {
      id: 'res-3',
      title: 'Bosquejos Bíblicos para el Estudio de la Palabra',
      category: 'Bosquejos y Enseñanzas',
      description: 'Compilado de investigaciones temáticas, análisis de palabras clave en el texto original y referencias cruzadas.',
      fileType: 'Documento',
      externalUrl: 'https://drive.google.com/drive/folders/1example-bosquejos',
      displayOrder: 3,
      visible: true
    },
    {
      id: 'res-4',
      title: 'Fundamentos de la Fe y la Unicidad de Dios',
      category: 'Doctrina',
      description: 'Estudio doctrinal profundo acerca de la revelación de Dios en Jesucristo, el bautismo bíblico y la promesa del Espíritu Santo.',
      fileType: 'PDF',
      externalUrl: 'https://drive.google.com/drive/folders/1example-doctrina',
      displayOrder: 4,
      visible: true
    },
    {
      id: 'res-5',
      title: 'Sanidad Divina y Fe Práctica en el Hogar',
      category: 'Doctrina',
      description: 'Enseñanza sobre las promesas del Señor para la sanidad, la oración de fe y la restauración integral de la familia.',
      fileType: 'Folleto',
      externalUrl: 'https://drive.google.com/drive/folders/1example-sanidad',
      displayOrder: 5,
      visible: true
    },
    {
      id: 'res-6',
      title: 'Cómo Iniciar y Desarrollar una Célula de Hogar',
      category: 'Plan Cornelio',
      description: 'Orientación para anfitriones y líderes celulares: dinámica de la reunión, bienvenida y cuidado pastoral.',
      fileType: 'PDF',
      externalUrl: 'https://drive.google.com/drive/folders/1example-celulas',
      displayOrder: 6,
      visible: true
    }
  ],

  // 6. Emprendimientos de Nuestra Comunidad
  businesses: [
    {
      id: 'biz-boomer',
      name: 'Boomer Studio',
      category: 'Estudio Creativo & Multimedia',
      description: 'Servicios de diseño gráfico, identidad visual, producción audiovisual y desarrollo web profesional.',
      linkType: 'Instagram',
      phone: '+598 98 094 062',
      url: 'https://www.instagram.com/boomerstudio.mktg?stkn=MTc2enVlbTU5cnA1cg==',
      whatsappUrl: 'https://wa.me/59898094062?text=Hola,%20quisiera%20consultar%20por%20los%20servicios%20de%20Boomer%20Studio.',
      logoText: 'BOOMER STUDIO',
      displayOrder: 1,
      visible: true
    },
    {
      id: 'biz-control-clima',
      name: 'Control Clima',
      category: 'Climatización & Confort',
      description: 'Instalación, mantenimiento y reparación de sistemas de aire acondicionado y climatización para hogares y comercios.',
      linkType: 'WhatsApp',
      phone: '+598 94 494 907',
      url: 'https://wa.me/59894494907?text=Hola,%20quisiera%20consultar%20por%20los%20servicios%20de%20Control%20Clima.',
      logoText: 'CONTROL CLIMA',
      displayOrder: 2,
      visible: true
    },
    {
      id: 'biz-jb-construcciones',
      name: 'JB² Construcciones',
      category: 'Construcción & Reformas',
      description: 'Obras civiles, albañilería tradicional, reformas integrales, yeso, pintura y terminaciones de calidad.',
      linkType: 'WhatsApp',
      phone: '+598 99 655 825',
      url: 'https://wa.me/59899655825?text=Hola,%20quisiera%20consultar%20por%20los%20servicios%20de%20JB%C2%B2%20Construcciones.',
      logoText: 'JB² CONSTRUCCIONES',
      displayOrder: 3,
      visible: true
    },
    {
      id: 'biz-cc-construimos',
      name: 'C&C — Construimos tu proyecto',
      category: 'Arquitectura & Obras',
      description: 'Planificación, dirección técnica y ejecución de proyectos constructivos, remodelaciones y diseño de espacios.',
      linkType: 'WhatsApp',
      phone: '+598 94 181 784',
      url: 'https://wa.me/59894181784?text=Hola,%20quisiera%20consultar%20por%20los%20servicios%20de%20C%26C.',
      logoText: 'C&C — CONSTRUIMOS TU PROYECTO',
      displayOrder: 4,
      visible: true
    },
    {
      id: 'biz-kabby',
      name: 'KABBY',
      category: 'Modista / Confección de prendas',
      description: 'Confección y arreglo de prendas, trabajos de modista y soluciones personalizadas en costura, con atención cuidada y trabajo a medida.',
      linkType: 'WhatsApp',
      phone: '+598 92 659 579',
      url: 'https://wa.me/59892659579?text=Hola,%20quisiera%20consultar%20por%20los%20servicios%20de%20KABBY.',
      whatsappUrl: 'https://wa.me/59892659579?text=Hola,%20quisiera%20consultar%20por%20los%20servicios%20de%20KABBY.',
      logoText: 'KABBY',
      logo: 'assets/images/logo-kabby.svg',
      displayOrder: 5,
      visible: true
    }
  ],

  // 7. Repertorio Fotográfico Oficial
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
    this.data = JSON.parse(JSON.stringify(DEFAULT_DATA));
    this.listeners = [];
    this.isInitialized = false;

    // Iniciar carga asíncrona desde Supabase en cuanto el cliente esté listo
    this.initSupabase();
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
    if (!activeOnly) return this.data.notices || [];
    const nowStr = new Date().toISOString().split('T')[0];
    return (this.data.notices || []).filter(n => {
      if (!n.visible) return false;
      if (n.startDate && n.startDate > nowStr) return false;
      if (n.endDate && n.endDate < nowStr) return false;
      return true;
    });
  }

  getSchedules(publicOnly = true) {
    if (!publicOnly) return this.data.schedules || [];
    return (this.data.schedules || []).filter(s => s.visible !== false);
  }

  getScheduleById(id) {
    return (this.data.schedules || []).find(s => s.id === id);
  }

  getCells(publicOnly = true) {
    if (!publicOnly) return this.data.cells || [];
    return (this.data.cells || []).filter(c => c.visible !== false);
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
    return (this.data.events || []).find(e => e.id === id);
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
    if (!publicOnly) return this.data.businesses || [];
    return (this.data.businesses || []).filter(b => b.visible !== false);
  }

  getGalleryPhotos(category = null) {
    const list = this.data.galleryPhotos || DEFAULT_DATA.galleryPhotos;
    if (!category || category === 'all' || category === 'general_all') {
      return list;
    }
    return list.filter(p => p.category === category);
  }

  getPhotoById(id) {
    const list = this.data.galleryPhotos || DEFAULT_DATA.galleryPhotos;
    return list.find(p => p.id === id);
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
