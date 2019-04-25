require('dotenv').config()

// Set up tag manager.
var ticketManager = new (require('./libs/ticket-manager.js'))( process.env.SERIAL_PORT );
var isGameInProgress = false

// set up ticket globals
let prizePool = [[1, 24],[2, 28], [3, 24]] ; 
let userCounter = 0 ; 
let maxUserCounter = 210 ; // this should be 210 i believe 
let winnerExistInSegment = false ; 
let ticketArray = [] ; 
let totalPrizesAwarded=0 ; 
let totalPrizesAvail=getTotalPizes() ; 

// pull one item from the prize pool to hold for the last user
// assumes there is at least one prize in the pool ... else why are we here
let firstUserPrize = getRandomPrize(null) ; 
let lastUserPrize = getRandomPrize(prizePool[2]) ; 

// manage the distribution of prizes equal across the full breath of users 
let segments = Math.ceil(maxUserCounter/totalPrizesAvail) ; 


// allocate first and last
console.log("Your are the first user and won: ", firstUserPrize); 
ticketArray.push([userCounter, firstUserPrize ]); 
userCounter ++ ; 

// Make sure store the last item on the output array
console.log("Your are the last user and won: ", lastUserPrize); 
ticketArray.push([userCounter, lastUserPrize ]); 
totalPrizesAwarded = 2  ; 
userCounter ++ ;   
console.log(getTotalPizes());



// Setup the ouput array with requred data
while (userCounter < maxUserCounter) {
    console.log(userCounter);
	// input = readline.question("Continue ('n' to exit)? "); 
    
    if ( isWinner() && prizePool.length > 0 ) {
        // get the prize, if available
        let awaredPrizeCategory = getRandomPrize(null) ; 
        // console.log(userCounter, ": You won item in category: ", awaredPrizeCategory) ; 
        ticketArray.push([userCounter, awaredPrizeCategory]); 
        totalPrizesAwarded ++ ; 
    }
    
    userCounter ++ ;  // 
}
ticketCleanup() ; 



var tickets = [];
var ticketIndex = 0;
var claimIndex = 1;

ticketManager.addListener('ticketDetected',function(tag) {

    sendTicket();
    console.log('got the ticket')
});
console.log(ticketArray);
function sendTicket() {
    

    var winner = false

    returnedData = isUserIndexInOutput(ticketIndex, ticketArray) ; 
    if (returnedData.length > 0 ){
        winner = true;
        claimIndex = returnedData[0][1] ; 
    }

    // console.log(":::: ", claimIndex, " Current index: ", ticketIndex, "award type: ") ; 
    
    var data = {
        'isWinner': winner,
        'claimNumber': claimIndex
    }

    if ( ticketIndex < ticketArray.length - 1 ) {
        ticketIndex ++;
        // console.log (ticketIndex);
    }
    if (ticketIndex == ticketArray.length - 1) {
        ticketIndex = 0;
        // console.log ('resetting count. we go again!');
    }
    
    io.emit('ticketDetected', data); // Send to web socket listener.
    console.log({data});



}

function ticketCleanup(){

	// ensure we do not have more winners than Prizes
	while ( getTotalPizes() > 0  ){
        targetIndex = getRandomNumBetween(1, ticketArray.length - 2) ; 
        
        // if  user not already in output
		if ( isUserIndexInOutput(targetIndex, ticketArray).length == 0 ){
			ticketArray.push([targetIndex, getRandomPrize(null)]) ; 
			totalPrizesAwarded ++ ; 
			// console.log(" !!! pushed prize for user, ",targetIndex ) ; 
        }
	}
}


//#region 

/**
 * 
 * @param upperBound The maximum number to return. Think 0 to X values are possible
 * @returns Int
 */
function getRandomNum(upperBound){
	return getRandomNumBetween(0, upperBound) ; 
}

function getRandomNumBetween(lowerBound, upperBound) {
	return Math.floor(Math.random() * (upperBound - lowerBound) + lowerBound)
  }

/**
 * @returns Losser or Winner based on order/number of the user and available tickets for set
 */
function isWinner(){
	
	// inforce max number of winners per segment
	localWinner = Math.round(Math.random()); 
	
	// // console.log("Current user:", userCounter) ; 

	if ( userCounter % segments == 0 ) {
		if ( ! winnerExistInSegment) {
			winnerExistInSegment = false ; 
			// console.log("At the end of a segment and no winner.") ; 
			return 1 ; // must have a winner before we move on from segment 
		}
		else{
			// set segment winner to false to allow next set to get a winner
			winnerExistInSegment = false ; 
			// console.log("At the end of a segment with existing winner.") ; 
			return 0 ; 
		}
		
	}
	else if ( winnerExistInSegment ) {
		// console.log("Local winner already exists. Setting loser for user: ", userCounter) ; 
		return 0 ; // only one winner in a segment
	}
	else if ( localWinner) {
		winnerExistInSegment = true;  
		// console.log("Local winner selected for user: ", userCounter) ; 
	}

	return localWinner ; 
}


/**
 *  The main idea here is that the number of rows in the array will be reduces from the 
 *  starting length of X once a tickets in a category is used
 *  @returns String presenting the Price category or null if there are not prizes available
 */
function getRandomPrize(expectedCategory){

	// if there are no more prizes, return null 
	if ( prizePool.length == 0 ) {
		return null ; 
	}
	
	let prizeCategoryIndx = 0 ; 
	if (expectedCategory && expectedCategory != null){
		prizeCategoryIndx = prizePool.indexOf(expectedCategory) ; 
	}
	else {
		prizeCategoryIndx = getRandomNum(prizePool.length) ; 
	}

	let prizeCategory = prizePool[prizeCategoryIndx][0] ; 

	// decrement the available prizes in a category
	prizePool[prizeCategoryIndx][1] -- ; 

	if ( prizePool[prizeCategoryIndx][1] === 0 ) {
		// remove the category entirely from the prize pool
		prizePool = removePrizePoolElement(prizePool[prizeCategoryIndx]) ; 
	}

	// console.log("Prize index: ", prizeCategoryIndx, " Array: ", prizePool);

	return prizeCategory ; 
}

/**
 * The correct solve here should have been using Array.slice() but that is not working as i think it should
 * @param delElement The PizePool element we would like to delete from the PizePool
 */
function removePrizePoolElement(delElement){
	return prizePool.filter(function(item) { 
		return item !== delElement ;
	})
}


function isUserIndexInOutput(plannedUserIndex, ticketArray){
	return ticketArray.filter(function(item) { 
		return item[0] == plannedUserIndex ;
	})
}

/**
 * @returns Int total number of prizes across all the Prize categories
 */
function getTotalPizes(){
	let sum = 0 ; 
	prizePool.forEach((element) => {
		sum += 	element[1] ; 
	})
	
	return sum ; 
}


//#endregion

/******************************************** */

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