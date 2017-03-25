var cloudinary = require('cloudinary');

var paginate = require('../helpers/paginate').paginate;

var models = require('../models');

// GET /users/:userId/favourites
//
// Nota: en la rutas hay un middleware para impedir el acceso a esta
//       funcion si userId no es el usuario logeado.
exports.index = function(req, res, next) {

    var countOptions =  {
        include: [
            {
                model: models.Favourite,
                where: {UserId: req.user.id},
                required: true  // OUTER JOIN
            }
        ]
    };

    var title = "Mis Preguntas Favoritas";

    models.Quiz.count(countOptions)
    .then(function (count) {

        // Paginacion:

        var items_per_page = 8;

        // La pagina a mostrar viene en la query
        var pageno = parseInt(req.query.pageno) || 1;

        // Crear un string con el HTML que pinta la botonera de paginacion.
        // Lo añado como una variable local de res para que lo pinte el layout de la aplicacion.
        res.locals.paginate_control = paginate(count, items_per_page, pageno, req.url);

        var findOptions = countOptions;

        findOptions.offset = items_per_page * (pageno - 1);
        findOptions.limit = items_per_page;

        findOptions.include.push(models.Attachment);
        findOptions.include.push({model: models.User, as: 'Author'});

        return models.Quiz.findAll(findOptions);
    })
    .then(function (quizzes) {

        res.render('quizzes/index.ejs', {
            quizzes: quizzes,
            cloudinary: cloudinary,
            title: title
        });
    })
    .catch(function (error) {
        next(error);
    });
};


// PUT /users/:userId/favourites/:quizId
exports.add = function (req, res, next) {

    if (!req.xhr) {
        res.sendStatus(415);
    } else {
        req.quiz.addFan(req.user)

        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (error) {
            console.log(error);
            res.sendStatus(500);
        });
    }
};


// DELETE /users/:userId/favourites/:quizId
exports.del = function (req, res, next) {

    if (!req.xhr) {
        res.sendStatus(415);
    } else {
        req.quiz.removeFan(req.user)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (error) {
            console.log(error);
            res.sendStatus(500);
        });
    }
};
