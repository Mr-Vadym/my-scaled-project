export default class Slider {
  constructor(selector, interval = 3000) {
    this.slides = document.querySelectorAll(`${selector} .slide`);
    this.index = 0;
    this.interval = interval;
  }

  start() {
    if (!this.slides.length) return;
    this.show(this.index);
    this.timer = setInterval(() => this.next(), this.interval);
  }

  show(i) {
    this.slides.forEach((s, idx) => s.classList.toggle("active", idx === i));
  }

  next() {
    this.index = (this.index + 1) % this.slides.length;
    this.show(this.index);
  }
}
