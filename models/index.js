var path = require('path');

// Cargar ORM
var Sequelize = require('sequelize');
var sequelize = new Sequelize("sqlite:///",{storage: "quiz.sqlite"});
var Quiz = sequelize.import(path.join(__dirname, 'quiz'));
// Para usar en local BBDD SQLite:
//    DATABASE_URL = sqlite:///
//    DATABASE_STORAGE = quiz.sqlite
// Para usar en Heroku BBDD Postgres:
//    DATABASE_URL = postgres://user:passwd@host:port/database



sequelize.sync()
.then(function(){
	console.log('Bases de datos creadas con exito');
})
.catch(function(error){
console.log("Error creando las tablas de la BBDD:",error);
process.exit(1);
});
/*if (!process.env.DATABASE_URL) {
    url = "sqlite:///";
    storage = "quiz.sqlite";
} else {
    url = process.env.DATABASE_URL;
    storage = process.env.DATABASE_STORAGE || "";
}

var sequelize = new Sequelize(url, {storage: storage});



// Importar la definicion de la tabla Quiz de quiz.js
*/

exports.Quiz = Quiz; // exportar definición de tabla Quiz
