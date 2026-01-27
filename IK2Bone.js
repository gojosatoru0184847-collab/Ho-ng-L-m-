import { MathEx } from '../core/MathEx.js';

// Simple 2-bone IK for legs: hip->knee->foot targeting ground.
export function solve2BoneIK(hip, knee, foot, targetX, targetY){
  const x0=hip.x, y0=hip.y;
  const dx=targetX-x0, dy=targetY-y0;
  const dist=Math.hypot(dx,dy);
  const a=hip.len;
  const b=knee.len;
  const d=MathEx.clamp(dist, 0.0001, a+b-0.0001);

  // Law of cosines
  const cosK = (a*a + b*b - d*d) / (2*a*b);
  const angK = Math.acos(MathEx.clamp(cosK,-1,1));

  const cosH = (a*a + d*d - b*b) / (2*a*d);
  const angH = Math.acos(MathEx.clamp(cosH,-1,1));

  const base = Math.atan2(dy, dx);
  hip.rot = base - angH;
  knee.rot = hip.rot + (Math.PI - angK);

  // update positions
  knee.x = x0 + Math.cos(hip.rot) * a;
  knee.y = y0 + Math.sin(hip.rot) * a;

  foot.x = knee.x + Math.cos(knee.rot) * b;
  foot.y = knee.y + Math.sin(knee.rot) * b;
}
