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
        console.log("served captcha");
        res.send(JSON.stringify({token: Crypto.generateKey(), captchaType: "image", question: "How many?", images:[{id: 1, url: "http://via.placeholder.com/170x100"},{id: 2, url: "http://via.placeholder.com/170x100"},{id: 3, url: "http://via.placeholder.com/170x100"},{id: 4, url: "http://via.placeholder.com/170x100"}, {id: 5, url: "http://via.placeholder.com/170x100"},{id: 6, url: "http://via.placeholder.com/170x100"}]}));
    }
}

module.exports = Server;