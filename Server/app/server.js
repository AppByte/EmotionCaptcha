const path = require('path');
const FileSystem = require(path.resolve(__dirname, "./fileSystem" ));
const HttpServer = require(path.resolve(__dirname, "./httpServer" ));
const Crypto = require(path.resolve(__dirname, "./crypto" ));
const CaptchaManager = require(path.resolve(__dirname, "./captchaManager" ));

/**
 * Represents the server class.
 *
 * @author Daniel Strebinger
 * @version 1.0
 * */
class Server {

    /**
     * Initializes a new instance of the server class.
     * */
    constructor()
    {
        this.httpServer = new HttpServer();
        this.httpServer.events.on('onRequestedCaptcha', this.onRequestedCaptcha.bind(this));
        this.httpServer.events.on('onVerifyCaptcha', this.onVerifyCaptcha.bind(this));
        this.captchaManager = new CaptchaManager();
    }

    /**
     * Starts the server.
     * */
    start()
    {
        this.httpServer.start();

        if (!FileSystem.fileExists(path.join(__dirname, '../database.sqlite'))) {
            this.captchaManager.seedData();
        }

        this.captchaManager.establishConnection();

    }

    onRequestedCaptcha(req, res)
    {
        res.header("Content-Type", "text/json");
        this.captchaManager.sendCaptcha(res);
    }

    onVerifyCaptcha(req, res)
    {
        res.header("Content-Type", "text/json");
        this.captchaManager.verifyCaptcha(req.body.result, req.body.captchaID, req.body.captchaType, res);
    }
}

module.exports = Server;