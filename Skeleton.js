import { MathEx } from '../core/MathEx.js';

export class Bone {
  constructor(name, len=40){
    this.name=name;
    this.len=len;
    this.x=0; this.y=0;
    this.rot=0;
    this.sx=1; this.sy=1;
    this.parent=null;
    this.children=[];
  }
}

export class Skeleton {
  constructor(){
    this.bones=[];
    this.map=new Map();
  }
  addBone(name, len, parentName=null){
    const b=new Bone(name, len);
    if(parentName){
      const p=this.map.get(parentName);
      b.parent=p;
      p.children.push(b);
    }
    this.bones.push(b);
    this.map.set(name,b);
    return b;
  }
  // squash & stretch based on speed/phase
  applySquashStretch(rootName, phase, amount=0.15){
    const b=this.map.get(rootName);
    if(!b) return;
    const s = 1 + Math.sin(phase)*amount;
    b.sx = 1/s;
    b.sy = s;
  }
  // forward kinematics: compute absolute transform for each bone.
  solveFK(){
    for(const b of this.bones){
      if(!b.parent) continue;
      // anchor at parent tip
      const p=b.parent;
      const px = p.x + Math.cos(p.rot) * p.len;
      const py = p.y + Math.sin(p.rot) * p.len;
      b.x = px;
      b.y = py;
    }
  }
}
