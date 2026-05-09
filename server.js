import express from 'express';

const NODE_ENV = "production";
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

app.get('/organizations', (req, res) => {
    res.render('organizations', { title: 'Partner Organizations' });
});

app.get('/projects', (req, res) => {
    res.render('projects', { title: 'Service Projects' });
});

app.get('/categories', (req, res) => {
    res.render('categories', { title: 'Project Categories' });
});

// 3 Encender
 app.listen(PORT, () => {
    console.log(`Server is running at http://127.0.0.1:${PORT}`);
    console.log(`Environment: ${NODE_ENV}`);

 });