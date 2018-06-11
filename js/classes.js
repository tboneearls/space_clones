// instantiate star class for background
class Star {
	constructor(x, y, dy, radius) {
		this.x = x;
		this.y = y;
		this.dy = dy;
		this.radius = radius;
	}
	draw() {
		ctx.beginPath();
		ctx.fillStyle = "white";
		ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
		ctx.fill();
	}
	update() {
		if (this.y + this.radius >= canvas.height) {
			this.y = this.radius;
		}
	}
	move() {
		this.y += this.dy;
	}
}

const player2Img = new Image();
player2Img.src = "images/player2_ship.png";
player2Img.width = 60;
player2Img.height = 60;

const playerImg = new Image();
playerImg.src = "images/player_ship.png";
playerImg.width = 60;
playerImg.height = 60;

// class for player ships
// Why not use this class to instatiate each player? Store defaults like score, lives, turn number, isDead, etc.
class Player {
	constructor(firepower, shield) {
		this.body = {
			// img: playerImg,
			x: 300,
			y: 500,
			width: playerImg.width,
			height: playerImg.height
		};
		// charge == how many lasers player can fire.
		this.charge = Infinity;
		this.shotsFired = [];
	}
	initialize() {
		this.body = {
			// img: playerImg,
			x: (canvas.width / 2) - (this.body.width / 2),
			y: (canvas.height - this.body.height * 2),
			width: playerImg.width,
			height: playerImg.height
		}
	}
	initLaser() { // creates player bullet and "fires" it(i.e. adds it to shotsFired)
		if (this.shotsFired.length < this.charge) {		
			this.shotsFired.push(laserFactory.generateLaser((this.body.x + 8), (this.body.y - this.body.height), (-6)));
		}
	}
	move() {
		let speed = 5;
		const rightBorder = canvas.width - this.body.width; // or if circle, this.body.radius
		const leftBorder = 0;
		if (this.direction === "left") {
			// if the direction changes to left, subtract speed value from x
			if (this.body.x <= leftBorder) {
				speed = 0;
				this.body.x = 0;
			} else {
				speed = 5;
				this.body.x -= speed;
			}
		} else if (this.direction === "right") {
			// if the direction changes to right, add speed value to x
			if (this.body.x >= rightBorder - 1) {
				speed = 0;
				this.body.x = rightBorder - 1;
			} else {
				speed = 5;
				this.body.x += speed;
			}
		}
	}
	draw() {
		let x = this.body.x;
		let y = this.body.y;
		let width = this.body.width;
		let height = this.body.height;
		ctx.drawImage(playerImg, x, y);
	}
}

const cloneImg = new Image();
cloneImg.src = "images/clone_ship.png";
cloneImg.width = 45;
cloneImg.height = 45;
// class for basic enemies
class Clone {
	constructor() {
		this.firepower = 1;
		this.shield = 1;
		this.speed = 2;
		this.body = {};
		this.direction = "left";
		this.distBetweenShips = 100;
		this.descent = 55;
		this.charge = Infinity;
		this.shotsFired = [];
		this.row = 1;
	}
	initialize() {
		this.body = {
			x: canvas.width - (this.distBetweenShips * (cloneFactory.clones.length)),
			y: 100,
			width: cloneImg.width,
			height: cloneImg.height
		}
		let rowY = this.descent * this.row;
		// if dist between ships makes x a negative value.
		// only bug is if I need to start with more than two rows of ships
		if (this.body.x <= 0) {
			this.row++;
			this.body.x = Math.abs(this.body.x);
			this.body.y += rowY;
			/// I didn't see how any of that was necessary...
		}
		if (this.row % 2 === 1) {
			this.direction = "left";
		} else {
			this.direction = "right";
		}
	}
	move() {
		const leftBorder = 0;
		const rightBorder = canvas.width - this.body.width; // or if circle, this.body.radius
		
		if (this.direction === "left") {
			// if the direction changes to left, subtract speed value from x
			if (this.body.x <= leftBorder) {
				this.speed = 0;
				this.body.x = 0;
				this.direction = "down";
				this.speed = this.descent;
				this.body.y += this.speed;
				this.direction = "right";
			} else {
				this.speed = 2;
				this.body.x -= this.speed;
			}
		} else if (this.direction === "right") {
			// if the direction changes to right, add speed value to x
			if (this.body.x >= rightBorder - 1) {
				this.speed = 0;
				this.body.x = rightBorder - 1;
				this.direction = "down";
				this.speed = this.descent;
				this.body.y += this.speed;
				this.direction = "left";
			} else {
				this.speed = 2;
				this.body.x += this.speed;
			}
		}
	}
	fire() {
		this.shotsFired.push(laserFactory.generateLaser(this.body.x + 20, this.body.y + this.body.height, 6))
		for (let i = 0; i < this.shotsFired.length; i++) {
			this.shotsFired[i].move();
		}
	}
	update() {
		const leftBorder = 0;
		const rightBorder = canvas.width - this.body.width;
		if (this.body.y + this.descent >= canvas.height - 50) {
			this.body.y = 100;
			if (this.body.x >= leftBorder){
				this.direction = "right";
			} else if (this.body.x + this.body.width <= rightBorder) {
				this.direction = "left";
			}
		}
	}
	draw() {
		let x = this.body.x;
		let y = this.body.y;
		let width = this.body.width;
		let height = this.body.height;
		ctx.drawImage(cloneImg, x, y);
	}
}

