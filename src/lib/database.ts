import { openDB, DBSchema, IDBPDatabase } from 'idb';

// Definir el esquema de la base de datos
interface TimeTrackerDB extends DBSchema {
  users: {
    key: number;
    value: {
      id?: number;
      name: string;
      email: string;
      password: string;
      role: 'admin' | 'leader' | 'developer';
    };
    indexes: { 'by-email': string };
  };
  clients: {
    key: number;
    value: {
      id?: number;
      name: string;
      description: string;
    };
  };
  projects: {
    key: number;
    value: {
      id?: number;
      name: string;
      clientId: number;
      leaderId: number;
      tasks: string;
      clientName?: string;
      leaderName?: string;
    };
  };
  templates: {
    key: number;
    value: {
      id?: number;
      name: string;
      description: string;
      tasks: string;
    };
  };
  time_entries: {
    key: number;
    value: {
      id?: number;
      userId: number;
      projectId: number;
      taskName: string;
      date: string;
      startTime: string;
      endTime: string;
      hours: number;
      description: string;
      userName?: string;
      projectName?: string;
    };
    indexes: { 
      'by-user': number;
      'by-project': number;
      'by-date': string;
    };
  };
}

let db: IDBPDatabase<TimeTrackerDB> | null = null;

// Inicializar la base de datos
export async function initDatabase(): Promise<IDBPDatabase<TimeTrackerDB>> {
  if (db) return db;

  db = await openDB<TimeTrackerDB>('timetracker', 1, {
    upgrade(db) {
      // Tabla de usuarios
      if (!db.objectStoreNames.contains('users')) {
        const userStore = db.createObjectStore('users', { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        userStore.createIndex('by-email', 'email', { unique: true });
      }

      // Tabla de clientes
      if (!db.objectStoreNames.contains('clients')) {
        db.createObjectStore('clients', { 
          keyPath: 'id', 
          autoIncrement: true 
        });
      }

      // Tabla de proyectos
      if (!db.objectStoreNames.contains('projects')) {
        db.createObjectStore('projects', { 
          keyPath: 'id', 
          autoIncrement: true 
        });
      }

      // Tabla de plantillas
      if (!db.objectStoreNames.contains('templates')) {
        db.createObjectStore('templates', { 
          keyPath: 'id', 
          autoIncrement: true 
        });
      }

      // Tabla de registros de tiempo
      if (!db.objectStoreNames.contains('time_entries')) {
        const timeStore = db.createObjectStore('time_entries', { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        timeStore.createIndex('by-user', 'userId');
        timeStore.createIndex('by-project', 'projectId');
        timeStore.createIndex('by-date', 'date');
      }
    }
  });

  // Verificar si ya hay datos, si no, insertar datos iniciales
  const userCount = await db.count('users');
  if (userCount === 0) {
    await seedInitialData();
  }

  return db;
}

// Insertar datos iniciales
async function seedInitialData() {
  if (!db) return;

  try {
    // Usuarios iniciales
    await db.add('users', {
      name: 'Admin User',
      email: 'admin@timetracker.com',
      password: 'admin123',
      role: 'admin'
    });

    await db.add('users', {
      name: 'Maria Garcia',
      email: 'maria@timetracker.com',
      password: 'leader123',
      role: 'leader'
    });

    await db.add('users', {
      name: 'Carlos Lopez',
      email: 'carlos@timetracker.com',
      password: 'dev123',
      role: 'developer'
    });

    await db.add('users', {
      name: 'Ana Martinez',
      email: 'ana@timetracker.com',
      password: 'dev123',
      role: 'developer'
    });

    await db.add('users', {
      name: 'Juan Perez',
      email: 'juan@timetracker.com',
      password: 'leader123',
      role: 'leader'
    });

    // Clientes iniciales
    await db.add('clients', {
      name: 'Tech Solutions Inc.',
      description: 'Empresa de soluciones tecnológicas'
    });

    await db.add('clients', {
      name: 'Digital Marketing Co.',
      description: 'Agencia de marketing digital'
    });

    await db.add('clients', {
      name: 'Finance Corp',
      description: 'Servicios financieros corporativos'
    });

    // Proyectos iniciales
    await db.add('projects', {
      name: 'Desarrollo Web Portal',
      clientId: 1,
      leaderId: 2,
      tasks: 'Frontend,Backend,Testing,Documentación'
    });

    await db.add('projects', {
      name: 'Campaña Digital Q1',
      clientId: 2,
      leaderId: 5,
      tasks: 'Diseño,Contenido,Análisis,Reportes'
    });

    await db.add('projects', {
      name: 'App Mobile Banking',
      clientId: 3,
      leaderId: 2,
      tasks: 'UI/UX,Desarrollo,Testing,Deployment'
    });

    // Plantillas iniciales
    await db.add('templates', {
      name: 'Proyecto Web Standard',
      description: 'Plantilla para proyectos web típicos',
      tasks: 'Frontend,Backend,Testing,Documentación,Deployment'
    });

    await db.add('templates', {
      name: 'Campaña Marketing',
      description: 'Plantilla para campañas de marketing',
      tasks: 'Investigación,Diseño,Contenido,Análisis,Reportes'
    });

    await db.add('templates', {
      name: 'Desarrollo Mobile',
      description: 'Plantilla para apps móviles',
      tasks: 'UI/UX,Desarrollo iOS,Desarrollo Android,Testing,Publicación'
    });

    // Entradas de tiempo de ejemplo
    const today = new Date();
    const dates: string[] = [];
    
    // Generar fechas para el mes actual
    for (let i = 0; i < 15; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }

    // Insertar registros de tiempo para desarrolladores
    for (const date of dates) {
      const hours = Math.floor(Math.random() * 9) + 1; // 1-9 horas
      const startHour = 9 + Math.floor(Math.random() * 3); // 9-11 AM
      const endHour = startHour + hours;
      
      await db.add('time_entries', {
        userId: 3,
        projectId: 1,
        taskName: 'Frontend',
        date: date,
        startTime: `${startHour}:00`,
        endTime: `${endHour}:00`,
        hours: hours,
        description: 'Desarrollo de componentes React'
      });

      await db.add('time_entries', {
        userId: 4,
        projectId: 2,
        taskName: 'Diseño',
        date: date,
        startTime: `${startHour}:00`,
        endTime: `${endHour}:00`,
        hours: hours,
        description: 'Diseño de interfaces'
      });
    }
  } catch (error) {
    console.error('Error seeding initial data:', error);
  }
}

// Operaciones de Usuario
export async function getUsers() {
  const database = await initDatabase();
  return await database.getAll('users');
}

export async function getUserByEmail(email: string) {
  const database = await initDatabase();
  const tx = database.transaction('users', 'readonly');
  const index = tx.store.index('by-email');
  return await index.get(email);
}

export async function createUser(user: { 
  name: string; 
  email: string; 
  password: string; 
  role: string 
}) {
  const database = await initDatabase();
  return await database.add('users', {
    ...user,
    role: user.role as 'admin' | 'leader' | 'developer'
  });
}

export async function updateUser(id: number, user: { 
  name: string; 
  email: string; 
  role: string 
}) {
  const database = await initDatabase();
  const existingUser = await database.get('users', id);
  if (!existingUser) throw new Error('Usuario no encontrado');
  
  await database.put('users', {
    ...existingUser,
    ...user,
    id,
    role: user.role as 'admin' | 'leader' | 'developer'
  });
}

export async function deleteUser(id: number) {
  const database = await initDatabase();
  await database.delete('users', id);
}

// Operaciones de Cliente
export async function getClients() {
  const database = await initDatabase();
  return await database.getAll('clients');
}

export async function createClient(client: { name: string; description: string }) {
  const database = await initDatabase();
  return await database.add('clients', client);
}

export async function updateClient(id: number, client: { name: string; description: string }) {
  const database = await initDatabase();
  await database.put('clients', { ...client, id });
}

export async function deleteClient(id: number) {
  const database = await initDatabase();
  await database.delete('clients', id);
}

// Operaciones de Proyecto
export async function getProjects() {
  const database = await initDatabase();
  const projects = await database.getAll('projects');
  const clients = await database.getAll('clients');
  const users = await database.getAll('users');
  
  // Agregar nombres de clientes y líderes
  return projects.map(project => {
    const client = clients.find(c => c.id === project.clientId);
    const leader = users.find(u => u.id === project.leaderId);
    return {
      ...project,
      clientName: client?.name || '',
      leaderName: leader?.name || ''
    };
  });
}

export async function getProjectsByLeader(leaderId: number) {
  const database = await initDatabase();
  const allProjects = await getProjects();
  return allProjects.filter(p => p.leaderId === leaderId);
}

export async function createProject(project: { 
  name: string; 
  clientId: number; 
  leaderId: number; 
  tasks?: string 
}) {
  const database = await initDatabase();
  return await database.add('projects', {
    name: project.name,
    clientId: project.clientId,
    leaderId: project.leaderId,
    tasks: project.tasks || ''
  });
}

export async function updateProject(id: number, project: { 
  name: string; 
  clientId: number; 
  leaderId: number; 
  tasks?: string 
}) {
  const database = await initDatabase();
  await database.put('projects', {
    id,
    name: project.name,
    clientId: project.clientId,
    leaderId: project.leaderId,
    tasks: project.tasks || ''
  });
}

export async function deleteProject(id: number) {
  const database = await initDatabase();
  await database.delete('projects', id);
}

// Operaciones de Plantilla
export async function getTemplates() {
  const database = await initDatabase();
  return await database.getAll('templates');
}

export async function createTemplate(template: { 
  name: string; 
  description: string; 
  tasks: string 
}) {
  const database = await initDatabase();
  return await database.add('templates', template);
}

export async function updateTemplate(id: number, template: { 
  name: string; 
  description: string; 
  tasks: string 
}) {
  const database = await initDatabase();
  await database.put('templates', { ...template, id });
}

export async function deleteTemplate(id: number) {
  const database = await initDatabase();
  await database.delete('templates', id);
}

// Operaciones de Registro de Tiempo
export async function getTimeEntries() {
  const database = await initDatabase();
  const entries = await database.getAll('time_entries');
  const users = await database.getAll('users');
  const projects = await database.getAll('projects');
  
  // Agregar nombres de usuarios y proyectos
  return entries
    .map(entry => {
      const user = users.find(u => u.id === entry.userId);
      const project = projects.find(p => p.id === entry.projectId);
      return {
        ...entry,
        userName: user?.name || '',
        projectName: project?.name || ''
      };
    })
    .sort((a, b) => {
      // Ordenar por fecha desc, luego por hora desc
      const dateCompare = b.date.localeCompare(a.date);
      if (dateCompare !== 0) return dateCompare;
      return b.startTime.localeCompare(a.startTime);
    });
}

export async function getTimeEntriesByUser(userId: number) {
  const database = await initDatabase();
  const tx = database.transaction('time_entries', 'readonly');
  const index = tx.store.index('by-user');
  const entries = await index.getAll(userId);
  
  const users = await database.getAll('users');
  const projects = await database.getAll('projects');
  
  return entries
    .map(entry => {
      const user = users.find(u => u.id === entry.userId);
      const project = projects.find(p => p.id === entry.projectId);
      return {
        ...entry,
        userName: user?.name || '',
        projectName: project?.name || ''
      };
    })
    .sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date);
      if (dateCompare !== 0) return dateCompare;
      return b.startTime.localeCompare(a.startTime);
    });
}

export async function getTimeEntriesByProject(projectId: number) {
  const database = await initDatabase();
  const tx = database.transaction('time_entries', 'readonly');
  const index = tx.store.index('by-project');
  const entries = await index.getAll(projectId);
  
  const users = await database.getAll('users');
  const projects = await database.getAll('projects');
  
  return entries
    .map(entry => {
      const user = users.find(u => u.id === entry.userId);
      const project = projects.find(p => p.id === entry.projectId);
      return {
        ...entry,
        userName: user?.name || '',
        projectName: project?.name || ''
      };
    })
    .sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date);
      if (dateCompare !== 0) return dateCompare;
      return b.startTime.localeCompare(a.startTime);
    });
}

