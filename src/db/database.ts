import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

// ============================================================
// SINGLETON + RUTA
// ============================================================

const DB_PATH = path.join(process.cwd(), 'data', 'clouducv.db');

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;

  // Crear directorio data/ si no existe
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  _db = new Database(DB_PATH);
  _db.pragma('journal_mode = WAL');
  _db.pragma('foreign_keys = ON');
  _db.pragma('busy_timeout = 5000');

  // Inicializar schema si no existe
  const tableExists = _db.prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='profiles'"
  ).get();

  if (!tableExists) {
    initSchema(_db);
    seedDatabase(_db);
    console.log('[DB] Base de datos CloudUCV inicializada');
  }

  return _db;
}

// ============================================================
// SCHEMA
// ============================================================

function initSchema(db: Database.Database): void {
  db.exec(`
    -- Usuarios (reemplaza auth.users de Supabase)
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      encrypted_password TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- Perfiles públicos
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT,
      role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
      categorias_favoritas TEXT DEFAULT '[]',
      avatar_url TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Eventos
    CREATE TABLE IF NOT EXISTS eventos (
      id TEXT PRIMARY KEY,
      titulo TEXT NOT NULL,
      categoria TEXT NOT NULL CHECK (categoria IN ('Académicos', 'Culturales', 'Deportivos', 'Comerciales')),
      fecha TEXT NOT NULL,
      hora TEXT NOT NULL,
      descripcion TEXT NOT NULL DEFAULT '',
      asistentes INTEGER NOT NULL DEFAULT 0,
      imagen TEXT NOT NULL,
      avatares TEXT NOT NULL DEFAULT '[]',
      direccion TEXT,
      likes INTEGER NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      user_id TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    -- Likes a eventos
    CREATE TABLE IF NOT EXISTS likes_evento (
      id TEXT PRIMARY KEY,
      evento_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE (evento_id, user_id),
      FOREIGN KEY (evento_id) REFERENCES eventos(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Eventos guardados (bookmarks)
    CREATE TABLE IF NOT EXISTS eventos_guardados (
      id TEXT PRIMARY KEY,
      evento_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE (evento_id, user_id),
      FOREIGN KEY (evento_id) REFERENCES eventos(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Mensajes de evento (comentarios)
    CREATE TABLE IF NOT EXISTS mensajes_evento (
      id TEXT PRIMARY KEY,
      evento_id TEXT NOT NULL,
      remitente_id TEXT NOT NULL,
      contenido TEXT NOT NULL,
      reply_to_id TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (evento_id) REFERENCES eventos(id) ON DELETE CASCADE,
      FOREIGN KEY (remitente_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (reply_to_id) REFERENCES mensajes_evento(id) ON DELETE SET NULL
    );

    -- Likes a mensajes
    CREATE TABLE IF NOT EXISTS likes_mensaje (
      mensaje_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      PRIMARY KEY (mensaje_id, user_id),
      FOREIGN KEY (mensaje_id) REFERENCES mensajes_evento(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Notificaciones
    CREATE TABLE IF NOT EXISTS notificaciones (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      actor_id TEXT,
      evento_id TEXT NOT NULL,
      tipo TEXT NOT NULL,
      leida INTEGER NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (evento_id) REFERENCES eventos(id) ON DELETE CASCADE
    );

    -- Índices
    CREATE INDEX IF NOT EXISTS idx_eventos_created ON eventos(created_at);
    CREATE INDEX IF NOT EXISTS idx_eventos_user ON eventos(user_id);
    CREATE INDEX IF NOT EXISTS idx_eventos_categoria ON eventos(categoria);
    CREATE INDEX IF NOT EXISTS idx_likes_evento_user ON likes_evento(user_id);
    CREATE INDEX IF NOT EXISTS idx_likes_evento_evento ON likes_evento(evento_id);
    CREATE INDEX IF NOT EXISTS idx_guardados_user ON eventos_guardados(user_id);
    CREATE INDEX IF NOT EXISTS idx_guardados_evento ON eventos_guardados(evento_id);
    CREATE INDEX IF NOT EXISTS idx_mensajes_evento ON mensajes_evento(evento_id);
    CREATE INDEX IF NOT EXISTS idx_mensajes_remitente ON mensajes_evento(remitente_id);
    CREATE INDEX IF NOT EXISTS idx_notificaciones_user ON notificaciones(user_id);
    CREATE INDEX IF NOT EXISTS idx_likes_mensaje_msg ON likes_mensaje(mensaje_id);
  `);
}

// ============================================================
// SEED
// ============================================================

