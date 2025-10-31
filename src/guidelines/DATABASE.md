# Guía de Base de Datos IndexedDB

## Descripción General

El sistema utiliza **IndexedDB** a través de la librería **idb** para funcionar completamente en el navegador. IndexedDB es una base de datos nativa del navegador con soporte completo para transacciones, índices y almacenamiento persistente.

## Estructura de la Base de Datos

### Almacenes de Objetos (Object Stores)

#### 1. **users**
- `id` (number, autoincrement)
- `name` (string)
- `email` (string, unique - índice)
- `password` (string)
- `role` ('admin' | 'leader' | 'developer')

**Índices:**
- `by-email` → email (unique)

#### 2. **clients**
- `id` (number, autoincrement)
- `name` (string)
- `description` (string)

#### 3. **projects**
- `id` (number, autoincrement)
- `name` (string)
- `clientId` (number)
- `leaderId` (number)
- `tasks` (string) - Lista de tareas separadas por comas

#### 4. **templates**
- `id` (number, autoincrement)
- `name` (string)
- `description` (string)
- `tasks` (string) - Lista de tareas separadas por comas

#### 5. **time_entries**
- `id` (number, autoincrement)
- `userId` (number)
- `projectId` (number)
- `taskName` (string)
- `date` (string - formato: YYYY-MM-DD)
- `startTime` (string - formato: HH:MM)
- `endTime` (string - formato: HH:MM)
- `hours` (number)
- `description` (string)

**Índices:**
- `by-user` → userId
- `by-project` → projectId
- `by-date` → date

## Uso en Componentes

### Importar funciones de base de datos

```typescript
import * as db from '../lib/database';
```

### Usar hooks personalizados

```typescript
import { useUsers, useProjects, useTimeEntries } from '../lib/useDatabase';

function MyComponent() {
  const { users, loading, reload } = useUsers();
  const { projects } = useProjects();
  const { timeEntries } = useTimeEntries(userId); // opcional: filtrar por usuario
  
  // ... tu código
}
```

### Operaciones CRUD

#### Crear
```typescript
// Crear usuario
const userId = await db.createUser({
  name: 'Juan Pérez',
  email: 'juan@empresa.com',
  password: 'password123',
  role: 'developer'
});

// Crear registro de tiempo
const entryId = await db.createTimeEntry({
  userId: 3,
  projectId: 1,
  taskName: 'Frontend',
  date: '2025-01-15',
  startTime: '09:00',
  endTime: '17:00',
  hours: 8,
  description: 'Desarrollo de componentes'
});
```

#### Leer
```typescript
// Obtener todos los usuarios
const users = await db.getUsers();

// Obtener proyectos de un líder
const projects = await db.getProjectsByLeader(leaderId);

// Obtener registros de tiempo por rango de fechas
const entries = await db.getTimeEntriesByDateRange('2025-01-01', '2025-01-31');
```

#### Actualizar
```typescript
// Actualizar proyecto
await db.updateProject(projectId, {
  name: 'Nuevo Nombre',
  clientId: 2,
  leaderId: 3,
  tasks: 'Tarea1,Tarea2,Tarea3'
});
```

#### Eliminar
```typescript
// Eliminar cliente
await db.deleteClient(clientId);
```

## Datos Iniciales

Al crear una nueva base de datos, se insertan automáticamente:

### Usuarios de Prueba
- **Admin**: admin@timetracker.com / admin123
- **Líder**: maria@timetracker.com / leader123
- **Desarrollador**: carlos@timetracker.com / dev123

### 3 Clientes de ejemplo
### 3 Proyectos de ejemplo
### 3 Plantillas de ejemplo
### 30 registros de tiempo de ejemplo

## Gestión de Base de Datos

### Exportar Base de Datos
Los administradores pueden exportar la base de datos completa desde el perfil:
- Ve a **Perfil → Base de Datos**
- Clic en **Exportar DB**
- Se descarga un archivo `.json` con todos los datos

### Importar Base de Datos
Para restaurar desde un respaldo:
- Ve a **Perfil → Base de Datos**
- Selecciona el archivo `.json`
- La aplicación se recargará con los datos importados

