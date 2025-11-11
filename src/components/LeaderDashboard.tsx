import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import Navigation from './Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from './ui/table';
import { Calendar, Download, FileDown } from 'lucide-react';
import { useProjects, useUsers, useTimeEntries } from '../lib/useDatabase';
import { toast } from 'sonner';

export default function LeaderDashboard() {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [expandedCells, setExpandedCells] = useState<Set<string>>(new Set());

  // Load data from API
  const { projects } = useProjects(user?.id);
  const { users } = useUsers();
  const { timeEntries } = useTimeEntries();

  // Get developers from projects led by this leader
  const developerIds = new Set<number>();
  projects.forEach(project => {
    timeEntries
      .filter(entry => entry.projectId === project.id)
      .forEach(entry => developerIds.add(entry.userId));
  });

  const developers = users.filter(u =>
    u.role === 'developer' && developerIds.has(u.id)
  );

  // Generate calendar for selected month
  const generateCalendar = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();

    const calendar = [];
    for (let i = 1; i <= daysInMonth; i++) {
      calendar.push(new Date(year, month - 1, i));
    }
    return calendar;
  };

  const calendar = generateCalendar();

  const getDayHours = (developerId: number, date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return timeEntries
      .filter(entry =>
        entry.userId === developerId &&
        entry.date === dateStr
      )
      .reduce((sum, entry) => sum + entry.hours, 0);
  };

  const getDayEntries = (developerId: number, date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return timeEntries.filter(entry =>
      entry.userId === developerId &&
      entry.date === dateStr
    );
  };

  const getHourColor = (hours: number) => {
    if (hours === 0) return 'bg-gray-200 text-gray-400';
    if (hours >= 1 && hours <= 4) return 'bg-yellow-200 text-yellow-800';
    if (hours >= 5 && hours <= 8) return 'bg-green-200 text-green-800';
    return 'bg-red-200 text-red-800'; // 9+
  };

  const toggleCell = (developerId: number, date: Date) => {
    const cellKey = `${developerId}-${date.toISOString()}`;
    const newExpanded = new Set(expandedCells);
    if (newExpanded.has(cellKey)) {
      newExpanded.delete(cellKey);
    } else {
      newExpanded.add(cellKey);
    }
    setExpandedCells(newExpanded);
  };

  const isCellExpanded = (developerId: number, date: Date): boolean => {
    const cellKey = `${developerId}-${date.toISOString()}`;
    return expandedCells.has(cellKey);
  };

  const exportJSON = () => {
    const data = {
      mes: selectedMonth,
      lider: user?.name || '',
      desarrolladores: developers.map(dev => ({
        nombre: dev.name,
        dias: calendar
          .map(date => {
            const entries = getDayEntries(dev.id, date);
            if (entries.length === 0) return null;
            return {
              fecha: date.toISOString().split('T')[0],
              total_horas: getDayHours(dev.id, date),
              detalle: entries.map(entry => ({
                proyecto: entry.projectName || `Proyecto ${entry.projectId}`,
                tarea: entry.taskName,
                inicio: entry.startTime,
                fin: entry.endTime,
                horas: entry.hours
              }))
            };
          })
          .filter(Boolean)
      }))
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-horas-${selectedMonth}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Reporte exportado en formato JSON');
  };

  const exportExcel = () => {
    const rows = [
      ['Desarrollador', 'Fecha', 'Proyecto', 'Tarea', 'Inicio', 'Fin', 'Horas'].join(',')
    ];

    developers.forEach(dev => {
      calendar.forEach(date => {
        const entries = getDayEntries(dev.id, date);
        entries.forEach(entry => {
          rows.push([
            dev.name,
            date.toISOString().split('T')[0],
            entry.projectName || `Proyecto ${entry.projectId}`,
            entry.taskName,
            entry.startTime,
            entry.endTime,
            entry.hours
          ].join(','));
        });
      });
    });

    const csv = rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-horas-${selectedMonth}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Reporte exportado en formato CSV');
  };

  const totalMonthHours = developers.reduce((total, dev) => {
    return total + calendar.reduce((devTotal, date) => {
      return devTotal + getDayHours(dev.id, date);
    }, 0);
  }, 0);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Navigation />

      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl mb-2">Panel de Líder</h1>
            <p className="text-gray-600">Vista mensual de horas por desarrollador</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Desarrolladores</p>
                    <p className="text-3xl mt-2">{developers.length}</p>
                  </div>
                  <Calendar className="h-12 w-12 text-primary opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Horas del Mes</p>
                    <p className="text-3xl mt-2">{totalMonthHours}</p>
                  </div>
                  <Calendar className="h-12 w-12 text-primary opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Proyectos Activos</p>
                    <p className="text-3xl mt-2">{projects.length}</p>
                  </div>
                  <Calendar className="h-12 w-12 text-primary opacity-20" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Vista Mensual de Horas</CardTitle>
                  <CardDescription>
                    Seguimiento de horas por desarrollador con código de colores
                  </CardDescription>
                </div>
                <div className="flex space-x-2 items-center">
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024-01">Enero 2024</SelectItem>
                      <SelectItem value="2024-02">Febrero 2024</SelectItem>
                      <SelectItem value="2024-03">Marzo 2024</SelectItem>
                      <SelectItem value="2024-04">Abril 2024</SelectItem>
                      <SelectItem value="2024-05">Mayo 2024</SelectItem>
                      <SelectItem value="2024-06">Junio 2024</SelectItem>
                      <SelectItem value="2024-07">Julio 2024</SelectItem>
                      <SelectItem value="2024-08">Agosto 2024</SelectItem>
                      <SelectItem value="2024-09">Septiembre 2024</SelectItem>
                      <SelectItem value="2024-10">Octubre 2024</SelectItem>
                      <SelectItem value="2024-11">Noviembre 2024</SelectItem>
                      <SelectItem value="2024-12">Diciembre 2024</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={exportExcel}>
                    <FileDown className="h-4 w-4 mr-2" />
                    CSV
                  </Button>
                  <Button variant="outline" onClick={exportJSON}>
                    <Download className="h-4 w-4 mr-2" />
                    JSON
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Legend */}
              <div className="mb-6 flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  <span>0 horas</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-200 rounded"></div>
                  <span>1-4 horas</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-200 rounded"></div>
                  <span>5-8 horas</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-200 rounded"></div>
                  <span>9+ horas</span>
                </div>
              </div>

              {developers.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No hay desarrolladores asignados a tus proyectos
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="sticky left-0 bg-white z-10">Desarrollador</TableHead>
                        {calendar.map((date) => (
                          <TableHead key={date.toISOString()} className="text-center min-w-[60px]">
                            {date.getDate()}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {developers.map((developer) => (
                        <TableRow key={developer.id}>
                          <TableCell className="sticky left-0 bg-white z-10">
                            {developer.name}
                          </TableCell>
                          {calendar.map((date) => {
                            const hours = getDayHours(developer.id, date);
                            const entries = getDayEntries(developer.id, date);
                            const isExpanded = isCellExpanded(developer.id, date);

                            return (
                              <TableCell key={date.toISOString()} className="p-0">
                                {entries.length > 0 ? (
                                  <div>
                                    <button
                                      onClick={() => toggleCell(developer.id, date)}
                                      className={`w-full h-12 flex items-center justify-center cursor-pointer transition-all ${getHourColor(hours)}`}
                                    >
                                      {hours}h
                                    </button>
                                    {isExpanded && (
                                      <div className="absolute z-20 bg-white border border-gray-200 shadow-lg rounded-md p-3 mt-1 min-w-[250px]">
                                        <div className="text-xs space-y-2">
                                          <div className="border-b pb-2 mb-2">
                                            <strong>{developer.name}</strong>
                                            <br />
                                            {date.toLocaleDateString()}
                                          </div>
                                          {entries.map((entry, idx) => (
                                            <div key={idx} className="pb-2 border-b last:border-0">
                                              <div className="font-medium">{entry.projectName || `Proyecto ${entry.projectId}`}</div>
                                              <div className="text-gray-600">{entry.taskName}</div>
                                              <div className="text-gray-500">
                                                {entry.startTime} - {entry.endTime} ({entry.hours}h)
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className={`w-full h-12 flex items-center justify-center ${getHourColor(0)}`}>
                                    0h
                                  </div>
                                )}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
