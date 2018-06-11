// ***** GLOBAL VARIABLES *****

// these aren't constants; they might change if the URL changes
// window.location.search returns just the query string
let players = window.location.search.split('?players=')[1];
let isSolo = players == "1"; // if the query string is "?players=1", this is true

// EVENT LISTENER VARIABLES

const controls = $("#how-to-play");
const closeControls = $(".close-controls");
const prologue = $("#prologue");
const closePrologue = $(".close-prologue");
const closePause = $(".close-pause");
const resetGame = $("#reset-game");
const muteButton = $("#mute-button");
const endLevelModal = $(".end-level-modal");
const endLevelMessage = $("#end-level-message");
const playerAccuracy = $("#player-accuracy");
const nextLevel = $(".next-level");
const endLevelScore = $("#end-level-score");
const endLevelMute = $("#end-level-mute");
const endLevelReset = $("#end-level-reset");
const playerTurn = $("#player-turn");
const startTurn = $(".start-turn");
const gameOverModal = $(".game-over-modal");
const endGameOver = $("#game-over-button");

// It's helpful to know if its a jQuery object, vs a variable with some other value,
// so we name the objects starting with the jquery-associated $
// Capture any DOM object that we're going to manipulate later, so we don't have to
// re-burden the DOM by searching again
const $playerScore = $("#player-score");
const $player1Score = $("#player1-score");
const $player2Score = $("#player2-score");
const $highScore = $("#high-score");

const $level = $("#level");
const $lives = $("#lives");
const $turnStart = $("#turn-start");
const $enemiesLeft = $("#enemies-left");

let initialClones = 10;


// TITLE SCREEN DISPLAY

// get the value from local storage, or default to 0
let player1score = localStorage.getItem("player1score") || 0;
$player1Score.text("Player 1 Score: " + player1score);

let player2score = localStorage.getItem("player2score") || 0;
$player2Score.text("Player 2 Score: " + player2score);

let highScore = localStorage.getItem("highscore") || 5000;
$highScore.text("High Score: " + highScore);

/*
	I see we're setting default values for things like score, lives, isDead, etc. We also get and set localStorage throughout gameplay.
	A faster and cleaner approach could be to use those variables locally, then only set them when the user wants to quit.

	There are a TON of places where we're doing the same work, just slightly different if it's for player 1 or 2.
	A great goal for this project would be to simplify the tasks within so we don't have to repeat that work.
	Let's come up with a way to generically consume/update player data by only passing the player number.

	Gameplay note: until I noticed on the bottom-left corner that the number of lives were changing, i had no idea i was losing a life.
	Adding a small explosion on my ship, and/or a (-1) graphic floating off my ship when I get hit would be a better indicator.
	I also noticed the hit-zone is pretty sensitive (because transparent pngs are larger than the actual hit-zone of lazer beams...),
	so perhaps there's a way to tighten that up.
**/

function store (key, value) {
	if (value) {
		localStorage.setItem(key, value);
	} else {
		return localStorage.getItem(key);
	}
}

