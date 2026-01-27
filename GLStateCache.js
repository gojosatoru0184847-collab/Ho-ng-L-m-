// Minimizes redundant binds for 120fps stability.
export class GLStateCache {
  constructor(gl){
    this.gl = gl;
    this.program = null;
    this.vao = null;
    this.textures = new Array(16).fill(null);
    this.blend = null;
  }
  useProgram(p){ if(this.program!==p){ this.program=p; this.gl.useProgram(p); } }
  bindVAO(v){ if(this.vao!==v){ this.vao=v; this.gl.bindVertexArray(v); } }
  bindTex(unit, tex){
    if(this.textures[unit]!==tex){
      this.textures[unit]=tex;
      this.gl.activeTexture(this.gl.TEXTURE0+unit);
      this.gl.bindTexture(this.gl.TEXTURE_2D, tex);
    }
  }
  setBlend(mode){
    if(this.blend===mode) return;
    this.blend=mode;
    const gl=this.gl;
    if(mode==='alpha'){
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    } else if(mode==='add'){
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    } else {
      gl.disable(gl.BLEND);
    }
  }
}
