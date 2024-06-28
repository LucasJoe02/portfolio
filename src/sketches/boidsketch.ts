const Boid = require('./boid');
const QuadTree = require('./quadtree');

export const boidsliders = [
    { title: 'Separation', id: 'separation-slider' },
    { title: 'Alignment', id: 'alignment-slider' },
    { title: 'Cohesion', id: 'cohesion-slider' },
    { title: 'Boids', id: 'boids-slider' },
];

export const boidsketch = (p: {
    setup: () => void;
    createCanvas: (width: number, height: number) => any;
    createSlider: (min: number, max: number, value: number, step: number) => any;
    createVector: (x: number, y: number) => any; width: number; height: number;
    draw: () => void; 
    background: (color: number) => void;
}) => {
    const flock: any[] = [];

    let sliders: any[] = [];

    let tree;

    p.setup = () => {
        let canvasWidth = window.innerWidth < 600 ? window.innerWidth * 0.9 : 400; // Adjust dimensions for mobile
        let canvasHeight = window.innerWidth < 600 ? window.innerHeight * 0.35 : 400; // Adjust dimensions for mobile
        let canvas = p.createCanvas(canvasWidth, canvasHeight);

        canvas.parent('sketch-container'); // Assign canvas to a div with id 'sketch-container'

        let separationSlider = p.createSlider(0, 5, 1, 0.1); // Separation slider
        separationSlider.parent('separation-slider');

        let alignmentSlider = p.createSlider(0, 5, 1, 0.1); // Alignment slider
        alignmentSlider.parent('alignment-slider');

        let cohesionSlider = p.createSlider(0, 5, 1, 0.1); // Cohesion slider
        cohesionSlider.parent('cohesion-slider');

        let boidsSlider = p.createSlider(0, 100, 5, 1); // Boids slider
        boidsSlider.parent('boids-slider');

        sliders.push(separationSlider, alignmentSlider, cohesionSlider, boidsSlider);

        for (let i = 0; i < sliders[3].value(); i++) {
            flock.push(new Boid(p, sliders));
        }
        tree = new QuadTree(p, flock, p.createVector(p.width/2,p.height/2), p.width);
    };

    function overlaps(child: { centre: any; size: number; },searchWindow: { centre: any; size: number; }){
        let isOverlapping = true;
        let chCe = child.centre;
        let chSi = child.size/2;
        let seCe = searchWindow.centre;
        let seSi = searchWindow.size/2;
        if (chCe.x-chSi > seCe.x+seSi || chCe.x+chSi <= seCe.x-seSi ||
        chCe.y-chSi > seCe.y+seSi || chCe.y+chSi <= seCe.y-seSi){
            isOverlapping = false;
        }
        return isOverlapping;
    }

    function query(node: { isLeaf: any; points: any; inBox: (arg0: any, arg1: any, arg2: number) => any; children: any; }, searchWindow: { centre: any; size: any; }){
        if (node.isLeaf){
            let matches = [];
            for (let point of node.points){
                if (node.inBox(point, searchWindow.centre, searchWindow.size/2)){
                    matches.push(point);
                }
            }
        return matches;
        }else{
            let matches: any[] = [];
            for (let child of node.children){
                if (overlaps(child, searchWindow)){
                    matches = matches.concat(query(child,searchWindow));
                }
            }
        return matches;
        }
    }

    p.draw = () => {
        p.background(51);
        tree = new QuadTree(p,flock,p.createVector(p.width/2,p.height/2),p.width);
        // tree.show();
        let boidChange = sliders[3].value()-flock.length;
        if (boidChange > 0){
            flock.push(new Boid(p, sliders));
        }else if (boidChange < 0){
            flock.pop()
        }

        for (let boid of flock) {
            // if (flock[0]==boid){
            //   p.stroke(255);
            //   p.noFill();
            //   p.rectMode(p.CENTER);
            //   p.rect(boid.position.x,boid.position.y,100);
            // }
            boid.edges();
            let closeBoids = query(tree,{centre:p.createVector(boid.position.x,boid.position.y),size:100});
            boid.flock(closeBoids);
            boid.update();
            boid.show();
        }
    };
};
