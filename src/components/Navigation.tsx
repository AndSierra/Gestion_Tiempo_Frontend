import React from 'react';
import { useAuth } from './AuthProvider';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback } from './ui/avatar';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  Users,
  Settings,
  LogOut,
  BarChart3,
  FolderOpen,
  FileText,
  User
} from 'lucide-react';

export default function Navigation() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const navItems = {
    admin: [
      { icon: BarChart3, label: 'Clientes', path: '/admin#clients' },
      { icon: Users, label: 'Usuarios', path: '/admin#users' },
      { icon: FolderOpen, label: 'Proyectos', path: '/admin#projects' },
      { icon: FileText, label: 'Plantillas', path: '/admin#templates' },
      { icon: BarChart3, label: 'Reportes', path: '/admin#reports' },
    ],
    leader: [
      { icon: Clock, label: 'Panel Mensual', path: '/leader' },
      { icon: FolderOpen, label: 'Mis Proyectos', path: '/projects' },
      { icon: FileText, label: 'Plantillas', path: '/templates' },
    ],
    developer: [
      { icon: Clock, label: 'Registrar Horas', path: '/developer' },
    ]
  };

  if (!user) return null;

  return (
    <nav className="bg-white border-b border-border px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-6 w-6 text-primary" />
            <span className="font-semibold">TimeTracker</span>
          </div>

          <div className="hidden md:flex items-center space-x-1">
            {navItems[user.role].map((item, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                onClick={() => navigate(item.path)}
                className="flex items-center space-x-2"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Button>
            ))}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <p className="text-sm">{user.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => navigate('/profile')}>
              <User className="mr-2 h-4 w-4" />
              Perfil
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}