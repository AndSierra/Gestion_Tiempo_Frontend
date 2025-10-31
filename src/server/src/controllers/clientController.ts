import { Request, Response } from 'express';
import db from '../config/database';

export const getAllClients = (req: Request, res: Response) => {
  try {
    const clients = db.prepare('SELECT * FROM clients').all();
    res.json({ success: true, data: clients });
  } catch (error) {
    console.error('Error obteniendo clientes:', error);
    res.status(500).json({ success: false, message: 'Error al obtener clientes' });
  }
};

export const getClientById = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(id);

    if (!client) {
      return res.status(404).json({ success: false, message: 'Cliente no encontrado' });
    }

    res.json({ success: true, data: client });
  } catch (error) {
    console.error('Error obteniendo cliente:', error);
    res.status(500).json({ success: false, message: 'Error al obtener cliente' });
  }
};

export const createClient = (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'El nombre es requerido' });
    }

    const result = db.prepare(`
      INSERT INTO clients (name, description) 
      VALUES (?, ?)
    `).run(name, description || '');

    res.status(201).json({ 
      success: true, 
      data: { id: result.lastInsertRowid, name, description },
      message: 'Cliente creado exitosamente' 
    });
  } catch (error) {
    console.error('Error creando cliente:', error);
    res.status(500).json({ success: false, message: 'Error al crear cliente' });
  }
};

export const updateClient = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'El nombre es requerido' });
    }

    const result = db.prepare(`
      UPDATE clients 
      SET name = ?, description = ? 
      WHERE id = ?
    `).run(name, description || '', id);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: 'Cliente no encontrado' });
    }

    res.json({ success: true, message: 'Cliente actualizado exitosamente' });
  } catch (error) {
    console.error('Error actualizando cliente:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar cliente' });
  }
};

export const deleteClient = (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = db.prepare('DELETE FROM clients WHERE id = ?').run(id);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: 'Cliente no encontrado' });
    }

    res.json({ success: true, message: 'Cliente eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando cliente:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar cliente' });
  }
};
