import { useState, useEffect } from 'react';
import { usersApi, clientsApi, projectsApi, templatesApi, timeEntriesApi } from './api';
import type { User, Client, Project, Template, TimeEntry } from './api';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await usersApi.getAll();
      if (response.success && response.data) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return { users, loading, reload: loadUsers };
}

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const loadClients = async () => {
    setLoading(true);
    try {
      const response = await clientsApi.getAll();
      if (response.success && response.data) {
        setClients(response.data);
      }
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  return { clients, loading, reload: loadClients };
}

export function useProjects(leaderId?: number) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const response = leaderId 
        ? await projectsApi.getByLeader(leaderId)
        : await projectsApi.getAll();
      
      if (response.success && response.data) {
        setProjects(response.data);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [leaderId]);

  return { projects, loading, reload: loadProjects };
}

export function useTemplates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const response = await templatesApi.getAll();
      if (response.success && response.data) {
        setTemplates(response.data);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  return { templates, loading, reload: loadTemplates };
}

export function useTimeEntries(userId?: number, projectId?: number, leaderId?: number) {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTimeEntries = async () => {
    setLoading(true);
    try {
      let response;
      if (userId) {
        response = await timeEntriesApi.getByUser(userId);
      } else if (projectId) {
        response = await timeEntriesApi.getByProject(projectId);
      } else if (leaderId) {
        response = await timeEntriesApi.getByLeader(leaderId);
      } else {
        response = await timeEntriesApi.getAll();
      }
      
      if (response.success && response.data) {
        setTimeEntries(response.data);

      }
    } catch (error) {
      console.error('Error loading time entries:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTimeEntries();
  }, [userId, projectId, leaderId]);

  return { timeEntries, loading, reload: loadTimeEntries };
}
