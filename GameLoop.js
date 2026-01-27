export class GameLoop {
  constructor({step, render, targetHz=120}){
    this.step = step;
    this.render = render;
    this.targetHz = targetHz;
    this._prev = performance.now();
    this._acc = 0;
    this._fixed = 1/this.targetHz;
    this._running = false;
    this._capHz = 120;
  }
  setFixedHz(hz){
    this._capHz = hz;
    this._fixed = 1/hz;
  }
  start(){
    if(this._running) return;
    this._running = true;
    this._prev = performance.now();
    const tick = (now)=>{
      if(!this._running) return;
      const dt = Math.min(0.05, (now - this._prev)/1000);
      this._prev = now;
      this._acc += dt;
      // Fixed update: deterministic & stable for physics/particles.
      let n=0;
      while(this._acc >= this._fixed && n<6){
        this.step(this._fixed);
        this._acc -= this._fixed;
        n++;
      }
      const alpha = this._acc / this._fixed;
      this.render(alpha);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
  stop(){ this._running = false; }
}
