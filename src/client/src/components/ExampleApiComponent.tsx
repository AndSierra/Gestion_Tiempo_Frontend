import React, { useState, useEffect } from 'react';
import { usersApi, clientsApi, User, Client } from '../services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { Loader2, RefreshCw, Plus, Trash2 } from 'lucide-react';

/**
 * Componente de ejemplo que demuestra cómo usar la API del backend
 * Este componente muestra usuarios y clientes obtenidos desde el servidor SQLite
 */
export default function ExampleApiComponent() {
  const [users, setUsers] = useState<User[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [newClientName, setNewClientName] = useState('');

  // Cargar datos al montar el componente
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Llamadas paralelas a la API
      const [usersResponse, clientsResponse] = await Promise.all([
        usersApi.getAll(),
        clientsApi.getAll()
      ]);

      if (usersResponse.success && usersResponse.data) {
        setUsers(usersResponse.data);
      }

      if (clientsResponse.success && clientsResponse.data) {
        setClients(clientsResponse.data);
      }

      toast.success('Datos cargados desde el servidor');
    } catch (error) {
      console.error('Error cargando datos:', error);
      toast.error('Error al cargar datos del servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClient = async () => {
    if (!newClientName.trim()) {
      toast.error('Por favor ingresa un nombre para el cliente');
      return;
    }

    try {
      const response = await clientsApi.create({
        name: newClientName,
        description: 'Cliente creado desde el frontend'
      });

      if (response.success) {
        toast.success('Cliente creado exitosamente');
        setNewClientName('');
        loadData(); // Recargar datos
      }
    } catch (error) {
      console.error('Error creando cliente:', error);
      toast.error('Error al crear cliente');
    }
  };

  const handleDeleteClient = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este cliente?')) {
      return;
    }

    try {
      const response = await clientsApi.delete(id);

      if (response.success) {
        toast.success('Cliente eliminado exitosamente');
        loadData(); // Recargar datos
      }
    } catch (error) {
      console.error('Error eliminando cliente:', error);
      toast.error('Error al eliminar cliente');
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'leader':
        return 'default';
      case 'developer':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'leader':
        return 'Líder';
      case 'developer':
        return 'Desarrollador';
      default:
        return role;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl">Ejemplo de API con Backend SQLite</h1>
          <p className="text-muted-foreground mt-2">
            Datos obtenidos desde el servidor Node.js + Express + SQLite
          </p>
        </div>
        <Button onClick={loadData} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Recargar
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Cargando datos del servidor...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Usuarios */}
          <Card>
            <CardHeader>
              <CardTitle>Usuarios ({users.length})</CardTitle>
              <CardDescription>
                Lista de usuarios desde la base de datos SQLite
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <Badge variant={getRoleBadgeColor(user.role)}>
                      {getRoleLabel(user.role)}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Clientes */}
          <Card>
            <CardHeader>
              <CardTitle>Clientes ({clients.length})</CardTitle>
              <CardDescription>
                Gestión de clientes con CRUD completo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Formulario para crear cliente */}
              <div className="flex gap-2">
                <Input
                  placeholder="Nombre del nuevo cliente"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateClient()}
                />
                <Button onClick={handleCreateClient}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear
                </Button>
              </div>

              {/* Lista de clientes */}
              <div className="space-y-3">
                {clients.map((client) => (
                  <div
                    key={client.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{client.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {client.description}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClient(client.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Información de conexión */}
      <Card>
        <CardHeader>
          <CardTitle>Estado de la Conexión</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Backend URL</p>
              <p className="font-mono">
                {import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Base de Datos</p>
              <p className="font-mono">SQLite (server)</p>
            </div>
            <div>
              <p className="text-muted-foreground">Estado</p>
              <p className="text-green-600 font-medium">✓ Conectado</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
