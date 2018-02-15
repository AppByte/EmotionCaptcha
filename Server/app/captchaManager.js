const path = require('path');
const Sequelize = require('sequelize');
const DataTypes = require('sequelize/lib/data-types');
const dbConnection = new Sequelize('captcha', 'Daniel', 'stuhleck', {
    dialect: 'sqlite',
    logging: console.log,
    storage: './database.sqlite'
});

const Captchas = dbConnection.import(path.join(__dirname, "./models/captchas"));
const CaptchaTypes = dbConnection.import(path.join(__dirname, "./models/captchaTypes"));
const CaptchaContent = dbConnection.import(path.join(__dirname, "./models/captchaContent"));

/**
 * Interacts with the database
 * */
class CaptchaManager {

    /**
     * Initializes a new instance of the CaptchaManager class.
     * */
    constructor()
    {
        this.dbInstance = dbConnection;
    }

    /**
     * Establishes a connection to the database.
     * */
    establischConnection()
    {
       this.dbInstance
            .authenticate()
            .then(() => {
                console.log('Connection has been established successfully.');
            })
            .catch(err => {
                console.error('Unable to connect to the database:', err);
            });
    }

    sendCaptcha(res) {

        var captchaInformation = {
            captchaType: null,
            content: null,
            context: null,
        };

        CaptchaTypes.count().then(captchaTypeCount => {
            let randomCaptchaType =  Math.floor(Math.random() * (captchaTypeCount - 1 + 1) + 1);

            // finds the
            CaptchaTypes.findOne({where: {id: randomCaptchaType}}).then(function(captchaTypeInformation) {
                captchaInformation.captchaType = captchaTypeInformation.description;
                Captchas.count().then(function (captchaCount) {
                    let randomCaptchaID =  Math.floor(Math.random() * (captchaTypeCount - 1 + 1) + 1);
                    Captchas.findOne({ where: {fk_captchas_type: randomCaptchaID}}).then(function (randomCaptcha) {
                        captchaInformation.context = randomCaptcha.context;

                        CaptchaContent.findAll({
                            where: {
                                fk_imageCaptchas_captchaID: randomCaptchaID,
                                fk_captchaTypes_id: randomCaptchaType
                            }
                        }).then(function (results) {
                            let content = [];
                            for (let i = 0; i < results.length; i++) {
                                let result = {
                                    data: results[i].imagePath,
                                    value: results[i].isCorrect
                                };
                                content.push(result);
                            }

                            captchaInformation.content = content;
                            res.send(JSON.stringify(captchaInformation));
                            console.log(captchaInformation);
                        });
                    });
                });
            });
        });
    }

    /**
     * Seeds the database.
     * */
    seedData()
    {
        Captchas.belongsTo(CaptchaTypes, {foreignKey: 'fk_captchas_type', type: DataTypes.INTEGER, allowNull: false});
        CaptchaContent.belongsTo(Captchas, {foreignKey: 'fk_imageCaptchas_captchaID', type: DataTypes.INTEGER, allowNull: false});
        CaptchaContent.belongsTo(CaptchaTypes, {foreignKey: 'fk_captchaTypes_id', type: DataTypes.INTEGER, allowNull: false});
        CaptchaTypes.sync();
        CaptchaContent.sync();
        Captchas.sync();


        let captchaTypeImage = CaptchaTypes.build();
        captchaTypeImage.description = "Image";
        captchaTypeImage.save().then(function() {
            captchaTypeImage.save().then(function() {
                let captchaOne = Captchas.build();
                captchaOne.fk_captchas_type = captchaTypeImage.id;
                captchaOne.context = "How many from the server?";
                captchaOne.save().then(function() {
                    let imageCaptchaEntry = CaptchaContent.build();
                    imageCaptchaEntry.fk_imageCaptchas_captchaID = captchaOne.id;
                    imageCaptchaEntry.fk_captchaTypes_id = captchaTypeImage.id;
                    imageCaptchaEntry.imagePath = "http://via.placeholder.com/170x100";
                    imageCaptchaEntry.isCorrect = false;
                    imageCaptchaEntry.save();

                    imageCaptchaEntry = CaptchaContent.build();
                    imageCaptchaEntry.fk_captchaTypes_id = captchaTypeImage.id;
                    imageCaptchaEntry.fk_imageCaptchas_captchaID = captchaOne.id;
                    imageCaptchaEntry.imagePath = "http://via.placeholder.com/170x100";
                    imageCaptchaEntry.isCorrect = false;
                    imageCaptchaEntry.save();

                    imageCaptchaEntry = CaptchaContent.build();
                    imageCaptchaEntry.fk_captchaTypes_id = captchaTypeImage.id;
                    imageCaptchaEntry.fk_imageCaptchas_captchaID = captchaOne.id;
                    imageCaptchaEntry.imagePath = "http://via.placeholder.com/170x100";
                    imageCaptchaEntry.isCorrect = false;
                    imageCaptchaEntry.save();

                    imageCaptchaEntry = CaptchaContent.build();
                    imageCaptchaEntry.fk_captchaTypes_id = captchaTypeImage.id;
                    imageCaptchaEntry.fk_imageCaptchas_captchaID = captchaOne.id;
                    imageCaptchaEntry.imagePath = "http://via.placeholder.com/170x100";
                    imageCaptchaEntry.isCorrect = true;
                    imageCaptchaEntry.save();
                });
            });
        });
    }
}

module.exports = CaptchaManager;