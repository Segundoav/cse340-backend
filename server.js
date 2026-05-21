import express from 'express';
import { testConnection } from './src/models/db.js';
import { getAllOrganizations } from './src/models/organizations.js';


const NODE_ENV =  process.env.NODE_ENV || "development";
const PORT = process.env.PORT || 3000;

const app = express();
// 1.Configuracion
// Dile a Express que use EJS
app.set('view engine', 'ejs');
// Dile dónde está tu carpeta de vistas
app.set('views', './src/views');
// Dile dónde están tus imágenes y CSS
app.use(express.static('public'));

// 2.Rutas
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

app.get('/categories', (req, res) => {
    res.render('categories', { title: 'Project Categories' });
});

// 3 Encender
app.listen(PORT, async () => {
  try {
    await testConnection();
    console.log(`Server is running at http://127.0.0.1:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  } catch (error) {
    console.error('Error connecting to the database:', error);
  }
});