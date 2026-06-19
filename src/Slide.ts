import Interval from './Interval';

export default class Slide {
  container: Element;
  slides: Element[];
  controls: Element;
  time: number;
  index: number = 0;
  slide: Element;
  interval: Interval | null;
  pausedTimeout: ReturnType<typeof setTimeout> | null;
  paused: boolean;
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

    this.interval = null;
    this.pausedTimeout = null;
    this.index = Number(localStorage.getItem('slide-index')) || 0;
    this.slide = this.slides[this.index];
    this.paused = false;

    this.init();
  }
  hide(slide: Element) {
    slide.classList.remove('active');
    if (slide instanceof HTMLVideoElement) {
      slide.pause();
      slide.currentTime = 0;
    }
  }
  show(index: number) {
    this.index = index;
    this.slide = this.slides[this.index];
    localStorage.setItem('slide-index', String(this.index));
    this.slides.forEach((slide) => this.hide(slide));
    this.slide.classList.add('active');
    if (this.slide instanceof HTMLVideoElement) {
      this.autoVideo(this.slide);
    } else {
      this.auto(this.time);
    }
  }
  autoVideo(video: HTMLVideoElement) {
    video.muted = true;
    video.play();
    let fistPlay = true;
    video.addEventListener('playing', () => {
      if (fistPlay) {
        fistPlay = false;
        this.auto(video.duration * 1000);
      }
    });
  }
  auto(time: number) {
    this.interval?.clear();
    this.interval = new Interval(() => this.next(), time);
  }
  prev() {
    if (this.paused) return;
    this.show((this.index - 1 + this.slides.length) % this.slides.length);
  }
  next() {
    if (this.paused) return;
    this.show((this.index + 1) % this.slides.length);
  }
  pause() {
    if (this.pausedTimeout !== null) {
      clearTimeout(this.pausedTimeout);
    }
    this.pausedTimeout = setTimeout(() => {
      this.paused = true;
      this.interval?.pause();
      if (this.slide instanceof HTMLVideoElement) {
        this.slide.pause();
      }
    }, 300);
  }
  continue() {
    if (this.pausedTimeout !== null) {
      clearTimeout(this.pausedTimeout);
      this.pausedTimeout = null;
    }
    if (this.paused) {
      this.interval?.continue();
      if (this.slide instanceof HTMLVideoElement) {
        this.slide.play();
      }
    }
    this.paused = false;
  }
  private addControls() {
    const prevButton = document.createElement('button');
    const nextButton = document.createElement('button');
    this.controls.appendChild(prevButton);
    this.controls.appendChild(nextButton);
    prevButton.innerText = 'Prev';
    nextButton.innerText = 'Next';

    this.controls.addEventListener('pointerdown', () => this.pause());
    this.controls.addEventListener('pointerup', () => this.continue());

    nextButton.addEventListener('pointerup', () => this.next());
    prevButton.addEventListener('pointerup', () => this.prev());
  }
  private init() {
    this.addControls();
    this.show(this.index);
  }
}
