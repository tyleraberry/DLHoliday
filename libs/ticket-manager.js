var events = require('events');
var SerialPort = require('serialport')

module.exports = TicketManager;

TicketManager.super_ = events.EventEmitter;
TicketManager.prototype = Object.create(events.EventEmitter.prototype, {
    constructor: {
        enumerable: false,

    }
});

function TicketManager( serialPort ) {

    try {
        this.port = new SerialPort( serialPort , {
            autoOpen: false,
            baudRate: 115200
        });
        this.port.setEncoding('utf8');

        this.tags = [];
        this.start();
    } catch(e) {
        console.log(e);
    }

};

TicketManager.prototype.start = function() {

    var scope = this;
    var collectedOutput = "";

    this.port.open(function(err) {

        if (err) {
            return console.log('Error opening port: ', err.message)
        }
        console.log('port opened')

    })


    // Read data that is available but keep the stream from entering "flowing mode"
    this.port.on('readable', function() {

        var output = String(scope.port.read()).trim()
        collectedOutput += output;

        console.log("out!" , collectedOutput);

        if (collectedOutput == "Ticket" ) {

            scope.emit('ticketDetected');
            collectedOutput = "";
        }
    });

}

