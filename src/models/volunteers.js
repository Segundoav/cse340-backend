import pool from './db.js';

// 1. Agregar un voluntario a un proyecto
export async function addVolunteer(user_id, project_id) {
    try {
        const sql = `
            INSERT INTO public.project_volunteers (user_id, project_id)
            VALUES ($1, $2)
            ON CONFLICT DO NOTHING
            RETURNING *
        `;
        const result = await pool.query(sql, [user_id, project_id]);
        return result.rows[0];
    } catch (error) {
        console.error("Error en addVolunteer:", error);
        throw error;
    }
}

// 2. Eliminar un voluntario de un proyecto
export async function removeVolunteer(user_id, project_id) {
    try {
        const sql = `
            DELETE FROM public.project_volunteers
            WHERE user_id = $1 AND project_id = $2
            RETURNING *
        `;
        const result = await pool.query(sql, [user_id, project_id]);
        return result.rows[0];
    } catch (error) {
        console.error("Error en removeVolunteer:", error);
        throw error;
    }
}

// 3. Verificar si un usuario ya es voluntario de un proyecto
export async function isVolunteer(user_id, project_id) {
    try {
        const sql = `
            SELECT * FROM public.project_volunteers
            WHERE user_id = $1 AND project_id = $2
        `;
        const result = await pool.query(sql, [user_id, project_id]);
        return result.rows.length > 0;
    } catch (error) {
        console.error("Error en isVolunteer:", error);
        throw error;
    }
}

// 4. Obtener todos los proyectos en los que un usuario es voluntario
export async function getVolunteerProjects(user_id) {
    try {
        const sql = `
            SELECT p.project_id, p.project_name, p.description
            FROM public.projects p
            JOIN public.project_volunteers pv ON p.project_id = pv.project_id
            WHERE pv.user_id = $1
            ORDER BY pv.created_at DESC
        `;
        const result = await pool.query(sql, [user_id]);
        return result.rows;
    } catch (error) {
        console.error("Error en getVolunteerProjects:", error);
        throw error;
    }
}