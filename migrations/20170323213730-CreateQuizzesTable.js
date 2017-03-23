'use strict';

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.createTable(
            'Quizzes',
            {
                id: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    primaryKey: true,
                    autoIncrement: true,
                    unique: true
                },
                question: {
                    type: Sequelize.STRING,
                    validate: {notEmpty: {msg: "Falta la Pregunta."}}
                },
                answer: {
                    type: Sequelize.STRING,
                    validate: {notEmpty: {msg: "Falta la Respuesta."}}
                },
                createdAt: {
                    type: Sequelize.DATE,
                    allowNull: false
                },
                updatedAt: {
                    type: Sequelize.DATE,
                    allowNull: false
                }
            },
            {
                sync: {force: true}
            }
        );
    },
    down: function (queryInterface, Sequelize) {
        return queryInterface.dropTable('Quizzes');
    }
};
