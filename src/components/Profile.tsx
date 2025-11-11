import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import Navigation from './Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { User, Mail, Shield, Download, Upload, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useUsers, useClients, useProjects, useTemplates, useTimeEntries } from '../lib/useDatabase';
import { usersApi } from '../lib/api';

export default function Profile() {
  const { user, logout } = useAuth();
  const { users, reload: reloadUsers } = useUsers();
  const { clients } = useClients();
  const { projects } = useProjects();
  const { templates } = useTemplates();
  const { timeEntries } = useTimeEntries();

  const [editMode, setEditMode] = useState(false);
  const [editedUser, setEditedUser] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });

  const handleUpdateProfile = async () => {
    if (!user) return;

    if (!editedUser.name || !editedUser.email) {
      toast.error('Nombre y email son requeridos');
      return;
    }

    try {
      await usersApi.update(user.id, {
        name: editedUser.name,
        email: editedUser.email,
        role: user.role
      });
      
      // Update local storage
      const updatedUser = { ...user, ...editedUser };
      localStorage.setItem('timetracker_user', JSON.stringify(updatedUser));
      
      toast.success('Perfil actualizado exitosamente');
      setEditMode(false);
      reloadUsers();
      
      // Refresh page to update user in context
      window.location.reload();
    } catch (error) {
      toast.error('Error al actualizar perfil');
    }
  };

  const exportAllData = () => {
    const data = {
      exportDate: new Date().toISOString(),
      user: user,
      users,
      clients,
      projects,
      templates,
      timeEntries
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timetracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Datos exportados exitosamente');
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        console.log('Datos importados:', data);
        toast.info('Importación de datos no disponible en modo API. Use el backend para restaurar datos.');
      } catch (error) {
        toast.error('Error al leer el archivo');
      }
    };
    reader.readAsText(file);
  };

  const handleResetDatabase = () => {
    if (!confirm('⚠️ ADVERTENCIA: Esta acción eliminará todos los datos del sistema.\n\n¿Está absolutamente seguro de que desea continuar?')) {
      return;
    }

    if (!confirm('Esta es su última oportunidad para cancelar. Los datos no se pueden recuperar.\n\n¿Confirma que desea resetear la base de datos?')) {
      return;
    }

    toast.info('Para resetear la base de datos, ejecute: npm run db:reset en la carpeta del servidor');
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'leader': return 'Líder';
      case 'developer': return 'Desarrollador';
      default: return role;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'leader': return 'default';
      case 'developer': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Navigation />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl mb-2">Configuración de Perfil</h1>
            <p className="text-gray-600">Gestiona tu información personal y preferencias</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Info */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Información Personal</CardTitle>
                  <CardDescription>
                    Actualiza tu información de perfil
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nombre</Label>
                    {editMode ? (
                      <Input
                        id="name"
                        value={editedUser.name}
                        onChange={(e) => setEditedUser({...editedUser, name: e.target.value})}
                      />
                    ) : (
                      <div className="flex items-center p-2 bg-gray-50 rounded-md">
                        <User className="h-4 w-4 text-gray-500 mr-2" />
                        <span>{user?.name}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    {editMode ? (
                      <Input
                        id="email"
                        type="email"
                        value={editedUser.email}
                        onChange={(e) => setEditedUser({...editedUser, email: e.target.value})}
                      />
                    ) : (
                      <div className="flex items-center p-2 bg-gray-50 rounded-md">
                        <Mail className="h-4 w-4 text-gray-500 mr-2" />
                        <span>{user?.email}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label>Rol</Label>
                    <div className="flex items-center p-2 bg-gray-50 rounded-md">
                      <Shield className="h-4 w-4 text-gray-500 mr-2" />
                      <Badge variant={user ? getRoleBadgeColor(user.role) : 'outline'}>
                        {user ? getRoleLabel(user.role) : ''}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-4">
                    {editMode ? (
                      <>
                        <Button onClick={handleUpdateProfile} className="flex-1">
                          Guardar Cambios
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setEditMode(false);
                            setEditedUser({
                              name: user?.name || '',
                              email: user?.email || ''
                            });
                          }}
                          className="flex-1"
                        >
                          Cancelar
                        </Button>
                      </>
                    ) : (
                      <Button onClick={() => setEditMode(true)} className="flex-1">
                        Editar Perfil
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Stats */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Estadísticas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Usuarios</p>
                    <p className="text-2xl">{users.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Proyectos</p>
                    <p className="text-2xl">{projects.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Registros</p>
                    <p className="text-2xl">{timeEntries.length}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Data Management */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Exportar Datos</CardTitle>
                <CardDescription>
                  Descarga una copia de seguridad de todos tus datos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={exportAllData} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Todos los Datos
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Importar Datos</CardTitle>
                <CardDescription>
                  Restaura datos desde un archivo de respaldo (Solo lectura en modo API)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Input
                    type="file"
                    accept=".json"
                    onChange={importData}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-gray-500">
                    Nota: La importación completa requiere acceso directo al servidor
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Danger Zone - Only for Admin */}
          {user?.role === 'admin' && (
            <Card className="mt-6 border-red-200">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <CardTitle className="text-red-600">Zona de Peligro</CardTitle>
                </div>
                <CardDescription>
                  Acciones irreversibles que afectan a todo el sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Resetear Base de Datos</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Elimina todos los datos y restaura la base de datos a su estado inicial con datos de ejemplo.
                    </p>
                    <Button variant="destructive" onClick={handleResetDatabase}>
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Resetear Base de Datos
                    </Button>
                  </div>
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-sm text-yellow-800">
                      <strong>Nota:</strong> En modo API, el reset de base de datos debe ejecutarse desde el servidor con el comando: <code className="bg-yellow-100 px-2 py-1 rounded">npm run db:reset</code>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Backend Info */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Información del Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Modo</p>
                  <p className="font-medium">API Backend (SQLite)</p>
                </div>
                <div>
                  <p className="text-gray-600">Backend URL</p>
                  <p className="font-mono text-xs">
                    {(import.meta as any).env?.VITE_API_URL || 'http://localhost:3001/api'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Estado</p>
                  <p className="text-green-600 font-medium">✓ Conectado</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
