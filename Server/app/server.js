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
}

module.exports = Server;