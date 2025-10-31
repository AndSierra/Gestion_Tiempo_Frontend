import { Request, Response } from 'express';
import db from '../config/database';

export const getAllTimeEntries = (req: Request, res: Response) => {
  try {
    const entries = db.prepare(`
      SELECT t.*, u.name as userName, p.name as projectName
      FROM time_entries t
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN projects p ON t.project_id = p.id
      ORDER BY t.date DESC, t.start_time DESC
    `).all();

    res.json({ success: true, data: entries });
  } catch (error) {
    console.error('Error obteniendo registros de tiempo:', error);
    res.status(500).json({ success: false, message: 'Error al obtener registros' });
  }
};

export const getTimeEntriesByUser = (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const entries = db.prepare(`
      SELECT t.*, u.name as userName, p.name as projectName
      FROM time_entries t
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE t.user_id = ?
      ORDER BY t.date DESC, t.start_time DESC
    `).all(userId);

    res.json({ success: true, data: entries });
  } catch (error) {
    console.error('Error obteniendo registros del usuario:', error);
    res.status(500).json({ success: false, message: 'Error al obtener registros' });
  }
};

export const getTimeEntriesByProject = (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;

    const entries = db.prepare(`
      SELECT t.*, u.name as userName, p.name as projectName
      FROM time_entries t
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE t.project_id = ?
      ORDER BY t.date DESC, t.start_time DESC
    `).all(projectId);

    res.json({ success: true, data: entries });
  } catch (error) {
    console.error('Error obteniendo registros del proyecto:', error);
    res.status(500).json({ success: false, message: 'Error al obtener registros' });
  }
};

export const getTimeEntriesByDateRange = (req: Request, res: Response) => {
  try {
    const { start, end } = req.query;

    if (!start || !end) {
      return res.status(400).json({ 
        success: false, 
        message: 'Fechas de inicio y fin son requeridas' 
      });
    }

    const entries = db.prepare(`
      SELECT t.*, u.name as userName, p.name as projectName
      FROM time_entries t
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE t.date BETWEEN ? AND ?
      ORDER BY t.date DESC, t.start_time DESC
    `).all(start, end);

    res.json({ success: true, data: entries });
  } catch (error) {
    console.error('Error obteniendo registros por fecha:', error);
    res.status(500).json({ success: false, message: 'Error al obtener registros' });
  }
};

export const createTimeEntry = (req: Request, res: Response) => {
  try {
    const { userId, projectId, taskName, date, startTime, endTime, hours, description } = req.body;

    if (!userId || !projectId || !taskName || !date || !startTime || !endTime || !hours) {
      return res.status(400).json({ 
        success: false, 
        message: 'Todos los campos obligatorios deben estar presentes' 
      });
    }

    // Validar máximo 9 horas
    if (hours > 9) {
      return res.status(400).json({ 
        success: false, 
        message: 'No se pueden registrar más de 9 horas por día' 
      });
    }

    const result = db.prepare(`
      INSERT INTO time_entries 
      (user_id, project_id, task_name, date, start_time, end_time, hours, description) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(userId, projectId, taskName, date, startTime, endTime, hours, description || '');

    res.status(201).json({ 
      success: true, 
      data: { 
        id: result.lastInsertRowid, 
        userId, projectId, taskName, date, startTime, endTime, hours, description 
      },
      message: 'Registro de tiempo creado exitosamente' 
    });
  } catch (error) {
    console.error('Error creando registro de tiempo:', error);
    res.status(500).json({ success: false, message: 'Error al crear registro' });
  }
};

export const updateTimeEntry = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { projectId, taskName, date, startTime, endTime, hours, description } = req.body;

    if (!projectId || !taskName || !date || !startTime || !endTime || !hours) {
      return res.status(400).json({ 
        success: false, 
        message: 'Todos los campos obligatorios deben estar presentes' 
      });
    }

    if (hours > 9) {
      return res.status(400).json({ 
        success: false, 
        message: 'No se pueden registrar más de 9 horas por día' 
      });
    }

    const result = db.prepare(`
      UPDATE time_entries 
      SET project_id = ?, task_name = ?, date = ?, start_time = ?, end_time = ?, hours = ?, description = ? 
      WHERE id = ?
    `).run(projectId, taskName, date, startTime, endTime, hours, description || '', id);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: 'Registro no encontrado' });
    }

    res.json({ success: true, message: 'Registro actualizado exitosamente' });
  } catch (error) {
    console.error('Error actualizando registro:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar registro' });
  }
};

export const deleteTimeEntry = (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = db.prepare('DELETE FROM time_entries WHERE id = ?').run(id);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: 'Registro no encontrado' });
    }

    res.json({ success: true, message: 'Registro eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando registro:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar registro' });
  }
};
