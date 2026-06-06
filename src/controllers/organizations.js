import { getAllOrganizations, createOrganization, getOrganizationById, updateOrganization } from '../models/organizations.js';
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
        res.render('organization-detail', { title: organization.name, organization, projects });
    } catch (error) {
        console.error("Error cargando detalle de organización:", error);
        res.status(500).send("Error en el servidor");
    }
};

// 3. Muestra el formulario vacío para crear organización (GET)
const showNewOrganizationForm = async (req, res) => {
    res.render('new-organizations', { title: 'Add New Organization' });
};

// 4. Procesa la creación de organización (POST)
const processNewOrganizationForm = async (req, res) => {
    try {
        const { name, description, contactEmail } = req.body;
        const logoFilename = 'placeholder-logo.png';
        const organizationId = await createOrganization(name, description, contactEmail, logoFilename);
        res.redirect(`/organization/${organizationId}`);
    } catch (error) {
        console.error("Error en processNewOrganizationForm controller: " + error.message);
        res.status(500).send("Error en el servidor al crear la organización");
    }
};

// 5. Muestra el formulario pre-llenado para editar organización (GET)
const showEditOrganizationForm = async (req, res, next) => {
    try {
        const org = await getOrganizationById(req.params.id);
        if (!org) {
            req.flash('notice', 'Organization not found.');
            return res.redirect('/organizations');
        }
        res.render('edit-organization', {
            title: 'Edit Organization',
            errors: null,
            organization: org
        });
    } catch (error) {
        next(error);
    }
};

// 6. Procesa la actualización de organización (POST)
const processEditOrganizationForm = async (req, res, next) => {
    try {
        const { organization_id, name, description, contactEmail } = req.body;
        await updateOrganization(organization_id, name, description, contactEmail);
        req.flash('notice', 'Organization updated successfully.');
        res.redirect(`/organization/${organization_id}`);
    } catch (error) {
        next(error);
    }
};

export { 
    showOrganizationsPage, 
    showOrganizationDetailPage, 
    showNewOrganizationForm, 
    processNewOrganizationForm,
    showEditOrganizationForm,
    processEditOrganizationForm
};