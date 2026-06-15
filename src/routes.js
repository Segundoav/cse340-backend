import express from 'express';
import pool from './models/db.js'; // Lo necesitas únicamente para tus consultas de mantenimiento de abajo
import { body } from 'express-validator'; // IMPORTANTE (W04): Para validar los datos del servidor

// Importamos las funciones de tus controladores especializados
import { showHomePage } from './controllers/index.js';
import { testErrorPage } from './controllers/errors.js';


// MODIFICADO (W04): Traemos todas las funciones necesarias del controlador de organizaciones
import { 
    showOrganizationsPage, 
    showOrganizationDetailPage,
    showNewOrganizationForm,
    processNewOrganizationForm,
    showEditOrganizationForm,
    processEditOrganizationForm
} from './controllers/organizations.js';
// MODIFICADO (W04): Traemos TODAS las funciones del controlador de categorías (las viejas y las nuevas)
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

import { showUserRegistrationForm, processUserRegistrationForm, showLoginForm, processLoginForm, processLogout, requireLogin, showDashboard } from './controllers/users.js';

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
// NUEVAS RUTAS DE LA SEMANA 4 (W04) - ORGANIZACIONES
// ========================================================
// 1. Ruta GET para MOSTRAR la interfaz del formulario limpio
router.get('/new-organization', showNewOrganizationForm);

// 2. Ruta POST para RECIBIR y procesar los datos que envíe el formulario
router.post('/new-organization', processNewOrganizationForm);



// Editar organización
router.get('/edit-organization/:id', showEditOrganizationForm);
router.post('/edit-organization/:id', processEditOrganizationForm);

// Editar proyecto y asignar categorías
router.get('/edit-project/:id', showEditProjectPage);
router.post('/edit-project/:id', processEditProject);
router.get('/assign-categories/:id', showAssignCategoriesPage);
router.post('/assign-categories/:id', processAssignCategories);

// Crear proyecto
router.get('/new-project', showNewProjectPage);
router.post('/new-project', processNewProject);


// ========================================================
// NUEVAS RUTAS DE LA SEMANA 4 (W04) - CATEGORÍAS (CON VALIDACIÓN)
// ========================================================
// 1. Formulario para CREAR una nueva categoría (GET)
router.get('/new-category', showNewCategoryPage);

// 2. Procesar CREACIÓN de categoría con validación del servidor (POST)
// Exige obligatoriedad, mínimo 3 caracteres y máximo 100 caracteres.
router.post('/new-category', [
    body('category_name')
        .trim()
        .notEmpty().withMessage('Category name is required.')
        .isLength({ min: 3 }).withMessage('Category name must be at least 3 characters long.')
        .isLength({ max: 100 }).withMessage('Category name cannot exceed 100 characters.')
], processNewCategory);

// 3. Formulario para EDITAR una categoría existente (GET)
router.get('/edit-category/:id', showEditCategoryPage);

// 4. Procesar ACTUALIZACIÓN de categoría con validación del servidor (POST)
router.post('/edit-category/:id', [
    body('category_name')
        .trim()
        .notEmpty().withMessage('Category name is required.')
        .isLength({ min: 3 }).withMessage('Category name must be at least 3 characters long.')
        .isLength({ max: 100 }).withMessage('Category name cannot exceed 100 characters.')
], processUpdateCategory);


// ==========================================
// RUTA DE PRUEBA DE ERRORES
// ==========================================
// Ruta de prueba para forzar el Error 500 y verificar tus pantallas de error
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

// User registration routes
router.get('/register', showUserRegistrationForm);
router.post('/register', processUserRegistrationForm);

// User login routes
router.get('/login', showLoginForm);
router.post('/login', processLoginForm);
router.get('/logout', processLogout);
// Protected dashboard route
router.get('/dashboard', requireLogin, showDashboard);

export default router;