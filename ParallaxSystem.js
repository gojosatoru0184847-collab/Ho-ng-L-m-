import { MathEx } from '../core/MathEx.js';

export class ParallaxSystem {
  constructor(){
    this.layers=[];
    for(let i=0;i<10;i++){
      const depth = (i+1)/10;
      this.layers.push({
        depth,
        blur: MathEx.smoothstep(0.4, 1.0, depth)*0.4,
        tint: [0.2+depth*0.2, 0.3+depth*0.25, 0.45+depth*0.2, 0.85],
      });
    }
  }

  draw(renderer, camera){
    const v=camera.viewParams();
    for(let i=0;i<this.layers.length;i++){
      const L=this.layers[i];
      // big soft panels as background slices
      const baseY = 180 + i*10;
      const x = 320 + (-v.x*0.05*L.depth);
      renderer.submitSprite('bg', {
        x, y: baseY,
        w: 1200, h: 160,
        rot: 0,
        rgba: [L.tint[0],L.tint[1],L.tint[2],L.tint[3]],
        normalMix: 0.0,
      });
    }
  }
}
