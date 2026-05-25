// Controlador para la página de inicio (Home)
const showHomePage = async (req, res) => {
    const title = 'Home';
    res.render('home', { title });
};

// Exportamos la función para que el archivo de rutas la pueda usar
export { showHomePage };