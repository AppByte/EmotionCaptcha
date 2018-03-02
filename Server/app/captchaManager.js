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
                de: "Bitte wähle das richtige Bild für das Sprichwort \"Jeder Topf findet einen Deckel\"",
                en: "Please select the correct image for the methaper \"Jeder Topf findet einen Deckel\""
            };
            captchaOne.save().then(function() {
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/images/39452720586432993504.jpg", false, captchaTypeImage.id, captchaOne.id);
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/images/93139757706271484581.jpg", true, captchaTypeImage.id, captchaOne.id);
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/images/47579202656580708052.jpg", false, captchaTypeImage.id, captchaOne.id);
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/images/21826566162590995454.jpg", false, captchaTypeImage.id, captchaOne.id);
            });

            let captchaTwo = Captchas.build();
            captchaTwo.fk_captchas_type = captchaTypeImage.id;
            captchaTwo.context = {
                de: "Bitte wähle das richtige Bild für das Sprichwort \"Sein blaues wunder erleben\"",
                en: "Please select the correct image for the methaper \"Sein blaues wunder erleben\""
            };
            captchaTwo.save().then(function() {
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/images/79417157102589900866.jpg", true, captchaTypeImage.id, captchaTwo.id);
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/images/77680309617638307748.jpg", false, captchaTypeImage.id, captchaTwo.id);
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/images/07875396568238921752.jpg", false, captchaTypeImage.id, captchaTwo.id);
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/images/28513888160470558078.jpg", false, captchaTypeImage.id, captchaTwo.id);
            });

            let captchaThree = Captchas.build();
            captchaThree.fk_captchas_type = captchaTypeImage.id;
            captchaThree.context = {
                de: "Bitte wähle das richtige Bild für das Sprichwort \"Schnee von gestern\"",
                en: "Please select the correct image for the methaper \"Schnee von gestern\""
            };
            captchaThree.save().then(function() {
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/images/53394563223907268613.jpg", true, captchaTypeImage.id, captchaThree.id);
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/images/72113237469675466196.jpg", false, captchaTypeImage.id, captchaThree.id);
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/images/10283540242066472466.jpg", false, captchaTypeImage.id, captchaThree.id);
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/images/97277981585528267194.jpg", false, captchaTypeImage.id, captchaThree.id);
            });

            let captchaFour = Captchas.build();
            captchaFour.fk_captchas_type = captchaTypeImage.id;
            captchaFour.context = {
                de: "Bitte wähle das richtige Bild für das Sprichwort \"Aus allen Wolken fallen\"",
                en: "Please select the correct image for the methaper \"Aus allen Wolken fallen\""
            };
            captchaFour.save().then(function() {
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/images/66643524236465029243.jpg", false, captchaTypeImage.id, captchaFour.id);
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/images/31518386957429524363.jpg", true, captchaTypeImage.id, captchaFour.id);
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/images/40517149129119939501.jpg", false, captchaTypeImage.id, captchaFour.id);
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/images/57476833332522558578.jpg", false, captchaTypeImage.id, captchaFour.id);
            });

            let captchaFive = Captchas.build();
            captchaFive.fk_captchas_type = captchaTypeImage.id;
            captchaFive.context = {
                de: "Bitte wähle das richtige Bild für das Wort \"Golf\" aus.",
                en: "Please select the correct image for the word \"Golf\""
            };
            captchaFive.save().then(function() {
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/images/57600094293782341558.jpg", true, captchaTypeImage.id, captchaFive.id);
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/images/40947769658848806978.jpg", false, captchaTypeImage.id, captchaFive.id);
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/images/65178145835250743247.jpg", false, captchaTypeImage.id, captchaFive.id);
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/images/81953174893417361145.jpg", false, captchaTypeImage.id, captchaFive.id);
            });

            let captchaSix = Captchas.build();
            captchaSix.fk_captchas_type = captchaTypeImage.id;
            captchaSix.context = {
                de: "Bitte wähle das richtige Bild für das Wort \"Kreuz\" aus.",
                en: "Please select the correct image for the word \"Kreuz\""
            };
            captchaSix.save().then(function() {
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/images/42433715845703467101.jpg", true, captchaTypeImage.id, captchaSix.id);
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/images/66439332170674103298.jpg", false, captchaTypeImage.id, captchaSix.id);
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/images/62097231565730817667.jpg", false, captchaTypeImage.id, captchaSix.id);
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/images/51478852072440860661.jpg", false, captchaTypeImage.id, captchaSix.id);
            });

            let captchaSeven = Captchas.build();
            captchaSeven.fk_captchas_type = captchaTypeImage.id;
            captchaSeven.context = {
                de: "Bitte wähle das richtige Bild für das Wort \"Gericht\" aus.",
                en: "Please select the correct image for the word \"Gericht\""
            };
            captchaSeven.save().then(function() {
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/images/39452720586432993504.jpg", false, captchaTypeImage.id, captchaSeven.id);
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/images/73300958861653361623.jpg", true, captchaTypeImage.id, captchaSeven.id);
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/images/65178145835250743247.jpg", false, captchaTypeImage.id, captchaFive.id);
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/images/57476833332522558578.jpg", false, captchaTypeImage.id, captchaFour.id);
            });

            let captchaEight = Captchas.build();
            captchaEight.fk_captchas_type = captchaTypeImage.id;
            captchaEight.context = {
                de: "Bitte wähle das richtige Bild für das Wort \"Mutter\" aus.",
                en: "Please select the correct image for the word \"Mutter\""
            };
            captchaEight.save().then(function() {
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/images/39452720586432993504.jpg", false, captchaTypeImage.id, captchaEight.id);
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/images/83494088649401378945.jpg", true, captchaTypeImage.id, captchaEight.id);
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/images/47579202656580708052.jpg", false, captchaTypeImage.id, captchaEight.id);
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/images/21826566162590995454.jpg", false, captchaTypeImage.id, captchaEight.id);
            });
        });

        let captchaTypeAudio = CaptchaTypes.build();
        captchaTypeAudio.description = "Audio";
        captchaTypeAudio.save().then(function() {
            let captchaOne = Captchas.build();
            captchaOne.fk_captchas_type = captchaTypeAudio.id;
            captchaOne.context = {
                de: "Welcher dieser Töne gehört der Kategorie Blues an?",
                en: "Which of these sounds is part of the category Blues?"
            };
            captchaOne.save().then(function() {
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/audio/82041512139919545726.mp3", true, captchaTypeAudio.id, captchaOne.id);
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/audio/65259737766959388428.mp3", false, captchaTypeAudio.id, captchaOne.id);
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/audio/00372156022373196967.mp3", false, captchaTypeAudio.id, captchaOne.id);
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/audio/26087630137366269179.mp3", false, captchaTypeAudio.id, captchaOne.id);
            });

            let captchaTwo = Captchas.build();
            captchaTwo.fk_captchas_type = captchaTypeAudio.id;
            captchaTwo.context = {
                de: "Welcher dieser Töne verbinden sie mit einem Besuch auf eienr amerikanischen Ranch?",
                en: "Which of these sounds will you associate when you visit an american ranch?"
            };
            captchaTwo.save().then(function() {
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/audio/82041512139919545726.mp3", false, captchaTypeAudio.id, captchaTwo.id);
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/audio/65259737766959388428.mp3", true, captchaTypeAudio.id, captchaTwo.id);
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/audio/00372156022373196967.mp3", false, captchaTypeAudio.id, captchaTwo.id);
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/audio/26087630137366269179.mp3", false, captchaTypeAudio.id, captchaTwo.id);
            });

            let captchaThree = Captchas.build();
            captchaThree.fk_captchas_type = captchaTypeAudio.id;
            captchaThree.context = {
                de: "Welcher dieser Töne verbinden sie mit einem Besuch in einer Diskothek?",
                en: "Which of these sounds will you associate when you visit a night club?"
            };
            captchaThree.save().then(function() {
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/audio/82041512139919545726.mp3", false, captchaTypeAudio.id, captchaThree.id);
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/audio/65259737766959388428.mp3", false, captchaTypeAudio.id, captchaThree.id);
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/audio/00372156022373196967.mp3", true, captchaTypeAudio.id, captchaThree.id);
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/audio/26087630137366269179.mp3", false, captchaTypeAudio.id, captchaThree.id);
            });

            let captchaFour = Captchas.build();
            captchaFour.fk_captchas_type = captchaTypeAudio.id;
            captchaFour.context = {
                de: "Welcher dieser Töne wird gehört einer afroamerikaischen Musikrichtung an?",
                en: "Which of these sounds is part of the a afroamerican music scene?"
            };
            captchaFour.save().then(function() {
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/audio/82041512139919545726.mp3", false, captchaTypeAudio.id, captchaFour.id);
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/audio/65259737766959388428.mp3", false, captchaTypeAudio.id, captchaFour.id);
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/audio/00372156022373196967.mp3", false, captchaTypeAudio.id, captchaFour.id);
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/audio/26087630137366269179.mp3", true, captchaTypeAudio.id, captchaFour.id);
            });

            let captchaFive = Captchas.build();
            captchaFive.fk_captchas_type = captchaTypeAudio.id;
            captchaFive.context = {
                de: "Welcher dieser Töne verbinden sie mit einem Urlaub?",
                en: "Which of these sounds will you associate with a holiday trip?"
            };
            captchaFive.save().then(function() {
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/audio/82520303551572289611.mp3", true, captchaTypeAudio.id, captchaFive.id);
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/audio/74295011667026589036.mp3", false, captchaTypeAudio.id, captchaFive.id);
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/audio/86029694956883369345.mp3", false, captchaTypeAudio.id, captchaFive.id);
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/audio/53496824273731590499.mp3", false, captchaTypeAudio.id, captchaFive.id);
            });

            let captchaSix = Captchas.build();
            captchaSix.fk_captchas_type = captchaTypeAudio.id;
            captchaSix.context = {
                de: "Welcher dieser Töne verbinden sie mit einem Urlaub?",
                en: "Which of these sounds will you associate with a holiday trip?"
            };
            captchaSix.save().then(function() {
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/audio/82520303551572289611.mp3", false, captchaTypeAudio.id, captchaSix.id);
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/audio/74295011667026589036.mp3", true, captchaTypeAudio.id, captchaSix.id);
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/audio/86029694956883369345.mp3", false, captchaTypeAudio.id, captchaSix.id);
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/audio/53496824273731590499.mp3", false, captchaTypeAudio.id, captchaSix.id);
            });

            let captchaSeven = Captchas.build();
            captchaSeven.fk_captchas_type = captchaTypeAudio.id;
            captchaSeven.context = {
                de: "Welcher dieser Töne gehört der Kategorie Rock an?",
                en: "Which of these sounds is part of the category Rock?"
            };
            captchaSeven.save().then(function() {
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/audio/82520303551572289611.mp3", false, captchaTypeAudio.id, captchaSeven.id);
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/audio/74295011667026589036.mp3", false, captchaTypeAudio.id, captchaSeven.id);
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/audio/86029694956883369345.mp3", true, captchaTypeAudio.id, captchaSeven.id);
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/audio/53496824273731590499.mp3", false, captchaTypeAudio.id, captchaSeven.id);
            });

            let captchaEight = Captchas.build();
            captchaEight.fk_captchas_type = captchaTypeAudio.id;
            captchaEight.context = {
                de: "Welcher dieser Töne gehört der Kategorie langsamer Blues an?",
                en: "Which of these sounds is part of the category slow Blues?"
            };
            captchaEight.save().then(function() {
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/audio/82520303551572289611.mp3", false, captchaTypeAudio.id, captchaEight.id);
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/audio/74295011667026589036.mp3", false, captchaTypeAudio.id, captchaEight.id);
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/audio/86029694956883369345.mp3", false, captchaTypeAudio.id, captchaEight.id);
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/audio/53496824273731590499.mp3", true, captchaTypeAudio.id, captchaEight.id);
            });
        });

        let captchaTypeText = CaptchaTypes.build();
        captchaTypeText.description = "Text";
        captchaTypeText.save().then(function() {
            let captchaOne = Captchas.build();
            captchaOne.fk_captchas_type = captchaTypeText.id;
            captchaOne.context = {
                de: "Welcher Buchstabe wird im nachfolgenden Bild dargestellt?",
                en: "Which letter is pictured within the following image?"
            };
            captchaOne.save().then(function() {
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/images/61013334536474751632.png", true, captchaTypeText.id, captchaOne.id, "A");
            });

            let captchaTwo = Captchas.build();
            captchaTwo.fk_captchas_type = captchaTypeText.id;
            captchaTwo.context = {
                de: "Welcher Buchstabe wird im nachfolgenden Bild dargestellt?",
                en: "Which letter is pictured within the following image?"
            };
            captchaTwo.save().then(function() {
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/images/52821095197328183163.png", true, captchaTypeText.id, captchaTwo.id, "E");
            });

            let captchaThree = Captchas.build();
            captchaThree.fk_captchas_type = captchaTypeText.id;
            captchaThree.context = {
                de: "Welcher Buchstabe wird im nachfolgenden Bild dargestellt?",
                en: "Which letter is pictured within the following image?"
            };
            captchaThree.save().then(function() {
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/images/52603579661788124576.png", true, captchaTypeText.id, captchaThree.id, "F");
            });

            let captchaFour = Captchas.build();
            captchaFour.fk_captchas_type = captchaTypeText.id;
            captchaFour.context = {
                de: "Welcher Buchstabe wird im nachfolgenden Bild dargestellt?",
                en: "Which letter is pictured within the following image?"
            };
            captchaFour.save().then(function() {
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/images/08966119339716475227.png", true, captchaTypeText.id, captchaFour.id, "G");
            });

            let captchaFive = Captchas.build();
            captchaFive.fk_captchas_type = captchaTypeText.id;
            captchaFive.context = {
                de: "Welcher Buchstabe wird im nachfolgenden Bild dargestellt?",
                en: "Which letter is pictured within the following image?"
            };
            captchaFive.save().then(function() {
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/images/82245872344052136603.png", true, captchaTypeText.id, captchaFive.id, "I");
            });

            let captchaSix = Captchas.build();
            captchaSix.fk_captchas_type = captchaTypeText.id;
            captchaSix.context = {
                de: "Welcher Buchstabe wird im nachfolgenden Bild dargestellt?",
                en: "Which letter is pictured within the following image?"
            };
            captchaSix.save().then(function() {
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/images/08984138796650868858.png", true, captchaTypeText.id, captchaSix.id, "S");
            });

            let captchaSeven = Captchas.build();
            captchaSeven.fk_captchas_type = captchaTypeText.id;
            captchaSeven.context = {
                de: "Welcher Buchstabe wird im nachfolgenden Bild dargestellt?",
                en: "Which letter is pictured within the following image?"
            };
            captchaSeven.save().then(function() {
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/images/85344950047917803942.png", true, captchaTypeText.id, captchaSeven.id, "T");
            });
        });

        let captchaTypeInteractive = CaptchaTypes.build();
        captchaTypeInteractive.description = "Interactive";
        captchaTypeInteractive.save().then(function() {
            let captchaOne = Captchas.build();
            captchaOne.fk_captchas_type = captchaTypeInteractive.id;
            captchaOne.context = {
                de: "Ziehe den fehlenden Buchstaben in den Ablagebereich.- Vervollständige das Wort: _lut",
                en: "Drop the missing letter within the drop zone - Complete the word _low"
            };
            captchaOne.save().then(function() {
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/images/85344950047917803942.png", false, captchaTypeInteractive.id, captchaOne.id);
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/images/82245872344052136603.png", false, captchaTypeInteractive.id, captchaOne.id);
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/images/52821095197328183163.png", false, captchaTypeInteractive.id, captchaOne.id);
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/images/08966119339716475227.png", true, captchaTypeInteractive.id, captchaOne.id);
            });

            let captchaTwo = Captchas.build();
            captchaTwo.fk_captchas_type = captchaTypeInteractive.id;
            captchaTwo.context = {
                de: "Ziehe den fehlenden Buchstaben in den Ablagebereich.- Vervollständige das Wort: _at",
                en: "Drop the missing letter within the drop zone - Complete the word _ea"
            };
            captchaTwo.save().then(function() {
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/images/85344950047917803942.png", true, captchaTypeInteractive.id, captchaTwo.id);
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/images/82245872344052136603.png", false, captchaTypeInteractive.id, captchaTwo.id);
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/images/52821095197328183163.png", false, captchaTypeInteractive.id, captchaTwo.id);
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/images/08966119339716475227.png", false, captchaTypeInteractive.id, captchaTwo.id);
            });

            let captchaThree = Captchas.build();
            captchaThree.fk_captchas_type = captchaTypeInteractive.id;
            captchaThree.context = {
                de: "Ziehe den fehlenden Buchstaben in den Ablagebereich.- Vervollständige das Wort: Glückl_ch",
                en: "Drop the missing letter within the drop zone - Complete the word im_tate"
            };
            captchaThree.save().then(function() {
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/images/85344950047917803942.png", false, captchaTypeInteractive.id, captchaThree.id);
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/images/82245872344052136603.png", true, captchaTypeInteractive.id, captchaThree.id);
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/images/52821095197328183163.png", false, captchaTypeInteractive.id, captchaThree.id);
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/images/08966119339716475227.png", false, captchaTypeInteractive.id, captchaThree.id);
            });

            let captchaFour = Captchas.build();
            captchaFour.fk_captchas_type = captchaTypeInteractive.id;
            captchaFour.context = {
                de: "Ziehe den fehlenden Buchstaben in den Ablagebereich.- Vervollständige das Wort: _uchen",
                en: "Drop the missing letter within the drop zone - Complete the word _earch"
            };
            captchaFour.save().then(function() {
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/images/08984138796650868858.png", true, captchaTypeInteractive.id, captchaFour.id);
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/images/82245872344052136603.png", false, captchaTypeInteractive.id, captchaFour.id);
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/images/52821095197328183163.png", false, captchaTypeInteractive.id, captchaFour.id);
                CaptchaManager.createCaptchaContentEntry("http://localhost:3000/data/images/08966119339716475227.png", false, captchaTypeInteractive.id, captchaFour.id);
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