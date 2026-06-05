import { getAllOrganizations, createOrganization } from '../models/organizations.js';
import pool from '../models/db.js';

// 1. Lista general de organizaciones
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

// 2. Detalle de una organización individual
const showOrganizationDetailPage = async (req, res) => {
    try {
        const orgId = req.params.id;
        
        const orgResult = await pool.query('SELECT * FROM organization WHERE organization_id = $1', [orgId]);
        const organization = orgResult.rows[0];

        if (!organization) {
            return res.status(404).render('errors/404', { title: 'Organization Not Found' });
        }

        const projectsResult = await pool.query('SELECT * FROM projects WHERE organization_id = $1', [orgId]);
        const projects = projectsResult.rows;

        const title = organization.name;
        res.render('organization-detail', { title, organization, projects });
    } catch (error) {
        console.error("Error cargando detalle de organización:", error);
        res.status(500).send("Error en el servidor");
    }
};

// ====================================================================
// NUEVAS FUNCIONES DE LA SEMANA 4 (W04)
// ====================================================================

// 3. Muestra el formulario vacío al usuario (GET)
const showNewOrganizationForm = async (req, res) => {
    // Nota: Como tu archivo en la captura se llama 'new-organizations.ejs', usamos ese nombre exacto aquí.
    res.render('new-organizations', { title: 'Add New Organization' });
};

// 4. Recibe los datos que el usuario escribió y los procesa (POST)
const processNewOrganizationForm = async (req, res) => {
    try {
        // Capturamos lo que el usuario escribió en las cajas de texto del HTML
        const { name, description, contactEmail } = req.body;
        const logoFilename = 'placeholder-logo.png'; // Le asignamos el logo temporal que descargaste
        
        // Llamamos al modelo para insertar los datos en PostgreSQL y obtener el nuevo ID
        const organizationId = await createOrganization(name, description, contactEmail, logoFilename);
        
        // Redirigimos al navegador automáticamente a la página de la organización creada
        res.redirect(`/organization/${organizationId}`);
    } catch (error) {
        console.error("Error en processNewOrganizationForm controller: " + error.message);
        res.status(500).send("Error en el servidor al crear la organización");
    }
};

// Exportamos tus dos funciones antiguas MÁS las dos nuevas funciones
export { 
    showOrganizationsPage, 
    showOrganizationDetailPage, 
    showNewOrganizationForm, 
    processNewOrganizationForm 
};