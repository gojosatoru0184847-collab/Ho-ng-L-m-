import { Skeleton } from './Skeleton.js';
import { solve2BoneIK } from './IK2Bone.js';

export class ProceduralRig {
  constructor(){
    this.skel = new Skeleton();
    // torso root
    this.root = this.skel.addBone('root', 32, null);
    this.root.x = 300; this.root.y = 260;

    // left leg
    this.lHip = this.skel.addBone('lHip', 34, 'root');
    this.lKnee = this.skel.addBone('lKnee', 30, 'lHip');
    this.lFoot = this.skel.addBone('lFoot', 18, 'lKnee');

    // right leg
    this.rHip = this.skel.addBone('rHip', 34, 'root');
    this.rKnee = this.skel.addBone('rKnee', 30, 'rHip');
    this.rFoot = this.skel.addBone('rFoot', 18, 'rKnee');

    // offsets
    this._phase = 0;
    this.speed = 0;
  }

  step(dt, moveX){
    this.speed = Math.abs(moveX);
    this._phase += dt * (2.8 + this.speed*0.02);

    // root bob
    this.root.y += Math.sin(this._phase*2)*0.8;

    // hips spread
    this.lHip.x = this.root.x - 10;
    this.lHip.y = this.root.y + 6;
    this.rHip.x = this.root.x + 10;
    this.rHip.y = this.root.y + 6;

    // target ground with slight uneven terrain
    const ground = (x)=> 330 + Math.sin(x*0.01)*8 + Math.sin(x*0.03)*3;

    const stepAmp = 18;
    const ltx = this.root.x - 14 + Math.cos(this._phase)*stepAmp;
    const rtx = this.root.x + 14 + Math.cos(this._phase+Math.PI)*stepAmp;

    const lty = ground(ltx) - Math.max(0, Math.sin(this._phase))*10;
    const rty = ground(rtx) - Math.max(0, Math.sin(this._phase+Math.PI))*10;

    solve2BoneIK(this.lHip, this.lKnee, this.lFoot, ltx, lty);
    solve2BoneIK(this.rHip, this.rKnee, this.rFoot, rtx, rty);

    // squash & stretch torso
    this.skel.applySquashStretch('root', this._phase, 0.10);
  }

  // Emit drawable sprites (bones as capsules) for demo.
  draw(renderer){
    const bones=[this.root,this.lHip,this.lKnee,this.rHip,this.rKnee];
    for(const b of bones){
      renderer.submitSprite('world', {
        x:b.x, y:b.y,
        w:b.len*1.2*b.sx, h:16*b.sy,
        rot:b.rot,
        rgba:[1,1,1,0.95],
        normalMix:1,
      });
    }
    // feet as small circles
    const feet=[this.lFoot,this.rFoot];
    for(const f of feet){
      renderer.submitSprite('world', {
        x:f.x, y:f.y,
        w:18, h:18,
        rot:0,
        rgba:[0.8,0.95,1,0.95],
        normalMix:1,
      });
    }
  }
}
