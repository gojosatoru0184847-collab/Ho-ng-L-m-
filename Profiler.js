export class Profiler {
  constructor(){
    this.cpu = { updateMs:0, renderMs:0 };
    this.gpu = { supported:false, renderMs:0 };
    this.drawCalls = 0;
    this.instances = 0;
    this.particles = 0;
  }
  beginCPU(){ return performance.now(); }
  endCPU(start){ return performance.now() - start; }
}
