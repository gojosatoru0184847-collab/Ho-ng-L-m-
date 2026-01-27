import { ShaderProgram } from '../gl/ShaderProgram.js';

const VS = `#version 300 es
precision highp float;
layout(location=0) in vec2 aPos;
layout(location=1) in vec2 iTranslate;
layout(location=2) in vec2 iScale;
layout(location=3) in float iRot;
layout(location=4) in vec4 iColor;
layout(location=5) in vec4 iUV;
layout(location=6) in float iNormalMix;

uniform vec2 uResolution;
uniform vec2 uCamPos;
uniform float uZoom;

out vec2 vUV;
out vec4 vColor;
out float vNormalMix;

mat2 rot(float a){ float s=sin(a), c=cos(a); return mat2(c,-s,s,c); }

void main(){
  vec2 p = aPos;
  p = rot(iRot) * (p * iScale);
  p += iTranslate;
  p = (p - uCamPos) * uZoom;

  vec2 clip = (p / uResolution) * 2.0;
  // center origin
  clip.x -= 1.0;
  clip.y = 1.0 - clip.y;

  gl_Position = vec4(clip, 0.0, 1.0);

  // map quad pos [-0.5..0.5] -> uv rect
  vec2 q = aPos + 0.5;
  vUV = mix(iUV.xy, iUV.zw, q);
  vColor = iColor;
  vNormalMix = iNormalMix;
}`;

const FS = `#version 300 es
precision highp float;

in vec2 vUV;
in vec4 vColor;
in float vNormalMix;

uniform sampler2D uAlbedo;
uniform sampler2D uNormal;

// Lights (forward)
uniform int uLightCount;
uniform vec3 uLightPos[8];   // xy in pixels, z = radius
uniform vec3 uLightCol[8];   // rgb intensity
uniform float uAmbient;

out vec4 outColor;

void main(){
  vec4 al = texture(uAlbedo, vUV) * vColor;
  if(al.a < 0.01) discard;

  vec3 n = texture(uNormal, vUV).xyz * 2.0 - 1.0;
  n = normalize(mix(vec3(0.0,0.0,1.0), n, vNormalMix));

  // approximate world pos in screen: not exact but stable for 2D forward lighting
  // We hack by using gl_FragCoord as screen position.
  vec2 P = gl_FragCoord.xy;

  vec3 lightSum = vec3(uAmbient);
  for(int i=0;i<8;i++){
    if(i>=uLightCount) break;
    vec2 L = uLightPos[i].xy - P;
    float dist = length(L);
    float radius = uLightPos[i].z;
    float att = clamp(1.0 - dist/radius, 0.0, 1.0);
    // soft-ish falloff
    att = att*att;

    vec3 ldir = normalize(vec3(L, 120.0));
    float ndl = max(dot(n, ldir), 0.0);
    lightSum += uLightCol[i] * (ndl * att);
  }

  vec3 rgb = al.rgb * lightSum;
  outColor = vec4(rgb, al.a);
}`;

export class SpriteBatch {
  /** @param {WebGL2RenderingContext} gl */
  constructor(gl, stateCache, maxInstances=20000){
    this.gl = gl;
    this.state = stateCache;
    this.max = maxInstances;
    this.count = 0;

    this.shader = new ShaderProgram(gl, VS, FS);

    // quad
    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);

    const quad = new Float32Array([
      -0.5,-0.5,
       0.5,-0.5,
      -0.5, 0.5,
       0.5, 0.5,
    ]);
    this.vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    // instance buffer
    // layout: translate(2), scale(2), rot(1), color(4), uv(4), normalMix(1) = 14 floats
    this.strideFloats = 14;
    this.instanceData = new Float32Array(this.max * this.strideFloats);
    this.ibo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.ibo);
    gl.bufferData(gl.ARRAY_BUFFER, this.instanceData.byteLength, gl.DYNAMIC_DRAW);

    let loc = 1;
    const setAttr = (size, divisor)=>{
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, this.strideFloats*4, (this._off*4));
      gl.vertexAttribDivisor(loc, divisor);
      loc++; this._off += size;
    };
    this._off = 0;
    setAttr(2,1); // translate
    setAttr(2,1); // scale
    setAttr(1,1); // rot
    setAttr(4,1); // color
    setAttr(4,1); // uv
    setAttr(1,1); // normalMix

    gl.bindVertexArray(null);

    // texture bindings set by renderer
    this.albedoTex = null;
    this.normalTex = null;

    // lights
    this.lights = [];
    this.ambient = 0.25;
  }

  begin(){ this.count = 0; this.lights.length = 0; }

  push({x,y,w,h,rot=0,rgba=[1,1,1,1],uv=[0,0,1,1],normalMix=1}){
    if(this.count >= this.max) return;
    const i = this.count * this.strideFloats;
    const d = this.instanceData;
    d[i+0]=x; d[i+1]=y;
    d[i+2]=w; d[i+3]=h;
    d[i+4]=rot;
    d[i+5]=rgba[0]; d[i+6]=rgba[1]; d[i+7]=rgba[2]; d[i+8]=rgba[3];
    d[i+9]=uv[0]; d[i+10]=uv[1]; d[i+11]=uv[2]; d[i+12]=uv[3];
    d[i+13]=normalMix;
    this.count++;
  }

  addLight({x,y,r=320,color=[1,1,1],intensity=1}){
    this.lights.push({x,y,r,color,intensity});
  }

  flush({resolution, camPos, zoom}){
    const gl=this.gl;
    if(this.count===0) return;

    this.state.bindVAO(this.vao);
    this.state.useProgram(this.shader.prog);
    this.shader.use();

    gl.uniform2f(this.shader.u('uResolution'), resolution[0], resolution[1]);
    gl.uniform2f(this.shader.u('uCamPos'), camPos[0], camPos[1]);
    gl.uniform1f(this.shader.u('uZoom'), zoom);

    // textures
    gl.uniform1i(this.shader.u('uAlbedo'), 0);
    gl.uniform1i(this.shader.u('uNormal'), 1);

    // lights
    const lc = Math.min(8, this.lights.length);
    gl.uniform1i(this.shader.u('uLightCount'), lc);
    gl.uniform1f(this.shader.u('uAmbient'), this.ambient);

    if(lc>0){
      const lp = new Float32Array(8*3);
      const lcArr = new Float32Array(8*3);
      for(let i=0;i<lc;i++){
        const L=this.lights[i];
        lp[i*3+0]=L.x;
        lp[i*3+1]=L.y;
        lp[i*3+2]=L.r;
        lcArr[i*3+0]=L.color[0]*L.intensity;
        lcArr[i*3+1]=L.color[1]*L.intensity;
        lcArr[i*3+2]=L.color[2]*L.intensity;
      }
      gl.uniform3fv(this.shader.u('uLightPos[0]'), lp);
      gl.uniform3fv(this.shader.u('uLightCol[0]'), lcArr);
    }

    // upload instance buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, this.ibo);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.instanceData.subarray(0, this.count*this.strideFloats));

    this.state.setBlend('alpha');
    gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, this.count);
  }
}
