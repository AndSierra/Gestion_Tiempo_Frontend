// Servicio API para comunicarse con el backend

const API_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) 
  ? import.meta.env.VITE_API_URL 
  : 'http://localhost:3001/api';

// Tipos
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'leader' | 'developer';
  password?: string;
  created_at?: string;
}

export interface Client {
  id: number;
  name: string;
  description: string;
  created_at?: string;
}

export interface Project {
  id: number;
  name: string;
  clientId: number;
  client_id?: number;
  leaderId: number;
  leader_id?: number;
  tasks: string;
  clientName?: string;
  leaderName?: string;
  created_at?: string;
}

export interface Template {
  id: number;
  name: string;
  description: string;
  tasks: string;
  created_at?: string;
}

export interface TimeEntry {
  id: number;
  userId: number;
  user_id?: number;
  projectId: number;
  project_id?: number;
  taskName: string;
  task_name?: string;
  date: string;
  startTime: string;
  start_time?: string;
  endTime: string;
  end_time?: string;
  hours: number;
  description: string;
  userName?: string;
  projectName?: string;
  created_at?: string;
}

// Helper para manejar respuestas
async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Error en la petición');
  }
  
  return data;
}

// ==================== AUTENTICACIÓN ====================

export const authApi = {
  async login(email: string, password: string): Promise<ApiResponse<User>> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return handleResponse<User>(response);
  },

  async logout(): Promise<ApiResponse> {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST'
    });
    return handleResponse(response);
  }
};

// ==================== USUARIOS ====================

export const usersApi = {
  async getAll(): Promise<ApiResponse<User[]>> {
    const response = await fetch(`${API_URL}/users`);
    return handleResponse<User[]>(response);
  },

  async getById(id: number): Promise<ApiResponse<User>> {
    const response = await fetch(`${API_URL}/users/${id}`);
    return handleResponse<User>(response);
  },

  async create(user: Omit<User, 'id' | 'created_at'> & { password: string }): Promise<ApiResponse<User>> {
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });
    return handleResponse<User>(response);
  },

  async update(id: number, user: Omit<User, 'id' | 'created_at' | 'password'>): Promise<ApiResponse> {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });
    return handleResponse(response);
  },

  async delete(id: number): Promise<ApiResponse> {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'DELETE'
    });
    return handleResponse(response);
  }
};

// ==================== CLIENTES ====================

export const clientsApi = {
  async getAll(): Promise<ApiResponse<Client[]>> {
    const response = await fetch(`${API_URL}/clients`);
    return handleResponse<Client[]>(response);
  },

  async create(client: Omit<Client, 'id' | 'created_at'>): Promise<ApiResponse<Client>> {
    const response = await fetch(`${API_URL}/clients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(client)
    });
    return handleResponse<Client>(response);
  },

  async update(id: number, client: Omit<Client, 'id' | 'created_at'>): Promise<ApiResponse> {
    const response = await fetch(`${API_URL}/clients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(client)
    });
    return handleResponse(response);
  },

  async delete(id: number): Promise<ApiResponse> {
    const response = await fetch(`${API_URL}/clients/${id}`, {
      method: 'DELETE'
    });
    return handleResponse(response);
  }
};

// ==================== PROYECTOS ====================

export const projectsApi = {
  async getAll(): Promise<ApiResponse<Project[]>> {
    const response = await fetch(`${API_URL}/projects`);
    return handleResponse<Project[]>(response);
  },

  async getByLeader(leaderId: number): Promise<ApiResponse<Project[]>> {
    const response = await fetch(`${API_URL}/projects/leader/${leaderId}`);
    return handleResponse<Project[]>(response);
  },

  async create(project: Omit<Project, 'id' | 'clientName' | 'leaderName' | 'created_at'>): Promise<ApiResponse<Project>> {
    const response = await fetch(`${API_URL}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project)
    });
    return handleResponse<Project>(response);
  },

  async update(id: number, project: Omit<Project, 'id' | 'clientName' | 'leaderName' | 'created_at'>): Promise<ApiResponse> {
    const response = await fetch(`${API_URL}/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project)
    });
    return handleResponse(response);
  },

  async delete(id: number): Promise<ApiResponse> {
    const response = await fetch(`${API_URL}/projects/${id}`, {
      method: 'DELETE'
    });
    return handleResponse(response);
  }
};

// ==================== PLANTILLAS ====================

export const templatesApi = {
  async getAll(): Promise<ApiResponse<Template[]>> {
    const response = await fetch(`${API_URL}/templates`);
    return handleResponse<Template[]>(response);
  },

  async create(template: Omit<Template, 'id' | 'created_at'>): Promise<ApiResponse<Template>> {
    const response = await fetch(`${API_URL}/templates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(template)
    });
    return handleResponse<Template>(response);
  },

  async update(id: number, template: Omit<Template, 'id' | 'created_at'>): Promise<ApiResponse> {
    const response = await fetch(`${API_URL}/templates/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(template)
    });
    return handleResponse(response);
  },

  async delete(id: number): Promise<ApiResponse> {
    const response = await fetch(`${API_URL}/templates/${id}`, {
      method: 'DELETE'
    });
    return handleResponse(response);
  }
};

// ==================== REGISTROS DE TIEMPO ====================

export const timeEntriesApi = {
  async getAll(): Promise<ApiResponse<TimeEntry[]>> {
    const response = await fetch(`${API_URL}/time-entries`);
    return handleResponse<TimeEntry[]>(response);
  },

  async getByUser(userId: number): Promise<ApiResponse<TimeEntry[]>> {
    const response = await fetch(`${API_URL}/time-entries/user/${userId}`);
    return handleResponse<TimeEntry[]>(response);
  },

  async getByProject(projectId: number): Promise<ApiResponse<TimeEntry[]>> {
    const response = await fetch(`${API_URL}/time-entries/project/${projectId}`);
    return handleResponse<TimeEntry[]>(response);
  },

  async getByDateRange(startDate: string, endDate: string): Promise<ApiResponse<TimeEntry[]>> {
    const response = await fetch(`${API_URL}/time-entries/date-range?start=${startDate}&end=${endDate}`);
    return handleResponse<TimeEntry[]>(response);
  },

  async create(entry: Omit<TimeEntry, 'id' | 'userName' | 'projectName' | 'created_at'>): Promise<ApiResponse<TimeEntry>> {
    const response = await fetch(`${API_URL}/time-entries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    });
    return handleResponse<TimeEntry>(response);
  },

  async update(id: number, entry: Omit<TimeEntry, 'id' | 'userId' | 'userName' | 'projectName' | 'created_at'>): Promise<ApiResponse> {
    const response = await fetch(`${API_URL}/time-entries/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    });
    return handleResponse(response);
  },

  async delete(id: number): Promise<ApiResponse> {
    const response = await fetch(`${API_URL}/time-entries/${id}`, {
      method: 'DELETE'
    });
    return handleResponse(response);
  }
};

// Health check
export const healthCheck = async (): Promise<ApiResponse> => {
  const response = await fetch(`${API_URL}/health`);
  return handleResponse(response);
};