const mothershipImg = new Image();
mothershipImg.src = "images/mothership.png";
mothershipImg.width = 240;
mothershipImg.height = 150;
// class for end of level enemies
class Mothership {
	constructor() {
		this.firepower = 1;
		this.shield = 10;
		this.speed = 5;
		this.body = {};
		this.direction = "left";
		this.charge = Infinity;
		this.shotsFired = [];
	}
	initialize() { 
		this.body = {
			x: (canvas.width / 2) - (mothershipImg.width / 2),
			y: 100,
			width: mothershipImg.width,
			height: mothershipImg.height
		}
	}
	update() {
		const leftBorder = 0;
		const rightBorder = canvas.width;
		if (this.body.x <= leftBorder){
			this.direction = "right";
		} else if (this.body.x + this.body.width >= rightBorder) {
			this.direction = "left";
		}
	}
	move() {
		if (this.direction === "left") {
			this.body.x -= this.speed;
		} else {
			this.body.x += this.speed;
		}
	}
	fire() {
		this.shotsFired.push(laserFactory.generateLaser(this.body.x + 110, this.body.y + this.body.height, 6))
		for (let i = 0; i < this.shotsFired.length; i++) {
			this.shotsFired[i].move();
		}
	}
	draw() {
		let x = this.body.x;
		let y = this.body.y;
		let width = this.body.width;
		let height = this.body.height;
		ctx.drawImage(mothershipImg, x, y);
	}
}

const laserImg = new Image();
laserImg.src = "images/laser.png";
laserImg.width = 60;
laserImg.height = 100;

class Lasers {
	constructor(x, y, dy) {
		this.x = x;
		this.y = y;
		this.width = laserImg.width;
		this.height = laserImg.height;
		this.dy = dy;
	}
	draw() {
		ctx.drawImage(laserImg, this.x, this.y);
	}
	move() {
		this.draw();
		this.y += this.dy;
		this.checkDisappear();
	}
	shipHit(firingShip, laser) {
		// get the index of the ship that fired the laser from the clone factory
		if (firingShip != player1Ship && firingShip != player2Ship) {
			const indexShip = cloneFactory.clones.indexOf(firingShip);
			// get the index of the laser from that ship
			const indexLaser = cloneFactory.clones[indexShip].shotsFired.indexOf(laser);
			// remove that laser from the ship's array of lasers
			cloneFactory.clones[indexShip].shotsFired.splice(indexLaser, 1);
		} else
		if (firingShip === player1Ship) {
			const indexLaser = player1Ship.shotsFired.indexOf(laser);
			player1Ship.shotsFired.splice(indexLaser, 1);
		} else
		if (firingShip === player2Ship) {
			const indexLaser = player2Ship.shotsFired.indexOf(laser);
			player2Ship.shotsFired.splice(indexLaser, 1);
		}
		
	}
	mothershipHit(mothership, laser) {
		const indexShip = mothershipFactory.motherships.indexOf(mothership);
		// get the index of the laser from that ship
		const indexLaser = mothershipFactory.motherships[indexShip].shotsFired.indexOf(laser);
		// remove that laser from the ship's array of lasers
		mothershipFactory.motherships[indexShip].shotsFired.splice(indexLaser, 1);
	}
	checkDisappear(laser) {
		const indexLaser = laserFactory.lasers.indexOf(laser);
		if (this.y > canvas.height || this.y + this.height < 0) {
			laserFactory.lasers.splice(indexLaser, 1);
		}
	}
}
// ***** FACTORIES *****

// factory to store clones
const cloneFactory = {
	clones: [],
	generateClone() {
		const newClone = new Clone();
		this.clones.push(newClone);
		return newClone;
	},
	findClone(index) {
		return this.clones[index];
	}
}

// factory to store motherships
const mothershipFactory = {
	motherships: [],
	generateMothership() {
		const newMothership = new Mothership();
		this.motherships.push(newMothership);
		return newMothership;
	},
	findMothership(index) {
		return this.motherships[index];
	}
}

// factory to store lasers
const laserFactory = {
	lasers: [],
	generateLaser(x, y, dy) {
		const newLaser = new Lasers(x, y, dy);
		this.lasers.push(newLaser);
		return newLaser;
	},
	findLaser(index) {
		return this.lasers[index];
	}
}