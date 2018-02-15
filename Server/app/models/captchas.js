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
            filed: 'context',
            type: DataTypes.STRING,
            allowNull: false
        }
    });
};