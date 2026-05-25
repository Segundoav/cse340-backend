// Controlador de prueba para simular un error interno 500
const testErrorPage = (req, res, next) => {
    const err = new Error('This is a test error');
    err.status = 500;
    // next(err) empuja el error directamente al manejador global
    next(err);
};

export { testErrorPage };