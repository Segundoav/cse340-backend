// Importamos la función del modelo de categorías
import { getAllCategories } from '../models/categories.js';

// Controlador para la página de categorías
const showCategoriesPage = async (req, res) => {
    try {
        const categories = await getAllCategories();
        const title = 'Service Categories';
        res.render('categories', { title, categories });
    } catch (error) {
        console.error("Error cargando categorías:", error);
        res.status(500).send("Error al cargar las categorías");
    }
};

export { showCategoriesPage };