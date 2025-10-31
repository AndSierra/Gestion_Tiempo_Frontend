import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/AuthProvider';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import LeaderDashboard from './components/LeaderDashboard';
import DeveloperDashboard from './components/DeveloperDashboard';
import ProjectManagement from './components/ProjectManagement';
import TemplateManagement from './components/TemplateManagement';
import GlobalReports from './components/GlobalReports';
import Profile from './components/Profile';
import { Toaster } from './components/ui/sonner';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
}

function AppContent() {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Inicializando base de datos...</p>
        </div>
      </div>
    );
  }
  
  return (
    <Routes>
      <Route 
        path="/login" 
        element={!user ? <Login /> : <Navigate to="/dashboard" replace />} 
      />
      <Route 
        path="/dashboard" 
        element={
          !user ? <Navigate to="/login" replace /> :
          user.role === 'admin' ? <Navigate to="/admin" replace /> :
          user.role === 'leader' ? <Navigate to="/leader" replace /> :
          <Navigate to="/developer" replace />
        } 
      />
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/leader" 
        element={
          <ProtectedRoute allowedRoles={['leader']}>
            <LeaderDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/developer" 
        element={
          <ProtectedRoute allowedRoles={['developer']}>
            <DeveloperDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/projects" 
        element={
          <ProtectedRoute allowedRoles={['leader']}>
            <ProjectManagement />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/templates" 
        element={
          <ProtectedRoute allowedRoles={['admin', 'leader']}>
            <TemplateManagement />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/reports" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <GlobalReports />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute allowedRoles={['admin', 'leader', 'developer']}>
            <Profile />
          </ProtectedRoute>
        } 
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-background">
          <AppContent />
          <Toaster />
        </div>
      </Router>
    </AuthProvider>
  );
}