export async function getTimeEntriesByDateRange(startDate: string, endDate: string) {
  const database = await initDatabase();
  const allEntries = await getTimeEntries();
  
  return allEntries.filter(entry => 
    entry.date >= startDate && entry.date <= endDate
  );
}

export async function createTimeEntry(entry: {
  userId: number;
  projectId: number;
  taskName: string;
  date: string;
  startTime: string;
  endTime: string;
  hours: number;
  description: string;
}) {
  const database = await initDatabase();
  return await database.add('time_entries', entry);
}

export async function updateTimeEntry(id: number, entry: {
  projectId: number;
  taskName: string;
  date: string;
  startTime: string;
  endTime: string;
  hours: number;
  description: string;
}) {
  const database = await initDatabase();
  const existingEntry = await database.get('time_entries', id);
  if (!existingEntry) throw new Error('Registro no encontrado');
  
  await database.put('time_entries', {
    ...existingEntry,
    ...entry,
    id
  });
}

export async function deleteTimeEntry(id: number) {
  const database = await initDatabase();
  await database.delete('time_entries', id);
}

// Función para resetear la base de datos (útil para desarrollo)
export async function resetDatabase() {
  if (db) {
    db.close();
    db = null;
  }
  
  // Eliminar la base de datos
  await new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase('timetracker');
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
  
  // Reinicializar
  await initDatabase();
}

