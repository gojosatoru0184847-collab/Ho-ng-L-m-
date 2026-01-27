import { MathEx } from '../core/MathEx.js';

export class Camera2D {
  constructor(){
    this.x=0; this.y=0;
    this.zoom=1;
    this.shake=0;
    this._sx=0; this._sy=0;
  }
  applyShake(intensity){ this.shake = Math.min(1, this.shake + intensity); }
  step(dt){
    // decays; jitter with smooth noise
    this.shake = Math.max(0, this.shake - dt*1.8);
    const n = MathEx.fbm(performance.now()*0.001, 13.37, 3);
    const a = this.shake * 10;
    this._sx = (n-0.5)*2*a;
    this._sy = (MathEx.fbm(5.1, performance.now()*0.001, 3)-0.5)*2*a;
  }
  viewParams(){
    return { x:this.x+this._sx, y:this.y+this._sy, zoom:this.zoom };
  }
}
