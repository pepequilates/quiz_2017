'use strict';

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.addColumn(
            'Tips',
            'accepted',
            {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            }
        );
    },

    down: function (queryInterface, Sequelize) {
        return queryInterface.removeColumn('Tips', 'accepted');
    }
};
