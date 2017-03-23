var models = require('../models');
var Sequelize = require('sequelize');


// GET /quizzes/:quizId/tips/new
exports.new = function (req, res, next) {

    var tip = {
        text: ""
    };

    res.render('tips/new', {
        tip: tip,
        quiz: req.quiz
    });
};


// POST /quizzes/:quizId/tips
exports.create = function (req, res, next) {

    var tip = models.Tip.build(
        {
            text: req.body.text,
            QuizId: req.quiz.id
        });

    tip.save()
    .then(function (tip) {
        req.flash('success', 'Pista creado con éxito.');

        res.redirect("back");
        // res.redirect('/quizzes/' + req.quiz.id);
    })
    .catch(Sequelize.ValidationError, function (error) {

        req.flash('error', 'Errores en el formulario:');
        for (var i in error.errors) {
            req.flash('error', "" + error.errors[i].value);
        }

        // Necesario usar ""+ en la sentencia anterior porque se pierde la referencia al error.
        res.redirect("back");
    })
    .catch(function (error) {
        req.flash('error', 'Error al crear una Pista: ' + error.message);
        next(error);
    });
};
