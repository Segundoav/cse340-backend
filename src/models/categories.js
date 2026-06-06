import pool from './db.js';

// 1. Función para obtener todas las categorías de la base de datos
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

// 2. NUEVO: Recuperar una sola categoría por su ID
export async function getCategoryById(id) {
    try {
        const sql = "SELECT category_id, category_name FROM public.categories WHERE category_id = $1";
        const result = await pool.query(sql, [id]);
        return result.rows[0]; 
    } catch (error) {
        console.error("Error en getCategoryById:", error);
        throw error;
    }
}

// 3. Recuperar todos los proyectos de servicio para una categoría dada
export async function getProjectsByCategory(categoryId) {
    try {
        const sql = `
            SELECT p.project_id, p.project_name, p.description 
            FROM public.projects p
            JOIN public.project_categories pc ON p.project_id = pc.project_id
            WHERE pc.category_id = $1
        `;
        const result = await pool.query(sql, [categoryId]);
        return result.rows;
    } catch (error) {
        console.error("Error en getProjectsByCategory:", error);
        throw error;
    }
}

// 4. NUEVO: Recuperar todas las categorías de un proyecto específico (Para las etiquetas dinámicas)
export async function getCategoriesByProject(projectId) {
    try {
        const sql = `
            SELECT c.category_id, c.category_name 
            FROM public.categories c
            JOIN public.project_categories pc ON c.category_id = pc.category_id
            WHERE pc.project_id = $1
        `;
        const result = await pool.query(sql, [projectId]);
        return result.rows;
    } catch (error) {
        console.error("Error en getCategoriesByProject:", error);
        throw error;
    }
}

// 5. NUEVO: Insertar una nueva categoría en la base de datos
export async function insertCategory(category_name) {
    try {
        const sql = 'INSERT INTO public.categories (category_name) VALUES ($1) RETURNING *';
        const result = await pool.query(sql, [category_name]);
        return result.rows[0];
    } catch (error) {
        console.error("Error en insertCategory:", error);
        throw error;
    }
}

// 6. Actualizar una categoría existente en la base de datos
export async function updateCategory(category_id, category_name) {
    try {
        const sql = `
            UPDATE public.categories 
            SET category_name = $1 
            WHERE category_id = $2 
            RETURNING *
        `;
        const result = await pool.query(sql, [category_name, category_id]);
        return result.rows[0];
    } catch (error) {
        console.error("Error en updateCategory:", error);
        throw error;
    }
}