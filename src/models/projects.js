import db from './db.js';

const getAllProjects = async () => {
    const query = `
        SELECT project_id, project_name, description, organization_id
        FROM public.projects;
    `;
    const result = await db.query(query);
    return result.rows;
};

export { getAllProjects };