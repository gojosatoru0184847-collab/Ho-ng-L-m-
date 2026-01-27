// Creates procedural demo textures (albedo + normal) and manages GL textures.
export class TextureManager {
  constructor(gl){ this.gl=gl; this._map=new Map(); }

  createFromCanvas(key, canvas, {mip=true}={}){
    const gl=this.gl;
    const tex=gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, mip?gl.LINEAR_MIPMAP_LINEAR:gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    if(mip) gl.generateMipmap(gl.TEXTURE_2D);
    this._map.set(key, tex);
    return tex;
  }

  get(key){ return this._map.get(key); }

  static makeHiResSprite(size=256){
    const c=document.createElement('canvas');
    c.width=c.height=size;
    const g=c.getContext('2d');
    g.clearRect(0,0,size,size);
    // vector-like high-res shape
    const cx=size/2, cy=size/2;
    const grad=g.createRadialGradient(cx,cy,4,cx,cy,size/2);
    grad.addColorStop(0,'rgba(255,255,255,1)');
    grad.addColorStop(0.4,'rgba(80,180,255,1)');
    grad.addColorStop(1,'rgba(10,20,40,0)');
    g.fillStyle=grad;
    g.beginPath();
    g.arc(cx,cy,size*0.38,0,Math.PI*2);
    g.fill();
    // inner emblem
    g.strokeStyle='rgba(255,255,255,.85)';
    g.lineWidth=size*0.02;
    g.beginPath();
    g.moveTo(cx-size*0.12, cy);
    g.lineTo(cx, cy-size*0.16);
    g.lineTo(cx+size*0.14, cy+size*0.12);
    g.stroke();
    return c;
  }

  static makeNormalFromHeight(heightCanvas){
    const s=heightCanvas.width;
    const hc=heightCanvas.getContext('2d');
    const img=hc.getImageData(0,0,s,s);
    const out=document.createElement('canvas');
    out.width=out.height=s;
    const oc=out.getContext('2d');
    const oimg=oc.createImageData(s,s);
    const h=(x,y)=>{
      x=Math.max(0,Math.min(s-1,x));
      y=Math.max(0,Math.min(s-1,y));
      return img.data[(y*s+x)*4]/255;
    };
    for(let y=0;y<s;y++){
      for(let x=0;x<s;x++){
        const dx = (h(x+1,y)-h(x-1,y))*2;
        const dy = (h(x,y+1)-h(x,y-1))*2;
        // normal = normalize([-dx,-dy,1])
        let nx=-dx, ny=-dy, nz=1;
        const inv=1/Math.hypot(nx,ny,nz);
        nx*=inv; ny*=inv; nz*=inv;
        const i=(y*s+x)*4;
        oimg.data[i+0]=Math.round((nx*0.5+0.5)*255);
        oimg.data[i+1]=Math.round((ny*0.5+0.5)*255);
        oimg.data[i+2]=Math.round((nz*0.5+0.5)*255);
        oimg.data[i+3]=255;
      }
    }
    oc.putImageData(oimg,0,0);
    return out;
  }
}
