# TimeTracker Server - Backend API

Backend Node.js + Express + TypeScript + SQLite para el sistema TimeTracker.

## 🚀 Inicio Rápido

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar .env con tus configuraciones
```

### 3. Iniciar el servidor en modo desarrollo
```bash
npm run dev
```

El servidor estará disponible en: `http://localhost:3001`

## 📜 Scripts Disponibles

```bash
npm run dev        # Inicia servidor en modo desarrollo (con hot-reload)
npm run build      # Compila TypeScript a JavaScript
npm start          # Inicia servidor en modo producción (requiere build)
npm run db:reset   # Resetea la base de datos a datos iniciales
```

## 📁 Estructura de Carpetas

```
server/
├── src/
│   ├── config/
│   │   └── database.ts          # Configuración de SQLite
│   ├── controllers/
│   │   ├── authController.ts    # Login/Logout
│   │   ├── userController.ts    # CRUD usuarios
│   │   ├── clientController.ts  # CRUD clientes
│   │   ├── projectController.ts # CRUD proyectos
│   │   ├── templateController.ts # CRUD plantillas
│   │   └── timeEntryController.ts # CRUD registros de tiempo
│   ├── routes/
│   │   ├── authRoutes.ts
│   │   ├── userRoutes.ts
│   │   ├── clientRoutes.ts
│   │   ├── projectRoutes.ts
│   │   ├── templateRoutes.ts
│   │   └── timeEntryRoutes.ts
│   ├── scripts/
│   │   └── resetDB.ts           # Script para resetear DB
│   └── server.ts                # Punto de entrada
├── dist/                        # Archivos compilados (generado)
├── package.json
├── tsconfig.json
└── .env
```

## 🔌 Endpoints de la API

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión

### Usuarios
- `GET /api/users` - Listar todos
- `GET /api/users/:id` - Obtener uno
- `POST /api/users` - Crear
- `PUT /api/users/:id` - Actualizar
- `DELETE /api/users/:id` - Eliminar

### Clientes
- `GET /api/clients` - Listar todos
- `GET /api/clients/:id` - Obtener uno
- `POST /api/clients` - Crear
- `PUT /api/clients/:id` - Actualizar
- `DELETE /api/clients/:id` - Eliminar

### Proyectos
- `GET /api/projects` - Listar todos
- `GET /api/projects/leader/:leaderId` - Por líder
- `POST /api/projects` - Crear
- `PUT /api/projects/:id` - Actualizar
- `DELETE /api/projects/:id` - Eliminar

### Plantillas
- `GET /api/templates` - Listar todas
- `POST /api/templates` - Crear
- `PUT /api/templates/:id` - Actualizar
- `DELETE /api/templates/:id` - Eliminar

### Registros de Tiempo
- `GET /api/time-entries` - Listar todos
- `GET /api/time-entries/user/:userId` - Por usuario
- `GET /api/time-entries/project/:projectId` - Por proyecto
- `GET /api/time-entries/date-range?start=YYYY-MM-DD&end=YYYY-MM-DD` - Por rango
- `POST /api/time-entries` - Crear
- `PUT /api/time-entries/:id` - Actualizar
- `DELETE /api/time-entries/:id` - Eliminar

## 🧪 Probar la API

### Con cURL
```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@timetracker.com","password":"admin123"}'

# Obtener usuarios
curl http://localhost:3001/api/users

# Crear cliente
curl -X POST http://localhost:3001/api/clients \
  -H "Content-Type: application/json" \
  -d '{"name":"Nuevo Cliente","description":"Descripción"}'
```

### Con Postman
1. Importa la colección (crear archivo JSON con los endpoints)
2. Configura la URL base: `http://localhost:3001`
3. Ejecuta las peticiones

## 🗄️ Base de Datos

La base de datos SQLite se crea automáticamente en `../database/timetracker.db`

### Ver la base de datos
- **DB Browser for SQLite**: https://sqlitebrowser.org/
- **VSCode Extension**: SQLite Viewer

### Resetear base de datos
```bash
npm run db:reset
```

## 🔧 Variables de Entorno

```env
PORT=3001                           # Puerto del servidor
DB_PATH=../database/timetracker.db  # Ruta a la base de datos
NODE_ENV=development                # Entorno (development/production)
CORS_ORIGIN=http://localhost:5173   # Origen permitido para CORS
```

## 🐛 Troubleshooting

### Error: "Cannot find module 'better-sqlite3'"
```bash
npm install better-sqlite3
```

### Error: "EADDRINUSE: address already in use"
El puerto 3001 está ocupado:
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID [PID] /F

# O cambiar puerto en .env
PORT=3002
```

### Error: "SQLITE_CANTOPEN"
```bash
# Crear directorio de base de datos
mkdir ../database
```

## 📦 Deployment

### Build para producción
```bash
npm run build
```

### Ejecutar en producción
```bash
NODE_ENV=production npm start
```

### Plataformas recomendadas
- **Railway**: https://railway.app
- **Render**: https://render.com
- **Heroku**: https://heroku.com
- **DigitalOcean**: https://digitalocean.com

## 🔒 Seguridad

⚠️ **Esta implementación es para desarrollo/aprendizaje**

Para producción implementa:
- Cifrado de contraseñas (bcrypt)
- Autenticación JWT
- Rate limiting
- Validación de entrada (joi/zod)
- HTTPS
- Variables de entorno seguras

## 📚 Tecnologías

- **Node.js** - Runtime
- **Express** - Framework web
- **TypeScript** - Lenguaje
- **better-sqlite3** - Base de datos SQLite
- **cors** - CORS middleware
- **dotenv** - Variables de entorno
