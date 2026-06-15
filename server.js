import express from 'express';
// IMPORTANTE: Le avisamos a server.js que el mapa de URLs viene de tu archivo maestro de rutas
import router from './src/routes.js';

import session from 'express-session';
import flash from 'connect-flash';

const NODE_ENV = process.env.NODE_ENV || "development";
const PORT = process.env.PORT || 3000;

const app = express();

// View engine configuration (Configuración de las Vistas con EJS)
app.set('view engine', 'ejs');
app.set('views', './src/views');

// Middleware to parse incoming form data from request bodies (W04)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Sesiones y mensajes flash
app.use(session({
    secret: 'cse340secret',
    resave: false,
    saveUninitialized: true
}));
app.use(flash());

// Hacer los mensajes flash disponibles en todas las vistas
app.use((req, res, next) => {
    res.locals.messages = req.flash();
    next();
});

app.use(express.static('public'));

// 1. Middleware para registrar en la consola las peticiones del usuario
app.use((req, res, next) => {
    if (NODE_ENV === 'development') {
        console.log(`${req.method} ${req.url}`);
    }
    next(); 
});

// 2. Middleware para compartir el entorno NODE_ENV con tus archivos .ejs (como el footer)
app.use((req, res, next) => {
    res.locals.isLoggedIn = false;
    if (req.session && req.session.user) {
        res.locals.isLoggedIn = true;
    }

    res.locals.NODE_ENV = NODE_ENV;
    next();
});
// ==========================================
// CENTRALIZACIÓN DE RUTAS (MVC)
// ==========================================
// Aquí conectamos el enrutador maestro que maneja todo de forma externa
app.use(router);

// ==========================================
// MIDDLEWARES DE CONTROL DE ERRORES (Al final)
// ==========================================

// Atrapa-todo para rutas que no existen (Error 404)
app.use((req, res, next) => {
    const err = new Error('Page Not Found');
    err.status = 404;
    next(err); // Pasa el error al bloque de abajo
});

// Manejador global para renderizar las pantallas de error 404.ejs y 500.ejs
app.use((err, req, res, next) => {
    console.error('Error occurred:', err.message);
    console.error('Stack trace:', err.stack);
    
    const status = err.status || 500;
    const template = status === 404 ? '404' : '500';
    
    const context = {
        title: status === 404 ? 'Page Not Found' : 'Server Error',
        error: err.message,
        stack: err.stack
    };
    
    res.status(status).render(`errors/${template}`, context);
});

// Inicialización del Servidor
app.listen(PORT, () => {
    console.log(`Server is running at http://127.0.0.1:${PORT}`);
    console.log(`Environment: ${NODE_ENV}`);
});