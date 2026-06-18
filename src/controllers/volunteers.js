import { addVolunteer, removeVolunteer, isVolunteer, getVolunteerProjects } from '../models/volunteers.js';

// 1. Agregar voluntario a un proyecto
const processAddVolunteer = async (req, res, next) => {
    try {
        const user_id = req.session.user.user_id;
        const project_id = req.params.id;
        await addVolunteer(user_id, project_id);
        req.flash('notice', 'You have successfully volunteered for this project!');
        res.redirect(`/project/${project_id}`);
    } catch (error) {
        next(error);
    }
};

// 2. Eliminar voluntario de un proyecto
const processRemoveVolunteer = async (req, res, next) => {
    try {
        const user_id = req.session.user.user_id;
        const project_id = req.params.id;
        await removeVolunteer(user_id, project_id);
        req.flash('notice', 'You have successfully unvolunteered from this project.');
        res.redirect(`/project/${project_id}`);
    } catch (error) {
        next(error);
    }
};

export { processAddVolunteer, processRemoveVolunteer };