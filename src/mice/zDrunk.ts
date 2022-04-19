// import Mouse from './Mouse.js';

// import p5 from "p5";
// import Mouse from './Mouse';

interface point {
    x: number;
    y: number;
}

class zDrunk extends Mouse {



    constructor() {
        super(random(width), random(height), random(0.7, 1.2))
    }

    display() {
        push();
        translate(120*cos(frameCount/20), 130*sin(frameCount/20));
        super.display();
        pop();
    }

    move() {
        let amt = .03;
       this.x = this.x *(1-amt) + mouseX*amt;
       this.y = this.y *(1-amt) + mouseY*amt;
    }

  
}