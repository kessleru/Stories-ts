export default class Interval {
  id;
  handler;
  start;
  timeLeft;
  constructor(handler: TimerHandler, time: number) {
    this.id = setInterval(handler, time);
    this.handler = handler
    this.start = Date.now();
    this.timeLeft = time;
  }
  clear() {
    clearInterval(this.id)
  }
  pause() {
    const passed = Date.now() - this.start;
    this.timeLeft = this.timeLeft - passed;
    this.clear();
  }
  continue() {
    this.clear();
    this.id = setInterval(this.handler, this.timeLeft);
    this.start = Date.now();
  }
}