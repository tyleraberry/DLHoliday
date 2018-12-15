require('dotenv').config()

// Set up tag manager.
var ticketManager = new (require('./libs/ticket-manager.js'))( process.env.SERIAL_PORT );
var isGameInProgress = false


var tickets = [];


tickets.push( true );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( true );
tickets.push( true );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( true );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( true );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( true );
tickets.push( false );
tickets.push( true );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( true );
tickets.push( false );
tickets.push( true );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( true );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( true );
tickets.push( false );
tickets.push( false );
tickets.push( true );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( true );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( true );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( true );
tickets.push( false );
tickets.push( false );
tickets.push( true );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( true );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( true );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( true );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( true );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( true );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( true );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( true );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( false );
tickets.push( false );

var ticketIndex = 0;
var claimIndex = 0;

ticketManager.addListener('ticketDetected',function(tag) {

    sendTicket();
    console.log('got the ticket')
});

function sendTicket() {

    var data = {
        'isWinner': tickets[ ticketIndex ],
        'claimNumber': 2
    }

    io.emit('ticketDetected', data); // Send to web socket listener.
    

    if ( ticketIndex < tickets.length - 2 ) {
        ticketIndex ++;
    }



}


// Set up serving functions

var express = require('express')
var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)



app.use(express.static('public'))

http.listen(3000, function() {

    console.log('listening on *:3000')

})


// socketIO

io.on('connection', function(socket) {
    console.log('a user connected');

    // reset the game in progress flag to play again.
    socket.on('gameEnded', function() {
        isGameInProgress = false;
    })
    
    socket.on('simulateTagAdded', function(tag) {
        tagAdded(tag)
    })

})