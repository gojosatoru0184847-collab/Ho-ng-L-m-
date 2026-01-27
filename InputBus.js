// Multi-touch registry (3-4 fingers) + virtual sticks.
export class InputBus {
  constructor(canvas){
    this.canvas=canvas;
    this.touches=new Map(); // id -> {x,y,px,py,dx,dy,side}
    this.left = {active:false, x:0,y:0, dx:0,dy:0};
    this.right= {active:false, x:0,y:0, dx:0,dy:0};
    this.tap=false;

    const onDown=(e)=>{ this._handle(e, 'down'); };
    const onMove=(e)=>{ this._handle(e, 'move'); };
    const onUp=(e)=>{ this._handle(e, 'up'); };

    canvas.addEventListener('pointerdown', onDown, {passive:false});
    canvas.addEventListener('pointermove', onMove, {passive:false});
    canvas.addEventListener('pointerup', onUp, {passive:false});
    canvas.addEventListener('pointercancel', onUp, {passive:false});
  }
  _pos(e){
    const r=this.canvas.getBoundingClientRect();
    return { x:(e.clientX-r.left), y:(e.clientY-r.top), w:r.width, h:r.height };
  }
  _handle(e, type){
    e.preventDefault();
    const p=this._pos(e);
    const id=e.pointerId;
    if(type==='down'){
      const side = (p.x < p.w*0.5) ? 'L' : 'R';
      this.touches.set(id, {x:p.x,y:p.y,px:p.x,py:p.y,dx:0,dy:0,side});
      if(side==='L' && !this.left.active){ this.left.active=true; this.left.x=p.x; this.left.y=p.y; this.left.dx=0; this.left.dy=0; }
      if(side==='R' && !this.right.active){ this.right.active=true; this.right.x=p.x; this.right.y=p.y; this.right.dx=0; this.right.dy=0; }
      this.tap = true;
    } else if(type==='move'){
      const t=this.touches.get(id); if(!t) return;
      t.dx = p.x - t.px; t.dy = p.y - t.py;
      t.px = p.x; t.py = p.y;
      t.x = p.x; t.y = p.y;
      if(t.side==='L' && this.left.active){ this.left.dx = (t.x - this.left.x); this.left.dy = (t.y - this.left.y); }
      if(t.side==='R' && this.right.active){ this.right.dx = (t.x - this.right.x); this.right.dy = (t.y - this.right.y); }
    } else {
      const t=this.touches.get(id);
      if(t){
        if(t.side==='L'){ this.left.active=false; this.left.dx=0; this.left.dy=0; }
        if(t.side==='R'){ this.right.active=false; this.right.dx=0; this.right.dy=0; }
      }
      this.touches.delete(id);
    }
  }
  consumeTap(){ const v=this.tap; this.tap=false; return v; }
}
