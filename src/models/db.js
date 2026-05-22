import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

let pool;

// Si está en Render (Producción), usa la URL interna con seguridad SSL obligatorio
if (process.env.NODE_ENV === 'production' || process.env.DATABASE_URL.includes('render.com')) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // ¡Obligatorio para que Render acepte la conexión!
    }
  });
} else {
  // Si estás en tu computadora local (Desarrollo)
  pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });
}

// Probar conexión de forma automática en los logs
async function testConnection() {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('¡Base de datos conectada con éxito en Render! Hora del servidor:', res.rows[0].now);
  } catch (err) {
    console.error('Error de conexión a la base de datos:', err.message);
  }
}

testConnection();

export default pool;