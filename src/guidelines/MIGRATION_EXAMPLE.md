# Ejemplo de Migración de Mock Data a SQLite

Este documento muestra cómo actualizar componentes para usar la base de datos SQLite real en lugar de datos mock.

## Ejemplo: Componente de Lista de Usuarios

### ❌ ANTES: Usando Mock Data

```typescript
import React, { useState } from 'react';
import { mockUsers } from './mockData';

function UserList() {
  const [users, setUsers] = useState(mockUsers);
  
  const handleDelete = (id: string) => {
    setUsers(users.filter(u => u.id !== id));
  };
  
  const handleAdd = (user: User) => {
    setUsers([...users, { ...user, id: Date.now().toString() }]);
  };
  
  return (
    <div>
      {users.map(user => (
        <div key={user.id}>
          <p>{user.name} - {user.email}</p>
          <button onClick={() => handleDelete(user.id)}>Eliminar</button>
        </div>
      ))}
    </div>
  );
}
```

**Problemas:**
- Los datos se pierden al recargar la página
- No hay persistencia
- Todos los usuarios comparten los mismos datos mock
- No hay validaciones de base de datos

---

### ✅ DESPUÉS: Usando SQLite

```typescript
import React, { useState } from 'react';
import { useUsers } from '../lib/useDatabase';
import * as db from '../lib/database';
import { toast } from 'sonner';

function UserList() {
  const { users, loading, reload } = useUsers();
  
  const handleDelete = async (id: number) => {
    try {
      await db.deleteUser(id);
      toast.success('Usuario eliminado');
      reload(); // Recargar la lista
    } catch (error) {
      toast.error('Error al eliminar usuario');
      console.error(error);
    }
  };
  
  const handleAdd = async (user: { name: string; email: string; password: string; role: string }) => {
    try {
      await db.createUser(user);
      toast.success('Usuario creado');
      reload(); // Recargar la lista
    } catch (error) {
      toast.error('Error al crear usuario');
      console.error(error);
    }
  };
  
  if (loading) {
    return <div>Cargando usuarios...</div>;
  }
  
  return (
    <div>
      {users.map(user => (
        <div key={user.id}>
          <p>{user.name} - {user.email}</p>
          <button onClick={() => handleDelete(user.id)}>Eliminar</button>
        </div>
      ))}
    </div>
  );
}
```

**Ventajas:**
- ✅ Datos persistentes entre sesiones
- ✅ Base de datos real con SQL
- ✅ Validaciones automáticas (email único, etc.)
- ✅ Estado de loading mientras carga
- ✅ Manejo de errores con toast notifications
- ✅ Función reload() para actualizar después de cambios

---

## Ejemplo: Registro de Tiempo de Desarrollador

### ❌ ANTES: Usando Estado Local

```typescript
import React, { useState } from 'react';

function TimeEntry() {
  const [entries, setEntries] = useState([]);
  
  const handleSubmit = (entry) => {
    setEntries([...entries, { ...entry, id: Date.now() }]);
    alert('Hora registrada');
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* campos del formulario */}
    </form>
  );
}
```

---

### ✅ DESPUÉS: Usando SQLite

```typescript
import React from 'react';
import { useTimeEntries } from '../lib/useDatabase';
import * as db from '../lib/database';
import { toast } from 'sonner';
import { useAuth } from './AuthProvider';

function TimeEntry() {
  const { user } = useAuth();
  const { timeEntries, loading, reload } = useTimeEntries(user?.id);
  
  const handleSubmit = async (values: {
    projectId: number;
    taskName: string;
    date: string;
    startTime: string;
    endTime: string;
    hours: number;
    description: string;
  }) => {
    try {
      // Validar horas diarias
      const todayEntries = timeEntries.filter(e => e.date === values.date);
      const totalHours = todayEntries.reduce((sum, e) => sum + e.hours, 0);
      
      if (totalHours + values.hours > 9) {
        toast.error('No puedes registrar más de 9 horas por día');
        return;
      }
      
      await db.createTimeEntry({
        userId: user!.id,
        ...values
      });
      
      toast.success('Hora registrada exitosamente');
      reload();
    } catch (error) {
      toast.error('Error al registrar hora');
      console.error(error);
    }
  };
  
  if (loading) {
    return <div>Cargando registros...</div>;
  }
  
  return (
    <div>
      <form onSubmit={handleSubmit}>
        {/* campos del formulario */}
      </form>
      
      <div>
        <h3>Tus registros</h3>
        {timeEntries.map(entry => (
          <div key={entry.id}>
            {entry.date} - {entry.projectName} - {entry.hours}h
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Características agregadas:**
- ✅ Persistencia en SQLite
- ✅ Validación de 9 horas máximas por día
- ✅ Relación con proyectos (joins automáticos)
- ✅ Historial de registros
- ✅ Filtrado por usuario actual
- ✅ Recarga automática después de crear

---

## Ejemplo: Panel del Líder con Agregaciones

### ✅ Usando SQLite con Queries Complejas

```typescript
import React, { useState, useEffect } from 'react';
import * as db from '../lib/database';
import { useAuth } from './AuthProvider';

