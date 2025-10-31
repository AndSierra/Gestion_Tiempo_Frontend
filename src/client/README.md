# TimeTracker Client - Frontend

Frontend React + TypeScript + Vite que se conecta al backend SQLite.

## 🚀 Inicio Rápido

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# El archivo .env debe contener:
VITE_API_URL=http://localhost:3001/api
```

### 3. Asegurarse de que el servidor esté corriendo
```bash
# En otra terminal, en la carpeta /server:
cd ../server
npm run dev
```

### 4. Iniciar el cliente
```bash
npm run dev
```

El cliente estará disponible en: `http://localhost:5173`

## 📜 Scripts Disponibles

```bash
npm run dev      # Inicia el servidor de desarrollo
npm run build    # Construye para producción
npm run preview  # Vista previa del build
```

## 🔌 Conexión con el Backend

### Servicio API

El archivo `/src/services/api.ts` contiene todas las funciones para comunicarse con el backend:

```typescript
import { usersApi, clientsApi, projectsApi } from './services/api';

// Obtener usuarios
const response = await usersApi.getAll();
if (response.success) {
  console.log(response.data); // Array de usuarios
}

// Crear cliente
await clientsApi.create({
  name: 'Nuevo Cliente',
  description: 'Descripción del cliente'
});

// Actualizar proyecto
await projectsApi.update(1, {
  name: 'Proyecto Actualizado',
  clientId: 2,
  leaderId: 3,
  tasks: 'Tarea1,Tarea2'
});
```

### Ejemplo de Componente

Ver `/src/components/ExampleApiComponent.tsx` para un ejemplo completo de:
- Cargar datos desde la API
- Crear nuevos registros
- Eliminar registros
- Manejar estados de carga
- Mostrar mensajes de éxito/error

### Usar en tus componentes

```tsx
import { useState, useEffect } from 'react';
import { usersApi, User } from '../services/api';
import { toast } from 'sonner';

function MyComponent() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await usersApi.getAll();
      if (response.success && response.data) {
        setUsers(response.data);
      }
    } catch (error) {
      toast.error('Error cargando usuarios');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <ul>
          {users.map(user => (
            <li key={user.id}>{user.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

## 📁 Estructura

```
client/
├── src/
│   ├── components/
│   │   ├── ExampleApiComponent.tsx  # Ejemplo de uso de API
│   │   └── ...                      # Componentes existentes
│   ├── services/
│   │   └── api.ts                   # Servicio de API
│   ├── App.tsx
│   └── main.tsx
├── .env                              # Variables de entorno
└── package.json
```

## 🔧 Configuración

### Variables de Entorno

```env
# .env
VITE_API_URL=http://localhost:3001/api
```

**Importante**: Las variables de Vite deben empezar con `VITE_`

### Acceder a variables de entorno

```typescript
const apiUrl = import.meta.env.VITE_API_URL;
```

## 🐛 Troubleshooting

### Error: "Failed to fetch"
- Verifica que el servidor backend esté corriendo en `http://localhost:3001`
- Revisa la consola del navegador para ver el error exacto
- Confirma que la URL en `.env` sea correcta

### Error: "CORS policy"
- El servidor ya tiene CORS configurado para `http://localhost:5173`
- Si cambias el puerto del cliente, actualiza `CORS_ORIGIN` en `server/.env`

### Error: "Cannot find module"
```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

## 📦 Build para Producción

```bash
# Construir
npm run build

# Los archivos estarán en /dist
# Puedes desplegarlos en Vercel, Netlify, etc.
```

### Variables de entorno en producción

Configura `VITE_API_URL` con la URL de tu backend en producción:

```env
VITE_API_URL=https://tu-backend.railway.app/api
```

## 🚀 Deployment

### Vercel
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm install -g netlify-cli
netlify deploy
```

### GitHub Pages
No recomendado si necesitas variables de entorno privadas.

## 📚 Recursos

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

## ✅ Checklist de Conexión

Antes de empezar a desarrollar, verifica:

- [ ] Backend corriendo en `http://localhost:3001`
- [ ] Frontend corriendo en `http://localhost:5173`
- [ ] Archivo `.env` creado con `VITE_API_URL`
- [ ] Probado el componente `ExampleApiComponent`
- [ ] Health check funciona: `http://localhost:3001/api/health`

## 🔄 Migrar componentes existentes

Si ya tienes componentes usando IndexedDB local, cámbialos para usar la API:

### Antes (IndexedDB)
```typescript
import { useUsers } from '../lib/useDatabase';

const { users, loading } = useUsers();
```

### Después (API Backend)
```typescript
import { usersApi, User } from '../services/api';

const [users, setUsers] = useState<User[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  usersApi.getAll().then(res => {
    if (res.success) setUsers(res.data || []);
    setLoading(false);
  });
}, []);
```

---

**Versión**: 1.0.0  
**Stack**: React + TypeScript + Vite + Fetch API
