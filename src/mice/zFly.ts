// import Mouse from './Mouse.js';

// import p5 from "p5";
// import Mouse from './Mouse';

interface point {
    x: number;
    y: number;
}

class zFly extends Mouse {

    flyTime: number;
    crawlTime: number;
    crawlAngle: number;
    randN: number;

    targetOffset: point;
    target: point;
    prevTarget: point;

    isFlying = true;
    isLanding = false;
    isCrawling = false;



    constructor() {
        super(random(width), random(height), random(0.7, 1.2))

        this.minScale = .7;
        this.maxScale = 1.2;

        this.flyTime = random(5000);
        this.crawlTime = random(1000);

        this.crawlAngle = random(2 * PI);
        this.randN = random(10);

        this.targetOffset = { x: random(30), y: random(100) }
        this.target = { x: width / 2, y: height / 2 }
        this.prevTarget = { ...this.target };
    }

    setTarget(targetX: number, targetY: number) {
        this.target.x = targetX + this.targetOffset.x;
        this.target.y = targetY + this.targetOffset.y;
    }


    move() {
        if (this.fruitMoved(1)) {
            this.prevTarget = { ...this.target }
            this.clicked();
        }

        if (this.isLanding) {
            // fill(0, 0, 255);
            this.land();
        } else if (this.isFlying) {
            // fill(255, 0, 0);
            this.fly();
        } else {
            // fill(0, 255, 0);
            this.crawl();
        }

        this.cycleFlight();
    }

    land() {

        let ang = atan2(this.y - this.target.y, this.x - this.target.x);
        let speed = 5;
        this.x -= speed * cos(ang);
        this.y -= speed * sin(ang);

        // if (this.z > 1) this.z -= 0.1;
        // if (this.z < 1) this.z += 0.1;

        this.mouseRepel();

        if (abs(this.x - this.target.x) < 5 && abs(this.y - this.target.y) < 5) {
            this.isLanding = false;
        }

    }

    cycleFlight() {
        if (this.isLanding) return;
        if (millis() - this.flyTime > 3000) {
            this.isFlying = !this.isFlying;
            if (!this.isFlying) this.isLanding = true;
            this.flyTime = millis();
        }
        // if (this.isFlying) {
        //     if (millis() - this.flyTime > 4000) {
        //         this.isFlying = false;
        //         this.isLanding = true;
        //         this.flyTime = millis();
        //     }
        // } else {
        //     if (millis() - this.flyTime > 4000) {
        //         this.isFlying = true;
        //         this.flyTime = millis();
        //     }
        // }
    }

    crawl() {
        if (this.isCrawling) {
            let step = 4;
            this.x += step * cos(this.crawlAngle) + random();
            this.y += step * sin(this.crawlAngle) + random();
        }
        this.cycleCrawl();
    }

    setFruitAngle() {
        this.crawlAngle = atan2(this.target.y - this.y, this.target.x - this.x);
        this.prevTarget = { ...this.target };
    }

    fruitMoved(amt: number) {
        let d = dist(this.prevTarget.x, this.prevTarget.y, this.target.x, this.target.y);
        return d > amt;
    }

    cycleCrawl() {
        if (this.isCrawling) {
            if (millis() - this.crawlTime > 200) {
                this.isCrawling = false;
                this.crawlTime = millis();
            }
        } else {
            if (millis() - this.crawlTime > 800) {
                this.isCrawling = true;
                this.crawlAngle = random(2 * PI);
                this.crawlTime = millis();
            }
        }
    }

    fly() {
        let speed = 15;
        let dN = 15;
        //     this.x = noise(frameCount / speed, this.randN) * width;
        //     this.y =
        //       noise((frameCount + 100) / (speed + 10), this.randN) * height;

        let nx = noise((frameCount + this.randN) / dN, this.randN);
        this.x += map(nx, 0, 1, -speed, speed);

        let ny = noise(
            (frameCount + this.randN + 100) / (dN + 10),
            this.randN + 10
        );
        this.y += map(ny, 0, 1, -speed, speed);

        let nz = noise(
            (frameCount + this.randN * 2 + 200) / (dN + 20),
            this.randN + 20
        );
        this.z += map(nz, 0, 1, -0.2, 0.2);

        this.mouseRepel();
        this.checkBoundaries();
    }

    mouseRepel() {
        let d = dist(this.x, this.y, mouseX, mouseY);

        // if (this.isFlying === false) {
        //     if (d < 150) {
        //         this.clicked();
        //     }
        // }

        if (d < 150) {
            let ang = atan2(mouseY - this.y, mouseX - this.x);
            this.x -= 10 * cos(ang);
            this.y -= 10 * sin(ang);
        }
    }

    clicked() {
        this.isFlying = true;
        this.isLanding = false;
        this.flyTime = millis() - random(5000);
    }
}