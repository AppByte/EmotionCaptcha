module.exports = module.exports = function(sequelize, DataTypes){
    return sequelize.define('CaptchaContent', {
        id: {
            field: 'CaptchaContent_id',
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        content: {
            field: 'CaptchaContent_imagePath',
            type: DataTypes.STRING,
            allowNull: false
        },
        isCorrect: {
            field: 'CaptchaContent_isCorrectImage',
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        contentDescription: {
            field: 'CaptchaContent_contentDescription',
            type: DataTypes.STRING,
            allowNull: true
        }
    });
};