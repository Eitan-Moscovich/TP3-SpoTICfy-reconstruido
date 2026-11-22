import { query } from "../db.js";

/**
 * Devuelve todos los artistas.
 * @param {import('express').Request} _
 * @param {import('express').Response} res
 */
const getArtistas = async (_, res) => {
    try {
        const result = await query("SELECT * FROM artistas ORDER BY id ASC");
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Devuelve un artista por su ID.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const getArtista = async (req, res) => {
    try {
        const result = await query(
            "SELECT * FROM artistas WHERE id = $1",
            [req.params.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Artista no encontrado" });
        }
        // RÚBRICA: Devuelve el recurso directo, no una lista
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Crea un nuevo artista.
 * @param {import('express').Request} req - Body: { nombre: string }
 * @param {import('express').Response} res
 */
const createArtista = async (req, res) => {
    const { nombre } = req.body;
    if (!nombre) {
        return res.status(400).json({ error: "El campo nombre es obligatorio" });
    }
    try {
        const result = await query(
            "INSERT INTO artistas (nombre) VALUES ($1) RETURNING *",
            [nombre]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Actualiza el nombre de un artista existente.
 * @param {import('express').Request} req - Params: id. Body: { nombre: string }
 * @param {import('express').Response} res
 */
const updateArtista = async (req, res) => {
    const { nombre } = req.body;
    if (!nombre) {
        return res.status(400).json({ error: "El campo nombre es obligatorio" });
    }
    try {
        const result = await query(
            "UPDATE artistas SET nombre = $1 WHERE id = $2 RETURNING *",
            [nombre, req.params.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Artista no encontrado" });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Elimina un artista por su ID.
 * @param {import('express').Request} req - Params: id
 * @param {import('express').Response} res
 */
const deleteArtista = async (req, res) => {
    try {
        const albumes = await query(
            "SELECT id FROM albumes WHERE artista = $1 LIMIT 1",
            [req.params.id]
        );

        if (albumes.rows.length > 0) {
            return res.status(400).json({
                error: "No se puede eliminar un artista con álbumes asociados"
            });
        }

        const result = await query(
            "DELETE FROM artistas WHERE id = $1 RETURNING *",
            [req.params.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Artista no encontrado" });
        }
        res.sendStatus(204);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Devuelve todos los álbumes de un artista, incluyendo el nombre del artista.
 * @param {import('express').Request} req - Params: id
 * @param {import('express').Response} res
 */
const getAlbumesByArtista = async (req, res) => {
    try {
        const result = await query(
            `SELECT
                albumes.id,
                albumes.nombre,
                artistas.nombre AS nombre_artista
            FROM albumes
                JOIN artistas ON albumes.artista = artistas.id
            WHERE albumes.artista = $1
            ORDER BY albumes.id ASC`,
            [req.params.id]
        );

        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Devuelve todas las canciones de un artista, incluyendo datos del álbum.
 * @param {import('express').Request} req - Params: id
 * @param {import('express').Response} res
 */
const getCancionesByArtista = async (req, res) => {
    try {
        const result = await query(
            `SELECT
                canciones.id,
                canciones.nombre,
                canciones.duracion,
                canciones.reproducciones,
                artistas.nombre AS nombre_artista,
                albumes.nombre AS nombre_album
            FROM canciones
                JOIN albumes ON albumes.id = canciones.album
                JOIN artistas ON albumes.artista = artistas.id
            WHERE artistas.id = $1
            ORDER BY canciones.id ASC`,
            [req.params.id]
        );

        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const artistas = {
    getArtistas,
    getArtista,
    createArtista,
    updateArtista,
    deleteArtista,
    getAlbumesByArtista,
    getCancionesByArtista,
};

export default artistas;
