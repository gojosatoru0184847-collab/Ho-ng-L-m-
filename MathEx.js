// Small fast math helpers used across renderer/anim/vfx.
export const MathEx = {
  clamp:(v,a,b)=>Math.max(a,Math.min(b,v)),
  lerp:(a,b,t)=>a+(b-a)*t,
  invLerp:(a,b,v)=> (v-a)/(b-a),
  smoothstep:(a,b,v)=>{
    const t = MathEx.clamp((v-a)/(b-a),0,1);
    return t*t*(3-2*t);
  },
  // Hash-based value noise (fast, not perfect but good enough for VFX drift).
  hash2:(x,y)=>{
    const s = Math.sin(x*127.1 + y*311.7)*43758.5453123;
    return s - Math.floor(s);
  },
  // 2D value noise with bilinear interpolation.
  vnoise:(x,y)=>{
    const xi = Math.floor(x), yi = Math.floor(y);
    const xf = x - xi, yf = y - yi;
    const a = MathEx.hash2(xi,yi);
    const b = MathEx.hash2(xi+1,yi);
    const c = MathEx.hash2(xi,yi+1);
    const d = MathEx.hash2(xi+1,yi+1);
    const u = xf*xf*(3-2*xf);
    const v = yf*yf*(3-2*yf);
    return MathEx.lerp(MathEx.lerp(a,b,u), MathEx.lerp(c,d,u), v);
  },
  // Cheap fractal noise
  fbm:(x,y,oct=4)=>{
    let f=0, amp=0.5, fx=x, fy=y;
    for(let i=0;i<oct;i++){
      f += amp * MathEx.vnoise(fx,fy);
      fx*=2; fy*=2;
      amp*=0.5;
    }
    return f;
  }
};
