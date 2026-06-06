import db from './db.js';

const getAllProjects = async () => {
    const query = `SELECT project_id, project_name, description, organization_id FROM public.projects;`;
    const result = await db.query(query);
    return result.rows;
};

const getProjectById = async (id) => {
    const result = await db.query('SELECT * FROM public.projects WHERE project_id = $1', [id]);
    return result.rows[0];
};

const updateProject = async (id, project_name, description) => {
    const result = await db.query(
        'UPDATE public.projects SET project_name = $1, description = $2 WHERE project_id = $3 RETURNING *',
        [project_name, description, id]
    );
    return result.rows[0];
};

const getAllCategoriesForProject = async (projectId) => {
    const result = await db.query(`
        SELECT c.category_id, c.category_name,
               CASE WHEN pc.project_id IS NOT NULL THEN true ELSE false END AS assigned
        FROM public.categories c
        LEFT JOIN public.project_categories pc ON c.category_id = pc.category_id AND pc.project_id = $1
        ORDER BY c.category_name
    `, [projectId]);
    return result.rows;
};

const updateProjectCategories = async (projectId, categoryIds) => {
    await db.query('DELETE FROM public.project_categories WHERE project_id = $1', [projectId]);
    if (categoryIds && categoryIds.length > 0) {
        const ids = Array.isArray(categoryIds) ? categoryIds : [categoryIds];
        for (const catId of ids) {
            await db.query(
                'INSERT INTO public.project_categories (project_id, category_id) VALUES ($1, $2)',
                [projectId, catId]
            );
        }
    }
    return true;
};

export { getAllProjects, getProjectById, updateProject, getAllCategoriesForProject, updateProjectCategories };