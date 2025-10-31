import React, { useState } from 'react';
import Navigation from './Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Download, FileDown } from 'lucide-react';
import { toast } from 'sonner';
import { useClients, useProjects, useUsers, useTimeEntries } from '../lib/useDatabase';

export default function GlobalReports() {
  const { clients } = useClients();
  const { projects } = useProjects();
  const { users } = useUsers();
  const { timeEntries } = useTimeEntries();

  const [filters, setFilters] = useState({
    clientId: 'all',
    projectId: 'all',
    userId: 'all',
    startDate: '',
    endDate: ''
  });

  const filteredEntries = timeEntries.filter(entry => {
    if (filters.clientId !== 'all') {
      const project = projects.find(p => p.id === entry.projectId);
      if (project && project.clientId !== parseInt(filters.clientId)) return false;
    }
    if (filters.projectId !== 'all' && entry.projectId !== parseInt(filters.projectId)) return false;
    if (filters.userId !== 'all' && entry.userId !== parseInt(filters.userId)) return false;
    if (filters.startDate && entry.date < filters.startDate) return false;
    if (filters.endDate && entry.date > filters.endDate) return false;
    return true;
  });

  const totalHours = filteredEntries.reduce((sum, entry) => sum + entry.hours, 0);

  const exportJSON = () => {
    const data = {
      filtros: {
        cliente: filters.clientId !== 'all' 
          ? clients.find(c => c.id === parseInt(filters.clientId))?.name 
          : 'Todos',
        proyecto: filters.projectId !== 'all'
          ? projects.find(p => p.id === parseInt(filters.projectId))?.name
          : 'Todos',
        usuario: filters.userId !== 'all'
          ? users.find(u => u.id === parseInt(filters.userId))?.name
          : 'Todos',
        fechaInicio: filters.startDate || 'Sin límite',
        fechaFin: filters.endDate || 'Sin límite'
      },
      resumen: {
        totalRegistros: filteredEntries.length,
        totalHoras: totalHours
      },
      registros: filteredEntries.map(entry => ({
        fecha: entry.date,
        usuario: entry.userName || `ID: ${entry.userId}`,
        proyecto: entry.projectName || `ID: ${entry.projectId}`,
        tarea: entry.taskName,
        inicio: entry.startTime,
        fin: entry.endTime,
        horas: entry.hours,
        descripcion: entry.description
      }))
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-global-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Reporte exportado en formato JSON');
  };

  const exportExcel = () => {
    const rows = [
      ['Fecha', 'Usuario', 'Proyecto', 'Tarea', 'Inicio', 'Fin', 'Horas', 'Descripción'].join(',')
    ];

    filteredEntries.forEach(entry => {
      rows.push([
        entry.date,
        entry.userName || `ID: ${entry.userId}`,
        entry.projectName || `ID: ${entry.projectId}`,
        entry.taskName,
        entry.startTime,
        entry.endTime,
        entry.hours,
        `"${entry.description.replace(/"/g, '""')}"`
      ].join(','));
    });

    const csv = rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-global-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Reporte exportado en formato CSV (Excel)');
  };

  // Group by project
  const projectStats = projects.map(project => {
    const projectEntries = filteredEntries.filter(e => e.projectId === project.id);
    return {
      project,
      hours: projectEntries.reduce((sum, e) => sum + e.hours, 0),
      entries: projectEntries.length
    };
  }).filter(stat => stat.hours > 0);

  // Group by user
  const userStats = users.map(user => {
    const userEntries = filteredEntries.filter(e => e.userId === user.id);
    return {
      user,
      hours: userEntries.reduce((sum, e) => sum + e.hours, 0),
      entries: userEntries.length
    };
  }).filter(stat => stat.hours > 0);

  return (
    <div className="flex h-screen bg-gray-50">
      <Navigation />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl mb-2">Reportes Globales</h1>
            <p className="text-gray-600">Análisis y exportación de datos de tiempo</p>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
              <CardDescription>Filtre los datos para el reporte</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm mb-2 block">Cliente</label>
                  <Select
                    value={filters.clientId}
                    onValueChange={(value) => setFilters({...filters, clientId: value, projectId: 'all'})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los clientes</SelectItem>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id.toString()}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm mb-2 block">Proyecto</label>
                  <Select
                    value={filters.projectId}
                    onValueChange={(value) => setFilters({...filters, projectId: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los proyectos</SelectItem>
                      {projects
                        .filter(p => filters.clientId === 'all' || p.clientId === parseInt(filters.clientId))
                        .map((project) => (
                          <SelectItem key={project.id} value={project.id.toString()}>
                            {project.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm mb-2 block">Usuario</label>
                  <Select
                    value={filters.userId}
                    onValueChange={(value) => setFilters({...filters, userId: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los usuarios</SelectItem>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm mb-2 block">Fecha Inicio</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border rounded-md"
                    value={filters.startDate}
                    onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                  />
                </div>

                <div>
                  <label className="text-sm mb-2 block">Fecha Fin</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border rounded-md"
                    value={filters.endDate}
                    onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                  />
                </div>

                <div className="flex items-end gap-2">
                  <Button variant="outline" onClick={exportExcel} className="flex-1">
                    <FileDown className="h-4 w-4 mr-2" />
                    CSV
                  </Button>
                  <Button variant="outline" onClick={exportJSON} className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    JSON
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-gray-600">Total Registros</p>
                <p className="text-3xl mt-2">{filteredEntries.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-gray-600">Total Horas</p>
                <p className="text-3xl mt-2">{totalHours}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-gray-600">Promedio Horas/Registro</p>
                <p className="text-3xl mt-2">
                  {filteredEntries.length > 0 
                    ? (totalHours / filteredEntries.length).toFixed(1) 
                    : 0}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* By Project */}
            <Card>
              <CardHeader>
                <CardTitle>Horas por Proyecto</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Proyecto</TableHead>
                      <TableHead className="text-right">Horas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projectStats
                      .sort((a, b) => b.hours - a.hours)
                      .map((stat) => (
                        <TableRow key={stat.project.id}>
                          <TableCell>{stat.project.name}</TableCell>
                          <TableCell className="text-right">{stat.hours}h</TableCell>
                        </TableRow>
                      ))}
                    {projectStats.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center text-gray-500">
                          No hay datos
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* By User */}
            <Card>
              <CardHeader>
                <CardTitle>Horas por Usuario</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuario</TableHead>
                      <TableHead className="text-right">Horas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userStats
                      .sort((a, b) => b.hours - a.hours)
                      .map((stat) => (
                        <TableRow key={stat.user.id}>
                          <TableCell>{stat.user.name}</TableCell>
                          <TableCell className="text-right">{stat.hours}h</TableCell>
                        </TableRow>
                      ))}
                    {userStats.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center text-gray-500">
                          No hay datos
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Detailed List */}
          <Card>
            <CardHeader>
              <CardTitle>Registros Detallados</CardTitle>
              <CardDescription>Lista completa de registros filtrados</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Proyecto</TableHead>
                    <TableHead>Tarea</TableHead>
                    <TableHead>Horario</TableHead>
                    <TableHead className="text-right">Horas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                        <TableCell>{entry.userName || `ID: ${entry.userId}`}</TableCell>
                        <TableCell>{entry.projectName || `ID: ${entry.projectId}`}</TableCell>
                        <TableCell>{entry.taskName}</TableCell>
                        <TableCell>{entry.startTime} - {entry.endTime}</TableCell>
                        <TableCell className="text-right">{entry.hours}h</TableCell>
                      </TableRow>
                    ))}
                  {filteredEntries.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                        No hay registros que coincidan con los filtros
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
