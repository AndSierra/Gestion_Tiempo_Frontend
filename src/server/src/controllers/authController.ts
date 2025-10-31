import { Request, Response } from 'express';
import db from '../config/database';

// Login
export const login = (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email y contraseña son requeridos' 
      });
    }

    const user = db.prepare(`
      SELECT id, name, email, role 
      FROM users 
      WHERE email = ? AND password = ?
    `).get(email, password);

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Credenciales inválidas' 
      });
    }

    res.json({ 
      success: true, 
      data: user,
      message: 'Login exitoso'
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
};

// Logout (simple, solo para consistencia de API)
export const logout = (req: Request, res: Response) => {
  res.json({ 
    success: true, 
    message: 'Logout exitoso' 
  });
};
