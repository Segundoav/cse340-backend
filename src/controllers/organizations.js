// Importamos la función del modelo (capa de datos)
import { getAllOrganizations } from '../models/organizations.js';

// Controlador para la página de organizaciones
const showOrganizationsPage = async (req, res) => {
    try {
        const organizations = await getAllOrganizations();
        const title = 'Our Partner Organizations';
        res.render('organizations', { title, organizations });
    } catch (error) {
        console.error("Error cargando organizaciones:", error);
        res.status(500).send("Error al cargar las organizaciones");
    }
};

export { showOrganizationsPage };