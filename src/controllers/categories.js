import { getAllCategories, getCategoryById, getProjectsByCategory } from '../models/categories.js';

// 1. Controlador para la lista completa de categorías (/categories)
const showCategoriesPage = async (req, res, next) => {
    try {
        const categories = await getAllCategories();
        const title = 'Service Categories';
        // Renderiza la vista categories.ejs suelta en la carpeta views
        res.render('categories', { title, categories });
    } catch (error) {
        // En lugar de un res.send duro, pasamos el error al manejador centralizado
        next(error);
    }
};

// 2. Controlador para la página de detalle de una categoría (/category/[id])
const showCategoryDetailPage = async (req, res, next) => {
    try {
        const categoryId = req.params.id; // Captura el ID desde la URL
        
        // Recuperamos la categoría por su ID
        const category = await getCategoryById(categoryId);
        
        // Si la categoría no existe en la Base de Datos, disparamos un error 404
        if (!category) {
            const err = new Error('Category Not Found');
            err.status = 404;
            return next(err);
        }

        // Recuperamos todos los proyectos asociados a esta categoría
        const projects = await getProjectsByCategory(categoryId);

        // CORREGIDO: Renderiza el archivo 'category-detail.ejs' suelto en views
        res.render('category-detail', { 
            title: `Category: ${category.category_name}`, 
            category, 
            projects 
        });
    } catch (error) {
        next(error);
    }
};

// Exportamos ambas funciones usando la sintaxis de tu archivo original
export { showCategoriesPage, showCategoryDetailPage };