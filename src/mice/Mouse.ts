// base class for mouse
class Mouse {

    x: number;
    y: number;
    z: number;
   
    h = 12;
    w = 12;
    stemH = this.h * .55;

    minScale : number;
    maxScale : number;

    constructor(x = 0, y= 0, z= .85) {
        this.x = x;
        this.y = y;
        this.z = z;

        this.minScale = .1;
        this.maxScale = 10000;
    }

    display() {
        push();
        translate(this.x, this.y);
        scale(this.z);
        fill(0);
        strokeWeight(1.2);
        stroke(255);
        beginShape();
        vertex(0, 0);
        vertex(this.w, this.h);

        // stem
        vertex(this.w * .56, this.h * .99);
        vertex(this.w * .83, this.h + this.stemH);
        vertex(this.w * .55, this.h + this.stemH * 1.25);
        vertex(this.w * .3, this.h * 1.1);
        vertex(0, this.h * 1.4);
        vertex(0, 0);
        endShape();
        pop();
    }

    checkBoundaries() {
        if (this.x < 0) {
            this.x += width;
        }
        this.x %= width;
        if (this.y < 0) {
            this.y += height;
        }
        this.y %= height;
        //
        if (this.z < this.minScale) this.z = this.minScale;
        if (this.z > this.maxScale) this.z = this.maxScale;
    }
   
}