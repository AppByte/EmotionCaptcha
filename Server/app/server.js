const path = require('path');
const HttpServer = require(path.resolve(__dirname, "./httpServer" ));
const Crypto = require(path.resolve(__dirname, "./crypto" ));

/**
 * Represents the server class.
 * */
class Server {

    /**
     * Initializes a new instance of the server class.
     * */
    constructor()
    {
        this.httpServer = new HttpServer();
        this.httpServer.events.on('onRequestedToken', this.onRequestedTokenCallBack.bind(this));
        this.httpServer.events.on('onRequestedCaptcha', this.onRequestedCaptcha.bind(this));
    }

    start()
    {
        this.httpServer.start();
    }

    onRequestedTokenCallBack(req, res)
    {
        console.log("got");
        res.header("Content-Type", "text/json");
        res.send(JSON.stringify({token: Crypto.generateKey()}));
    }

    onRequestedCaptcha(req, res)
    {
        res.header("Content-Type", "text/json");
        res.send(JSON.stringify({token: Crypto.generateKey(), captchaType: "image"}));
    }
}

module.exports = Server;