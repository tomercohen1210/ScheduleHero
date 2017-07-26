/*This Module Only Serves Http app*/

module.exports = function (port, pathToApp) {

    var bodyParser = require('body-parser');

    var urlencode = bodyParser.urlencoded({ extended: true});

    var express = require('express');
    var http = require('http');

    var path = require('path');

    var app = express();

    const PORT = port;

    // parse application/x-www-form-urlencoded
    app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
    app.use(bodyParser.json())

    app.get('/', function (req, res) {
        res.sendFile(path.normalize(__dirname + "/../../app/" + pathToApp + "/index.html"));
    });
    app.get('/External/', function (req, res) {
        res.sendFile(path.normalize(__dirname + "/../../External/"+sessionName ));
    });
    app.get('/favicon.ico', function (req, res) {
        res.sendFile(path.normalize(__dirname + "/../../External/favicon.ico" ));
    });

    app.use('/utils', express.static(path.join(path.normalize(__dirname + "/../../Utils/"))));
    app.use('/External', express.static(path.join(path.normalize(__dirname + "/../../External/"))));
    app.use('/js', express.static(path.join(path.normalize(__dirname + "/../../app/" +pathToApp +"/js" ))));


    app.use(express.static(path.normalize(__dirname + "/../../app/" + pathToApp)));
    app.use(express.static(path.normalize(__dirname + "/../../External/" + pathToApp)));


    console.log("Http Server Connected..");

    var server = app.listen(PORT);

    return {app: app , server:server};

};
