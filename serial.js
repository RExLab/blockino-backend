var serialport = require("serialport");
var SerialPort = serialport.SerialPort;
var portprefix = "/dev/ttyACM";
var me = null;

openPort(9600, serialport.parsers.readline('\n'), function () {

});



function openPort(baudrate, parser, callback) {
    serialport.list(function (err, ports) {
	if(err){
	console.log(err);
	return;
	}

        ports.forEach(function (port) {
            if (port.comName.indexOf(portprefix) > -1) {
                console.log('Arduino found in port ' + port.comName);
                me = new SerialPort(port.comName, {
                    parser: parser,
                    baudrate: baudrate
                }, function (error) {
                    if (error)
                    {
                        console.log(error);
                    } else {
                        if ((callback != 'undefined') && (typeof (callback) == "function")) {
                            callback();
                        }
                    }
                });
            }
        });
    });


}

function setupPort(socket, callback) {

    socket.baudrate = ((socket.baudrate == 'undefined') ? 9600 : socket.baudrate);

    openPort(socket.baudrate, serialport.parsers.raw, function () {
        me.open(function (error) {
            if (error) {
                socket.emit("serial monitor", {stderr: error});
                console.log('failed to open: ' + error);
                socket.serial = null;
            } else {
                console.log('serial opened');
                me.on("data", function (data) {
                    console.log("data: " + data);
                    if (!socket.closed) {
                        socket.emit("serial monitor", {stream: data, parser: 'newline'});
                    } else {
                        me.close();
                    }
                });
            }

            if ((callback != 'undefined') && (typeof (callback) == "function")) {
                callback();
            }

        });

    });

}

exports.isOpen = function () {
    return me.isOpen();
};

exports.close = function (callback) {
    me.close(function (error) {
        callback(error);
    });

};

exports.setup = function (socket, callback) {

    if (me.isOpen()) {
        console.log('Port is already openned');
        me.close(function (error) {
            if (error) {
                socket.emit("serial monitor", {stderr: error});
                console.log('failed to open: ' + error);
            } else {
                setupPort(socket, callback);
            }

        });
    } else {
        setupPort(socket, callback);
    }



};

exports.write = function (data) {
    me.write(data, function (error) {
        if (error) {
            console.log('error: ' + error);
        }
    });

};


