/**
 * Represents the model for a captcha type.
 *
 * @author Daniel Strebinger
 * @version 1.0
 * */
module.exports = function(sequelize, DataTypes){
    return sequelize.define('CaptchaTypes', {
        id: {
            field: 'captchaType_id',
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        description: {
            field: 'captchaType_description',
            type: DataTypes.STRING,
            allowNull: false
        }
    });
};