/**
 * =============================================================================
 * IEANJESÚS MALDONADO — Feed iCalendar: Calendario Completo
 * =============================================================================
 * Endpoint serverless compatible con Google Calendar, Apple Calendar e iCalendar (RFC 5545).
 * Genera dinámicamente el feed .ics de la programación completa de la iglesia.
 * =============================================================================
 */

const SUPABASE_PROJECT_URL = 'https://voaitpfwelisdflspuyz.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_Tq-mPa_EAL9wGBg-lX8FvA_ccs2eH6A';

// Catálogo aprobado de contingencia con los 78 eventos
const FALLBACK_EVENTS = [
  {"id":"evt-001","fecha":"2026-09-06","hora":"18:30","titulo":"Voto Misionero Juvenil","descripcion":"Jornada especial de compromiso misionero del Comité de Jóvenes.","lugar":"Sede Central IEANJESÚS Maldonado","destacado":false,"include_church_calendar":true},
  {"id":"evt-002","fecha":"2026-09-06","hora":"18:30","titulo":"Mes de la Familia #1","descripcion":"Primera jornada especial del Mes de la Familia.","lugar":"Sede Central IEANJESÚS Maldonado","destacado":false,"include_church_calendar":true},
  {"id":"evt-003","fecha":"2026-09-06","hora":"18:30","titulo":"Culto dirigido por el Comité de Jóvenes","descripcion":"Culto dominical dirigido por el Comité de Jóvenes.","lugar":"Sede Central IEANJESÚS Maldonado","destacado":false,"include_church_calendar":false},
  {"id":"evt-004","fecha":"2026-09-09","hora":"","titulo":"Pro Misionero - Centro","descripcion":"Actividad pro misionera en la zona Centro.","lugar":"Zona Centro, Maldonado","destacado":false,"include_church_calendar":true},
  {"id":"evt-005","fecha":"2026-09-10","hora":"19:30","titulo":"Culto dirigido por el Comité de Damas Dorcas","descripcion":"Reunión general de la iglesia dirigida por el Comité de Damas Dorcas.","lugar":"Sede Central IEANJESÚS Maldonado","destacado":false,"include_church_calendar":false},
  {"id":"evt-006","fecha":"2026-09-12","hora":"","titulo":"Culto Misionero - Curva","descripcion":"Culto misionero en la zona de la Curva.","lugar":"Zona La Curva, Maldonado","destacado":false,"include_church_calendar":true},
  {"id":"evt-007","fecha":"2026-09-13","hora":"18:30","titulo":"Mes de la Familia #2","descripcion":"Segunda jornada especial del Mes de la Familia.","lugar":"Sede Central IEANJESÚS Maldonado","destacado":false,"include_church_calendar":true},
  {"id":"evt-008","fecha":"2026-09-13","hora":"18:30","titulo":"Actividad económica del Comité de Comunicaciones","descripcion":"Actividad económica organizada por el Comité de Comunicaciones.","lugar":"Sede Central IEANJESÚS Maldonado","destacado":false,"include_church_calendar":true},
  {"id":"evt-009","fecha":"2026-09-13","hora":"18:30","titulo":"Culto dirigido por la Junta Local","descripcion":"Culto dominical dirigido por la Junta Local.","lugar":"Sede Central IEANJESÚS Maldonado","destacado":false,"include_church_calendar":false},
  {"id":"evt-010","fecha":"2026-09-17","hora":"19:30","titulo":"Culto dirigido por el Comité de Damas Dorcas","descripcion":"Reunión general de la iglesia dirigida por el Comité de Damas Dorcas.","lugar":"Sede Central IEANJESÚS Maldonado","destacado":false,"include_church_calendar":false},
  {"id":"evt-011","fecha":"2026-09-18","hora":"","titulo":"Pro Misionero - Barrio Norte","descripcion":"Actividad pro misionera en Barrio Norte.","lugar":"Zona Barrio Norte, Maldonado","destacado":false,"include_church_calendar":true},
  {"id":"evt-012","fecha":"2026-09-19","hora":"","titulo":"Reunión de Jóvenes","descripcion":"Encuentro del Comité de Jóvenes para compartir y crecer en la fe.","lugar":"Sede Central IEANJESÚS Maldonado","destacado":false,"include_church_calendar":true},
  {"id":"evt-013","fecha":"2026-09-20","hora":"18:30","titulo":"Mes de la Familia #3","descripcion":"Tercera jornada especial del Mes de la Familia.","lugar":"Sede Central IEANJESÚS Maldonado","destacado":false,"include_church_calendar":true},
  {"id":"evt-014","fecha":"2026-09-20","hora":"18:30","titulo":"Encuentro de Células","descripcion":"Encuentro especial de las células de la iglesia.","lugar":"Sede Central IEANJESÚS Maldonado","destacado":false,"include_church_calendar":true},
  {"id":"evt-015","fecha":"2026-09-20","hora":"18:30","titulo":"Culto dirigido por las Células #7 y #8","descripcion":"Culto dominical dirigido por las Células #7 y #8.","lugar":"Sede Central IEANJESÚS Maldonado","destacado":false,"include_church_calendar":false},
  {"id":"evt-016","fecha":"2026-09-21 a 2026-09-27","hora":"","titulo":"No hay Célula","descripcion":"Durante este período no se realizarán reuniones de Célula.","lugar":"Sede Central IEANJESÚS Maldonado","destacado":false,"include_church_calendar":false},
  {"id":"evt-017","fecha":"2026-09-24","hora":"19:30","titulo":"Culto dirigido por el Comité de Caballeros","descripcion":"Reunión general de la iglesia dirigida por el Comité de Caballeros.","lugar":"Sede Central IEANJESÚS Maldonado","destacado":false,"include_church_calendar":false},
  {"id":"evt-018","fecha":"2026-09-27","hora":"18:30","titulo":"Mes de la Familia #4","descripcion":"Cuarta jornada especial del Mes de la Familia.","lugar":"Sede Central IEANJESÚS Maldonado","destacado":false,"include_church_calendar":true},
  {"id":"evt-019","fecha":"2026-09-27","hora":"18:30","titulo":"Culto dirigido por el Comité de Damas Dorcas","descripcion":"Culto dominical dirigido por el Comité de Damas Dorcas.","lugar":"Sede Central IEANJESÚS Maldonado","destacado":false,"include_church_calendar":false},
  {"id":"evt-020","fecha":"2026-09-30","hora":"","titulo":"Pro Misionero - Cuñetti","descripcion":"Actividad pro misionera en la zona Cuñetti.","lugar":"Zona Cuñetti, Maldonado","destacado":false,"include_church_calendar":true},
  {"id":"evt-021","fecha":"2026-10-01","hora":"19:30","titulo":"Culto dirigido por el Comité de Damas Dorcas","descripcion":"Reunión general de la iglesia dirigida por el Comité de Damas Dorcas.","lugar":"Sede Central IEANJESÚS Maldonado","destacado":false,"include_church_calendar":false},
  {"id":"evt-022","fecha":"2026-10-03","hora":"19:00","titulo":"Integración de Damas","descripcion":"Encuentro de integración del Comité de Damas Dorcas.","lugar":"Sede Central IEANJESÚS Maldonado","destacado":false,"include_church_calendar":true},
  {"id":"evt-023","fecha":"2026-10-03","hora":"19:00","titulo":"Integración de Caballeros","descripcion":"Encuentro de integración del Comité de Caballeros.","lugar":"Sede Central IEANJESÚS Maldonado","destacado":false,"include_church_calendar":true},
  {"id":"evt-024","fecha":"2026-10-03","hora":"","titulo":"Inauguración de nueva obra en La Paz","descripcion":"Celebración por la inauguración de una nueva obra de IEANJESÚS en La Paz.","lugar":"La Paz, Canelones","destacado":false,"include_church_calendar":true},
  {"id":"evt-025","fecha":"2026-10-04","hora":"","titulo":"Ayuno Nacional","descripcion":"Jornada nacional de ayuno y oración.","lugar":"Sede Central IEANJESÚS Maldonado","destacado":false,"include_church_calendar":true},
  {"id":"evt-026","fecha":"2026-10-04","hora":"18:30","titulo":"Clausura del Mes de la Familia","descripcion":"Jornada de cierre del Mes de la Familia.","lugar":"Sede Central IEANJESÚS Maldonado","destacado":false,"include_church_calendar":true},
  {"id":"evt-027","fecha":"2026-10-04","hora":"18:30","titulo":"Culto dirigido por la Célula #1 - Centro","descripcion":"Culto dominical dirigido por la Célula #1 - Centro.","lugar":"Sede Central IEANJESÚS Maldonado","destacado":false,"include_church_calendar":false},
  {"id":"evt-028","fecha":"2026-10-06","hora":"","titulo":"Pro Misionero - Hipódromo","descripcion":"Actividad pro misionera en la zona Hipódromo.","lugar":"Zona Barrio Hipódromo, Maldonado","destacado":false,"include_church_calendar":true},
  {"id":"evt-029","fecha":"2026-10-08","hora":"19:30","titulo":"Culto dirigido por el Comité de Damas Dorcas","descripcion":"Reunión general de la iglesia dirigida por el Comité de Damas Dorcas.","lugar":"Sede Central IEANJESÚS Maldonado","destacado":false,"include_church_calendar":false},
  {"id":"evt-030","fecha":"2026-10-10","hora":"","titulo":"Convención Brasil","descripcion":"Primera jornada de la Convención Brasil.","lugar":"Brasil","destacado":false,"include_church_calendar":true},
  {"id":"evt-031","fecha":"2026-10-11","hora":"","titulo":"Convención Brasil","descripcion":"Segunda jornada de la Convención Brasil.","lugar":"Brasil","destacado":false,"include_church_calendar":true},
  {"id":"evt-032","fecha":"2026-10-11","hora":"18:30","titulo":"Culto dirigido por el Comité de Comunicaciones","descripcion":"Culto dominical dirigido por el Comité de Comunicaciones.","lugar":"Sede Central IEANJESÚS Maldonado","destacado":false,"include_church_calendar":false},
  {"id":"evt-033","fecha":"2026-10-15","hora":"19:30","titulo":"Culto dirigido por el Comité de Damas Dorcas","descripcion":"Reunión general de la iglesia dirigida por el Comité de Damas Dorcas.","lugar":"Sede Central IEANJESÚS Maldonado","destacado":false,"include_church_calendar":false},
  {"id":"evt-034","fecha":"2026-10-16","hora":"","titulo":"Pro Misionero - Cerro","descripcion":"Actividad pro misionera en la zona Cerro.","lugar":"Zona Cerro Pelado, Maldonado","destacado":false,"include_church_calendar":true},
  {"id":"evt-035","fecha":"2026-10-17","hora":"","titulo":"Pro Misionero - Rocha","descripcion":"Actividad pro misionera en Rocha.","lugar":"Ciudad de Rocha","destacado":false,"include_church_calendar":true},
  {"id":"evt-036","fecha":"2026-10-18","hora":"18:30","titulo":"Día del Pastor","descripcion":"Jornada especial de reconocimiento y gratitud por la labor pastoral.","lugar":"Sede Central IEANJESÚS Maldonado","destacado":false,"include_church_calendar":true},
  {"id":"evt-037","fecha":"2026-10-18","hora":"18:30","titulo":"Actividad económica del Comité de Música","descripcion":"Actividad económica organizada por el Comité de Música.","lugar":"Sede Central IEANJESÚS Maldonado","destacado":false,"include_church_calendar":true},
  {"id":"evt-038","fecha":"2026-10-18","hora":"18:30","titulo":"Culto dirigido por la Célula #2","descripcion":"Culto dominical dirigido por la Célula #2.","lugar":"Sede Central IEANJESÚS Maldonado","destacado":false,"include_church_calendar":false},
  {"id":"evt-039","fecha":"2026-10-20","hora":"","titulo":"Pro Misionero - Milagrosa","descripcion":"Actividad pro misionera en la zona Milagrosa.","lugar":"Zona La Milagrosa, Maldonado","destacado":false,"include_church_calendar":true},
  {"id":"evt-040","fecha":"2026-10-22","hora":"19:30","titulo":"Culto dirigido por el Comité de Damas Dorcas","descripcion":"Reunión general de la iglesia dirigida por el Comité de Damas Dorcas.","lugar":"Sede Central IEANJESÚS Maldonado","destacado":false,"include_church_calendar":false},
  {"id":"evt-041","fecha":"2026-10-23","hora":"","titulo":"Pro Misionero - Maldonado Nuevo","descripcion":"Actividad pro misionera en Maldonado Nuevo.","lugar":"Zona Maldonado Nuevo, Maldonado","destacado":false,"include_church_calendar":true},
  {"id":"evt-042","fecha":"2026-10-24","hora":"","titulo":"Reunión de Jóvenes","descripcion":"Encuentro del Comité de Jóvenes para compartir y crecer en la fe.","lugar":"Sede Central IEANJESÚS Maldonado","destacado":false,"include_church_calendar":true},
  {"id":"evt-043","fecha":"2026-10-25","hora":"18:30","titulo":"Culto Misionero Juvenil","descripcion":"Culto misionero especial organizado por el Comité de Jóvenes.","lugar":"Sede Central IEANJESÚS Maldonado","destacado":false,"include_church_calendar":true},
  {"id":"evt-044","fecha":"2026-10-25","hora":"18:30","titulo":"Culto dirigido por el Comité de Jóvenes","descripcion":"Culto dominical dirigido por el Comité de Jóvenes.","lugar":"Sede Central IEANJESÚS Maldonado","destacado":false,"include_church_calendar":false},
  {"id":"evt-045","fecha":"2026-10-29","hora":"19:30","titulo":"Culto dirigido por el Comité de Caballeros","descripcion":"Reunión general de la iglesia dirigida por el Comité de Caballeros.","lugar":"Sede Central IEANJESÚS Maldonado","destacado":false,"include_church_calendar":false},
  {"id":"evt-046","fecha":"2026-10-31","hora":"","titulo":"Ayuno - Día 1","descripcion":"Primera jornada del ayuno de dos días.","lugar":"Sede Central IEANJESÚS Maldonado","destacado":false,"include_church_calendar":true},
  {"id":"evt-047","fecha":"2026-11-01","hora":"","titulo":"Ayuno - Día 2","descripcion":"Segunda jornada del ayuno de dos días.","lugar":"Sede Central IEANJESÚS Maldonado","destacado":false,"include_church_calendar":true},
  {"id":"evt-048","fecha":"2026-11-01","hora":"10:00","titulo":"Santa Cena","descripcion":"Celebración de la Santa Cena con la congregación.","lugar":"Sede Central IEANJESÚS Maldonado","destacado":false,"include_church_calendar":true},
  {"id":"evt-049","fecha":"2026-11-01","hora":"18:30","titulo":"Culto normal","descripcion":"Culto dominical de la iglesia.","lugar":"Sede Central IEANJESÚS Maldonado","destacado":false,"include_church_calendar":false},
  {"id":"evt-050","fecha":"2026-11-05","hora":"19:30","titulo":"Culto dirigido por el Comité de Damas Dorcas","descripcion":"Reunión general de la iglesia dirigida por el Comité de Damas Dorcas.","lugar":"Sede Central IEANJESÚS Maldonado","destacado":false,"include_church_calendar":false},
  {"id":"evt-051","fecha":"2026-11-08","hora":"18:30","titulo":"Encuentro de Células","descripcion":"Encuentro especial de las células de la iglesia.","lugar":"Sede Central IEANJESÚS Maldonado","destacado":false,"include_church_calendar":true},
  {"id":"evt-052","fecha":"2026-11-08","hora":"18:30","titulo":"Culto dirigido por las Células #1 y #4","descripcion":"Culto dominical dirigido por las Células #1 y #4.","lugar":"Sede Central IEANJESÚS Maldonado","destacado":false,"include_church_calendar":false},
  {"id":"evt-053","fecha":"2026-11-09 a 2026-11-15","hora":"","titulo":"No hay Célula","descripcion":"Durante este período no se realizarán reuniones de Célula.","lugar":"Sede Central IEANJESÚS Maldonado","destacado":false,"include_church_calendar":false},
  {"id":"evt-054","fecha":"2026-11-12","hora":"19:30","titulo":"Culto dirigido por el Comité de Damas Dorcas","descripcion":"Reunión general de la iglesia dirigida por el Comité de Damas Dorcas.","lugar":"Sede Central IEANJESÚS Maldonado","destacado":false,"include_church_calendar":false},
  {"id":"evt-055","fecha":"2026-11-15","hora":"18:30","titulo":"Actividad económica del Comité de Obra Social","descripcion":"Actividad económica organizada por el Comité de Obra Social.","lugar":"Sede Central IEANJESÚS Maldonado","destacado":false,"include_church_calendar":true},
  {"id":"evt-056","fecha":"2026-11-15","hora":"18:30","titulo":"Culto dirigido por el Comité de Música","descripcion":"Culto dominical dirigido por el Comité de Música.","lugar":"Sede Central IEANJESÚS Maldonado","destacado":false,"include_church_calendar":false},
  {"id":"evt-057","fecha":"2026-11-19","hora":"19:30","titulo":"Culto dirigido por el Comité de Damas Dorcas","descripcion":"Reunión general de la iglesia dirigida por el Comité de Damas Dorcas.","lugar":"Sede Central IEANJESÚS Maldonado","destacado":false,"include_church_calendar":false},
  {"id":"evt-058","fecha":"2026-11-21","hora":"","titulo":"Reunión de Jóvenes","descripcion":"Encuentro del Comité de Jóvenes para compartir y crecer en la fe.","lugar":"Sede Central IEANJESÚS Maldonado","destacado":false,"include_church_calendar":true},
  {"id":"evt-059","fecha":"2026-11-22","hora":"18:30","titulo":"Aniversario de la Iglesia","descripcion":"Celebración especial por el aniversario de IEANJESÚS Maldonado.","lugar":"Sede Central IEANJESÚS Maldonado","destacado":true,"include_church_calendar":true},
  {"id":"evt-060","fecha":"2026-11-22","hora":"18:30","titulo":"Culto dirigido por la Junta Local","descripcion":"Culto dominical dirigido por la Junta Local.","lugar":"Sede Central IEANJESÚS Maldonado","destacado":false,"include_church_calendar":false},
  {"id":"evt-061","fecha":"2026-11-26","hora":"19:30","titulo":"Culto dirigido por el Comité de Caballeros","descripcion":"Reunión general de la iglesia dirigida por el Comité de Caballeros.","lugar":"Sede Central IEANJESÚS Maldonado","destacado":false,"include_church_calendar":false},
  {"id":"evt-062","fecha":"2026-11-29","hora":"18:30","titulo":"Culto dirigido por la Célula #3","descripcion":"Culto dominical dirigido por la Célula #3.","lugar":"Sede Central IEANJESÚS Maldonado","destacado":false,"include_church_calendar":false},
  {"id":"evt-063","fecha":"2026-12-03","hora":"19:30","titulo":"Culto dirigido por el Comité de Damas Dorcas","descripcion":"Reunión general de la iglesia dirigida por el Comité de Damas Dorcas.","lugar":"Sede Central IEANJESÚS Maldonado","destacado":false,"include_church_calendar":false},
  {"id":"evt-064","fecha":"2026-12-05","hora":"","titulo":"Convención UY - Día 1","descripcion":"Primera jornada de la Convención UY.","lugar":"Convención Nacional UY","destacado":true,"include_church_calendar":true},
  {"id":"evt-065","fecha":"2026-12-06","hora":"","titulo":"Convención UY - Día 2","descripcion":"Segunda jornada de la Convención UY.","lugar":"Convención Nacional UY","destacado":true,"include_church_calendar":true},
  {"id":"evt-066","fecha":"2026-12-10","hora":"19:30","titulo":"Culto dirigido por el Comité de Damas Dorcas","descripcion":"Reunión general de la iglesia dirigida por el Comité de Damas Dorcas.","lugar":"Sede Central IEANJESÚS Maldonado","destacado":false,"include_church_calendar":false},
  {"id":"evt-067","fecha":"2026-12-13","hora":"18:30","titulo":"Culto dirigido por el Comité de Obra Social","descripcion":"Culto dominical dirigido por el Comité de Obra Social.","lugar":"Sede Central IEANJESÚS Maldonado","destacado":false,"include_church_calendar":false},
  {"id":"evt-068","fecha":"2026-12-17","hora":"19:30","titulo":"Culto dirigido por el Comité de Caballeros","descripcion":"Reunión general de la iglesia dirigida por el Comité de Caballeros.","lugar":"Sede Central IEANJESÚS Maldonado","destacado":false,"include_church_calendar":false},
  {"id":"evt-069","fecha":"2026-12-19","hora":"","titulo":"Reunión de Jóvenes","descripcion":"Encuentro del Comité de Jóvenes para compartir y crecer en la fe.","lugar":"Sede Central IEANJESÚS Maldonado","destacado":false,"include_church_calendar":true},
  {"id":"evt-070","fecha":"2026-12-20","hora":"18:30","titulo":"Reunión de Hermanos","descripcion":"Reunión especial de los hermanos de la iglesia.","lugar":"Sede Central IEANJESÚS Maldonado","destacado":false,"include_church_calendar":true},
  {"id":"evt-071","fecha":"2026-12-20","hora":"18:30","titulo":"Fin de Año - DED","descripcion":"Actividad especial de fin de año de DED.","lugar":"Sede Central IEANJESÚS Maldonado","destacado":false,"include_church_calendar":true},
  {"id":"evt-072","fecha":"2026-12-20","hora":"18:30","titulo":"Actividad económica de la Junta Local","descripcion":"Actividad económica organizada por la Junta Local.","lugar":"Sede Central IEANJESÚS Maldonado","destacado":false,"include_church_calendar":true},
  {"id":"evt-073","fecha":"2026-12-20","hora":"18:30","titulo":"Culto dirigido por la Junta Local","descripcion":"Culto dominical dirigido por la Junta Local.","lugar":"Sede Central IEANJESÚS Maldonado","destacado":false,"include_church_calendar":false},
  {"id":"evt-074","fecha":"2026-12-27","hora":"18:30","titulo":"Encuentro de Células","descripcion":"Encuentro especial de las células de la iglesia.","lugar":"Sede Central IEANJESÚS Maldonado","destacado":false,"include_church_calendar":true},
  {"id":"evt-075","fecha":"2026-12-27","hora":"18:30","titulo":"Clausura del Año","descripcion":"Celebración de cierre de las actividades del año.","lugar":"Sede Central IEANJESÚS Maldonado","destacado":false,"include_church_calendar":true},
  {"id":"evt-076","fecha":"2026-12-27","hora":"18:30","titulo":"Culto dirigido por las Células #3 y #5","descripcion":"Culto dominical dirigido por las Células #3 y #5.","lugar":"Sede Central IEANJESÚS Maldonado","destacado":false,"include_church_calendar":false},
  {"id":"evt-077","fecha":"2026-12-30","hora":"","titulo":"Año Nuevo","descripcion":"Primera jornada de las actividades de Año Nuevo.","lugar":"Sede Central IEANJESÚS Maldonado","destacado":false,"include_church_calendar":true},
  {"id":"evt-078","fecha":"2026-12-31","hora":"","titulo":"Año Nuevo","descripcion":"Segunda jornada de las actividades de Año Nuevo.","lugar":"Sede Central IEANJESÚS Maldonado","destacado":false,"include_church_calendar":true}
];

