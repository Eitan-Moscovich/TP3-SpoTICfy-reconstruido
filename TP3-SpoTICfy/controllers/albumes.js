import { query } from "../db.js";

/**
 * Devuelve todos los álbumes junto con el nombre del artista.
 * @param {import('express').Request} _
 * @param {import('express').Response} res
 */
const getAlbumes = async (_, res) => {
  // Completar con la consulta que devuelve todos los albumes
  // Recordar que los parámetros de una consulta GET se encuentran en req.params
  // Deberían devolver los datos de la siguiente forma:
  /*
        [
            {
                "id": 1,
                "nombre": "Nombre del album",
                "nombre_artista": "Nombre del artista"
            },
            {
                "id": 2,
                "nombre": "Nombre del album",
                "nombre_artista": "Nombre del artista"
            },
            ...
        ]
    */
  try {
    const sql = `
      SELECT a.id, a.nombre, art.nombre AS nombre_artista 
      FROM albumes a
      JOIN artistas art ON a.artista = art.id
      ORDER BY a.id ASC
    `;
    const result = await query(sql);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Devuelve un álbum por su ID junto con el nombre del artista.
 * @param {import('express').Request} req - Params: id
 * @param {import('express').Response} res
 */
const getAlbum = async (req, res) => {
  // Completar con la consulta que devuelve un album por id
  // Recordar que los parámetros de una consulta GET se encuentran en req.params
  // Deberían devolver los datos de la siguiente forma:
  /*
        {
            "id": 1,
            "nombre": "Nombre del album",
            "nombre_artista": "Nombre del artista"
        }
    */
  const { id } = req.params;
  try {
    const sql = `
      SELECT a.id, a.nombre, art.nombre AS nombre_artista 
      FROM albumes a
      JOIN artistas art ON a.artista = art.id
      WHERE a.id = $1
    `;
    const result = await query(sql, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Álbum no encontrado" });
    }
    // RÚBRICA: Se devuelve el objeto directo y no una lista
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Crea un nuevo álbum.
 * @param {import('express').Request} req - Body: { nombre: string, artista: number }
 * @param {import('express').Response} res
 */
const createAlbum = async (req, res) => {
  // Completar con la consulta que crea un album
  // Recordar que los parámetros de una consulta POST se encuentran en req.body
  // Deberían recbir los datos de la siguiente forma:
  /*
        {
            "nombre": "Nombre del album",
            "artista": "Id del artista"
        }
    */
  const { nombre, artista } = req.body;
  if (!nombre || !artista) {
    return res.status(400).json({ error: "Los campos nombre y artista son obligatorios" });
  }
  try {
    const result = await query(
      "INSERT INTO albumes (nombre, artista) VALUES ($1, $2) RETURNING *",
      [nombre, artista]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Actualiza el nombre y artista de un álbum existente.
 * @param {import('express').Request} req - Params: id. Body: { nombre: string, artista: number }
 * @param {import('express').Response} res
 */
const updateAlbum = async (req, res) => {
  // Completar con la consulta que actualiza un album
  // Recordar que en este caso tienen parámetros en req.params (el id) y en req.body (los demás datos)
  // Deberían recbir los datos de la siguiente forma:
  /*
        {
            "nombre": "Nombre del album",
            "artista": "Id del artista"
        }
    */
  const { id } = req.params;
  const { nombre, artista } = req.body;
  if (!nombre || !artista) {
    return res.status(400).json({ error: "Los campos nombre y artista son obligatorios" });
  }
  try {
    const result = await query(
      "UPDATE albumes SET nombre = $1, artista = $2 WHERE id = $3 RETURNING *",
      [nombre, artista, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Álbum no encontrado" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Elimina un álbum por su ID. Retorna 400 si el álbum tiene canciones asociadas.
 * @param {import('express').Request} req - Params: id
 * @param {import('express').Response} res
 */
const deleteAlbum = async (req, res) => {
  // Completar con la consulta que elimina un album
  // ¡Ojo con albumes que tengan canciones! Devuelvan el error apropiado, 400.
  // Recordar que los parámetros de una consulta DELETE se encuentran en req.params
  const { id } = req.params;
  try {
    // Verificamos en SQL si el álbum tiene canciones asociadas
    const cancionesCheck = await query("SELECT id FROM canciones WHERE album = $1 LIMIT 1", [id]);
    if (cancionesCheck.rows.length > 0) {
      return res.status(400).json({ error: "No se puede eliminar un álbum que contiene canciones" });
    }

    const result = await query("DELETE FROM albumes WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Álbum no encontrado" });
    }
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Devuelve todas las canciones de un álbum, incluyendo datos del artista.
 * @param {import('express').Request} req - Params: id
 * @param {import('express').Response} res
 */
const getCancionesByAlbum = async (req, res) => {
  // Completar con la consulta que devuelve las canciones de un album
  // Recordar que los parámetros de una consulta GET se encuentran en req.params
  // Deberían devolver los datos de la misma forma que getCanciones
  const { id } = req.params;
  try {
    // Filtramos usando SQL y haciendo los JOIN necesarios para traer datos del álbum y artista
    const sql = `
      SELECT
        c.id,
        c.nombre,
        art.nombre AS nombre_artista,
        a.nombre AS nombre_album,
        c.duracion,
        c.reproducciones
      FROM canciones c
      JOIN albumes a ON c.album = a.id
      JOIN artistas art ON a.artista = art.id
      WHERE c.album = $1
      ORDER BY c.id ASC
    `;
    const result = await query(sql, [id]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const albumes = {
  getAlbumes,
  getAlbum,
  createAlbum,
  updateAlbum,
  deleteAlbum,
  getCancionesByAlbum,
};

export default albumes;
