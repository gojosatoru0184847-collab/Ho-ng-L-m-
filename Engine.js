import { Time } from './Time.js';
import { Profiler } from './Profiler.js';
import { EventBus } from './EventBus.js';
import { Scheduler } from './Scheduler.js';

export class Engine {
  constructor(){
    this.time = new Time();
    this.prof = new Profiler();
    this.bus = new EventBus();
    this.scheduler = new Scheduler();
    this._lastNow = performance.now();
  }
  beginFrame(){
    const now = performance.now();
    this.time.step(now, this._lastNow);
    this._lastNow = now;
  }
}
