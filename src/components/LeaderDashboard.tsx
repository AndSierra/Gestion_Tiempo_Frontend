import React, { useState, useMemo } from 'react';
import { useAuth } from './AuthProvider';
import Navigation from './Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Calendar, Download, FileDown, Clock, Building, Users, AlertCircle } from 'lucide-react';
import { useProjects, useUsers, useTimeEntries } from '../lib/useDatabase';
import { toast } from 'sonner';

export default function LeaderDashboard() {
  const { user } = useAuth();
  
  // Estado para mes y año
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState(String(now.getMonth() + 1).padStart(2, '0'));
  const [selectedProject, setSelectedProject] = useState<string>('all');
  
  const [selectedDayDialog, setSelectedDayDialog] = useState<{ developer: any; date: Date; entries: any[] } | null>(null);

  // Load data from API
  const { projects } = useProjects(user?.id);
  const { users } = useUsers();
  const { timeEntries } = useTimeEntries(undefined, undefined, user?.id);

  // Días festivos y no laborales (puedes expandir esta lista)
  const nonWorkingDays = useMemo(() => [
    // Festivos fijos
    `2024-01-01`, // Año Nuevo
    `2024-05-01`, // Día del Trabajo
    `2024-07-20`, // Independencia
    `2024-08-07`, // Batalla de Boyacá
    `2024-12-25`, // Navidad
    
    // Festivos móviles (ejemplo para 2024)
    `2024-03-25`, // Lunes Santo
    `2024-03-28`, // Jueves Santo
    `2024-03-29`, // Viernes Santo
    `2024-05-13`, // Ascensión
    `2024-06-03`, // Corpus Christi
    `2024-06-10`, // Sagrado Corazón
    `2024-07-01`, // San Pedro y San Pablo
    `2024-08-19`, // Asunción
    `2024-10-14`, // Día de la Raza
    `2024-11-04`, // Todos los Santos
    `2024-11-11`, // Independencia de Cartagena
  ], []);

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

  // Filtrar timeEntries por proyecto seleccionado
  const filteredTimeEntries = useMemo(() => {
    if (selectedProject === 'all') {
      return timeEntries;
    }
    const projectId = parseInt(selectedProject);
    return timeEntries.filter(entry => 
      entry.project_id === projectId || entry.projectId === projectId
    );
  }, [timeEntries, selectedProject]);

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

  // Días de la semana en español
  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  // Generate calendar for selected month
  const generateCalendar = () => {
    const year = parseInt(selectedYear);
    const month = parseInt(selectedMonth);
    const daysInMonth = new Date(year, month, 0).getDate();

    const calendar = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month - 1, i);
      const dateStr = date.toISOString().split('T')[0];
      const isWeekend = date.getDay() === 0 || date.getDay() === 6; // Domingo (0) o Sábado (6)
      const isHoliday = nonWorkingDays.includes(dateStr);
      
      calendar.push({
        date,
        dateStr,
        isWeekend,
        isHoliday,
        dayOfWeek: date.getDay()
      });
    }
    return calendar;
  };

  const calendar = generateCalendar();

  const getDayHours = (developerId: number, date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return filteredTimeEntries
      .filter(entry => {
        const entryUserId = entry.user_id || entry.userId;
        const entryDate = entry.date;
        return entryUserId === developerId && entryDate === dateStr;
      })
      .reduce((sum, entry) => sum + entry.hours, 0);
  };

  const getDayEntries = (developerId: number, date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return filteredTimeEntries.filter(entry => {
      const entryUserId = entry.user_id || entry.userId;
      const entryDate = entry.date;
      return entryUserId === developerId && entryDate === dateStr;
    });
  };

  const getHourColor = (hours: number, isWeekend: boolean, isHoliday: boolean, hasEntries: boolean) => {
    // Si es día no laboral (festivo)
    if (isHoliday) {
      return 'bg-purple-100 text-purple-800 border border-purple-300';
    }
    
    // Si es fin de semana
    if (isWeekend) {
      if (hasEntries) {
        // Si tiene horas registradas en fin de semana
        if (hours >= 1 && hours <= 4) return 'bg-yellow-200 text-yellow-800';
        if (hours >= 5 && hours <= 8) return 'bg-green-200 text-green-800';
        if (hours > 8) return 'bg-red-200 text-red-800';
        return 'bg-yellow-100 text-yellow-700'; // 0 horas pero con registros
      }
      // Fin de semana sin registros - gris
      return 'bg-gray-200 text-gray-400';
    }
    
    // Día de semana laboral
    if (hasEntries) {
      if (hours === 0) return 'bg-white text-gray-600 border border-gray-200';
      if (hours >= 1 && hours <= 4) return 'bg-yellow-200 text-yellow-800';
      if (hours >= 5 && hours <= 8) return 'bg-green-200 text-green-800';
      return 'bg-red-200 text-red-800'; // 9+
    }
    
    // Día de semana sin registros - blanco
    return 'bg-white text-gray-400 border border-gray-100';
  };

  const isNonWorkingDay = (dateStr: string, dayOfWeek: number) => {
    return nonWorkingDays.includes(dateStr) || dayOfWeek === 0 || dayOfWeek === 6;
  };

  // Obtener historial de registros (filtrado por proyecto)
  const getHistoryEntries = () => {
    return filteredTimeEntries
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .map(entry => {
        const developer = developers.find(dev => dev.id === (entry.user_id || entry.userId));
        return {
          ...entry,
          developerName: developer?.name || 'Desarrollador no encontrado'
        };
      });
  };

  // Estadísticas para las tarjetas horizontales
  const statsData = useMemo(() => [
    {
      title: "Total Desarrolladores",
      value: developers.length,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Horas del Mes",
      value: developers.reduce((total, dev) => total + calendar.reduce((devTotal, day) => devTotal + getDayHours(dev.id, day.date), 0), 0),
      icon: Clock,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Proyectos Activos",
      value: projects.length,
      icon: Building,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Registros Totales",
      value: filteredTimeEntries.length,
      icon: FileDown,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      title: "Días No Laborales",
      value: calendar.filter(day => isNonWorkingDay(day.dateStr, day.dayOfWeek)).length,
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-50"
    }
  ], [developers, projects, filteredTimeEntries, calendar]);

  const exportJSON = () => {
    const data = {
      mes: selectedMonth,
      año: selectedYear,
      proyecto: selectedProject === 'all' ? 'Todos los proyectos' : projects.find(p => p.id === parseInt(selectedProject))?.name,
      lider: user?.name || '',
      desarrolladores: developers.map(dev => ({
        nombre: dev.name,
        dias: calendar
          .map(day => {
            const entries = getDayEntries(dev.id, day.date);
            if (entries.length === 0) return null;
            return {
              fecha: day.dateStr,
              es_no_laboral: isNonWorkingDay(day.dateStr, day.dayOfWeek),
              total_horas: getDayHours(dev.id, day.date),
              detalle: entries.map(entry => ({
                proyecto: entry.projectName || `Proyecto ${entry.projectId || entry.project_id}`,
                tarea: entry.taskName || entry.task_name,
                inicio: entry.startTime || entry.start_time,
                fin: entry.endTime || entry.end_time,
                horas: entry.hours,
                descripcion: entry.description || ''
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
      ['Desarrollador', 'Fecha', 'Es No Laboral', 'Proyecto', 'Tarea', 'Inicio', 'Fin', 'Horas', 'Descripción'].join(',')
    ];

    developers.forEach(dev => {
      calendar.forEach(day => {
        const entries = getDayEntries(dev.id, day.date);
        entries.forEach(entry => {
          rows.push([
            dev.name,
            day.dateStr,
            isNonWorkingDay(day.dateStr, day.dayOfWeek) ? 'Sí' : 'No',
            entry.projectName || `Proyecto ${entry.projectId || entry.project_id}`,
            entry.taskName || entry.task_name,
            entry.startTime || entry.start_time,
            entry.endTime || entry.end_time,
            entry.hours,
            `"${(entry.description || '').replace(/"/g, '""')}"`
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

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Navigation />

      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl mb-2">Panel de Líder</h1>
            <p className="text-gray-600">Vista mensual de horas por desarrollador</p>
          </div>

          {/* Stats en diseño horizontal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
            {statsData.map((stat, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-full ${stat.bgColor}`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="calendar">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="calendar">Vista Calendario</TabsTrigger>
              <TabsTrigger value="history">Historial</TabsTrigger>
            </TabsList>

            {/* Vista Calendario */}
            <TabsContent value="calendar">
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
                      <Select value={selectedProject} onValueChange={setSelectedProject}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Filtrar por proyecto" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los proyectos</SelectItem>
                          {projects.map(project => (
                            <SelectItem key={project.id} value={project.id.toString()}>
                              {project.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

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

                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          onClick={exportExcel}
                          title="Exportar en formato CSV"
                          size="sm"
                        >
                          <FileDown className="h-4 w-4 mr-2" />
                          CSV
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={exportJSON}
                          title="Exportar en formato JSON"
                          size="sm"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          JSON
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Leyenda mejorada con colores visibles */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
                    <div className="text-sm font-semibold text-gray-700 mb-2">Leyenda:</div>
                    <div className="flex flex-wrap gap-4 items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-white border border-gray-300 rounded"></div>
                        <span className="text-sm">0h (día laboral)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gray-200 rounded"></div>
                        <span className="text-sm">Fin de semana</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-yellow-200 rounded"></div>
                        <span className="text-sm">1-4h</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-200 rounded"></div>
                        <span className="text-sm">5-8h</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-red-200 rounded"></div>
                        <span className="text-sm">9+h</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-purple-100 border border-purple-300 rounded"></div>
                        <span className="text-sm">No laboral</span>
                      </div>
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
                            <TableHead className="sticky left-0 bg-white z-10 min-w-[150px] border-r">
                              <div className="flex items-center gap-2">
                                <span>Desarrollador</span>
                                <Badge variant="outline" className="text-xs">
                                  {developers.length}
                                </Badge>
                              </div>
                            </TableHead>
                            {calendar.map((day) => (
                              <TableHead 
                                key={day.dateStr} 
                                className={`text-center min-w-[70px] p-1 ${
                                  day.isHoliday ? 'bg-purple-50' : day.isWeekend ? 'bg-gray-100' : 'bg-white'
                                }`}
                              >
                                <div className="flex flex-col items-center">
                                  <span className={`text-xs font-normal ${
                                    day.isHoliday ? 'text-purple-600' : day.isWeekend ? 'text-gray-600' : 'text-gray-500'
                                  }`}>
                                    {weekDays[day.dayOfWeek]}
                                  </span>
                                  <span className={`text-sm font-semibold ${
                                    day.isHoliday ? 'text-purple-600' : day.isWeekend ? 'text-gray-600' : 'text-gray-900'
                                  }`}>
                                    {day.date.getDate()}
                                  </span>
                                  {day.isHoliday && (
                                    <div className="w-1 h-1 bg-purple-400 rounded-full mt-1"></div>
                                  )}
                                </div>
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {developers.map((developer) => (
                            <TableRow key={developer.id} className="hover:bg-gray-50">
                              <TableCell className="sticky left-0 bg-white z-10 font-medium border-r">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                  {developer.name}
                                </div>
                              </TableCell>
                              {calendar.map((day) => {
                                const hours = getDayHours(developer.id, day.date);
                                const entries = getDayEntries(developer.id, day.date);
                                const hasEntries = entries.length > 0;

                                return (
                                  <TableCell 
                                    key={day.dateStr} 
                                    className="p-0"
                                  >
                                    {hasEntries ? (
                                      <button
                                        onClick={() => setSelectedDayDialog({ developer, date: day.date, entries })}
                                        className={`w-full h-12 flex items-center justify-center cursor-pointer transition-all hover:opacity-80 ${
                                          getHourColor(hours, day.isWeekend, day.isHoliday, hasEntries)
                                        }`}
                                        title={`${developer.name} - ${day.date.toLocaleDateString()}: ${hours} horas${
                                          day.isHoliday ? ' (Festivo)' : day.isWeekend ? ' (Fin de semana)' : ''
                                        }`}
                                      >
                                        <span className={`font-medium ${hours > 8 ? 'text-xs' : 'text-sm'}`}>
                                          {hours}h
                                        </span>
                                      </button>
                                    ) : (
                                      <div className={`w-full h-12 flex items-center justify-center ${
                                        getHourColor(0, day.isWeekend, day.isHoliday, hasEntries)
                                      }`}>
                                        <span className={`text-xs ${day.isWeekend || day.isHoliday ? 'text-gray-400' : 'text-gray-300'}`}>
                                          0h
                                        </span>
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
            </TabsContent>

            {/* Historial */}
            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center flex-wrap gap-4">
                    <div>
                      <CardTitle>Historial de Registros</CardTitle>
                      <CardDescription>
                        Todos los registros de tiempo de tus desarrolladores
                      </CardDescription>
                    </div>
                    <div className="flex space-x-2 items-center flex-wrap gap-2">
                      <Select value={selectedProject} onValueChange={setSelectedProject}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Filtrar por proyecto" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los proyectos</SelectItem>
                          {projects.map(project => (
                            <SelectItem key={project.id} value={project.id.toString()}>
                              {project.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Desarrollador</TableHead>
                          <TableHead>Proyecto</TableHead>
                          <TableHead>Tarea</TableHead>
                          <TableHead>Horario</TableHead>
                          <TableHead>Horas</TableHead>
                          <TableHead>Descripción</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getHistoryEntries().map((entry, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                {entry.date}
                                {isNonWorkingDay(entry.date, new Date(entry.date).getDay()) && (
                                  <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
                                    No laboral
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {entry.developerName}
                            </TableCell>
                            <TableCell>
                              {entry.projectName || `Proyecto ${entry.projectId || entry.project_id}`}
                            </TableCell>
                            <TableCell>
                              {entry.taskName || entry.task_name}
                            </TableCell>
                            <TableCell>
                              {entry.startTime && entry.endTime 
                                ? `${entry.startTime || entry.start_time} - ${entry.endTime || entry.end_time}`
                                : `${entry.hours}h directas`
                              }
                            </TableCell>
                            <TableCell>
                              <span className={`font-semibold ${
                                entry.hours > 8 ? 'text-red-600' : 
                                entry.hours >= 5 ? 'text-green-600' : 'text-yellow-600'
                              }`}>
                                {entry.hours}h
                              </span>
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate" title={entry.description}>
                              {entry.description || '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                        {getHistoryEntries().length === 0 && (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                              No hay registros de tiempo para los filtros seleccionados
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
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
              {isNonWorkingDay(
                selectedDayDialog?.date.toISOString().split('T')[0] || '', 
                selectedDayDialog?.date.getDay() || 0
              ) && (
                <Badge variant="outline" className="ml-2 bg-purple-50 text-purple-700">
                  Día no laboral
                </Badge>
              )}
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
                        <p className="text-sm font-medium text-gray-900 mt-1">{entry.startTime || entry.start_time || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Fin</p>
                        <p className="text-sm font-medium text-gray-900 mt-1">{entry.endTime || entry.end_time || '-'}</p>
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