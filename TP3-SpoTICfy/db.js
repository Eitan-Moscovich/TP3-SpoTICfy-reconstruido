import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
    throw new Error(
        "DATABASE_URL no está configurada. Copiá .env.example como .env y completá la cadena de conexión de Neon."
    );
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

export const query = (text, params) => pool.query(text, params);
