var models = require("../models");


// Autoload el quiz asociado a :quizId
exports.load = function (req, res, next, quizId) {

    var quiz = models.Quiz.findById(Number(quizId));

    if (quiz) {
        req.quiz = quiz;
        next();
    } else {
        throw new Error('No existe ningún quiz con id=' + quizId);
    }
};


// GET /quizzes
exports.index = function (req, res, next) {

    var quizzes = models.Quiz.findAll();

    res.render('quizzes/index.ejs', {quizzes: quizzes});
};


// GET /quizzes/:quizId
exports.show = function (req, res, next) {

    var answer = req.query.answer || '';

    res.render('quizzes/show', {quiz: req.quiz});
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

    res.render('quizzes/edit', {quiz: req.quiz});
};


// PUT /quizzes/:quizId
exports.update = function (req, res, next) {

    req.quiz.question = req.body.question;
    req.quiz.answer = req.body.answer;

    models.Quiz.update(req.quiz);

    res.redirect('/quizzes/' + req.quiz.id);
};


// DELETE /quizzes/:quizId
exports.destroy = function (req, res, next) {

    models.Quiz.destroy(req.quiz);

    res.redirect('/quizzes');
};


// GET /quizzes/:quizId/play
exports.play = function (req, res, next) {

    var answer = req.query.answer || '';

    res.render('quizzes/play', {
        quiz: req.quiz,
        answer: answer
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
