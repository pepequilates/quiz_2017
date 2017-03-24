
var models = require('../models');
var Sequelize = require('sequelize');
var url = require('url');


// Si se supera el tiempo de inactividad indicado por esta variable,
// sin que el usuario solicite nuevas paginas, entonces se cerrara
// la sesion del usuario.
// El valor esta en milisegundos.
// 5 minutos
var maxIdleTime = 5*60*1000;


//
// Middleware usado para destruir la sesion del usuario si se ha
// excedido el tiempo de inactividad.
//
exports.deleteExpiredUserSession = function(req, res, next) {

    if (req.session.user ) { // Hay login
        if ( req.session.user.expires < Date.now() ) { // Caduco
            delete req.session.user; // Logout
            req.flash('info', 'La sesión ha caducado.');
        } else { // No caduco. Restaurar la hora de expiracion.
            req.session.user.expires = Date.now() + maxIdleTime;
        }
    }
    // Continuar
    next();
};


// Middleware: Se requiere hacer login.
//
// Si el usuario ya hizo login anteriormente entonces existira
// el objeto user en req.session, por lo que continuo con los demas
// middlewares o rutas.
// Si no existe req.session.user, entonces es que aun no he hecho
// login, por lo que me redireccionan a una pantalla de login.
// Guardo en redir cual es mi url para volver automaticamente a
// esa url despues de hacer login; pero si redir ya existe entonces
// conservo su valor.
//
exports.loginRequired = function (req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/session?redir=' + (req.param('redir') || req.url));
    }
};


// MW que permite pasar solamente si el usuario logeado es admin.
exports.adminRequired = function(req, res, next){

    var isAdmin      = req.session.user.isAdmin;

    if (isAdmin) {
        next();
    } else {
        console.log('Ruta prohibida: el usuario logeado no es administrador.');
        res.send(403);    }
};

// MW que permite pasar solo si el usuario logeado es:
//   - admin
//   - o es el usuario a gestionar.
exports.adminOrMyselfRequired = function(req, res, next){

    var isAdmin  = req.session.user.isAdmin;
    var isMyself = req.user.id === req.session.user.id;

    if (isAdmin || isMyself) {
        next();
    } else {
        console.log('Ruta prohibida: no es el usuario logeado, ni un administrador.');
        res.send(403);    }
};

// MW que permite pasar solo si el usuario logeado es:
//   - admin
//   - y no es el usuario a gestionar.
exports.adminAndNotMyselfRequired = function(req, res, next){

    var isAdmin   = req.session.user.isAdmin;
    var isAnother = req.user.id !== req.session.user.id;

    if (isAdmin && isAnother) {
        next();
    } else {
        console.log('Ruta prohibida: es el usuario logeado o no es administrador.');
        res.send(403);    }
};


/*
 * Autenticar un usuario: Comprueba si el usuario esta registrado en users
 *
 * Devuelve una Promesa que busca el usuario con el login dado y comprueba su password.
 * Si la autenticacion es correcta, la promesa se satisface devuelve un objeto con el User.
 * Si la autenticacion falla, la promesa se satisface pero devuelve null.
 */
var authenticate = function(login, password) {

    return models.User.findOne({where: {username: login}})
    .then(function(user) {
        if (user && user.verifyPassword(password)) {
            return user;
        } else {
            return null;
        }
    });
};



// GET /session   -- Formulario de login
exports.new = function(req, res, next) {

    // Donde ire despues de hacer login:
    var redir = req.query.redir || url.parse(req.headers.referer || "/").path;

    // No volver aqui mismo (el formulario de login).
    if (redir === '/session') {
        redir = "/";
    }

    res.render('session/new', { redir: redir });
};


// POST /session   -- Crear la sesion si usuario se autentica
exports.create = function(req, res, next) {

    var redir = req.body.redir || '/'

    var login     = req.body.login;
    var password  = req.body.password;

    authenticate(login, password)
    .then(function(user) {
        if (user) {
            // Crear req.session.user y guardar campos id y username
            // La sesión se define por la existencia de: req.session.user.
            // Tambien guardo la hora de expiracion de la sesion por no actividad.
            req.session.user = {
                id:user.id,
                username:user.username,
                isAdmin:user.isAdmin,
                expires: Date.now() + maxIdleTime
            };

            res.redirect(redir); // redirección a redir
        } else {
            req.flash('error', 'La autenticación ha fallado. Reinténtelo otra vez.');

            res.render('session/new', { redir: redir });

        }
    })
    .catch(function(error) {
        req.flash('error', 'Se ha producido un error: ' + error);
        next(error);
    });
};


// DELETE /session   -- Destruir sesion
exports.destroy = function(req, res, next) {

    delete req.session.user;

    res.redirect("/session"); // redirect a login
};
