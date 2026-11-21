# TP3 - SpoTICfy

## Instalación

1. Instalá Node.js si todavía no lo tenés.
2. Abrí esta carpeta en VS Code.
3. Ejecutá:

```bash
npm install
```

## Conexión con Neon

1. Copiá `.env.example` y renombrá la copia a `.env`.
2. Pegá en `DATABASE_URL` la cadena de conexión de tu base de datos Neon.
3. No compartas el archivo `.env` porque contiene la contraseña de la base de datos.

La conexión se configura en `db.js`.

## Base de datos

Ejecutá el contenido de `spoticfy.sql` en tu base PostgreSQL de Neon para crear las tablas y cargar los datos iniciales.

## Ejecutar

```bash
npm run dev
```

La API queda disponible en:

`http://localhost:3000`

Para comprobar que inició:

`http://localhost:3000/`

## Probar

Usá Insomnia para probar los endpoints. Guardá/exportá la colección dentro de `pruebas/`.

## Carpetas

- `controllers/`: lógica de artistas, álbumes y canciones.
- `diagramas/`: guardar acá los diagramas DER y DLR.
- `pruebas/`: guardar acá la exportación de Insomnia.
