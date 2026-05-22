import pool from './db.js';

// Función para obtener todas las categorías de la base de datos
export async function getAllCategories() {
    try {
        const sql = 'SELECT category_id, category_name FROM public.categories ORDER BY category_name ASC';
        const result = await pool.query(sql);
        return result.rows;
    } catch (error) {
        console.error("Error en getAllCategories:", error);
        throw error;
    }
}