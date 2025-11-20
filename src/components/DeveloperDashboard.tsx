import React, { useState, useEffect } from 'react';
import Navigation from './Navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Textarea } from './ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from './ui/tabs';
import { Clock, Plus, Trash2 } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { toast } from 'sonner';
import { useProjects, useTimeEntries } from '../lib/useDatabase';
import { timeEntriesApi } from '../lib/api';

export default function DeveloperDashboard() {
  const { user } = useAuth();
  const { projects } = useProjects();
  const { timeEntries, reload: reloadTimeEntries } = useTimeEntries(user?.id);
  
  const [newEntry, setNewEntry] = useState({
    projectId: '',
    taskName: '',
    customTask: '',
    useCustomTask: false,
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    description: ''
  });

  // Get tasks from selected project
  const selectedProject = projects.find(p => p.id === parseInt(newEntry.projectId));
  const availableTasks = selectedProject?.tasks ? selectedProject.tasks.split(',').map(t => t.trim()) : [];

  const calculateHours = (start: string, end: string): number => {
    if (!start || !end) return 0;

    const startTime = new Date(`2000-01-01 ${start}`);
    const endTime = new Date(`2000-01-01 ${end}`);

    if (endTime <= startTime) return 0;

    const diffMs = endTime.getTime() - startTime.getTime();
    const diffHrs = diffMs / (1000 * 60 * 60);
    return Math.round(diffHrs * 10) / 10;
  };

  const validateTimeEntry = (): boolean => {
    if (!newEntry.projectId) {
      toast.error('Debe seleccionar un proyecto');
      return false;
    }

    const taskName = newEntry.useCustomTask ? newEntry.customTask : newEntry.taskName;
    if (!taskName) {
      toast.error('Debe seleccionar o ingresar una tarea');
      return false;
    }

    if (!newEntry.date) {
      toast.error('Debe seleccionar una fecha');
      return false;
    }

    if (!newEntry.startTime || !newEntry.endTime) {
      toast.error('Debe ingresar hora de inicio y fin');
      return false;
    }

    const hours = calculateHours(newEntry.startTime, newEntry.endTime);
    if (hours <= 0) {
      toast.error('La hora de fin debe ser posterior a la hora de inicio');
      return false;
    }

    if (hours > 12) {
      toast.error('No se pueden registrar más de 12 horas por día');
      return false;
    }

    // Validar que no haya overlap con otras entradas del mismo día
    const dayEntries = timeEntries.filter(e => e.date === newEntry.date);
    const newStart = new Date(`2000-01-01 ${newEntry.startTime}`);
    const newEnd = new Date(`2000-01-01 ${newEntry.endTime}`);

    for (const entry of dayEntries) {
      const existingStart = new Date(`2000-01-01 ${entry.startTime}`);
      const existingEnd = new Date(`2000-01-01 ${entry.endTime}`);

      if (
        (newStart >= existingStart && newStart < existingEnd) ||
        (newEnd > existingStart && newEnd <= existingEnd) ||
        (newStart <= existingStart && newEnd >= existingEnd)
      ) {
        toast.error('El horario se superpone con otro registro existente');
        return false;
      }
    }

    // Validar total de horas del día
    const totalDayHours = dayEntries.reduce((sum, e) => sum + e.hours, 0) + hours;
    if (totalDayHours > 12) {
      toast.error(`El total de horas del día excedería 12 horas (actual: ${totalDayHours})`);
      return false;
    }

    return true;
  };

  const handleCreateEntry = async () => {
    if (!user || !validateTimeEntry()) return;

    const hours = calculateHours(newEntry.startTime, newEntry.endTime);
    const taskName = newEntry.useCustomTask ? newEntry.customTask : newEntry.taskName;

    try {
      await timeEntriesApi.create({
        userId: user.id,
        projectId: parseInt(newEntry.projectId),
        taskName,
        date: newEntry.date,
        startTime: newEntry.startTime,
        endTime: newEntry.endTime,
        hours,
        description: newEntry.description
      });

      toast.success('Registro de tiempo creado exitosamente');
      setNewEntry({
        projectId: '',
        taskName: '',
        customTask: '',
        useCustomTask: false,
        date: new Date().toISOString().split('T')[0],
        startTime: '',
        endTime: '',
        description: ''
      });
      reloadTimeEntries();
    } catch (error) {
      toast.error('Error al crear registro de tiempo');
    }
  };

  const handleDeleteEntry = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar este registro?')) return;

    try {
      await timeEntriesApi.delete(id);
      toast.success('Registro eliminado');
      reloadTimeEntries();
    } catch (error) {
      toast.error('Error al eliminar registro');
    }
  };

  const totalHoursToday = timeEntries
    .filter(e => e.date === newEntry.date)
    .reduce((sum, e) => sum + e.hours, 0);

  const totalHoursWeek = (() => {
    const today = new Date(newEntry.date + 'T00:00:00');
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const startStr = startOfWeek.toISOString().split('T')[0];
    const endStr = endOfWeek.toISOString().split('T')[0];

    return timeEntries
      .filter(e => e.date >= startStr && e.date <= endStr)
      .reduce((sum, e) => sum + e.hours, 0);
  })();

  const totalHoursMonth = (() => {
    const [year, month] = newEntry.date.split('-');
    return timeEntries
      .filter(e => e.date.startsWith(`${year}-${month}`))
      .reduce((sum, e) => sum + e.hours, 0);
  })();

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Navigation />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl mb-2">Panel de Desarrollador</h1>
            <p className="text-gray-600">Registra tus horas de trabajo diarias</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Horas Hoy</p>
                    <p className="text-3xl mt-2">{totalHoursToday}</p>
                  </div>
                  <Clock className="h-12 w-12 text-primary opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Horas Semana</p>
                    <p className="text-3xl mt-2">{totalHoursWeek}</p>
                  </div>
                  <Clock className="h-12 w-12 text-primary opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Horas Mes</p>
                    <p className="text-3xl mt-2">{totalHoursMonth}</p>
                  </div>
                  <Clock className="h-12 w-12 text-primary opacity-20" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="register">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="register">Registrar Horas</TabsTrigger>
              <TabsTrigger value="history">Historial</TabsTrigger>
            </TabsList>

            {/* Register Tab */}
            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>Nuevo Registro de Tiempo</CardTitle>
                  <CardDescription>
                    Registra tus horas de trabajo (máximo 9 horas por día)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="project">Proyecto</Label>
                      <Select
                        value={newEntry.projectId}
                        onValueChange={(value: any) =>
                          setNewEntry({ ...newEntry, projectId: value, taskName: '' })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione un proyecto" />
                        </SelectTrigger>
                        <SelectContent>
                          {projects.map((project) => (
                            <SelectItem key={project.id} value={project.id.toString()}>
                              {project.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="date">Fecha</Label>
                      <Input
                        id="date"
                        type="date"
                        value={newEntry.date}
                        onChange={(e) =>
                          setNewEntry({ ...newEntry, date: e.target.value })
                        }
                        max={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>

                  {newEntry.projectId && (
                    <div>
                      <div className="flex items-center mb-2">
                        <input
                          type="checkbox"
                          id="customTask"
                          className="mr-2"
                          checked={newEntry.useCustomTask}
                          onChange={(e) =>
                            setNewEntry({
                              ...newEntry,
                              useCustomTask: e.target.checked,
                              taskName: '',
                              customTask: ''
                            })
                          }
                        />
                        <Label htmlFor="customTask">Usar tarea personalizada</Label>
                      </div>

                      {newEntry.useCustomTask ? (
                        <div>
                          <Label htmlFor="customTaskInput">Tarea Personalizada</Label>
                          <Input
                            id="customTaskInput"
                            value={newEntry.customTask}
                            onChange={(e) =>
                              setNewEntry({ ...newEntry, customTask: e.target.value })
                            }
                            placeholder="Nombre de la tarea"
                          />
                        </div>
                      ) : (
                        <div>
                          <Label htmlFor="task">Tarea</Label>
                          <Select
                            value={newEntry.taskName}
                            onValueChange={(value: any) =>
                              setNewEntry({ ...newEntry, taskName: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione una tarea" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableTasks.map((task, index) => (
                                <SelectItem key={index} value={task}>
                                  {task}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startTime">Hora de Inicio</Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={newEntry.startTime}
                        onChange={(e) =>
                          setNewEntry({ ...newEntry, startTime: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="endTime">Hora de Fin</Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={newEntry.endTime}
                        onChange={(e) =>
                          setNewEntry({ ...newEntry, endTime: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  {newEntry.startTime && newEntry.endTime && (
                    <div className="p-4 bg-blue-50 rounded-md">
                      <p className="text-sm">
                        Total de horas:{' '}
                        <strong>
                          {calculateHours(newEntry.startTime, newEntry.endTime)} horas
                        </strong>
                      </p>
                      <p className="text-sm text-gray-600">
                        Horas ya registradas hoy: {totalHoursToday}
                      </p>
                      <p className="text-sm text-gray-600">
                        Total del día:{' '}
                        {totalHoursToday + calculateHours(newEntry.startTime, newEntry.endTime)}{' '}
                        / 9 horas
                      </p>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="description">Descripción (Opcional)</Label>
                    <Textarea
                      id="description"
                      value={newEntry.description}
                      onChange={(e) =>
                        setNewEntry({ ...newEntry, description: e.target.value })
                      }
                      placeholder="Describe el trabajo realizado..."
                      rows={3}
                    />
                  </div>

                  <Button onClick={handleCreateEntry} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Registrar Tiempo
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Historial de Registros</CardTitle>
                  <CardDescription>
                    Tus registros de tiempo recientes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Proyecto</TableHead>
                        <TableHead>Tarea</TableHead>
                        <TableHead>Horario</TableHead>
                        <TableHead>Horas</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {timeEntries
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((entry) => (
                          <TableRow key={entry.id}>
                            <TableCell>
                              {entry.date}
                            </TableCell>
                            <TableCell>
                              {entry.projectName || `Proyecto ${entry.projectId}`}
                            </TableCell>
                            <TableCell>{entry.task_name}</TableCell>
                            <TableCell>
                              {entry.start_time} - {entry.end_time}
                            </TableCell>
                            <TableCell>{entry.hours}h</TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteEntry(entry.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      {timeEntries.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                            No hay registros de tiempo
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}