var path = require('path');

// Cargar ORM
var Sequelize = require('sequelize');

// Usando BBDD SQLite:
var sequelize = new Sequelize("sqlite:///", {storage: "quiz.sqlite"});

// Importar la definicion de la tabla Quiz de quiz.js
var Quiz = sequelize.import(path.join(__dirname, 'quiz'));


// Crear tablas
sequelize.sync()
.then(function () {
    console.log('Bases de datos creadas con éxito');
})
.catch(function (error) {
    console.log("Error creando las tablas de la BBDD:", error);
    process.exit(1);
});


exports.Quiz = Quiz; // exportar definición de tabla Quiz
