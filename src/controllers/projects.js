// Importamos la función del modelo de proyectos
import { getAllProjects } from '../models/projects.js';

// Controlador para la página de proyectos
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

export { showProjectsPage };