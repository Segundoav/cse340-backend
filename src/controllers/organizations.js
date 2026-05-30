import { getAllOrganizations } from '../models/organizations.js';
import pool from '../models/db.js';

// 1. Lista general de organizaciones
const showOrganizationsPage = async (req, res) => {
    try {
        // Usamos la función exacta que ya tenías y que sí funciona perfectamente
        const organizations = await getAllOrganizations(); 
        const title = 'Our Partner Organizations';
        res.render('organizations', { title, organizations });
    } catch (error) {
        console.error("Error cargando organizaciones:", error);
        res.status(500).send("Error al cargar las organizaciones");
    }
};

// 2. Detalle de una organización individual
const showOrganizationDetailPage = async (req, res) => {
    try {
        const orgId = req.params.id;
        
        // Ejecutamos la consulta usando la propiedad .query correcta del pool importado
        const orgResult = await pool.query('SELECT * FROM organization WHERE organization_id = $1', [orgId]);
        const organization = orgResult.rows[0];

        if (!organization) {
            return res.status(404).render('errors/404', { title: 'Organization Not Found' });
        }

        // Jalamos los proyectos vinculados a esta organización
        const projectsResult = await pool.query('SELECT * FROM projects WHERE organization_id = $1', [orgId]);
        const projects = projectsResult.rows;

        const title = organization.name;
        res.render('organization-detail', { title, organization, projects });
    } catch (error) {
        console.error("Error cargando detalle de organización:", error);
        res.status(500).send("Error en el servidor");
    }
};

export { showOrganizationsPage, showOrganizationDetailPage };