function LeaderDashboard() {
  const { user } = useAuth();
  const [teamStats, setTeamStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadStats();
  }, [user]);
  
  const loadStats = async () => {
    if (!user) return;
    
    try {
      // Obtener proyectos del líder
      const projects = await db.getProjectsByLeader(user.id);
      
      // Para cada proyecto, obtener estadísticas
      const stats = await Promise.all(
        projects.map(async (project) => {
          const entries = await db.getTimeEntriesByProject(project.id);
          
          // Calcular total de horas
          const totalHours = entries.reduce((sum, e) => sum + e.hours, 0);
          
          // Agrupar por usuario
          const byUser = entries.reduce((acc, entry) => {
            if (!acc[entry.userId]) {
              acc[entry.userId] = {
                userName: entry.userName,
                hours: 0,
                entries: 0
              };
            }
            acc[entry.userId].hours += entry.hours;
            acc[entry.userId].entries += 1;
            return acc;
          }, {} as any);
          
          return {
            project,
            totalHours,
            teamMembers: Object.values(byUser)
          };
        })
      );
      
      setTeamStats(stats);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return <div>Cargando estadísticas...</div>;
  }
  
  return (
    <div>
      {teamStats.map(stat => (
        <div key={stat.project.id}>
          <h3>{stat.project.name}</h3>
          <p>Total: {stat.totalHours}h</p>
          
          <h4>Equipo:</h4>
          {stat.teamMembers.map((member: any) => (
            <div key={member.userName}>
              {member.userName}: {member.hours}h ({member.entries} registros)
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
```

**Características avanzadas:**
- ✅ Joins automáticos (proyectos + registros + usuarios)
- ✅ Agregaciones y cálculos
- ✅ Filtrado por líder
- ✅ Estadísticas en tiempo real
- ✅ Agrupación de datos

---

## Patrón Recomendado

### 1. Usar Hooks para Lectura Simple
```typescript
const { users, loading, reload } = useUsers();
```

### 2. Usar Funciones Directas para Escritura
```typescript
await db.createUser(userData);
await db.updateUser(id, userData);
await db.deleteUser(id);
```

### 3. Siempre Recargar Después de Modificar
```typescript
await db.createUser(userData);
reload(); // Recargar el hook
```

### 4. Manejar Estados de Loading y Errores
```typescript
if (loading) return <Spinner />;
if (error) return <Error message={error} />;
return <Content data={data} />;
```

### 5. Usar Toast para Feedback
```typescript
try {
  await db.createUser(userData);
  toast.success('Usuario creado');
} catch (error) {
  toast.error('Error al crear usuario');
}
```

---

## Checklist de Migración

Cuando actualices un componente a SQLite:

- [ ] Importar hooks o funciones de `/lib/database.ts`
- [ ] Reemplazar estado local por hooks de base de datos
- [ ] Agregar manejo de estado `loading`
- [ ] Implementar manejo de errores con try/catch
- [ ] Agregar notificaciones toast
- [ ] Llamar a `reload()` después de modificaciones
- [ ] Actualizar tipos de `string` a `number` para IDs
- [ ] Probar crear, leer, actualizar y eliminar
- [ ] Verificar que los datos persistan al recargar

---

## Diferencias Importantes

| Aspecto | Mock Data | SQLite |
|---------|-----------|--------|
| IDs | string (ej: '1') | number (ej: 1) |
| Persistencia | No | Sí (LocalStorage) |
| Validaciones | Manual | Automáticas (constraints) |
| Relaciones | Manual | Foreign Keys |
| Queries | Filter/Map | SQL |
| Performance | Memoria | Optimizado |

---

## Funciones más Usadas

### Para Admins
```typescript
await db.getUsers()
await db.getClients()
await db.getProjects()
await db.getTemplates()
await db.getTimeEntries()
```

### Para Líderes
```typescript
await db.getProjectsByLeader(leaderId)
await db.getTimeEntriesByProject(projectId)
```

### Para Desarrolladores
```typescript
await db.getTimeEntriesByUser(userId)
await db.getTimeEntriesByDateRange(start, end)
```

---

## Recursos Adicionales

- Ver `/lib/database.ts` para todas las funciones disponibles
- Ver `/lib/useDatabase.ts` para hooks personalizados
- Ver `DATABASE.md` para documentación completa de la base de datos
