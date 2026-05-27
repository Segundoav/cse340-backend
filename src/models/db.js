import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

// Usamos la variable exacta de tu archivo .env: DB_URL
const connectionString = process.env.DB_URL;

// CONFIGURACIÓN UNIFICADA: Forzamos SSL siempre porque tu base de datos lo exige de forma obligatoria
const pool = new Pool({
    connectionString: connectionString,
    ssl: {
        rejectUnauthorized: false // Permite la conexión segura tanto en Localhost como en Render
    }
});

// Validación automática en la consola
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ Error conectando a la base de datos:', err.message);
    } else {
        console.log('✅ Conexión a la base de datos establecida correctamente');
    }
});

export default pool;