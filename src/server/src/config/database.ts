import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Ruta a la base de datos
const dbPath = process.env.DB_PATH || path.join(__dirname, '../../../database/timetracker.db');

// Asegurar que el directorio existe
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Crear conexión a la base de datos
const db = new Database(dbPath, { verbose: console.log });

// Habilitar foreign keys
db.pragma('foreign_keys = ON');

// Crear las tablas si no existen
export function initializeDatabase() {
  console.log('🔧 Inicializando base de datos...');

  // Tabla de usuarios
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'leader', 'developer')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Tabla de clientes
  db.exec(`
    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Tabla de proyectos
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      client_id INTEGER NOT NULL,
      leader_id INTEGER NOT NULL,
      tasks TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
      FOREIGN KEY (leader_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Tabla de plantillas
  db.exec(`
    CREATE TABLE IF NOT EXISTS templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      tasks TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Tabla de registros de tiempo
  db.exec(`
    CREATE TABLE IF NOT EXISTS time_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      project_id INTEGER NOT NULL,
      task_name TEXT NOT NULL,
      date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      hours REAL NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );
  `);

  // Crear índices para mejorar el rendimiento
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_projects_client ON projects(client_id);
    CREATE INDEX IF NOT EXISTS idx_projects_leader ON projects(leader_id);
    CREATE INDEX IF NOT EXISTS idx_time_entries_user ON time_entries(user_id);
    CREATE INDEX IF NOT EXISTS idx_time_entries_project ON time_entries(project_id);
    CREATE INDEX IF NOT EXISTS idx_time_entries_date ON time_entries(date);
  `);

  console.log('✅ Base de datos inicializada correctamente');
}

// Función para insertar datos iniciales
export function seedDatabase() {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  
  if (userCount.count > 0) {
    console.log('ℹ️ La base de datos ya tiene datos, saltando seed...');
    return;
  }

  console.log('🌱 Insertando datos iniciales...');

  // Usuarios de prueba
  const insertUser = db.prepare(`
    INSERT INTO users (name, email, password, role) 
    VALUES (?, ?, ?, ?)
  `);

  insertUser.run('Admin User', 'admin@timetracker.com', 'admin123', 'admin');
  insertUser.run('Maria Garcia', 'maria@timetracker.com', 'leader123', 'leader');
  insertUser.run('Carlos Lopez', 'carlos@timetracker.com', 'dev123', 'developer');
  insertUser.run('Ana Martinez', 'ana@timetracker.com', 'dev123', 'developer');
  insertUser.run('Juan Perez', 'juan@timetracker.com', 'leader123', 'leader');

  // Clientes
  const insertClient = db.prepare(`
    INSERT INTO clients (name, description) 
    VALUES (?, ?)
  `);

  insertClient.run('Tech Solutions Inc.', 'Empresa de soluciones tecnológicas');
  insertClient.run('Digital Marketing Co.', 'Agencia de marketing digital');
  insertClient.run('Finance Corp', 'Servicios financieros corporativos');

  // Proyectos
  const insertProject = db.prepare(`
    INSERT INTO projects (name, client_id, leader_id, tasks) 
    VALUES (?, ?, ?, ?)
  `);

  insertProject.run('Desarrollo Web Portal', 1, 2, 'Frontend,Backend,Testing,Documentación');
  insertProject.run('Campaña Digital Q1', 2, 5, 'Diseño,Contenido,Análisis,Reportes');
  insertProject.run('App Mobile Banking', 3, 2, 'UI/UX,Desarrollo,Testing,Deployment');

  // Plantillas
  const insertTemplate = db.prepare(`
    INSERT INTO templates (name, description, tasks) 
    VALUES (?, ?, ?)
  `);

  insertTemplate.run(
    'Proyecto Web Standard',
    'Plantilla para proyectos web típicos',
    'Frontend,Backend,Testing,Documentación,Deployment'
  );
  insertTemplate.run(
    'Campaña Marketing',
    'Plantilla para campañas de marketing',
    'Investigación,Diseño,Contenido,Análisis,Reportes'
  );
  insertTemplate.run(
    'Desarrollo Mobile',
    'Plantilla para apps móviles',
    'UI/UX,Desarrollo iOS,Desarrollo Android,Testing,Publicación'
  );

  // Registros de tiempo de ejemplo
  const insertTimeEntry = db.prepare(`
    INSERT INTO time_entries (user_id, project_id, task_name, date, start_time, end_time, hours, description) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const today = new Date();
  for (let i = 0; i < 15; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const hours = Math.floor(Math.random() * 9) + 1;
    const startHour = 9 + Math.floor(Math.random() * 3);
    const endHour = startHour + hours;

    insertTimeEntry.run(
      3, 1, 'Frontend', dateStr,
      `${startHour}:00`, `${endHour}:00`, hours,
      'Desarrollo de componentes React'
    );

    insertTimeEntry.run(
      4, 2, 'Diseño', dateStr,
      `${startHour}:00`, `${endHour}:00`, hours,
      'Diseño de interfaces'
    );
  }

  console.log('✅ Datos iniciales insertados correctamente');
}

export default db;
