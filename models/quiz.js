

// Modelo
var quizzes = [
    {
        id: 1,
        question: "Capital de Italia",
        answer: "Roma"
    },
    {
        id: 2,
        question: "Capital de Francia",
        answer: "París"
    },
    {
        id: 3,
        question: "Capital de España",
        answer: "Madrid"
    },
    {
        id: 4,
        question: "Capital de Portugal",
        answer: "Lisboa"
    }];


// Siguiente valor para id
var nextId = quizzes.length + 1;

// Crea un nuevo quiz con los valores pasados como parametro.
exports.create = function(quiz) {

    var quiz = {
        id: nextId++,
        question: (quiz.question || "").trim(),
        answer: (quiz.answer || "").trim()
    };

    quizzes.push(quiz);

    return quiz;
};

// Actualiza el quiz pasado como parametro.
exports.update = function(quiz) {

    var index = quizzes.findIndex(function (q) {
        return quiz.id === q.id;
    });

    if (index >= 0) {
        quizzes[index] = {
            id: quiz.id,
            question: (quiz.question || "").trim(),
            answer: (quiz.answer || "").trim()
        };
    }
};

// Devuelve todos los quizzes
exports.findAll = function() {
  return quizzes;
};

// Busca un quiz por su id
exports.findById = function(id) {

    return quizzes.find(function(quiz) {
        return quiz.id === id;
    });
};

// Elimina un quiz
exports.destroy = function(quiz) {

    var index = quizzes.findIndex(function(q) {
        return quiz.id === q.id;
    });

    if (index >= 0) {
        quizzes.splice(index,1);
    }
};
