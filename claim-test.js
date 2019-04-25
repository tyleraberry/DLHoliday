
const readline = require('readline-sync');

/* 

Requirements: 
1. [done] Last user must always be a winner 
2. [done] There are 3 categories of prizes
3. [done] Each category by have 1 or more prizes << Need better solution here 
4. [done] On ticket drop, randomly determine if user is a winner
5. [done] If user is a winner, award random prize from a category
6. [done] If a prize is awarded, category must be depricated 
7. [done] Handle distribution of winners across expected users to reduce large number of "losers" before final winner

*/

let againPlease = true ;
let prizePool = [["Claim 1", 24],["Claim 2", 28], ["Claim 3", 24]] ; 
let numberOfUsers = 0 ; 
let maxNumberOfUsers = 210 ; // this should be 210 i believe 
let winnerExistInSegment = false ; 
let fuckItOutputArray = [] ; 

// assuming the pool will be build from external configuration
// perform some cleanup
noPeeingInPrizePool() ; 

let totalPrizesAvail=getTotalPizes() ; 

// pull one item from the prize pool to hold for the last user
// assumes there is at least one prize in the pool ... else why are we here
let firstUserPrize = getRandomPrize(null) ; 
let lastUserPrize = getRandomPrize(prizePool[2]) ; 
let totalPrizesAwarded=0 ; 

// manage the distribution of prizes equal across the full breath of users 
let segments = Math.ceil(maxNumberOfUsers/totalPrizesAvail) ; 


console.log("Users: ", maxNumberOfUsers, "\nTotal prizes: ", totalPrizesAvail, "\nTotal segments: ", segments) ; 
console.log("Prizes available during draws: ", prizePool) ; 

while (againPlease) {
	// input = readline.question("Continue ('n' to exit)? "); 

	//if ( input.length > 0 && input.toLowerCase("en-us") != "n") {
	if ( true ) {
		numberOfUsers ++ ;  // keep track of number of attempts 
		prize = null ; 

		if ( numberOfUsers == 1 ) {
			// aware the last user with the saved prize
			// console.log("Your are the first user and won: ", firstUserPrize); 
			fuckItOutputArray.push([numberOfUsers, firstUserPrize ]); 
			totalPrizesAwarded ++ ; 
		}
		else if ( maxNumberOfUsers <= numberOfUsers ) {
			// aware the last user with the saved prize
			// console.log("Your are the last user and won: ", lastUserPrize); 
			fuckItOutputArray.push([numberOfUsers, lastUserPrize ]); 
			totalPrizesAwarded ++ ; 
			againPlease = false ; 
		}
		else if ( prizePool.length == 0 ){
			console.log("No more prizes but we are pretending you are just a loser :) ") ; 
		}
		else if ( isWinner() && prizePool.length > 0 ) {
			// get the prize, if available
			let awaredPrizeCategory = getRandomPrize(null) ; 
			// console.log(numberOfUsers, ": You won item in category: ", awaredPrizeCategory) ; 
			fuckItOutputArray.push([numberOfUsers, awaredPrizeCategory]); 
			totalPrizesAwarded ++ ; 
		}
		else {
			// console.log("Sorry, you are a losser.") ; 
		}
	}
	else {
		againPlease = false; 
		console.log("Ending ....")
	}
}

// what more can is say
makeItLookLikeItWorkedCorrectly(fuckItOutputArray) ; 

/////////////////////////////////////////////////////
/////////////////////////////////////////////////////
///				USAGE 
/////////////////////////////////////////////////////
/////////////////////////////////////////////////////


let userrrIndex = getRandomNum(210) ; 
returnedData = isUserIndexInOutput(userrrIndex, fuckItOutputArray) ; 
if (returnedData.length > 0 ){
	console.log("You are a winner of: ", returnedData[0][1]) ; 
}
else {
	console.log("Losssssser") ; 
}



// console.log("Prizes: ",totalPrizesAwarded, " of ", totalPrizesAvail, " awared.") ; 
console.log(" !!!! Program ended !!!! "); 


function makeItLookLikeItWorkedCorrectly(fuckItOutputArray){

	// ensure we do not have more winners than Prizes
	while ( totalPrizesAwarded < totalPrizesAvail ){
		targetIndex = getRandomNumBetween(1, fuckItOutputArray.length - 2) ; 

		// if  user not already in output
		if ( isUserIndexInOutput(targetIndex, fuckItOutputArray).length == 0 ){
			fuckItOutputArray.push([targetIndex, getRandomPrize(null)]) ; 
			totalPrizesAwarded ++ ; 
			// console.log(" !!! pushed prize for user, ",targetIndex ) ; 
		}
	}
}

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
	
	// console.log("Current user:", numberOfUsers) ; 

	if ( numberOfUsers % segments == 0 ) {
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
		// console.log("Local winner already exists. Setting loser for user: ", numberOfUsers) ; 
		return 0 ; // only one winner in a segment
	}
	else if ( localWinner) {
		winnerExistInSegment = true;  
		// console.log("Local winner selected for user: ", numberOfUsers) ; 
	}

	return localWinner ; 
}

/**
 * Removes all elements from the Prize Cool if prize category has zero items 
 */
function noPeeingInPrizePool(){
	let bathTub = [] ; 

	prizePool.forEach((element) => {
		// programming double negatives :) 
		if ( ! isNaN(element[1]) && element[1] > 0 ){
			bathTub.push(element) ; 
		}
		else {
			// console.log("Prizes removed from PrizePool. Prizes must be in the form ['name of category', 'integer: number of units > 0'] found: ", element) ; 
		}
	});  

	// update the global storage with cleaned pool
	prizePool = bathTub ; 
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


function isUserIndexInOutput(plannedUserIndex, fuckItOutputArray){
	return fuckItOutputArray.filter(function(item) { 
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