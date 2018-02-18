const express = require('express');
const bodyParser = require('body-parser');
const events = require('events');
const helmet = require('helmet');

/**
 * server.js
 *
 * This class represents a http server.
 *
 * @author Daniel Strebinger
 * @version 1.0
 * */
class HttpServer {

    /**
     * Initializes a new instance of the server class.
     */
    constructor() {
        this.port = 3000;
        this.httpServer = express();
        this.httpServer.use(bodyParser.urlencoded({ extended: true }));
        this.httpServer.use('/data', express.static('data'));
        this.httpServer.set('title', 'CAPTCHA API');
        this.events = new events.EventEmitter();
        this.httpServer.post('/requestToken',function (req, res){
            this.events.emit('onRequestedToken', req, res);
        }.bind(this));
        this.httpServer.post('/requestCaptcha',function (req, res){
            this.events.emit('onRequestedCaptcha', req, res);
        }.bind(this));
        this.httpServer.post('/verifyCaptcha',function (req, res){
            this.events.emit('onVerifyCaptcha', req, res);
        }.bind(this));

        this.httpServer.disable('x-powered-by');
        this.httpServer.use(helmet());
    }

    /**
     * Starts the server.
     *
     * @param {int} port - Contains the port of the server.
     */
    start(port = 3000) {
        this.port = port;
        this.configureServer();
        console.log('Started the http server successfully.');
    }

    /**
     * Configures the server as a standard http server.
     * */
    configureServer()
    {
        try {
            var listener = this.httpServer.listen(this.port, function() {
                console.log('Server started on port %d', listener.address().port);
            });
        }
        catch (error)
        {

        }
    }

    /**
     * Stops the server.
     * */
    stop()
    {
        try
        {
            this.httpServer.close();
        }
        catch (error)
        {

        }
    }
}

module.exports = HttpServer;