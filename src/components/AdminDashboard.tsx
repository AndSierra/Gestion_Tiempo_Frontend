import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navigation from './Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from './ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import {
  Users,
  Building,
  FolderOpen,
  FileText,
  BarChart3,
  Plus,
  Edit,
  Trash2,
  Download
} from 'lucide-react';
import { toast } from 'sonner';
import { useClients, useProjects, useUsers, useTemplates, useTimeEntries } from '../lib/useDatabase';
import { usersApi, clientsApi, projectsApi, templatesApi } from '../lib/api';
import type { User, Client, Project, Template } from '../lib/api';

export default function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  // Cargar datos desde la API
  const { clients, loading: clientsLoading, reload: reloadClients } = useClients();
  const { projects, loading: projectsLoading, reload: reloadProjects } = useProjects();
  const { users, loading: usersLoading, reload: reloadUsers } = useUsers();
  const { templates, loading: templatesLoading, reload: reloadTemplates } = useTemplates();
  const { timeEntries } = useTimeEntries();

  // Handle tab from URL hash
  const getTabFromHash = () => {
    const hash = location.hash.replace('#', '');
    return hash || 'clients';
  };

  const [activeTab, setActiveTab] = useState(getTabFromHash());

  useEffect(() => {
    setActiveTab(getTabFromHash());
  }, [location.hash]);

  // Client state
  const [newClient, setNewClient] = useState({ name: '', description: '' });
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);

  // Project state
  const initialNewProject = { name: '', clientId: 0, leaderId: 0, tasks: '', developerIds: [] as number[], };
  const [newProject, setNewProject] = useState(initialNewProject);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);

  // User state
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'developer' as 'admin' | 'leader' | 'developer', password: 'default123' });
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);

  // Template state
  const [newTemplate, setNewTemplate] = useState({ name: '', description: '', tasks: '' });
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);

  // Calculate total hours
  const totalHours = timeEntries.reduce((sum, entry) => sum + entry.hours, 0);

  const stats = [
    { title: 'Total Clientes', count: clients.length, icon: Building },
    { title: 'Total Proyectos', count: projects.length, icon: FolderOpen },
    { title: 'Total Usuarios', count: users.length, icon: Users },
    { title: 'Horas Totales', count: totalHours, icon: BarChart3 },
  ];

  // CLIENT HANDLERS
  const handleCreateClient = async () => {
    if (!newClient.name.trim()) {
      toast.error('El nombre del cliente es requerido');
      return;
    }

    try {
      await clientsApi.create({
        name: newClient.name,
        description: newClient.description
      });
      setNewClient({ name: '', description: '' });
      setIsClientDialogOpen(false);
      toast.success('Cliente creado exitosamente');
      reloadClients();
    } catch (error) {
      toast.error('Error al crear cliente');
    }
  };

  const handleUpdateClient = async () => {
    if (!editingClient) return;

    try {
      await clientsApi.update(editingClient.id, {
        name: editingClient.name,
        description: editingClient.description
      });
      setEditingClient(null);
      setIsClientDialogOpen(false);
      toast.success('Cliente actualizado exitosamente');
      reloadClients();
    } catch (error) {
      toast.error('Error al actualizar cliente');
    }
  };

  const handleDeleteClient = async (clientId: number) => {
    if (!confirm('¿Está seguro de eliminar este cliente?')) return;

    try {
      await clientsApi.delete(clientId);
      toast.success('Cliente eliminado');
      reloadClients();
    } catch (error) {
      toast.error('Error al eliminar cliente');
    }
  };

  const openEditClientDialog = (client: Client) => {
    setEditingClient(client);
    setIsClientDialogOpen(true);
  };

  const closeClientDialog = () => {
    setIsClientDialogOpen(false);
    setEditingClient(null);
    setNewClient({ name: '', description: '' });
  };

  // PROJECT HANDLERS
  const handleCreateProject = async () => {
    if (!newProject.name || !newProject.clientId || !newProject.leaderId) {
      toast.error('Todos los campos son requeridos');
      return;
    }

    try {
      await projectsApi.create({
        name: newProject.name,
        clientId: parseInt(newProject.clientId),
        leaderId: parseInt(newProject.leaderId),
        tasks: newProject.tasks,
        developerIds: newProject.developerIds
      });
      setNewProject({ name: '', clientId: '', leaderId: '', tasks: '', developerIds: [] });
      setIsProjectDialogOpen(false);
      toast.success('Proyecto creado exitosamente');
      reloadProjects();
    } catch (error) {
      toast.error('Error al crear proyecto');
    }
  };

  const handleUpdateProject = async () => {
    if (!editingProject) return;

    console.log("Datos enviados al backend:", {
      id: editingProject.id,
      name: editingProject.name,
      clientId: editingProject.clientId,
      leaderId: editingProject.leaderId,
      tasks: editingProject.tasks,
      developerIds: editingProject.developerIds
    });

    try {
      await projectsApi.update(editingProject.id, {
        name: editingProject.name,
        clientId: editingProject.clientId,
        leaderId: editingProject.leaderId,
        tasks: editingProject.tasks,
        developerIds: editingProject.developerIds
      });
      setEditingProject(null);
      setIsProjectDialogOpen(false);
      toast.success('Proyecto actualizado exitosamente');
      reloadProjects();
    } catch (error) {
      toast.error('Error al actualizar proyecto');
    }
  };

  const handleDeleteProject = async (projectId: number) => {
    if (!confirm('¿Está seguro de eliminar este proyecto?')) return;

    try {
      await projectsApi.delete(projectId);
      toast.success('Proyecto eliminado');
      reloadProjects();
    } catch (error) {
      toast.error('Error al eliminar proyecto');
    }
  };

  const openEditProjectDialog = (project: Project) => {
    // Obtener los IDs de los desarrolladores del proyecto
    const developerIds = (project.developers || []).map(dev => dev.id);

    // Normalizar los datos: convertir snake_case a camelCase
    // Asegurarse de que clientId y leaderId sean números válidos
    const normalizedProject: Project = {
      ...project,
      clientId: project.clientId ?? project.client_id ?? 0,
      leaderId: project.leaderId ?? project.leader_id ?? 0,
      developerIds
    };

    setEditingProject(normalizedProject);
    setIsProjectDialogOpen(true);
  };
  const closeProjectDialog = () => {
    setIsProjectDialogOpen(false);
    setEditingProject(null);
    setNewProject({ name: '', clientId: '', leaderId: '', tasks: '', developerIds: [] });
  };

  // USER HANDLERS
  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.role) {
      toast.error('Todos los campos son requeridos');
      return;
    }

    try {
      await usersApi.create({
        name: newUser.name,
        email: newUser.email,
        password: newUser.password || 'default123',
        role: newUser.role
      });
      setNewUser({ name: '', email: '', role: 'developer', password: 'default123' });
      setIsUserDialogOpen(false);
      toast.success('Usuario creado exitosamente');
      reloadUsers();
    } catch (error) {
      toast.error('Error al crear usuario');
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    try {
      await usersApi.update(editingUser.id, {
        name: editingUser.name,
        email: editingUser.email,
        role: editingUser.role
      });
      setEditingUser(null);
      setIsUserDialogOpen(false);
      toast.success('Usuario actualizado exitosamente');
      reloadUsers();
    } catch (error) {
      toast.error('Error al actualizar usuario');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('¿Está seguro de eliminar este usuario?')) return;

    try {
      await usersApi.delete(userId);
      toast.success('Usuario eliminado');
      reloadUsers();
    } catch (error) {
      toast.error('Error al eliminar usuario');
    }
  };

  const openEditUserDialog = (user: User) => {
    setEditingUser(user);
    setIsUserDialogOpen(true);
  };

  const closeUserDialog = () => {
    setIsUserDialogOpen(false);
    setEditingUser(null);
    setNewUser({ name: '', email: '', role: 'developer', password: 'default123' });
  };

  // TEMPLATE HANDLERS
  const handleCreateTemplate = async () => {
    if (!newTemplate.name || !newTemplate.tasks) {
      toast.error('Nombre y tareas son requeridos');
      return;
    }

    try {
      await templatesApi.create({
        name: newTemplate.name,
        description: newTemplate.description,
        tasks: newTemplate.tasks
      });
      setNewTemplate({ name: '', description: '', tasks: '' });
      setIsTemplateDialogOpen(false);
      toast.success('Plantilla creada exitosamente');
      reloadTemplates();
    } catch (error) {
      toast.error('Error al crear plantilla');
    }
  };

  const handleUpdateTemplate = async () => {
    if (!editingTemplate) return;

    try {
      await templatesApi.update(editingTemplate.id, {
        name: editingTemplate.name,
        description: editingTemplate.description,
        tasks: editingTemplate.tasks
      });
      setEditingTemplate(null);
      setIsTemplateDialogOpen(false);
      toast.success('Plantilla actualizada exitosamente');
      reloadTemplates();
    } catch (error) {
      toast.error('Error al actualizar plantilla');
    }
  };

  const handleDeleteTemplate = async (templateId: number) => {
    if (!confirm('¿Está seguro de eliminar esta plantilla?')) return;

    try {
      await templatesApi.delete(templateId);
      toast.success('Plantilla eliminada');
      reloadTemplates();
    } catch (error) {
      toast.error('Error al eliminar plantilla');
    }
  };

  const openEditTemplateDialog = (template: Template) => {
    setEditingTemplate({ ...template });
    setIsTemplateDialogOpen(true);
  };

  const closeTemplateDialog = () => {
    setIsTemplateDialogOpen(false);
    setEditingTemplate(null);
    setNewTemplate({ name: '', description: '', tasks: '' });
  };

  // EXPORT HANDLERS
  const exportData = async (format: 'json') => {
    const data = {
      clients,
      projects,
      users,
      templates,
      timeEntries
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timetracker-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Datos exportados en formato JSON');
  };

  const loading = clientsLoading || projectsLoading || usersLoading || templatesLoading;

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Navigation />

      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl mb-2">Panel de Administración</h1>
            <p className="text-gray-600">Gestiona clientes, proyectos, usuarios y plantillas</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="flex items-center p-6">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <p className="text-3xl mt-2">{stat.count}</p>
                  </div>
                  <stat.icon className="h-12 w-12 text-primary opacity-20" />
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs value={activeTab} onValueChange={(value) => {
            setActiveTab(value);
            navigate(`#${value}`);
          }}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="clients">Clientes</TabsTrigger>
              <TabsTrigger value="projects">Proyectos</TabsTrigger>
              <TabsTrigger value="users">Usuarios</TabsTrigger>
              <TabsTrigger value="templates">Plantillas</TabsTrigger>
            </TabsList>

            {/* Clients Tab */}
            <TabsContent value="clients">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Gestión de Clientes</CardTitle>
                      <CardDescription>Administre los clientes de la organización</CardDescription>
                    </div>
                    <Dialog open={isClientDialogOpen} onOpenChange={setIsClientDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Nuevo Cliente
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{editingClient ? 'Editar Cliente' : 'Crear Nuevo Cliente'}</DialogTitle>
                          <DialogDescription>
                            {editingClient ? 'Modifique los datos del cliente' : 'Ingrese los datos del nuevo cliente'}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="clientName">Nombre</Label>
                            <Input
                              id="clientName"
                              value={editingClient ? editingClient.name : newClient.name}
                              onChange={(e) => editingClient
                                ? setEditingClient({ ...editingClient, name: e.target.value })
                                : setNewClient({ ...newClient, name: e.target.value })
                              }
                              placeholder="Nombre del cliente"
                            />
                          </div>
                          <div>
                            <Label htmlFor="clientDescription">Descripción</Label>
                            <Textarea
                              id="clientDescription"
                              value={editingClient ? editingClient.description || '' : newClient.description}
                              onChange={(e) => editingClient
                                ? setEditingClient({ ...editingClient, description: e.target.value })
                                : setNewClient({ ...newClient, description: e.target.value })
                              }
                              placeholder="Descripción opcional"
                            />
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              onClick={editingClient ? handleUpdateClient : handleCreateClient}
                              className="flex-1"
                            >
                              {editingClient ? 'Actualizar Cliente' : 'Crear Cliente'}
                            </Button>
                            <Button variant="outline" onClick={closeClientDialog}>
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">Cargando clientes...</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Descripción</TableHead>
                          <TableHead>Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {clients.map((client) => (
                          <TableRow key={client.id}>
                            <TableCell>{client.name}</TableCell>
                            <TableCell>{client.description || '-'}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditClientDialog(client)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteClient(client.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Projects Tab */}
            <TabsContent value="projects">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Gestión de Proyectos</CardTitle>
                      <CardDescription>Administre los proyectos y asigne líderes</CardDescription>
                    </div>
                    <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
                      <DialogTrigger asChild>
                        <Button onClick={() => {
                          setEditingProject(null);
                          setNewProject({ name: '', clientId: '', leaderId: '', tasks: '', developerIds: [] });
                          setIsProjectDialogOpen(true);
                        }}>
                          <Plus className="h-4 w-4 mr-2" />
                          Nuevo Proyecto
                        </Button>
                      </DialogTrigger>

                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{editingProject ? 'Editar Proyecto' : 'Crear Nuevo Proyecto'}</DialogTitle>
                          <DialogDescription>
                            {editingProject ? 'Modifique los datos del proyecto' : 'Ingrese los datos del nuevo proyecto'}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="projectName">Nombre del Proyecto</Label>
                            <Input
                              id="projectName"
                              value={editingProject ? editingProject.name : newProject.name}
                              onChange={(e) => editingProject
                                ? setEditingProject({ ...editingProject, name: e.target.value })
                                : setNewProject({ ...newProject, name: e.target.value })
                              }
                              placeholder="Nombre del proyecto"
                            />
                          </div>
                          <div>
                            <Label htmlFor="projectClient">Cliente</Label>
                            <Select
                              value={editingProject ? ((editingProject.clientId || editingProject.clientid)?.toString() || '') : newProject.clientId}
                              onValueChange={(value) => editingProject
                                ? setEditingProject({ ...editingProject, clientId: parseInt(value) })
                                : setNewProject({ ...newProject, clientId: parseInt(value) })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccione un cliente" />
                              </SelectTrigger>
                              <SelectContent>
                                {clients.map((client) => (
                                  <SelectItem key={client.id} value={client.id.toString()}>
                                    {client.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="projectLeader">Líder del Proyecto</Label>
                            <Select
                              value={editingProject ? ((editingProject.leaderId || editingProject.leader_id)?.toString() || '') : newProject.leaderId}
                              onValueChange={(value) => editingProject
                                ? setEditingProject({ ...editingProject, leaderId: parseInt(value) })
                                : setNewProject({ ...newProject, leaderId: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccione un líder" />
                              </SelectTrigger>
                              <SelectContent>
                                {users.filter(u => u.role === 'leader' || u.role === 'admin').map((user) => (
                                  <SelectItem key={user.id} value={user.id.toString()}>
                                    {user.name} ({user.role})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Selector de Plantilla */}
                          {!editingProject && (
                            <div>
                              <Label htmlFor="projectTemplate">Plantilla (Opcional)</Label>
                              <Select
                                value=""
                                onValueChange={(value) => {
                                  const template = templates.find(t => t.id.toString() === value);
                                  if (template) {
                                    setNewProject({ ...newProject, tasks: template.tasks });
                                    toast.success('Tareas cargadas desde la plantilla');
                                  }
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Cargar desde plantilla" />
                                </SelectTrigger>
                                <SelectContent>
                                  {templates.map((template) => (
                                    <SelectItem key={template.id} value={template.id.toString()}>
                                      {template.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}

                          <div>
                            <Label htmlFor="projectTasks">Tareas (separadas por coma)</Label>
                            <Textarea
                              id="projectTasks"
                              value={editingProject ? editingProject.tasks : newProject.tasks}
                              onChange={(e) => editingProject
                                ? setEditingProject({ ...editingProject, tasks: e.target.value })
                                : setNewProject({ ...newProject, tasks: e.target.value })
                              }
                              placeholder="Frontend, Backend, Testing, Deployment"
                            />
                          </div>

                          {/* Selector de Desarrolladores */}
                          <div>
                            <Label>Desarrolladores Asignados</Label>
                            <div className="border rounded-md p-3 space-y-2 max-h-40 overflow-y-auto">
                              {users.filter(u => u.role === 'developer').map((developer) => (
                                <label key={developer.id} className="flex items-center space-x-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={editingProject
                                      ? (editingProject.developerIds || []).includes(developer.id)
                                      : newProject.developerIds.includes(developer.id)
                                    }
                                    onChange={(e) => {
                                      if (editingProject) {
                                        const currentIds = editingProject.developerIds || [];
                                        const newIds = e.target.checked
                                          ? [...currentIds, developer.id]
                                          : currentIds.filter(id => id !== developer.id);
                                        setEditingProject({ ...editingProject, developerIds: newIds });
                                      } else {
                                        const newIds = e.target.checked
                                          ? [...newProject.developerIds, developer.id]
                                          : newProject.developerIds.filter(id => id !== developer.id);
                                        setNewProject({ ...newProject, developerIds: newIds });
                                      }
                                    }}
                                    className="rounded"
                                  />
                                  <span className="text-sm">{developer.name} ({developer.email})</span>
                                </label>
                              ))}
                              {users.filter(u => u.role === 'developer').length === 0 && (
                                <p className="text-sm text-muted-foreground">No hay desarrolladores disponibles</p>
                              )}
                            </div>
                          </div>

                          <div className="flex space-x-2">
                            <Button
                              onClick={editingProject ? handleUpdateProject : handleCreateProject}
                              className="flex-1"
                            >
                              {editingProject ? 'Actualizar Proyecto' : 'Crear Proyecto'}
                            </Button>
                            <Button variant="outline" onClick={closeProjectDialog}>
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">Cargando proyectos...</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Líder</TableHead>
                          <TableHead>Tareas</TableHead>
                          <TableHead>Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {projects.map((project) => (
                          <TableRow key={project.id}>
                            <TableCell>{project.name}</TableCell>
                            <TableCell>{project.clientName || `ID: ${project.clientId}`}</TableCell>
                            <TableCell>{project.leaderName || `ID: ${project.leaderId}`}</TableCell>
                            <TableCell>
                              {project.tasks ? project.tasks.split(',').length : 0} tareas
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditProjectDialog(project)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteProject(project.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Gestión de Usuarios</CardTitle>
                      <CardDescription>Administre los usuarios del sistema</CardDescription>
                    </div>
                    <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Nuevo Usuario
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</DialogTitle>
                          <DialogDescription>
                            {editingUser ? 'Modifique los datos del usuario' : 'Ingrese los datos del nuevo usuario'}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="userName">Nombre</Label>
                            <Input
                              id="userName"
                              value={editingUser ? editingUser.name : newUser.name}
                              onChange={(e) => editingUser
                                ? setEditingUser({ ...editingUser, name: e.target.value })
                                : setNewUser({ ...newUser, name: e.target.value })
                              }
                              placeholder="Nombre completo"
                            />
                          </div>
                          <div>
                            <Label htmlFor="userEmail">Email</Label>
                            <Input
                              id="userEmail"
                              type="email"
                              value={editingUser ? editingUser.email : newUser.email}
                              onChange={(e) => editingUser
                                ? setEditingUser({ ...editingUser, email: e.target.value })
                                : setNewUser({ ...newUser, email: e.target.value })
                              }
                              placeholder="email@ejemplo.com"
                            />
                          </div>
                          {!editingUser && (
                            <div>
                              <Label htmlFor="userPassword">Contraseña</Label>
                              <Input
                                id="userPassword"
                                type="password"
                                value={newUser.password}
                                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                placeholder="Contraseña"
                              />
                            </div>
                          )}
                          <div>
                            <Label htmlFor="userRole">Rol</Label>
                            <Select
                              value={editingUser ? editingUser.role : newUser.role}
                              onValueChange={(value: 'admin' | 'leader' | 'developer') => editingUser
                                ? setEditingUser({ ...editingUser, role: value })
                                : setNewUser({ ...newUser, role: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccione un rol" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">Administrador</SelectItem>
                                <SelectItem value="leader">Líder</SelectItem>
                                <SelectItem value="developer">Desarrollador</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              onClick={editingUser ? handleUpdateUser : handleCreateUser}
                              className="flex-1"
                            >
                              {editingUser ? 'Actualizar Usuario' : 'Crear Usuario'}
                            </Button>
                            <Button variant="outline" onClick={closeUserDialog}>
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">Cargando usuarios...</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Rol</TableHead>
                          <TableHead>Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Badge variant={
                                user.role === 'admin' ? 'destructive' :
                                  user.role === 'leader' ? 'default' :
                                    'secondary'
                              }>
                                {user.role === 'admin' ? 'Administrador' :
                                  user.role === 'leader' ? 'Líder' :
                                    'Desarrollador'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditUserDialog(user)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteUser(user.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Templates Tab */}
            <TabsContent value="templates">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Gestión de Plantillas</CardTitle>
                      <CardDescription>Plantillas reutilizables para proyectos</CardDescription>
                    </div>
                    <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Nueva Plantilla
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{editingTemplate ? 'Editar Plantilla' : 'Crear Nueva Plantilla'}</DialogTitle>
                          <DialogDescription>
                            {editingTemplate ? 'Modifique los datos de la plantilla' : 'Ingrese los datos de la nueva plantilla'}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="templateName">Nombre</Label>
                            <Input
                              id="templateName"
                              value={editingTemplate ? editingTemplate.name : newTemplate.name}
                              onChange={(e) => editingTemplate
                                ? setEditingTemplate({ ...editingTemplate, name: e.target.value })
                                : setNewTemplate({ ...newTemplate, name: e.target.value })
                              }
                              placeholder="Nombre de la plantilla"
                            />
                          </div>
                          <div>
                            <Label htmlFor="templateDescription">Descripción</Label>
                            <Textarea
                              id="templateDescription"
                              value={editingTemplate ? editingTemplate.description || '' : newTemplate.description}
                              onChange={(e) => editingTemplate
                                ? setEditingTemplate({ ...editingTemplate, description: e.target.value })
                                : setNewTemplate({ ...newTemplate, description: e.target.value })
                              }
                              placeholder="Descripción de la plantilla"
                            />
                          </div>
                          <div>
                            <Label htmlFor="templateTasks">Tareas (separadas por coma)</Label>
                            <Textarea
                              id="templateTasks"
                              value={editingTemplate ? editingTemplate.tasks : newTemplate.tasks}
                              onChange={(e) => editingTemplate
                                ? setEditingTemplate({ ...editingTemplate, tasks: e.target.value })
                                : setNewTemplate({ ...newTemplate, tasks: e.target.value })
                              }
                              placeholder="Frontend, Backend, Testing, Deployment"
                            />
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              onClick={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}
                              className="flex-1"
                            >
                              {editingTemplate ? 'Actualizar Plantilla' : 'Crear Plantilla'}
                            </Button>
                            <Button variant="outline" onClick={closeTemplateDialog}>
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">Cargando plantillas...</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Descripción</TableHead>
                          <TableHead>Tareas</TableHead>
                          <TableHead>Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {templates.map((template) => (
                          <TableRow key={template.id}>
                            <TableCell>{template.name}</TableCell>
                            <TableCell>{template.description || '-'}</TableCell>
                            <TableCell>
                              {template.tasks ? template.tasks.split(',').length : 0} tareas
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditTemplateDialog(template)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteTemplate(template.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Export Button */}
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Exportar Datos</CardTitle>
                <CardDescription>Descargue todos los datos del sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => exportData('json')}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar como JSON
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