// instantiate game object
const game = {
	highScore: "5000",
	// switch to false if 2 player mode selected
	isSolo: isSolo,
	isPlayer1Turn: true,
	player1Score: "0",
	player1Lives: 3,
	player1IsDead: false,
	player2Score: "0",
	player2Lives: 3,
	player2IsDead: false,
	enemiesRemaining: initialClones,
	player1Clones: 10,
	player2Clones: 10,
	currentLevel: 1,
	isPaused: false,
	betweenTurns: false,
	accurateShotsPlayer1: 0,
	totalShotsLevelPlayer1: 0,
	accurateShotsPlayer2: 0,
	totalShotsLevelPlayer2: 0,
	isMuted: false,
	animation1: true,
	playerSwitch() {
		let player;
		let otherPlayer;
		// console.clear();
		console.log("The animation frame closes AFTER I remove the game objects, which throws an error.");
		console.log("VVVV See this right here? VVVV Don't worry about it.");
		if (this.isPlayer1Turn) {
			player = "Player 1";
			otherPlayer = "Player 2";
		} else {
			player = "Player 2";
			otherPlayer = "Player 1";
		}
		this.isPlayer1Turn = !this.isPlayer1Turn;
		this.betweenTurns = !this.betweenTurns;
		
		
		if (this.betweenTurns) {
			playerTurn.text(player + " has died.");
			startTurn.text(otherPlayer + " Start Turn")
			$(".turn-switch-modal").addClass("show-modal");
			stopAnimatons();
		}
		
			// stop animations

	},
	startTurn() {
		// display player 1 start or player 2 start
		// switch all stats displayed // affected

		// readjusts player 1 and player 2 image while still instantiating from same Player class
		if (this.isPlayer1Turn) {
			player1Ship.__proto__.draw = function() {		
				let x = this.body.x;
				let y = this.body.y;
				// If we aren't using width and height in this function, let's lose 'em.
				let width = this.body.width;
				let height = this.body.height;
				ctx.drawImage(playerImg, x, y);
			}
		} else {
			player2Ship.__proto__.draw = function() {		
				let x = this.body.x;
				let y = this.body.y;
				let width = this.body.width;
				let height = this.body.height;
				ctx.drawImage(player2Img, x, y);
			}
		}

		if (this.isPlayer1Turn) 
		{
			// get the values from storage once, then use the variable to update our DOM objs
			this.currentLevel = localStorage.getItem("player1level");
			$level.text("Level: " + this.currentLevel);

			this.player1Score = localStorage.getItem("player1score");
			$playerScore.text("Player 1 Score: " + this.player1Score);

			this.player1lives = localStorage.getItem("player1Lives");
			$lives.text("Player 1 Lives: " + this.player1lives);

			// jQuery allows chaining so we can manipulate multiple attributes of the same object:
			$turnStart
				.text("Player 1 Start")
				.css("animation", "fadeAndScale 1s ease-in forwards");


			// if no clones remaining, display mothership shield instead
			let enemiesplayer1 = localStorage.getItem("enemiesplayer1");
			mothershipFactory.motherships = []; // we do this regardless, so it belongs outside the if statement

			if (enemiesplayer1 === "0") {
				initMothership(1);
				let player1mothership = localStorage.getItem("player1mothership");
				mothershipFactory.motherships[0].shield = (Number(player1mothership));
				$enemiesLeft.text("Shield: " + player1mothership);
			} else {
				$enemiesLeft.text("Clones: " + enemiesplayer1);
				cloneFactory.clones = [];
				initClones(Number(enemiesplayer1));
			}
		} else {
			this.currentLevel = localStorage.getItem("player2level");
			$level.text("Level: " + this.currentLevel);

			this.player2Score = localStorage.getItem("player2score");
			$playerScore.text("Player 2 Score: " + this.player2Score);

			this.player2Lives = localStorage.getItem("player2lives");
			$lives.text("Player 2 Lives: " + this.player2Lives);

			$turnStart
				.text("Player 2 Start")
				.css("animation", "fadeAndScale2 1s ease-in forwards");

			if (localStorage.getItem("enemiesplayer2") === "0") {
				mothershipFactory.motherships = [];
				initMothership(1);
				mothershipFactory.motherships[0].shield = (Number(localStorage.getItem("player2mothership")));
				$enemiesLeft.text("Shield: " + localStorage.getItem("player2mothership"));
			} else {
				mothershipFactory.motherships = [];
				$enemiesLeft.text("Clones: " + localStorage.getItem("enemiesplayer2"));
				cloneFactory.clones = [];
				initClones(Number(localStorage.getItem("enemiesplayer2")));
				
			}
		}
		// reboot level where progress was made
	},
	pause() {
		this.isPaused = !this.isPaused;

		// stop animations
		cancelAnimationFrame(cancelMe); // this happens in both the if and the else, so it can just be stated once
		
		// we can directly pass isPaused to toggleClass, so there's less need for the if-else check
		$(".pause-modal").toggleClass("show-modal", this.isPaused);

		if (!this.isPaused) {
			// resume animations
			requestAnimationFrame(animateGame);
			event.stopPropagation();
		}
	},
	genLevel() {
		if (this.isPlayer1Turn) {
			this.player1Clones = Number(initialClones) + Number(localStorage.getItem("player1level"));
			localStorage.setItem("enemiesplayer1", this.player1Clones); // localStorage will set numbers as strings, no need to do the work
			$enemiesLeft.text("Clones: " + this.player1Clones);
			
			initClones(this.player1Clones);
		} else {
			this.player2Clones = `${Number(initialClones) + Number(localStorage.getItem("player2level")) * 1}`;
			localStorage.setItem("enemiesplayer2", this.player2Clones);
			$enemiesLeft.text("Clones: " + this.player2Clones);
		
			initClones(this.player2Clones);
		}
	},
	endLevel() {
		laserFactory.lasers = [];
		this.currentLevel++;
		$level.text("Level: " + this.currentLevel);
		// for (let i = 0; i < player1Ship.shotsFired.length; i++) {
		// 	player1Ship.shotsFired[i].shipHit(player1Ship, player1Ship.shotsFired[i]);
		// }
		// for (let i = 0; i < player2Ship.shotsFired.length; i++) {
		// 	player2Ship.shotsFired[i].shipHit(player2Ship, player2Ship.shotsFired[i]);
		// }
		// display message
		// firing accuracy
		// end bonus points?
		endLevelModal.addClass("show-modal");
		endLevelMessage.text("You beat Level " + `${this.currentLevel - 1}` + "!");
		nextLevel.text("Begin Level " + this.currentLevel);

		if (this.isPlayer1Turn) {
			localStorage.setItem("player1level", this.currentLevel);
			endLevelScore.text("Player 1 Score: " + localStorage.getItem("player1score"));
			let accPercentPlayer1 = Number(localStorage.getItem("player1accshots")) / ((Number(localStorage.getItem("player1totalshots")) + 1) / 2) * 100;
			let roundedAccPlayer1 = round(accPercentPlayer1, 1);
			playerAccuracy.text("Firing Accuracy: " + roundedAccPlayer1 + "%");
		} else {
			localStorage.setItem("player2level", this.currentLevel);
			endLevelScore.text("Player 2 Score: " + localStorage.getItem("player2score"));
			let accPercentPlayer2 = Number(localStorage.getItem("player2accshots")) / ((Number(localStorage.getItem("player2totalshots")) + 1) / 2) * 100;
			let roundedAccPlayer2 = round(accPercentPlayer2, 1);
			playerAccuracy.text("Firing Accuracy: " + roundedAccPlayer2 + "%");
		}
	},
	initMothership() {
		laserFactory.lasers = [];
		initMothership(1);
		// cancelAnimationFrame(cancelMe4)
		// requestAnimationFrame(animateMothership);
		$enemiesLeft.text("Shield: 10")
	},
	hitMothership(mothership) {
		if (this.isPlayer1Turn) {
			mothership.shield--;
			localStorage.setItem("player1mothership", mothership.shield.toString());
			$enemiesLeft.text("Shield: " + localStorage.getItem("player1mothership"));
			this.accurateShotsPlayer1++;
			localStorage.setItem("player1accshots", this.accurateShotsPlayer1.toString());
		} else {
			mothership.shield--;
			localStorage.setItem("player2mothership", mothership.shield.toString());
			$enemiesLeft.text("Shield: " + localStorage.getItem("player2mothership"));
			this.accurateShotsPlayer2++;
			localStorage.setItem("player2accshots", this.accurateShotsPlayer2.toString());
		}
		if (mothership.shield <= 0) {
			this.killMothership(mothership);
		}
	},
	killMothership(mothership) {
		if (this.isPlayer1Turn) {
			this.player1Score = `${Number(this.player1Score) + 1500}`;
			localStorage.setItem("player1score", this.player1Score.toString());
			$playerScore.text("Player 1 Score: " + localStorage.getItem("player1score").toString());
		} else {
			this.player2Score = `${Number(this.player2Score) + 1500}`;
			localStorage.setItem("player2score", this.player2Score.toString());
			$playerScore.text("Player 2 Score: " + localStorage.getItem("player2score").toString());
		}

		if (mothership.shield <= 0) {
			const index = mothershipFactory.motherships.indexOf(mothership);
			mothershipFactory.motherships.splice(index, 1);
			if (mothershipFactory.motherships.length === 0) {
				this.endLevel();
			}
		}
	},
	score() {
		let highScore;
		if (this.isPlayer1Turn) {
			this.player1Clones--;
			localStorage.setItem("enemiesplayer1", this.player1Clones);
			this.accurateShotsPlayer1++;
			localStorage.setItem("player1accshots", this.accurateShotsPlayer1.toString());

			this.player1Score = `${Number(this.player1Score) + 100}`;
			localStorage.setItem("player1score", this.player1Score.toString());

			if (this.player1Score === "9000" || this.player1Score === "15000" || this.player1Score === "22000") {
				this.player1Lives++;
				localStorage.setItem("player1lives", this.player1Lives.toString());
				$lives.text("Player 1 Lives: " + localStorage.getItem("player1lives"));
				if (this.animation1) {
					$("#extra-life").css("animation", "extraLives 1s ease-in forwards");
					this.animation1 = false;
				} else {
					$("#extra-life").css("animation", "extraLives2 1s ease-in forwards");
					this.animation1 = true;
				}
			}
			$playerScore.text("Player 1 Score: " + localStorage.getItem("player1score"));

		} else {
			this.player2Clones--;
			localStorage.setItem("enemiesplayer2", this.player2Clones);
			this.accurateShotsPlayer2++;
			localStorage.setItem("player2accshots", this.accurateShotsPlayer2.toString());

			this.player2Score = `${Number(this.player2Score) + 100}`;
			localStorage.setItem("player2score", this.player2Score.toString());

			if (this.player2Score === "9000" || this.player2Score === "15000" || this.player2Score === "22000") {
				this.player2Lives++;
				localStorage.setItem("player2lives", this.player2Lives.toString());
				$lives.text("Player 2 Lives: " + localStorage.getItem("player2lives"));
				if (this.animation1) {
					$("#extra-life").css("animation", "extraLives 1s ease-in forwards");
					this.animation1 = false;
				} else {
					$("#extra-life").css("animation", "extraLives2 1s ease-in forwards");
					this.animation1 = true;
				}
			}
			$playerScore.text("Player 2 Score: " + localStorage.getItem("player2score"));
		}
		
		// set high score updating conditions
		if (Number(localStorage.getItem("player1score")) > Number(localStorage.getItem("player2score")) && Number(localStorage.getItem("player1score")) > Number(localStorage.getItem("highscore"))) {
			this.highScore = this.player1Score;
			localStorage.setItem("highscore", this.highScore.toString());
			$highScore.text("High Score: " + localStorage.getItem("highscore"));
		} else if (Number(localStorage.getItem("player2score")) > Number(localStorage.getItem("player1score")) && Number(localStorage.getItem("player2score")) > Number(localStorage.getItem("highscore"))) {
			this.highScore = this.player2Score;
			localStorage.setItem("highscore", this.highScore.toString());
			$highScore.text("High Score: " + localStorage.getItem("highscore"));
		}
	},
	reset() {
		// restore all values to default
		// return to title screen
		setDefault();
		returnToTitle();
		dispHighScore(localStorage.getItem("highscore"));
	},
	die(ship) {
		// if player dies
		if (ship === player1Ship) {
			this.checkGameEnd();
		} else if (ship === player2Ship) {
			this.checkGameEnd();
		} else {
			// if a clone dies
			if (this.isPlayer1Turn) {
				const index = cloneFactory.clones.indexOf(ship);
				cloneFactory.clones.splice(index, 1);
				localStorage.setItem("enemiesplayer1", `${Number(localStorage.getItem("enemiesplayer1")) - 1}`);
				this.score();
				$enemiesLeft.text("Clones: " + localStorage.getItem("enemiesplayer1"));
				if (localStorage.getItem("enemiesplayer1") === "0") {
					this.initMothership();
				}
			} else {
				const index = cloneFactory.clones.indexOf(ship);
				cloneFactory.clones.splice(index, 1);
				localStorage.setItem("enemiesplayer2", `${Number(localStorage.getItem("enemiesplayer2")) - 1}`);
				this.score();
				$enemiesLeft.text("Clones: " + localStorage.getItem("enemiesplayer2"));
				if (localStorage.getItem("enemiesplayer2") === "0") {
					this.initMothership();
				}
			}
		}
	},
	checkGameEnd() {
		// game end message
		// return to title screen
		// set conditions for one player vs two players
		if (this.isSolo) {
			this.player1Lives--;
			localStorage.setItem("player1lives", this.player1Lives.toString());
			if (!this.player1IsDead) {
				// so lives don't keep going down
				$lives.text("Player 1 Lives: " + localStorage.getItem("player1lives"));
				if (localStorage.getItem("player1lives")=== "0") {
					this.player1IsDead = true;
					console.log("The animation frame closes AFTER I remove the game objects, which throws an error.");
					console.log("VVVV See this right here? VVVV Don't worry about it.");
					this.gameOver();
				}
			}
			// game end message
			// return to title screen
		} else {
			// call switch turn / turn start methods here
			if (this.isPlayer1Turn) {
				this.player1Lives--;
				localStorage.setItem("player1lives", this.player1Lives.toString());
				if (!this.player1IsDead) {
					$lives.text("Player 1 Lives: " + localStorage.getItem("player1lives"));
				}
				if (localStorage.getItem("player1lives") === "0" && !this.player1IsDead) {
					this.player1IsDead = true;
					if (this.player1IsDead && this.player2IsDead) {
						this.gameOver();
					} else if (this.player2IsDead === false) {
						this.playerSwitch();
					}
				} else if (!this.player2IsDead) {
					this.playerSwitch();
				}
			} else if (!this.isPlayer1Turn) {
				this.player2Lives--;
				localStorage.setItem("player2lives", this.player2Lives.toString());
				if (!this.player2IsDead) {
					$lives.text("Player 2 Lives: " + localStorage.getItem("player2lives"));
				}

				if (localStorage.getItem("player2lives") === "0" && !this.player2IsDead) {
					this.player2IsDead = true;
					if (this.player2IsDead && this.player1IsDead) {
						this.gameOver();
					} else if (this.player1IsDead === false) {
						this.playerSwitch();
					}
				} else if (!this.player1IsDead) {
					this.playerSwitch();
				}
			}
			// set conditions for both players
		}
	},
	gameOver() {
		$("#game-over-message").css("font-size", "40px");
		gameOverModal.addClass("show-modal");
		stopAnimatons();
	}
}




