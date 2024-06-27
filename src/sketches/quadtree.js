const MAX_DEPTH = 5;

class QuadTree {
  /**
   * A QuadTree class to speed up boid
   * interactions.
   */

  constructor(p, points, centre, size, depth=0, maxLeafPoints=2){
    this.p = p;
    this.centre = centre;
    this.size = size;
    this.depth = depth;
    this.isLeaf = false;
    this.maxLeafPoints = maxLeafPoints;
    this.children = [];
    this.points = [];
    for (let i = 0; i < points.length; i++){
      if (this.inBox(points[i],this.centre,this.size/2)){
        this.points.push(points[i]);
      }
    }
    if (this.points.length > maxLeafPoints && this.depth < MAX_DEPTH){
      for (let i = 0; i < 4; i++){
        let childCentre = this.computeChild(i);
        let childSize = this.size/2;
        let child = new QuadTree(p, this.points, childCentre, childSize,
                             this.depth + 1, this.maxLeafPoints);
        this.children.push(child);
      }
    }else{
      this.isLeaf = true;
    }
  }

  inBox(point, centre, size){
    let x = point.position.x;
    let y = point.position.y;
    let bottom = centre.y - size;
    let top = centre.y + size;
    let left = centre.x - size;
    let right = centre.x + size;
    return y >= bottom && y < top && x >= left && x < right;
  }

  computeChild(i){
    const { p } = this;
    let size = this.size/4;
    let x = this.centre.x;
    let y = this.centre.y;
    var childCentre;
    if (i == 0){
      childCentre = p.createVector(x-size,y-size);
    }else if (i == 1){
      childCentre = p.createVector(x-size,y+size);
    }else if (i == 2){
      childCentre = p.createVector(x+size,y-size);
    }else if (i == 3){
      childCentre = p.createVector(x+size,y+size);
    }
    return childCentre;
  }



  show(){
    const { p } = this;
    p.stroke(255);
    p.noFill();
    p.rectMode(p.CENTER);
    p.rect(this.centre.x,this.centre.y,this.size);
    if (!this.isLeaf){
      for (let child of this.children){
        child.show();
      }
    }
  }


}

module.exports = QuadTree;
