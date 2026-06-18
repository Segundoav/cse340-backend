import express from 'express';
import pool from './models/db.js';
import { body } from 'express-validator';

import { showHomePage } from './controllers/index.js';
import { testErrorPage } from './controllers/errors.js';

import { 
    showOrganizationsPage, 
    showOrganizationDetailPage,
    showNewOrganizationForm,
    processNewOrganizationForm,
    showEditOrganizationForm,
    processEditOrganizationForm
} from './controllers/organizations.js';

import { 
    showCategoriesPage, 
    showCategoryDetailPage,
    showNewCategoryPage,
    processNewCategory,
    showEditCategoryPage,
    processUpdateCategory
} from './controllers/categories.js';

import { 
    showProjectsPage, 
    showProjectDetailPage,
    showEditProjectPage,
    processEditProject,
    showAssignCategoriesPage,
    processAssignCategories,
    showNewProjectPage,
    processNewProject
} from './controllers/projects.js';

import { showUserRegistrationForm, processUserRegistrationForm, showLoginForm, processLoginForm, processLogout, requireLogin, requireRole, showDashboard, showUsersPage } from './controllers/users.js';

const router = express.Router();

// ==========================================
// VISTAS PÚBLICAS DE LA APLICACIÓN
// ==========================================
router.get('/', showHomePage);
router.get('/organizations', showOrganizationsPage);
router.get('/projects', showProjectsPage);
router.get('/categories', showCategoriesPage);

router.get('/organization/:id', showOrganizationDetailPage);
router.get('/project/:id', showProjectDetailPage);
router.get('/category/:id', showCategoryDetailPage);

// ========================================================
// RUTAS PROTEGIDAS W04 - ORGANIZACIONES
// ========================================================
router.get('/new-organization', requireLogin, requireRole('admin'), showNewOrganizationForm);
router.post('/new-organization', requireLogin, requireRole('admin'), processNewOrganizationForm);

router.get('/edit-organization/:id', requireLogin, requireRole('admin'), showEditOrganizationForm);
router.post('/edit-organization/:id', requireLogin, requireRole('admin'), processEditOrganizationForm);

// ========================================================
// RUTAS PROTEGIDAS W04 - PROYECTOS
// ========================================================
router.get('/new-project', requireLogin, requireRole('admin'), showNewProjectPage);
router.post('/new-project', requireLogin, requireRole('admin'), processNewProject);

router.get('/edit-project/:id', requireLogin, requireRole('admin'), showEditProjectPage);
router.post('/edit-project/:id', requireLogin, requireRole('admin'), processEditProject);

router.get('/assign-categories/:id', requireLogin, requireRole('admin'), showAssignCategoriesPage);
router.post('/assign-categories/:id', requireLogin, requireRole('admin'), processAssignCategories);

// ========================================================
// RUTAS PROTEGIDAS W04 - CATEGORÍAS (CON VALIDACIÓN)
// ========================================================
router.get('/new-category', requireLogin, requireRole('admin'), showNewCategoryPage);
router.post('/new-category', requireLogin, requireRole('admin'), [
    body('category_name')
        .trim()
        .notEmpty().withMessage('Category name is required.')
        .isLength({ min: 3 }).withMessage('Category name must be at least 3 characters long.')
        .isLength({ max: 100 }).withMessage('Category name cannot exceed 100 characters.')
], processNewCategory);

router.get('/edit-category/:id', requireLogin, requireRole('admin'), showEditCategoryPage);
router.post('/edit-category/:id', requireLogin, requireRole('admin'), [
    body('category_name')
        .trim()
        .notEmpty().withMessage('Category name is required.')
        .isLength({ min: 3 }).withMessage('Category name must be at least 3 characters long.')
        .isLength({ max: 100 }).withMessage('Category name cannot exceed 100 characters.')
], processUpdateCategory);

// ==========================================
// RUTA DE PRUEBA DE ERRORES
// ==========================================
router.get('/test-error', testErrorPage);

// ==========================================
// HERRAMIENTAS DE MANTENIMIENTO DE BASE DE DATOS
// ==========================================
router.get('/debug-tables', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT table_name FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/debug-org', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM organization');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/setup-db', async (req, res) => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS public.projects (
                project_id SERIAL PRIMARY KEY,
                project_name VARCHAR(150) NOT NULL,
                description TEXT NOT NULL,
                organization_id INT REFERENCES public.organization(organization_id) ON DELETE CASCADE
            );
        `);
        await pool.query(`
            INSERT INTO public.projects (project_name, description, organization_id)
            SELECT 'Community Center Rebuild', 'Rebuilding the local community center.', 1
            WHERE NOT EXISTS (SELECT 1 FROM public.projects);
        `);
        await pool.query(`
            INSERT INTO public.projects (project_name, description, organization_id) VALUES
            ('Urban Garden Initiative', 'Creating urban gardens in food deserts.', 2),
            ('Homeless Shelter Support', 'Providing weekly volunteer support.', 3)
            ON CONFLICT DO NOTHING;
        `);
        await pool.query(`
            CREATE TABLE IF NOT EXISTS public.project_categories (
                project_id INT REFERENCES public.projects(project_id) ON DELETE CASCADE,
                category_id INT REFERENCES public.categories(category_id) ON DELETE CASCADE,
                PRIMARY KEY (project_id, category_id)
            );
        `);
        await pool.query(`
            INSERT INTO public.project_categories (project_id, category_id) VALUES
            (1,1),(2,3),(3,2)
            ON CONFLICT DO NOTHING;
        `);
        res.send('✅ Tables projects and project_categories created successfully');
    } catch (error) {
        res.status(500).send('❌ Error: ' + error.message);
    }
});

router.get('/setup-volunteers', async (req, res) => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS public.project_volunteers (
                user_id INT REFERENCES public.users(user_id) ON DELETE CASCADE,
                project_id INT REFERENCES public.projects(project_id) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (user_id, project_id)
            );
        `);
        res.send('✅ Table project_volunteers created successfully');
    } catch (error) {
        res.status(500).send('❌ Error: ' + error.message);
    }
});

// ==========================================
// USUARIOS
// ==========================================
router.get('/register', showUserRegistrationForm);
router.post('/register', processUserRegistrationForm);

router.get('/login', showLoginForm);
router.post('/login', processLoginForm);
router.get('/logout', processLogout);

router.get('/dashboard', requireLogin, showDashboard);
router.get('/users', requireLogin, requireRole('admin'), showUsersPage);

export default router;