//  ***** MODALS *****

controls.on("click", function(event){
	$(".controls-modal").addClass("show-modal")
})

closeControls.on("click", function(event) {
	// this could better be stated by simply .removeClass("show-modal")
	$(this).parent().parent().toggleClass("show-modal", false)
	event.stopPropagation();
})

prologue.on("click", function(event){
	$(".prologue-modal").addClass("show-modal");
})

closePrologue.on("click", function(event) {
	$(this).parent().parent().toggleClass("show-modal", false)
	event.stopPropagation();
})
closePause.on("click", function(event){
	$(this).parent().parent().toggleClass("show-modal", false)
	game.isPaused = false;
	stopAnimatons();
	cancelAnimationFrame(cancelMe);
	requestAnimationFrame(animateGame);
	event.stopPropagation();
})
resetGame.on("click", function(event) {
	game.reset();
})
endLevelReset.on("click", function(event){
	game.reset();
})
muteButton.on("click", function(){
	game.isMuted = !game.isMuted;
	if (game.isMuted) {
		muteButton.text("Unmute");
		endLevelMute.text("Unmute");
		laserSound.pause();
	} else {
		muteButton.text("Mute");
		endLevelMute.text("Mute");
		laserSound.play();
	}
});
endLevelMute.on("click", function(){
	game.isMuted = !game.isMuted;
	if (game.isMuted) {
		muteButton.text("Unmute");
		endLevelMute.text("Unmute");
		laserSound.pause();
	} else {
		muteButton.text("Mute");
		endLevelMute.text("Mute");
		laserSound.play();
	}
});
nextLevel.on("click", function(event){
	$(this).parent().parent().toggleClass("show-modal", false)
	event.stopPropagation();
	game.accurateShots = 0;
	game.totalShotsLevel = 0;
	game.genLevel();
})
startTurn.on("click", function(event) {
	$(this).parent().parent().toggleClass("show-modal", false)
	game.betweenTurns = !game.betweenTurns;
	// stopAnimatons();

	requestAnimationFrame(animateGame);
	event.stopPropagation();
	game.startTurn();
})
endGameOver.on("click", function(event) {
	game.reset();
})
// ***** FUNCTIONS *****