function generateId(): string {
  const hex = [...Array(32)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-4${hex.slice(13,16)}-${(8 + Math.floor(Math.random() * 4)).toString(16)}${hex.slice(17,20)}-${hex.slice(20)}`;
}

function seedDatabase(db: Database.Database): void {
  const hash = (pwd: string) => bcrypt.hashSync(pwd, 10);

  db.transaction(() => {
    // ===== Usuarios =====
    const adminId = generateId();
    const userId1 = generateId();
    const userId2 = generateId();
    const userId3 = generateId();

    const insertUser = db.prepare('INSERT INTO users (id, email, encrypted_password) VALUES (?, ?, ?)');
    insertUser.run(adminId, 'admin@ucv.edu.ve', hash('admin123'));
    insertUser.run(userId1, 'maria@ucv.edu.ve', hash('maria123'));
    insertUser.run(userId2, 'carlos@ucv.edu.ve', hash('carlos123'));
    insertUser.run(userId3, 'ana@ucv.edu.ve', hash('ana123'));

    const insertProfile = db.prepare('INSERT INTO profiles (id, username, email, role, categorias_favoritas) VALUES (?, ?, ?, ?, ?)');
    insertProfile.run(adminId, 'admin_ucv', 'admin@ucv.edu.ve', 'admin', '["Académicos","Culturales"]');
    insertProfile.run(userId1, 'maria_garcia', 'maria@ucv.edu.ve', 'user', '["Culturales","Deportivos"]');
    insertProfile.run(userId2, 'carlos_lopez', 'carlos@ucv.edu.ve', 'user', '["Deportivos"]');
    insertProfile.run(userId3, 'ana_martinez', 'ana@ucv.edu.ve', 'user', '["Académicos"]');

    // ===== Eventos de ejemplo =====
    const insertEvento = db.prepare(`
      INSERT INTO eventos (id, titulo, categoria, fecha, hora, descripcion, asistentes, imagen, avatares, direccion, likes, user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const ev1 = generateId();
    const ev2 = generateId();
    const ev3 = generateId();
    const ev4 = generateId();
    const ev5 = generateId();

    insertEvento.run(ev1, 'Congreso de Ingeniería de Software 2026', 'Académicos', '2026-07-15', '9:00 AM',
      'Conferencias sobre las últimas tendencias en desarrollo de software, arquitectura de sistemas y metodologías ágiles. Ponentes internacionales y talleres prácticos.',
      45, 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_8d9b64f4-18b1-4183-8598-a0520a34a4e0.jpg', '["#3B82F6","#06B6D4","#8B5CF6"]', 'Aula Magna, UCV', 12, adminId);

    insertEvento.run(ev2, 'Festival Cultural Universitario', 'Culturales', '2026-07-20', '5:00 PM',
      'Noche de presentaciones artísticas: danza, teatro, música y poesía. ¡Ven a disfrutar del talento ucevista!',
      120, 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_8424ffc3-1547-4313-a45c-92085ea3273a.jpg', '["#D946EF","#A855F7","#FF6B9D"]', 'Plaza del Rectorado', 28, userId1);

    insertEvento.run(ev3, 'Torneo Interfacultades de Fútbol', 'Deportivos', '2026-08-01', '2:00 PM',
      'Gran torneo de fútbol entre las facultades de la UCV. Inscripciones abiertas para equipos de 11 jugadores.',
      200, 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_e25eaacf-0471-4668-aa28-7624012722eb.jpg', '["#10B981","#F59E0B","#34D399"]', 'Estadio UCV', 55, userId2);

    insertEvento.run(ev4, 'Feria de Emprendimiento UCV', 'Comerciales', '2026-08-10', '10:00 AM',
      'Expositores estudiantiles presentan sus startups y proyectos de negocio. Inversionistas y mentores disponibles.',
      80, 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_8d9b64f4-18b1-4183-8598-a0520a34a4e0.jpg', '["#F59E0B","#F97316","#EF4444"]', 'Centro Comercial UCV', 15, userId3);

    insertEvento.run(ev5, 'Taller de Inteligencia Artificial', 'Académicos', '2026-07-25', '3:00 PM',
      'Taller práctico de IA con Python, TensorFlow y modelos de lenguaje. Requisitos: laptop con Python 3.10+.',
      35, 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_8d9b64f4-18b1-4183-8598-a0520a34a4e0.jpg', '["#3B82F6","#06B6D4","#8B5CF6"]', 'Lab. de Computación, Fac. Ingeniería', 8, adminId);

    // ===== Algunos likes de ejemplo =====
    const insertLike = db.prepare('INSERT INTO likes_evento (id, evento_id, user_id) VALUES (?, ?, ?)');
    insertLike.run(generateId(), ev1, userId1);
    insertLike.run(generateId(), ev1, userId2);
    insertLike.run(generateId(), ev2, userId2);
    insertLike.run(generateId(), ev3, userId1);
    insertLike.run(generateId(), ev3, userId3);

    // ===== Algunos guardados =====
    const insertGuardado = db.prepare('INSERT INTO eventos_guardados (id, evento_id, user_id) VALUES (?, ?, ?)');
    insertGuardado.run(generateId(), ev1, userId1);
    insertGuardado.run(generateId(), ev2, userId3);
    insertGuardado.run(generateId(), ev3, userId1);

    // ===== Mensajes de ejemplo =====
    const insertMensaje = db.prepare('INSERT INTO mensajes_evento (id, evento_id, remitente_id, contenido) VALUES (?, ?, ?, ?)');
    const msg1 = generateId();
    insertMensaje.run(msg1, ev1, userId1, '¡Excelente evento! ¿Habrá certificados de asistencia?');
    insertMensaje.run(generateId(), ev1, adminId, 'Sí, se entregarán certificados digitales al finalizar.');
    insertMensaje.run(generateId(), ev2, userId2, '¿Se puede participar como artista?');
    insertMensaje.run(generateId(), ev3, userId3, 'Mi facultad ya tiene equipo inscrito 💪');

    console.log('[Seed] Datos de ejemplo insertados correctamente');
  })();
}

// ============================================================
// HELPERS
// ============================================================

export { generateId };
