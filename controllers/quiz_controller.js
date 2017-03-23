var models = require("../models");


// GET /quizzes
exports.index = function (req, res, next) {

    var quizzes = models.Quiz.findAll();

    res.render('quizzes/index.ejs', {quizzes: quizzes});
};


// GET /quizzes/:quizId
exports.show = function (req, res, next) {

    var quizId = Number(req.params.quizId);

    var quiz = models.Quiz.findById(quizId);

    if (quiz) {
        res.render('quizzes/show', {quiz: quiz});
    } else {
        next(new Error('No existe ningún quiz con id=' + quizId));
    }
};


// GET /quizzes/new
exports.new = function (req, res, next) {

    var quiz = {question: "", answer: ""};

    res.render('quizzes/new', {quiz: quiz});
};

// POST /quizzes/create
exports.create = function (req, res, next) {

    var quiz = {
        question: req.body.question,
        answer: req.body.answer
    };

    // Validar que no estan vacios
    if (!quiz.question || !quiz.answer) {
        res.render('quizzes/new', {quiz: quiz});
        return;
    }

    // guarda el nuevo quiz
    quiz = models.Quiz.create(quiz);

    res.redirect('/quizzes/' + quiz.id);
};


// GET /quizzes/:quizId/edit
exports.edit = function (req, res, next) {

    var quizId = Number(req.params.quizId);

    var quiz = models.Quiz.findById(quizId);

    if (quiz) {
        res.render('quizzes/edit', {quiz: quiz});
    } else {
        next(new Error('No existe ningún quiz con id=' + quizId));
    }
};


// PUT /quizzes/:quizId
exports.update = function (req, res, next) {

    var quizId = Number(req.params.quizId);

    var quiz = models.Quiz.findById(quizId);

    if (quiz) {
        quiz.question = req.body.question;
        quiz.answer = req.body.answer;

        models.Quiz.update(quiz);

        res.redirect('/quizzes/' + quizId);
    } else {
        next(new Error('No existe ningún quiz con id=' + quizId));
    }
};


// DELETE /quizzes/:quizId
exports.destroy = function (req, res, next) {

    var quizId = Number(req.params.quizId);

    var quiz = models.Quiz.findById(quizId);

    if (quiz) {
        models.Quiz.destroy(quiz);

        res.redirect('/quizzes');
    } else {
        next(new Error('No existe ningún quiz con id=' + quizId));
    }
};


// GET /quizzes/:quizId/play
exports.play = function (req, res, next) {

    var answer = req.query.answer || '';

    var quizId = Number(req.params.quizId);

    var quiz = models.Quiz.findById(quizId);

    if (quiz) {
        res.render('quizzes/play', {
            quiz: quiz,
            answer: answer
        });
    } else {
        next(new Error('No existe ningún quiz con id=' + quizId));
    }
};


// GET /quizzes/:quizId/check
exports.check = function (req, res, next) {

    var answer = req.query.answer || "";

    var quizId = Number(req.params.quizId);

    var quiz = models.Quiz.findById(quizId);

    var result = answer.toLowerCase().trim() === quiz.answer.toLowerCase().trim();

    if (quiz) {
        res.render('quizzes/result', {
            quiz: quiz,
            result: result,
            answer: answer
        });
    } else {
        next(new Error('No existe ningún quiz con id=' + quizId));
    }
};
