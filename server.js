import { getAllProjects } from './src/models/projects.js';
import express from 'express';
import pool from './src/models/db.js';
import { getAllOrganizations } from './src/models/organizations.js';
import { getAllCategories } from './src/models/categories.js';

const NODE_ENV = process.env.NODE_ENV || "development";
const PORT = process.env.PORT || 3000;

const app = express();

app.set('view engine', 'ejs');
app.set('views', './src/views');
app.use(express.static('public'));

// 1. Middleware to log all incoming requests (CORREGIDO: Usa NODE_ENV seguro)
app.use((req, res, next) => {
    if (NODE_ENV === 'development') {
        console.log(`${req.method} ${req.url}`);
    }
    next(); 
});

// 2. Middleware to make NODE_ENV available to all templates (CORREGIDO: Usa NODE_ENV seguro)
app.use((req, res, next) => {
    res.locals.NODE_ENV = NODE_ENV; 
    next();
});

app.get('/', (req, res) => {
    res.render('home', { title: 'Service Network' });
});

// 3. Ruta de organizaciones (CORREGIDO: Se añadió try/catch para evitar caídas del servidor)
app.get('/organizations', async (req, res) => {
    try {
        const organizations = await getAllOrganizations();
        const title = 'Our Partner Organizations';
        res.render('organizations', { title, organizations });
    } catch (error) {
        console.error("Error cargando organizaciones:", error);
        res.status(500).send("Error al cargar las organizaciones");
    }
});

app.get('/projects', async (req, res) => {
    try {
        const projectsData = await getAllProjects();
        const title = 'Service Projects';
        res.render('projects', { title, projects: projectsData });
    } catch (error) {
        console.error("Error cargando proyectos:", error);
        res.status(500).send("Error al cargar los proyectos");
    }
});

app.get('/categories', async (req, res) => {
    try {
        const categoriesData = await getAllCategories();
        const title = 'Project Categories';
        res.render('categories', { title, categories: categoriesData });
    } catch (error) {
        console.error("Error cargando categorías:", error);
        res.status(500).send("Error al cargar las categorías");
    }
});

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
        res.send('✅ Tablas projects y project_categories creadas correctamente');
    } catch (error) {
        res.status(500).send('❌ Error: ' + error.message);
    }
});

app.listen(PORT, async () => {
    try {
        console.log(`Server is running at http://127.0.0.1:${PORT}`);
        console.log(`Environment: ${NODE_ENV}`);
    } catch (error) {
        console.error('Error connecting to the database:', error);
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