import { MathEx } from '../core/MathEx.js';

export class ParticleSystem {
  constructor(max=12000){
    this.max=max;
    this.n=0;
    // SoA
    this.x=new Float32Array(max);
    this.y=new Float32Array(max);
    this.vx=new Float32Array(max);
    this.vy=new Float32Array(max);
    this.ax=new Float32Array(max);
    this.ay=new Float32Array(max);
    this.life=new Float32Array(max);
    this.mass=new Float32Array(max);
    this.drag=new Float32Array(max);
    this.bounce=new Float32Array(max);
    this.size=new Float32Array(max);
    this.r=new Float32Array(max);
    this.g=new Float32Array(max);
    this.b=new Float32Array(max);
    this.a=new Float32Array(max);
  }

  spawnBurst(px,py, count=180){
    for(let i=0;i<count;i++){
      this.spawnOne(px,py);
    }
  }

  spawnOne(px,py){
    if(this.n>=this.max) return;
    const i=this.n++;
    this.x[i]=px; this.y[i]=py;
    const ang=Math.random()*Math.PI*2;
    const sp= 40 + Math.random()*260;
    this.vx[i]=Math.cos(ang)*sp;
    this.vy[i]=Math.sin(ang)*sp - 80;
    this.ax[i]=0;
    this.ay[i]= 420; // gravity
    this.life[i]= 0.8 + Math.random()*1.2;
    this.mass[i]= 0.7 + Math.random()*1.3;
    this.drag[i]= 0.06 + Math.random()*0.12;
    this.bounce[i]= 0.35 + Math.random()*0.35;
    this.size[i]= 6 + Math.random()*10;

    // fiery palette using noise
    const t = MathEx.fbm(px*0.02, py*0.02, 3);
    this.r[i]= 1.0;
    this.g[i]= 0.35 + t*0.35;
    this.b[i]= 0.10 + t*0.10;
    this.a[i]= 0.9;
  }

  step(dt){
    const groundY = 338;
    let write=0;
    for(let i=0;i<this.n;i++){
      let life = this.life[i] - dt;
      if(life<=0) continue;

      let vx=this.vx[i], vy=this.vy[i];
      const drag=this.drag[i];
      // semi-implicit Euler
      vx += this.ax[i]*dt;
      vy += this.ay[i]*dt;
      vx *= (1 - drag);
      vy *= (1 - drag);

      let x=this.x[i] + vx*dt;
      let y=this.y[i] + vy*dt;

      // bounce vs environment (ground)
      if(y>groundY){
        y=groundY;
        vy = -vy*this.bounce[i];
        vx *= 0.85;
      }

      // compact
      this.x[write]=x; this.y[write]=y;
      this.vx[write]=vx; this.vy[write]=vy;
      this.ax[write]=this.ax[i]; this.ay[write]=this.ay[i];
      this.life[write]=life;
      this.mass[write]=this.mass[i];
      this.drag[write]=this.drag[i];
      this.bounce[write]=this.bounce[i];
      this.size[write]=this.size[i];
      this.r[write]=this.r[i];
      this.g[write]=this.g[i];
      this.b[write]=this.b[i];
      this.a[write]=this.a[i] * (life/1.6);
      write++;
    }
    this.n=write;
  }

  draw(renderer){
    for(let i=0;i<this.n;i++){
      renderer.submitSprite('vfx', {
        x:this.x[i], y:this.y[i],
        w:this.size[i], h:this.size[i],
        rot:0,
        rgba:[this.r[i],this.g[i],this.b[i],this.a[i]],
        normalMix:0.0,
      });
    }
  }
}
