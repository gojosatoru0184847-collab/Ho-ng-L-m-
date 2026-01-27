import { GLStateCache } from '../gl/GLStateCache.js';
import { SpriteBatch } from './SpriteBatch.js';
import { LayerManager } from './LayerManager.js';

export class Renderer2D {
  constructor(gl, textures, {maxInstances=20000}={}){
    this.gl = gl;
    this.state = new GLStateCache(gl);
    this.layers = new LayerManager();
    this.batch = new SpriteBatch(gl, this.state, maxInstances);
    this.textures = textures;

    this.layers.ensure('bg', 0, 'alpha');
    this.layers.ensure('world', 10, 'alpha');
    this.layers.ensure('vfx', 20, 'add');
    this.layers.ensure('ui', 100, 'alpha');

    gl.clearColor(0.03,0.04,0.07,1);
  }

  beginFrame(){
    this.layers.clear();
    this.batch.begin();
  }

  submitSprite(layer, sprite){ this.layers.push(layer, {type:'sprite', ...sprite}); }
  submitLight(light){ this.batch.addLight(light); }

  render({w,h}, camera){
    const gl=this.gl;
    gl.clear(gl.COLOR_BUFFER_BIT);

    // bind demo textures
    this.state.bindTex(0, this.textures.get('albedo'));
    this.state.bindTex(1, this.textures.get('normal'));

    const view = camera.viewParams();
    const res=[w,h];
    const cam=[view.x, view.y];
    const zoom=view.zoom;

    // simple pass: iterate layers, push into batch (blend not yet per-layer in this demo)
    for(const L of this.layers.sorted){
      for(const it of L.items){
        if(it.type==='sprite') this.batch.push(it);
      }
    }

    this.batch.flush({resolution:res, camPos:cam, zoom});
  }
}
