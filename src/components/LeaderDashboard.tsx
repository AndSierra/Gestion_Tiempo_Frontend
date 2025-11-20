import React, { useState, useMemo } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from './ui/dialog';
import { Calendar, Download, FileDown } from 'lucide-react';
import { useProjects, useUsers, useTimeEntries } from '../lib/useDatabase';
import { toast } from 'sonner';

export default function LeaderDashboard() {
  const { user } = useAuth();
  
  // Estado para mes y año
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState(String(now.getMonth() + 1).padStart(2, '0'));
  
  const [selectedDayDialog, setSelectedDayDialog] = useState<{ developer: any; date: Date; entries: any[] } | null>(null);

  // Load data from API
  const { projects } = useProjects(user?.id);
  const { users } = useUsers();
  const { timeEntries } = useTimeEntries(undefined, undefined, user?.id);

  // Get developers from projects led by this leader
  const developerIds = new Set<number>();
  projects.forEach(project => {
    timeEntries
      .filter(entry => entry.project_id === project.id || entry.projectId === project.id)
      .forEach(entry => developerIds.add(entry.user_id || entry.userId));
  });

  const developers = users.filter(u =>
    u.role === 'developer' && developerIds.has(u.id)
  );

  // Generar años disponibles (últimos 5 años + próximos 2)
  const availableYears = useMemo(() => {
    const years = [];
    const currentYear = new Date().getFullYear();
    for (let i = currentYear - 5; i <= currentYear + 2; i++) {
      years.push(i);
    }
    return years;
  }, []);

  // Meses en español
  const months = [
    { value: '01', label: 'Enero' },
    { value: '02', label: 'Febrero' },
    { value: '03', label: 'Marzo' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Mayo' },
    { value: '06', label: 'Junio' },
    { value: '07', label: 'Julio' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Septiembre' },
    { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' },
    { value: '12', label: 'Diciembre' }
  ];

  // Generate calendar for selected month
  const generateCalendar = () => {
    const year = parseInt(selectedYear);
    const month = parseInt(selectedMonth);
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
      .filter(entry => {
        const entryUserId = entry.user_id || entry.userId;
        const entryDate = entry.date;
        return entryUserId === developerId && entryDate === dateStr;
      })
      .reduce((sum, entry) => sum + entry.hours, 0);
  };

  const getDayEntries = (developerId: number, date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return timeEntries.filter(entry => {
      const entryUserId = entry.user_id || entry.userId;
      const entryDate = entry.date;
      return entryUserId === developerId && entryDate === dateStr;
    });
  };

  const getHourColor = (hours: number) => {
    if (hours === 0) return 'bg-gray-200 text-gray-400';
    if (hours >= 1 && hours <= 4) return 'bg-yellow-200 text-yellow-800';
    if (hours >= 5 && hours <= 8) return 'bg-green-200 text-green-800';
    return 'bg-red-200 text-red-800'; // 9+
  };

  const exportJSON = () => {
    const data = {
      mes: selectedMonth,
      año: selectedYear,
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
                proyecto: entry.projectName || `Proyecto ${entry.projectId || entry.project_id}`,
                tarea: entry.taskName || entry.task_name,
                inicio: entry.startTime || entry.start_time,
                fin: entry.endTime || entry.end_time,
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
    a.download = `reporte-horas-${selectedYear}-${selectedMonth}.json`;
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
            entry.projectName || `Proyecto ${entry.projectId || entry.project_id}`,
            entry.taskName || entry.task_name,
            entry.startTime || entry.start_time,
            entry.endTime || entry.end_time,
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
    a.download = `reporte-horas-${selectedYear}-${selectedMonth}.csv`;
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
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                  <CardTitle>Vista Mensual de Horas</CardTitle>
                  <CardDescription>
                    Seguimiento de horas por desarrollador con código de colores
                  </CardDescription>
                </div>
                <div className="flex space-x-2 items-center flex-wrap gap-2">
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map(month => (
                        <SelectItem key={month.value} value={month.value}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableYears.map(year => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button 
                    variant="outline" 
                    onClick={exportExcel}
                    title="Exportar en formato CSV"
                  >
                    <FileDown className="h-4 w-4 mr-2" />
                    CSV
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={exportJSON}
                    title="Exportar en formato JSON"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    JSON
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Legend */}
              <div className="mb-6 flex gap-4 text-sm flex-wrap">
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

                            return (
                              <TableCell key={date.toISOString()} className="p-0">
                                {entries.length > 0 ? (
                                  <button
                                    onClick={() => setSelectedDayDialog({ developer, date, entries })}
                                    className={`w-full h-12 flex items-center justify-center cursor-pointer transition-all hover:opacity-80 ${getHourColor(hours)}`}
                                    title={`Ver detalles de ${developer.name} en ${date.toLocaleDateString()}`}
                                  >
                                    {hours}h
                                  </button>
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

      {/* Dialog para mostrar detalles del día */}
      <Dialog open={!!selectedDayDialog} onOpenChange={() => setSelectedDayDialog(null)}>
        <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">
              Detalles de Horas - {selectedDayDialog?.developer.name}
            </DialogTitle>
            <DialogDescription>
              {selectedDayDialog?.date.toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </DialogDescription>
          </DialogHeader>

          {selectedDayDialog && (
            <div className="space-y-4">
              {/* Resumen */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Total de horas del día:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {selectedDayDialog.entries.reduce((sum, entry) => sum + entry.hours, 0)}h
                  </span>
                </div>
              </div>

              {/* Lista de entradas */}
              <div className="space-y-3">
                {selectedDayDialog.entries.map((entry, idx) => (
                  <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Proyecto</p>
                        <p className="text-sm font-semibold text-gray-900 mt-1">
                          {entry.projectName || `Proyecto ${entry.projectId || entry.project_id}`}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Tarea</p>
                        <p className="text-sm text-gray-700 mt-1">{entry.taskName || entry.task_name}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Inicio</p>
                        <p className="text-sm font-medium text-gray-900 mt-1">{entry.startTime || entry.start_time}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Fin</p>
                        <p className="text-sm font-medium text-gray-900 mt-1">{entry.endTime || entry.end_time}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Horas</p>
                        <p className="text-sm font-bold text-blue-600 mt-1">{entry.hours}h</p>
                      </div>
                    </div>

                    {entry.description && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Descripción</p>
                        <p className="text-sm text-gray-600 mt-1">{entry.description}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}