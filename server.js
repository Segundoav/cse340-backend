import express from 'express';
import pool from './src/models/db.js';
import { getAllProjects } from './src/models/projects.js';
import { getAllOrganizations } from './src/models/organizations.js';
import { getAllCategories } from './src/models/categories.js';

const NODE_ENV = process.env.NODE_ENV || "development";
const PORT = process.env.PORT || 3000;

const app = express();

// View engine configuration
app.set('view engine', 'ejs');
app.set('views', './src/views');
app.use(express.static('public'));

// 1. Middleware to log all incoming requests
app.use((req, res, next) => {
    if (NODE_ENV === 'development') {
        console.log(`${req.method} ${req.url}`);
    }
    next(); 
});

// 2. Middleware to make NODE_ENV available to all templates
app.use((req, res, next) => {
    res.locals.NODE_ENV = NODE_ENV; 
    next();
});

// ==========================================
// ROUTES
// ==========================================

app.get('/', (req, res) => {
    res.render('home', { title: 'Service Network' });
});

app.get('/organizations', async (req, res, next) => {
    try {
        const organizations = await getAllOrganizations();
        const title = 'Our Partner Organizations';
        res.render('organizations', { title, organizations });
    } catch (error) {
        console.error("Error loading organizations:", error);
        next(error); // 👈 Directs to your 500.ejs error template
    }
});

app.get('/projects', async (req, res, next) => {
    try {
        const projectsData = await getAllProjects();
        const title = 'Service Projects';
        res.render('projects', { title, projects: projectsData });
    } catch (error) {
        console.error("Error loading projects:", error);
        next(error); // 👈 Directs to your 500.ejs error template
    }
});

app.get('/categories', async (req, res, next) => {
    try {
        const categoriesData = await getAllCategories();
        const title = 'Project Categories';
        res.render('categories', { title, categories: categoriesData });
    } catch (error) {
        console.error("Error loading categories:", error);
        next(error); // 👈 Directs to your 500.ejs error template
    }
});

// ==========================================
// DATABASE DEBUG & SETUP UTILITIES
// ==========================================

app.get('/debug-tables', async (req, res) => {
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

app.get('/debug-org', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM organization');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/setup-db', async (req, res) => {
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

// ==========================================
// ERROR HANDLING MIDDLEWARE (MUST BE AT THE END)
// ==========================================

// 404 - Page Not Found
app.use((req, res, next) => {
    res.status(404).render('404', { title: "Page Not Found" });
});

// 500 - Internal Server Error
app.use((err, req, res, next) => {
    console.error(err.stack); 
    res.status(500).render('500', { title: "Internal Server Error", error: err });
});

// Server Initialization
app.listen(PORT, () => {
    console.log(`Server is running at http://127.0.0.1:${PORT}`);
    console.log(`Environment: ${NODE_ENV}`);
});