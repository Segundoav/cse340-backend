import express from 'express';
import { testConnection } from './src/models/db.js';
import { getAllOrganizations } from './src/models/organizations.js';
// 1. Aquí importamos tu nuevo modelo de categorías de forma moderna:
import { getAllCategories } from './src/models/categories.js';

const NODE_ENV =  process.env.NODE_ENV || "development";
const PORT = process.env.PORT || 3000;

const app = express();
// 1. Configuracion
// Dile a Express que use EJS
app.set('view engine', 'ejs');
// Dile dónde está tu carpeta de vistas
app.set('views', './src/views');
// Dile dónde están tus imágenes y CSS
app.use(express.static('public'));

// 2. Rutas
app.get('/', (req, res) => {
    res.render('home', { title: 'Service Network' });
});

app.get('/organizations', async (req, res) => {
    const organizations = await getAllOrganizations();
    const title = 'Our Partner Organizations';
    res.render('organizations', { title, organizations });
});

app.get('/projects', (req, res) => {
    res.render('projects', { title: 'Service Projects' });
});

// 2. Aquí modificamos tu ruta para que use "async" y traiga las categorías reales:
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

// 3. Encender el servidor
app.listen(PORT, async () => {
  try {
    await testConnection();
    console.log(`Server is running at http://127.0.0.1:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  } catch (error) {
    console.error('Error connecting to the database:', error);
  }
});