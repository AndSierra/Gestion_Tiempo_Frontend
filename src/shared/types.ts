/**
 * Tipos compartidos entre el cliente y el servidor
 * Estos tipos aseguran consistencia en toda la aplicación
 */

// Roles de usuario
export type UserRole = 'admin' | 'leader' | 'developer';

// Usuario
export interface User {
  id: number;
  name: string;
  email: string;
  password?: string; // Solo para crear/actualizar, no se envía al cliente
  role: UserRole;
  created_at?: string;
}

// Cliente
export interface Client {
  id: number;
  name: string;
  description: string;
  created_at?: string;
}

// Proyecto
export interface Project {
  id: number;
  name: string;
  clientId: number;
  client_id?: number; // Alias para compatibilidad con SQLite
  leaderId: number;
  leader_id?: number; // Alias para compatibilidad con SQLite
  tasks: string;
  clientName?: string; // Populated field
  leaderName?: string; // Populated field
  created_at?: string;
}

// Plantilla
export interface Template {
  id: number;
  name: string;
  description: string;
  tasks: string;
  created_at?: string;
}

// Registro de tiempo
export interface TimeEntry {
  id: number;
  userId: number;
  user_id?: number; // Alias para compatibilidad con SQLite
  projectId: number;
  project_id?: number; // Alias para compatibilidad con SQLite
  taskName: string;
  task_name?: string; // Alias para compatibilidad con SQLite
  date: string; // Formato: YYYY-MM-DD
  startTime: string; // Formato: HH:MM
  start_time?: string; // Alias para compatibilidad con SQLite
  endTime: string; // Formato: HH:MM
  end_time?: string; // Alias para compatibilidad con SQLite
  hours: number;
  description: string;
  userName?: string; // Populated field
  projectName?: string; // Populated field
  created_at?: string;
}

// Respuesta de API genérica
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Credenciales de login
export interface LoginCredentials {
  email: string;
  password: string;
}

// Payload para crear usuario
export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

// Payload para actualizar usuario
export interface UpdateUserPayload {
  name: string;
  email: string;
  role: UserRole;
}

// Payload para crear cliente
export interface CreateClientPayload {
  name: string;
  description: string;
}

// Payload para crear proyecto
export interface CreateProjectPayload {
  name: string;
  clientId: number;
  leaderId: number;
  tasks?: string;
  developerIds?: number[];
}

// Payload para crear plantilla
export interface CreateTemplatePayload {
  name: string;
  description: string;
  tasks: string;
}

// Payload para crear registro de tiempo
export interface CreateTimeEntryPayload {
  userId: number;
  projectId: number;
  taskName: string;
  date: string;
  startTime: string;
  endTime: string;
  hours: number;
  description?: string;
}

// Payload para actualizar registro de tiempo
export interface UpdateTimeEntryPayload {
  projectId: number;
  taskName: string;
  date: string;
  startTime: string;
  endTime: string;
  hours: number;
  description?: string;
}

// Filtros para reportes
export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  userId?: number;
  projectId?: number;
  clientId?: number;
}

// Estadísticas de tiempo
export interface TimeStats {
  totalHours: number;
  totalEntries: number;
  avgHoursPerDay: number;
  mostProductiveDay: string;
}

// Estadísticas de proyecto
export interface ProjectStats {
  projectId: number;
  projectName: string;
  totalHours: number;
  totalEntries: number;
  developers: number;
}
