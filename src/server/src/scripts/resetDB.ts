import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const dbPath = process.env.DB_PATH || path.join(__dirname, '../../../database/timetracker.db');

console.log('🗑️  Eliminando base de datos...');

if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('✅ Base de datos eliminada');
} else {
  console.log('ℹ️  No existe base de datos para eliminar');
}

console.log('🔄 Reinicializando base de datos...');

// Importar y ejecutar la inicialización
import('../config/database').then(({ initializeDatabase, seedDatabase }) => {
  initializeDatabase();
  seedDatabase();
  console.log('✅ Base de datos reseteada exitosamente');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Error reseteando base de datos:', error);
  process.exit(1);
});
