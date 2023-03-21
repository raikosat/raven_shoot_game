const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const collisionCanvas = document.getElementById('collisionCanvas');
const collisionCtx = collisionCanvas.getContext('2d');
collisionCanvas.width = window.innerWidth;
collisionCanvas.height = window.innerHeight;
ctx.font = '50px Impact';

let timeToNextRaven = 0;
let ravenInterval = 500;
let lastTime = 0;
let ravens = [];
let score = 0;
let gameOver = false;
let play = false;

class Raven {
    constructor() {
        this.spriteWidth = 271;
        this.spriteHeight = 194;
        this.sizeModifier = Math.random() * 0.6 + 0.4;
        this.width = this.spriteWidth * this.sizeModifier;
        this.height = this.spriteHeight * this.sizeModifier;
        this.x = canvas.width;
        const hCalculation = Math.random() * canvas.height - this.height;
        this.y = hCalculation < 0 ? 0 : hCalculation;
        this.directionX = Math.random() * 5 + 3;
        this.directionY = Math.random() * 5 - 2.5;
        this.markedForDeletion = false;
        this.image = new Image();
        this.image.src = 'img/raven.png';
        this.frame = 0;
        this.maxFrame = 4;
        this.timeSinceFlap = 0;
        this.flapInterval = Math.random() * 50 + 50;
        this.randomColors = [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)];
        this.color = 'rgb(' + this.randomColors[0] + ',' + this.randomColors[1] + ',' + this.randomColors[2] + ')';
        this.hasTrail = Math.random() > 0.5;
    }

    update(deltaTime) {
        if (this.y < 0 || this.y > canvas.height - this.height) {
            this.directionY = this.directionY * -1;
        }
        this.x -= this.directionX;
        this.y += this.directionY;
        if (this.x < 0 - this.width) this.markedForDeletion = true;
        this.timeSinceFlap += deltaTime;
        if (this.timeSinceFlap > this.flapInterval) {
            if (this.frame > this.maxFrame) this.frame = 0;
            else this.frame++;
            this.timeSinceFlap = 0;
            if (this.hasTrail) {
                for (let i = 0; i < 5; i++) {
                    particles.push(new Particle(this.x, this.y, this.width, this.color));
                }
            }
        }
        if (this.x < 0 - this.width) gameOver = true;
    }

    draw() {
        collisionCtx.fillStyle = this.color;
        collisionCtx.fillRect(this.x, this.y, this.width, this.height);
        ctx.drawImage(this.image, this.spriteWidth * this.frame, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
    }
}
let explosions = [];
class Explosion {
    constructor(x, y, size) {
        this.image = new Image();
        this.image.src = 'img/boom.png';
        this.spriteWidth = 200;
        this.spriteHeight = 179;
        this.size = size;
        this.x = x;
        this.y = y;
        this.frame = 0;
        this.sound = new Audio();
        this.sound.src = 'sound/boom.ogg';
        this.timeSinceLastFrame = 0;
        this.frameInterval = 200;
        this.markedForDeletion = false;
    }

    update(deltaTime) {
        if (this.frame == 0) this.sound.play();
        this.timeSinceLastFrame += deltaTime;
        if (this.timeSinceLastFrame > this.frameInterval) {
            this.frame++;
            this.timeSinceLastFrame = 0;
            if (this.frame > 5) this.markedForDeletion = true;
        }
    }

    draw() {
        ctx.drawImage(this.image, this.spriteWidth * this.frame, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.size, this.size);
    }
}

let particles = [];
class Particle {
    constructor(x, y, size, color) {
        this.size = size;
        this.x = x + this.size / 2 + Math.random() * 50 - 25;
        this.y = y + this.size / 3 + Math.random() * 50 - 25;
        this.radius = Math.random() * this.size / 10;
        this.maxRadius = Math.random() * 20 + 35;
        this.markedForDeletion = false;
        this.speedX = Math.random() * 1 + 0.25;
        this.color = color;
    }

    update() {
        this.x += this.speedX;
        this.radius += 0.3;
        if (this.radius > this.maxRadius - 5) this.markedForDeletion = true;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = 1 - this.radius / this.maxRadius;
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class Background {
    constructor(gameWidth, gameHeight) {
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        this.image = new Image();
        this.image.src = 'img/background.png';
        this.x = 0;
        this.y = 0;
        this.width = 2400;
        this.height = 720;
        this.speed = 1;
    }

    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.gameWidth, this.gameHeight);
        ctx.drawImage(this.image, this.x + this.gameWidth - this.speed, this.y, this.gameWidth, this.gameHeight);
    }

    update() {
        this.x -= this.speed;
        if (this.x < 0 - this.width) this.x = 0;
    }
}

const background = new Background(canvas.width, canvas.height);

function drawScore() {
    ctx.fillStyle = 'black';
    ctx.fillText('Score :' + score, 150, 75);
    ctx.fillStyle = 'white';
    ctx.fillText('Score :' + score, 155, 80);
}

function drawGameOver() {
    ctx.textAlign = 'center';
    ctx.fillStyle = 'black';
    ctx.fillText('Game Over, your score is ' + score, canvas.width / 2, canvas.height / 2);
    ctx.fillStyle = 'white';
    ctx.fillText('Game Over, your score is ' + score, canvas.width / 2 + 5, canvas.height / 2 + 5);
    ctx.fillStyle = 'black';
    ctx.fillText('Click to restart game', canvas.width / 2, canvas.height / 2 + 50);
    ctx.fillStyle = 'white';
    ctx.fillText('Click to restart game', canvas.width / 2, canvas.height / 2 + 55);
}

function drawStartGame() {
    ctx.textAlign = 'center';
    ctx.fillStyle = 'black';
    ctx.fillText('Click to start game', canvas.width / 2, canvas.height / 2);
    ctx.fillStyle = 'white';
    ctx.fillText('Click to start game', canvas.width / 2 + 5, canvas.height / 2 + 5);
}

window.addEventListener('click', function (e) {
    if (!play) {
        play = true;
    };
    if (play && gameOver) {
        gameOver = false;
        ravens = [];
        explosions = [];
        particles = [];
        score = 0;
        animate(0);
    };
    const detectPixelColor = collisionCtx.getImageData(e.x, e.y, 1, 1);
    const pc = detectPixelColor.data;
    ravens.forEach(object => {
        if (object.randomColors[0] === pc[0] && object.randomColors[1] === pc[1] && object.randomColors[2] === pc[2]) {
            object.markedForDeletion = true;
            score++;
            explosions.push(new Explosion(object.x, object.y, object.width));
        }
    });
});

function animate(timeStamp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    collisionCtx.clearRect(0, 0, canvas.width, canvas.height);
    background.draw();
    background.update();
    if (!play) {
        this.drawStartGame();
    }
    if (play) {
        let deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        timeToNextRaven += deltaTime;
        if (timeToNextRaven > ravenInterval) {
            ravens.push(new Raven());
            timeToNextRaven = 0;
            ravens.sort((a, b) => {
                return a.width - b.width;
            });
        }
        this.drawScore();
        [...particles, ...ravens, ...explosions].forEach(object => object.update(deltaTime));
        [...particles, ...ravens, ...explosions].forEach(object => object.draw());
        ravens = ravens.filter(object => !object.markedForDeletion);
        explosions = explosions.filter(object => !object.markedForDeletion);
        particles = particles.filter(object => !object.markedForDeletion);
    }
    if (!gameOver) requestAnimationFrame(animate);
    else this.drawGameOver();
}

animate(0);
