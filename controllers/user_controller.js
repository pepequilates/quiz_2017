var models = require('../models');
var Sequelize = require('sequelize');

var paginate = require('../helpers/paginate').paginate;

// Autoload el user asociado a :userId
exports.load = function (req, res, next, userId) {

    models.User.findById(userId)
    .then(function (user) {
        if (user) {
            req.user = user;
            next();
        } else {
            req.flash('error', 'No existe el usuario con id=' + userId + '.');
            throw new Error('No existe userId=' + userId);
        }
    })
    .catch(function (error) {
        next(error);
    });
};


// GET /users
exports.index = function (req, res, next) {

    models.User.count()
    .then(function (count) {

        // Paginacion:

        var items_per_page = 10;

        // La pagina a mostrar viene en la query
        var pageno = parseInt(req.query.pageno) || 1;

        // Crear un string con el HTML que pinta la botonera de paginacion.
        // Lo añado como una variable local de res para que lo pinte el layout de la aplicacion.
        res.locals.paginate_control = paginate(count, items_per_page, pageno, req.url);

        var findOptions = {
            offset: items_per_page * (pageno - 1),
            limit: items_per_page,
            order: ['username']
        };

        return models.User.findAll(findOptions);
    })
    .then(function (users) {
        res.render('users/index', {users: users});
    })
    .catch(function (error) {
        next(error);
    });
};

// GET /users/:userId
exports.show = function (req, res, next) {

    res.render('users/show', {user: req.user});
};


// GET /users/new
exports.new = function (req, res, next) {

    var user = {
        username: "",
        password: ""
    };

    res.render('users/new', {user: user});
};


// POST /users
exports.create = function (req, res, next) {

    var user = models.User.build({
        username: req.body.username,
        password: req.body.password
    });

    // El login debe ser unico:
    models.User.find({where: {username: req.body.username}})
    .then(function (existing_user) {

        if (existing_user) {
            var emsg = "El usuario \"" + req.body.username + "\" ya existe."
            req.flash('error', emsg);
            res.render('users/new', {user: user});
        } else {
            // Guardar en la BBDD
            return user.save({fields: ["username", "password", "salt"]})
            .then(function (user) { // Renderizar pagina de usuarios
                req.flash('success', 'Usuario creado con éxito.');

                if (req.session.user) {
                    res.redirect('/users/' + user.id);
                } else {
                    res.redirect('/session'); // Redireccion a pagina de login
                }
            })
            .catch(Sequelize.ValidationError, function (error) {
                req.flash('error', 'Errores en el formulario:');
                for (var i in error.errors) {
                    req.flash('error', error.errors[i].value);
                }

                res.render('users/new', {user: user});
            });
        }
    })
    .catch(function (error) {
        next(error);
    });
};


// GET /users/:userId/edit
exports.edit = function (req, res, next) {

    res.render('users/edit', {user: req.user});
};


// PUT /users/:userId
exports.update = function (req, res, next) {

    // req.user.username  = req.body.user.username; // No se permite su edicion
    req.user.password = req.body.password;

    // El password no puede estar vacio
    if (!req.body.password) {
        req.flash('error', "El campo Password debe rellenarse.");
        return res.render('users/edit', {user: req.user});
    }

    req.user.save({fields: ["password", "salt"]})
    .then(function (user) {
        req.flash('success', 'Usuario actualizado con éxito.');
        res.redirect('/users/' + user.id);
    })
    .catch(Sequelize.ValidationError, function (error) {

        req.flash('error', 'Errores en el formulario:');
        for (var i in error.errors) {
            req.flash('error', error.errors[i].value);
        }

        res.render('users/edit', {user: req.user});
    })
    .catch(function (error) {
        next(error);
    });
};


// DELETE /users/:userId
exports.destroy = function (req, res, next) {

    req.user.destroy()
    .then(function () {

        // Borrando usuario logeado.
        if (req.session.user && req.session.user.id === req.user.id) {
            // borra la sesión y redirige a /
            delete req.session.user;
        }

        req.flash('success', 'Usuario eliminado con éxito.');
        res.redirect('/goback');
    })
    .catch(function (error) {
        next(error);
    });
};
