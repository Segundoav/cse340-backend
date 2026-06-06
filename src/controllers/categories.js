import { 
  getAllCategories, 
  getCategoryById, 
  getProjectsByCategory,
  insertCategory,  // Asegúrate de que tu modelo exporte estas funciones
  updateCategory   // Asegúrate de que tu modelo exporte estas funciones
} from '../models/categories.js';
import { validationResult } from 'express-validator';

// 1. Controlador para la lista completa de categorías (/categories)
const showCategoriesPage = async (req, res, next) => {
    try {
        const categories = await getAllCategories();
        const title = 'Service Categories';
        res.render('categories', { title, categories });
    } catch (error) {
        next(error);
    }
};

// 2. Controlador para la página de detalle de una categoría (/category/[id])
const showCategoryDetailPage = async (req, res, next) => {
    try {
        const categoryId = req.params.id;
        const category = await getCategoryById(categoryId);
        
        if (!category) {
            const err = new Error('Category Not Found');
            err.status = 404;
            return next(err);
        }

        const projects = await getProjectsByCategory(categoryId);

        res.render('category-detail', { 
            title: `Category: ${category.category_name}`, 
            category, 
            projects 
        });
    } catch (error) {
        next(error);
    }
};

// ========================================================
// NUEVAS FUNCIONES PARA LA TAREA W04 (INSERCIÓN Y EDICIÓN)
// ========================================================

// 3. Mostrar formulario de Nueva Categoría (GET /new-category)
const showNewCategoryPage = async (req, res, next) => {
    res.render('new-category', {
        title: 'Create New Category',
        errors: null,
        category_name: ''
    });
};

// 4. Procesar envío de Nueva Categoría (POST /new-category)
const processNewCategory = async (req, res, next) => {
    const { category_name } = req.body;
    const errors = validationResult(req);

    // Si la validación del servidor falla, recargamos la vista mostrando los errores
    if (!errors.isEmpty()) {
        return res.render('new-category', {
            title: 'Create New Category',
            errors: errors.array(),
            category_name
        });
    }

    try {
        const createResult = await insertCategory(category_name);
        if (createResult) {
            req.flash('notice', `The category "${category_name}" was successfully created.`);
            res.redirect('/categories');
        } else {
            res.status(501).render('new-category', {
                title: 'Create New Category',
                errors: [{ msg: 'Database error: Insertion failed.' }],
                category_name
            });
        }
    } catch (error) {
        next(error);
    }
};

// 5. Mostrar formulario de Edición de Categoría (GET /edit-category/:id)
const showEditCategoryPage = async (req, res, next) => {
    try {
        const categoryId = req.params.id;
        const categoryData = await getCategoryById(categoryId);

        if (!categoryData) {
            req.flash('notice', 'Category not found.');
            return res.redirect('/categories');
        }

        res.render('edit-category', {
            title: 'Edit Category',
            errors: null,
            category_id: categoryData.category_id,
            category_name: categoryData.category_name
        });
    } catch (error) {
        next(error);
    }
};

// 6. Procesar actualización de Categoría (POST /edit-category/:id)
const processUpdateCategory = async (req, res, next) => {
    const { category_id, category_name } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.render('edit-category', {
            title: 'Edit Category',
            errors: errors.array(),
            category_id,
            category_name
        });
    }

    try {
        const updateResult = await updateCategory(category_id, category_name);
        if (updateResult) {
            req.flash('notice', 'The category was successfully updated.');
            res.redirect('/categories');
        } else {
            res.status(501).render('edit-category', {
                title: 'Edit Category',
                errors: [{ msg: 'Database error: Update failed.' }],
                category_id,
                category_name
            });
        }
    } catch (error) {
        next(error);
    }
};

// Exportamos todas las funciones usando tu misma sintaxis original
export { 
    showCategoriesPage, 
    showCategoryDetailPage,
    showNewCategoryPage,
    processNewCategory,
    showEditCategoryPage,
    processUpdateCategory
};