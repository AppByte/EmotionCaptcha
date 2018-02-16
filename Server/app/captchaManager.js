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
const Crypto = require(path.join(__dirname, "./crypto"));
const minHashRounds = 1000;
const maxHashRounds = 10000;

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
    establishConnection()
    {
       this.dbInstance
            .authenticate()
            .then(() => {
                console.log('Connection has been established successfully.');
            })
            .catch(err => {
                console.error('Unable to connect to the database:', err);
            });
    };

    sendCaptcha(res) {

        let captchaInformation = {
            captchaType: null,
            content: null,
            context: null,
        };

        CaptchaTypes.count().then(captchaTypeCount => {
            let randomCaptchaType =  Crypto.generateRandom(1, captchaTypeCount);

            // finds the
            CaptchaTypes.findOne({where: {id: randomCaptchaType}}).then(function(captchaTypeInformation) {
                captchaInformation.captchaType = captchaTypeInformation.description;
                Captchas.count().then(function (captchaCount) {
                    let randomCaptchaID =  Crypto.generateRandom(1, captchaCount);
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
                                    data: results[i].content,
                                    value: results[i].isCorrect
                                };

                                let iterrations = Crypto.generateRandom(minHashRounds, maxHashRounds);
                                for (let i = 0; i < iterrations; i++)
                                {
                                    result.value = Crypto.generateHashValue(result.value);
                                }

                                content.push(result);
                            }

                            captchaInformation.content = content;
                            res.send(JSON.stringify(captchaInformation));
                        });
                    });
                });
            });
        });
    }

    verifyCaptcha(selection, captchaID, res)
    {
        CaptchaContent.findAll({
            where: {
                fk_imageCaptchas_captchaID: 1,
                fk_captchaTypes_id: 1,
                isCorrect: true
            }
        }).then(function(results) {

            let isCorrectImage = false;

            for (let i = 0; i < results.length; i++)
            {
                let hashValue = Crypto.generateHashValue(results[i].isCorrect);
                for (let i = 0; i < maxHashRounds; i++)
                {
                    hashValue = Crypto.generateHashValue(hashValue);

                    if (hashValue === selection)
                    {
                        isCorrectImage = true;
                        break;
                    }
                }

                if (isCorrectImage)
                {
                    break;
                }
            }

            if (isCorrectImage)
            {
                res.send(JSON.stringify(true));
                return;
            }

            res.send(JSON.stringify(false));
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
                    CaptchaManager.createCaptchaContentEntry("http://via.placeholder.com/170x100", false, captchaTypeImage.id, captchaOne.id);
                    CaptchaManager.createCaptchaContentEntry("http://via.placeholder.com/170x100", false, captchaTypeImage.id, captchaOne.id);
                    CaptchaManager.createCaptchaContentEntry("http://via.placeholder.com/170x100", false, captchaTypeImage.id, captchaOne.id);
                    CaptchaManager.createCaptchaContentEntry("http://via.placeholder.com/170x100", true, captchaTypeImage.id, captchaOne.id);
                });
            });
        });
    }

    /**
     * Creates an captcha content entry.
     * */
    static createCaptchaContentEntry(data, isCorrect, captchaType, captchaID)
    {
        let captchaContentEntry = CaptchaContent.build();
        captchaContentEntry.fk_captchaTypes_id = captchaType;
        captchaContentEntry.fk_imageCaptchas_captchaID = captchaID;
        captchaContentEntry.content = data;
        captchaContentEntry.isCorrect = isCorrect;
        captchaContentEntry.save();
    }
}

module.exports = CaptchaManager;