var express = require('express');
var router = express.Router();

var quizController = require('../controllers/quiz_controller');
var tipController = require('../controllers/tip_controller');
var userController = require('../controllers/user_controller');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

// Pagina de creditos
router.get('/author', function(req, res, next) {
    res.render('author');
});


// Autoload de rutas que usen :quizId
router.param('quizId', quizController.load);
router.param('userId', userController.load);


// Definición de rutas de cuenta
router.get('/users',                    userController.index);   // listado usuarios
router.get('/users/:userId(\\d+)',      userController.show);    // ver un usuario
router.get('/users/new',                userController.new);     // formulario sign un
router.post('/users',                   userController.create);  // registrar usuario
router.get('/users/:userId(\\d+)/edit', userController.edit);     // editar información de cuenta
router.put('/users/:userId(\\d+)',      userController.update);   // actualizar información de cuenta
router.delete('/users/:userId(\\d+)',   userController.destroy);  // borrar cuenta



// Definición de rutas de /quizzes
router.get('/quizzes',                     quizController.index);
router.get('/quizzes/:quizId(\\d+)',       quizController.show);
router.get('/quizzes/new',                 quizController.new);
router.post('/quizzes',                    quizController.create);
router.get('/quizzes/:quizId(\\d+)/edit',  quizController.edit);
router.put('/quizzes/:quizId(\\d+)',       quizController.update);
router.delete('/quizzes/:quizId(\\d+)',    quizController.destroy);

router.get('/quizzes/:quizId(\\d+)/play',  quizController.play);
router.get('/quizzes/:quizId(\\d+)/check', quizController.check);


router.get('/quizzes/:quizId(\\d+)/tips/new',  tipController.new);
router.post('/quizzes/:quizId(\\d+)/tips',     tipController.create);

module.exports = router;
