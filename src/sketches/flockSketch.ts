// // import { Flock, Boid } from '../mice/Flock.js';

// let flock: Flock;

// function setup() {
//     createCanvas(640, 360);

//     // flock = new Flock();
//     // Add an initial set of boids into the system
//     for (let i = 0; i < 100; i++) {
//         let b = new Boid(width / 2, height / 2);
//         flock.addBoid(b);
//     }
// }

// function draw() {
//     background(51);
//     flock.run(this);
// }

// // Add a new boid into the System
// function mouseDragged() {
//     flock.addBoid(new Boid(mouseX, mouseY));
// }