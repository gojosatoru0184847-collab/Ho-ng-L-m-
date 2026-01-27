export class ShaderProgram {
  /** @param {WebGL2RenderingContext} gl */
  constructor(gl, vsSrc, fsSrc){
    this.gl = gl;
    const vs = this._compile(gl.VERTEX_SHADER, vsSrc);
    const fs = this._compile(gl.FRAGMENT_SHADER, fsSrc);
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if(!gl.getProgramParameter(prog, gl.LINK_STATUS)){
      const info = gl.getProgramInfoLog(prog);
      gl.deleteProgram(prog);
      throw new Error('Shader link failed: ' + info);
    }
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    this.prog = prog;
    this._u = new Map();
  }
  use(){ this.gl.useProgram(this.prog); }
  u(name){
    if(this._u.has(name)) return this._u.get(name);
    const loc = this.gl.getUniformLocation(this.prog, name);
    this._u.set(name, loc);
    return loc;
  }
  _compile(type, src){
    const gl = this.gl;
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if(!gl.getShaderParameter(sh, gl.COMPILE_STATUS)){
      const info = gl.getShaderInfoLog(sh);
      gl.deleteShader(sh);
      throw new Error('Shader compile failed: ' + info);
    }
    return sh;
  }
}