function escapeICS(str) {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

function getNextDayStr(dateStr) {
  const parts = dateStr.split('-');
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) - 1;
  const d = parseInt(parts[2], 10);
  const next = new Date(Date.UTC(y, m, d + 1));
  const ny = next.getUTCFullYear();
  const nm = String(next.getUTCMonth() + 1).padStart(2, '0');
  const nd = String(next.getUTCDate()).padStart(2, '0');
  return `${ny}${nm}${nd}`;
}

function formatDates(dateStr, timeStr) {
  if (dateStr.includes(' a ')) {
    const parts = dateStr.split(' a ');
    const start = parts[0].trim().replace(/-/g, '');
    const endPlus = getNextDayStr(parts[1].trim());
    return {
      dtstart: `DTSTART;VALUE=DATE:${start}`,
      dtend: `DTEND;VALUE=DATE:${endPlus}`
    };
  }

  const cleanDate = dateStr.trim().replace(/-/g, '');
  if (!timeStr || !timeStr.trim()) {
    const nextDay = getNextDayStr(dateStr.trim());
    return {
      dtstart: `DTSTART;VALUE=DATE:${cleanDate}`,
      dtend: `DTEND;VALUE=DATE:${nextDay}`
    };
  }

  const match = timeStr.match(/(\d{1,2}):(\d{2})/);
  if (!match) {
    const nextDay = getNextDayStr(dateStr.trim());
    return {
      dtstart: `DTSTART;VALUE=DATE:${cleanDate}`,
      dtend: `DTEND;VALUE=DATE:${nextDay}`
    };
  }

  const hh = match[1].padStart(2, '0');
  const mm = match[2];
  const dtstart = `DTSTART;TZID=America/Montevideo:${cleanDate}T${hh}${mm}00`;

  let endH = parseInt(hh, 10) + 1;
  let endM = parseInt(mm, 10) + 30;
  if (endM >= 60) {
    endH += 1;
    endM -= 60;
  }
  const endHh = String(endH).padStart(2, '0');
  const endMm = String(endM).padStart(2, '0');
  const dtend = `DTEND;TZID=America/Montevideo:${cleanDate}T${endHh}${endMm}00`;

  return { dtstart, dtend };
}

