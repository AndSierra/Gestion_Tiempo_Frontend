import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase, seedDatabase } from './config/database';

// Importar rutas
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import clientRoutes from './routes/clientRoutes';
import projectRoutes from './routes/projectRoutes';
import templateRoutes from './routes/templateRoutes';
import timeEntryRoutes from './routes/timeEntryRoutes';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Inicializar base de datos
try {
  initializeDatabase();
  seedDatabase();
} catch (error) {
  console.error('❌ Error inicializando base de datos:', error);
  process.exit(1);
}

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/time-entries', timeEntryRoutes);

// Ruta de healthcheck
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'OK', 
    message: 'TimeTracker API está funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Ruta raíz
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'TimeTracker API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      clients: '/api/clients',
      projects: '/api/projects',
      templates: '/api/templates',
      timeEntries: '/api/time-entries',
      health: '/api/health'
    }
  });
});

// Manejador de errores 404
app.use((req: Request, res: Response) => {
  res.status(404).json({ 
    success: false, 
    message: 'Ruta no encontrada' 
  });
});

// Manejador de errores global
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ 
    success: false, 
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log('  ✅ TimeTracker API Server');
  console.log('═══════════════════════════════════════════');
  console.log(`  🚀 Servidor corriendo en: http://localhost:${PORT}`);
  console.log(`  📊 API disponible en: http://localhost:${PORT}/api`);
  console.log(`  🔍 Health check: http://localhost:${PORT}/api/health`);
  console.log('═══════════════════════════════════════════');
  console.log('');
});

export default app;
