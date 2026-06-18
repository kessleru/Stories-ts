export default class Slide {
  container: Element;
  slides: Element[];
  controls: Element;
  time: number;
  index: number = 0;
  slide: Element;
  constructor(
    container: Element,
    slides: Element[],
    controls: Element,
    time: number = 5000
  ) {
    this.container = container;
    this.slides = slides;
    this.controls = controls;
    this.time = time;

    this.index = 0;
    this.slide = this.slides[this.index];

    this.init();
  }
  hide(slide: Element) {
    slide.classList.remove('active');
  }
  show(index: number) {
    this.index = index;
    this.slide = this.slides[this.index];
    this.slides.forEach((slide) => this.hide(slide));
    this.slide.classList.add('active');
  }
  prev() {
    this.show((this.index - 1 + this.slides.length) % this.slides.length);
    // this.index - 1 >= 0 ? this.index-- : (this.index = this.slides.length - 1);
  }
  next() {
    this.show((this.index + 1) % this.slides.length);
    // this.index + 1 < this.slides.length ? this.index++ : (this.index = 0);
  }
  private addControls() {
    const prevButton = document.createElement('button');
    const nextButton = document.createElement('button');
    this.controls.appendChild(prevButton);
    this.controls.appendChild(nextButton);

    prevButton.innerText = 'Prev';
    nextButton.innerText = 'Next';

    nextButton.addEventListener('pointerup', () => this.next());
    prevButton.addEventListener('pointerup', () => this.prev());
  }
  private init() {
    this.addControls();
    this.show(this.index);
  }
}
