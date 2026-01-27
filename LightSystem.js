// Forward-light submission for SpriteBatch.
export class LightSystem {
  constructor(max=8){
    this.max=max;
    this.lights=[];
  }
  clear(){ this.lights.length=0; }
  add(x,y,r,color,intensity=1){
    if(this.lights.length>=this.max) return;
    this.lights.push({x,y,r,color,intensity});
  }
  submit(renderer){
    for(const L of this.lights) renderer.submitLight(L);
  }
}
