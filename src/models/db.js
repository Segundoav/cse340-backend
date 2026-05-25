import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

let pool;

// Usamos la variable exacta de tu archivo .env: DB_URL
const connectionString = process.env.DB_URL;

// Detectamos si es una base de datos de Render
const isRender = connectionString && connectionString.includes('render.com');

if (process.env.NODE_ENV === 'production' || isRender) {
    // Configuración segura con SSL para Render
    pool = new Pool({
        connectionString: connectionString,
        ssl: {
            rejectUnauthorized: false // Obligatorio para conectar con Render externamente
        }
    });
} else {
    // Configuración local de respaldo si no hubiera un string de conexión completo
    pool = new Pool({
        connectionString: connectionString
    });
}

// Validación automática en la consola
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ Error conectando a la base de datos:', err.message);
    } else {
        console.log('✅ Conexión a la base de datos establecida correctamente');
    }
});

export default pool;