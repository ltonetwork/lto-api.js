class Animal {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
  move(distance) {
    console.log(`${this.name} moved ${distance}m.`);
  }
}
 
class Snake extends Animal {
  constructor(name: string) {
    super(name);
  }
  move(distance = 5) {
    console.log("Slithering...");
    super.move(distance);
  }
}
 
class Horse extends Animal {
  constructor(name: string) {
    super(name);
  }
  move(distanceInMeters = 45) {
    console.log("Galloping...");
    super.move(distanceInMeters);
  }
}
 
let sam = new Snake("Sammy the Python");
let tom: Animal = new Horse("Tommy the Palomino");
 
sam.move();
tom.move(34);