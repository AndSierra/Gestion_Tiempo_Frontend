import React, { useState } from 'react';
import Navigation from './Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Plus, Edit, Trash2, FolderPlus } from 'lucide-react';
import { toast } from 'sonner';
import { useClients, useProjects, useUsers, useTemplates } from '../lib/useDatabase';
import { projectsApi } from '../lib/api';
import type { Project } from '../lib/api';

export default function ProjectManagement() {
  const { clients } = useClients();
  const { projects, reload: reloadProjects } = useProjects();
  const { users } = useUsers();
  const { templates } = useTemplates();

  const [newProject, setNewProject] = useState({
    name: '',
    clientId: '',
    leaderId: '',
    tasks: ''
  });
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');

  const leaders = users.filter(u => u.role === 'leader' || u.role === 'admin');

  const handleApplyTemplate = () => {
    if (!selectedTemplateId) return;
    
    const template = templates.find(t => t.id === parseInt(selectedTemplateId));
    if (template) {
      setNewProject({
        ...newProject,
        tasks: template.tasks
      });
      toast.success(`Plantilla "${template.name}" aplicada`);
    }
  };

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
        tasks: newProject.tasks
      });
      setNewProject({ name: '', clientId: '', leaderId: '', tasks: '' });
      setSelectedTemplateId('');
      setIsDialogOpen(false);
      toast.success('Proyecto creado exitosamente');
      reloadProjects();
    } catch (error) {
      toast.error('Error al crear proyecto');
    }
  };

  const handleUpdateProject = async () => {
    if (!editingProject) return;

    try {
      await projectsApi.update(editingProject.id, {
        name: editingProject.name,
        clientId: editingProject.clientId,
        leaderId: editingProject.leaderId,
        tasks: editingProject.tasks
      });
      setEditingProject(null);
      setIsDialogOpen(false);
      toast.success('Proyecto actualizado exitosamente');
      reloadProjects();
    } catch (error) {
      toast.error('Error al actualizar proyecto');
    }
  };

  const handleDeleteProject = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar este proyecto?')) return;

    try {
      await projectsApi.delete(id);
      toast.success('Proyecto eliminado');
      reloadProjects();
    } catch (error) {
      toast.error('Error al eliminar proyecto');
    }
  };

  const openEditDialog = (project: Project) => {
    setEditingProject(project);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingProject(null);
    setNewProject({ name: '', clientId: '', leaderId: '', tasks: '' });
    setSelectedTemplateId('');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Navigation />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl mb-2">Gestión de Proyectos</h1>
            <p className="text-gray-600">Administra proyectos y aplica plantillas</p>
          </div>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Proyectos</CardTitle>
                  <CardDescription>Lista de todos los proyectos</CardDescription>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Nuevo Proyecto
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        {editingProject ? 'Editar Proyecto' : 'Crear Nuevo Proyecto'}
                      </DialogTitle>
                      <DialogDescription>
                        {editingProject 
                          ? 'Modifique los datos del proyecto' 
                          : 'Complete los datos del nuevo proyecto'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      {!editingProject && templates.length > 0 && (
                        <div className="p-4 bg-blue-50 rounded-md space-y-3">
                          <Label>Usar plantilla (opcional)</Label>
                          <div className="flex gap-2">
                            <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                              <SelectTrigger className="flex-1">
                                <SelectValue placeholder="Seleccione una plantilla" />
                              </SelectTrigger>
                              <SelectContent>
                                {templates.map((template) => (
                                  <SelectItem key={template.id} value={template.id.toString()}>
                                    {template.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button 
                              variant="outline" 
                              onClick={handleApplyTemplate}
                              disabled={!selectedTemplateId}
                            >
                              <FolderPlus className="h-4 w-4 mr-2" />
                              Aplicar
                            </Button>
                          </div>
                        </div>
                      )}

                      <div>
                        <Label htmlFor="projectName">Nombre del Proyecto</Label>
                        <Input
                          id="projectName"
                          value={editingProject ? editingProject.name : newProject.name}
                          onChange={(e) => editingProject
                            ? setEditingProject({...editingProject, name: e.target.value})
                            : setNewProject({...newProject, name: e.target.value})
                          }
                          placeholder="Nombre del proyecto"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="client">Cliente</Label>
                          <Select
                            value={editingProject ? editingProject.clientId.toString() : newProject.clientId}
                            onValueChange={(value) => editingProject
                              ? setEditingProject({...editingProject, clientId: parseInt(value)})
                              : setNewProject({...newProject, clientId: value})
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
                          <Label htmlFor="leader">Líder del Proyecto</Label>
                          <Select
                            value={editingProject ? editingProject.leaderId.toString() : newProject.leaderId}
                            onValueChange={(value) => editingProject
                              ? setEditingProject({...editingProject, leaderId: parseInt(value)})
                              : setNewProject({...newProject, leaderId: value})
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione un líder" />
                            </SelectTrigger>
                            <SelectContent>
                              {leaders.map((user) => (
                                <SelectItem key={user.id} value={user.id.toString()}>
                                  {user.name} ({user.role})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="tasks">Tareas (separadas por coma)</Label>
                        <Textarea
                          id="tasks"
                          value={editingProject ? editingProject.tasks : newProject.tasks}
                          onChange={(e) => editingProject
                            ? setEditingProject({...editingProject, tasks: e.target.value})
                            : setNewProject({...newProject, tasks: e.target.value})
                          }
                          placeholder="Frontend, Backend, Testing, Deployment"
                          rows={4}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Ingrese las tareas separadas por comas. Estas tareas estarán disponibles para los desarrolladores.
                        </p>
                      </div>

                      <div className="flex space-x-2">
                        <Button 
                          onClick={editingProject ? handleUpdateProject : handleCreateProject}
                          className="flex-1"
                        >
                          {editingProject ? 'Actualizar Proyecto' : 'Crear Proyecto'}
                        </Button>
                        <Button variant="outline" onClick={closeDialog}>
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
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
                        <div className="flex flex-wrap gap-1">
                          {project.tasks && project.tasks.split(',').slice(0, 3).map((task, idx) => (
                            <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {task.trim()}
                            </span>
                          ))}
                          {project.tasks && project.tasks.split(',').length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{project.tasks.split(',').length - 3} más
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(project)}
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
                  {projects.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                        No hay proyectos creados
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
