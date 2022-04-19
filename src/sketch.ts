
// import Mouse from '../mice/Mouse';

let flyMouse: zFly;
let drunkMouse: zDrunk;
let flock: Flock;

function setup() {
  createCanvas(windowWidth, windowHeight);

  flock = new Flock();
  for (let i = 0; i < 100; i++) {
    let b = new Boid(width / 2, height / 2);
    flock.addBoid(b);
  }
  flyMouse = new zFly();
  drunkMouse = new zDrunk();

  noCursor();
}
function draw() {
  // drawingContext.shadowOffsetX = 1;
  // drawingContext.shadowOffsetY = 1;
  // drawingContext.shadowBlur = 4;
  // drawingContext.shadowColor = 'rgba(0, 0, 0, .3)';

  // background(220);
  // flyMouse.display();
  // flyMouse.fly();

  // flock.run();

  background(255, 10);
  drunkMouse.display();
  drunkMouse.move();
}
