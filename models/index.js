var path = require('path');

// Cargar ORM
var Sequelize = require('sequelize');

// Para usar en local BBDD SQLite:
//    DATABASE_URL = sqlite:///
//    DATABASE_STORAGE = quiz.sqlite
// Para usar en Heroku BBDD Postgres:
//    DATABASE_URL = postgres://user:passwd@host:port/database

var url, storage;

if (!process.env.DATABASE_URL) {
    url = "sqlite:///";
    storage = "quiz.sqlite";
} else {
    url = process.env.DATABASE_URL;
    storage = process.env.DATABASE_STORAGE || "";
}

var sequelize = new Sequelize(url, {storage: storage});



// Importar la definicion de la tabla Quiz de quiz.js
var Quiz = sequelize.import(path.join(__dirname, 'quiz'));


// Importar la definicion de la tabla Tips de tips.js
var Tip = sequelize.import(path.join(__dirname,'tip'));

// Importar la definicion de la tabla Users de user.js
var User = sequelize.import(path.join(__dirname,'user'));

// Importar la definicion de la tabla Attachments de attachment.js
var Attachment = sequelize.import(path.join(__dirname,'attachment'));

// Importar la definicion de la tabla Favourites de favourite.js
//
// Nota: Esto deberia ser una tabla JOIN y no un modelo, pero he tenido que
// crear un modelo para poder hacer queries que no funcionan en Sequelize
// con SQLite.
// Por ejemplo: Buscar todos los quizzes e incluir su relacion con favoritos,
// pero añadiendo solo los favoritos del usuario logeado. Esto requiere un
// LEFT OUTER JOIN para que incluya todos los quizzes aunque no tengan favoritos,
// y un INNER JOIN para que el array este vacio o solo contenga al usuario logeado.
// Para SQLite se genera una query SQL que no vale.
// Para Postgres se genera una query SQL diferente que si funciona.
// Por este motivo he creado un modelo Favourite para poder tener mayor control
// de las queries SQL que quiero realizar.
//
var Favourite = sequelize.import(path.join(__dirname,'favourite'));


// Relaciones entre modelos
Tip.belongsTo(Quiz);
Quiz.hasMany(Tip);

// Relacion 1 a N entre User y Quiz:
User.hasMany(Quiz, {foreignKey: 'AuthorId'});
Quiz.belongsTo(User, {as: 'Author', foreignKey: 'AuthorId'});

// Relacion 1-a-1 ente Quiz y Attachment
Attachment.belongsTo(Quiz);
Quiz.hasOne(Attachment);

// Favoritos:
//
//   Un Usuario tiene muchos quizzes favoritos.
//   Un quiz tiene muchos usuarios que lo han marcado como favorito.
//   Un quiz tiene muchos fans (los usuarios que lo han marcado como favorito)
User.hasMany(Favourite);
Favourite.belongsTo(User);

Quiz.hasMany(Favourite);
Favourite.belongsTo(Quiz);

Quiz.belongsToMany(User, {
    as: 'Fans',
    through: 'Favourites'
});



exports.Quiz = Quiz; // exportar definición de tabla Quiz
exports.Tip = Tip;   // exportar definición de tabla Tips
exports.User = User; // exportar definición de tabla Users
exports.Attachment = Attachment; // exportar definición de tabla Attachments
exports.Favourite = Favourite; // exportar definición de tabla Favourites
