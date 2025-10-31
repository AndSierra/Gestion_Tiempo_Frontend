# Guía de Migración a API Backend

## Cambios Realizados

### 1. Nuevo Servicio API (`/lib/api.ts`)
- Reemplaza `database.ts` (IndexedDB) 
- Se comunica con backend en `http://localhost:3001/api`
- Todos los métodos devuelven `ApiResponse<T>`

### 2. Hooks Actualizados (`/lib/useDatabase.ts`)
- Ahora usan `api.ts` en lugar de `database.ts`
- Misma API, diferente implementación
- No requiere cambios en componentes que usen los hooks

### 3. AuthProvider Actualizado
- Usa `authApi.login()` en lugar de `getUserByEmail()`
- Llama a `/api/auth/login` del backend

## Cambios Importantes de Tipos

### IDs: String → Number
**Antes (IndexedDB):**
```typescript
client.id // string
```

**Ahora (API Backend):**
```typescript
client.id // number
```

### Estructuras de Datos

#### User
```typescript
{
  id: number,              // era string
  name: string,
  email: string,
  role: 'admin' | 'leader' | 'developer'
}
```

#### Client  
```typescript
{
  id: number,              // era string
  name: string,
  description: string
}
```

#### Project
```typescript
{
  id: number,              // era string
  name: string,
  clientId: number,        // era string  
  leaderId: number,        // era string
  tasks: string,           // era string[]
  clientName?: string,     // populated
  leaderName?: string      // populated
}
```

#### Template
```typescript
{
  id: number,              // era string
  name: string,
  description: string,
  tasks: string            // era string[]
}
```

#### TimeEntry
```typescript
{
  id: number,              // era string
  userId: number,          // era string
  projectId: number,       // era string
  taskName: string,
  date: string,            // YYYY-MM-DD
  startTime: string,       // HH:MM
  endTime: string,         // HH:MM
  hours: number,
  description: string,
  userName?: string,       // populated
  projectName?: string     // populated
}
```

## Cómo Migrar un Componente

### Paso 1: Actualizar Imports

**Antes:**
```typescript
import { useUsers, useClients } from '../lib/useDatabase';
import * as db from '../lib/database';
```

**Después:**
```typescript
import { useUsers, useClients } from '../lib/useDatabase';
import { usersApi, clientsApi } from '../lib/api';
import type { User, Client } from '../lib/api';
```

### Paso 2: Usar Hooks (Sin Cambios)

```typescript
// Esto sigue igual
const { users, loading, reload } = useUsers();
const { clients } = useClients();
```

### Paso 3: Actualizar Operaciones CRUD

#### Crear

**Antes:**
```typescript
const handleCreate = () => {
  const newClient = {
    id: Date.now().toString(),  // ❌
    name: 'Test',
    description: 'Desc'
  };
  setClients([...clients, newClient]);
};
```

**Después:**
```typescript
const handleCreate = async () => {
  try {
    await clientsApi.create({
      // No enviar ID
      name: 'Test',
      description: 'Desc'
    });
    toast.success('Cliente creado');
    reload();  // Recargar desde API
  } catch (error) {
    toast.error('Error al crear');
  }
};
```

#### Actualizar

**Antes:**
```typescript
const handleUpdate = () => {
  setClients(clients.map(c => 
    c.id === editingClient.id ? editingClient : c
  ));
};
```

**Después:**
```typescript
const handleUpdate = async () => {
  try {
    await clientsApi.update(editingClient.id, {
      name: editingClient.name,
      description: editingClient.description
    });
    toast.success('Cliente actualizado');
    reload();
  } catch (error) {
    toast.error('Error al actualizar');
  }
};
```

#### Eliminar

**Antes:**
```typescript
const handleDelete = (id: string) => {
  setClients(clients.filter(c => c.id !== id));
};
```

**Después:**
```typescript
const handleDelete = async (id: number) => {  // number, no string
  try {
    await clientsApi.delete(id);
    toast.success('Cliente eliminado');
    reload();
  } catch (error) {
    toast.error('Error al eliminar');
  }
};
```

### Paso 4: Actualizar Referencias a IDs

**Antes:**
```typescript
<Select value={newProject.clientId} onValueChange={(value) => 
  setNewProject({...newProject, clientId: value})
}>
  <SelectItem value={client.id}>{client.name}</SelectItem>
</Select>
```

**Después:**
```typescript
<Select value={newProject.clientId.toString()} onValueChange={(value) => 
  setNewProject({...newProject, clientId: parseInt(value)})
}>
  <SelectItem value={client.id.toString()}>{client.name}</SelectItem>
</Select>
```

### Paso 5: Actualizar Tasks (string[] → string)

**Antes:**
```typescript
project.tasks // string[]
project.tasks.map(task => <li>{task}</li>)
```

**Después:**
```typescript
project.tasks // string (separado por comas)
project.tasks.split(',').map(task => <li>{task.trim()}</li>)
```

## Componentes a Migrar

- [x] `AuthProvider.tsx` ✅
- [x] `useDatabase.ts` ✅  
- [ ] `AdminDashboard.tsx` (en progreso)
- [ ] `LeaderDashboard.tsx`
- [ ] `DeveloperDashboard.tsx`
- [ ] `ProjectManagement.tsx`
- [ ] `TemplateManagement.tsx`
- [ ] `GlobalReports.tsx`
- [ ] `Profile.tsx`
- [ ] `Login.tsx` (verificar)

## Testing

### Verificar que Backend esté corriendo:
```bash
# Health check
curl http://localhost:3001/api/health

# Obtener usuarios
curl http://localhost:3001/api/users
```

### Credenciales de prueba:
```
admin@timetracker.com / admin123
maria@timetracker.com / leader123
carlos@timetracker.com / dev123
```

## Troubleshooting

### Error: "Failed to fetch"
- Verifica que el backend esté corriendo en puerto 3001
- Revisa CORS en `server/.env`: `CORS_ORIGIN=http://localhost:5173`

### Error: "Cannot read property 'id'"
- Probablemente un ID string siendo usado como number
- Convierte: `parseInt(id)` o `id.toString()`

### Error: "tasks.map is not a function"
- `tasks` ahora es string, no array
- Usa: `tasks.split(',').map(...)`

### Los datos no se actualizan
- Asegúrate de llamar `reload()` después de cambios
- Verifica que el backend respondió exitosamente

## Variables de Entorno

Crea `.env` en la raíz:
```env
VITE_API_URL=http://localhost:3001/api
```

Si cambias el puerto del backend, actualízalo aquí también.
