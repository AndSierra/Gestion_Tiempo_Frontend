# 🚀 TimeTracker - Sistema de Gestión de Horas

Sistema completo de seguimiento de horas con paneles basados en roles (Admin, Líder, Desarrollador).

**Estado**: ✅ Sistema 100% API Backend con SQLite

---

## ⚡ INICIO RÁPIDO (2 minutos)

### Paso 1: Ejecutar
```bash
# Windows: Doble clic en
start-windows.bat

# Selecciona:
1 - Primera vez (instala dependencias)
2 - Ya instalado (solo inicia)
```

### Paso 2: Esperar
Se abrirán **2 ventanas automáticamente**:
- Backend (puerto 3001) ✅
- Frontend (puerto 5173) ✅

**⚠️ NO CIERRES ESTAS VENTANAS**

### Paso 3: Usar
```
http://localhost:5173

Login:
Email: admin@timetracker.com
Pass:  admin123
```

**¡Listo!** 🎉

---

## 📋 ÍNDICE

- [Inicio Rápido](#-inicio-rápido-2-minutos)
- [¿Qué es TimeTracker?](#-qué-es-timetracker)
- [Arquitectura](#-arquitectura-del-sistema)
- [Instalación Detallada](#-instalación-detallada)
- [Solución de Problemas](#-solución-de-problemas)
- [Usuarios de Prueba](#-usuarios-de-prueba)
- [Funcionalidades](#-funcionalidades-por-rol)
- [Tecnologías](#-tecnologías)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [API Endpoints](#-api-endpoints)
- [Base de Datos](#-base-de-datos)
- [Desarrollo](#-guía-de-desarrollo)

---

## 🎯 ¿Qué es TimeTracker?

Sistema fullstack de gestión de horas con:

- 🔐 **3 Roles**: Admin, Líder, Desarrollador
- 📊 **Dashboards Personalizados** por rol
- ⏱️ **Registro de Horas** con validaciones (máx 9h diarias)
- 📈 **Reportes Globales** con exportación Excel/JSON
- 🎨 **Gestión de Proyectos** con plantillas reutilizables
- 💾 **Base de Datos SQLite** persistente
- 🎨 **Vista Mensual** codificada por colores (0h=gris, 1-4h=amarillo, 5-8h=verde, 9+h=rojo)

---

## 🏗️ Arquitectura del Sistema

### Stack Tecnológico

```
┌─────────────────────────────────┐
│   Frontend (React + TypeScript) │
│   - 7 componentes principales   │
│   - Tailwind CSS + Shadcn/ui    │
└──────────────┬──────────────────┘
               │ HTTP REST
               │ (fetch API)
┌──────────────▼──────────────────┐
│     Cliente API (/lib/api.ts)   │
│     - Centralizado              │
│     - Manejo de errores         │
└──────────────┬──────────────────┘
               │
               │ fetch()
               │
┌──────────────▼──────────────────┐
│   Backend (Express + TypeScript)│
│   - 6 controladores             │
│   - Rutas REST                  │
│   - Validaciones                │
└──────────────┬──────────────────┘
               │ SQL
               │ (better-sqlite3)
┌──────────────▼──────────────────┐
│     SQLite Database             │
│     database/timetracker.db     │
│     - Persistente               │
│     - 5 tablas principales      │
└─────────────────────────────────┘
```

### ✅ Sistema 100% API

- **NO** usa mockData (eliminado)
- **NO** usa IndexedDB (eliminado)
- **SÍ** usa API REST + SQLite
- **Datos persistentes** entre sesiones

---

## 📦 Instalación Detallada

### Requisitos Previos

- Node.js 18+ 
- npm o yarn
- Windows (o adaptar scripts para Linux/Mac)

### Opción 1: Instalación Automática (Recomendado)

```bash
# 1. Ejecutar
start-windows.bat

# 2. Seleccionar opción 1 (primera vez)
# 3. Esperar 3-5 minutos
# 4. Se abrirán 2 ventanas automáticamente
```

### Opción 2: Instalación Manual

```bash
# 1. Instalar dependencias del frontend
npm install

# 2. Instalar dependencias del backend
cd server
npm install

# 3. Iniciar backend (en una terminal)
cd server
npm run dev

# 4. Iniciar frontend (en otra terminal)
npm run dev
```

### Verificación de Instalación

```bash
# Backend OK?
curl http://localhost:3001/api/health
# Debe responder: {"status":"OK","timestamp":"...","database":"connected"}

# Frontend OK?
http://localhost:5173
# Debe mostrar página de login
```

---

## ❌ Solución de Problemas

### Error: "Failed to fetch"

**Causa**: El backend no está corriendo o no responde.

**Solución**:

```bash
# 1. Verifica que el backend esté corriendo
curl http://localhost:3001/api/health

# 2. Si no responde, inicia el backend
cd server
npm run dev

# 3. Espera a ver: "✓ Server running on http://localhost:3001"

# 4. Luego inicia el frontend
npm run dev
```

**⚠️ IMPORTANTE**: El backend DEBE iniciar ANTES que el frontend.

---

### Error: "Cannot read properties of undefined"

**Causa**: Falta el archivo `.env` en el frontend.

**Solución**:

```bash
# 1. Crear archivo .env en la raíz
echo VITE_API_URL=http://localhost:3001 > .env

# 2. Reiniciar el frontend
npm run dev
```

---

### Error: "Port 3001 is already in use"

**Causa**: El puerto está ocupado.

**Solución**:

```bash
# Opción 1: Detener todo y reiniciar
stop-windows.bat
start-windows.bat

# Opción 2: Cambiar el puerto
# En server/.env cambiar:
PORT=3002

# Y en .env del frontend:
VITE_API_URL=http://localhost:3002
```

---

### Backend no inicia

```bash
# 1. Verificar que estás en la carpeta correcta
cd server

# 2. Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install

# 3. Verificar que existe la base de datos
ls ../database/timetracker.db

# 4. Si no existe, resetear DB
npm run db:reset

# 5. Iniciar
npm run dev
```

---

### Frontend muestra página en blanco

```bash
# 1. Abrir consola del navegador (F12)
# 2. Revisar errores

# Si hay error de CORS:
# Verificar que el backend esté en puerto 3001
# Y que el .env tenga: VITE_API_URL=http://localhost:3001

# 3. Limpiar caché
Ctrl + Shift + R (o Cmd + Shift + R en Mac)
```

---

### Login no funciona

```bash
# 1. Verificar backend
curl http://localhost:3001/api/health

# 2. Verificar credenciales
Email: admin@timetracker.com
Pass:  admin123

# 3. Abrir consola del navegador (F12)
# Buscar error en Network tab

# 4. Si la DB está corrupta
cd server
npm run db:reset
```

---

### Error: "Module not found"

```bash
# Frontend
npm install

# Backend
cd server
npm install
```

---

### Checklist de Verificación Rápida

```bash
# ✅ 1. Backend corriendo?
curl http://localhost:3001/api/health
# Debe responder JSON

# ✅ 2. Frontend accesible?
http://localhost:5173
# Debe mostrar página de login

# ✅ 3. Archivo .env existe?
cat .env
# Debe mostrar: VITE_API_URL=http://localhost:3001

# ✅ 4. Base de datos existe?
ls database/timetracker.db
# Debe existir el archivo

# ✅ 5. Login funciona?
# Usar: admin@timetracker.com / admin123
# Debe redirigir al dashboard
```

---

## 👥 Usuarios de Prueba

```
Admin (Acceso completo):
Email: admin@timetracker.com
Pass:  admin123

Líder (Gestión de equipo):
Email: leader@timetracker.com
Pass:  leader123

Desarrollador (Registro de horas):
Email: developer@timetracker.com
Pass:  developer123
```

---

## ⚙️ Funcionalidades por Rol

### 👨‍💼 Admin

- ✅ Gestión completa de usuarios (CRUD)
- ✅ Gestión de clientes (CRUD)
- ✅ Gestión de proyectos (CRUD)
- ✅ Gestión de plantillas (CRUD)
- ✅ Reportes globales
- ✅ Exportación de datos (Excel, JSON)
- ✅ Vista de todas las horas registradas
- ✅ Asignación de líderes y desarrolladores

### 👔 Líder

- ✅ Vista mensual de horas del equipo
- ✅ Códigos de color:
  - Gris: 0 horas
  - Amarillo: 1-4 horas
  - Verde: 5-8 horas
  - Rojo: 9+ horas
- ✅ Seguimiento de proyectos
- ✅ Vista de horas por desarrollador
- ✅ Gestión de su equipo

### 💻 Desarrollador

- ✅ Registro diario de horas
- ✅ Selección de cliente/proyecto/tarea
- ✅ Validaciones:
  - Máximo 9 horas diarias
  - Horarios válidos (HH:MM)
  - Hora fin > hora inicio
- ✅ Vista de sus registros históricos
- ✅ Edición y eliminación de registros

---

## 🔧 Tecnologías

### Frontend

- **React 18** - UI Library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Shadcn/ui** - Component library
- **Lucide React** - Icons
- **Recharts** - Gráficos

### Backend

- **Node.js** - Runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **SQLite** (better-sqlite3) - Database
- **CORS** - Cross-origin support

### Herramientas

- **tsx** - TypeScript execution
- **Nodemon** - Auto-reload

---

## 📁 Estructura del Proyecto

```
TimeTracker/
├── App.tsx                      # Componente principal
├── .env                         # Variables de entorno (crear)
├── package.json                 # Dependencias frontend
│
├── components/                  # Componentes React
│   ├── AdminDashboard.tsx       # Panel admin
│   ├── LeaderDashboard.tsx      # Panel líder
│   ├── DeveloperDashboard.tsx   # Panel desarrollador
│   ├── ProjectManagement.tsx    # Gestión proyectos
│   ├── TemplateManagement.tsx   # Gestión plantillas
│   ├── GlobalReports.tsx        # Reportes y exportación
│   ├── Profile.tsx              # Perfil usuario
│   ├── Login.tsx                # Página de login
│   ├── Navigation.tsx           # Navegación
│   ├── AuthProvider.tsx         # Contexto autenticación
│   └── ui/                      # Componentes Shadcn/ui
│
├── lib/
│   └── api.ts                   # Cliente API centralizado
│
├── server/                      # Backend
│   ├── package.json             # Dependencias backend
│   ├── tsconfig.json            # Config TypeScript
│   └── src/
│       ├── server.ts            # Servidor Express
│       ├── config/
│       │   └── database.ts      # Configuración SQLite
│       ├── controllers/         # Lógica de negocio
│       │   ├── authController.ts
│       │   ├── clientController.ts
│       │   ├── projectController.ts
│       │   ├── templateController.ts
│       │   ├── timeEntryController.ts
│       │   └── userController.ts
│       ├── routes/              # Rutas API
│       │   ├── authRoutes.ts
│       │   ├── clientRoutes.ts
│       │   ├── projectRoutes.ts
│       │   ├── templateRoutes.ts
│       │   ├── timeEntryRoutes.ts
│       │   └── userRoutes.ts
│       └── scripts/
│           └── resetDB.ts       # Reset base de datos
│
├── database/
│   └── timetracker.db           # Base de datos SQLite
│
├── shared/
│   └── types.ts                 # Tipos compartidos
│
├── styles/
│   └── globals.css              # Estilos globales
│
└── scripts/
    ├── start-windows.bat        # Inicio automático
    ├── stop-windows.bat         # Detener servidores
    ├── reset-database.bat       # Resetear DB
    └── diagnostico.bat          # Diagnóstico del sistema
```

---

## 🔌 API Endpoints

### Autenticación

```
POST   /api/auth/login
       Body: { email: string, password: string }
       Response: { success: true, data: User }

POST   /api/auth/logout
       Response: { success: true }

GET    /api/auth/me
       Response: { success: true, data: User }
```

### Usuarios

```
GET    /api/users
       Response: { success: true, data: User[] }

GET    /api/users/:id
       Response: { success: true, data: User }

POST   /api/users
       Body: { name, email, password, role }
       Response: { success: true, data: User }

PUT    /api/users/:id
       Body: { name, email, role }
       Response: { success: true, data: User }

DELETE /api/users/:id
       Response: { success: true }
```

### Clientes

```
GET    /api/clients
GET    /api/clients/:id
POST   /api/clients
PUT    /api/clients/:id
DELETE /api/clients/:id
```

### Proyectos

```
GET    /api/projects
GET    /api/projects/:id
GET    /api/projects/by-client/:clientId
POST   /api/projects
PUT    /api/projects/:id
DELETE /api/projects/:id
```

### Plantillas

```
GET    /api/templates
GET    /api/templates/:id
POST   /api/templates
PUT    /api/templates/:id
DELETE /api/templates/:id
```

### Registros de Tiempo

```
GET    /api/time-entries
GET    /api/time-entries/:id
GET    /api/time-entries/by-user/:userId
GET    /api/time-entries/by-project/:projectId
GET    /api/time-entries/by-date-range?start=YYYY-MM-DD&end=YYYY-MM-DD
POST   /api/time-entries
PUT    /api/time-entries/:id
DELETE /api/time-entries/:id
```

### Health Check

```
GET    /api/health
       Response: {
         status: "OK",
         timestamp: "2024-...",
         database: "connected"
       }
```

---

## 🗄️ Base de Datos

### SQLite Schema

```sql
-- Usuarios
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin', 'leader', 'developer'))
);

-- Clientes
CREATE TABLE clients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT
);

-- Proyectos
CREATE TABLE projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  client_id INTEGER NOT NULL,
  leader_id INTEGER NOT NULL,
  developer_ids TEXT NOT NULL, -- JSON array
  tasks TEXT NOT NULL,         -- JSON array
  FOREIGN KEY (client_id) REFERENCES clients(id),
  FOREIGN KEY (leader_id) REFERENCES users(id)
);

-- Plantillas
CREATE TABLE templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  tasks TEXT NOT NULL,         -- JSON array
  created_by INTEGER NOT NULL,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Registros de tiempo
CREATE TABLE time_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  client_id INTEGER NOT NULL,
  project_id INTEGER NOT NULL,
  task TEXT NOT NULL,
  date TEXT NOT NULL,          -- YYYY-MM-DD
  start_time TEXT NOT NULL,    -- HH:MM
  end_time TEXT NOT NULL,      -- HH:MM
  total_hours REAL NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (client_id) REFERENCES clients(id),
  FOREIGN KEY (project_id) REFERENCES projects(id)
);
```

### Datos de Ejemplo

El sistema viene con datos precargados:

- 5 usuarios (admin, 2 leaders, 2 developers)
- 3 clientes (TechCorp, FinanceApp, RetailPlus)
- 3 proyectos
- 2 plantillas (Desarrollo Web, Proyecto Móvil)
- Varios registros de tiempo de ejemplo

### Resetear Base de Datos

```bash
# Windows
reset-database.bat

# Manual
cd server
npm run db:reset

# Esto:
# 1. Elimina database/timetracker.db
# 2. Crea nueva base de datos
# 3. Inserta datos de ejemplo
```

---

## 💻 Guía de Desarrollo

### Agregar un Nuevo Endpoint

#### 1. Backend

```typescript
// server/src/controllers/myController.ts
export const getData = (req: Request, res: Response) => {
  try {
    const data = db.prepare('SELECT * FROM my_table').all();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Error message' 
    });
  }
};

// server/src/routes/myRoutes.ts
import express from 'express';
import * as controller from '../controllers/myController';

const router = express.Router();
router.get('/my-data', controller.getData);

export default router;

// server/src/server.ts
import myRoutes from './routes/myRoutes';
app.use('/api/my', myRoutes);
```

#### 2. Cliente API

```typescript
// lib/api.ts
export const myApi = {
  getData: async () => {
    return apiRequest<MyType[]>('/my/my-data');
  }
};
```

#### 3. Componente

```typescript
// components/MyComponent.tsx
import { myApi } from '../lib/api';

const [data, setData] = useState([]);

useEffect(() => {
  loadData();
}, []);

const loadData = async () => {
  const response = await myApi.getData();
  if (response.success && response.data) {
    setData(response.data);
  }
};
```

### Patrón de Desarrollo

```typescript
// SIEMPRE usar este patrón:

// 1. Estado
const [items, setItems] = useState([]);
const [loading, setLoading] = useState(false);

// 2. Cargar datos
const loadItems = async () => {
  setLoading(true);
  const response = await itemsApi.getAll();
  if (response.success && response.data) {
    setItems(response.data);
  }
  setLoading(false);
};

// 3. Crear
const handleCreate = async (data) => {
  const response = await itemsApi.create(data);
  if (response.success) {
    toast.success('Creado exitosamente');
    loadItems(); // Recargar lista
  } else {
    toast.error(response.error || 'Error');
  }
};

// 4. Actualizar
const handleUpdate = async (id, data) => {
  const response = await itemsApi.update(id, data);
  if (response.success) {
    toast.success('Actualizado exitosamente');
    loadItems();
  } else {
    toast.error(response.error || 'Error');
  }
};

// 5. Eliminar
const handleDelete = async (id) => {
  if (!confirm('¿Estás seguro?')) return;
  
  const response = await itemsApi.delete(id);
  if (response.success) {
    toast.success('Eliminado exitosamente');
    loadItems();
  } else {
    toast.error(response.error || 'Error');
  }
};
```

### NO Hacer

```typescript
// ❌ NO crear mockData
const mockData = [...];

// ❌ NO usar localStorage para datos principales
localStorage.setItem('users', JSON.stringify(users));

// ❌ NO hacer fetch directo
fetch('/api/users'); // Usar lib/api.ts

// ❌ NO hardcodear URLs
fetch('http://localhost:3001/api/users'); // Usar VITE_API_URL
```

### SÍ Hacer

```typescript
// ✅ Siempre usar el cliente API
import { usersApi } from '../lib/api';
const response = await usersApi.getAll();

// ✅ Manejar errores
if (!response.success) {
  toast.error(response.error);
  return;
}

// ✅ Validar en backend
if (!name || !email) {
  return res.status(400).json({ 
    success: false, 
    error: 'Campos requeridos' 
  });
}

// ✅ Usar tipos de TypeScript
interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'leader' | 'developer';
}
```

---

## 🚀 Deploy a Producción

### Backend

**Opciones**: Railway, Heroku, Fly.io, Render

```bash
# 1. Crear cuenta en Railway.app

# 2. Conectar repositorio

# 3. Configurar variables de entorno:
NODE_ENV=production
PORT=3001

# 4. Cambiar a PostgreSQL (recomendado para producción)
# Instalar: npm install pg
# Adaptar queries en controllers/
```

### Frontend

**Opciones**: Vercel, Netlify

```bash
# 1. Crear cuenta en Vercel

# 2. Conectar repositorio

# 3. Configurar:
Build Command: npm run build
Output Directory: dist
Install Command: npm install

# 4. Variables de entorno:
VITE_API_URL=https://tu-backend.railway.app
```

---

## 📊 Métricas del Sistema

```
Componentes React: 7
Endpoints API: 30+
Tablas de DB: 5
Líneas de código: ~5,000
Documentación: Este README
Estado: 100% funcional
```

---

## 🔐 Seguridad

### Actual (Desarrollo)

- Autenticación básica con email/password
- Sesiones en memoria
- Sin encriptación de passwords (⚠️ solo para desarrollo)

### Recomendado para Producción

```bash
# 1. Instalar bcrypt
npm install bcrypt

# 2. Hash passwords
const bcrypt = require('bcrypt');
const hashedPassword = await bcrypt.hash(password, 10);

# 3. Verificar
const match = await bcrypt.compare(password, hashedPassword);

# 4. JWT para autenticación
npm install jsonwebtoken
```

---

## 🧪 Testing

### Verificación Manual

```bash
# 1. Health check
curl http://localhost:3001/api/health

# 2. Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@timetracker.com","password":"admin123"}'

# 3. Obtener usuarios
curl http://localhost:3001/api/users
```

### Scripts de Diagnóstico

```bash
# Windows
diagnostico.bat

# Verifica:
# - Backend corriendo
# - Frontend corriendo
# - Base de datos existe
# - Archivo .env existe
```

---

## 📚 Recursos Adicionales

### Documentación Técnica

- **Backend**: Ver `server/README.md`
- **Guidelines**: Ver `guidelines/` folder
- **API Migration**: Ver `guidelines/API_MIGRATION.md`

### Tecnologías Utilizadas

- [React](https://react.dev) - Framework UI
- [TypeScript](https://www.typescriptlang.org) - Lenguaje
- [Express](https://expressjs.com) - Backend framework
- [SQLite](https://www.sqlite.org) - Base de datos
- [Tailwind CSS](https://tailwindcss.com) - Estilos
- [Shadcn/ui](https://ui.shadcn.com) - Componentes

---

## 🤝 Contribuir

### Flujo de Trabajo

1. Fork el repositorio
2. Crear branch: `git checkout -b feature/nueva-funcionalidad`
3. Commit: `git commit -m 'Añadir nueva funcionalidad'`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Crear Pull Request

### Estándares de Código

- TypeScript estricto
- ESLint + Prettier
- Nombres descriptivos
- Comentarios en funciones complejas
- Manejo de errores adecuado

---

## 📄 Licencia

Este proyecto es de código abierto bajo licencia MIT.

---

## ✅ Checklist Final

- [x] Sistema 100% API Backend
- [x] mockData eliminado
- [x] IndexedDB eliminado
- [x] 7 componentes funcionales
- [x] Backend SQLite funcionando
- [x] Autenticación por roles
- [x] Validaciones implementadas
- [x] Exportación de datos
- [x] Scripts de inicio automático
- [x] Documentación completa
- [x] Datos de prueba incluidos

---

## 🎯 Resumen

**TimeTracker** es un sistema completo de gestión de horas con arquitectura profesional, usando React + TypeScript en el frontend y Express + SQLite en el backend. Incluye autenticación basada en roles, validaciones robustas, exportación de datos, y una experiencia de usuario fluida.

**Estado**: ✅ Listo para usar en desarrollo
**Próximo paso**: Ejecuta `start-windows.bat` y comienza a trabajar

---

**Última actualización**: Octubre 2024  
**Versión**: 2.0 (100% API Backend)  
**Mantenido por**: Tu equipo
