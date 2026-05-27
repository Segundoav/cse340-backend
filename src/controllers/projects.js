import pool from '../models/db.js'; // Usamos pool temporalmente aquí para cumplir rápido

// 1. Controlador para la lista general
export const showProjectsPage = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM public.projects');
        const projects = result.rows;
        const title = 'Service Projects';
        res.render('projects', { title, projects });
    } catch (error) {
        console.error("Error loading projects:", error);
        res.status(500).send("Error loading projects");
    }
};

// 2. 🌟 Controlador para la vista de detalle individual
export const showProjectDetailPage = async (req, res) => {
    try {
        const projectId = req.params.id;

        // Consultamos el proyecto por su ID
        const projectResult = await pool.query('SELECT * FROM public.projects WHERE project_id = $1', [projectId]);
        const project = projectResult.rows[0];

        if (!project) {
            return res.status(404).render('errors/404', { title: 'Page Not Found' }); 
        }

        // Consultamos las categorías asignadas a este proyecto para pintar los tags
        const categoryResult = await pool.query(`
            SELECT c.category_id, c.category_name 
            FROM public.categories c
            JOIN public.project_categories pc ON c.category_id = pc.category_id
            WHERE pc.project_id = $1
        `, [projectId]);
        
        const categories = categoryResult.rows;
        const title = project.project_name;

        // Renderizamos la vista que acabamos de crear con todos los datos
        res.render('project-detail', { title, project, categories });
    } catch (error) {
        console.error("Error loading project detail:", error);
        res.status(500).send("Server Error loading project detail");
    }
};