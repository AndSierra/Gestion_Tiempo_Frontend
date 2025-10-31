import { Request, Response } from 'express';
import db from '../config/database';

export const getAllProjects = (req: Request, res: Response) => {
  try {
    const projects = db.prepare(`
      SELECT p.*, c.name as clientName, u.name as leaderName
      FROM projects p
      LEFT JOIN clients c ON p.client_id = c.id
      LEFT JOIN users u ON p.leader_id = u.id
    `).all();

    res.json({ success: true, data: projects });
  } catch (error) {
    console.error('Error obteniendo proyectos:', error);
    res.status(500).json({ success: false, message: 'Error al obtener proyectos' });
  }
};

export const getProjectsByLeader = (req: Request, res: Response) => {
  try {
    const { leaderId } = req.params;

    const projects = db.prepare(`
      SELECT p.*, c.name as clientName, u.name as leaderName
      FROM projects p
      LEFT JOIN clients c ON p.client_id = c.id
      LEFT JOIN users u ON p.leader_id = u.id
      WHERE p.leader_id = ?
    `).all(leaderId);

    res.json({ success: true, data: projects });
  } catch (error) {
    console.error('Error obteniendo proyectos del líder:', error);
    res.status(500).json({ success: false, message: 'Error al obtener proyectos' });
  }
};

export const createProject = (req: Request, res: Response) => {
  try {
    const { name, clientId, leaderId, tasks } = req.body;

    if (!name || !clientId || !leaderId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nombre, cliente y líder son requeridos' 
      });
    }

    const result = db.prepare(`
      INSERT INTO projects (name, client_id, leader_id, tasks) 
      VALUES (?, ?, ?, ?)
    `).run(name, clientId, leaderId, tasks || '');

    res.status(201).json({ 
      success: true, 
      data: { id: result.lastInsertRowid, name, clientId, leaderId, tasks },
      message: 'Proyecto creado exitosamente' 
    });
  } catch (error) {
    console.error('Error creando proyecto:', error);
    res.status(500).json({ success: false, message: 'Error al crear proyecto' });
  }
};

export const updateProject = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, clientId, leaderId, tasks } = req.body;

    if (!name || !clientId || !leaderId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nombre, cliente y líder son requeridos' 
      });
    }

    const result = db.prepare(`
      UPDATE projects 
      SET name = ?, client_id = ?, leader_id = ?, tasks = ? 
      WHERE id = ?
    `).run(name, clientId, leaderId, tasks || '', id);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: 'Proyecto no encontrado' });
    }

    res.json({ success: true, message: 'Proyecto actualizado exitosamente' });
  } catch (error) {
    console.error('Error actualizando proyecto:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar proyecto' });
  }
};

export const deleteProject = (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = db.prepare('DELETE FROM projects WHERE id = ?').run(id);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: 'Proyecto no encontrado' });
    }

    res.json({ success: true, message: 'Proyecto eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando proyecto:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar proyecto' });
  }
};
