export class BufferPool {
  constructor(gl){ this.gl=gl; this.free=[]; }
  alloc(){ return this.free.pop() || this.gl.createBuffer(); }
  release(buf){ if(buf) this.free.push(buf); }
}
