import pool from '../models/db.js';
import { getProjectById, updateProject, getAllCategoriesForProject, updateProjectCategories } from '../models/projects.js';
import { isVolunteer as checkIsVolunteer } from '../models/volunteers.js';

import { validationResult } from 'express-validator';

export const showNewProjectPage = async (req, res) => {
    res.render('new-project', { title: 'Create New Project', errors: null });
};

export const showProjectDetailPage = async (req, res) => {
    try {
        const projectId = req.params.id;
        const projectResult = await pool.query('SELECT * FROM public.projects WHERE project_id = $1', [projectId]);
        const project = projectResult.rows[0];
        if (!project) return res.status(404).render('errors/404', { title: 'Page Not Found' });

        const categoryResult = await pool.query(`
            SELECT c.category_id, c.category_name 
            FROM public.categories c
            JOIN public.project_categories pc ON c.category_id = pc.category_id
            WHERE pc.project_id = $1
        `, [projectId]);

        // Verificar si el usuario es voluntario
        let isVolunteer = false;
        if (req.session && req.session.user) {
            isVolunteer = await checkIsVolunteer(req.session.user.user_id, projectId);
        }

        res.render('project-detail', { 
            title: project.project_name, 
            project, 
            categories: categoryResult.rows,
            isVolunteer
        });
    } catch (error) {
        res.status(500).send("Server Error");
    }
};

export const showEditProjectPage = async (req, res, next) => {
    try {
        const project = await getProjectById(req.params.id);
        if (!project) {
            req.flash('notice', 'Project not found.');
            return res.redirect('/projects');
        }
        res.render('edit-project', { title: 'Edit Project', errors: null, project });
    } catch (error) {
        next(error);
    }
};

export const processEditProject = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const project = await getProjectById(req.body.project_id);
        return res.status(400).render('edit-project', { 
            title: 'Edit Project', 
            errors: errors.array(),
            project: { ...project, project_name: req.body.project_name, description: req.body.description }
        });
    }
    try {
        const { project_id, project_name, description } = req.body;
        await updateProject(project_id, project_name, description);
        req.flash('notice', 'Project updated successfully.');
        res.redirect(`/project/${project_id}`);
    } catch (error) {
        next(error);
    }
};

export const showAssignCategoriesPage = async (req, res, next) => {
    try {
        const project = await getProjectById(req.params.id);
        if (!project) {
            req.flash('notice', 'Project not found.');
            return res.redirect('/projects');
        }
        const categories = await getAllCategoriesForProject(req.params.id);
        res.render('assign-categories', { title: 'Assign Categories', project, categories });
    } catch (error) {
        next(error);
    }
};

export const processAssignCategories = async (req, res, next) => {
    try {
        const { project_id, category_ids } = req.body;
        await updateProjectCategories(project_id, category_ids);
        req.flash('notice', 'Categories updated successfully.');
        res.redirect(`/project/${project_id}`);
    } catch (error) {
        next(error);
    }
};



export const processNewProject = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).render('new-project', { 
            title: 'Create New Project', 
            errors: errors.array(),
            project_name: req.body.project_name,
            description: req.body.description
        });
    }
    try {
        const { project_name, description } = req.body;
        const result = await pool.query(
            'INSERT INTO public.projects (project_name, description) VALUES ($1, $2) RETURNING project_id',
            [project_name, description]
        );
        req.flash('notice', 'Project created successfully.');
        res.redirect(`/project/${result.rows[0].project_id}`);
    } catch (error) {
        next(error);
    }
};

export const showProjectsPage = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM public.projects');
        res.render('projects', { title: 'Service Projects', projects: result.rows });
    } catch (error) {
        res.status(500).send("Error loading projects");
    }
};