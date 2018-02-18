/**
 * Represents the model for a captcha.
 *
 * @author Daniel Strebinger
 * @version 1.0
 * */
module.exports = function(sequelize, DataTypes){
    return sequelize.define('Captchas', {
        id: {
            field: 'captchas_id',
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        context: {
            filed: 'captchas_context',
            type: DataTypes.JSON,
            allowNull: false
        }
    });
};