### Resetear Base de Datos
Para volver a los datos iniciales:
- Ve a **Perfil → Base de Datos**
- Clic en **Resetear DB**
- Confirma la acción
- Se restaurarán los datos de ejemplo

## Persistencia

- Los datos se guardan automáticamente en **IndexedDB** después de cada operación
- El nombre de la base de datos es: `timetracker`
- Los datos persisten entre sesiones del navegador
- Cada navegador mantiene su propia base de datos local
- IndexedDB no tiene límite estricto de tamaño (generalmente >50MB disponibles)

## Ventajas de IndexedDB

- **Nativo del navegador**: No requiere cargar archivos WASM
- **Alto rendimiento**: Operaciones asíncronas optimizadas
- **Índices eficientes**: Búsquedas rápidas por email, usuario, proyecto, fecha
- **Transacciones**: Garantiza integridad de datos
- **Mayor capacidad**: Sin límite de 10MB como LocalStorage
- **Soporte offline**: Funciona completamente sin conexión

## Consideraciones

- **No es un servidor**: La base de datos es local al navegador
- **Por usuario**: Cada usuario en cada navegador tiene su propia copia
- **Respaldos**: Es recomendable exportar respaldos regularmente
- **Tamaño**: IndexedDB soporta grandes cantidades de datos (>50MB típicamente)
- **Seguridad**: Los datos están en el navegador del usuario, no hay cifrado adicional
- **Multi-usuario**: Para compartir datos entre usuarios, considera migrar a Supabase

## Migración desde SQL.js

El sistema migró de sql.js (SQLite en WASM) a IndexedDB nativo. Los componentes principales ya están actualizados. La API de funciones se mantiene igual para compatibilidad.

### Antes (sql.js)
```typescript
import initSqlJs from 'sql.js';
const SQL = await initSqlJs({ locateFile: ... });
```

### Después (IndexedDB)
```typescript
import { openDB } from 'idb';
const db = await openDB('timetracker', 1, { ... });
```

## Funciones Disponibles

### Usuarios
- `getUsers()`
- `getUserByEmail(email)`
- `createUser(user)`
- `updateUser(id, user)`
- `deleteUser(id)`

### Clientes
- `getClients()`
- `createClient(client)`
- `updateClient(id, client)`
- `deleteClient(id)`

### Proyectos
- `getProjects()`
- `getProjectsByLeader(leaderId)`
- `createProject(project)`
- `updateProject(id, project)`
- `deleteProject(id)`

### Plantillas
- `getTemplates()`
- `createTemplate(template)`
- `updateTemplate(id, template)`
- `deleteTemplate(id)`

### Registros de Tiempo
- `getTimeEntries()`
- `getTimeEntriesByUser(userId)`
- `getTimeEntriesByProject(projectId)`
- `getTimeEntriesByDateRange(startDate, endDate)`
- `createTimeEntry(entry)`
- `updateTimeEntry(id, entry)`
- `deleteTimeEntry(id)`

### Utilidades
- `initDatabase()` - Inicializa la base de datos
- `saveDatabase()` - Compatibilidad (IndexedDB guarda automáticamente)
- `resetDatabase()` - Resetea a datos iniciales
- `exportDatabase()` - Exporta como Blob JSON
- `importDatabase(file)` - Importa desde archivo JSON

## Troubleshooting

### La base de datos no carga
- Verifica la consola del navegador
- Intenta limpiar IndexedDB desde DevTools → Application → IndexedDB
- Asegúrate de que el navegador soporta IndexedDB (todos los navegadores modernos)

### Datos perdidos
- Verifica que no se haya limpiado IndexedDB desde el navegador
- Restaura desde un respaldo exportado

### Errores de inicialización
- IndexedDB puede fallar si el navegador está en modo privado (algunos navegadores)
- Verifica que hay espacio disponible en disco
- Revisa permisos del navegador para almacenamiento

### Migrar a multi-usuario
Para un sistema real con múltiples usuarios compartiendo datos:
- Considera usar **Supabase** para backend
- Permite sincronización entre dispositivos
- Autenticación segura
- Control de acceso basado en roles
