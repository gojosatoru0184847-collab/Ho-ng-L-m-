export class Time {
  constructor(){
    this.t = 0;
    this.dt = 0;
    this.smoothDt = 1/60;
    this.frame = 0;
    this.fps = 60;
    this._acc = 0;
    this._count = 0;
  }
  step(now, prev){
    const raw = Math.min(0.05, Math.max(0, (now - prev) / 1000));
    this.dt = raw;
    this.smoothDt = this.smoothDt * 0.9 + raw * 0.1;
    this.t += raw;
    this.frame++;
    this._acc += raw;
    this._count++;
    if(this._acc >= 0.5){
      this.fps = Math.round(this._count / this._acc);
      this._acc = 0;
      this._count = 0;
    }
  }
}
