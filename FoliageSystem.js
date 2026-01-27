import { MathEx } from '../core/MathEx.js';

export class FoliageSystem {
  constructor(count=180){
    this.blades=[];
    for(let i=0;i<count;i++){
      const x = 80 + Math.random()*1000;
      const y = 338 + (Math.random()-0.5)*2;
      this.blades.push({x,y,phase:Math.random()*10, bend:0});
    }
  }
  step(dt, playerX, playerY, windT){
    for(const b of this.blades){
      const dx=b.x-playerX;
      const near = MathEx.clamp(1 - Math.abs(dx)/60, 0, 1);
      const wind = Math.sin(windT*1.8 + b.phase)*0.35;
      b.bend = wind + near*0.8;
    }
  }
  draw(renderer){
    for(const b of this.blades){
      renderer.submitSprite('world', {
        x:b.x, y:b.y,
        w: 10, h: 36,
        rot: b.bend*0.6,
        rgba:[0.45,0.95,0.6,0.9],
        normalMix: 0.4,
      });
    }
  }
}