// Exportar la base de datos como JSON
export async function exportDatabase() {
  const database = await initDatabase();
  
  const data = {
    users: await database.getAll('users'),
    clients: await database.getAll('clients'),
    projects: await database.getAll('projects'),
    templates: await database.getAll('templates'),
    time_entries: await database.getAll('time_entries')
  };
  
  const json = JSON.stringify(data, null, 2);
  return new Blob([json], { type: 'application/json' });
}

// Importar base de datos desde JSON
export async function importDatabase(file: File) {
  return new Promise<void>((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const json = e.target?.result as string;
        const data = JSON.parse(json);
        
        // Resetear la base de datos
        await resetDatabase();
        const database = await initDatabase();
        
        // Importar usuarios
        if (data.users) {
          for (const user of data.users) {
            const { id, ...userData } = user;
            await database.add('users', userData);
          }
        }
        
        // Importar clientes
        if (data.clients) {
          for (const client of data.clients) {
            const { id, ...clientData } = client;
            await database.add('clients', clientData);
          }
        }
        
        // Importar proyectos
        if (data.projects) {
          for (const project of data.projects) {
            const { id, clientName, leaderName, ...projectData } = project;
            await database.add('projects', projectData);
          }
        }
        
        // Importar plantillas
        if (data.templates) {
          for (const template of data.templates) {
            const { id, ...templateData } = template;
            await database.add('templates', templateData);
          }
        }
        
        // Importar registros de tiempo
        if (data.time_entries) {
          for (const entry of data.time_entries) {
            const { id, userName, projectName, ...entryData } = entry;
            await database.add('time_entries', entryData);
          }
        }
        
        resolve();
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

// Función auxiliar para guardar la base de datos (para compatibilidad con código anterior)
export function saveDatabase() {
  // IndexedDB guarda automáticamente, esta función se mantiene para compatibilidad
  return;
}
