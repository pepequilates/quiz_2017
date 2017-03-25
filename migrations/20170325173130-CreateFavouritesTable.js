'use strict';

module.exports = {
    up: function (queryInterface, Sequelize) {

        return queryInterface.createTable(
            'Favourites',
            {
                id: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    primaryKey: true,
                    autoIncrement: true,
                    unique: true
                },
                QuizId: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    unique: "compositeKey"
                },
                UserId: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    unique: "compositeKey"
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
        return queryInterface.dropTable('Favourites');
    }
};
