import { Request, Response } from 'express';
import db from '../config/database';

// Obtener todos los usuarios
export const getAllUsers = (req: Request, res: Response) => {
  try {
    const users = db.prepare(`
      SELECT id, name, email, role, created_at 
      FROM users
    `).all();

    res.json({ 
      success: true, 
      data: users 
    });
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener usuarios' 
    });
  }
};

// Obtener un usuario por ID
export const getUserById = (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = db.prepare(`
      SELECT id, name, email, role, created_at 
      FROM users 
      WHERE id = ?
    `).get(id);

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Usuario no encontrado' 
      });
    }

    res.json({ 
      success: true, 
      data: user 
    });
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener usuario' 
    });
  }
};

// Crear un usuario
export const createUser = (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ 
        success: false, 
        message: 'Todos los campos son requeridos' 
      });
    }

    if (!['admin', 'leader', 'developer'].includes(role)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Rol inválido' 
      });
    }

    const result = db.prepare(`
      INSERT INTO users (name, email, password, role) 
      VALUES (?, ?, ?, ?)
    `).run(name, email, password, role);

    res.status(201).json({ 
      success: true, 
      data: { 
        id: result.lastInsertRowid,
        name,
        email,
        role
      },
      message: 'Usuario creado exitosamente' 
    });
  } catch (error: any) {
    console.error('Error creando usuario:', error);
    
    if (error.code === 'SQLITE_CONSTRAINT') {
      return res.status(400).json({ 
        success: false, 
        message: 'El email ya está registrado' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Error al crear usuario' 
    });
  }
};

// Actualizar un usuario
export const updateUser = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nombre, email y rol son requeridos' 
      });
    }

    const result = db.prepare(`
      UPDATE users 
      SET name = ?, email = ?, role = ? 
      WHERE id = ?
    `).run(name, email, role, id);

    if (result.changes === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Usuario no encontrado' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Usuario actualizado exitosamente' 
    });
  } catch (error: any) {
    console.error('Error actualizando usuario:', error);
    
    if (error.code === 'SQLITE_CONSTRAINT') {
      return res.status(400).json({ 
        success: false, 
        message: 'El email ya está registrado' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Error al actualizar usuario' 
    });
  }
};

// Eliminar un usuario
export const deleteUser = (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = db.prepare(`
      DELETE FROM users 
      WHERE id = ?
    `).run(id);

    if (result.changes === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Usuario no encontrado' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Usuario eliminado exitosamente' 
    });
  } catch (error) {
    console.error('Error eliminando usuario:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al eliminar usuario' 
    });
  }
};
