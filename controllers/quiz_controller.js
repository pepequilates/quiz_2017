var models = require("../models");
var Sequelize = require('sequelize');
var cloudinary = require('cloudinary');
var fs = require('fs');
var attHelper = require("../helpers/attachments");

var paginate = require('../helpers/paginate').paginate;

// Opciones para los ficheros subidos a Cloudinary
var cloudinary_upload_options = {
    async: true,
    folder: "/core/quiz2017/attachments",
    resource_type: "auto",
    tags: ['core', 'quiz']
};

// Autoload el quiz asociado a :quizId
exports.load = function (req, res, next, quizId) {

    var options = {
        include: [
            models.Tip,
            models.Attachment,
            {model: models.User, as: 'Author'}
        ]
    };

    // Para usuarios logeados: incluir los favoritos de la pregunta filtrando por
    // el usuario logeado con un OUTER JOIN.
    if (req.session.user) {
        options.include.push({
            model: models.Favourite,
            where: {UserId: req.session.user.id},
            required: false  // OUTER JOIN
        });
    }

    models.Quiz.findById(quizId, options)
    .then(function (quiz) {
        if (quiz) {
            req.quiz = quiz;
            next();
        } else {
            throw new Error('No existe ningún quiz con id=' + quizId);
        }
    })
    .catch(function (error) {
        next(error);
    });
};


// MW que permite acciones solamente si al usuario logeado es admin o es el autor del quiz.
exports.adminOrAuthorRequired = function(req, res, next){

    var isAdmin  = req.session.user.isAdmin;
    var isAuthor = req.quiz.AuthorId === req.session.user.id;

    if (isAdmin || isAuthor) {
        next();
    } else {
        console.log('Operación prohibida: El usuario logeado no es el autor del quiz, ni un administrador.');
        res.send(403);
    }
};


// GET /quizzes
// GET /users/:userId/quizzes
exports.index = function (req, res, next) {

    var countOptions = {
        where: {}
    };

    var title = "Preguntas";

    // Busquedas:
    var search = req.query.search || '';
    if (search) {
        var search_like = "%" + search.replace(/ +/g,"%") + "%";

        countOptions.where.question = { $like: search_like };
    }

    // Si existe req.user, mostrar solo sus preguntas.
    if (req.user) {
        countOptions.where = {AuthorId: req.user.id};

        if (req.session.user && req.session.user.id == req.user.id) {
            title = "Mis Preguntas";
        } else {
            title = "Preguntas de " + req.user.username;
        }
    }

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

        findOptions.include = [
            models.Attachment,
            {model: models.User, as: 'Author'}
        ];

        // Para usuarios logeados: incluir los fans de las preguntas filtrando por
        // el usuario logeado con un OUTER JOIN.
        if (req.session.user) {
            findOptions.include.push({
                model: models.Favourite,
                where: {UserId: req.session.user.id},
                required: false  // OUTER JOIN
            });
        }

        return models.Quiz.findAll(findOptions);
    })
    .then(function (quizzes) {

        var format = (req.params.format || 'html').toLowerCase();

        switch (format) {
            case 'html':
                res.render('quizzes/index.ejs', {
                    quizzes: quizzes,
                    search: search,
                    cloudinary: cloudinary,
                    title: title
                });
                break;

            case 'json':
                res.json(quizzes);
                break;

            default:
                console.log('No se soporta el formato \".'+format+'\".');
                res.sendStatus(406);
        }
    })
    .catch(function (error) {
        next(error);
    });
};


// GET /quizzes/:quizId
exports.show = function (req, res, next) {

    var format = (req.params.format || 'html').toLowerCase();

    switch (format) {
        case 'html':
            res.render('quizzes/show', {
                quiz: req.quiz,
                cloudinary: cloudinary
            });
            break;

        case 'json':
            res.json(req.quiz);
            break;

        default:
            console.log('No se soporta el formato \".'+format+'\".');
            res.sendStatus(406);
    }
};


// GET /quizzes/new
exports.new = function (req, res, next) {

    var quiz = {question: "", answer: ""};

    res.render('quizzes/new', {quiz: quiz});
};


