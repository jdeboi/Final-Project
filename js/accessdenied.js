var flyMouse;
var drunkMouse;
var flock;
var flies = [];
var asteroidMouse;
var holeMice = [];
var mouseHole;
var wheel;
var wheelAngle = 0;
var wheelAngV = 0;
var wheelMice = [];
var wheelWent = 0;
var quadMice = [];
var hitSound;
var divs = [];
var draggableM;
var shadow;
var hasStarted = false;
var startTime = 0;
function preload() {
    mouseHole = loadImage("assets/mousehole.png");
    shadow = loadImage("assets/black_shadow.png");
    hitSound = loadSound("assets/hitSound2.mp3");
}
function setup() {
    createCanvas(windowWidth, windowHeight);
    imageMode(CENTER);
    flock = new Flock();
    for (var i_1 = 0; i_1 < 100; i_1++) {
        var b = new Boid(random(width), random(height));
        flock.addBoid(b);
    }
    flyMouse = new zFly();
    for (var i_2 = 0; i_2 < 100; i_2++) {
        flies.push(new zFly());
    }
    for (var _i = 0, flies_1 = flies; _i < flies_1.length; _i++) {
        var fly = flies_1[_i];
        fly.setTarget(random(width), random(height));
    }
    drunkMouse = new zDrunk();
    for (var i_3 = 0; i_3 < 3; i_3++) {
        quadMice.push(new Mouse(mouseX, mouseY));
    }
    holeMice.push(new zMouse(width * .1, height * .2));
    holeMice.push(new zMouse(width * .8, height * .4));
    holeMice.push(new zMouse(width * .5, height * .8));
    var i = 0;
    var w = width * .2;
    var h = w * .6;
    var sp = w * .7;
    var startX = (width - (2 * w + sp)) / 2;
    var startY = (height - (2 * (25 + h) + sp)) / 2 + 12;
    for (var x = 0; x < 2; x++) {
        for (var y = 0; y < 2; y++) {
            divs[i] = new zDraggable(i, startX + x * (w + sp), startY + y * (h + sp), w, h, shadow);
            i++;
        }
    }
    draggableM = new zDraggableMouse(mouseX, mouseY, hitSound);
    noCursor();
}
function draw() {
    drawingContext.shadowOffsetX = 1;
    drawingContext.shadowOffsetY = 1;
    drawingContext.shadowBlur = 4;
    drawingContext.shadowColor = 'rgba(0, 0, 0, .3)';
    displayDivs();
}
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
function displayDivs() {
    background(220);
    for (var _i = 0, divs_1 = divs; _i < divs_1.length; _i++) {
        var d = divs_1[_i];
        d.display();
        d.displayToolBar();
    }
    if (hasStarted) {
        draggableM.move(divs, startTime);
        draggableM.display();
    }
}
function startAnimation() {
    hasStarted = true;
    startTime = millis();
    select("#startScreen").style("display", "none");
    draggableM.x = width / 2;
    draggableM.y = height / 2;
    noCursor();
}
function mousePressed() {
}
function mouseReleased() {
}
function displayMiceHole() {
    background(255, 10);
    for (var _i = 0, holeMice_1 = holeMice; _i < holeMice_1.length; _i++) {
        var m = holeMice_1[_i];
        m.displayHole(mouseHole);
        m.display();
        m.move();
    }
}
function displayQuad() {
    background(220, 10);
    var d = 100;
    var sp = 50;
    var num = max(height / sp + 5, width / sp + 5);
    push();
    for (var x = 0; x < num; x++) {
        for (var y = 0; y < num; y++) {
            push();
            translate(sp * x, sp * y);
            rotate(frameCount / 10);
            quadMice[0].displayAt(10, 10);
            pop();
        }
    }
    pop();
}
function mouseWheel(event) {
    wheelWent = millis();
    wheelAngV = event.delta / 1000;
    wheelAngle += wheelAngV;
}
function displayWheel() {
    background(0);
    push();
    translate(width / 2, height / 2);
    rotate(wheelAngle);
    image(wheel, 0, 0);
    pop();
    for (var _i = 0, wheelMice_1 = wheelMice; _i < wheelMice_1.length; _i++) {
        var m = wheelMice_1[_i];
        m.move();
        m.display();
    }
    if (millis() - wheelWent > 100) {
    }
}
function displayFlies() {
    for (var _i = 0, flies_2 = flies; _i < flies_2.length; _i++) {
        var fly = flies_2[_i];
        fly.display();
        fly.move();
    }
}
var Flock = (function () {
    function Flock() {
        this.boids = [];
    }
    Flock.prototype.run = function () {
        for (var i = 0; i < this.boids.length; i++) {
            this.boids[i].run(this.boids);
        }
    };
    Flock.prototype.addBoid = function (b) {
        this.boids.push(b);
    };
    return Flock;
}());
var Boid = (function () {
    function Boid(x, y) {
        this.r = 3.0;
        this.maxspeed = 3;
        this.maxforce = 0.05;
        this.acceleration = createVector(0, 0);
        this.velocity = createVector(random(-1, 1), random(-1, 1));
        this.position = createVector(x, y);
        this.mouse = new Mouse();
    }
    Boid.prototype.run = function (boids) {
        this.borders();
        this.render();
        this.position.x++;
        this.position.y = sin(this.position.x / 50) * 200 + height / 2;
    };
    Boid.prototype.applyForce = function (force) {
        this.acceleration.add(force);
    };
    Boid.prototype.flock = function (boids) {
        var sep = this.separate(boids);
        var ali = this.align(boids);
        var coh = this.cohesion(boids);
        sep.mult(1.5);
        ali.mult(1.0);
        coh.mult(1.0);
        this.applyForce(sep);
        this.applyForce(ali);
        this.applyForce(coh);
    };
    Boid.prototype.update = function () {
        this.velocity.add(this.acceleration);
        this.velocity.limit(this.maxspeed);
        this.position.add(this.velocity);
        this.acceleration.mult(0);
    };
    Boid.prototype.seek = function (target) {
        var desired = p5.Vector.sub(target, this.position);
        desired.normalize();
        desired.mult(this.maxspeed);
        var steer = p5.Vector.sub(desired, this.velocity);
        steer.limit(this.maxforce);
        return steer;
    };
    Boid.prototype.render = function () {
        var theta = this.velocity.heading() + radians(90);
        stroke(200);
        push();
        translate(this.position.x, this.position.y);
        rotate(theta);
        fill(127);
        this.mouse.display();
        pop();
    };
    Boid.prototype.borders = function () {
        if (this.position.x < -this.r)
            this.position.x = width + this.r;
        if (this.position.y < -this.r)
            this.position.y = height + this.r;
        if (this.position.x > width + this.r)
            this.position.x = -this.r;
        if (this.position.y > height + this.r)
            this.position.y = -this.r;
    };
    Boid.prototype.separate = function (boids) {
        var desiredseparation = 25.0;
        var steer = createVector(0, 0);
        var count = 0;
        for (var i = 0; i < boids.length; i++) {
            var d = p5.Vector.dist(this.position, boids[i].position);
            if ((d > 0) && (d < desiredseparation)) {
                var diff = p5.Vector.sub(this.position, boids[i].position);
                diff.normalize();
                diff.div(d);
                steer.add(diff);
                count++;
            }
        }
        if (count > 0) {
            steer.div(count);
        }
        if (steer.mag() > 0) {
            steer.normalize();
            steer.mult(this.maxspeed);
            steer.sub(this.velocity);
            steer.limit(this.maxforce);
        }
        return steer;
    };
    Boid.prototype.align = function (boids) {
        var neighbordist = 50;
        var sum = createVector(0, 0);
        var count = 0;
        for (var i = 0; i < boids.length; i++) {
            var d = p5.Vector.dist(this.position, boids[i].position);
            if ((d > 0) && (d < neighbordist)) {
                sum.add(boids[i].velocity);
                count++;
            }
        }
        if (count > 0) {
            sum.div(count);
            sum.normalize();
            sum.mult(this.maxspeed);
            var steer = p5.Vector.sub(sum, this.velocity);
            steer.limit(this.maxforce);
            return steer;
        }
        else {
            return createVector(0, 0);
        }
    };
    Boid.prototype.cohesion = function (boids) {
        var neighbordist = 50;
        var sum = createVector(0, 0);
        var count = 0;
        for (var i = 0; i < boids.length; i++) {
            var d = p5.Vector.dist(this.position, boids[i].position);
            if ((d > 0) && (d < neighbordist)) {
                sum.add(boids[i].position);
                count++;
            }
        }
        if (count > 0) {
            sum.div(count);
            return this.seek(sum);
        }
        else {
            return createVector(0, 0);
        }
    };
    return Boid;
}());
var Mouse = (function () {
    function Mouse(x, y, z) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        if (z === void 0) { z = .85; }
        this.h = 12;
        this.w = 12;
        this.stemH = this.h * .55;
        this.x = x;
        this.y = y;
        this.z = z;
        this.minScale = .1;
        this.maxScale = 10000;
    }
    Mouse.prototype.display = function () {
        push();
        translate(this.x, this.y);
        scale(this.z);
        this.displayPointer();
        pop();
    };
    Mouse.prototype.displayPointer = function () {
        fill(0);
        strokeWeight(1.2);
        stroke(255);
        beginShape();
        vertex(0, 0);
        vertex(this.w, this.h);
        vertex(this.w * .56, this.h * .99);
        vertex(this.w * .83, this.h + this.stemH);
        vertex(this.w * .55, this.h + this.stemH * 1.25);
        vertex(this.w * .3, this.h * 1.1);
        vertex(0, this.h * 1.4);
        vertex(0, 0);
        endShape();
    };
    Mouse.prototype.checkBoundaries = function () {
        if (this.x < 0) {
            this.x += width;
        }
        this.x %= width;
        if (this.y < 0) {
            this.y += height;
        }
        this.y %= height;
        if (this.z < this.minScale)
            this.z = this.minScale;
        if (this.z > this.maxScale)
            this.z = this.maxScale;
    };
    Mouse.prototype.displayAt = function (x, y) {
        push();
        translate(x, y);
        this.display();
        pop();
    };
    return Mouse;
}());
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var zAsteroid = (function (_super) {
    __extends(zAsteroid, _super);
    function zAsteroid() {
        var _this = _super.call(this, random(width), random(height), random(0.7, 1.2)) || this;
        _this.acceleration = createVector(0, 0);
        _this.velocity = createVector(0, 0);
        _this.position = createVector(_this.x, _this.y);
        _this.minScale = .7;
        _this.maxScale = 1.2;
        return _this;
    }
    zAsteroid.prototype.move = function () {
        var ang = atan2(mouseY - this.y, mouseX - this.x);
        var d = dist(mouseX, mouseY, this.x, this.y);
        this.velocity.x = cos(ang) * d / 2;
        this.velocity.y = sin(ang) * d / 2;
        this.x += this.velocity.x;
        this.y += this.velocity.y;
    };
    return zAsteroid;
}(Mouse));
var zDrunk = (function (_super) {
    __extends(zDrunk, _super);
    function zDrunk() {
        return _super.call(this, random(width), random(height), random(0.7, 1.2)) || this;
    }
    zDrunk.prototype.display = function () {
        push();
        translate(50 * cos(frameCount / 20), 60 * sin(frameCount / 20));
        translate(this.x, this.y);
        scale(cos(frameCount / 70) * .3 + 1);
        rotate(sin(frameCount / 100) * 3 * PI);
        this.displayPointer();
        pop();
    };
    zDrunk.prototype.move = function () {
        var amt = .03;
        this.x = this.x * (1 - amt) + mouseX * amt;
        this.y = this.y * (1 - amt) + mouseY * amt;
    };
    return zDrunk;
}(Mouse));
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var zFly = (function (_super) {
    __extends(zFly, _super);
    function zFly() {
        var _this = _super.call(this, random(width), random(height), random(0.7, 1.2)) || this;
        _this.isFlying = true;
        _this.isLanding = false;
        _this.isCrawling = false;
        _this.minScale = .7;
        _this.maxScale = 1.2;
        _this.flyTime = random(5000);
        _this.crawlTime = random(1000);
        _this.crawlAngle = random(2 * PI);
        _this.randN = random(10);
        _this.targetOffset = { x: random(30), y: random(100) };
        _this.target = { x: width / 2, y: height / 2 };
        _this.prevTarget = __assign({}, _this.target);
        return _this;
    }
    zFly.prototype.setTarget = function (targetX, targetY) {
        this.target.x = targetX + this.targetOffset.x;
        this.target.y = targetY + this.targetOffset.y;
    };
    zFly.prototype.move = function () {
        if (dist(pmouseX, pmouseY, mouseX, mouseY) > 2) {
            this.clicked();
        }
        if (this.isLanding) {
            this.land();
        }
        else if (this.isFlying) {
            this.fly();
        }
        else {
            this.crawl();
        }
        this.cycleFlight();
    };
    zFly.prototype.land = function () {
        var ang = atan2(this.y - this.target.y, this.x - this.target.x);
        var speed = 5;
        this.x -= speed * cos(ang);
        this.y -= speed * sin(ang);
        if (abs(this.x - this.target.x) < 5 && abs(this.y - this.target.y) < 5) {
            this.isLanding = false;
        }
    };
    zFly.prototype.cycleFlight = function () {
        if (this.isLanding)
            return;
        if (this.isFlying && millis() - this.flyTime > 3000) {
            this.isFlying = !this.isFlying;
            if (!this.isFlying)
                this.isLanding = true;
            this.flyTime = millis();
        }
    };
    zFly.prototype.crawl = function () {
        if (this.isCrawling) {
            var step = 4;
            this.x += step * cos(this.crawlAngle) + random();
            this.y += step * sin(this.crawlAngle) + random();
        }
        this.cycleCrawl();
    };
    zFly.prototype.setFruitAngle = function () {
        this.crawlAngle = atan2(this.target.y - this.y, this.target.x - this.x);
        this.prevTarget = __assign({}, this.target);
    };
    zFly.prototype.fruitMoved = function (amt) {
        var d = dist(this.prevTarget.x, this.prevTarget.y, this.target.x, this.target.y);
        return d > amt;
    };
    zFly.prototype.cycleCrawl = function () {
        if (this.isCrawling) {
            if (millis() - this.crawlTime > 200) {
                this.isCrawling = false;
                this.crawlTime = millis();
            }
        }
        else {
            if (millis() - this.crawlTime > 800) {
                this.isCrawling = true;
                this.crawlAngle = random(2 * PI);
                this.crawlTime = millis();
            }
        }
    };
    zFly.prototype.fly = function () {
        var speed = 15;
        var dN = 15;
        var nx = noise((frameCount + this.randN) / dN, this.randN);
        this.x += map(nx, 0, 1, -speed, speed);
        var ny = noise((frameCount + this.randN + 100) / (dN + 10), this.randN + 10);
        this.y += map(ny, 0, 1, -speed, speed);
        var nz = noise((frameCount + this.randN * 2 + 200) / (dN + 20), this.randN + 20);
        this.z += map(nz, 0, 1, -0.2, 0.2);
        this.mouseRepel();
        this.checkBoundaries();
    };
    zFly.prototype.mouseRepel = function () {
        var d = dist(this.x, this.y, mouseX, mouseY);
        if (d < 150) {
            var ang = atan2(mouseY - this.y, mouseX - this.x);
            this.x -= 10 * cos(ang);
            this.y -= 10 * sin(ang);
        }
    };
    zFly.prototype.clicked = function () {
        this.isFlying = true;
        this.isLanding = false;
        this.flyTime = millis() - random(5000);
    };
    return zFly;
}(Mouse));
var zMouse = (function (_super) {
    __extends(zMouse, _super);
    function zMouse(x, y) {
        var _this = _super.call(this, random(width), random(height)) || this;
        _this.isCrawling = false;
        _this.crawlingTime = 0;
        _this.segmentTime = random(1000, 3000);
        _this.angle = random(0, 2 * PI);
        _this.goHome = false;
        _this.isHome = false;
        _this.home = createVector(x, y);
        return _this;
    }
    zMouse.prototype.move = function () {
        if (this.isCrawling) {
            var amt = 4;
            this.x += amt * cos(this.angle);
            this.y += map(noise(frameCount / 10), 0, 1, -3, 3) + sin(this.angle) * amt;
        }
        this.setMovement();
        this.checkBoundaries();
    };
    zMouse.prototype.display = function () {
        if (!this.isHome) {
            _super.prototype.display.call(this);
        }
    };
    zMouse.prototype.displayHole = function (mouseHole) {
        image(mouseHole, this.home.x, this.home.y, 100, 70);
    };
    zMouse.prototype.setMovement = function () {
        if (mouseIsPressed) {
            this.goHome = true;
            this.isCrawling = false;
        }
        if (this.goHome) {
            if (this.reachedHome()) {
                this.goHome = false;
                this.isHome = true;
                this.angle = random(0, 2 * PI);
                this.crawlingTime = millis();
            }
            else {
                this.moveHome();
            }
        }
        else if (this.isHome) {
            if (millis() - this.crawlingTime > 3000) {
                this.isHome = false;
                this.isCrawling = true;
                this.crawlingTime = millis();
            }
        }
        else if (this.isCrawling) {
            if (millis() - this.crawlingTime > this.segmentTime) {
                this.crawlingTime = millis();
                this.segmentTime = random(1000, 3000);
                this.isCrawling = false;
                this.angle += random(0, PI / 3);
                this.isHome = false;
            }
        }
        else {
            if (millis() - this.crawlingTime > this.segmentTime) {
                this.isCrawling = true;
                this.segmentTime = random(300, 1000);
                this.crawlingTime = millis();
                this.isHome = false;
            }
        }
    };
    zMouse.prototype.reachedHome = function () {
        return dist(this.x, this.y, this.home.x, this.home.y) <= 10;
    };
    zMouse.prototype.moveHome = function () {
        var ang = atan2(this.home.y - this.y, this.home.x - this.x);
        var n1 = map(noise(frameCount / 30), 0, 1, -2, 2);
        var n2 = map(noise(frameCount / 40), 0, 1, -2, 2);
        this.x += (5 + n1) * cos(ang);
        this.y += (5 + n2) * sin(ang);
    };
    return zMouse;
}(Mouse));
var zWheel = (function (_super) {
    __extends(zWheel, _super);
    function zWheel() {
        var _this = _super.call(this, random(width), random(height), random(0.7, 1.2)) || this;
        _this.angle = 0;
        _this.rand = random();
        _this.acceleration = createVector(0, 0);
        _this.velocity = createVector(0, 0);
        _this.position = createVector(_this.x, _this.y);
        return _this;
    }
    zWheel.prototype.move = function () {
        var r = 100;
        var newA = map(wheelAngV, .2, -.2, PI, 0);
        this.angle = this.angle * .5 + newA * .5 + .5 * noise(this.rand, frameCount);
        this.x = width / 2 + cos(this.angle) * r;
        this.y = height / 2 + sin(this.angle) * r;
    };
    return zWheel;
}(Mouse));
var zButton = (function () {
    function zButton(x, y) {
        this.r = 10;
        this.x = x;
        this.y = y;
    }
    zButton.prototype.display = function (mx, my) {
        stroke(255);
        strokeWeight(2);
        noFill();
        ellipse(this.x, this.y, this.r);
    };
    zButton.prototype.mouseOver = function (mx, my) {
        var d = dist(mx, my, this.x, this.y);
        return d < this.r / 2;
    };
    return zButton;
}());
var zDraggable = (function () {
    function zDraggable(id, x, y, w, h, shadow) {
        this.toolbarH = 25;
        this.startDrag = { x: 0, y: 0 };
        this.startDragCoords = { x: 0, y: 0 };
        this.locked = false;
        this.dragging = false;
        this.closed = false;
        this.minimized = false;
        this.barH = 26;
        this.bRad = 10;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.id = id;
        this.origX = this.x;
        this.origY = this.y;
        this.offsetX = 0;
        this.offsetY = 0;
        var xp = 15;
        var yp = 12;
        var sp = 20;
        this.closeButton = new zButton(xp, yp);
        this.minButton = new zButton(xp + sp, yp);
        this.maxButton = new zButton(xp + sp * 2, yp);
        this.shadow = shadow;
    }
    zDraggable.prototype.display = function () {
        push();
        translate(this.x, this.y);
        if (!this.closed) {
            if (!this.minimized)
                this.displayContent();
        }
        pop();
    };
    zDraggable.prototype.displayToolBar = function () {
        push();
        translate(this.x, this.y);
        if (!this.closed) {
            fill(0);
            noStroke();
            if (!this.minimized)
                rect(0, 10, this.w, (this.barH - 10));
            rect(0, 0, this.w, this.barH, this.bRad);
            var _a = this.getMouseButtons(), x = _a.x, y = _a.y;
            this.closeButton.display(x, y);
            this.minButton.display(x, y);
            this.maxButton.display(x, y);
        }
        pop();
    };
    zDraggable.prototype.getMouseCoords = function () {
        return this.getMouse();
    };
    zDraggable.prototype.getMouseButtons = function () {
        var mouse = { x: mouseX, y: mouseY };
        mouse.x -= this.x;
        mouse.y -= this.y;
        return mouse;
    };
    zDraggable.prototype.getMouse = function () {
        return { x: mouseX, y: mouseY };
    };
    zDraggable.prototype.displayContent = function () {
        this.displayShadow();
        push();
        translate(0, this.barH);
        pop();
        this.displaySolidBack(color(255));
        this.displayFrame();
    };
    zDraggable.prototype.displaySolidBack = function (col) {
        fill(col);
        stroke(0);
        strokeWeight(2);
        rect(0, 0, this.w, this.h + this.barH, this.bRad);
    };
    zDraggable.prototype.displayFrame = function () {
        noFill();
        stroke(0);
        strokeWeight(2);
        rect(0, 0, this.w, this.h + this.barH, this.bRad);
    };
    zDraggable.prototype.checkButtons = function () {
        if (this.closed)
            return false;
        var mouse = this.getMouseButtons();
        if (this.closeButton.mouseOver(mouse.x, mouse.y)) {
            this.closeWindow();
            return true;
        }
        else if (this.minButton.mouseOver(mouse.x, mouse.y)) {
            this.toggleMinimze();
            return true;
        }
        else if (this.maxButton.mouseOver(mouse.x, mouse.y)) {
            this.maximizeWindow();
            return true;
        }
        return false;
    };
    zDraggable.prototype.checkDragging = function () {
        if (this.closed)
            return false;
        var mouse = this.getMouse();
        if (this.overToolBar(mouse.x, mouse.y)) {
            this.dragging = true;
            this.startDrag.x = mouseX;
            this.startDrag.y = mouseY;
            this.startDragCoords.x = this.x;
            this.startDragCoords.y = this.y;
            return true;
        }
        return false;
    };
    zDraggable.prototype.overToolBar = function (mx, my) {
        return mx > this.x && mx < this.x + this.w && my > this.y && my < this.y + this.barH;
    };
    zDraggable.prototype.endDrag = function () {
        this.dragging = false;
    };
    zDraggable.prototype.update = function () {
        if (this.dragging) {
            this.offsetX = mouseX - this.startDrag.x;
            this.offsetY = mouseY - this.startDrag.y;
            this.x = this.startDragCoords.x + this.offsetX;
            this.y = this.startDragCoords.y + this.offsetY;
        }
    };
    zDraggable.prototype.toggleCloseWindow = function (div) {
        this.locked = !this.locked;
        this.closeWindow();
    };
    zDraggable.prototype.openWindow = function () {
        this.closed = false;
        this.minimized = false;
        this.locked = false;
    };
    zDraggable.prototype.closeWindow = function () {
        this.closed = true;
    };
    zDraggable.prototype.maximizeWindow = function () {
        this.x = this.origX;
        this.y = this.origY;
        this.offsetX = 0;
        this.offsetY = 0;
    };
    zDraggable.prototype.toggleMinimze = function () {
        this.minimized = !this.minimized;
    };
    zDraggable.prototype.displayShadow = function () {
        var backW = this.w * 1.25;
        var backH = this.h * 1.2;
        var backY = 0;
        imageMode(CORNERS);
        push();
        translate(0, this.barH);
        image(this.shadow, 0, backY, backW, backH);
        pop();
    };
    return zDraggable;
}());
var zDraggableMouse = (function (_super) {
    __extends(zDraggableMouse, _super);
    function zDraggableMouse(x, y, soundF) {
        var _this = _super.call(this, x, y) || this;
        _this.collided = false;
        _this.soundF = soundF;
        return _this;
    }
    zDraggableMouse.prototype.move = function (divs, startTime) {
        for (var _i = 0, divs_2 = divs; _i < divs_2.length; _i++) {
            var d = divs_2[_i];
            if (this.collides(d)) {
                if (!this.collided) {
                    this.collided = true;
                    var xy = this.getCollisionPoint(d);
                    this.x = xy.x;
                    this.y = xy.y;
                    if (millis() - startTime > 100) {
                        this.soundF.play();
                    }
                }
                return;
            }
        }
        this.collided = false;
        this.setNextMove();
    };
    zDraggableMouse.prototype.getNextMove = function () {
        var da = .2;
        var x = this.x * (1 - da) + mouseX * da;
        var y = this.y * (1 - da) + mouseY * da;
        return { x: x, y: y };
    };
    zDraggableMouse.prototype.setNextMove = function () {
        var xy = this.getNextMove();
        this.x = xy.x;
        this.y = xy.y;
    };
    zDraggableMouse.prototype.getCollisionPoint = function (div) {
        var xy = this.getNextMove();
        var from1 = { x: xy.x, y: xy.y };
        var to1 = { x: this.x, y: this.y };
        var from2 = { x: div.x, y: div.y - div.toolbarH };
        var to2 = { x: div.x, y: div.y + div.h };
        var inter = intersection(from1, to1, from2, to2);
        if (inter)
            return inter;
        from2 = { x: div.x + div.w, y: div.y - div.toolbarH };
        to2 = { x: div.x + div.w, y: div.y + div.h };
        inter = intersection(from1, to1, from2, to2);
        if (inter)
            return inter;
        from2 = { x: div.x, y: div.y - div.toolbarH };
        to2 = { x: div.x + div.w, y: div.y - div.toolbarH };
        inter = intersection(from1, to1, from2, to2);
        if (inter)
            return inter;
        from2 = { x: div.x, y: div.y + div.h + div.toolbarH };
        to2 = { x: div.x + div.w, y: div.y + div.h + div.toolbarH };
        inter = intersection(from1, to1, from2, to2);
        if (inter)
            return inter;
        return { x: this.x, y: this.y };
    };
    zDraggableMouse.prototype.collides = function (div) {
        var xy = this.getNextMove();
        return (xy.x > div.x && xy.x < div.x + div.w && xy.y > div.y - div.toolbarH && xy.y < div.y + div.h + div.toolbarH);
    };
    return zDraggableMouse;
}(Mouse));
function intersection(from1, to1, from2, to2) {
    var dX = to1.x - from1.x;
    var dY = to1.y - from1.y;
    var determinant = dX * (to2.y - from2.y) - (to2.x - from2.x) * dY;
    if (determinant === 0)
        return undefined;
    var lambda = ((to2.y - from2.y) * (to2.x - from1.x) + (from2.x - to2.x) * (to2.y - from1.y)) / determinant;
    var gamma = ((from1.y - to1.y) * (to2.x - from1.x) + dX * (to2.y - from1.y)) / determinant;
    if (!(0 <= lambda && lambda <= 1) || !(0 <= gamma && gamma <= 1))
        return undefined;
    return {
        x: from1.x + lambda * dX,
        y: from1.y + lambda * dY,
    };
}
//# sourceMappingURL=build.js.map