function generateICS(events) {
  const now = new Date();
  const stamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  let lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//IEANJESUS Maldonado//Calendario Completo//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:IEANJESÚS Maldonado — Calendario Completo',
    'X-WR-CALDESC:Programación integral de IEANJESÚS Maldonado: cultos, comités, actividades y células.',
    'X-WR-TIMEZONE:America/Montevideo',
    'BEGIN:VTIMEZONE',
    'TZID:America/Montevideo',
    'X-LIC-LOCATION:America/Montevideo',
    'BEGIN:STANDARD',
    'TZOFFSETFROM:-0300',
    'TZOFFSETTO:-0300',
    'TZNAME:-03',
    'DTSTART:19700101T000000',
    'END:STANDARD',
    'END:VTIMEZONE'
  ];

  events.forEach(e => {
    const dates = formatDates(e.date || e.fecha, e.time || e.hora);
    const summary = escapeICS(e.title || e.titulo);
    const desc = escapeICS(e.description || e.descripcion);
    const loc = escapeICS(e.location || e.lugar || 'Sede Central IEANJESÚS Maldonado');
    const uid = `${e.id || 'evt-' + Math.random().toString(36).substr(2, 9)}@ieanjesusmaldonado.org`;

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${uid}`);
    lines.push(`DTSTAMP:${stamp}`);
    lines.push(dates.dtstart);
    lines.push(dates.dtend);
    lines.push(`SUMMARY:${summary}`);
    if (desc) lines.push(`DESCRIPTION:${desc}`);
    if (loc) lines.push(`LOCATION:${loc}`);
    lines.push('STATUS:CONFIRMED');
    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n') + '\r\n';
}

exports.handler = async (event, context) => {
  let events = [];

  try {
    const fetchFn = typeof fetch === 'function' ? fetch : globalThis.fetch;
    if (fetchFn) {
      const url = `${SUPABASE_PROJECT_URL}/rest/v1/events?select=*&order=date.asc`;
      const res = await fetchFn(url, {
        headers: {
          'apikey': SUPABASE_PUBLISHABLE_KEY,
          'Authorization': `Bearer ${SUPABASE_PUBLISHABLE_KEY}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          events = data.filter(e => e.public !== false);
        }
      }
    }
  } catch (err) {
    console.warn('Usando dataset de contingencia para Calendario Completo:', err.message);
  }

  if (events.length === 0) {
    events = FALLBACK_EVENTS;
  }

  const icsBody = generateICS(events);

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'inline; filename="calendario-completo.ics"',
      'Cache-Control': 'public, max-age=1800',
      'Access-Control-Allow-Origin': '*'
    },
    body: icsBody
  };
};
