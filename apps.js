var express = require('express');
var app = express();
var arduino = require('./arduino.js')
var serial = require('./serial.js')
var settings = require('./settings.js')
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var queue = require('./queue.js');
var port = process.env.PORT || 80;  

var fs = require('fs');   


app.use('/', express.static('/home/ardublockly'));

server.listen(port, function () {
    console.log('Server listening at port %d', port);
});

var numUsers = 0;
var timeout = null;

io.set("heartbeat timeout", 35000);
io.set("heartbeat interval", 10000);

io.on('connection', function (socket) {
    socket.activeUser = false;
    socket.authorized = true;

    socket.lastfilecompiled = "";
    socket.closed = false;
    socket.hasCompiled = false;
    socket.hadUploaded = false;

    socket.on('open debug', function (data) {
        console.log(data);
        console.log(settings.state);
        socket.emit('queue status', settings.state);
    });

    socket.on('compile', function (data) {
        socket.filename = socket.id.substring(2, 10);
        socket.aliasname = data.filename;
        arduino.compile(data.file, socket);
        clearTimeout(timeout);
        socket.activeUser = true;
    });

    socket.on('upload', function (data) {
        // 
        // fazer diff entre o último código e o atual
        // compilar, se tiver sucesso segue
        console.log('uploading... ');
        
        if (!socket.hasCompiled || socket.lastfilecompiled != data.file) {
            console.log(data.file);
            socket.filename = socket.id.substring(2, 10);
            socket.aliasname = data.filename;
            socket.activeUser = true;
            arduino.compile(data.file, socket, function () {
                Sendupload(socket, data);
            });

        }else{
            Sendupload(socket, data);
        }

    });


    socket.on('reset', function (data) {
        try {
            if (queue.isAuthorized(socket.id)) {
                if (serial.isOpen()) {
                    serial.close(function (error) {
                        if (error) {
                            console.log(error);
                        } else {
                            arduino.reset(socket.filename, function () {
                                serial.setup(socket);
                            });
                        }
                    });
                } else {
                    arduino.reset(socket.filename, function () {
                        serial.setup(socket);
                    });
                }

            }
        } catch (err) {
            console.log(err);
        }

    });



    socket.on('serial setup', function (data) {
        if (queue.isAuthorized(socket.id)) {
            socket.baudrate = data.baudrate;
            socket.parser = data.parser;
            if (socket.authorized && socket.activeUser) {
                serial.setup(socket);
            }
        }

    });



    socket.on('serial monitor', function (data) {
        console.log(data);
        if (queue.isAuthorized(socket.id)) {
            if (serial.isOpen()) {
                serial.write(data.write);
                console.log("serial is opened");
            } else {
                serial.setup(socket, function () {
                    serial.write(data.write);
                });
            }

        } else {
            console.log('not socket.authorized');
        }

    });


    socket.on('disconnect', function () {
        if (socket.activeUser) {
            queue.remove(socket, null, null);
            arduino.clean(socket.filename);
            if(socket.hadUploaded){
                clearTimeout(timeout);
                timeout = setTimeout(arduino.RunEmptyCode,60000)
            }
        }
        socket.closed = true;
        console.log("disconnected  " + socket.id);
    });


});


function Sendupload(socket, data) {
    clearTimeout(timeout);
    queue.push(socket, function (socket, data) {
        console.log("has compiled : " + socket.hasCompiled);
        
        if (socket.hasCompiled && socket.activeUser) {
            if (serial.isOpen()) {
                serial.close(function (error) {
                    if (error) {
                        socket.emit('done upload', {stderr: error});
                    } else {
                        arduino.upload(socket.filename, socket, function () {
                            serial.setup(socket);
                        });
                    }
                });
            } else {
                arduino.upload(socket.filename, socket, function () {
                    serial.setup(socket);
                });
            }
        } else {
            socket.emit('erro');
        }
    }, data);

}