// POST /quizzes/create
exports.create = function (req, res, next) {

    var authorId = req.session.user && req.session.user.id || 0;

    var quiz = models.Quiz.build({
        question: req.body.question,
        answer: req.body.answer,
        AuthorId: authorId
    });

    // guarda en DB los campos pregunta y respuesta de quiz
    quiz.save({fields: ["question", "answer", "AuthorId"]})
    .then(function (quiz) {
        req.flash('success', 'Quiz creado con éxito.');

        if (!req.file) {
            req.flash('info', 'Es un Quiz sin adjunto.');
            res.redirect('/quizzes/' + quiz.id);
            return;
        }

        // Salvar el adjunto en Cloudinary
        return attHelper.uploadResourceToCloudinary(req.file.path, cloudinary_upload_options)
        .then(function(uploadResult) {

            // Crear nuevo attachment en la BBDD.
            return models.Attachment.create({
                public_id: uploadResult.public_id,
                url: uploadResult.url,
                filename: req.file.originalname,
                mime: req.file.mimetype,
                QuizId: quiz.id })
            .then(function(attachment) {
                req.flash('success', 'Imagen nueva guardada con éxito.');
            })
            .catch(function(error) { // Ignoro errores de validacion
                req.flash('error', 'No se ha podido salvar fichero: ' + error.message);
                cloudinary.api.delete_resources(uploadResult.public_id);
            });

        })
        .catch(function(error) {
            req.flash('error', 'No se ha podido salvar el adjunto: ' + error.message);
        })
        .then(function () {
            fs.unlink(req.file.path); // borrar el fichero subido a ./uploads
            res.redirect('/quizzes/' + quiz.id);
        });
    })
    .catch(Sequelize.ValidationError, function (error) {

        req.flash('error', 'Errores en el formulario:');
        for (var i in error.errors) {
            req.flash('error', error.errors[i].value);
        }

        res.render('quizzes/new', {quiz: quiz});
    })
    .catch(function (error) {
        req.flash('error', 'Error al crear un Quiz: ' + error.message);
        next(error);
    });
};


// GET /quizzes/:quizId/edit
exports.edit = function (req, res, next) {

    res.render('quizzes/edit', {quiz: req.quiz});
};


// PUT /quizzes/:quizId
exports.update = function (req, res, next) {

    req.quiz.question = req.body.question;
    req.quiz.answer = req.body.answer;

    req.quiz.save({fields: ["question", "answer"]})
    .then(function (quiz) {
        req.flash('success', 'Quiz editado con éxito.');

        if (!req.body.keepAttachment) {

            // Sin adjunto: Eliminar attachment y adjunto viejos.
            if (!req.file) {
                req.flash('info', 'Tenemos un Quiz sin adjunto.');
                if (quiz.Attachment) {
                    cloudinary.api.delete_resources(quiz.Attachment.public_id);
                    quiz.Attachment.destroy();
                }
                return;
            }

            // Salvar el adjunto nueva en Cloudinary
            return attHelper.uploadResourceToCloudinary(req.file.path, cloudinary_upload_options)
            .then(function (uploadResult) {

                // Recordar public_id de la imagen antigua.
                var old_public_id = quiz.Attachment ? quiz.Attachment.public_id : null;

                // Actualizar el attachment en la BBDD.
                return quiz.getAttachment()
                .then(function(attachment) {
                    if (!attachment) {
                        attachment = models.Attachment.build({ QuizId: quiz.id });
                    }
                    attachment.public_id = uploadResult.public_id;
                    attachment.url = uploadResult.url;
                    attachment.filename = req.file.originalname;
                    attachment.mime = req.file.mimetype;
                    return attachment.save();
                })
                .then(function(attachment) {
                    req.flash('success', 'Imagen nueva guardada con éxito.');
                    if (old_public_id) {
                        cloudinary.api.delete_resources(old_public_id);
                    }
                })
                .catch(function(error) { // Ignoro errores de validacion en imagenes
                    req.flash('error', 'No se ha podido salvar la nueva imagen: '+error.message);
                    cloudinary.api.delete_resources(uploadResult.public_id);
                });


            })
            .catch(function(error) {
                req.flash('error', 'No se ha podido salvar el adjunto: ' + result.error.message);
            })
            .then(function () {
                fs.unlink(req.file.path); // borrar el fichero subido a ./uploads
            });
        }
    })
    .then(function () {
        res.redirect('/quizzes/' + req.quiz.id);
    })
    .catch(Sequelize.ValidationError, function (error) {

        req.flash('error', 'Errores en el formulario:');
        for (var i in error.errors) {
            req.flash('error', error.errors[i].value);
        }

        res.render('quizzes/edit', {quiz: req.quiz});
    })
    .catch(function (error) {
        req.flash('error', 'Error al editar el Quiz: ' + error.message);
        next(error);
    });
};


// DELETE /quizzes/:quizId
exports.destroy = function (req, res, next) {


    // Borrar el adjunto de Cloudinary (Ignoro resultado)
    if (req.quiz.Attachment) {
        cloudinary.api.delete_resources(req.quiz.Attachment.public_id);
    }

    req.quiz.destroy()
    .then(function () {
        req.flash('success', 'Quiz borrado con éxito.');
        res.redirect('/goback');
    })
    .catch(function (error) {
        req.flash('error', 'Error al editar el Quiz: ' + error.message);
        next(error);
    });
};


// GET /quizzes/:quizId/play
exports.play = function (req, res, next) {

    var answer = req.query.answer || '';

    res.render('quizzes/play', {
        quiz: req.quiz,
        answer: answer,
        cloudinary: cloudinary
    });
};


// GET /quizzes/:quizId/check
exports.check = function (req, res, next) {

    var answer = req.query.answer || "";

    var result = answer.toLowerCase().trim() === req.quiz.answer.toLowerCase().trim();

    res.render('quizzes/result', {
        quiz: req.quiz,
        result: result,
        answer: answer
    });
};
