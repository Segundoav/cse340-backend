import { getAllProjects, getProjectById } from '../models/projects.js';

// 1. Controlador para listar todos los proyectos
const showProjectsPage = async (req, res) => {
    try {
        const projects = await getAllProjects();
        const title = 'Service Projects';
        res.render('projects', { title, projects });
    } catch (error) {
        console.error("Error cargando proyectos:", error);
        res.status(500).send("Error al cargar los proyectos");
    }
};

// 2. 🌟 Controlador para la página de detalle (La función que tus rutas están buscando)
const showProjectDetailPage = async (req, res) => {
    try {
        const projectId = req.params.id;
        const project = await getProjectById(projectId); // Llama al modelo

        if (!project) {
            return res.status(404).render('404', { title: 'Page Not Found' });
        }

        const title = project.project_name;
        
        // Renderiza tu vista 'project-detail.ejs' pasando los datos requeridos por la rúbrica
        res.render('project-detail', { 
            title, 
            project, 
            categories: [] // Se envía vacío por ahora para evitar errores en la vista
        });
    } catch (error) {
        console.error("Error cargando detalle del proyecto:", error);
        res.status(500).send("Error al cargar el detalle del proyecto");
    }
};

// Exportamos las funciones del controlador de forma limpia
export { showProjectsPage, showProjectDetailPage };