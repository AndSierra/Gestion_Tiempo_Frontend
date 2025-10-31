import { Request, Response } from 'express';
import db from '../config/database';

export const getAllTemplates = (req: Request, res: Response) => {
  try {
    const templates = db.prepare('SELECT * FROM templates').all();
    res.json({ success: true, data: templates });
  } catch (error) {
    console.error('Error obteniendo plantillas:', error);
    res.status(500).json({ success: false, message: 'Error al obtener plantillas' });
  }
};

export const createTemplate = (req: Request, res: Response) => {
  try {
    const { name, description, tasks } = req.body;

    if (!name || !tasks) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nombre y tareas son requeridos' 
      });
    }

    const result = db.prepare(`
      INSERT INTO templates (name, description, tasks) 
      VALUES (?, ?, ?)
    `).run(name, description || '', tasks);

    res.status(201).json({ 
      success: true, 
      data: { id: result.lastInsertRowid, name, description, tasks },
      message: 'Plantilla creada exitosamente' 
    });
  } catch (error) {
    console.error('Error creando plantilla:', error);
    res.status(500).json({ success: false, message: 'Error al crear plantilla' });
  }
};

export const updateTemplate = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, tasks } = req.body;

    if (!name || !tasks) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nombre y tareas son requeridos' 
      });
    }

    const result = db.prepare(`
      UPDATE templates 
      SET name = ?, description = ?, tasks = ? 
      WHERE id = ?
    `).run(name, description || '', tasks, id);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: 'Plantilla no encontrada' });
    }

    res.json({ success: true, message: 'Plantilla actualizada exitosamente' });
  } catch (error) {
    console.error('Error actualizando plantilla:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar plantilla' });
  }
};

export const deleteTemplate = (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = db.prepare('DELETE FROM templates WHERE id = ?').run(id);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: 'Plantilla no encontrada' });
    }

    res.json({ success: true, message: 'Plantilla eliminada exitosamente' });
  } catch (error) {
    console.error('Error eliminando plantilla:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar plantilla' });
  }
};
