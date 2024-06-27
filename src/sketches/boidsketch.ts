const Boid = require('./boid');
const QuadTree = require('./quadtree');

export const boidsketch = (p) => {
    const flock = [];

    let sliders = [];

    let alignSlider, cohesionSlider, seperationSlider, boidsSlider;

    var tree;

    function resetTree(){
        // tree = new QuadTree(p,flock,createVector(p.width/2,p.height/2),p.width);
    }

    p.setup = () => {
        let canvas = p.createCanvas(400, 400);
        canvas.parent('sketch-container'); // Assign canvas to a div with id 'sketch-container'

        sliders.push(p.createSlider(0, 5, 1, 0.1)); // Separation slider
        sliders.push(p.createSlider(0, 5, 1, 0.1)); // Alignment slider
        sliders.push(p.createSlider(0, 5, 1, 0.1)); // Cohesion slider
        sliders.push(p.createSlider(0, 100, 5, 1)); // Boids slider

        for (let i = 0; i < sliders.length; i++) {
            sliders[i].parent('sliders-container'); // Assign each slider to slidersContainer div
            sliders[i].style('display',); // Ensure each slider is displayed in a new line
        }

        for (let i = 0; i < sliders[3].value(); i++) {
            flock.push(new Boid(p, sliders));
        }
        tree = new QuadTree(p, flock, p.createVector(p.width/2,p.height/2), p.width);
        // setInterval(resetTree,100);
        // noLoop();
    };

    function overlaps(child,searchWindow){
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

    function query(node, searchWindow){
        if (node.isLeaf){
            var matches = [];
            for (let point of node.points){
                if (node.inBox(point, searchWindow.centre, searchWindow.size/2)){
                    matches.push(point);
                }
            }
        return matches;
        }else{
            var matches = [];
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
            // let closeBoids = flock
            let closeBoids = query(tree,{centre:p.createVector(boid.position.x,boid.position.y),size:100});
            boid.flock(closeBoids);
            boid.update();
            boid.show();
        }
    };
};
