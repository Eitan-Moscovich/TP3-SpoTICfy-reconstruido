import { query } from "../db.js";

/**
 * Devuelve todas las canciones junto con datos del álbum y artista.
 * @param {import('express').Request} _
 * @param {import('express').Response} res
 */
const getCanciones = async (_, res) => {
  // Completar con la consulta que devuelve todas las canciones
  // Recordar que los parámetros de una consulta GET se encuentran en req.params
  // Deberían devolver los datos de la siguiente forma:
  /*
        [
            {
                "id": "Id de la canción",
                "nombre": "Nombre de la canción",
                "nombre_artista": "Id del artista",
                "nombre_album": "Id del album",
                "duracion": "Duración de la canción",
                "reproducciones": "Reproducciones de la canción"
            },
            {
                "id": "Id de la canción",
                "nombre": "Nombre de la canción",
                "nombre_artista": "Id del artista",
                "nombre_album": "Id del album",
                "duracion": "Duración de la canción",
                "reproducciones": "Reproducciones de la canción"
            },
            ...
        ]
    */
  try {
    const result = await query(`
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
      ORDER BY c.id ASC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Devuelve una canción por su ID junto con datos del álbum y artista.
 * @param {import('express').Request} req - Params: id
 * @param {import('express').Response} res
 */
const getCancion = async (req, res) => {
  try {
    const result = await query(`
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
      WHERE c.id = $1
    `, [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Canción no encontrada" });
    }
    // RÚBRICA: Devuelve el recurso directo, no una lista
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Crea una nueva canción con reproducciones inicializadas en 0.
 * @param {import('express').Request} req - Body: { nombre: string, album: number, duracion: number }
 * @param {import('express').Response} res
 */
const createCancion = async (req, res) => {
  // Completar con la consulta que crea una canción
  // Recordar que los parámetros de una consulta POST se encuentran en req.body
  // Deberían recibir los datos de la siguiente forma:
  /*
        {
            "nombre": "Nombre de la canción",
            "album": "Id del album",
            "duracion": "Duración de la canción",
        }
    */
  // (Reproducciones se inicializa en 0)
  const { nombre, album, duracion } = req.body;
  if (!nombre || !album || duracion === undefined) {
    return res.status(400).json({ error: "Los campos nombre, album y duracion son obligatorios" });
  }
  try {
    const result = await query(
      "INSERT INTO canciones (nombre, album, duracion, reproducciones) VALUES ($1, $2, $3, 0) RETURNING *",
      [nombre, album, duracion]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Actualiza el nombre, álbum y duración de una canción existente.
 * @param {import('express').Request} req - Params: id. Body: { nombre: string, album: number, duracion: number }
 * @param {import('express').Response} res
 */
const updateCancion = async (req, res) => {
  // Completar con la consulta que actualiza una canción
  // Recordar que los parámetros de una consulta PUT se encuentran en req.body
  // Deberían recibir los datos de la siguiente forma:
  /*
        {
            "nombre": "Nombre de la canción",
            "album": "Id del album",
            "duracion": "Duración de la canción",
        }
    */
  // (Reproducciones no se puede modificar con esta consulta)
  const { nombre, album, duracion } = req.body;
  if (!nombre || !album || duracion === undefined) {
    return res.status(400).json({ error: "Los campos nombre, album y duracion son obligatorios" });
  }
  try {
    const result = await query(
      "UPDATE canciones SET nombre = $1, album = $2, duracion = $3 WHERE id = $4 RETURNING *",
      [nombre, album, duracion, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Canción no encontrada" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Elimina una canción por su ID.
 * @param {import('express').Request} req - Params: id
 * @param {import('express').Response} res
 */
const deleteCancion = async (req, res) => {
  try {
    const result = await query(
      "DELETE FROM canciones WHERE id = $1 RETURNING *",
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Canción no encontrada" });
    }
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Incrementa en 1 el contador de reproducciones de una canción.
 * @param {import('express').Request} req - Params: id
 * @param {import('express').Response} res
 */
const reproducirCancion = async (req, res) => {
  try {
    const result = await query(
      "UPDATE canciones SET reproducciones = reproducciones + 1 WHERE id = $1 RETURNING *",
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Canción no encontrada" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const canciones = {
  getCanciones,
  getCancion,
  createCancion,
  updateCancion,
  deleteCancion,
  reproducirCancion,
};

export default canciones;
