'use strict';

// Modules
const path            = require('path');
const express         = require('express');
const bodyParser      = require('body-parser');
const cookieParser    = require('cookie-parser');
const yargs           = require('yargs').argv;

// Setup
const app             = express();
const port            = (process.env.hasOwnProperty('port')) ? process.env.port : 9090;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


// Apply middleware
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('dist/public'));


// And run the server
app.listen(port, function () {
    let timestamp = () => {
        let date       = new Date();

        let hours      = date.getHours();
        hours          = (hours < 10) ? `0${hours}` : hours;

        let minutes    = date.getMinutes();
        minutes        = (minutes < 10) ? `0${minutes}` : minutes;

        let seconds    = date.getSeconds();
        seconds        = (seconds < 10) ? `0${seconds}` : seconds;

        return '['+[hours, minutes, seconds].join(':') + ']';
    };

    console.log(timestamp() + ' Server running on port ' + port);
});
