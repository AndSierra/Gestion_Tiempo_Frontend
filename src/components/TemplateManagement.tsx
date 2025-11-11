import React, { useState } from 'react';
import Navigation from './Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { FileText, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTemplates } from '../lib/useDatabase';
import { templatesApi } from '../lib/api';
import type { Template } from '../lib/api';

export default function TemplateManagement() {
  const { templates, reload: reloadTemplates } = useTemplates();

  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    tasks: ''
  });
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
      setIsDialogOpen(false);
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
      setIsDialogOpen(false);
      toast.success('Plantilla actualizada exitosamente');
      reloadTemplates();
    } catch (error) {
      toast.error('Error al actualizar plantilla');
    }
  };

  const handleDeleteTemplate = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar esta plantilla?')) return;

    try {
      await templatesApi.delete(id);
      toast.success('Plantilla eliminada');
      reloadTemplates();
    } catch (error) {
      toast.error('Error al eliminar plantilla');
    }
  };

  const openEditDialog = (template: Template) => {
    setEditingTemplate({ ...template });
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingTemplate(null);
    setNewTemplate({ name: '', description: '', tasks: '' });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Navigation />

      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl mb-2">Gestión de Plantillas</h1>
            <p className="text-gray-600">Crea plantillas reutilizables para proyectos</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Plantillas</p>
                    <p className="text-3xl mt-2">{templates.length}</p>
                  </div>
                  <FileText className="h-12 w-12 text-primary opacity-20" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Plantillas de Proyecto</CardTitle>
                  <CardDescription>Plantillas con tareas predefinidas</CardDescription>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Nueva Plantilla
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingTemplate ? 'Editar Plantilla' : 'Crear Nueva Plantilla'}
                      </DialogTitle>
                      <DialogDescription>
                        {editingTemplate
                          ? 'Modifique los datos de la plantilla'
                          : 'Complete los datos de la nueva plantilla'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="templateName">Nombre de la Plantilla</Label>
                        <Input
                          id="templateName"
                          value={editingTemplate ? editingTemplate.name : newTemplate.name}
                          onChange={(e) => editingTemplate
                            ? setEditingTemplate({ ...editingTemplate, name: e.target.value })
                            : setNewTemplate({ ...newTemplate, name: e.target.value })
                          }
                          placeholder="Ej: Proyecto Web Standard"
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
                          placeholder="Describe para qué tipo de proyectos es esta plantilla"
                          rows={2}
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
                          rows={4}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Ingrese las tareas separadas por comas
                        </p>
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          onClick={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}
                          className="flex-1"
                        >
                          {editingTemplate ? 'Actualizar Plantilla' : 'Crear Plantilla'}
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
                        <div className="flex flex-wrap gap-1">
                          {template.tasks && template.tasks.split(',').slice(0, 3).map((task, idx) => (
                            <span key={idx} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {task.trim()}
                            </span>
                          ))}
                          {template.tasks && template.tasks.split(',').length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{template.tasks.split(',').length - 3} más
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(template)}
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
                  {templates.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                        No hay plantillas creadas
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
