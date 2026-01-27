// Very small job scheduler (micro-task style) useful for streaming assets or chunked builds.
export class Scheduler {
  constructor(){ this.q=[]; }
  post(job){ this.q.push(job); }
  step(budgetMs=2){
    const start = performance.now();
    while(this.q.length && (performance.now()-start) < budgetMs){
      const j = this.q.shift();
      try{ j(); } catch(e){ console.error(e); }
    }
  }
}
