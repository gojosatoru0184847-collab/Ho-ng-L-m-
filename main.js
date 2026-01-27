import { CONST } from './config/constants.js';
import { Quality } from './config/qualityPresets.js';
import { Engine } from './core/Engine.js';
import { GameLoop } from './core/GameLoop.js';
import { GLContext } from './gl/GLContext.js';
import { TextureManager } from './gl/TextureManager.js';
import { Renderer2D } from './render/Renderer2D.js';
import { Camera2D } from './render/Camera2D.js';
import { InputBus } from './core/InputBus.js';
import { ProceduralRig } from './anim/ProceduralRig.js';
import { LightSystem } from './lighting/LightSystem.js';
import { ParticleSystem } from './vfx/ParticleSystem.js';
import { ParallaxSystem } from './env/ParallaxSystem.js';
import { FoliageSystem } from './env/FoliageSystem.js';

const canvas = document.getElementById('c');
const statsEl = document.getElementById('stats');
const btnStress = document.getElementById('toggleStress');
const btn120 = document.getElementById('toggle120');

const eng = new Engine();
const glc = new GLContext(canvas);
const gl = glc.gl;

// Quality preset (auto by DPR)
let preset = Quality.MOBILE_MED;

const texman = new TextureManager(gl);
const al = TextureManager.makeHiResSprite(256);
const nm = TextureManager.makeNormalFromHeight(al);
texman.createFromCanvas('albedo', al, {mip:true});
texman.createFromCanvas('normal', nm, {mip:true});

const renderer = new Renderer2D(gl, texman, { maxInstances: CONST.MAX_INSTANCES });
const camera = new Camera2D();
const input = new InputBus(canvas);

const rig = new ProceduralRig();
const lights = new LightSystem(CONST.MAX_LIGHTS);
const particles = new ParticleSystem(CONST.MAX_PARTICLES);
const parallax = new ParallaxSystem();
const foliage = new FoliageSystem(220);

let stress = false;
let capHz = 120;

btnStress.onclick = ()=>{ stress = !stress; btnStress.textContent = `Stress: ${stress?'ON':'OFF'}`; };
btn120.onclick = ()=>{ capHz = (capHz===120?60:120); loop.setFixedHz(capHz); btn120.textContent = `Cap: ${capHz}`; };

function fit(){
  const dpr = Math.min(CONST.DPR_MAX, window.devicePixelRatio || 1);
  preset = (dpr < 1.25) ? Quality.MOBILE_LOW : (dpr < 1.75 ? Quality.MOBILE_MED : Quality.MOBILE_HIGH);
  glc.resizeToDisplay(preset.dpr);
}
window.addEventListener('resize', fit);
fit();

// world state
let playerX = 320;
let playerY = 280;
let aimX = 520;
let aimY = 220;

const loop = new GameLoop({
  targetHz: capHz,
  step:(dt)=>{
    // input move
    const mx = input.left.active ? input.left.dx : 0;
    playerX += mx * dt * 2.2;
    rig.root.x = playerX;
    rig.root.y = playerY;

    // camera follow
    camera.x = playerX - 320;
    camera.y = playerY - 240;
    camera.step(dt);

    // aim (right stick)
    if(input.right.active){
      aimX = (input.right.x + input.right.dx) * (canvas.width/canvas.clientWidth);
      aimY = (input.right.y + input.right.dy) * (canvas.height/canvas.clientHeight);
    }

    rig.step(dt, mx);
    foliage.step(dt, playerX, playerY, eng.time.t);
    particles.step(dt);

    // tap to spawn burst
    if(input.consumeTap()){
      particles.spawnBurst(playerX, 280, 120);
      camera.applyShake(0.25);
      // mobile haptics
      if(navigator.vibrate) navigator.vibrate([20, 30, 20]);
    }

    // stress mode: spawn extra particles & sprites
    if(stress){
      if(Math.random()<0.6) particles.spawnBurst(playerX + (Math.random()-0.5)*120, 260, 20);
    }
  },
  render:(alpha)=>{
    eng.beginFrame();
    const t0 = eng.prof.beginCPU();

    const size = glc.resizeToDisplay(preset.dpr);
    renderer.beginFrame();

    // background parallax
    parallax.draw(renderer, camera);

    // ground strip
    renderer.submitSprite('world', { x:600, y:348, w:1600, h:70, rgba:[0.10,0.14,0.20,1], normalMix:0.0 });

    // foliage + rig + particles
    foliage.draw(renderer);
    rig.draw(renderer);
    particles.draw(renderer);

    // add demo sprites (vector-like coins)
    const wave = Math.sin(eng.time.t*1.2)*0.5;
    for(let i=0;i<(stress?2800:260);i++){
      const x = 120 + (i%60)*28 + Math.sin(i*0.2+eng.time.t)*6;
      const y = 120 + Math.floor(i/60)*28 + Math.cos(i*0.25+eng.time.t)*6;
      renderer.submitSprite('world', { x, y, w:22, h:22, rot:wave, rgba:[0.65,0.85,1,0.55], normalMix:1.0 });
    }

    // lighting
    lights.clear();
    // player light
    lights.add(playerX, 260, 380, [0.6,0.85,1.0], 1.2);
    // aim light (torch)
    lights.add(aimX, aimY, 520, [1.0,0.85,0.55], 1.4);
    // ambient flickers
    for(let i=0;i<(stress?8:4);i++){
      const x = 120 + i*220 + Math.sin(eng.time.t*0.9 + i)*40;
      const y = 140 + Math.cos(eng.time.t*0.7 + i)*35;
      lights.add(x, y, 280, [0.75,0.55,1.0], 0.75);
    }
    lights.submit(renderer);

    renderer.render(size, camera);

    eng.prof.cpu.renderMs = eng.prof.endCPU(t0);

    statsEl.textContent = `FPS ${eng.time.fps} • Instances ${renderer.batch.count} • Particles ${particles.n} • CPU ${eng.prof.cpu.renderMs.toFixed(2)}ms`;
  }
});

loop.setFixedHz(capHz);
loop.start();
