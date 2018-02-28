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
 * Interacts with the database, fetches captchas and validates captchas.
 *
 * @author Daniel Strebinger
 * @version 1.0
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

    /**
     * Sends a captcha to the client which requested one.
     *
     * @param res Contains the response object.
     * @param language Contains the language code.
     * */
    sendCaptcha(res, language) {

        let captchaInformation = {
            captchaID: null,
            captchaType: null,
            content: null,
            context: null,
        };

        CaptchaTypes.findAll().then(captchaTypes => {
            let randomCaptchaTypeIndex = Crypto.generateRandom(0, captchaTypes.length - 1);
            let randomCaptchaType =  captchaTypes[randomCaptchaTypeIndex].id;
            captchaInformation.captchaType = captchaTypes[randomCaptchaTypeIndex].description;
            Captchas.findAll({where: {fk_captchas_type: randomCaptchaType}}).then(function (randomCaptchas) {
                let randomCaptchaIndex =  Crypto.generateRandom(0, randomCaptchas.length - 1);
                captchaInformation.captchaID = Crypto.generateHashValue(randomCaptchas[randomCaptchaIndex].id);
                console.log(randomCaptchas[randomCaptchaIndex].context);
                console.log(randomCaptchas[randomCaptchaIndex].context["de"]);
                captchaInformation.context = randomCaptchas[randomCaptchaIndex].context[language];
                CaptchaContent.findAll({
                    where: {
                        fk_imageCaptchas_captchaID: randomCaptchas[randomCaptchaIndex].id,
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
                    CaptchaManager.randomizeCaptchaContent(captchaInformation.content);
                    res.send(JSON.stringify(captchaInformation));
                });
            });
        });
    }

    /**
     * Verifies a captcha.
     *
     * @param selection Represents the selected content of the user.
     * @param captchaID Contains the id of the captcha.
     * @param captchaType Contains the type of the captcha.
     * @param res Contains the response object.
     * */
    verifyCaptcha(selection, captchaID, captchaType, res)
    {
        CaptchaTypes.findAll({where :{captchaType_description: captchaType}}).then(function(results) {
            let captchaTypeID = null;
            for (var i = 0; i < results.length; i++)
            {
                if (results[i].description === captchaType)
                {
                    captchaTypeID = results[i].id;
                }
            }

            if (captchaTypeID === null)
            {
                return;
            }

            Captchas.findAll().then(function(captchas){
                let captchaIdentifier = 0;
                for (let i = 0; i < captchas.length; i++)
                {
                    if (Crypto.generateHashValue(captchas[i].id) === captchaID)
                    {
                        captchaIdentifier = captchas[i].id;
                        break;
                    }
                }

                if (captchaIdentifier === 0)
                {
                    return;
                }

                CaptchaContent.findAll({
                    where: {
                        fk_imageCaptchas_captchaID: captchaIdentifier,
                        fk_captchaTypes_id: captchaTypeID,
                        isCorrect: true
                    }
                }).then(function(results) {

                    let isCorrect = false;

                    for (let i = 0; i < results.length; i++)
                    {
                        if (captchaType === "Text")
                        {
                            if (selection === results[i].contentDescription)
                            {
                                isCorrect = true;
                                break;
                            }

                            continue;
                        }

                        let hashValue = Crypto.generateHashValue(results[i].isCorrect);
                        for (let i = 0; i < maxHashRounds; i++)
                        {
                            hashValue = Crypto.generateHashValue(hashValue);

                            if (hashValue === selection)
                            {
                                isCorrect = true;
                                break;
                            }
                        }

                        if (isCorrect)
                        {
                            break;
                        }
                    }

                    if (isCorrect)
                    {
                        console.log("correct");
                        res.send(JSON.stringify(true));
                        return;
                    }

                    console.log("not correct");
                    res.send(JSON.stringify(false));
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
            let captchaOne = Captchas.build();
            captchaOne.fk_captchas_type = captchaTypeImage.id;
            captchaOne.context = {
                de: "Wie viel vom Server",
                en: "How many from the server?"
            };
            captchaOne.save().then(function() {
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/images/170x100.png", false, captchaTypeImage.id, captchaOne.id);
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/images/170x100.png", false, captchaTypeImage.id, captchaOne.id);
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/images/170x100.png", false, captchaTypeImage.id, captchaOne.id);
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/images/170x100.png", true, captchaTypeImage.id, captchaOne.id);
            });
        });

        let captchaTypeAudio = CaptchaTypes.build();
        captchaTypeAudio.description = "Audio";
        captchaTypeAudio.save().then(function() {
            let captchaTwo = Captchas.build();
            captchaTwo.fk_captchas_type = captchaTypeAudio.id;
            captchaTwo.context = {
                de: "Wie viel vom Server audio",
                en: "How many from the server? audio"
            };
            captchaTwo.save().then(function() {
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/audio/rain.mp3", false, captchaTypeAudio.id, captchaTwo.id);
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/audio/rain.mp3", false, captchaTypeAudio.id, captchaTwo.id);
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/audio/rain.mp3", false, captchaTypeAudio.id, captchaTwo.id);
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/audio/rain.mp3", true, captchaTypeAudio.id, captchaTwo.id);
            });
        });

        let captchaTypeText = CaptchaTypes.build();
        captchaTypeText.description = "Text";
        captchaTypeText.save().then(function() {
            let captchaThree = Captchas.build();
            captchaThree.fk_captchas_type = captchaTypeText.id;
            captchaThree.context = {
                de: "Wie viel vom Server text",
                en: "How many from the server? text"
            };
            captchaThree.save().then(function() {
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/images/F.png", true, captchaTypeText.id, captchaThree.id, "F");
            });
        });

        let captchaTypeInteractive = CaptchaTypes.build();
        captchaTypeInteractive.description = "Interactive";
        captchaTypeInteractive.save().then(function() {
            let captchaFour = Captchas.build();
            captchaFour.fk_captchas_type = captchaTypeInteractive.id;
            captchaFour.context = {
                de: "Wie viel vom Server interactive",
                en: "How many from the server? interactive"
            };
            captchaFour.save().then(function() {
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/images/170x100.png", false, captchaTypeInteractive.id, captchaFour.id);
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/images/170x100.png", false, captchaTypeInteractive.id, captchaFour.id);
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/images/170x100.png", false, captchaTypeInteractive.id, captchaFour.id);
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/images/170x100.png", false, captchaTypeInteractive.id, captchaFour.id);
            });
        });
    }

    /**
     * Creates an captcha content entry.
     *
     * @param data Contains the data of the entry.
     * @param isCorrect Contains a boolean value indicating whether the entry is a correct one or not.
     * @param captchaTypeID Contains the id of the captcha type.
     * @param captchaID Contains the id of the captcha.
     * @param contentDescription Contains an optional description of the content.
     * */
    static createCaptchaContentEntry(data, isCorrect, captchaTypeID, captchaID, contentDescription)
    {
        let captchaContentEntry = CaptchaContent.build();
        captchaContentEntry.fk_captchaTypes_id = captchaTypeID;
        captchaContentEntry.fk_imageCaptchas_captchaID = captchaID;
        captchaContentEntry.content = data;
        captchaContentEntry.isCorrect = isCorrect;
        captchaContentEntry.contentDescription = contentDescription;
        captchaContentEntry.save();
    }

    /**
     * Randomizes the answer possibilities of a captcha.
     *
     * @param content Contains the content to randomize.
     * */
    static randomizeCaptchaContent(content)
    {
        for (let i = content.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [content[i], content[j]] = [content[j], content[i]];
        }
    }
}

module.exports = CaptchaManager;