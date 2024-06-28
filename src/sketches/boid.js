import p5 from 'p5'

class Boid {
  constructor(p, sliders) {
    this.p = p;
    this.seperationSlider = sliders[0];
    this.alignSlider = sliders[1];
    this.cohesionSlider = sliders[2];

    this.position = p.createVector(p.random(p.width), p.random(p.height));
    this.velocity = p5.Vector.random2D();
    this.velocity.setMag(p.random(2,4));
    this.acceleration = p.createVector();
    this.maxForce = 0.2;
    this.maxSpeed = 4;
  }

  edges() {
    const { p } = this;
    if (this.position.x > p.width) {
      this.position.x = 0;
    } else if (this.position.x < 0) {
      this.position.x = p.width;
    }
    if (this.position.y > p.height) {
      this.position.y = 0;
    } else if (this.position.y < 0) {
      this.position.y = p.height;
    }
  }

  interact(boids){
    const { p } = this;
    let perceptionRadius = 100;
    let alignment = p.createVector();
    let seperation = p.createVector();
    let cohesion = p.createVector();
    let total = 0;
    for (let other of boids) {
      let d = p.dist(
        this.position.x,
        this.position.y,
        other.position.x,
        other.position.y
      );
      if (other != this && d < perceptionRadius){
        let diff = p5.Vector.sub(this.position, other.position);
        diff.div(d**2);
        alignment.add(other.velocity);
        seperation.add(diff);
        cohesion.add(other.position);
        total++;
      }
    }
    if (total > 0){
      alignment.div(total);
      alignment.setMag(this.maxSpeed)
      alignment.sub(this.velocity);
      alignment.limit(this.maxForce);

      seperation.div(total);
      seperation.setMag(this.maxSpeed)
      seperation.sub(this.velocity);
      seperation.limit(this.maxForce);

      cohesion.div(total);
      cohesion.sub(this.position);
      cohesion.setMag(this.maxSpeed)
      cohesion.sub(this.velocity);
      cohesion.limit(this.maxForce);
    }
    return {seperation, alignment, cohesion};
  }

  flock(boids) {
    let interactions = this.interact(boids);
    let seperation = interactions.seperation;
    let alignment = interactions.alignment;
    let cohesion = interactions.cohesion;

    seperation.mult(this.seperationSlider.value());
    alignment.mult(this.alignSlider.value());
    cohesion.mult(this.cohesionSlider.value());

    this.acceleration.add(seperation);
    this.acceleration.add(alignment);
    this.acceleration.add(cohesion);
  }

  update() {
    this.position.add(this.velocity);
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.acceleration.mult(0)
  }

  show() {
    const { p } = this;
    p.strokeWeight(8);
    p.stroke(255);
    p.point(this.position.x, this.position.y);
  }
}

module.exports = Boid;
