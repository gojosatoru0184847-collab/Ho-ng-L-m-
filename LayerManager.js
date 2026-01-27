// Z-index layering with stable sorting and batching-friendly queues.
export class LayerManager {
  constructor(){
    this.layers = new Map();
    this.sorted = [];
  }
  ensure(name, z=0, blend='alpha'){
    if(!this.layers.has(name)){
      this.layers.set(name, {name, z, blend, items: []});
      this._rebuild();
    }
    const L = this.layers.get(name);
    L.z = z;
    L.blend = blend;
    this._rebuild();
    return L;
  }
  clear(){ for(const L of this.layers.values()) L.items.length = 0; }
  push(layerName, item){
    const L = this.layers.get(layerName);
    if(!L) throw new Error('Layer not found: '+layerName);
    L.items.push(item);
  }
  _rebuild(){
    this.sorted = Array.from(this.layers.values()).sort((a,b)=>a.z-b.z);
  }
}