// switch from game screen to title screen
const returnToTitle = () => {
	const initialPage = "index.html";
	location.replace('https://tboneearls.github.io/space_clones/' + initialPage);
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	// switch page to title screen
	// display a modal with a message
	// with a button that links to title screen?
}

// function to restore all default stats for both players
// Why can't we do this at the beginning?
const setDefault = () => {
	this.player1Score = 0;
	this.player1IsDead = false;
	this.accurateShotsPlayer1 = 0;
	this.totalShotsLevelPlayer1 = 0;
	this.player1Lives = 3;

	this.player2Score = 0;
	this.player2IsDead = false;
	this.accurateShotsPlayer2 = 0;
	this.totalShotsLevelPlayer2 = 0;
	this.player2Lives = 3;

	this.currentLevel = 1;
	this.isPaused = false;
	this.isMuted = false;

	// local storage reset
	localStorage.setItem("player1lives", "3");
	localStorage.setItem("player1score", "0");
	localStorage.setItem("player1accshots", "0");
	localStorage.setItem("player1totalshots", "0");
	localStorage.setItem("enemiesplayer1", "10");
	localStorage.setItem("player1mothership", "10");
	localStorage.setItem("player1level", "1")

	localStorage.setItem("player2lives", "3");
	localStorage.setItem("player2score", "0");
	localStorage.setItem("player2accshots", "0");
	localStorage.setItem("player2totalshots", "0");
	localStorage.setItem("enemiesplayer2", "10");
	localStorage.setItem("player2mothership", "10");
	localStorage.setItem("player2level", "1")
	ctx.clearRect(0, 0, canvas.width, canvas.height);
}

const initMothership = (numShips) => {
	for (let i = 0; i < numShips; i++) {
		mothershipFactory.generateMothership(new Mothership());		
		mothershipFactory.motherships[i].initialize();
	}
}
const initClones = (numClones) => {
	for (let i = 0; i < numClones; i++) {
		cloneFactory.generateClone(new Clone());
		cloneFactory.clones[i].initialize();
	}

}
const round = (value, precision) => {
	const multiplier = Math.pow(10, precision || 0);
	return Math.round(value * multiplier) / multiplier;
}
initClones(initialClones);
$enemiesLeft.text("Clones: " + initialClones);

const restartAnimation = () => {
	const element = $("h1")[0];

	// remove run animation class
  	element.classList.remove("run-animation");
  
  	// trigger reflow
	void element.offsetWidth;
  
	// re-add the run animation class
	element.classList.add("run-animation");
}

const removeKeys = () => {
	document.removeEventListener("keydown", addKeys());
}
const stopAnimatons = () => {
	cloneFactory.clones = [];
	mothershipFactory.motherships = [];
	cancelAnimationFrame(cancelMe);
}

animateGame();

