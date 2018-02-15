module.exports = module.exports = function(sequelize, DataTypes){
    return sequelize.define('ImageCaptchas', {
        id: {
            field: 'imageCaptchas_id',
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        content: {
            field: 'imageCaptchas_imagePath',
            type: DataTypes.STRING,
            allowNull: false
        },
        isCorrect: {
            field: 'imageCaptchas_isCorrectImage',
            type: DataTypes.BOOLEAN,
            allowNull: false
        }
    });
};