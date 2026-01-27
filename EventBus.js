export class EventBus {
  constructor(){ this._m = new Map(); }
  on(type, fn){
    if(!this._m.has(type)) this._m.set(type, new Set());
    this._m.get(type).add(fn);
    return ()=>this.off(type, fn);
  }
  off(type, fn){ this._m.get(type)?.delete(fn); }
  emit(type, payload){
    const s = this._m.get(type);
    if(!s) return;
    for(const fn of s) fn(payload);
  }
}
