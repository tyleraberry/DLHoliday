$(function() {
    
    CustomEase.create("conveyor", "M0,0 C0.144,0.082 0.568,0.51 0.658,0.792 0.846,1.382 0.838,1 1,1");

    const numOfBags = 50;
    const selectedBag = numOfBags - 15;

    const carousel = $("#carousel");
    const sign  = $("#sign")

    function buildCarousel(isWinner) {

        // console.log(isWinner);
        carousel.css('left', '1920px').empty();

        for (let index = 0; index < numOfBags; index++) { 
        
            let randomNum = Math.floor(Math.random() * 7) + 1 ; // select one of the 7 bags
            let isFilled = Math.round(Math.random()) || index === selectedBag  ? '-filled.png' : '.png';

            if(index === selectedBag && !isWinner) {
                isFilled = '.png'
            }

            let img = `<div class='b'><img src="images/bags/bag${randomNum}${isFilled}" /></div>`
    
            carousel.append(`<div class="bag">${img}</div>`);
    
        }        

    }   

    window.insertResponder = function(isWinner, claimNumber) {

        buildCarousel(isWinner)

        let pos = Number(selectedBag) * $('.bag').first().width();
        pos = pos * -1;
        pos -= ($('#container').width() * 0.5) + ($('.bag').first().width() * 0.5)
        pos = Math.floor(pos);
        
        let moveWheels = new TweenMax.to("#wheels", 0.4, {x:'-8px', yoyo:true, repeat:-1});
        TweenMax.to("#insert-ticket", 2.3, {x:'-1920px'});
        TweenMax.to("#carousel", 10, {x:`${pos}px`, delay:.2, ease: 'conveyor', onComplete:function(){
            moveWheels.pause();
            if(isWinner) {
                // pick claim number from set
                // increment claim number count
                winnerSign(claimNumber)
            }
            else {
                loserSign()
            }

        }});
        TweenMax.to("#arrow", 1, {y:'-=100', delay:8})
    }

    function winnerSign(claimNumber) {

        let img = `<img src='images/winner${claimNumber}.png' />`

        TweenMax.to("#winner", 0.5, {autoAlpha:1})
        TweenMax.from("#winner img", 0.5, {alpha:0, yoyo:true, repeat:5, onComplete:function() {
            $("#result")
                .css('top', '-1080px')
                .append(img)
            TweenMax.to("#result", 0.5, {css:{top:0}})
            setTimeout(() => {
                window.location.reload()
            }, 5000);
        }});
        
    }

    function loserSign() {
        TweenMax.to("#loser", 0.5, {autoAlpha:1})
        TweenMax.from("#loser img", 0.5, {alpha:0, yoyo:true, repeat:5, onComplete:function() {
            $("#result")
                .css('top', '-1080px')
                .append(`<img src='images/sorry.png' />`)
            TweenMax.to("#result", 0.5, {css:{top:0}})
            
            setTimeout(() => {
                window.location.reload()
            }, 5000);
        }});
    }

})