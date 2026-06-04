import p5 from 'p5';

type Color = [number, number, number, number];

const BACKGROUND_COLOR: Color = [100, 200, 255, 30];

class Camera {
  x: number; y: number; z: number;
  vw: number; vh: number; d: number;

  constructor(x: number, y: number, z: number, vw: number, vh: number, d: number) {
    this.x = x; this.y = y; this.z = z;
    this.vw = vw; this.vh = vh; this.d = d;
  }

  getPos(p: p5): p5.Vector {
    return p.createVector(this.x, this.y, this.z);
  }
}

class Light {
  private type: string;
  private intensity: number;
  details: p5.Vector;

  constructor(type: string, intensity: number, details: p5.Vector) {
    this.type = type;
    this.intensity = intensity;
    this.details = details;
  }

  getType() { return this.type; }
  getIntensity() { return this.intensity; }
  getPosition() { return this.details; }
  getDirection() { return this.details; }
}

class Sphere {
  private x: number; private y: number; private z: number;
  private r: number;
  private col: Color;
  private specular: number;

  constructor(x: number, y: number, z: number, r: number, col: Color, spec: number) {
    this.x = x; this.y = y; this.z = z;
    this.r = r; this.col = col; this.specular = spec;
  }

  getColor() { return this.col; }
  getRadius() { return this.r; }
  getCenter(p: p5) { return p.createVector(this.x, this.y, this.z); }
  getSpecularity() { return this.specular; }
}

class Scene {
  private spheres: Sphere[];
  private lightList: Light[];
  pointLight: Light;

  constructor(p: p5) {
    this.spheres = [
      new Sphere(0, -1, 3, 1, [255, 0, 0, 255], 500),
      new Sphere(2, 0, 4, 1, [0, 255, 0, 255], 500),
      new Sphere(-1, 0, 5, 1, [0, 0, 255, 255], 10),
      new Sphere(0, -5001, 0, 5000, [255, 255, 0, 255], 1000),
    ];
    this.pointLight = new Light('point', 0.6, p.createVector(2, 1, 0));
    this.lightList = [
      new Light('ambient', 0.2, p.createVector(0, 0, 0)),
      this.pointLight,
      new Light('directional', 0.2, p.createVector(1, 4, 4)),
    ];
  }

  getSpheres() { return this.spheres; }
  getLights() { return this.lightList; }
}

export const raytracersliders: { title: string; id: string }[] = [
  { title: 'Light X', id: 'light-x-slider' },
  { title: 'Light Y', id: 'light-y-slider' },
];

export const raytracersketch = (p: p5) => {
  let cam: Camera;
  let scene: Scene;
  let lightXSlider: any;
  let lightYSlider: any;
  let prevLightX: number;
  let prevLightY: number;

  function canvasToViewport(x: number, y: number): p5.Vector {
    return p.createVector(
      (x - p.width / 2) * cam.vw / p.width,
      (p.height / 2 - y) * cam.vh / p.height,
      cam.d
    );
  }

  function computeLighting(P: p5.Vector, N: p5.Vector, V: p5.Vector, s: number): number {
    let intensity = 0.0;
    for (const lgt of scene.getLights()) {
      if (lgt.getType() === 'ambient') {
        intensity += lgt.getIntensity();
      } else {
        const L: p5.Vector = lgt.getType() === 'point'
          ? lgt.getPosition().copy().sub(P)
          : lgt.getDirection();

        const nDotL = N.dot(L);
        if (nDotL > 0) {
          intensity += lgt.getIntensity() * nDotL / (N.mag() * L.mag());
        }

        if (s !== -1) {
          const R = N.copy().mult(2 * nDotL).sub(L);
          const rDotV = R.dot(V);
          if (rDotV > 0) {
            intensity += lgt.getIntensity() * Math.pow(rDotV / (R.mag() * V.mag()), s);
          }
        }
      }
    }
    return intensity;
  }

  function intersectRaySphere(D: p5.Vector, sph: Sphere): [number, number] {
    const r = sph.getRadius();
    const O = cam.getPos(p);
    const CO = O.copy().sub(sph.getCenter(p));
    const a = D.dot(D);
    const b = 2 * CO.dot(D);
    const c = CO.dot(CO) - r * r;
    const discriminant = b * b - 4 * a * c;
    if (discriminant < 0) return [Infinity, Infinity];
    const t1 = (-b + Math.sqrt(discriminant)) / (2 * a);
    const t2 = (-b - Math.sqrt(discriminant)) / (2 * a);
    return [t1, t2];
  }

  function traceRay(D: p5.Vector, tMin: number, tMax: number): Color {
    let closestT = Infinity;
    let closestSphere: Sphere | null = null;

    for (const sph of scene.getSpheres()) {
      const [t1, t2] = intersectRaySphere(D, sph);
      if (tMin < t1 && t1 < tMax && t1 < closestT) { closestT = t1; closestSphere = sph; }
      if (tMin < t2 && t2 < tMax && t2 < closestT) { closestT = t2; closestSphere = sph; }
    }

    if (!closestSphere) return BACKGROUND_COLOR;

    const P = cam.getPos(p).add(D.copy().mult(closestT));
    const N = P.copy().sub(closestSphere.getCenter(p)).normalize();

    const lightIntensity = computeLighting(P, N, D.copy().mult(-1), closestSphere.getSpecularity());
    return closestSphere.getColor().map(x => x * lightIntensity) as Color;
  }

  function display() {
    p.loadPixels();
    for (let x = 0; x < p.width; x++) {
      for (let y = 0; y < p.height; y++) {
        const D = canvasToViewport(x, y);
        const col = traceRay(D, 1, Infinity);
        const index = (x + y * p.width) * 4;
        p.pixels[index]     = col[0];
        p.pixels[index + 1] = col[1];
        p.pixels[index + 2] = col[2];
        p.pixels[index + 3] = col[3];
      }
    }
    p.updatePixels();
  }

  p.setup = () => {
    const canvas = p.createCanvas(250, 250);
    canvas.parent('sketch-container');
    p.pixelDensity(1);

    lightXSlider = p.createSlider(-3, 3, 2, 0.1);
    lightXSlider.parent('light-x-slider');
    lightYSlider = p.createSlider(-3, 3, 1, 0.1);
    lightYSlider.parent('light-y-slider');

    prevLightX = lightXSlider.value();
    prevLightY = lightYSlider.value();

    cam = new Camera(0, 0, 0, 1, 1, 1);
    scene = new Scene(p);
    display();
  };

  p.draw = () => {
    const lx: number = lightXSlider.value();
    const ly: number = lightYSlider.value();
    if (lx !== prevLightX || ly !== prevLightY) {
      prevLightX = lx;
      prevLightY = ly;
      scene.pointLight.details.set(lx, ly, 0);
      display();
    }
  };
};
