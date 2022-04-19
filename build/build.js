var ColorHelper = (function () {
    function ColorHelper() {
    }
    ColorHelper.getColorVector = function (c) {
        return createVector(red(c), green(c), blue(c));
    };
    ColorHelper.rainbowColorBase = function () {
        return [
            color('red'),
            color('orange'),
            color('yellow'),
            color('green'),
            color(38, 58, 150),
            color('indigo'),
            color('violet')
        ];
    };
    ColorHelper.getColorsArray = function (total, baseColorArray) {
        var _this = this;
        if (baseColorArray === void 0) { baseColorArray = null; }
        if (baseColorArray == null) {
            baseColorArray = ColorHelper.rainbowColorBase();
        }
        var rainbowColors = baseColorArray.map(function (x) { return _this.getColorVector(x); });
        ;
        var colours = new Array();
        for (var i = 0; i < total; i++) {
            var colorPosition = i / total;
            var scaledColorPosition = colorPosition * (rainbowColors.length - 1);
            var colorIndex = Math.floor(scaledColorPosition);
            var colorPercentage = scaledColorPosition - colorIndex;
            var nameColor = this.getColorByPercentage(rainbowColors[colorIndex], rainbowColors[colorIndex + 1], colorPercentage);
            colours.push(color(nameColor.x, nameColor.y, nameColor.z));
        }
        return colours;
    };
    ColorHelper.getColorByPercentage = function (firstColor, secondColor, percentage) {
        var firstColorCopy = firstColor.copy();
        var secondColorCopy = secondColor.copy();
        var deltaColor = secondColorCopy.sub(firstColorCopy);
        var scaledDeltaColor = deltaColor.mult(percentage);
        return firstColorCopy.add(scaledDeltaColor);
    };
    return ColorHelper;
}());
var PolygonHelper = (function () {
    function PolygonHelper() {
    }
    PolygonHelper.draw = function (numberOfSides, width) {
        push();
        var angle = TWO_PI / numberOfSides;
        var radius = width / 2;
        beginShape();
        for (var a = 0; a < TWO_PI; a += angle) {
            var sx = cos(a) * radius;
            var sy = sin(a) * radius;
            vertex(sx, sy);
        }
        endShape(CLOSE);
        pop();
    };
    return PolygonHelper;
}());
var flyMouse;
var drunkMouse;
var flock;
function setup() {
    createCanvas(windowWidth, windowHeight);
    flock = new Flock();
    for (var i = 0; i < 100; i++) {
        var b = new Boid(width / 2, height / 2);
        flock.addBoid(b);
    }
    flyMouse = new zFly();
    drunkMouse = new zDrunk();
    noCursor();
}
function draw() {
    background(255, 10);
    drunkMouse.display();
    drunkMouse.move();
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
        this.flock(boids);
        this.update();
        this.borders();
        this.render();
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
        pop();
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
var zDrunk = (function (_super) {
    __extends(zDrunk, _super);
    function zDrunk() {
        return _super.call(this, random(width), random(height), random(0.7, 1.2)) || this;
    }
    zDrunk.prototype.display = function () {
        push();
        translate(120 * cos(frameCount / 20), 130 * sin(frameCount / 20));
        _super.prototype.display.call(this);
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
        if (this.fruitMoved(1)) {
            this.prevTarget = __assign({}, this.target);
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
        this.mouseRepel();
        if (abs(this.x - this.target.x) < 5 && abs(this.y - this.target.y) < 5) {
            this.isLanding = false;
        }
    };
    zFly.prototype.cycleFlight = function () {
        if (this.isLanding)
            return;
        if (millis() - this.flyTime > 3000) {
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
//# sourceMappingURL=build.js.map